import Phaser from 'phaser';
import { useGameState } from '../store/gameState';

export class ChronicleScene extends Phaser.Scene {
  private chronicleData: any;
  private nextLayer: number = 0;
  private gameComplete: boolean = false;
  
  constructor() {
    super('ChronicleScene');
  }
  
  init(data: any) {
    this.chronicleData = data.chronicleData;
    this.nextLayer = data.nextLayer || 0;
    this.gameComplete = data.gameComplete || false;
  }
  
  create() {
    this.add.rectangle(400, 300, 800, 600, 0x000000);
    
    if (this.gameComplete) {
      this.showGameComplete();
    } else {
      this.showChroniclePrompt();
    }
  }
  
  private showChroniclePrompt() {
    this.add.text(400, 100, '🌈 Weave Chronicle Created', {
      fontSize: '36px',
      color: '#FF00FF'
    }).setOrigin(0.5);
    
    // Chronicle preview
    const preview = this.add.container(400, 250);
    
    preview.add(this.add.text(0, -50, `Layer ${this.chronicleData.layer}`, {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5));
    
    preview.add(this.add.text(0, 0, `Time: ${this.chronicleData.time}s`, {
      fontSize: '20px',
      color: '#FFD700'
    }).setOrigin(0.5));
    
    preview.add(this.add.text(0, 30, `Shards: ${this.chronicleData.shards}`, {
      fontSize: '20px',
      color: '#00FFFF'
    }).setOrigin(0.5));
    
    preview.add(this.add.text(0, 60, `Essence: ${this.chronicleData.essence}`, {
      fontSize: '20px',
      color: '#FFD700'
    }).setOrigin(0.5));
    
    // Mint options (placeholder for now)
    this.add.text(400, 400, 'NFT Minting Coming Soon!', {
      fontSize: '20px',
      color: '#888888'
    }).setOrigin(0.5);
    
    // Continue button
    const continueBtn = this.add.text(400, 500, 'Continue to Next Layer', {
      fontSize: '24px',
      color: '#FFFFFF',
      backgroundColor: '#00FF00',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive();
    
    continueBtn.on('pointerdown', () => {
      useGameState.getState().resetForNewLayer();
      
      // Map layer number to scene key
      const layerScenes = [
        'CrimsonLayer',
        'AmberLayer',
        'YellowLayer', 
        'GreenLayer',
        'BlueLayer',
        'IndigoLayer',
        'VioletLayer'
      ];
      
      const nextScene = layerScenes[this.nextLayer - 1];
      if (nextScene) {
        this.scene.start(nextScene);
      }
    });
  }
  
  private showGameComplete() {
    this.add.text(400, 100, '🎊 SPECTRUM RESTORED! 🎊', {
      fontSize: '48px',
      color: '#FF00FF'
    }).setOrigin(0.5);
    
    this.add.text(400, 200, 'You have completed all 7 layers!', {
      fontSize: '28px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    const state = useGameState.getState();
    const totalTime = state.chronicles.reduce((sum, c) => sum + c.time, 0);
    
    this.add.text(400, 280, `Total Time: ${totalTime}s`, {
      fontSize: '24px',
      color: '#FFD700'
    }).setOrigin(0.5);
    
    this.add.text(400, 320, `Total Shards: ${state.chronicles.reduce((sum, c) => sum + c.shards, 0)}`, {
      fontSize: '24px',
      color: '#00FFFF'
    }).setOrigin(0.5);
    
    this.add.text(400, 400, '✨ Prismatic Core NFT ✨', {
      fontSize: '32px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    this.add.text(400, 450, 'Minting Coming Soon!', {
      fontSize: '20px',
      color: '#888888'
    }).setOrigin(0.5);
    
    // Play again button
    const playAgainBtn = this.add.text(400, 520, 'Play Again', {
      fontSize: '24px',
      color: '#FFFFFF',
      backgroundColor: '#00FF00',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive();
    
    playAgainBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}