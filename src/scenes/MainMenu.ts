/**
 * MAIN MENU SCENE
 * 
 * Bubbly, rounded aesthetic with rainbow vibes.
 */

import Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';
import { GAME, DIFFICULTIES, LEVELS } from '../config/gameConfig';
import type { Difficulty } from '../config/gameConfig';
import { initializeWallet, getWallet, resetWallet } from '../systems/bsv/walletAdapter';
import { BSV_CONFIG } from '../systems/bsv/config';

export class MainMenu extends Phaser.Scene {
  private selectedDifficulty: Difficulty = 'weaver';
  private difficultyButtons: Map<Difficulty, Phaser.GameObjects.Container> = new Map();
  private bubbles: Phaser.GameObjects.Arc[] = [];
  private walletStatusText?: Phaser.GameObjects.Text;
  private walletConnected: boolean = false;
  
  constructor() {
    super('MainMenu');
  }
  
  private backgroundCycleIndex: number = 0;
  private backgroundImage?: Phaser.GameObjects.Image;
  private backgroundImageNext?: Phaser.GameObjects.Image; // Second image for cross-fade
  private backgroundImageKeys: string[] = [
    'bg_hummingbow',
    'bg_6794',
    'bg_6795',
    'bg_6796',
    'bg_6797',
    'bg_tunnelbow',
    'bg_6906',
    'bg_6907',
    'bg_6908',
    'bg_6909',
    'bg_6910',
    'bg_6911',
    'bg_6912'
  ];
  
  async create(): Promise<void> {
    const centerX = GAME.ARENA_WIDTH / 2;
    
    // Initialize BSV wallet (non-blocking, can fail gracefully)
    this.initializeBSVWallet();
    
    // Create cycling background with actual images
    this.createCyclingBackground();
    
    // Floating bubbles in background
    this.createBubbles();
    
    // Title with bubbly style
    const title = this.add.text(centerX, 70, 'SPECTRAL QUEST', {
      fontSize: '44px',
      fontFamily: 'Arial Rounded MT Bold, Helvetica, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#6644aa',
      strokeThickness: 6
    });
    title.setOrigin(0.5);
    
    // Rainbow shimmer on title
    this.tweens.addCounter({
      from: 0,
      to: 360,
      duration: 3000,
      repeat: -1,
      onUpdate: (tween) => {
        const hue = tween.getValue();
        const color = Phaser.Display.Color.HSLToColor(hue / 360, 0.7, 0.8);
        title.setTint(color.color);
      }
    });
    
    // Subtitle
    this.add.text(centerX, 120, '✨ Rainbow Craft ✨', {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#bbaadd',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    // Difficulty section label
    this.add.text(centerX, 175, 'Choose Your Challenge', {
      fontSize: '16px',
      color: '#8888aa'
    }).setOrigin(0.5);
    
    // ROUNDED difficulty buttons
    const difficulties: Difficulty[] = ['dreamer', 'weaver', 'dancer', 'master'];
    const buttonWidth = 160;
    const buttonSpacing = 15;
    const totalWidth = difficulties.length * buttonWidth + (difficulties.length - 1) * buttonSpacing;
    const startX = centerX - totalWidth / 2 + buttonWidth / 2;
    
    difficulties.forEach((diff, index) => {
      const x = startX + index * (buttonWidth + buttonSpacing);
      const button = this.createRoundedButton(x, 245, diff);
      this.difficultyButtons.set(diff, button);
    });
    
    // Highlight default
    this.selectDifficulty('weaver');
    
    // BIG ROUNDED START BUTTON
    const startButton = this.createStartButton(centerX, 380);
    
    // Controls info with rounded pill background
    const controlsBg = this.add.graphics();
    controlsBg.fillStyle(0x000000, 0.3);
    controlsBg.fillRoundedRect(centerX - 200, 470, 400, 35, 17);
    
    this.add.text(centerX, 487, 'WASD: Move  •  Space: Shoot  •  Mouse: Aim', {
      fontSize: '13px',
      color: '#aaaacc'
    }).setOrigin(0.5);
    
    // Wallet button - rounded pill
    const walletButton = this.createPillButton(centerX, 540, '🔗 Connect Wallet', 0x3366aa);
    walletButton.on('pointerdown', async () => {
      await this.handleWalletConnection();
    });
    
    // Wallet status text (updates dynamically)
    this.walletStatusText = this.add.text(centerX, 580, '🔗 Wallet: Not Connected', {
      fontSize: '12px',
      color: '#ff8888'
    }).setOrigin(0.5);
    
    // Version
    this.add.text(GAME.ARENA_WIDTH - 15, GAME.VIEWPORT_HEIGHT - 15, 'v0.1.0', {
      fontSize: '11px',
      color: '#555577'
    }).setOrigin(1, 1);
    
    // TEST MODE: Level selector (press T to toggle)
    this.createTestModeSelector(centerX);
    
    // Keyboard shortcut for test mode
    const keyT = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.T);
    keyT?.on('down', () => {
      const testMode = this.children.getByName('testModeContainer');
      if (testMode) {
        testMode.setVisible(!testMode.visible);
      }
    });
  }
  
  private createTestModeSelector(centerX: number): void {
    const container = this.add.container(centerX, 300);
    container.setName('testModeContainer');
    container.setVisible(false); // Hidden by default, press T to show
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRoundedRect(-200, -120, 400, 240, 20);
    bg.lineStyle(3, 0xffff00, 0.8);
    bg.strokeRoundedRect(-200, -120, 400, 240, 20);
    
    // Title
    const title = this.add.text(0, -100, '🧪 TEST MODE 🧪', {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const subtitle = this.add.text(0, -70, 'Select Level to Test', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    
    // Level buttons (2 rows of 4)
    const levelNames = [
      'Crimson', 'Amber', 'Yellow', 'Green',
      'Blue', 'Indigo', 'Violet', 'All'
    ];
    const levelKeys = [
      'CrimsonLevel', 'AmberLevel', 'YellowLevel', 'GreenLevel',
      'BlueLevel', 'IndigoLevel', 'VioletLevel', null
    ];
    
    const buttonWidth = 80;
    const buttonHeight = 35;
    const spacing = 15;
    const startX = -((buttonWidth + spacing) * 2 - spacing) / 2;
    
    levelNames.forEach((name, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      const x = startX + col * (buttonWidth + spacing);
      const y = -30 + row * (buttonHeight + spacing);
      
      const buttonBg = this.add.graphics();
      buttonBg.fillStyle(0x333333, 1);
      buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 8);
      buttonBg.lineStyle(2, 0x666666, 1);
      buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 8);
      
      const buttonText = this.add.text(x, y, name, {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0.5);
      
      const hitArea = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      
      hitArea.on('pointerover', () => {
        buttonBg.clear();
        buttonBg.fillStyle(0x555555, 1);
        buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 8);
        buttonBg.lineStyle(2, 0x888888, 1);
        buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 8);
      });
      
      hitArea.on('pointerout', () => {
        buttonBg.clear();
        buttonBg.fillStyle(0x333333, 1);
        buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 8);
        buttonBg.lineStyle(2, 0x666666, 1);
        buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 8);
      });
      
      hitArea.on('pointerdown', () => {
        if (levelKeys[index] === null) {
          // "All" - start from level 1
          useGameStore.getState().startLevel(0);
          this.scene.start('CrimsonLevel');
        } else {
          // Jump to specific level
          const levelIndex = index;
          useGameStore.getState().startLevel(levelIndex);
          this.scene.start(levelKeys[index]!);
        }
      });
      
      container.add([buttonBg, buttonText, hitArea]);
    });
    
    // Hint text
    const hint = this.add.text(0, 80, 'Press T to toggle test mode', {
      fontSize: '11px',
      color: '#888888',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    container.add([bg, title, subtitle, hint]);
    container.setDepth(1000);
  }
  
  private createCyclingBackground(): void {
    // Check if images are loaded
    const firstKey = this.backgroundImageKeys[0];
    if (!this.textures.exists(firstKey)) {
      console.warn('Background images not loaded, using fallback gradient');
      // Fallback to gradient
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x1a0a2a, 0x1a0a2a, 0x0a1a2a, 0x0a1a2a);
      bg.fillRect(0, 0, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
      return;
    }
    
    // Create TWO overlapping images for cross-fade (no black gap)
    // Current image - fully visible
    this.backgroundImage = this.add.image(
      GAME.ARENA_WIDTH / 2,
      GAME.VIEWPORT_HEIGHT / 2,
      firstKey
    );
    this.setImageToCoverViewport(this.backgroundImage, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
    this.backgroundImage.setDepth(-100);
    this.backgroundImage.setAlpha(1);
    
    // Next image - hidden, ready for cross-fade
    const secondKey = this.backgroundImageKeys[1];
    this.backgroundImageNext = this.add.image(
      GAME.ARENA_WIDTH / 2,
      GAME.VIEWPORT_HEIGHT / 2,
      secondKey
    );
    this.setImageToCoverViewport(this.backgroundImageNext, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
    this.backgroundImageNext.setDepth(-101); // Behind current
    this.backgroundImageNext.setAlpha(0); // Hidden
    
    // Subtle glassmorphism overlay (like CSS backdrop-filter)
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.2); // Very light overlay
    overlay.fillRect(0, 0, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
    overlay.setDepth(-99);
    
    // Cycle through images every 8 seconds (104s total / 13 = 8s each)
    // Match CSS timing: 0%, 6%, 12%, 18%, 24%, 30%, 36%, 42%, 48%, 54%, 60%, 66%, 72%
    this.time.addEvent({
      delay: 8000, // 8 seconds per image (104s / 13 = 8s)
      callback: () => {
        this.backgroundCycleIndex = (this.backgroundCycleIndex + 1) % this.backgroundImageKeys.length;
        const nextKey = this.backgroundImageKeys[this.backgroundCycleIndex];
        
        // Check if next image exists
        if (!this.textures.exists(nextKey)) {
          console.warn(`Background image ${nextKey} not found, skipping`);
          return;
        }
        
        // CROSS-FADE: Fade out current while fading in next (no black gap!)
        // Set next image texture and bring it to front
        if (this.backgroundImageNext) {
          this.backgroundImageNext.setTexture(nextKey);
          this.setImageToCoverViewport(this.backgroundImageNext, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
          this.backgroundImageNext.setDepth(-100); // Bring to front
          this.backgroundImageNext.setAlpha(0); // Start hidden
          
          // Simultaneously fade out current and fade in next
          this.tweens.add({
            targets: this.backgroundImage,
            alpha: 0,
            duration: 2000, // 2 second cross-fade
            ease: 'Sine.easeInOut'
          });
          
          this.tweens.add({
            targets: this.backgroundImageNext,
            alpha: 1,
            duration: 2000, // 2 second cross-fade
            ease: 'Sine.easeInOut',
            onComplete: () => {
              // Swap: current becomes next, next becomes current
              const temp = this.backgroundImage;
              this.backgroundImage = this.backgroundImageNext;
              this.backgroundImageNext = temp;
              // Put the new "next" behind
              if (this.backgroundImageNext) {
                this.backgroundImageNext.setDepth(-101);
              }
            }
          });
        }
      },
      callbackScope: this,
      loop: true
    });
  }
  
  private createBubbles(): void {
    const colors = [0xff6b9d, 0xffa06b, 0xffd93d, 0x6bcf6b, 0x6bb5ff, 0x9b6bff, 0xff6bdb];
    
    // Create more bubbles with bubbles inside
    for (let i = 0; i < 35; i++) {
      const x = Phaser.Math.Between(30, GAME.ARENA_WIDTH - 30);
      const y = Phaser.Math.Between(30, GAME.VIEWPORT_HEIGHT - 30);
      const radius = Phaser.Math.Between(15, 45);
      const color = colors[i % colors.length];
      
      // Outer bubble
      const bubble = this.add.circle(x, y, radius, color, 0.2);
      const shine = this.add.circle(x - radius * 0.3, y - radius * 0.3, radius * 0.2, 0xffffff, 0.4);
      
      // Inner bubble (bubble within bubble)
      const innerRadius = radius * 0.6;
      const innerBubble = this.add.circle(x, y, innerRadius, color, 0.15);
      const innerShine = this.add.circle(x - innerRadius * 0.3, y - innerRadius * 0.3, innerRadius * 0.2, 0xffffff, 0.3);
      
      // Tiny bubble inside inner bubble
      const tinyRadius = innerRadius * 0.5;
      const tinyBubble = this.add.circle(x + radius * 0.2, y + radius * 0.2, tinyRadius, color, 0.25);
      
      this.bubbles.push(bubble);
      
      // Float animation - all bubbles together
      const floatDuration = Phaser.Math.Between(3000, 6000);
      this.tweens.add({
        targets: [bubble, shine, innerBubble, innerShine, tinyBubble],
        y: y - Phaser.Math.Between(20, 50),
        x: x + Phaser.Math.Between(-20, 20),
        duration: floatDuration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Gentle pulse on inner bubbles
      this.tweens.add({
        targets: [innerBubble, tinyBubble],
        scaleX: 1.1,
        scaleY: 1.1,
        duration: floatDuration * 0.8,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
  
  private createRoundedButton(x: number, y: number, difficulty: Difficulty): Phaser.GameObjects.Container {
    const config = DIFFICULTIES[difficulty];
    const container = this.add.container(x, y);
    
    // Glassmorphism background with cycling effect
    const bg = this.add.graphics();
    this.createGlassmorphismButton(bg, -75, -45, 150, 90, 20);
    
    const nameText = this.add.text(0, -15, config.name, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const descText = this.add.text(0, 15, config.description, {
      fontSize: '10px',
      color: '#aaaacc',
      align: 'center',
      wordWrap: { width: 130 }
    }).setOrigin(0.5);
    
    container.add([bg, nameText, descText]);
    container.setInteractive(new Phaser.Geom.Rectangle(-75, -45, 150, 90), Phaser.Geom.Rectangle.Contains);
    
    // Store for selection highlighting
    (container as any).bgGraphics = bg;
    (container as any).nameText = nameText;
    
    // Update button background on cycle
    this.time.addEvent({
      delay: 8000,
      callback: () => {
        if (this.selectedDifficulty !== difficulty) {
          bg.clear();
          this.createGlassmorphismButton(bg, -75, -45, 150, 90, 20);
        }
      },
      callbackScope: this,
      loop: true
    });
    
    container.on('pointerover', () => {
      if (this.selectedDifficulty !== difficulty) {
        this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 });
      }
    });
    
    container.on('pointerout', () => {
      if (this.selectedDifficulty !== difficulty) {
        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
      }
    });
    
    container.on('pointerdown', () => {
      this.selectDifficulty(difficulty);
    });
    
    return container;
  }
  
  private createGlassmorphismButton(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number, radius: number): void {
    // Base glassmorphism background (semi-transparent dark)
    graphics.fillStyle(0x000000, 0.5);
    graphics.fillRoundedRect(x, y, width, height, radius);
    
    // Cycling background effect (simulated with gradient)
    const cycleColor = this.getCurrentCycleColor();
    graphics.fillStyle(cycleColor, 0.3);
    graphics.fillRoundedRect(x + 2, y + 2, width - 4, height - 4, radius - 2);
    
    // Border with glow
    graphics.lineStyle(2, 0x667eea, 0.6);
    graphics.strokeRoundedRect(x, y, width, height, radius);
    
    // Inner highlight
    graphics.fillStyle(0xffffff, 0.1);
    graphics.fillRoundedRect(x + 2, y + 2, width - 4, height * 0.3, radius - 2);
  }
  
  private getCurrentCycleColor(): number {
    // Get current cycle color based on index (matching the image sequence)
    // These colors are extracted from the actual images for button accents
    const colors = [
      0x8B4513, // HummingBow - brown/tan
      0x2F4F4F, // IMG_6794 - dark slate
      0x556B2F, // IMG_6795 - olive
      0x483D8B, // IMG_6796 - dark slate blue
      0x8B008B, // IMG_6797 - dark magenta
      0x191970, // TunnelBow - midnight blue
      0x2E8B57, // IMG_6906 - sea green
      0x8B4513, // IMG_6907 - sienna
      0x4B0082, // IMG_6908 - indigo
      0x800080, // IMG_6909 - purple
      0x2F4F4F, // IMG_6910 - slate gray
      0x556B2F, // IMG_6911 - dark olive
      0x8B4513  // IMG_6912 - saddle brown
    ];
    return colors[this.backgroundCycleIndex % colors.length];
  }
  
  private createStartButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Large rounded button with glassmorphism
    const bg = this.add.graphics();
    this.createGlassmorphismButton(bg, -110, -35, 220, 70, 35);
    
    // Additional gradient overlay for depth
    const cycleColor = this.getCurrentCycleColor();
    bg.fillStyle(cycleColor, 0.4);
    bg.fillRoundedRect(-105, -32, 210, 35, 30);
    
    const text = this.add.text(0, 0, 'START', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    container.add([bg, text]);
    container.setInteractive(new Phaser.Geom.Rectangle(-110, -35, 220, 70), Phaser.Geom.Rectangle.Contains);
    
    // Hover effects
    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scaleX: 1.08, scaleY: 1.08, duration: 100 });
    });
    
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
    });
    
    container.on('pointerdown', () => {
      this.startGame();
    });
    
    // Gentle pulse
    this.tweens.add({
      targets: container,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    return container;
  }
  
  private createPillButton(x: number, y: number, label: string, color: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.8);
    bg.fillRoundedRect(-90, -18, 180, 36, 18);
    
    const text = this.add.text(0, 0, label, {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    container.add([bg, text]);
    container.setInteractive(new Phaser.Geom.Rectangle(-90, -18, 180, 36), Phaser.Geom.Rectangle.Contains);
    
    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
    });
    
    return container;
  }
  
  /**
   * Ensures image covers the entire viewport uniformly (like CSS background-size: cover)
   * Scales image to cover the full area, cropping if necessary
   */
  private setImageToCoverViewport(image: Phaser.GameObjects.Image, targetWidth: number, targetHeight: number): void {
    const texture = image.texture;
    const sourceWidth = texture.source[0].width;
    const sourceHeight = texture.source[0].height;
    
    // Calculate scale to cover entire viewport (like CSS cover)
    const scaleX = targetWidth / sourceWidth;
    const scaleY = targetHeight / sourceHeight;
    const scale = Math.max(scaleX, scaleY); // Use larger scale to ensure full coverage
    
    image.setScale(scale);
    image.setDisplaySize(sourceWidth * scale, sourceHeight * scale);
  }
  
  private selectDifficulty(difficulty: Difficulty): void {
    // Update all buttons
    this.difficultyButtons.forEach((container, diff) => {
      const bg = (container as any).bgGraphics as Phaser.GameObjects.Graphics;
      const nameText = (container as any).nameText as Phaser.GameObjects.Text;
      
      bg.clear();
      
      if (diff === difficulty) {
        // Selected - bright, highlighted with glassmorphism
        const cycleColor = this.getCurrentCycleColor();
        bg.fillStyle(0x000000, 0.7);
        bg.fillRoundedRect(-75, -45, 150, 90, 20);
        bg.fillStyle(cycleColor, 0.5);
        bg.fillRoundedRect(-73, -43, 146, 86, 18);
        bg.lineStyle(4, 0x667eea, 1);
        bg.strokeRoundedRect(-75, -45, 150, 90, 20);
        nameText.setColor('#ffffff');
        container.setScale(1.05);
      } else {
        // Unselected - dim glassmorphism
        this.createGlassmorphismButton(bg, -75, -45, 150, 90, 20);
        nameText.setColor('#aaaaaa');
        container.setScale(1);
      }
    });
    
    this.selectedDifficulty = difficulty;
  }
  
  private startGame(): void {
    useGameStore.getState().startNewRun(this.selectedDifficulty);
    
    // Fade transition
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('CrimsonLevel');
    });
  }

  /**
   * INITIALIZE BSV WALLET
   * 
   * Attempts to connect to wallet on scene load
   * Fails gracefully if wallet not available
   */
  private async initializeBSVWallet(): Promise<void> {
    try {
      console.log('[MainMenu] Initializing BSV wallet...');
      
      const wallet = await initializeWallet({
        network: BSV_CONFIG.NETWORK,
        appName: BSV_CONFIG.APP_NAME,
        appIcon: BSV_CONFIG.APP_ICON
      });

      this.walletConnected = true;
      const identityKey = wallet.getIdentityKey();
      
      console.log(`[MainMenu] ✅ Wallet connected!`);
      console.log(`[MainMenu] Identity: ${identityKey.slice(0, 16)}...`);
      
      // Update UI
      if (this.walletStatusText) {
        this.walletStatusText.setText(`🔗 Wallet: Connected (${identityKey.slice(0, 8)}...)`);
        this.walletStatusText.setColor('#88ff88');
      }
    } catch (error) {
      console.warn('[MainMenu] ⚠️ Wallet initialization failed:', error);
      console.log('[MainMenu] Game will continue without blockchain features');
      
      // Update UI to show disconnected state
      if (this.walletStatusText) {
        this.walletStatusText.setText('🔗 Wallet: Not Connected (Click to connect)');
        this.walletStatusText.setColor('#ff8888');
      }
      
      this.walletConnected = false;
    }
  }

  /**
   * HANDLE WALLET CONNECTION
   * 
   * Called when user clicks "Connect Wallet" button
   * Attempts to connect/reconnect wallet
   */
  private async handleWalletConnection(): Promise<void> {
    try {
      if (this.walletConnected) {
        // Already connected - show info or disconnect
        const wallet = getWallet();
        const identityKey = wallet.getIdentityKey();
        
        // Show connection info (could be a modal in future)
        console.log(`[MainMenu] Wallet already connected: ${identityKey.slice(0, 16)}...`);
        
        // For now, just update text
        if (this.walletStatusText) {
          this.walletStatusText.setText(`🔗 Wallet: Connected (${identityKey.slice(0, 8)}...)`);
          this.walletStatusText.setColor('#88ff88');
        }
        return;
      }

      // Not connected - try to connect
      console.log('[MainMenu] Attempting wallet connection...');
      
      if (this.walletStatusText) {
        this.walletStatusText.setText('🔗 Connecting...');
        this.walletStatusText.setColor('#ffaa00');
      }

      // Reset any existing connection
      resetWallet();
      
      // Initialize new connection
      const wallet = await initializeWallet({
        network: BSV_CONFIG.NETWORK,
        appName: BSV_CONFIG.APP_NAME,
        appIcon: BSV_CONFIG.APP_ICON
      });

      this.walletConnected = true;
      const identityKey = wallet.getIdentityKey();
      
      console.log(`[MainMenu] ✅ Wallet connected!`);
      
      // Update UI
      if (this.walletStatusText) {
        this.walletStatusText.setText(`🔗 Wallet: Connected (${identityKey.slice(0, 8)}...)`);
        this.walletStatusText.setColor('#88ff88');
      }

      // Show success notification
      const successText = this.add.text(GAME.ARENA_WIDTH / 2, 520, '✅ Wallet Connected!', {
        fontSize: '14px',
        color: '#88ff88'
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: successText,
        alpha: 0,
        y: successText.y - 20,
        duration: 2000,
        onComplete: () => successText.destroy()
      });

    } catch (error) {
      console.error('[MainMenu] ❌ Wallet connection failed:', error);
      
      // Update UI to show error
      if (this.walletStatusText) {
        this.walletStatusText.setText('🔗 Wallet: Connection Failed (Click to retry)');
        this.walletStatusText.setColor('#ff4444');
      }

      // Show error notification
      const errorText = this.add.text(GAME.ARENA_WIDTH / 2, 520, '❌ Wallet Connection Failed', {
        fontSize: '14px',
        color: '#ff4444'
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: errorText,
        alpha: 0,
        y: errorText.y - 20,
        duration: 2000,
        onComplete: () => errorText.destroy()
      });

      this.walletConnected = false;
    }
  }
}
