/**
 * MAIN MENU SCENE
 * 
 * Difficulty selection and game start screen.
 * Features cycling background images and floating bubbles.
 */

import Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';
import { GAME, LEVELS } from '../config/gameConfig';

// Global test mode flag
declare global {
  interface Window {
    TEST_MODE?: boolean;
  }
}

export class MainMenu extends Phaser.Scene {
  private bubbles: Phaser.GameObjects.Arc[] = [];
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
  private testModePanel?: Phaser.GameObjects.Container;
  
  constructor() {
    super('MainMenu');
  }
  
  create(): void {
    // Show the HTML menu overlay
    const overlay = document.getElementById('game-menu-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
    }
    
    // Create cycling background
    this.createCyclingBackground();
    
    // Create floating bubbles
    this.createBubbles();
    
    // Setup HTML menu buttons
    this.setupHTMLMenu();
    
    // Setup test mode toggle (press T)
    this.setupTestMode();
    
    // Initialize test mode flag
    if (typeof window !== 'undefined') {
      window.TEST_MODE = false;
    }
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
    
    const centerX = GAME.ARENA_WIDTH / 2;
    const centerY = GAME.VIEWPORT_HEIGHT / 2;
    
    // Create TWO overlapping images for cross-fade (no black gap)
    // Current image - fully visible
    this.backgroundImage = this.add.image(centerX, centerY, firstKey);
    this.setImageToCoverViewport(this.backgroundImage, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
    this.backgroundImage.setDepth(-100);
    this.backgroundImage.setAlpha(1);
    
    // Next image - hidden, ready for cross-fade
    const secondKey = this.backgroundImageKeys[1];
    this.backgroundImageNext = this.add.image(centerX, centerY, secondKey);
    this.setImageToCoverViewport(this.backgroundImageNext, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
    this.backgroundImageNext.setDepth(-101); // Behind current
    this.backgroundImageNext.setAlpha(0); // Hidden
    
    // Subtle glassmorphism overlay (like CSS backdrop-filter)
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.2); // Very light overlay
    overlay.fillRect(0, 0, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
    overlay.setDepth(-99);
    
    // Cycle through images every 4 seconds with smooth cross-fade
    this.time.addEvent({
      delay: 4000, // 4 seconds per image
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
            duration: 4000, // 4 second cross-fade (smooth)
            ease: 'Sine.easeInOut'
          });
          
          this.tweens.add({
            targets: this.backgroundImageNext,
            alpha: 1,
            duration: 4000, // 4 second cross-fade (smooth)
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
  
  private createBubbles(): void {
    const rainbowColors = [0xff6b6b, 0xffa06b, 0xffd93d, 0x6bcf6b, 0x6bb5ff, 0x9b6bff, 0xff6bdb];
    
    // Create more bubbles with bubble-within-bubble effect (like splash page)
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(50, GAME.ARENA_WIDTH - 50);
      const y = Phaser.Math.Between(50, GAME.VIEWPORT_HEIGHT - 50);
      const radius = Phaser.Math.Between(15, 50);
      const color = rainbowColors[i % rainbowColors.length];
      
      // Outer bubble (main bubble)
      const bubble = this.add.circle(x, y, radius, color, 0.2);
      bubble.setDepth(-50);
      
      // Inner bubble (bubble within bubble)
      const innerRadius = radius * 0.6;
      const innerBubble = this.add.circle(x, y, innerRadius, color, 0.3);
      innerBubble.setDepth(-49);
      
      // Tiny bubble inside inner bubble
      const tinyRadius = innerRadius * 0.5;
      const tinyBubble = this.add.circle(x + radius * 0.2, y + radius * 0.2, tinyRadius, color, 0.4);
      tinyBubble.setDepth(-48);
      
      // Shine/highlight effect
      const shine = this.add.circle(x - radius * 0.3, y - radius * 0.3, radius * 0.2, 0xffffff, 0.5);
      shine.setDepth(-47);
      
      this.bubbles.push(bubble);
      
      // Float animation - longer loops with varied timing
      const duration = Phaser.Math.Between(5000, 9000); // Longer loops (5-9 seconds)
      const delay = Phaser.Math.Between(0, 2000);
      
      this.tweens.add({
        targets: [bubble, innerBubble, tinyBubble, shine],
        y: y - Phaser.Math.Between(30, 80),
        x: x + Phaser.Math.Between(-30, 30),
        duration: duration,
        delay: delay,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Gentle scale pulse on inner bubbles
      this.tweens.add({
        targets: [innerBubble, tinyBubble],
        scaleX: 1.15,
        scaleY: 1.15,
        duration: duration * 0.7,
        delay: delay,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Shine twinkle effect
      this.tweens.add({
        targets: shine,
        alpha: 0.2,
        duration: 800,
        delay: Phaser.Math.Between(0, 1000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Outer bubble gentle pulse
      this.tweens.add({
        targets: bubble,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: duration * 0.9,
        delay: delay,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
  
  private setupHTMLMenu(): void {
    // Get difficulty buttons from HTML
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    difficultyButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const difficulty = target.getAttribute('data-difficulty') || 'weaver';
        
        // Remove active class from all buttons
        difficultyButtons.forEach((btn) => btn.classList.remove('active'));
        // Add active class to clicked button
        target.classList.add('active');
        
        // Store difficulty in game store
        const store = useGameStore.getState();
        store.startNewRun(difficulty as 'dreamer' | 'weaver' | 'dancer' | 'master');
        
        console.log(`Difficulty selected: ${difficulty}`);
      });
    });
    
    // Set default difficulty (Weaver) as active if none selected
    const hasActive = document.querySelector('.difficulty-btn.active');
    if (!hasActive) {
      const weaverButton = document.querySelector('[data-difficulty="weaver"]');
      if (weaverButton) {
        weaverButton.classList.add('active');
      }
    }
    
    // START button
    const startButton = document.getElementById('start-btn');
    if (startButton) {
      startButton.addEventListener('click', () => {
        const store = useGameStore.getState();
        
        // Get selected difficulty (default to weaver if none selected)
        const selectedButton = document.querySelector('.difficulty-btn.active');
        const difficulty = selectedButton 
          ? (selectedButton.getAttribute('data-difficulty') || 'weaver')
          : 'weaver';
        
        store.startNewRun(difficulty as 'dreamer' | 'weaver' | 'dancer' | 'master');
        
        // Hide the HTML menu overlay
        const overlay = document.getElementById('game-menu-overlay');
        if (overlay) {
          overlay.style.display = 'none';
        }
        
        // Start first level
        this.scene.start('CrimsonLevel');
      });
    }
    
    // Wallet button (placeholder)
    const walletButton = document.getElementById('wallet-btn');
    if (walletButton) {
      walletButton.addEventListener('click', () => {
        console.log('Wallet button clicked (placeholder)');
        // TODO: Implement wallet connection
      });
    }
  }
  
  private setupTestMode(): void {
    // Listen for T key to toggle test mode
    this.input.keyboard?.on('keydown-T', () => {
      if (typeof window !== 'undefined') {
        window.TEST_MODE = !window.TEST_MODE;
        this.toggleTestModePanel();
        console.log(`Test mode: ${window.TEST_MODE ? 'ON' : 'OFF'}`);
      }
    });
  }
  
  private toggleTestModePanel(): void {
    if (!window.TEST_MODE) {
      // Hide panel
      if (this.testModePanel) {
        this.testModePanel.destroy();
        this.testModePanel = undefined;
      }
      return;
    }
    
    // Show panel
    const centerX = GAME.ARENA_WIDTH / 2;
    const panelY = 100;
    
    // Panel background
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x000000, 0.8);
    panelBg.fillRoundedRect(centerX - 200, panelY - 30, 400, 300, 15);
    panelBg.lineStyle(2, 0xffff00, 1);
    panelBg.strokeRoundedRect(centerX - 200, panelY - 30, 400, 300, 15);
    
    // Title
    const title = this.add.text(centerX, panelY, 'TEST MODE - Select Level', {
      fontSize: '20px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Level buttons
    const levelNames = LEVELS.map((level, index) => ({
      name: level.name,
      index,
      key: level.key
    }));
    
    const buttonY = panelY + 40;
    const buttonsPerRow = 2;
    const buttonWidth = 150;
    const buttonHeight = 40;
    const buttonSpacing = 20;
    
    const panelObjects: Phaser.GameObjects.GameObject[] = [panelBg, title];
    
    levelNames.forEach((level, i) => {
      const row = Math.floor(i / buttonsPerRow);
      const col = i % buttonsPerRow;
      const x = centerX - (buttonsPerRow - 1) * (buttonWidth + buttonSpacing) / 2 + col * (buttonWidth + buttonSpacing);
      const y = buttonY + row * (buttonHeight + 10);
      
      // Button background
      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x333333, 0.9);
      btnBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
      btnBg.lineStyle(1, levelNames[i].index === 0 ? 0x44ff44 : 0x888888, 1);
      btnBg.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
      
      // Button text
      const btnText = this.add.text(x, y, `${level.index + 1}. ${level.name}`, {
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5);
      
      // Make interactive
      btnBg.setInteractive(new Phaser.Geom.Rectangle(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
      btnText.setInteractive(new Phaser.Geom.Rectangle(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
      
      const onClick = () => {
        const store = useGameStore.getState();
        store.startNewRun('weaver');
        store.startLevel(level.index);
        
        // Map level key to scene key
        const sceneMap: Record<string, string> = {
          'crimson': 'CrimsonLevel',
          'amber': 'AmberLevel',
          'yellow': 'YellowLevel',
          'green': 'GreenLevel',
          'blue': 'BlueLevel',
          'indigo': 'IndigoLevel',
          'violet': 'VioletLevel'
        };
        
        const sceneKey = sceneMap[level.key] || 'CrimsonLevel';
        this.scene.start(sceneKey);
      };
      
      btnBg.on('pointerdown', onClick);
      btnText.on('pointerdown', onClick);
      
      btnBg.on('pointerover', () => {
        btnBg.clear();
        btnBg.fillStyle(0x444444, 0.9);
        btnBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
        btnBg.lineStyle(2, 0xffff00, 1);
        btnBg.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
      });
      
      btnBg.on('pointerout', () => {
        btnBg.clear();
        btnBg.fillStyle(0x333333, 0.9);
        btnBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
        btnBg.lineStyle(1, levelNames[i].index === 0 ? 0x44ff44 : 0x888888, 1);
        btnBg.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
      });
      
      panelObjects.push(btnBg, btnText);
    });
    
    // Close button
    const closeBtn = this.add.text(centerX, panelY + 250, 'Press T to close', {
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5);
    panelObjects.push(closeBtn);
    
    // Create container (just for organization, doesn't affect functionality)
    this.testModePanel = this.add.container(0, 0, panelObjects);
  }
}
