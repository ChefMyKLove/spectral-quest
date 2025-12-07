import Phaser from 'phaser';
import { useGameState } from '../store/gameState';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }
  
  create() {
    this.add.text(400, 100, 'Choose Your Weaver', {
      fontSize: '32px',
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
      const y = 200 + index * 80;
      
      const button = this.add.text(400, y, skin.name, {
        fontSize: '24px',
        color: '#FFFFFF',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive();
      
      this.add.text(400, y + 25, skin.bonus, {
        fontSize: '16px',
        color: '#FFD700'
      }).setOrigin(0.5);
      
      button.on('pointerdown', () => {
        useGameState.getState().selectedSkin = skin.key;
        this.scene.start('CrimsonLayer');
      });
      
      button.on('pointerover', () => {
        button.setStyle({ backgroundColor: '#555555' });
      });
      
      button.on('pointerout', () => {
        button.setStyle({ backgroundColor: '#333333' });
      });
    });

    // Difficulty selection UI
    this.add.text(400, 500, 'Select Difficulty', {
      fontSize: '28px',
      color: '#00FFFF'
    }).setOrigin(0.5);

    const difficulties = [
      { key: 'dreamer', name: 'Dreamer' },
      { key: 'weaver', name: 'Weaver' },
      { key: 'dancer', name: 'Dancer' },
      { key: 'master', name: 'Master' }
    ];

    difficulties.forEach((diff, idx) => {
      const y = 550 + idx * 50;
      const diffButton = this.add.text(400, y, diff.name, {
        fontSize: '22px',
        color: '#FFFFFF',
        backgroundColor: '#222222',
        padding: { x: 18, y: 8 }
      }).setOrigin(0.5).setInteractive();

      diffButton.on('pointerdown', () => {
        useGameState.getState().setDifficulty(diff.key);
        diffButton.setStyle({ backgroundColor: '#00FFFF', color: '#222222' });
      });
      diffButton.on('pointerover', () => {
        diffButton.setStyle({ backgroundColor: '#444444' });
      });
      diffButton.on('pointerout', () => {
        diffButton.setStyle({ backgroundColor: '#222222' });
      });
    });
  }
}