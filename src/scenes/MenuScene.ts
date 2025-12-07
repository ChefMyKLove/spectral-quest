import Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';
import { DIFFICULTIES } from '../config/gameConfig';
import type { Difficulty } from '../config/gameConfig';

export class MenuScene extends Phaser.Scene {
  private difficultyButtons: Map<Difficulty, Phaser.GameObjects.Text> = new Map();
  private selectedDifficulty: Difficulty = 'weaver';

  constructor() {
    super('MenuScene');
  }
  
  create() {
    // Title
    this.add.text(400, 80, 'SPECTRAL QUEST', {
      fontSize: '48px',
      color: '#00FFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // ========== DIFFICULTY SELECTION ==========
    this.add.text(400, 160, 'Select Difficulty', {
      fontSize: '28px',
      color: '#FFD700'
    }).setOrigin(0.5);

    // Create difficulty buttons
    const difficultyKeys: Difficulty[] = ['dreamer', 'weaver', 'dancer', 'master'];
    
    difficultyKeys.forEach((key, idx) => {
      const config = DIFFICULTIES[key];
      const y = 210 + idx * 65;
      
      // Main button
      const button = this.add.text(400, y, config.name, {
        fontSize: '22px',
        color: '#FFFFFF',
        backgroundColor: '#222222',
        padding: { x: 18, y: 8 }
      }).setOrigin(0.5).setInteractive();
      
      // Description text
      this.add.text(400, y + 26, config.description, {
        fontSize: '13px',
        color: '#888888'
      }).setOrigin(0.5);
      
      // Store button reference
      this.difficultyButtons.set(key, button);
      
      // Click handler
      button.on('pointerdown', () => {
        this.selectDifficulty(key);
      });
      
      // Hover effects - only if not selected
      button.on('pointerover', () => {
        if (this.selectedDifficulty !== key) {
          this.tweens.add({
            targets: button,
            scale: 1.08,
            duration: 150,
            ease: 'Quad.easeOut'
          });
          button.setStyle({ backgroundColor: '#444444' });
        }
      });
      
      button.on('pointerout', () => {
        if (this.selectedDifficulty !== key) {
          this.tweens.add({
            targets: button,
            scale: 1.0,
            duration: 150,
            ease: 'Quad.easeOut'
          });
          button.setStyle({ backgroundColor: '#222222' });
        }
      });
    });
    
    // Set initial selection visuals
    this.updateDifficultyButtons();
    
    // ========== SKIN SELECTION ==========
    this.add.text(400, 480, 'Choose Your Weaver', {
      fontSize: '28px',
      color: '#FF00FF'
    }).setOrigin(0.5);
    
    const skins = [
      { key: 'rainbow-activist', name: 'Rainbow Activist', bonus: '+10% Essence' },
      { key: 'crypto-bro', name: 'Crypto Bro', bonus: '5% Auto-Collect' },
      { key: 'covid-safe', name: 'COVID Safe', bonus: '1 Free Hit' },
      { key: 'brainrot-chad', name: 'Brainrot Chad', bonus: '+50 Start Essence' },
      { key: 'void-poet', name: 'Void Poet', bonus: 'See Hidden Shards' }
    ];
    
    skins.forEach((skin, index) => {
      const y = 540 + index * 60;
      
      const button = this.add.text(400, y, skin.name, {
        fontSize: '20px',
        color: '#FFFFFF',
        backgroundColor: '#333333',
        padding: { x: 15, y: 8 }
      }).setOrigin(0.5).setInteractive();
      
      this.add.text(400, y + 22, skin.bonus, {
        fontSize: '14px',
        color: '#FFD700'
      }).setOrigin(0.5);
      
      button.on('pointerdown', () => {
        // Start game with selected difficulty
        console.log('Starting game with difficulty:', this.selectedDifficulty);
        useGameStore.getState().startNewRun(this.selectedDifficulty);
        this.scene.start('CrimsonLayer');
      });
      
      button.on('pointerover', () => {
        this.tweens.add({
          targets: button,
          scale: 1.05,
          duration: 100,
          ease: 'Quad.easeOut'
        });
        button.setStyle({ backgroundColor: '#555555' });
      });
      
      button.on('pointerout', () => {
        this.tweens.add({
          targets: button,
          scale: 1.0,
          duration: 100,
          ease: 'Quad.easeOut'
        });
        button.setStyle({ backgroundColor: '#333333' });
      });
    });
  }
  
  private selectDifficulty(difficulty: Difficulty): void {
    const button = this.difficultyButtons.get(difficulty);
    if (!button) return;
    
    console.log('Difficulty selected:', difficulty);
    
    // Animate click
    this.tweens.add({
      targets: button,
      scale: 1.15,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        // Update selection after animation
        this.selectedDifficulty = difficulty;
        this.updateDifficultyButtons();
      }
    });
  }
  
  private updateDifficultyButtons(): void {
    // Update all button styles based on current selection
    this.difficultyButtons.forEach((button, key) => {
      if (key === this.selectedDifficulty) {
        // Selected state - cyan background, bold black text
        button.setStyle({ 
          backgroundColor: '#00FFFF', 
          color: '#000000',
          fontStyle: 'bold'
        });
        button.setScale(1.0);
      } else {
        // Unselected state - dark background, white text
        button.setStyle({ 
          backgroundColor: '#222222', 
          color: '#FFFFFF',
          fontStyle: 'normal'
        });
        button.setScale(1.0);
      }
    });
  }
}
