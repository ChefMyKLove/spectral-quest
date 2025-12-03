/**
 * DRONES
 * 
 * Two types of drones in the game:
 * 
 * 1. HARVESTER DRONE (passive)
 *    - Collects spectral energy and flies it to Maxim
 *    - Not hostile to Lirien
 *    - When destroyed, drops collected energy back into level
 *    - Each delivery grows the binary wrap
 * 
 * 2. HOSTILE DRONE (aggressive)
 *    - Chases Lirien
 *    - On contact: stuns Lirien and/or makes them drop motes
 *    - When destroyed, drops any stolen motes
 */

import Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';
import { GAME } from '../config/gameConfig';

// =============================================================================
// BASE DRONE CLASS
// =============================================================================

export abstract class BaseDrone extends Phaser.Physics.Arcade.Sprite {
  protected energyCarried: number = 0;
  protected maxEnergy: number = 50;
  protected speed: number = 80;
  protected isDestroyed: boolean = false;
  
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setDepth(45);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setBounce(0.5);
  }
  
  abstract update(time: number, delta: number): void;
  
  public takeDamage(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.onDestroyed();
  }
  
  protected abstract onDestroyed(): void;
  
  public getEnergyCarried(): number {
    return this.energyCarried;
  }
}

// =============================================================================
// HARVESTER DRONE
// =============================================================================

export class HarvesterDrone extends BaseDrone {
  private state: 'collecting' | 'returning' = 'collecting';
  private targetEnergy: Phaser.GameObjects.GameObject | null = null;
  private homeY: number;  // Y position to return to (bottom = Maxim)
  private collectRadius: number = 50;  // Close range collection
  private visualContainer!: Phaser.GameObjects.Container;
  private energyIndicator!: Phaser.GameObjects.Graphics;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'drone_harvester');
    
    this.speed = GAME.DRONE_HARVESTER_SPEED;
    this.homeY = GAME.ARENA_HEIGHT - 50;  // Bottom of arena (Maxim's position)
    this.maxEnergy = 15;  // Max 15 energy before returning
    
    // Create visual representation
    this.createVisuals();
  }
  
  private createVisuals(): void {
    // Main body - mechanical collector drone
    this.setScale(1.2);
    this.setTint(0x888888);
    
    // Energy indicator (shows how much energy collected)
    this.energyIndicator = this.scene.add.graphics();
    this.energyIndicator.setDepth(46);
  }
  
  update(time: number, delta: number): void {
    if (this.isDestroyed) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    if (this.state === 'collecting') {
      this.doCollecting(body);
    } else {
      this.doReturning(body);
    }
    
    // Update energy indicator position
    this.updateEnergyIndicator();
    
    // Bob up and down slightly
    this.y += Math.sin(time / 300) * 0.3;
  }
  
  private doCollecting(body: Phaser.Physics.Arcade.Body): void {
    // If full, return to Maxim
    if (this.energyCarried >= this.maxEnergy) {
      this.state = 'returning';
      return;
    }
    
    // Get energy particles from scene
    const scene = this.scene as any;
    const energyParticles = scene.energyParticles;
    
    if (energyParticles && energyParticles.getLength() > 0) {
      // Find closest energy particle
      let closest: Phaser.GameObjects.GameObject | null = null;
      let closestDist = Infinity;
      
      energyParticles.getChildren().forEach((particle: any) => {
        if (!particle.active) return;
        
        const dx = particle.x - this.x;
        const dy = particle.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < closestDist && dist < this.collectRadius) {
          closestDist = dist;
          closest = particle;
        }
      });
      
      if (closest) {
        // Move toward closest energy particle
        const dx = closest.x - this.x;
        const dy = closest.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 20) {
          // Collect it!
          this.collectEnergy(1);
          closest.destroy();
          if ((closest as any).glowEffect) {
            (closest as any).glowEffect.destroy();
          }
        } else {
          body.setVelocity(
            (dx / dist) * this.speed,
            (dy / dist) * this.speed
          );
        }
      } else {
        // No nearby energy - wander randomly
        if (Math.random() < 0.02) {
          const angle = Math.random() * Math.PI * 2;
          body.setVelocity(
            Math.cos(angle) * this.speed * 0.7,
            Math.sin(angle) * this.speed * 0.7
          );
        }
      }
    } else {
      // No energy particles - wander
      if (Math.random() < 0.02) {
        const angle = Math.random() * Math.PI * 2;
        body.setVelocity(
          Math.cos(angle) * this.speed * 0.7,
          Math.sin(angle) * this.speed * 0.7
        );
      }
    }
    
    // Stay above binary wrap
    const store = useGameStore.getState();
    const safeY = GAME.ARENA_HEIGHT * (1 - store.binaryWrapHeight) - 100;
    if (this.y > safeY) {
      body.setVelocityY(-this.speed);
    }
  }
  
  private doReturning(body: Phaser.Physics.Arcade.Body): void {
    // Fly toward the bottom (Maxim's position)
    const dx = GAME.ARENA_WIDTH / 2 - this.x;
    const dy = this.homeY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 50) {
      // Reached Maxim - deliver energy and grow binary wrap
      this.deliverEnergy();
    } else {
      // Move toward home (bottom center)
      body.setVelocity(
        (dx / dist) * this.speed * 1.5,
        (dy / dist) * this.speed * 1.5
      );
    }
  }
  
  private deliverEnergy(): void {
    // Deliver energy to Maxim
    const energyDelivered = this.energyCarried;
    useGameStore.getState().harvesterReachedMaxim();
    
    // Visual effect - energy absorbed by Maxim
    const flash = this.scene.add.circle(this.x, this.y, 30, 0xff0000, 0.6);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 3,
      scaleY: 3,
      duration: 400,
      onComplete: () => flash.destroy()
    });
    
    // Reset and respawn from bottom (Maxim launches new drone)
    this.energyCarried = 0;
    this.state = 'collecting';
    
    // Respawn from bottom center (Maxim's position)
    this.x = GAME.ARENA_WIDTH / 2;
    this.y = GAME.ARENA_HEIGHT - 80;
    
    // Launch animation
    this.scene.tweens.add({
      targets: this,
      y: GAME.ARENA_HEIGHT - 200,
      duration: 500,
      ease: 'Quad.easeOut'
    });
  }
  
  public onCollideWithLirien(): void {
    // Both drop energy when they collide
    if (this.energyCarried > 0) {
      // Drop half of collected energy
      const toDrop = Math.floor(this.energyCarried / 2);
      this.energyCarried -= toDrop;
      
      // Visual - energy particles scatter
      for (let i = 0; i < toDrop; i++) {
        const angle = (i / toDrop) * Math.PI * 2;
        const particle = this.scene.add.circle(
          this.x,
          this.y,
          4,
          0x00ff00,
          0.8
        );
        
        this.scene.tweens.add({
          targets: particle,
          x: this.x + Math.cos(angle) * 40,
          y: this.y + Math.sin(angle) * 40,
          alpha: 0,
          duration: 600,
          onComplete: () => particle.destroy()
        });
      }
    }
    
    // Bounce away
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(
      (Math.random() - 0.5) * 200,
      -100
    );
  }
  
  public collectEnergy(amount: number): void {
    this.energyCarried = Math.min(this.maxEnergy, this.energyCarried + amount);
    
    // If full, start returning
    if (this.energyCarried >= this.maxEnergy) {
      this.state = 'returning';
    }
  }
  
  private updateEnergyIndicator(): void {
    this.energyIndicator.clear();
    
    if (this.energyCarried > 0) {
      const fillPercent = this.energyCarried / this.maxEnergy;
      const barWidth = 20 * fillPercent;
      
      // Background
      this.energyIndicator.fillStyle(0x333333, 0.7);
      this.energyIndicator.fillRect(this.x - 10, this.y - 25, 20, 4);
      
      // Fill (green when collecting)
      this.energyIndicator.fillStyle(0x00ff00, 0.8);
      this.energyIndicator.fillRect(this.x - 10, this.y - 25, barWidth, 4);
    }
  }
  
  protected onDestroyed(): void {
    // Drop collected energy back into the level
    const store = useGameStore.getState();
    store.destroyHarvester();
    
    // Visual explosion
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = this.scene.add.circle(
        this.x,
        this.y,
        4,
        0x00ff00,
        0.8
      );
      
      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 50,
        y: this.y + Math.sin(angle) * 50,
        alpha: 0,
        duration: 500,
        onComplete: () => particle.destroy()
      });
    }
    
    // Clean up
    this.energyIndicator.destroy();
    this.destroy();
  }
}

// =============================================================================
// HOSTILE DRONE
// =============================================================================

export class HostileDrone extends BaseDrone {
  private target: Phaser.GameObjects.Sprite | null = null;
  private aggroRange: number = 300;
  private attackCooldown: number = 0;
  private stolenMotes: number = 0;
  private maxStolenMotes: number = 3;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'drone_hostile');
    
    this.speed = GAME.DRONE_HOSTILE_SPEED;
    
    // Hostile appearance
    this.setScale(1);
    this.setTint(0xff4444);
  }
  
  public setTarget(target: Phaser.GameObjects.Sprite): void {
    this.target = target;
  }
  
  update(time: number, delta: number): void {
    if (this.isDestroyed) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    const store = useGameStore.getState();
    
    // Cooldown timer
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }
    
    // ONLY chase if player has MORE than 1 mote
    if (this.target && this.target.active && store.motesCollected > 1) {
      this.chaseTarget(body);
    } else {
      // Don't chase if player has 1 or fewer motes
      this.patrol(body);
    }
    
    // Angry pulsing effect
    const pulse = 0.9 + Math.sin(time / 100) * 0.1;
    this.setScale(pulse);
    
    // Stay above binary wrap
    const safeY = GAME.ARENA_HEIGHT * (1 - store.binaryWrapHeight) - 50;
    if (this.y > safeY) {
      body.setVelocityY(-this.speed);
    }
  }
  
  private chaseTarget(body: Phaser.Physics.Arcade.Body): void {
    if (!this.target) return;
    
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Only chase if within aggro range
    if (dist > this.aggroRange) {
      this.patrol(body);
      return;
    }
    
    // Chase!
    const chaseSpeed = this.speed * 1.2;
    body.setVelocity(
      (dx / dist) * chaseSpeed,
      (dy / dist) * chaseSpeed
    );
    
    // Face the target
    this.setFlipX(dx < 0);
  }
  
  private patrol(body: Phaser.Physics.Arcade.Body): void {
    // Random wandering
    if (Math.random() < 0.01) {
      const angle = Math.random() * Math.PI * 2;
      body.setVelocity(
        Math.cos(angle) * this.speed * 0.5,
        Math.sin(angle) * this.speed * 0.5
      );
    }
  }
  
  public onHitPlayer(): boolean {
    // Called when colliding with player
    if (this.attackCooldown > 0) return false;
    
    this.attackCooldown = 2000;  // 2 second cooldown
    
    // Steal motes from player
    const store = useGameStore.getState();
    const motesToSteal = Math.min(2, store.motesCollected);
    
    if (motesToSteal > 0) {
      store.dropMotes(motesToSteal);
      this.stolenMotes = Math.min(this.maxStolenMotes, this.stolenMotes + motesToSteal);
    }
    
    // Visual attack effect
    const flash = this.scene.add.circle(this.x, this.y, 30, 0xff0000, 0.5);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      onComplete: () => flash.destroy()
    });
    
    return true;
  }
  
  protected onDestroyed(): void {
    const store = useGameStore.getState();
    store.destroyHostileDrone();
    
    // Visual explosion - red particles
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const particle = this.scene.add.circle(
        this.x,
        this.y,
        5,
        0xff0000,
        0.8
      );
      
      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 60,
        y: this.y + Math.sin(angle) * 60,
        alpha: 0,
        duration: 400,
        onComplete: () => particle.destroy()
      });
    }
    
    // Drop stolen motes as collectible items
    // (The scene will handle respawning these motes)
    this.scene.events.emit('droneDroppedMotes', {
      x: this.x,
      y: this.y,
      count: this.stolenMotes
    });
    
    this.destroy();
  }
}

