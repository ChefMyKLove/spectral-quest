import Phaser from 'phaser';
import { useGameState } from '../store/gameState';
import { SHARD_COLLECT_RADIUS } from '../config/physics';

export class Shard extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'shard');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setScale(1);
    
    // Spinning animation
    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });
    
    // Glow pulse
    scene.tweens.add({
      targets: this,
      scale: 1.2,
      duration: 1000,
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
    
    if (distance < SHARD_COLLECT_RADIUS) {
      this.collect();
    }
  }
  
  private collect() {
    useGameState.getState().addShard();
    
    // Collection effect
    this.scene.tweens.add({
      targets: this,
      scale: 3,
      alpha: 0,
      y: this.y - 100,
      duration: 500,
      onComplete: () => this.destroy()
    });
  }
}