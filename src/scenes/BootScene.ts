/**
 * BOOT SCENE
 * 
 * Loads all game assets and then transitions to the main menu.
 * Bubbly, rainbowy loading screen aesthetic.
 */

import Phaser from 'phaser';
import { GAME } from '../config/gameConfig';

export class BootScene extends Phaser.Scene {
  private bubbles: Phaser.GameObjects.Arc[] = [];
  private progressRing!: Phaser.GameObjects.Graphics;
  private loadingProgress: number = 0;
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
  
  constructor() {
    super('BootScene');
  }
  
  preload(): void {
    const centerX = GAME.ARENA_WIDTH / 2;
    const centerY = GAME.VIEWPORT_HEIGHT / 2;
    
    // Load the 13 background cycling images
    // Try public/images/ first (Vite serves public/ at root)
    // If that fails, images should be moved to public/images/
    const imageBasePath = '/images/';
    
    this.load.image('bg_hummingbow', imageBasePath + 'HummingBow.jpg');
    this.load.image('bg_6794', imageBasePath + 'IMG_6794.JPEG');
    this.load.image('bg_6795', imageBasePath + 'IMG_6795.JPEG');
    this.load.image('bg_6796', imageBasePath + 'IMG_6796.JPEG');
    this.load.image('bg_6797', imageBasePath + 'IMG_6797.JPEG');
    this.load.image('bg_tunnelbow', imageBasePath + 'TunnelBow.JPEG');
    this.load.image('bg_6906', imageBasePath + 'IMG_6906.JPEG');
    this.load.image('bg_6907', imageBasePath + 'IMG_6907.JPEG');
    this.load.image('bg_6908', imageBasePath + 'IMG_6908.JPEG');
    this.load.image('bg_6909', imageBasePath + 'IMG_6909.JPEG');
    this.load.image('bg_6910', imageBasePath + 'IMG_6910.JPEG');
    this.load.image('bg_6911', imageBasePath + 'IMG_6911.JPEG');
    this.load.image('bg_6912', imageBasePath + 'IMG_6912.JPEG');
    
    // Add error handler for missing images
    this.load.on('filecomplete', (key: string) => {
      if (key.startsWith('bg_')) {
        console.log(`✅ Loaded background image: ${key}`);
      }
    });
    
    this.load.on('loaderror', (file: any) => {
      if (file.key && file.key.startsWith('bg_')) {
        console.error(`❌ Failed to load image: ${file.key} from ${file.src}`);
        console.error('💡 Make sure images are in public/images/ folder');
      }
    });
    
    // Create floating rainbow bubbles
    this.createBubbles();
    
    // Title with bubbly font style
    const title = this.add.text(centerX, centerY - 100, 'SPECTRAL QUEST', {
      fontSize: '42px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#8844aa',
      strokeThickness: 4
    });
    title.setOrigin(0.5);
    
    // Rainbow gradient effect on title
    this.tweens.addCounter({
      from: 0,
      to: 360,
      duration: 2000,
      repeat: -1,
      onUpdate: (tween) => {
        const hue = tween.getValue();
        const color = Phaser.Display.Color.HSLToColor(hue / 360, 0.8, 0.7);
        title.setTint(color.color);
      }
    });
    
    // Subtitle
    this.add.text(centerX, centerY - 50, '✨ Rainbow Craft ✨', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ddaaff',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    // Circular progress ring instead of bar
    this.progressRing = this.add.graphics();
    
    // Loading text with bouncy effect
    const loadingText = this.add.text(centerX, centerY + 80, 'Loading magic...', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaff'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: loadingText,
      y: centerY + 85,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Update progress
    this.load.on('progress', (value: number) => {
      this.loadingProgress = value;
      this.drawProgressRing(centerX, centerY + 20, 40, value);
    });
  }
  
  private startImageCycling(): void {
    // Check if images are loaded
    const firstKey = this.backgroundImageKeys[0];
    if (!this.textures.exists(firstKey)) {
      console.warn('Background images not loaded in BootScene, using fallback');
      // Fallback to gradient
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x1a0a2e, 0x1a0a2e, 0x2d1b4e, 0x2d1b4e);
      bg.fillRect(0, 0, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
      bg.setDepth(-100);
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
    
    // Cycle through images every 4 seconds (half the original time)
    this.time.addEvent({
      delay: 4000, // 4 seconds per image (half of original 8s)
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
            duration: 4000, // 4 second cross-fade (more pronounced)
            ease: 'Sine.easeInOut'
          });
          
          this.tweens.add({
            targets: this.backgroundImageNext,
            alpha: 1,
            duration: 4000, // 4 second cross-fade (more pronounced)
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
    
    // Create 40 floating bubbles
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(50, GAME.ARENA_WIDTH - 50);
      const y = Phaser.Math.Between(50, GAME.VIEWPORT_HEIGHT - 50);
      const radius = Phaser.Math.Between(8, 25);
      const color = rainbowColors[i % rainbowColors.length];
      
      // Bubble with gradient effect (outer glow + inner shine)
      const bubble = this.add.circle(x, y, radius, color, 0.3);
      const innerBubble = this.add.circle(x, y, radius * 0.7, color, 0.5);
      const shine = this.add.circle(x - radius * 0.3, y - radius * 0.3, radius * 0.2, 0xffffff, 0.6);
      
      this.bubbles.push(bubble);
      
      // Float animation - each bubble has different timing
      const duration = Phaser.Math.Between(2000, 4000);
      const delay = Phaser.Math.Between(0, 1000);
      
      this.tweens.add({
        targets: [bubble, innerBubble, shine],
        y: y - Phaser.Math.Between(20, 50),
        x: x + Phaser.Math.Between(-20, 20),
        duration: duration,
        delay: delay,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Gentle scale pulse
      this.tweens.add({
        targets: [bubble, innerBubble],
        scaleX: 1.1,
        scaleY: 1.1,
        duration: duration * 0.8,
        delay: delay,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Shine twinkle
      this.tweens.add({
        targets: shine,
        alpha: 0.2,
        duration: 500,
        delay: Phaser.Math.Between(0, 500),
        yoyo: true,
        repeat: -1
      });
    }
  }
  
  private drawProgressRing(x: number, y: number, radius: number, progress: number): void {
    this.progressRing.clear();
    
    // Background ring
    this.progressRing.lineStyle(8, 0x333355, 0.5);
    this.progressRing.beginPath();
    this.progressRing.arc(x, y, radius, 0, Math.PI * 2);
    this.progressRing.strokePath();
    
    // Progress ring with rainbow gradient (draw multiple segments for smooth gradient)
    if (progress > 0) {
      const segments = Math.max(8, Math.floor(progress * 32)); // More segments = smoother gradient
      const angleStep = (Math.PI * 2 * progress) / segments;
      const startAngle = -Math.PI / 2;
      
      for (let i = 0; i < segments; i++) {
        const segmentStart = startAngle + (angleStep * i);
        const segmentEnd = startAngle + (angleStep * (i + 1));
        
        // Calculate hue for this segment (rainbow: 0-360)
        const segmentProgress = i / segments;
        const hue = (segmentProgress * 360) % 360;
        const color = Phaser.Display.Color.HSLToColor(hue / 360, 1, 0.6).color;
        
        this.progressRing.lineStyle(8, color, 1);
        this.progressRing.beginPath();
        this.progressRing.arc(x, y, radius, segmentStart, segmentEnd);
        this.progressRing.strokePath();
      }
      
      // Glowing end cap (white)
      const endAngle = -Math.PI / 2 + (Math.PI * 2 * progress);
      const endX = x + Math.cos(endAngle) * radius;
      const endY = y + Math.sin(endAngle) * radius;
      
      this.progressRing.fillStyle(0xffffff, 0.9);
      this.progressRing.fillCircle(endX, endY, 6);
      
      // Outer glow on end cap
      this.progressRing.fillStyle(0xffffff, 0.3);
      this.progressRing.fillCircle(endX, endY, 10);
    }
    
    // Center percentage text
    const percent = Math.floor(progress * 100);
    // Clear and redraw percentage (we'll use a text object instead)
  }
  
  create(): void {
    // Create placeholder textures
    this.createPlaceholderTextures();
    
    // Start image cycling background
    this.startImageCycling();
    
    // Show "Ready!" briefly
    const centerX = GAME.ARENA_WIDTH / 2;
    const centerY = GAME.VIEWPORT_HEIGHT / 2;
    
    const readyText = this.add.text(centerX, centerY + 20, '100%', {
      fontSize: '24px',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: '#88ff88',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Burst of sparkles
    const colors = [0xff6b6b, 0xffd93d, 0x6bcf6b, 0x6bb5ff, 0x9b6bff];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const sparkle = this.add.circle(centerX, centerY + 20, 5, colors[i % colors.length], 1);
      
      this.tweens.add({
        targets: sparkle,
        x: centerX + Math.cos(angle) * 100,
        y: centerY + 20 + Math.sin(angle) * 100,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 600,
        ease: 'Quad.easeOut',
        onComplete: () => sparkle.destroy()
      });
    }
    
    // Transition to menu with fade - wait 2 more seconds
    this.time.delayedCall(2800, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenu');
      });
    });
  }
  
  private createPlaceholderTextures(): void {
    // Create Lirien placeholder - CRYSTALLINE, JAGGED unicorn
    const lirienGraphics = this.make.graphics({ x: 0, y: 0 });
    
    // Body - angular/crystalline shape
    lirienGraphics.fillStyle(0xeeeeff);
    lirienGraphics.fillTriangle(5, 30, 20, 15, 35, 30);  // Main crystal body
    lirienGraphics.fillTriangle(10, 28, 20, 20, 30, 28);  // Upper facet
    
    // Head - angular
    lirienGraphics.fillStyle(0xffffff);
    lirienGraphics.fillTriangle(30, 25, 38, 10, 42, 22);  // Head crystal
    
    // Horn - sharp crystalline
    lirienGraphics.fillStyle(0xffd700);
    lirienGraphics.fillTriangle(38, 10, 36, 0, 42, 8);  // Sharp horn
    lirienGraphics.fillStyle(0xffff88);
    lirienGraphics.fillTriangle(38, 8, 37, 2, 40, 7);   // Horn highlight
    
    // Legs - angular crystal pillars
    lirienGraphics.fillStyle(0xddddff);
    lirienGraphics.fillTriangle(10, 30, 8, 40, 14, 40);
    lirienGraphics.fillTriangle(18, 30, 16, 40, 22, 40);
    lirienGraphics.fillTriangle(26, 30, 24, 40, 30, 40);
    
    // Mane - jagged crystal spikes
    lirienGraphics.fillStyle(0xff44ff);
    lirienGraphics.fillTriangle(25, 18, 22, 8, 28, 12);
    lirienGraphics.fillTriangle(28, 15, 26, 6, 32, 10);
    lirienGraphics.fillStyle(0xff88ff);
    lirienGraphics.fillTriangle(30, 12, 28, 4, 34, 8);
    
    // Tail - crystal shards
    lirienGraphics.fillStyle(0x44ffff);
    lirienGraphics.fillTriangle(5, 28, 0, 20, 8, 22);
    lirienGraphics.fillStyle(0x88ffff);
    lirienGraphics.fillTriangle(3, 26, 0, 24, 6, 20);
    
    // Eye - sharp
    lirienGraphics.fillStyle(0x4444ff);
    lirienGraphics.fillTriangle(36, 16, 34, 14, 38, 14);
    
    lirienGraphics.generateTexture('lirien', 48, 48);
    lirienGraphics.destroy();
    
    // Create drone placeholders with rounder shapes
    const harvesterGraphics = this.make.graphics({ x: 0, y: 0 });
    harvesterGraphics.fillStyle(0x888888);
    harvesterGraphics.fillRoundedRect(4, 8, 24, 16, 6);
    harvesterGraphics.fillStyle(0x666666);
    harvesterGraphics.fillCircle(10, 16, 5);
    harvesterGraphics.fillCircle(22, 16, 5);
    harvesterGraphics.fillStyle(0x00ff00, 0.6);
    harvesterGraphics.fillCircle(16, 14, 4);
    harvesterGraphics.generateTexture('drone_harvester', 32, 32);
    harvesterGraphics.destroy();
    
    const hostileGraphics = this.make.graphics({ x: 0, y: 0 });
    hostileGraphics.fillStyle(0x880000);
    hostileGraphics.fillRoundedRect(4, 6, 24, 20, 8);
    hostileGraphics.fillStyle(0xff0000);
    hostileGraphics.fillCircle(16, 16, 6);
    hostileGraphics.fillStyle(0xff4444);
    hostileGraphics.fillCircle(14, 14, 2);
    hostileGraphics.generateTexture('drone_hostile', 32, 32);
    hostileGraphics.destroy();
    
    console.log('Placeholder textures created');
  }
}
