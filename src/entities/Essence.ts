import Phaser from 'phaser';
import { useGameState } from '../store/gameState';
import { ESSENCE_COLLECT_RADIUS } from '../config/physics';

export class Essence extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'essence');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setScale(0.5);
    
    // Gentle float animation
    scene.tweens.add({
      targets: this,
      y: y - 20,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  checkCollision(player: Phaser.Physics.Arcade.Sprite) {
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      player.x, player.y
    );
    
    if (distance < ESSENCE_COLLECT_RADIUS) {
      this.collect();
    }
  }
  
  private collect() {
    useGameState.getState().addEssence(5);
    
    // Collection effect
    this.scene.tweens.add({
      targets: this,
      scale: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => this.destroy()
    });
  }
}