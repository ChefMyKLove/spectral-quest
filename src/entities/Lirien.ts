/**
 * LIRIEN - The Player Character
 * 
 * A unicorn weaver who rides rainbow carpets through the Aether.
 * 
 * Controls:
 * - WASD/Arrows: Move (holding = rainbow carpet active, faster, drains energy)
 * - Release: Glide (slower, less energy drain)
 * - Spacebar: Shoot (if unlocked and has energy)
 * - Mouse: Aim direction for shooting
 */

import Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';
import { GAME, DIFFICULTIES } from '../config/gameConfig';

export class Lirien extends Phaser.Physics.Arcade.Sprite {
  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private shootKey!: Phaser.Input.Keyboard.Key;
  
  // State
  private isMoving: boolean = false;
  private lastShotTime: number = 0;
  
  // Visual effects
  private carpetParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private glowSprite!: Phaser.GameObjects.Sprite;
  
  // Path recording
  private lastRecordTime: number = 0;
  private readonly RECORD_INTERVAL = 100; // Record position every 100ms
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Use a placeholder texture for now
    super(scene, x, y, 'lirien');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Physics setup
    this.setCollideWorldBounds(true);
    this.setBounce(0);
    this.setDrag(100);
    
    // Set up body for proper collision
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(32, 32);
    body.setOffset(0, 0);
    
    // Input setup
    this.setupInput();
    
    // Visual effects setup
    this.setupVisuals();
  }
  
  private setupInput(): void {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) return;
    
    this.cursors = keyboard.createCursorKeys();
    this.wasd = {
      W: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.shootKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.ejectKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
  }
  
  private ejectKey!: Phaser.Input.Keyboard.Key;
  
  private setupVisuals(): void {
    // Rainbow carpet trail particles
    // Will be set up once we have proper textures
  }
  
  update(time: number, delta: number): void {
    const store = useGameStore.getState();
    const deltaSeconds = delta / 1000;
    
    // Don't update if not playing
    if (store.phase !== 'playing') return;
    
    // Get difficulty multipliers
    const difficultyConfig = DIFFICULTIES[store.difficulty];
    
    // Handle tumbling state (out of energy)
    if (store.isTumbling) {
      this.handleTumbling(deltaSeconds);
      return;
    }
    
    // Process movement
    this.handleMovement(deltaSeconds, difficultyConfig.energyDrainMultiplier);
    
    // Process shooting
    this.handleShooting(time);
    
    // Process mote ejection (Q key)
    this.handleMoteEjection();
    
    // Record path for card generation
    this.recordPath(time);
    
    // Update visual effects
    this.updateVisuals();
  }
  
  private handleMovement(deltaSeconds: number, energyMultiplier: number): void {
    const store = useGameStore.getState();
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Check input
    const up = this.cursors.up?.isDown || this.wasd.W?.isDown;
    const down = this.cursors.down?.isDown || this.wasd.S?.isDown;
    const left = this.cursors.left?.isDown || this.wasd.A?.isDown;
    const right = this.cursors.right?.isDown || this.wasd.D?.isDown;
    
    const wasMoving = this.isMoving;
    this.isMoving = up || down || left || right;
    
    if (this.isMoving) {
      // Active movement - rainbow carpet engaged
      let vx = 0;
      let vy = 0;
      
      if (up) vy = -GAME.PLAYER_SPEED;
      if (down) vy = GAME.PLAYER_SPEED;
      if (left) vx = -GAME.PLAYER_SPEED;
      if (right) vx = GAME.PLAYER_SPEED;
      
      // Normalize diagonal movement
      if (vx !== 0 && vy !== 0) {
        const factor = 0.707; // 1/sqrt(2)
        vx *= factor;
        vy *= factor;
      }
      
      this.setVelocity(vx, vy);
      
      // Drain energy while actively flying
      const actualDrain = GAME.ENERGY_DRAIN_FLYING * energyMultiplier * deltaSeconds;
      store.drainEnergy(actualDrain, 'flying');
      
    } else {
      // Not pressing keys - GLIDE briefly then FALL
      
      // Apply strong friction to horizontal movement (quick glide then stop)
      const friction = 0.92;  // Slow down faster
      body.velocity.x *= friction;
      
      // Apply REAL gravity - fall until player presses button again
      body.velocity.y += GAME.GRAVITY * deltaSeconds;
      
      // Cap fall speed
      if (body.velocity.y > 300) {
        body.velocity.y = 300;
      }
      
      // NO energy drain while falling/gliding - conserve energy!
      // (Energy only drains when actively thrusting)
    }
    
    // Check if we ran out of energy
    if (store.energy <= 0) {
      store.setTumbling(true);
    }
    
    // Track exploration (divide arena into 10x10 grid)
    const gridX = Math.floor(this.x / (GAME.ARENA_WIDTH / 10));
    const gridY = Math.floor(this.y / (GAME.ARENA_HEIGHT / 10));
    store.markAreaExplored(gridX, gridY);
  }
  
  private handleTumbling(deltaSeconds: number): void {
    const store = useGameStore.getState();
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Apply gravity - Lirien falls
    body.setVelocityY(body.velocity.y + GAME.GRAVITY * deltaSeconds);
    
    // Can still move horizontally slightly
    const left = this.cursors.left?.isDown || this.wasd.A?.isDown;
    const right = this.cursors.right?.isDown || this.wasd.D?.isDown;
    
    if (left) body.setVelocityX(-GAME.PLAYER_GLIDE_SPEED * 0.5);
    else if (right) body.setVelocityX(GAME.PLAYER_GLIDE_SPEED * 0.5);
    else body.setVelocityX(body.velocity.x * 0.95); // Slow down
    
    // Check if recovered enough energy
    if (store.energy >= GAME.FALL_RECOVERY_THRESHOLD) {
      store.setTumbling(false);
    }
    
    // Check for crash (hit bottom of arena or binary wrap)
    // BUT: Don't trigger if binary wrap collision is already handling it
    const wrapY = GAME.ARENA_HEIGHT * (1 - store.binaryWrapHeight);
    const hitBottom = this.y >= GAME.ARENA_HEIGHT - 50;
    const hitWrap = this.y >= wrapY;
    
    // Only handle bottom crash here - let BaseLevel handle wrap collision
    if (hitBottom && !hitWrap) {
      // CRASH into bottom - lose a life
      const canContinue = store.loseLife('crash');
      
      // Emit event to scene to handle death properly
      this.scene.events.emit('playerCrash', { canContinue });
    }
    // If hitWrap is true, let BaseLevel.checkBinaryWrapCollision() handle it
  }
  
  private handleShooting(time: number): void {
    const store = useGameStore.getState();
    
    // Check if can shoot
    if (!store.canShoot) return;
    if (store.energy < GAME.ENERGY_DRAIN_SHOOTING) return;
    if (!this.shootKey?.isDown) return;
    
    // Check cooldown
    if (time - this.lastShotTime < GAME.SHOT_COOLDOWN) return;
    
    this.lastShotTime = time;
    store.fireShot();
    
    // Get aim direction from mouse
    const pointer = this.scene.input.activePointer;
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, worldPoint.x, worldPoint.y);
    
    // Emit event for the scene to spawn the projectile
    this.scene.events.emit('playerShoot', {
      x: this.x,
      y: this.y,
      angle: angle,
      speed: GAME.SHOT_SPEED
    });
  }
  
  private handleMoteEjection(): void {
    const store = useGameStore.getState();
    
    // Check if Q key was just pressed (not held)
    if (!Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard!, this.ejectKey)) return;
    
    // Can only eject if you have motes
    if (store.motesCollected <= 0) return;
    
    // Eject the last collected mote (to restore sequence order)
    // Find the last collected mote
    const collectedMotes = store.motes.filter(m => m.collected && m.collectedAt > 0)
      .sort((a, b) => b.collectedAt - a.collectedAt);
    
    if (collectedMotes.length > 0) {
      const moteToEject = collectedMotes[0];
      
      // Eject it - drop it at current position
      store.dropMotes(1);
      
      // Emit event to scene to respawn the mote
      this.scene.events.emit('moteEjected', {
        moteId: moteToEject.id,
        x: this.x,
        y: this.y
      });
      
      // Visual feedback
      const ejectText = this.scene.add.text(this.x, this.y - 30, 'MOTE EJECTED', {
        fontSize: '16px',
        color: '#ffaa00',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      this.scene.tweens.add({
        targets: ejectText,
        y: ejectText.y - 40,
        alpha: 0,
        duration: 800,
        onComplete: () => ejectText.destroy()
      });
    }
  }
  
  private recordPath(time: number): void {
    if (time - this.lastRecordTime >= this.RECORD_INTERVAL) {
      this.lastRecordTime = time;
      useGameStore.getState().recordPosition(this.x, this.y);
    }
  }
  
  private updateVisuals(): void {
    const store = useGameStore.getState();
    
    // Flip sprite based on movement direction
    if (this.body && this.body.velocity.x !== 0) {
      this.setFlipX(this.body.velocity.x < 0);
    }
    
    // Visual feedback for tumbling
    if (store.isTumbling) {
      this.setTint(0xff6666);
      this.setRotation(this.rotation + 0.1);
    } else {
      this.clearTint();
      this.setRotation(0);
    }
    
    // Visual feedback for low energy
    if (store.energy < 30) {
      this.setAlpha(0.5 + Math.sin(Date.now() / 100) * 0.3);
    } else {
      this.setAlpha(1);
    }
    
    // Rainbow carpet particles when moving
    if (this.isMoving && !store.isTumbling && store.energy > 0) {
      this.spawnCarpetTrail();
    }
  }
  
  private spawnCarpetTrail(): void {
    // Rainbow carpet flows from horn, spreads underneath Lirien
    const hue = (Date.now() / 8) % 360;
    const color = Phaser.Display.Color.HSLToColor(hue / 360, 1, 0.6).color;
    
    // Horn position (front of unicorn, slightly up)
    const facingRight = !this.flipX;
    const hornOffsetX = facingRight ? 15 : -15;
    const hornX = this.x + hornOffsetX;
    const hornY = this.y - 10;
    
    // Create particle at horn
    const particle = this.scene.add.circle(hornX, hornY, 4, color, 0.9);
    particle.setDepth(this.depth - 1); // Behind Lirien
    
    // Animate: flows from horn, curves down and spreads underneath
    const targetX = this.x + (Math.random() - 0.5) * 40; // Spread horizontally
    const targetY = this.y + 25 + Math.random() * 15;    // Below Lirien
    
    this.scene.tweens.add({
      targets: particle,
      x: targetX,
      y: targetY,
      scaleX: 1.5,
      scaleY: 0.8,
      alpha: 0,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => particle.destroy()
    });
    
    // Secondary sparkle at horn tip
    if (Math.random() > 0.7) {
      const sparkle = this.scene.add.circle(hornX, hornY - 5, 2, 0xffffff, 1);
      sparkle.setDepth(this.depth + 1);
      this.scene.tweens.add({
        targets: sparkle,
        alpha: 0,
        scaleX: 2,
        scaleY: 2,
        duration: 200,
        onComplete: () => sparkle.destroy()
      });
    }
  }
  
  public resetPosition(): void {
    // Reset to safe position at bottom of visible area
    this.setPosition(GAME.ARENA_WIDTH / 2, GAME.ARENA_HEIGHT - 100);
    this.setVelocity(0, 0);
    useGameStore.getState().setTumbling(false);
  }
  
  public collectEnergy(amount: number): void {
    useGameStore.getState().addEnergy(amount);
  }
  
  public enterCloud(): void {
    useGameStore.getState().enterCloud();
  }
  
  public exitCloud(): void {
    // Could add visual effects here
  }
  
  public isInCloud(): boolean {
    // Will be checked by collision system
    return false;
  }
}
