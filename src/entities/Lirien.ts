import Phaser from 'phaser';
import { useGameState } from '../store/gameState';
import { PLAYER_SPEED } from '../config/physics';

export class Lirien extends Phaser.Physics.Arcade.Sprite {
  private carpetTrail: Phaser.GameObjects.Graphics;
  private keys: any;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'lirien');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setCollideWorldBounds(true);
    this.setScale(1);
    
    // Rainbow carpet trail
    this.carpetTrail = scene.add.graphics();
    
    // Input
    this.keys = scene.input.keyboard?.addKeys('W,A,S,D,SPACE');
  }
  
  update(delta: number) {
    // Movement
    this.setVelocity(0, 0);
    
    if (this.keys.W?.isDown) {
      this.setVelocityY(-PLAYER_SPEED);
    }
    if (this.keys.S?.isDown) {
      this.setVelocityY(PLAYER_SPEED);
    }
    if (this.keys.A?.isDown) {
      this.setVelocityX(-PLAYER_SPEED);
    }
    if (this.keys.D?.isDown) {
      this.setVelocityX(PLAYER_SPEED);
    }
    
    // Carpet trail (drains essence)
    const state = useGameState.getState();
    if (state.essence > 0) {
      state.drainEssence(delta * 0.05);
      this.drawCarpetTrail();
    }
  }
  
  private drawCarpetTrail() {
    const trail = this.scene.add.circle(
      this.x,
      this.y + 40,
      8,
      Phaser.Display.Color.HSVToRGB(Math.random(), 1, 1).color
    );
    
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      y: '+=100',
      duration: 800,
      onComplete: () => trail.destroy()
    });
  }
}