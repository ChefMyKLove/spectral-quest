/**
 * LEVEL 1: CRIMSON AETHER
 * 
 * The teaching level. Features:
 * - 7 motes with VISIBLE sequence numbers
 * - Mentor: Umber (appears 4 times)
 * - 120 second timer
 * - 1 mote to unlock shooting
 */

import { BaseLevel } from '../BaseLevel';
import { GAME } from '../../config/gameConfig';

export class CrimsonLevel extends BaseLevel {
  private tutorialBackgroundImage?: Phaser.GameObjects.Image;
  private tutorialBackgroundImageNext?: Phaser.GameObjects.Image;
  private tutorialBackgroundCycleIndex: number = 0;
  private tutorialBackgroundImageKeys: string[] = [
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
    super('CrimsonLevel', 0);  // Level index 0
  }
  
  create(): void {
    // Create the game first
    super.create();
    
    // Immediately pause physics and show tutorial
    this.physics.pause();
    this.showTutorial();
  }
  
  private showTutorial(): void {
    // ROUNDED tutorial overlay with rainbow gradient
    // Use fixed coordinates instead of camera-relative (camera might not be ready)
    const centerX = GAME.ARENA_WIDTH / 2;
    const centerY = GAME.VIEWPORT_HEIGHT / 2;
    
    // Create cycling background for tutorial (behind overlay)
    this.createTutorialBackground();
    
    // Glassmorphism overlay - more transparent so background images show through
    const overlay = this.add.graphics();
    
    // Dark base - more transparent so background shows through
    overlay.fillStyle(0x000000, 0.4);  // Even more transparent (0.4 instead of 0.6)
    overlay.fillRoundedRect(centerX - 320, centerY - 180, 640, 360, 30);
    overlay.lineStyle(4, 0xDC143C, 0.8);
    overlay.strokeRoundedRect(centerX - 320, centerY - 180, 640, 360, 30);
    overlay.setScrollFactor(0);
    overlay.setDepth(2000);
    
    // Floating bubbles behind overlay
    this.createTutorialBubbles(centerX, centerY);
    
    // Title with glow
    const titleText = this.add.text(centerX, centerY - 130, '✨ CRIMSON AETHER ✨', {
      fontSize: '28px',
      color: '#DC143C',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);
    titleText.setScrollFactor(0);
    titleText.setDepth(2001);
    
    const tutorialText = this.add.text(centerX, centerY - 20,
      'Collect all 7 glowing MOTES to complete the level!\n\n' +
      '🎮 WASD or Arrows to fly\n' +
      '⚡ Collect sparkly ENERGY to stay airborne\n' +
      '🔫 After 1 mote: Space to SHOOT drones\n' +
      '🦄 Touch UMBER for bonus time & tokens!',
      {
        fontSize: '16px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 12
      }
    );
    tutorialText.setOrigin(0.5);
    tutorialText.setScrollFactor(0);
    tutorialText.setDepth(2001);
    
    // Rounded START button
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0xDC143C, 1);
    buttonBg.fillRoundedRect(centerX - 100, centerY + 100, 200, 50, 25);
    buttonBg.setScrollFactor(0);
    buttonBg.setDepth(2001);
    
    const startButton = this.add.text(centerX, centerY + 125, 'BEGIN!', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontStyle: 'bold'
    });
    startButton.setOrigin(0.5);
    startButton.setScrollFactor(0);
    startButton.setDepth(2002);
    
    // Make button interactive
    const hitArea = this.add.rectangle(centerX, centerY + 125, 200, 50, 0x000000, 0);
    hitArea.setScrollFactor(0);
    hitArea.setDepth(2003);
    hitArea.setInteractive({ useHandCursor: true });
    
    // Simple pulse animation (no sliding)
    this.tweens.add({
      targets: [buttonBg, startButton],
      alpha: 0.8,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Physics is already paused - we'll resume after tutorial
    
    // Timeout - return to menu after 15 seconds if no action
    const timeoutTimer = this.time.delayedCall(15000, () => {
      this.scene.start('MainMenu');
    });
    
    const startGame = () => {
      timeoutTimer.destroy();
      overlay.destroy();
      titleText.destroy();
      tutorialText.destroy();
      buttonBg.destroy();
      startButton.destroy();
      hitArea.destroy();
      // Clean up tutorial background images
      if (this.tutorialBackgroundImage) {
        this.tutorialBackgroundImage.destroy();
        this.tutorialBackgroundImage = undefined;
      }
      if (this.tutorialBackgroundImageNext) {
        this.tutorialBackgroundImageNext.destroy();
        this.tutorialBackgroundImageNext = undefined;
      }
      this.physics.resume();
    };
    
    // ONLY start on explicit button click - not any key
    hitArea.on('pointerdown', startGame);
  }
  
  private createTutorialBubbles(centerX: number, centerY: number): void {
    const colors = [0xff6b9d, 0xffa06b, 0xffd93d, 0x6bcf6b, 0x6bb5ff, 0x9b6bff, 0xff6bdb];
    
    for (let i = 0; i < 15; i++) {
      const x = centerX + Phaser.Math.Between(-300, 300);
      const y = centerY + Phaser.Math.Between(-150, 150);
      const radius = Phaser.Math.Between(8, 25);
      const color = colors[i % colors.length];
      
      // Outer bubble
      const bubble = this.add.circle(x, y, radius, color, 0.15);
      bubble.setScrollFactor(0);
      bubble.setDepth(1999);
      
      // Inner bubble
      const innerBubble = this.add.circle(x, y, radius * 0.6, color, 0.2);
      innerBubble.setScrollFactor(0);
      innerBubble.setDepth(1999);
      
      // Float animation
      this.tweens.add({
        targets: [bubble, innerBubble],
        y: y - Phaser.Math.Between(10, 30),
        x: x + Phaser.Math.Between(-10, 10),
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
  
  private createTutorialBackground(): void {
    const firstKey = this.tutorialBackgroundImageKeys[0];
    const centerX = GAME.ARENA_WIDTH / 2;
    const centerY = GAME.VIEWPORT_HEIGHT / 2;
    
    if (!this.textures.exists(firstKey)) {
      // Fallback: Create a gradient background if images aren't loaded
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x1a0a2a, 0x1a0a2a, 0x2d1b4e, 0x2d1b4e);
      bg.fillRect(0, 0, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
      bg.setScrollFactor(0);
      bg.setDepth(1997);
      return;
    }
    
    // Create TWO overlapping images for cross-fade (no black gap)
    
    // Current image - fully visible
    this.tutorialBackgroundImage = this.add.image(centerX, centerY, firstKey);
    this.setTutorialImageToCover(this.tutorialBackgroundImage);
    this.tutorialBackgroundImage.setScrollFactor(0);
    this.tutorialBackgroundImage.setDepth(1997);
    this.tutorialBackgroundImage.setAlpha(1);
    
    // Next image - hidden, ready for cross-fade
    const secondKey = this.tutorialBackgroundImageKeys[1];
    this.tutorialBackgroundImageNext = this.add.image(centerX, centerY, secondKey);
    this.setTutorialImageToCover(this.tutorialBackgroundImageNext);
    this.tutorialBackgroundImageNext.setScrollFactor(0);
    this.tutorialBackgroundImageNext.setDepth(1996);
    this.tutorialBackgroundImageNext.setAlpha(0);
    
    // Cycle through images every 8 seconds
    this.time.addEvent({
      delay: 8000,
      callback: () => {
        this.tutorialBackgroundCycleIndex = (this.tutorialBackgroundCycleIndex + 1) % this.tutorialBackgroundImageKeys.length;
        const nextKey = this.tutorialBackgroundImageKeys[this.tutorialBackgroundCycleIndex];
        
        if (!this.textures.exists(nextKey)) return;
        
        // CROSS-FADE
        if (this.tutorialBackgroundImageNext) {
          this.tutorialBackgroundImageNext.setTexture(nextKey);
          this.setTutorialImageToCover(this.tutorialBackgroundImageNext);
          this.tutorialBackgroundImageNext.setDepth(1997);
          this.tutorialBackgroundImageNext.setAlpha(0);
          
          this.tweens.add({
            targets: this.tutorialBackgroundImage,
            alpha: 0,
            duration: 2000,
            ease: 'Sine.easeInOut'
          });
          
          this.tweens.add({
            targets: this.tutorialBackgroundImageNext,
            alpha: 1,
            duration: 2000,
            ease: 'Sine.easeInOut',
            onComplete: () => {
              const temp = this.tutorialBackgroundImage;
              this.tutorialBackgroundImage = this.tutorialBackgroundImageNext;
              this.tutorialBackgroundImageNext = temp;
              if (this.tutorialBackgroundImageNext) {
                this.tutorialBackgroundImageNext.setDepth(1996);
              }
            }
          });
        }
      },
      callbackScope: this,
      loop: true
    });
  }
  
  private setTutorialImageToCover(image: Phaser.GameObjects.Image): void {
    const texture = image.texture;
    const sourceWidth = texture.source[0].width;
    const sourceHeight = texture.source[0].height;
    const targetWidth = GAME.ARENA_WIDTH;
    const targetHeight = GAME.VIEWPORT_HEIGHT;
    
    const scaleX = targetWidth / sourceWidth;
    const scaleY = targetHeight / sourceHeight;
    const scale = Math.max(scaleX, scaleY);
    
    image.setScale(scale);
    image.setDisplaySize(sourceWidth * scale, sourceHeight * scale);
  }
}

