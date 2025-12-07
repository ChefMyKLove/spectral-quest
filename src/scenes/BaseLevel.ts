/**
 * BASE LEVEL SCENE
 * 
 * Foundation for all 7 levels. Handles:
 * - Level setup and initialization
 * - Player (Lirien) management
 * - Mote spawning and collection
 * - Energy particle spawning
 * - Binary wrap rendering
 * - HUD display
 * - Camera following
 */

import Phaser from 'phaser';
import { Lirien } from '../entities/Lirien';
import { HarvesterDrone, HostileDrone } from '../entities/Drone';
import { Mentor } from '../entities/Mentor';
import { useGameStore } from '../store/gameStore';
import type { MoteData } from '../store/gameStore';
import { GAME, LEVELS, DIFFICULTIES } from '../config/gameConfig';
import type { LevelConfig } from '../config/gameConfig';

export class BaseLevel extends Phaser.Scene {
  // Config
  protected levelIndex: number = 0;
  protected levelConfig!: LevelConfig;
  
  // Entities
  protected player!: Lirien;
  protected moteSprites: Phaser.GameObjects.Group | null = null;
  protected energyParticles: Phaser.GameObjects.Group | null = null;
  protected clouds: Phaser.GameObjects.Group | null = null;
  protected harvesterDrones: Phaser.GameObjects.Group | null = null;
  protected hostileDrones: Phaser.GameObjects.Group | null = null;
  protected currentMentor: Mentor | null = null;
  
  // Visual elements
  protected binaryWrap!: Phaser.GameObjects.Rectangle;
  protected backgroundGradient!: Phaser.GameObjects.Graphics;
  
  // HUD elements
  protected hudContainer!: Phaser.GameObjects.Container;
  protected timerText!: Phaser.GameObjects.Text;
  protected energyBar!: Phaser.GameObjects.Graphics;
  protected livesText!: Phaser.GameObjects.Text;
  protected motesText!: Phaser.GameObjects.Text;
  protected shootingIndicator!: Phaser.GameObjects.Text;
  
  // Timers
  protected energySpawnTimer!: Phaser.Time.TimerEvent;
  protected mentorSpawnTimer!: Phaser.Time.TimerEvent;
  protected mentorAppearanceCount: number = 0;
  
  constructor(key: string, levelIndex: number) {
    super(key);
    this.levelIndex = levelIndex;
  }
  
  init(): void {
    this.levelConfig = LEVELS[this.levelIndex];
    
    // Verify level config is correct
    if (!this.levelConfig) {
      console.error(`❌ No level config found for index ${this.levelIndex}!`);
      return;
    }
    
    console.log(`[BaseLevel] Level ${this.levelIndex} initialized: ${this.levelConfig.name}`);
    console.log(`[BaseLevel] Expected motes: ${this.levelConfig.moteCount}`);
  }
  
  create(): void {
    try {
      console.log(`Creating level: ${this.levelConfig.name}`);
      
      // Reset death trigger flag
      this.binaryWrapDeathTriggered = false;
      
      // Initialize the game store for this level (this resets phase to 'playing')
      const store = useGameStore.getState();
      store.startLevel(this.levelIndex);
      
      // Verify starting energy is set correctly
      console.log(`Starting energy: ${store.energy}/${GAME.MAX_ENERGY}, isTumbling: ${store.isTumbling}`);
      
      // Ensure physics is running
      this.physics.resume();
      console.log('Store initialized');
      
      // Set world bounds (4 screens tall)
      this.physics.world.setBounds(0, 0, GAME.ARENA_WIDTH, GAME.ARENA_HEIGHT);
      console.log('Physics bounds set');
      
      // Create background
      this.createBackground();
      console.log('Background created');
      
      // Create game groups
      this.createGroups();
      console.log('Groups created');
      
      // Create binary wrap (grows from bottom)
      this.createBinaryWrap();
      console.log('Binary wrap created');
      
      // Create Maxim (evil cyborg unicorn at bottom)
      this.createMaxim();
      console.log('Maxim created');
      
      // Create Spectral Core (broken, rebuilding)
      this.createSpectralCore();
      console.log('Spectral Core created');
      
      // Create clouds
      this.createClouds();
      console.log('Clouds created');
      
      // Spawn motes
      this.spawnMotes();
      console.log('Motes spawned');
      
      // Start energy particle spawning
      this.startEnergySpawning();
      console.log('Energy spawning started');
      
      // Create player
      this.createPlayer();
      console.log('Player created');
      
      // Spawn drones
      this.spawnDrones();
      console.log('Drones spawned');
      
      // Start mentor appearances
      this.startMentorSpawning();
      console.log('Mentor spawning started');
      
      // Setup camera
      this.setupCamera();
      console.log('Camera setup');
      
      // Create HUD (fixed to camera)
      this.createHUD();
      console.log('HUD created');
      
      // Listen for player events
      this.setupEventListeners();
      console.log('Event listeners setup');
      
      // Start the game timer
      this.time.addEvent({
        delay: 1000,
        callback: this.onTimerTick,
        callbackScope: this,
        loop: true
      });
      console.log('Timer started');
      
      console.log('✅ Level create() completed successfully');
    } catch (error) {
      console.error('❌ ERROR in BaseLevel.create():', error);
      // Show error message on screen
      this.add.text(GAME.ARENA_WIDTH / 2, GAME.VIEWPORT_HEIGHT / 2, 
        `Error: ${error instanceof Error ? error.message : String(error)}`, 
        { fontSize: '20px', color: '#ff0000' }
      ).setOrigin(0.5);
    }
  }
  
  protected createBackground(): void {
    // NOTE: Full-screen animated background is now handled by CSS in index.html
    // This fills the entire browser window including black bars
    
    // Create level color gradient background
    // This fills only the arena area, so CSS animated background shows on sides
    const color = Phaser.Display.Color.ValueToColor(this.levelConfig.color);
    const graphics = this.add.graphics();
    
    // Level color gradient background - fills the entire arena
    for (let y = 0; y < GAME.ARENA_HEIGHT; y += 10) {
      const factor = 0.4 + (1 - y / GAME.ARENA_HEIGHT) * 0.3;  // Visible color gradient
      const alpha = 0.6 + (1 - y / GAME.ARENA_HEIGHT) * 0.2;   // Stronger overlay
      
      const currentColor = Phaser.Display.Color.GetColor(
        Math.min(255, color.red * factor),
        Math.min(255, color.green * factor * 0.7),
        Math.min(255, color.blue * factor * 0.7)
      );
      graphics.fillStyle(currentColor, alpha);
      graphics.fillRect(0, y, GAME.ARENA_WIDTH, 10);
    }
    
    graphics.setDepth(-99); // Above CSS background, below game elements
    this.backgroundGradient = graphics;
  }
  
  // NOTE: Full-screen animated background is now handled by CSS in index.html
  // This allows the background to fill the entire browser window including black bars
  // which Phaser cannot draw outside the canvas bounds in Scale.FIT mode
  
  /**
   * Set border image to cover the specified dimensions
   */
  private setBorderImageToCover(image: Phaser.GameObjects.Image, targetWidth: number, targetHeight: number): void {
    const texture = image.texture;
    const sourceWidth = texture.source[0].width;
    const sourceHeight = texture.source[0].height;
    
    // Calculate scale to cover the area
    const scaleX = targetWidth / sourceWidth;
    const scaleY = targetHeight / sourceHeight;
    const scale = Math.max(scaleX, scaleY); // Use larger scale to ensure full coverage
    
    image.setScale(scale);
    image.setDisplaySize(sourceWidth * scale, sourceHeight * scale);
  }
  
  /**
   * Cycle border image with cross-fade (like MainMenu)
   */
  private cycleBorderImage(border: { current: Phaser.GameObjects.Image; next: Phaser.GameObjects.Image }, newTextureKey: string, width: number, height: number): void {
    if (!this.textures.exists(newTextureKey)) return;
    
    // Update next image texture
    border.next.setTexture(newTextureKey);
    this.setBorderImageToCover(border.next, width, height);
    
    // Bring next to front
    border.next.setDepth(border.current.depth);
    border.next.setAlpha(0);
    
    // Cross-fade (4 second fade, matching main background)
    this.tweens.add({
      targets: border.current,
      alpha: 0,
      duration: 4000,
      ease: 'Sine.easeInOut'
    });
    
    this.tweens.add({
      targets: border.next,
      alpha: 0.8,
      duration: 4000,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // Swap: current becomes next, next becomes current
        const temp = border.current;
        border.current = border.next;
        border.next = temp;
        // Put the new "next" behind
        border.next.setDepth(border.current.depth - 1);
      }
    });
  }
  
  protected createGroups(): void {
    this.moteSprites = this.add.group();
    this.energyParticles = this.add.group();
    this.clouds = this.add.group();
    this.harvesterDrones = this.add.group();
    this.hostileDrones = this.add.group();
  }
  
  protected createBinaryWrap(): void {
    // Binary wrap - grows from the bottom
    this.binaryWrap = this.add.rectangle(
      GAME.ARENA_WIDTH / 2,
      GAME.ARENA_HEIGHT,
      GAME.ARENA_WIDTH,
      0,
      0x1a1a1a,
      0.9
    );
    this.binaryWrap.setOrigin(0.5, 1);
    this.binaryWrap.setDepth(100);
  }
  
  protected createMaxim(): void {
    // Maxim - evil cyborg unicorn at bottom center
    const maximX = GAME.ARENA_WIDTH / 2;
    const maximY = GAME.ARENA_HEIGHT - 60;
    
    const maximContainer = this.add.container(maximX, maximY);
    
    // Body - dark, mechanical
    const body = this.add.circle(0, 0, 25, 0x333333, 1);
    const bodyGlow = this.add.circle(0, 0, 30, 0x660000, 0.5);
    
    // Head - angular, cyborg
    const head = this.add.triangle(0, -15, 0, -25, -10, -15, 10, -15, 0x222222, 1);
    
    // Horn - red energy
    const horn = this.add.triangle(0, -25, 0, -35, -3, -28, 3, -28, 0xff0000, 1);
    const hornGlow = this.add.circle(0, -30, 5, 0xff4444, 0.8);
    
    // Mechanical parts
    const gear1 = this.add.circle(-15, 5, 8, 0x444444, 1);
    const gear2 = this.add.circle(15, 5, 8, 0x444444, 1);
    
    // Red eye
    const eye = this.add.circle(0, -18, 4, 0xff0000, 1);
    
    maximContainer.add([bodyGlow, body, head, horn, hornGlow, gear1, gear2, eye]);
    maximContainer.setDepth(101);  // Above binary wrap
    
    // Pulsing red glow
    this.tweens.add({
      targets: [hornGlow, eye],
      alpha: 0.4,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
    
    // Store reference
    (this as any).maximContainer = maximContainer;
  }
  
  protected createSpectralCore(): void {
    // Spectral Core - broken, gradually rebuilding
    // Position in lower left quadrant, adjacent to arena
    const coreX = 100;
    const coreY = GAME.ARENA_HEIGHT - 150;
    
    const coreContainer = this.add.container(coreX, coreY);
    
    // Base - broken crystal fragments
    const fragments = [
      { x: -20, y: 10, rot: 0 },
      { x: 20, y: 10, rot: 45 },
      { x: 0, y: -10, rot: -30 },
      { x: -15, y: -5, rot: 60 },
      { x: 15, y: -5, rot: -45 },
    ];
    
    fragments.forEach((frag, i) => {
      const fragment = this.add.triangle(
        frag.x, frag.y,
        0, -15, -8, 8, 8, 8,
        this.levelConfig.color,
        0.6
      );
      fragment.setRotation(Phaser.Math.DegToRad(frag.rot));
      coreContainer.add(fragment);
    });
    
    // Central core - rebuilding (grows with level progress)
    const store = useGameStore.getState();
    const rebuildProgress = (store.currentLevelIndex + 1) / 7;  // 0 to 1 across 7 levels
    
    const coreSize = 20 + (rebuildProgress * 15);
    const core = this.add.circle(0, 0, coreSize, this.levelConfig.color, 0.8);
    const coreGlow = this.add.circle(0, 0, coreSize + 5, this.levelConfig.color, 0.3);
    
    coreContainer.add([coreGlow, core]);
    coreContainer.setDepth(102);
    
    // Gentle pulse
    this.tweens.add({
      targets: [core, coreGlow],
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Store reference
    (this as any).spectralCore = coreContainer;
  }
  
  protected createClouds(): void {
    // Spawn several clouds at random positions
    const cloudCount = 8;
    
    for (let i = 0; i < cloudCount; i++) {
      const x = Phaser.Math.Between(50, GAME.ARENA_WIDTH - 50);
      const y = Phaser.Math.Between(100, GAME.ARENA_HEIGHT - 200);
      
      // Cloud is a group of overlapping ellipses
      const cloud = this.add.container(x, y);
      
      const ellipse1 = this.add.ellipse(0, 0, 120, 60, 0xffffff, 0.7);
      const ellipse2 = this.add.ellipse(-40, 10, 80, 50, 0xffffff, 0.6);
      const ellipse3 = this.add.ellipse(40, 10, 90, 50, 0xffffff, 0.6);
      
      cloud.add([ellipse1, ellipse2, ellipse3]);
      cloud.setDepth(50); // Above background, below UI
      
      // Store cloud bounds for collision detection
      (cloud as any).cloudBounds = new Phaser.Geom.Rectangle(x - 70, y - 30, 140, 60);
      
      this.clouds?.add(cloud);
    }
  }
  
  protected spawnMotes(): void {
    const store = useGameStore.getState();
    
    console.log('=== SPAWNING MOTES ===');
    console.log(`Level: ${this.levelConfig.name} (index ${this.levelIndex})`);
    console.log(`Expected mote count from config: ${this.levelConfig.moteCount}`);
    
    // Initialize motes in store
    store.initializeMotes(this.levelConfig.moteCount);
    
    // Get updated state AFTER initialization
    const updatedState = useGameStore.getState();
    const motes = updatedState.motes;
    
    console.log(`Motes array length after initialization: ${motes.length}`);
    console.log(`Expected: ${this.levelConfig.moteCount}, Actual: ${motes.length}`);
    
    if (motes.length !== this.levelConfig.moteCount) {
      console.error(`❌ MOTE COUNT MISMATCH! Expected ${this.levelConfig.moteCount}, got ${motes.length}`);
    }
    
    if (motes.length === 0) {
      console.error('❌ NO MOTES IN STORE! Check initializeMotes function.');
      return;
    }
    
    // Spawn all motes SCATTERED throughout the ENTIRE arena
    let spawnedCount = 0;
    motes.forEach((mote, index) => {
      // Random positions across entire arena, but keep them HIGH (away from wrap)
      // Spawn between Y = 200 (top area) and Y = 1800 (well above wrap start)
      const x = Phaser.Math.Between(80, GAME.ARENA_WIDTH - 80);
      const y = Phaser.Math.Between(200, 1800);  // High up in arena
      
      mote.x = x;
      mote.y = y;
      
      console.log(`Spawning mote ${index + 1}/${motes.length} (seq ${mote.sequenceNumber}) at (${x}, ${y})`);
      
      const moteSprite = this.createMoteSprite(mote, x, y);
      if (moteSprite) {
        this.moteSprites?.add(moteSprite);
        spawnedCount++;
        
        // Store reference to mote data on sprite
        (moteSprite as any).moteData = mote;
      } else {
        console.error(`❌ Failed to create sprite for mote ${index}`);
      }
    });
    
    console.log(`=== SPAWNING COMPLETE ===`);
    console.log(`Expected: ${this.levelConfig.moteCount} motes`);
    console.log(`Initialized: ${motes.length} motes`);
    console.log(`Spawned: ${spawnedCount} mote sprites`);
    console.log(`Mote sprites group size: ${this.moteSprites?.getLength() || 0}`);
    
    if (spawnedCount !== this.levelConfig.moteCount) {
      console.error(`❌ SPAWN COUNT MISMATCH! Expected ${this.levelConfig.moteCount}, spawned ${spawnedCount}`);
    }
  }
  
  protected checkMoteWrapCollision(): void {
    const store = useGameStore.getState();
    const wrapTopY = GAME.ARENA_HEIGHT * (1 - store.binaryWrapHeight);
    
    // Check each mote
    this.moteSprites?.children.each((moteSprite: any) => {
      if (!moteSprite.active || !moteSprite.moteData) return;
      
      const mote = moteSprite.moteData;
      
      // If mote is below wrap, teleport it
      if (mote.y >= wrapTopY - 50) {
        // Teleport to random high position
        const newX = Phaser.Math.Between(80, GAME.ARENA_WIDTH - 80);
        const newY = Phaser.Math.Between(200, 1500);  // High up
        
        mote.x = newX;
        mote.y = newY;
        
        // Update sprite position
        moteSprite.setPosition(newX, newY);
        
        // Visual effect - flash
        this.tweens.add({
          targets: moteSprite,
          alpha: 0.3,
          scaleX: 1.5,
          scaleY: 1.5,
          duration: 200,
          yoyo: true
        });
        
        console.log(`Mote ${mote.id} teleported to (${newX}, ${newY})`);
      }
    });
  }
  
  protected createMoteSprite(mote: MoteData, x: number, y: number): Phaser.GameObjects.Container {
    try {
      const baseColor = Phaser.Display.Color.ValueToColor(this.levelConfig.color);
      
      // Create container
      const container = this.add.container(x, y);
      
      // HUGE outer glow
      const outerGlow = this.add.circle(0, 0, 60, baseColor.color, 0.6);
      
      // Middle glow
      const middleGlow = this.add.circle(0, 0, 40, 0xffffff, 0.5);
      
      // Core
      const core = this.add.circle(0, 0, 30, baseColor.color, 1);
      
      // Center
      const center = this.add.circle(0, 0, 18, 0xffffff, 1);
      
      // Sequence number
      const sequenceText = this.add.text(0, 0, mote.sequenceNumber.toString(), {
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 2
      }).setOrigin(0.5);
      
      container.add([outerGlow, middleGlow, core, center, sequenceText]);
      container.setDepth(999);
      
      (container as any).moteId = mote.id;
      (container as any).sequenceNumber = mote.sequenceNumber;
      
      // Pulse animations
      this.tweens.add({
        targets: outerGlow,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0.3,
        duration: 600,
        yoyo: true,
        repeat: -1
      });
      
      this.tweens.add({
        targets: [core, center],
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 400,
        yoyo: true,
        repeat: -1
      });
      
      // Physics
      this.physics.add.existing(container);
      const body = container.body as Phaser.Physics.Arcade.Body;
      body.setCircle(40);
      body.setOffset(-40, -40);
      body.setImmovable(true);
      
      console.log(`✅ MOTE ${mote.id} created at (${x}, ${y})`);
      
      return container;
    } catch (error) {
      console.error(`Error creating mote ${mote.id}:`, error);
      // Return a simple fallback
      const fallback = this.add.circle(x, y, 30, 0xff0000, 1);
      fallback.setDepth(999);
      return this.add.container(x, y);
    }
  }
  
  /**
   * UNIVERSAL ENERGY SPAWNING - Used by ALL levels
   * 
   * This method is called for every level (Crimson, Amber, Yellow, Green, Blue, Indigo, Violet)
   * and uses the same energy constants from gameConfig.ts:
   * - ENERGY_FROM_PARTICLE: 30 (per particle collected)
   * - ENERGY_DRAIN_FLYING: 1.0 (per second while flying)
   * - ENERGY_DRAIN_GLIDING: 0.2 (per second while gliding)
   * - STARTING_ENERGY: 150 (full tank at start)
   * 
   * All levels have identical energy mechanics - no level-specific overrides.
   */
  protected startEnergySpawning(): void {
    // Spawn energy particles MORE FREQUENTLY (easier mode)
    this.energySpawnTimer = this.time.addEvent({
      delay: 300,  // Spawn more frequently (was 500)
      callback: () => this.spawnEnergyWithDelay(),
      callbackScope: this,
      loop: true
    });
    
    // CRITICAL: Spawn immediate energy particles near starting position (bottom of arena)
    // These are visible right away so Lirien can collect them immediately
    // UNIVERSAL FOR ALL LEVELS - same spawn logic everywhere
    const playerStartY = GAME.ARENA_HEIGHT - 100;
    const startZoneMinY = playerStartY - 400;  // 400 pixels above start (wider range)
    const startZoneMaxY = playerStartY - 20;  // 20 pixels above start (closer to player)
    
    console.log(`[${this.levelConfig.name}] Spawning 40 immediate energy particles near start position...`);
    for (let i = 0; i < 40; i++) {  // 40 particles immediately available near start - SAME FOR ALL LEVELS
      const x = Phaser.Math.Between(60, GAME.ARENA_WIDTH - 60);
      const y = Phaser.Math.Between(startZoneMinY, startZoneMaxY);
      // Spawn immediately (no delay) and make them fully visible
      this.spawnEnergyParticleAt(x, y, true);  // true = immediate visibility
    }
    
    // Initial spawn - MORE particles throughout arena, faster spawn rate
    // UNIVERSAL FOR ALL LEVELS - same spawn logic everywhere
    console.log(`[${this.levelConfig.name}] Spawning 100 energy particles throughout arena...`);
    for (let i = 0; i < 100; i++) {  // 100 particles throughout arena - SAME FOR ALL LEVELS
      const delay = i * 50;  // Faster spawn rate
      this.time.delayedCall(delay, () => {
        this.spawnEnergyParticleStaggered();
      });
    }
  }
  
  // Energy particle with its own lifecycle - doesn't sync with others
  protected spawnEnergyWithDelay(): void {
    // Random delay so they don't all spawn at same time
    const delay = Phaser.Math.Between(0, 1000);
    this.time.delayedCall(delay, () => {
      this.spawnEnergyParticleStaggered();
    });
  }
  
  protected spawnEnergyParticleStaggered(): void {
    // Spawn throughout the ENTIRE arena, not just starting area
    const minY = 100;  // Start from top of arena
    const maxY = GAME.ARENA_HEIGHT - 100;  // Bottom of arena
    
    const x = Phaser.Math.Between(60, GAME.ARENA_WIDTH - 60);
    const y = Phaser.Math.Between(minY, maxY);
    
    // Don't spawn in binary wrap
    const store = useGameStore.getState();
    const wrapY = GAME.ARENA_HEIGHT * (1 - store.binaryWrapHeight);
    if (y > wrapY - 50) {
      // Try again later
      this.time.delayedCall(1000, () => this.spawnEnergyParticleStaggered());
      return;
    }
    
    const size = Phaser.Math.Between(6, 10);
    
    // Use level color for ALL particles (same color per level)
    const levelColor = Phaser.Display.Color.ValueToColor(this.levelConfig.color);
    const particleColor = levelColor.color;
    
    // Glow - START VISIBLE (using level color)
    const glow = this.add.circle(x, y, size + 6, particleColor, 0.3);
    glow.setDepth(30);
    
    // Main particle - START VISIBLE (using level color)
    const particle = this.add.circle(x, y, size, particleColor, 0.7);
    particle.setDepth(31);
    
    // Physics
    this.physics.add.existing(particle);
    const body = particle.body as Phaser.Physics.Arcade.Body;
    body.setCircle(size + 4);
    body.setOffset(-(4), -(4));
    body.setImmovable(true);
    
    this.energyParticles?.add(particle);
    (particle as any).glowEffect = glow;
    (particle as any).spawnX = x;
    (particle as any).spawnY = y;
    
    // INDIVIDUAL lifecycle - random durations
    const fadeInTime = Phaser.Math.Between(1000, 2000);
    const holdTime = Phaser.Math.Between(4000, 8000);
    const fadeOutTime = Phaser.Math.Between(1000, 2000);
    
    // Fade IN (from current visible state to brighter)
    this.tweens.add({
      targets: particle,
      alpha: 0.9,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: fadeInTime,
      ease: 'Sine.easeIn'
    });
    
    this.tweens.add({
      targets: glow,
      alpha: 0.5,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: fadeInTime,
      ease: 'Sine.easeIn'
    });
    
    // After fade in, pulse
    this.time.delayedCall(fadeInTime, () => {
      if (!particle.active) return;
      
      this.tweens.add({
        targets: particle,
        alpha: 0.6,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 1200,
        yoyo: true,
        repeat: Math.floor(holdTime / 2400),
        ease: 'Sine.easeInOut'
      });
      
      // After hold time, fade OUT
      this.time.delayedCall(holdTime, () => {
        if (!particle.active) return;
        
        this.tweens.add({
          targets: [particle, glow],
          alpha: 0,
          scaleX: 0.5,
          scaleY: 0.5,
          duration: fadeOutTime,
          ease: 'Sine.easeOut',
          onComplete: () => {
            glow.destroy();
            particle.destroy();
            // Respawn after delay
            this.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
              this.spawnEnergyParticleStaggered();
            });
          }
        });
      });
    });
  }
  
  // When energy is collected, respawn at same location after delay
  protected respawnEnergyAt(x: number, y: number): void {
    this.time.delayedCall(Phaser.Math.Between(2000, 4000), () => {
      // Spawn new particle near the old location
      const newX = x + Phaser.Math.Between(-30, 30);
      const newY = y + Phaser.Math.Between(-30, 30);
      
      // Clamp to arena
      const clampedX = Phaser.Math.Clamp(newX, 50, GAME.ARENA_WIDTH - 50);
      const clampedY = Phaser.Math.Clamp(newY, 100, GAME.ARENA_HEIGHT - 100);
      
      this.spawnEnergyParticleAt(clampedX, clampedY);
    });
  }
  
  protected spawnEnergyParticleAt(x: number, y: number, immediate: boolean = false): void {
    const size = Phaser.Math.Between(5, 8);
    
    // Use level color
    const levelColor = Phaser.Display.Color.ValueToColor(this.levelConfig.color);
    const particleColor = levelColor.color;
    
    // If immediate, start fully visible. Otherwise fade in.
    const initialAlpha = immediate ? 0.8 : 0;
    const glowAlpha = immediate ? 0.4 : 0;
    
    const glow = this.add.circle(x, y, size + 5, particleColor, glowAlpha);
    glow.setDepth(24);
    
    const particle = this.add.circle(x, y, size, particleColor, initialAlpha);
    particle.setDepth(25);
    
    this.physics.add.existing(particle);
    const body = particle.body as Phaser.Physics.Arcade.Body;
    body.setCircle(size + 3);
    body.setOffset(-(3), -(3));
    body.setImmovable(true);
    
    this.energyParticles?.add(particle);
    (particle as any).glowEffect = glow;
    (particle as any).spawnX = x;
    (particle as any).spawnY = y;
    
    // Fade in (if not immediate)
    if (!immediate) {
      this.tweens.add({
        targets: particle,
        alpha: 0.8,
        duration: 1000
      });
      this.tweens.add({
        targets: glow,
        alpha: 0.4,
        duration: 1000
      });
    }
    
    // Set up lifecycle
    const holdTime = Phaser.Math.Between(4000, 8000);
    this.time.delayedCall((immediate ? 0 : 1000) + holdTime, () => {
      if (!particle.active) return;
      this.tweens.add({
        targets: [particle, glow],
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          glow.destroy();
          particle.destroy();
          this.respawnEnergyAt(x, y);
        }
      });
    });
  }
  
  protected spawnEnergyParticle(initialSpawn: boolean = false): void {
    const x = Phaser.Math.Between(30, GAME.ARENA_WIDTH - 30);
    const y = Phaser.Math.Between(80, GAME.ARENA_HEIGHT - 150);
    
    // Don't spawn in binary wrap area
    const store = useGameStore.getState();
    const wrapY = GAME.ARENA_HEIGHT * (1 - store.binaryWrapHeight);
    if (y > wrapY - 50) return;
    
    // Energy particles - smaller than motes but clearly visible
    const size = Phaser.Math.Between(5, 8);
    const levelColor = Phaser.Display.Color.ValueToColor(this.levelConfig.color);
    
    // Bright, slightly tinted white
    const tintAmount = 0.3;
    const r = Math.floor(255 * (1 - tintAmount) + levelColor.red * tintAmount);
    const g = Math.floor(255 * (1 - tintAmount) + levelColor.green * tintAmount);
    const b = Math.floor(255 * (1 - tintAmount) + levelColor.blue * tintAmount);
    const color = Phaser.Display.Color.GetColor(r, g, b);
    
    // Outer glow
    const glow = this.add.circle(x, y, size + 6, color, 0);
    glow.setDepth(22);
    
    // Main particle - starts invisible
    const particle = this.add.circle(x, y, size, 0xffffff, 0);
    particle.setDepth(23);
    
    // Inner bright spot
    const inner = this.add.circle(x, y, size * 0.5, 0xffffff, 0);
    inner.setDepth(24);
    
    // Physics for collision
    this.physics.add.existing(particle);
    const body = particle.body as Phaser.Physics.Arcade.Body;
    body.setCircle(size + 4);
    body.setOffset(-(size + 4 - size), -(size + 4 - size));
    body.setImmovable(true);
    
    this.energyParticles?.add(particle);
    
    // Store references for cleanup
    (particle as any).glowEffect = glow;
    (particle as any).innerEffect = inner;
    
    // Random delay for initial spawn to stagger
    const startDelay = initialSpawn ? Phaser.Math.Between(0, 4000) : 0;
    
    // SLOW pulse - fade in over 2 seconds, hold, fade out over 2 seconds
    const fadeInDuration = Phaser.Math.Between(1500, 2500);
    const holdDuration = Phaser.Math.Between(3000, 5000);
    const fadeOutDuration = Phaser.Math.Between(1500, 2500);
    
    this.time.delayedCall(startDelay, () => {
      if (!particle.active) return;
      
      // Slow fade IN
      this.tweens.add({
        targets: particle,
        alpha: { from: 0, to: 0.9 },
        duration: fadeInDuration,
        ease: 'Sine.easeInOut'
      });
      
      this.tweens.add({
        targets: glow,
        alpha: { from: 0, to: 0.4 },
        scaleX: { from: 0.8, to: 1.3 },
        scaleY: { from: 0.8, to: 1.3 },
        duration: fadeInDuration,
        ease: 'Sine.easeInOut'
      });
      
      this.tweens.add({
        targets: inner,
        alpha: { from: 0, to: 1 },
        duration: fadeInDuration * 0.8,
        ease: 'Sine.easeInOut'
      });
      
      // After fade in, do gentle pulse while visible
      this.time.delayedCall(fadeInDuration, () => {
        if (!particle.active) return;
        
        // Gentle pulse during hold
        this.tweens.add({
          targets: [particle, inner],
          scaleX: { from: 1, to: 1.15 },
          scaleY: { from: 1, to: 1.15 },
          alpha: '-=0.1',
          duration: 800,
          yoyo: true,
          repeat: Math.floor(holdDuration / 1600),
          ease: 'Sine.easeInOut'
        });
        
        this.tweens.add({
          targets: glow,
          scaleX: { from: 1.3, to: 1.6 },
          scaleY: { from: 1.3, to: 1.6 },
          alpha: { from: 0.4, to: 0.2 },
          duration: 800,
          yoyo: true,
          repeat: Math.floor(holdDuration / 1600),
          ease: 'Sine.easeInOut'
        });
        
        // After hold, fade OUT
        this.time.delayedCall(holdDuration, () => {
          if (!particle.active) return;
          
          this.tweens.add({
            targets: [particle, inner],
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: fadeOutDuration,
            ease: 'Sine.easeInOut',
            onComplete: () => {
              inner.destroy();
              particle.destroy();
            }
          });
          
          this.tweens.add({
            targets: glow,
            alpha: 0,
            scaleX: 0.3,
            scaleY: 0.3,
            duration: fadeOutDuration,
            ease: 'Sine.easeInOut',
            onComplete: () => glow.destroy()
          });
        });
      });
    });
  }
  
  protected createPlayer(): void {
    // Start at bottom center of arena
    const startX = GAME.ARENA_WIDTH / 2;
    const startY = GAME.ARENA_HEIGHT - 100;
    
    this.player = new Lirien(this, startX, startY);
    this.player.setDepth(60);
    
    // Setup collisions
    this.setupCollisions();
  }
  
  protected spawnDrones(): void {
    // Spawn initial harvester drones from bottom (Maxim launches them)
    const initialHarvesterCount = 3;
    
    for (let i = 0; i < initialHarvesterCount; i++) {
      this.spawnHarvesterFromBottom(i * 500);  // Stagger launches
    }
    
    // Continuous harvester drone spawning from Maxim
    this.time.addEvent({
      delay: 8000,  // Launch new drone every 8 seconds
      callback: () => {
        if (this.harvesterDrones && this.harvesterDrones.getLength() < 5) {
          this.spawnHarvesterFromBottom(0);
        }
      },
      callbackScope: this,
      loop: true
    });
    
    // Spawn initial hostile drones (aggressive, chase player)
    const hostileCount = 1 + Math.floor(this.levelIndex / 2);  // More in later levels
    
    for (let i = 0; i < hostileCount; i++) {
      const x = Phaser.Math.Between(100, GAME.ARENA_WIDTH - 100);
      const y = Phaser.Math.Between(300, GAME.ARENA_HEIGHT / 2);
      
      const hostile = new HostileDrone(this, x, y);
      hostile.setTarget(this.player);
      this.hostileDrones?.add(hostile);
    }
    
    // Continuous hostile drone respawning
    this.time.addEvent({
      delay: 12000,  // Respawn hostile drone every 12 seconds
      callback: () => {
        const store = useGameStore.getState();
        if (store.phase !== 'playing') return;  // Don't spawn if game paused/over
        
        // Check current hostile drone count
        const currentCount = this.hostileDrones?.getLength() || 0;
        const targetCount = hostileCount;
        
        if (currentCount < targetCount) {
          // Spawn a new hostile drone
          const x = Phaser.Math.Between(100, GAME.ARENA_WIDTH - 100);
          const y = Phaser.Math.Between(300, GAME.ARENA_HEIGHT / 2);
          
          const hostile = new HostileDrone(this, x, y);
          hostile.setTarget(this.player);
          this.hostileDrones?.add(hostile);
          
          console.log(`[BaseLevel] Respawned hostile drone (${currentCount + 1}/${targetCount})`);
        }
      },
      callbackScope: this,
      loop: true
    });
  }
  
  protected spawnHarvesterFromBottom(delay: number = 0): void {
    this.time.delayedCall(delay, () => {
      // Launch from bottom center (Maxim's position)
      const x = GAME.ARENA_WIDTH / 2;
      const y = GAME.ARENA_HEIGHT - 80;
      
      const harvester = new HarvesterDrone(this, x, y);
      this.harvesterDrones?.add(harvester);
      
      // Launch animation
      this.tweens.add({
        targets: harvester,
        y: GAME.ARENA_HEIGHT - 200,
        duration: 800,
        ease: 'Quad.easeOut'
      });
    });
  }
  
  protected startMentorSpawning(): void {
    // Mentor appears multiple times per level
    const appearanceDelay = (this.levelConfig.baseTime * 1000) / (this.levelConfig.mentorAppearances + 1);
    
    this.mentorSpawnTimer = this.time.addEvent({
      delay: appearanceDelay,
      callback: this.spawnMentor,
      callbackScope: this,
      repeat: this.levelConfig.mentorAppearances - 1
    });
  }
  
  protected spawnMentor(): void {
    // Don't spawn if we've hit the max appearances
    if (this.mentorAppearanceCount >= this.levelConfig.mentorAppearances) return;
    
    // Don't spawn if one is already active
    if (this.currentMentor && this.currentMentor.active) return;
    
    this.mentorAppearanceCount++;
    
    // Spawn at random position (visible on screen, in safe zone)
    const store = useGameStore.getState();
    const cameraY = this.cameras.main.scrollY;
    const safeY = GAME.ARENA_HEIGHT * (1 - store.binaryWrapHeight) - 150;
    
    const x = Phaser.Math.Between(100, GAME.ARENA_WIDTH - 100);
    const y = Phaser.Math.Between(
      Math.max(100, cameraY + 100),
      Math.min(safeY, cameraY + GAME.VIEWPORT_HEIGHT - 100)
    );
    
    this.currentMentor = new Mentor(this, x, y, this.levelIndex);
    
    // Setup collision with player
    this.physics.add.overlap(
      this.player,
      this.currentMentor,
      this.onMentorCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
  }
  
  protected onMentorCollision(player: any, mentor: any): void {
    if (mentor instanceof Mentor) {
      mentor.onTouched();
    }
  }
  
  protected setupCollisions(): void {
    // Player vs Motes
    if (this.moteSprites) {
      this.physics.add.overlap(
        this.player,
        this.moteSprites,
        this.onMoteCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        this
      );
    }
    
    // Player vs Energy Particles
    if (this.energyParticles) {
      this.physics.add.overlap(
        this.player,
        this.energyParticles,
        this.onEnergyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        this
      );
    }
    
    // Player vs Hostile Drones
    if (this.hostileDrones) {
      this.physics.add.overlap(
        this.player,
        this.hostileDrones,
        this.onHostileDroneCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        this
      );
    }
    
    // Player vs Harvester Drones (both drop energy on collision)
    if (this.harvesterDrones) {
      this.physics.add.overlap(
        this.player,
        this.harvesterDrones,
        this.onHarvesterDroneCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        this
      );
    }
    
    // Player projectiles vs Drones (set up in onPlayerShoot)
  }
  
  protected onHarvesterDroneCollision(player: any, drone: any): void {
    if (drone instanceof HarvesterDrone) {
      // Both drop energy
      drone.onCollideWithLirien();
      
      // Player also loses some energy
      const store = useGameStore.getState();
      store.drainEnergy(5, 'flying');  // Small energy loss
    }
  }
  
  protected onHostileDroneCollision(player: any, drone: any): void {
    if (drone instanceof HostileDrone) {
      const didAttack = drone.onHitPlayer();
      
      if (didAttack) {
        // Visual feedback - player got hit
        this.cameras.main.shake(200, 0.01);
        this.player.setTint(0xff0000);
        this.time.delayedCall(200, () => {
          this.player.clearTint();
        });
      }
    }
  }
  
  protected onMoteCollision(player: any, moteContainer: any): void {
    const moteId = moteContainer.moteId;
    if (moteId === undefined) return;
    
    const store = useGameStore.getState();
    const mote = store.motes.find(m => m.id === moteId);
    
    if (mote && !mote.collected) {
      // Collect the mote first
      store.collectMote(moteId);
      
      // Get updated state AFTER collection
      const updatedStore = useGameStore.getState();
      
      // Visual feedback
      this.tweens.add({
        targets: moteContainer,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          moteContainer.destroy();
        }
      });
      
      // Sound effect would go here
      
      // Check for level complete (only if still playing)
      console.log(`Mote collected: ${updatedStore.motesCollected}/${this.levelConfig.moteCount}, phase: ${updatedStore.phase}`);
      
      // Use updated store state for the check - call immediately
      if (updatedStore.phase === 'playing' && updatedStore.motesCollected >= this.levelConfig.moteCount) {
        console.log(`✅ Level complete! Collected ${updatedStore.motesCollected}/${this.levelConfig.moteCount} motes`);
        // Pause game immediately
        updatedStore.setPhase('paused');
        this.physics.pause();
        // Complete level
        this.onLevelComplete();
      }
    }
  }
  
  /**
   * UNIVERSAL ENERGY COLLECTION - Used by ALL levels
   * 
   * All levels use GAME.ENERGY_FROM_PARTICLE (30 energy per particle)
   * No level-specific overrides - consistent across all 7 levels.
   */
  protected onEnergyCollision(player: any, particle: any): void {
    // Universal energy gain - same for all levels
    this.player.collectEnergy(GAME.ENERGY_FROM_PARTICLE);
    
    // Get spawn location for respawn
    const spawnX = (particle as any).spawnX || particle.x;
    const spawnY = (particle as any).spawnY || particle.y;
    
    // Clean up glow effect if it exists
    const glow = (particle as any).glowEffect;
    
    if (glow && glow.active) {
      this.tweens.killTweensOf(glow);
      glow.destroy();
    }
    
    // Kill any tweens on the particle itself
    this.tweens.killTweensOf(particle);
    
    // Visual feedback - sparkle on collection
    const px = particle.x;
    const py = particle.y;
    
    particle.destroy();
    
    // Spawn a quick "collected" sparkle burst
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const sparkle = this.add.circle(px, py, 4, 0xffffff, 1);
      sparkle.setDepth(100);
      this.tweens.add({
        targets: sparkle,
        x: px + Math.cos(angle) * 25,
        y: py + Math.sin(angle) * 25,
        scaleX: 0.3,
        scaleY: 0.3,
        alpha: 0,
        duration: 250,
        onComplete: () => sparkle.destroy()
      });
    }
    
    // RESPAWN energy at that location after delay
    this.respawnEnergyAt(spawnX, spawnY);
  }
  
  protected setupCamera(): void {
    // Camera follows player, bounded to arena
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, GAME.ARENA_WIDTH, GAME.ARENA_HEIGHT);
    this.cameras.main.setDeadzone(100, 200);
    
    // Start camera at bottom (showing wrap just starting)
    this.cameras.main.setScroll(0, GAME.ARENA_HEIGHT - GAME.VIEWPORT_HEIGHT);
  }
  
  protected createHUD(): void {
    // Create fixed HUD container
    this.hudContainer = this.add.container(0, 0);
    this.hudContainer.setScrollFactor(0);
    this.hudContainer.setDepth(1000);
    
    // Background bar
    const hudBg = this.add.rectangle(0, 0, GAME.ARENA_WIDTH, 50, 0x000000, 0.7);
    hudBg.setOrigin(0, 0);
    
    // Timer
    this.timerText = this.add.text(GAME.ARENA_WIDTH / 2, 25, '2:00', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Lives
    this.livesText = this.add.text(20, 25, '❤️❤️❤️', {
      fontSize: '20px'
    }).setOrigin(0, 0.5);
    
    // Motes counter
    this.motesText = this.add.text(GAME.ARENA_WIDTH - 20, 15, `Motes: 0/${this.levelConfig.moteCount}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(1, 0);
    
    // Energy bar background
    const energyBg = this.add.rectangle(GAME.ARENA_WIDTH - 20, 35, 150, 12, 0x333333);
    energyBg.setOrigin(1, 0.5);
    
    // Energy bar fill
    this.energyBar = this.add.graphics();
    
    // Level name
    const levelName = this.add.text(20, 40, this.levelConfig.name, {
      fontSize: '12px',
      color: this.levelConfig.color
    }).setOrigin(0, 0.5);
    
    // Shooting indicator
    this.shootingIndicator = this.add.text(GAME.ARENA_WIDTH / 2, 40, `🔫 Collect ${this.levelConfig.motesToUnlockShooting} mote(s) to shoot`, {
      fontSize: '11px',
      color: '#888888'
    }).setOrigin(0.5, 0.5);
    
    this.hudContainer.add([hudBg, this.timerText, this.livesText, this.motesText, energyBg, this.energyBar, levelName, this.shootingIndicator]);
  }
  
  protected setupEventListeners(): void {
    // Listen for player shooting
    this.events.on('playerShoot', this.onPlayerShoot, this);
    
    // Listen for mote ejection (Q key)
    this.events.on('moteEjected', this.onMoteEjected, this);
    
    // Listen for motes dropped by drones
    this.events.on('droneDroppedMotes', this.onDroneDroppedMotes, this);
    
    // Listen for player crash
    this.events.on('playerCrash', this.onPlayerCrash, this);
  }
  
  protected onPlayerCrash(data: { canContinue: boolean }): void {
    const store = useGameStore.getState();
    
    // Prevent multiple calls
    if (store.phase !== 'playing') {
      console.log('Already handling death, ignoring duplicate crash call');
      return;
    }
    
    // Pause everything immediately
    store.setPhase('paused');
    this.physics.pause();
    
    if (data.canContinue) {
      // Still have lives - show death modal
      console.log(`Lives remaining: ${store.lives}, showing death modal`);
      this.binaryWrapDeathTriggered = false;
      this.showDeathModal('crash');
    } else {
      // No lives left - generate card and go to game over
      console.log('No lives remaining, game over');
      const stats = store.completeLevel('lose', 'crash');
      this.scene.start('GameOverScene');
    }
  }
  
  protected onMoteEjected(data: { moteId: number; x: number; y: number }): void {
    const store = useGameStore.getState();
    const mote = store.motes.find(m => m.id === data.moteId);
    
    if (!mote) {
      console.error(`[BaseLevel] onMoteEjected: Mote ${data.moteId} not found in store`);
      return;
    }
    
    // Verify mote was actually dropped (not collected)
    if (mote.collected) {
      console.warn(`[BaseLevel] onMoteEjected: Mote ${data.moteId} is still marked as collected. This shouldn't happen.`);
      // Force reset it anyway
      mote.collected = false;
      mote.collectedAt = 0;
    }
    
    // Update mote position in store
    mote.x = data.x;
    mote.y = data.y;
    
    console.log(`[BaseLevel] Ejecting mote ${data.moteId} (seq ${mote.sequenceNumber}) at (${data.x}, ${data.y})`);
    
    // Check if sprite exists (it might have been destroyed when collected)
    let moteSprite: any = null;
    this.moteSprites?.children.each((sprite: any) => {
      if (sprite.moteId === data.moteId) {
        moteSprite = sprite;
        return false; // Stop iteration
      }
    });
    
    if (!moteSprite) {
      // Sprite was destroyed when collected - recreate it
      console.log(`[BaseLevel] Recreating sprite for ejected mote ${data.moteId}`);
      moteSprite = this.createMoteSprite(mote, data.x, data.y);
      if (moteSprite) {
        this.moteSprites?.add(moteSprite);
        (moteSprite as any).moteData = mote;
      } else {
        console.error(`[BaseLevel] Failed to recreate sprite for ejected mote ${data.moteId}`);
        return;
      }
    } else {
      // Sprite exists - just move and show it
      moteSprite.setPosition(data.x, data.y);
      moteSprite.setVisible(true);
      moteSprite.setActive(true);
    }
    
    // Visual effect - mote reappears with sparkle
    moteSprite.setAlpha(0);
    moteSprite.setScale(0.5);
    
    this.tweens.add({
      targets: moteSprite,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });
    
    // Sparkle effect
    for (let i = 0; i < 5; i++) {
      const sparkleAngle = (i / 5) * Math.PI * 2;
      const sparkle = this.add.circle(
        data.x + Math.cos(sparkleAngle) * 20,
        data.y + Math.sin(sparkleAngle) * 20,
        3,
        0xffffff,
        1
      );
      sparkle.setDepth(1000);
      this.tweens.add({
        targets: sparkle,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 500,
        onComplete: () => sparkle.destroy()
      });
    }
    
    console.log(`[BaseLevel] ✅ Mote ${data.moteId} ejected and respawned at (${data.x}, ${data.y})`);
    
    // Validate state after ejection
    this.validateMoteState();
  }

  /**
   * Handle motes dropped by drones (when drone is destroyed or steals motes)
   */
  protected onDroneDroppedMotes(data: { x: number; y: number; count: number; moteIds?: number[] }): void {
    const store = useGameStore.getState();
    
    // Get motes that were just dropped using the specific IDs
    let droppedMotes: typeof store.motes = [];
    
    if (data.moteIds && data.moteIds.length > 0) {
      // Use specific mote IDs if provided
      droppedMotes = store.motes.filter(m => data.moteIds!.includes(m.id) && !m.collected);
    } else {
      // Fallback: find uncollected motes (shouldn't happen if IDs are provided)
      droppedMotes = store.motes.filter(m => !m.collected);
    }
    
    if (droppedMotes.length === 0) {
      console.warn('[BaseLevel] No dropped motes to respawn');
      return;
    }
    
    // Respawn the dropped motes (up to count)
    const motesToRespawn = droppedMotes.slice(0, data.count);
    
    console.log(`[BaseLevel] Attempting to respawn ${motesToRespawn.length} motes at (${data.x}, ${data.y})`);
    
    let respawnedCount = 0;
    
    motesToRespawn.forEach((mote, index) => {
      // Calculate spawn position (scatter around drop location)
      const angle = (index / motesToRespawn.length) * Math.PI * 2;
      const distance = 30 + (index * 10);
      const spawnX = data.x + Math.cos(angle) * distance;
      const spawnY = data.y + Math.sin(angle) * distance;
      
      // Clamp to arena bounds
      const clampedX = Phaser.Math.Clamp(spawnX, 50, GAME.ARENA_WIDTH - 50);
      const clampedY = Phaser.Math.Clamp(spawnY, 100, GAME.ARENA_HEIGHT - 200);
      
      // Update mote position in store
      mote.x = clampedX;
      mote.y = clampedY;
      
      // Check if sprite exists (it might have been destroyed when collected)
      let moteSprite: any = null;
      this.moteSprites?.children.each((sprite: any) => {
        if (sprite.moteId === mote.id) {
          moteSprite = sprite;
          return false; // Stop iteration
        }
      });
      
      if (!moteSprite) {
        // Sprite was destroyed when collected - recreate it
        console.log(`[BaseLevel] Recreating sprite for mote ${mote.id}`);
        moteSprite = this.createMoteSprite(mote, clampedX, clampedY);
        if (moteSprite) {
          this.moteSprites?.add(moteSprite);
          (moteSprite as any).moteData = mote;
        } else {
          console.error(`[BaseLevel] Failed to recreate sprite for mote ${mote.id}`);
          return;
        }
      } else {
        // Sprite exists - just move and show it
        moteSprite.setPosition(clampedX, clampedY);
        moteSprite.setVisible(true);
        moteSprite.setActive(true);
      }
      
      // Visual effect - mote reappears with sparkle
      moteSprite.setAlpha(0);
      moteSprite.setScale(0.5);
      
      this.tweens.add({
        targets: moteSprite,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 400,
        ease: 'Back.easeOut'
      });
      
      // Sparkle effect
      for (let i = 0; i < 5; i++) {
        const sparkleAngle = (i / 5) * Math.PI * 2;
        const sparkle = this.add.circle(
          clampedX + Math.cos(sparkleAngle) * 20,
          clampedY + Math.sin(sparkleAngle) * 20,
          3,
          0xffffff,
          1
        );
        sparkle.setDepth(1000);
        this.tweens.add({
          targets: sparkle,
          alpha: 0,
          scaleX: 0.3,
          scaleY: 0.3,
          duration: 500,
          onComplete: () => sparkle.destroy()
        });
      }
      
      respawnedCount++;
    });
    
    console.log(`[BaseLevel] ✅ Respawned ${respawnedCount} motes at (${data.x}, ${data.y})`);
    
    // Validate state after respawn
    this.validateMoteState();
  }
  
  /**
   * Validate mote state consistency between store and sprites
   * Useful for debugging mote tracking issues
   */
  protected validateMoteState(): void {
    const store = useGameStore.getState();
    const storeMotes = store.motes;
    const spriteMotes = new Map<number, any>();
    
    // Collect all sprite motes
    this.moteSprites?.children.each((sprite: any) => {
      if (sprite.moteId !== undefined) {
        spriteMotes.set(sprite.moteId, sprite);
      }
    });
    
    console.log(`[BaseLevel] === MOTE STATE VALIDATION ===`);
    console.log(`Store: ${storeMotes.length} total motes, ${store.motesCollected} collected`);
    console.log(`Sprites: ${spriteMotes.size} mote sprites`);
    
    // Check for missing sprites (motes that should have sprites but don't)
    const missingSprites: number[] = [];
    storeMotes.forEach(mote => {
      if (!mote.collected && !spriteMotes.has(mote.id)) {
        missingSprites.push(mote.id);
      }
    });
    
    if (missingSprites.length > 0) {
      console.warn(`[BaseLevel] ⚠️ Missing sprites for uncollected motes: [${missingSprites.join(', ')}]`);
    }
    
    // Check for orphaned sprites (sprites without store entries)
    const orphanedSprites: number[] = [];
    spriteMotes.forEach((sprite, moteId) => {
      const storeMote = storeMotes.find(m => m.id === moteId);
      if (!storeMote) {
        orphanedSprites.push(moteId);
      }
    });
    
    if (orphanedSprites.length > 0) {
      console.warn(`[BaseLevel] ⚠️ Orphaned sprites (no store entry): [${orphanedSprites.join(', ')}]`);
    }
    
    // Check for collected motes that still have sprites
    const collectedWithSprites: number[] = [];
    storeMotes.forEach(mote => {
      if (mote.collected && spriteMotes.has(mote.id)) {
        collectedWithSprites.push(mote.id);
      }
    });
    
    if (collectedWithSprites.length > 0) {
      console.warn(`[BaseLevel] ⚠️ Collected motes that still have sprites: [${collectedWithSprites.join(', ')}]`);
    }
    
    // Count consistency check
    const uncollectedCount = storeMotes.filter(m => !m.collected).length;
    const visibleSpriteCount = Array.from(spriteMotes.values()).filter((s: any) => s.active && s.visible).length;
    
    if (uncollectedCount !== visibleSpriteCount) {
      console.warn(`[BaseLevel] ⚠️ Count mismatch: ${uncollectedCount} uncollected in store vs ${visibleSpriteCount} visible sprites`);
    } else {
      console.log(`[BaseLevel] ✅ Mote counts match: ${uncollectedCount} uncollected motes`);
    }
    
    console.log(`[BaseLevel] === END VALIDATION ===`);
  }
  
  protected onPlayerShoot(data: { x: number; y: number; angle: number; speed: number }): void {
    // Create projectile
    const projectile = this.add.circle(data.x, data.y, 5, 0xffffff);
    this.physics.add.existing(projectile);
    
    const body = projectile.body as Phaser.Physics.Arcade.Body;
    const vx = Math.cos(data.angle) * data.speed;
    const vy = Math.sin(data.angle) * data.speed;
    body.setVelocity(vx, vy);
    body.setCircle(5);
    
    // Projectile vs Harvester Drones
    if (this.harvesterDrones) {
      this.physics.add.overlap(
        projectile,
        this.harvesterDrones,
        (proj: any, drone: any) => {
          if (drone instanceof HarvesterDrone) {
            drone.takeDamage();
            useGameStore.getState().registerHit();
            proj.destroy();
          }
        }
      );
    }
    
    // Projectile vs Hostile Drones
    if (this.hostileDrones) {
      this.physics.add.overlap(
        projectile,
        this.hostileDrones,
        (proj: any, drone: any) => {
          if (drone instanceof HostileDrone) {
            drone.takeDamage();
            useGameStore.getState().registerHit();
            proj.destroy();
          }
        }
      );
    }
    
    // Rainbow trail
    const colors = [0xff0000, 0xff8000, 0xffff00, 0x00ff00, 0x0080ff, 0x8000ff];
    let colorIndex = 0;
    
    const trailTimer = this.time.addEvent({
      delay: 50,
      callback: () => {
        if (!projectile.active) return;
        const trail = this.add.circle(projectile.x, projectile.y, 3, colors[colorIndex % colors.length], 0.8);
        colorIndex++;
        this.tweens.add({
          targets: trail,
          alpha: 0,
          scaleX: 0.5,
          scaleY: 0.5,
          duration: 300,
          onComplete: () => trail.destroy()
        });
      },
      loop: true
    });
    
    // Destroy after 2 seconds
    this.time.delayedCall(2000, () => {
      trailTimer.destroy();
      projectile.destroy();
    });
  }
  
  protected onTimerTick(): void {
    const store = useGameStore.getState();
    store.tick(1);
    
    // Check for time out
    if (store.timeRemaining <= 0) {
      this.onTimeOut();
    }
  }
  
  protected onTimeOut(): void {
    // Time ran out - binary wrap consumed Lirien
    const store = useGameStore.getState();
    const canContinue = store.loseLife('time_out');
    
    if (canContinue) {
      // Restart level
      this.scene.restart();
    } else {
      // Game over
      this.scene.start('GameOverScene');
    }
  }
  
  protected onLevelComplete(): void {
    const store = useGameStore.getState();
    const stats = store.completeLevel('win');
    
    // Transition to card generation/level complete scene
    this.scene.start('LevelCompleteScene', { stats });
  }
  
  update(time: number, delta: number): void {
    const store = useGameStore.getState();
    
    // Don't update if paused or game over
    if (store.phase !== 'playing') return;
    
    // Update player
    if (this.player) {
      this.player.update(time, delta);
    }
    
    // Update drones
    this.harvesterDrones?.getChildren().forEach((drone: any) => {
      if (drone.update) drone.update(time, delta);
    });
    
    this.hostileDrones?.getChildren().forEach((drone: any) => {
      if (drone.update) drone.update(time, delta);
    });
    
    // Update mentor
    if (this.currentMentor && this.currentMentor.active) {
      this.currentMentor.update(time, delta);
    }
    
    // Update HUD
    this.updateHUD();
    
    // Update binary wrap visual
    this.updateBinaryWrap();
    
    // Check cloud collisions (for energy regen)
    this.checkCloudCollisions();
    
    // Check if player touched binary wrap
    this.checkBinaryWrapCollision();
    
    // Check if motes need to teleport (wrap reached them)
    this.checkMoteWrapCollision();
  }
  
  private binaryWrapDeathTriggered: boolean = false;
  
  protected checkBinaryWrapCollision(): void {
    const store = useGameStore.getState();
    
    // Prevent multiple triggers
    if (this.binaryWrapDeathTriggered || store.phase !== 'playing') return;
    
    // Don't check if player doesn't exist
    if (!this.player || !this.player.active) return;
    
    // Grace period - don't kill player in first 3 seconds (reduced from 5)
    const timePlayed = (this.levelConfig.baseTime - store.timeRemaining);
    if (timePlayed < 3) return;
    
    // Also need minimum wrap height before it can kill (5% - reduced from 10%)
    if (store.binaryWrapHeight < 0.05) return;
    
    const wrapTopY = GAME.ARENA_HEIGHT * (1 - store.binaryWrapHeight);
    
    // If player is below the top of the binary wrap, they're consumed
    // Use a more generous collision area
    if (this.player.y >= wrapTopY - 30) {
      this.binaryWrapDeathTriggered = true;
      console.log(`Binary wrap collision! Player Y: ${this.player.y}, Wrap Top Y: ${wrapTopY}, Wrap Height: ${store.binaryWrapHeight}`);
      this.onPlayerConsumedByWrap();
    }
  }
  
  protected onPlayerConsumedByWrap(): void {
    const store = useGameStore.getState();
    
    // Prevent multiple calls
    if (store.phase !== 'playing') {
      console.log('Already handling death, ignoring duplicate wrap call');
      return;
    }
    
    console.log('onPlayerConsumedByWrap called, pausing game...');
    
    // Pause everything immediately - stop all updates
    store.setPhase('paused');
    this.physics.pause();
    
    // Stop timer updates immediately
    this.time.removeAllEvents();
    
    // Check if player has lives remaining
    const canContinue = store.loseLife('time_out');
    
    if (canContinue) {
      // Still have lives - show death modal
      console.log(`Lives remaining: ${store.lives}, showing death modal`);
      this.binaryWrapDeathTriggered = false;
      this.showDeathModal('time_out');
    } else {
      // GAME OVER - no lives left
      console.log('No lives remaining, game over');
      const stats = store.completeLevel('lose', 'time_out');
      this.scene.start('GameOverScene');
    }
  }
  
  protected showDeathModal(deathType: 'crash' | 'time_out'): void {
    const centerX = GAME.ARENA_WIDTH / 2;
    const centerY = GAME.VIEWPORT_HEIGHT / 2;
    const store = useGameStore.getState();
    
    // Death message based on type
    let deathMessage = '';
    if (deathType === 'time_out') {
      deathMessage = 'You were struck down by the binary wrap';
    } else {
      deathMessage = 'You crashed into the binary wrap';
    }
    
    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
    overlay.setScrollFactor(0);
    overlay.setDepth(3000);
    
    // Modal container - rounded, bubbly
    const modalBg = this.add.graphics();
    modalBg.fillStyle(0x000000, 0.9);
    modalBg.fillRoundedRect(centerX - 280, centerY - 120, 560, 240, 25);
    modalBg.lineStyle(4, Phaser.Display.Color.ValueToColor(this.levelConfig.color).color, 0.8);
    modalBg.strokeRoundedRect(centerX - 280, centerY - 120, 560, 240, 25);
    modalBg.setScrollFactor(0);
    modalBg.setDepth(3001);
    
    // Death message
    const messageText = this.add.text(centerX, centerY - 60, deathMessage, {
      fontSize: '24px',
      color: '#ff4444',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 500 }
    });
    messageText.setOrigin(0.5);
    messageText.setScrollFactor(0);
    messageText.setDepth(3002);
    
    // Lives remaining
    const livesText = this.add.text(centerX, centerY - 20, `Lives Remaining: ${'❤️'.repeat(store.lives)}`, {
      fontSize: '20px',
      color: '#ffffff'
    });
    livesText.setOrigin(0.5);
    livesText.setScrollFactor(0);
    livesText.setDepth(3002);
    
    // START button
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(Phaser.Display.Color.ValueToColor(this.levelConfig.color).color, 1);
    buttonBg.fillRoundedRect(centerX - 100, centerY + 40, 200, 50, 25);
    buttonBg.setScrollFactor(0);
    buttonBg.setDepth(3002);
    
    const startButton = this.add.text(centerX, centerY + 65, 'START', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontStyle: 'bold'
    });
    startButton.setOrigin(0.5);
    startButton.setScrollFactor(0);
    startButton.setDepth(3003);
    
    // Button hit area
    const hitArea = this.add.rectangle(centerX, centerY + 65, 200, 50, 0x000000, 0);
    hitArea.setScrollFactor(0);
    hitArea.setDepth(3004);
    hitArea.setInteractive({ useHandCursor: true });
    
    // Button hover effect
    hitArea.on('pointerover', () => {
      this.tweens.add({ targets: [buttonBg, startButton], scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    
    hitArea.on('pointerout', () => {
      this.tweens.add({ targets: [buttonBg, startButton], scaleX: 1, scaleY: 1, duration: 100 });
    });
    
    // Start button click
    hitArea.on('pointerdown', () => {
      // Clean up modal
      overlay.destroy();
      modalBg.destroy();
      messageText.destroy();
      livesText.destroy();
      buttonBg.destroy();
      startButton.destroy();
      hitArea.destroy();
      
      // Restart level
      this.scene.restart();
    });
  }
  
  protected showDeathScreen(stats: any): void {
    // Pause physics
    this.physics.pause();
    
    // Dark overlay
    const overlay = this.add.rectangle(
      this.cameras.main.scrollX + GAME.ARENA_WIDTH / 2,
      this.cameras.main.scrollY + GAME.VIEWPORT_HEIGHT / 2,
      GAME.ARENA_WIDTH,
      GAME.VIEWPORT_HEIGHT,
      0x000000,
      0.8
    );
    overlay.setDepth(1000);
    
    // Death message
    const deathText = this.add.text(
      this.cameras.main.scrollX + GAME.ARENA_WIDTH / 2,
      this.cameras.main.scrollY + GAME.VIEWPORT_HEIGHT / 2 - 50,
      '💀 CONSUMED BY BINARY WRAP 💀',
      {
        fontSize: '24px',
        color: '#ff4444',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    deathText.setDepth(1001);
    
    // Lives remaining
    const store = useGameStore.getState();
    const livesText = this.add.text(
      this.cameras.main.scrollX + GAME.ARENA_WIDTH / 2,
      this.cameras.main.scrollY + GAME.VIEWPORT_HEIGHT / 2,
      `Lives Remaining: ${'❤️'.repeat(store.lives)}`,
      {
        fontSize: '20px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    livesText.setDepth(1001);
    
    // Note about cards - only generated on final game over or level win
    const cardText = this.add.text(
      this.cameras.main.scrollX + GAME.ARENA_WIDTH / 2,
      this.cameras.main.scrollY + GAME.VIEWPORT_HEIGHT / 2 + 40,
      'Card will be generated when you complete the level!',
      {
        fontSize: '14px',
        color: '#888888'
      }
    ).setOrigin(0.5);
    cardText.setDepth(1001);
    
    // Restart prompt
    const restartText = this.add.text(
      this.cameras.main.scrollX + GAME.ARENA_WIDTH / 2,
      this.cameras.main.scrollY + GAME.VIEWPORT_HEIGHT / 2 + 100,
      '[ CLICK TO RETRY LEVEL ]',
      {
        fontSize: '20px',
        color: '#ffaa00',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    restartText.setDepth(1001);
    
    // Pulsing effect
    this.tweens.add({
      targets: restartText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    // Click to restart
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
    
    // Or press any key
    this.input.keyboard?.once('keydown', () => {
      this.scene.restart();
    });
  }
  
  protected updateHUD(): void {
    const store = useGameStore.getState();
    
    // Timer
    const minutes = Math.floor(store.timeRemaining / 60);
    const seconds = Math.floor(store.timeRemaining % 60);
    this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    
    // Color timer red when low
    if (store.timeRemaining <= 10) {
      this.timerText.setColor('#ff4444');
    } else if (store.timeRemaining <= 30) {
      this.timerText.setColor('#ffaa00');
    } else {
      this.timerText.setColor('#ffffff');
    }
    
    // Lives
    const hearts = '❤️'.repeat(store.lives) + '🖤'.repeat(GAME.MAX_LIVES - store.lives);
    this.livesText.setText(hearts);
    
    // Motes
    this.motesText.setText(`Motes: ${store.motesCollected}/${this.levelConfig.moteCount}`);
    
    // Energy bar
    this.energyBar.clear();
    const energyPercent = store.energy / GAME.MAX_ENERGY;
    const barWidth = 150 * energyPercent;
    
    // Color based on energy level
    let barColor = 0x00ff00;
    if (energyPercent < 0.3) barColor = 0xff0000;
    else if (energyPercent < 0.6) barColor = 0xffff00;
    
    this.energyBar.fillStyle(barColor);
    this.energyBar.fillRect(GAME.ARENA_WIDTH - 170, 29, barWidth, 12);
    
    // Shooting indicator
    if (store.canShoot) {
      this.shootingIndicator.setText('🔫 SHOOTING UNLOCKED! (Space)');
      this.shootingIndicator.setColor('#00ff00');
    } else {
      const remaining = this.levelConfig.motesToUnlockShooting - store.motesCollected;
      this.shootingIndicator.setText(`🔒 Collect ${remaining} more mote(s) to shoot`);
      this.shootingIndicator.setColor('#888888');
    }
  }
  
  protected updateBinaryWrap(): void {
    const store = useGameStore.getState();
    const wrapHeight = store.binaryWrapHeight * GAME.ARENA_HEIGHT;
    
    this.binaryWrap.setSize(GAME.ARENA_WIDTH, wrapHeight);
    
    // Add some visual corruption effect
    if (wrapHeight > 0) {
      // Pulsing effect
      const pulse = Math.sin(Date.now() / 200) * 0.1;
      this.binaryWrap.setAlpha(0.85 + pulse);
    }
  }
  
  protected checkCloudCollisions(): void {
    if (!this.clouds || !this.player) return;
    
    let inCloud = false;
    
    this.clouds.getChildren().forEach((cloud: any) => {
      const bounds = cloud.cloudBounds as Phaser.Geom.Rectangle;
      if (bounds && bounds.contains(this.player.x, this.player.y)) {
        inCloud = true;
        // Energy regen in clouds
        this.player.collectEnergy(GAME.ENERGY_REGEN_CLOUD / 60); // Per frame
      }
    });
    
    // Track cloud entry
    if (inCloud && !this.player.isInCloud()) {
      this.player.enterCloud();
    }
  }
}

