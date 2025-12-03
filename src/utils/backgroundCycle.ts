/**
 * Background Cycle Utility
 * 
 * Implements the 13-image cycling animation from the CSS file
 * for use in Phaser scenes
 */

export const BACKGROUND_IMAGES = [
  'images/HummingBow.jpg',
  'images/IMG_6794.JPEG',
  'images/IMG_6795.JPEG',
  'images/IMG_6796.JPEG',
  'images/IMG_6797.JPEG',
  'images/TunnelBow.JPEG',
  'images/IMG_6906.JPEG',
  'images/IMG_6907.JPEG',
  'images/IMG_6908.JPEG',
  'images/IMG_6909.JPEG',
  'images/IMG_6910.JPEG',
  'images/IMG_6911.JPEG',
  'images/IMG_6912.JPEG',
];

export class BackgroundCycle {
  private scene: Phaser.Scene;
  private currentIndex: number = 0;
  private backgroundSprite?: Phaser.GameObjects.Image;
  private cycleTimer?: Phaser.Time.TimerEvent;
  private cycleDuration: number = 8000; // 8 seconds per image (104s total / 13 images)
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  start(x: number, y: number, width: number, height: number, depth: number = 0): void {
    // Create background sprite
    this.backgroundSprite = this.scene.add.image(x, y, BACKGROUND_IMAGES[0]);
    this.backgroundSprite.setDisplaySize(width, height);
    this.backgroundSprite.setDepth(depth);
    this.backgroundSprite.setAlpha(0.8);
    
    // Start cycling
    this.cycleTimer = this.scene.time.addEvent({
      delay: this.cycleDuration,
      callback: this.nextImage,
      callbackScope: this,
      loop: true
    });
  }
  
  private nextImage(): void {
    if (!this.backgroundSprite) return;
    
    this.currentIndex = (this.currentIndex + 1) % BACKGROUND_IMAGES.length;
    
    // Fade transition
    this.scene.tweens.add({
      targets: this.backgroundSprite,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        if (this.backgroundSprite) {
          this.backgroundSprite.setTexture(BACKGROUND_IMAGES[this.currentIndex]);
          this.scene.tweens.add({
            targets: this.backgroundSprite,
            alpha: 0.8,
            duration: 500
          });
        }
      }
    });
  }
  
  stop(): void {
    if (this.cycleTimer) {
      this.cycleTimer.destroy();
    }
    if (this.backgroundSprite) {
      this.backgroundSprite.destroy();
    }
  }
  
  setDepth(depth: number): void {
    if (this.backgroundSprite) {
      this.backgroundSprite.setDepth(depth);
    }
  }
}

