import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }
  
  preload() {
    // Loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);
    
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xFF00FF, 1);
      progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
    });
    
    // Load placeholder assets (replace with real ones later)
    this.load.image('lirien', 'https://via.placeholder.com/64/FF69B4/FFFFFF?text=🦄');
    this.load.image('essence', 'https://via.placeholder.com/8/FFD700/000000?text=*');
    this.load.image('shard', 'https://via.placeholder.com/16/00FFFF/000000?text=◆');
    
    // Layer backgrounds
    this.load.image('bg-crimson', 'https://via.placeholder.com/800x2400/DC143C/000000?text=CRIMSON');
    this.load.image('bg-amber', 'https://via.placeholder.com/800x2400/FF8C00/000000?text=AMBER');
    this.load.image('bg-yellow', 'https://via.placeholder.com/800x2400/FFD700/000000?text=YELLOW');
    this.load.image('bg-green', 'https://via.placeholder.com/800x2400/32CD32/000000?text=GREEN');
    this.load.image('bg-blue', 'https://via.placeholder.com/800x2400/1E90FF/000000?text=BLUE');
    this.load.image('bg-indigo', 'https://via.placeholder.com/800x2400/4B0082/000000?text=INDIGO');
    this.load.image('bg-violet', 'https://via.placeholder.com/800x2400/8B00FF/000000?text=VIOLET');
  }
  
  create() {
    // Show lore splash
    this.add.text(400, 200, 'SPECTRAL QUEST', {
      fontSize: '48px',
      color: '#FF00FF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    this.add.text(400, 300, 'RAINBOW CRAFT', {
      fontSize: '32px',
      color: '#00FFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    this.add.text(400, 400, 'Cast the carpet. Reweave the light.', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    this.add.text(400, 500, 'Click to Start', {
      fontSize: '24px',
      color: '#FFD700',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    this.input.once('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}