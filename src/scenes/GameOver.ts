/**
 * GAME OVER SCENE
 * 
 * Rounded aesthetic, but somber colors for the loss.
 */

import Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';
import { GAME } from '../config/gameConfig';

export class GameOver extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }
  
  create(): void {
    const centerX = GAME.ARENA_WIDTH / 2;
    const store = useGameStore.getState();
    
    // Dark gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2a1a1a, 0x2a1a1a, 0x1a0a0a, 0x1a0a0a);
    bg.fillRect(0, 0, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
    
    // Somber floating particles
    this.createSomberParticles();
    
    // Main content card - rounded
    const card = this.add.graphics();
    card.fillStyle(0x000000, 0.8);
    card.fillRoundedRect(centerX - 300, 40, 600, 460, 25);
    card.lineStyle(3, 0xff4444, 0.6);
    card.strokeRoundedRect(centerX - 300, 40, 600, 460, 25);
    
    // Game Over text
    this.add.text(centerX, 85, '💀 GAME OVER 💀', {
      fontSize: '36px',
      color: '#ff4444',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Run summary in rounded pills
    const summaryY = 140;
    const completedLevels = store.completedLevels.length;
    const tokensEarned = store.tokensThisRun;
    
    const summaryItems = [
      { label: 'Levels Completed', value: completedLevels.toString(), color: '#ffaaaa' },
      { label: 'ORDINAL•RAINBOWS', value: tokensEarned.toString() + ' 🌈', color: '#ffd700' },
      { label: 'Cards Generated', value: completedLevels.toString(), color: '#aaaaff' },
    ];
    
    summaryItems.forEach((item, index) => {
      const y = summaryY + index * 45;
      
      const pill = this.add.graphics();
      pill.fillStyle(0x331111, 0.9);
      pill.fillRoundedRect(centerX - 180, y - 15, 360, 35, 17);
      
      this.add.text(centerX - 160, y, item.label + ':', {
        fontSize: '15px',
        color: '#888888'
      }).setOrigin(0, 0.5);
      
      this.add.text(centerX + 160, y, item.value, {
        fontSize: '15px',
        color: item.color,
        fontStyle: 'bold'
      }).setOrigin(1, 0.5);
    });
    
    // Last level stats
    if (store.completedLevels.length > 0) {
      const lastLevel = store.completedLevels[store.completedLevels.length - 1];
      
      const lastY = summaryY + summaryItems.length * 45 + 30;
      
      this.add.text(centerX, lastY, 'Final Attempt Stats', {
        fontSize: '14px',
        color: '#666666'
      }).setOrigin(0.5);
      
      const lastStats = [
        `Time Survived: ${Math.floor(lastLevel.timeSurvived)}s`,
        `Motes: ${lastLevel.motesCollected}/${lastLevel.motesTotal}`,
        `Drones: ${lastLevel.harvestersDestroyed + lastLevel.hostileDronesDestroyed}`,
      ];
      
      this.add.text(centerX, lastY + 25, lastStats.join('  •  '), {
        fontSize: '12px',
        color: '#888888'
      }).setOrigin(0.5);
      
      // Defiant badges
      const defiantBadges = lastLevel.badges.filter(b => 
        ['last_breath', 'drone_denial', 'cartographer', 'partial_harmony', 'defiant_ultimate'].includes(b)
      );
      
      if (defiantBadges.length > 0) {
        this.add.text(centerX, lastY + 55, '⚔️ Defiant: ' + defiantBadges.join(', '), {
          fontSize: '13px',
          color: '#ff8844'
        }).setOrigin(0.5);
      }
    }
    
    // Binary card box - rounded
    const cardBoxY = 380;
    const cardBox = this.add.graphics();
    cardBox.fillStyle(0x221122, 0.9);
    cardBox.fillRoundedRect(centerX - 150, cardBoxY, 300, 70, 15);
    cardBox.lineStyle(2, 0x664466, 1);
    cardBox.strokeRoundedRect(centerX - 150, cardBoxY, 300, 70, 15);
    
    this.add.text(centerX, cardBoxY + 20, '🃏 BINARY CARD GENERATED', {
      fontSize: '14px',
      color: '#aa88aa'
    }).setOrigin(0.5);
    
    this.add.text(centerX, cardBoxY + 45, '(Lose cards can be powerful too!)', {
      fontSize: '11px',
      color: '#666666'
    }).setOrigin(0.5);
    
    // Get rarity from last level
    const lastLevelRarity = store.completedLevels.length > 0 
      ? store.completedLevels[store.completedLevels.length - 1].finalRarity 
      : 'common';
    
    // Mint button
    const mintButtonY = 460;
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
      this.showMintAnimation('lose', lastLevelRarity);
    });
    
    // Return to menu button - rounded
    const buttonY = 530;
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x664444, 1);
    buttonBg.fillRoundedRect(centerX - 120, buttonY - 22, 240, 44, 22);
    
    const buttonText = this.add.text(centerX, buttonY, 'RETURN TO MENU', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif'
    }).setOrigin(0.5);
    
    const hitArea = this.add.rectangle(centerX, buttonY, 240, 44, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x885555, 1);
      buttonBg.fillRoundedRect(centerX - 120, buttonY - 22, 240, 44, 22);
    });
    
    hitArea.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x664444, 1);
      buttonBg.fillRoundedRect(centerX - 120, buttonY - 22, 240, 44, 22);
    });
    
    hitArea.on('pointerdown', () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenu');
      });
    });
  }
  
  private createSomberParticles(): void {
    const colors = [0x442222, 0x332222, 0x443333];
    
    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(30, GAME.ARENA_WIDTH - 30);
      const y = Phaser.Math.Between(30, GAME.VIEWPORT_HEIGHT - 30);
      const radius = Phaser.Math.Between(5, 15);
      const color = colors[i % colors.length];
      
      const particle = this.add.circle(x, y, radius, color, 0.3);
      
      // Slow downward drift
      this.tweens.add({
        targets: particle,
        y: y + Phaser.Math.Between(20, 50),
        alpha: 0.1,
        duration: Phaser.Math.Between(4000, 6000),
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
