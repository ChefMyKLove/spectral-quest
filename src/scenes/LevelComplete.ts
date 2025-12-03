/**
 * LEVEL COMPLETE SCENE
 * 
 * Rounded, bubbly aesthetic matching the rest of the UI.
 */

import Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';
import type { LevelStats } from '../store/gameStore';
import { GAME, LEVELS } from '../config/gameConfig';

export class LevelComplete extends Phaser.Scene {
  private stats!: LevelStats;
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
    super('LevelCompleteScene');
  }
  
  init(data: { stats: LevelStats }): void {
    this.stats = data.stats;
  }
  
  create(): void {
    const centerX = GAME.ARENA_WIDTH / 2;
    const levelConfig = LEVELS[this.stats.levelIndex];
    
    // Create cycling background with actual images
    this.createCyclingBackground();
    
    // Floating celebration bubbles
    this.createCelebrationBubbles();
    
    // Main content card - rounded
    const card = this.add.graphics();
    card.fillStyle(0x000000, 0.7);
    card.fillRoundedRect(centerX - 300, 30, 600, 480, 25);
    card.lineStyle(3, 0x44ff44, 0.8);
    card.strokeRoundedRect(centerX - 300, 30, 600, 480, 25);
    
    // Victory text
    this.add.text(centerX, 70, '✨ LEVEL COMPLETE! ✨', {
      fontSize: '32px',
      color: '#44ff44',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(centerX, 110, levelConfig.name, {
      fontSize: '22px',
      color: levelConfig.color
    }).setOrigin(0.5);
    
    // Stats in rounded pills
    const statsY = 160;
    const statItems = [
      { label: 'Time Remaining', value: `${Math.floor(this.stats.timeRemaining)}s`, color: '#88ff88' },
      { label: 'Motes Collected', value: `${this.stats.motesCollected}/${this.stats.motesTotal}`, color: '#ffff88' },
      { label: 'Sequence Progress', value: `${this.stats.motesSequenceCorrect}/${this.stats.motesTotal}`, color: '#88ffff' },
      { label: 'Drones Destroyed', value: `${this.stats.harvestersDestroyed + this.stats.hostileDronesDestroyed}`, color: '#ff8888' },
      { label: 'Mentor Contact', value: this.stats.mentorContacted ? `Yes! +${this.stats.tokensEarned} 🌈` : 'No', color: '#ffaa88' },
    ];
    
    statItems.forEach((stat, index) => {
      const y = statsY + index * 40;
      
      // Rounded pill background
      const pill = this.add.graphics();
      pill.fillStyle(0x333333, 0.8);
      pill.fillRoundedRect(centerX - 200, y - 12, 400, 32, 16);
      
      this.add.text(centerX - 180, y, stat.label + ':', {
        fontSize: '14px',
        color: '#aaaaaa'
      }).setOrigin(0, 0.5);
      
      this.add.text(centerX + 180, y, stat.value, {
        fontSize: '14px',
        color: stat.color,
        fontStyle: 'bold'
      }).setOrigin(1, 0.5);
    });
    
    // Badges section
    if (this.stats.badges.length > 0) {
      const badgeY = statsY + statItems.length * 40 + 20;
      
      this.add.text(centerX, badgeY, '🏆 Badges Earned', {
        fontSize: '16px',
        color: '#ffd700'
      }).setOrigin(0.5);
      
      this.add.text(centerX, badgeY + 25, this.stats.badges.join(' • '), {
        fontSize: '13px',
        color: '#ffeeaa'
      }).setOrigin(0.5);
    }
    
    // Card generated section - rounded box
    const cardBoxY = 390;
    const cardBox = this.add.graphics();
    cardBox.fillStyle(0x224422, 0.9);
    cardBox.fillRoundedRect(centerX - 150, cardBoxY, 300, 80, 15);
    cardBox.lineStyle(2, 0x44aa44, 1);
    cardBox.strokeRoundedRect(centerX - 150, cardBoxY, 300, 80, 15);
    
    this.add.text(centerX, cardBoxY + 20, '🃏 SPECTRUM CARD', {
      fontSize: '16px',
      color: '#88ff88'
    }).setOrigin(0.5);
    
    this.add.text(centerX, cardBoxY + 45, `Rarity: ${this.stats.finalRarity.toUpperCase()}`, {
      fontSize: '14px',
      color: '#aaffaa'
    }).setOrigin(0.5);
    
    this.add.text(centerX, cardBoxY + 65, '(Art reveal coming soon!)', {
      fontSize: '11px',
      color: '#668866'
    }).setOrigin(0.5);
    
    // Mint button
    const mintButtonY = 470;
    const mintButtonBg = this.add.graphics();
    mintButtonBg.fillStyle(0xffd700, 1);
    mintButtonBg.fillRoundedRect(centerX - 100, mintButtonY - 20, 200, 40, 20);
    
    const mintButtonText = this.add.text(centerX, mintButtonY, 'MINT CARD', {
      fontSize: '18px',
      color: '#000000',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const mintHitArea = this.add.rectangle(centerX, mintButtonY, 200, 40, 0x000000, 0);
    mintHitArea.setInteractive({ useHandCursor: true });
    
    mintHitArea.on('pointerover', () => {
      this.tweens.add({ targets: [mintButtonBg, mintButtonText], scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    
    mintHitArea.on('pointerout', () => {
      this.tweens.add({ targets: [mintButtonBg, mintButtonText], scaleX: 1, scaleY: 1, duration: 100 });
    });
    
    mintHitArea.on('pointerdown', () => {
      this.showMintAnimation('win', this.stats.finalRarity);
    });
    
    // Continue button - big and rounded
    const store = useGameStore.getState();
    const nextLevelIndex = store.currentLevelIndex + 1;
    const hasNextLevel = nextLevelIndex < LEVELS.length;
    
    const buttonY = 540;
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x44aa44, 1);
    buttonBg.fillRoundedRect(centerX - 140, buttonY - 25, 280, 50, 25);
    
    const buttonText = this.add.text(centerX, buttonY,
      hasNextLevel ? 'CONTINUE →' : 'BOSS BATTLE →', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Button interaction
    const hitArea = this.add.rectangle(centerX, buttonY, 280, 50, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerover', () => {
      this.tweens.add({ targets: [buttonBg, buttonText], scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    
    hitArea.on('pointerout', () => {
      this.tweens.add({ targets: [buttonBg, buttonText], scaleX: 1, scaleY: 1, duration: 100 });
    });
    
    hitArea.on('pointerdown', () => {
      const store = useGameStore.getState();
      const nextLevelIndex = store.currentLevelIndex + 1;
      const hasNextLevel = nextLevelIndex < LEVELS.length;
      
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        if (hasNextLevel) {
          // Progress to next level
          const levelKeys = ['CrimsonLevel', 'AmberLevel', 'YellowLevel', 'GreenLevel', 'BlueLevel', 'IndigoLevel', 'VioletLevel'];
          const nextSceneKey = levelKeys[nextLevelIndex];
          console.log(`Progressing to level ${nextLevelIndex + 1}: ${nextSceneKey}`);
          this.scene.start(nextSceneKey);
        } else {
          // All levels complete - go to boss battle (or menu for now)
          console.log('All levels complete! Boss battle coming soon...');
          this.scene.start('MainMenu');
        }
      });
    });
    
    // Gentle pulse
    this.tweens.add({
      targets: [buttonBg, buttonText],
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
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
  
  private createCyclingBackground(): void {
    // Check if images are loaded
    const firstKey = this.backgroundImageKeys[0];
    if (!this.textures.exists(firstKey)) {
      console.warn('Background images not loaded, using fallback gradient');
      // Fallback to gradient
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x1a3a1a, 0x1a3a1a, 0x0a2a0a, 0x0a2a0a);
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
    overlay.fillStyle(0x000000, 0.25); // Light overlay
    overlay.fillRect(0, 0, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
    overlay.setDepth(-99);
    
    // Cycle through images every 8 seconds (104s total / 13 = 8s each)
    this.time.addEvent({
      delay: 8000,
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
  
  private createCelebrationBubbles(): void {
    const colors = [0x44ff44, 0x88ff88, 0xaaffaa, 0x44ffaa, 0x88ffaa];
    
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(30, GAME.ARENA_WIDTH - 30);
      const y = Phaser.Math.Between(30, GAME.VIEWPORT_HEIGHT - 30);
      const radius = Phaser.Math.Between(8, 20);
      const color = colors[i % colors.length];
      
      const bubble = this.add.circle(x, y, radius, color, 0.2);
      
      this.tweens.add({
        targets: bubble,
        y: y - Phaser.Math.Between(20, 40),
        x: x + Phaser.Math.Between(-15, 15),
        alpha: 0.1,
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
  
  private showMintAnimation(outcome: 'win' | 'lose', rarity: string): void {
    const centerX = GAME.ARENA_WIDTH / 2;
    const centerY = GAME.VIEWPORT_HEIGHT / 2;
    
    // Dark overlay
    const overlay = this.add.rectangle(centerX, centerY, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT, 0x000000, 0.9);
    overlay.setDepth(3000);
    
    // Card placeholder - spinning
    const cardSize = 200;
    const card = this.add.rectangle(centerX, centerY - 50, cardSize, cardSize * 1.4, 0x444444, 1);
    card.setDepth(3001);
    
    // Card border
    const cardBorder = this.add.graphics();
    cardBorder.lineStyle(4, outcome === 'win' ? 0x44ff44 : 0xff4444, 1);
    cardBorder.strokeRect(centerX - cardSize/2, centerY - 50 - cardSize * 0.7, cardSize, cardSize * 1.4);
    cardBorder.setDepth(3002);
    
    // Rarity text on card
    const rarityText = this.add.text(centerX, centerY - 50, rarity.toUpperCase(), {
      fontSize: '24px',
      color: outcome === 'win' ? '#44ff44' : '#ff4444',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    rarityText.setDepth(3003);
    
    // Spin animation
    this.tweens.add({
      targets: [card, cardBorder, rarityText],
      angle: 360,
      duration: 1000,
      ease: 'Cubic.easeInOut',
      onComplete: () => {
        // Success message
        const successText = this.add.text(centerX, centerY + 150, 
          `Successfully minted '${rarity}' ${outcome === 'win' ? 'Rainbow' : 'Binary'} card!`, {
          fontSize: '20px',
          color: '#ffd700',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        successText.setDepth(3004);
        
        // Sparkle effect
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2;
          const sparkle = this.add.circle(
            centerX + Math.cos(angle) * 150,
            centerY - 50 + Math.sin(angle) * 150,
            5,
            0xffd700,
            1
          );
          sparkle.setDepth(3005);
          
          this.tweens.add({
            targets: sparkle,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 800,
            onComplete: () => sparkle.destroy()
          });
        }
        
        // Close button after 2 seconds
        this.time.delayedCall(2000, () => {
          overlay.destroy();
          card.destroy();
          cardBorder.destroy();
          rarityText.destroy();
          successText.destroy();
        });
      }
    });
  }
}
