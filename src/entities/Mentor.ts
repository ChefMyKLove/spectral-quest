/**
 * MENTOR
 * 
 * The 7 Dancer unicorns who trained Lirien appear during their respective levels.
 * 
 * Behavior:
 * - Appears at random location
 * - Moves around randomly
 * - Stays for 10 seconds
 * - Flashes for last 2 seconds before disappearing
 * - On touch: +1 ORDINAL•RAINBOWS token, +5 seconds time
 * - First touch per level counts toward mentor streak (3 = extra life)
 * - Can appear multiple times per level
 */

import Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';
import { GAME, LEVELS } from '../config/gameConfig';

export class Mentor extends Phaser.GameObjects.Container {
  private levelIndex: number;
  private mentorName: string;
  private lifetime: number = GAME.MENTOR_DURATION * 1000;  // Convert to ms
  private flashTime: number = GAME.MENTOR_FLASH_TIME * 1000;
  private timeAlive: number = 0;
  private isFlashing: boolean = false;
  private isTouched: boolean = false;
  private moveTimer: number = 0;
  private velocity: { x: number; y: number } = { x: 0, y: 0 };
  
  // Visual elements
  private bodySprite!: Phaser.GameObjects.Ellipse;
  private headSprite!: Phaser.GameObjects.Circle;
  private hornSprite!: Phaser.GameObjects.Triangle;
  private glowSprite!: Phaser.GameObjects.Circle;
  private nameText!: Phaser.GameObjects.Text;
  private auraParticles: Phaser.GameObjects.Circle[] = [];
  
  constructor(scene: Phaser.Scene, x: number, y: number, levelIndex: number) {
    super(scene, x, y);
    
    this.levelIndex = levelIndex;
    this.mentorName = LEVELS[levelIndex].mentorName;
    
    scene.add.existing(this);
    
    // Create visuals
    this.createVisuals();
    
    // Set up physics body
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(30);
    body.setOffset(-30, -30);
    body.setImmovable(true);
    
    this.setDepth(70);
    
    // Start with entrance animation
    this.playEntranceAnimation();
    
    // Random initial movement
    this.setRandomVelocity();
  }
  
  private createVisuals(): void {
    const levelColor = Phaser.Display.Color.ValueToColor(LEVELS[this.levelIndex].color);
    const color = levelColor.color;
    
    // Outer glow
    this.glowSprite = this.scene.add.circle(0, 0, 45, color, 0.2);
    this.add(this.glowSprite);
    
    // Body (larger, majestic)
    this.bodySprite = this.scene.add.ellipse(0, 5, 50, 35, color);
    this.add(this.bodySprite);
    
    // Head
    this.headSprite = this.scene.add.circle(20, -10, 15, color);
    this.add(this.headSprite);
    
    // Horn (shining)
    this.hornSprite = this.scene.add.triangle(20, -35, 0, 20, 5, 0, 10, 20, 0xffffff);
    this.add(this.hornSprite);
    
    // Name label
    this.nameText = this.scene.add.text(0, 40, this.mentorName, {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.add(this.nameText);
    
    // Pulsing glow animation
    this.scene.tweens.add({
      targets: this.glowSprite,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.4,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    // Horn sparkle
    this.scene.tweens.add({
      targets: this.hornSprite,
      alpha: 0.7,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }
  
  private playEntranceAnimation(): void {
    // Start invisible and scale up
    this.setScale(0);
    this.setAlpha(0);
    
    // Dramatic entrance
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    // Spawn entrance particles
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const particle = this.scene.add.circle(
        this.x + Math.cos(angle) * 60,
        this.y + Math.sin(angle) * 60,
        5,
        Phaser.Display.Color.ValueToColor(LEVELS[this.levelIndex].color).color,
        0.8
      );
      
      this.scene.tweens.add({
        targets: particle,
        x: this.x,
        y: this.y,
        alpha: 0,
        duration: 500,
        onComplete: () => particle.destroy()
      });
    }
  }
  
  private setRandomVelocity(): void {
    const speed = 30 + Math.random() * 30;
    const angle = Math.random() * Math.PI * 2;
    this.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };
  }
  
  update(time: number, delta: number): void {
    this.timeAlive += delta;
    
    // Check for disappearing
    if (this.timeAlive >= this.lifetime) {
      this.disappear();
      return;
    }
    
    // Start flashing when close to disappearing
    const timeRemaining = this.lifetime - this.timeAlive;
    if (timeRemaining <= this.flashTime && !this.isFlashing) {
      this.startFlashing();
    }
    
    // Movement
    this.moveTimer += delta;
    if (this.moveTimer > 2000) {
      this.moveTimer = 0;
      this.setRandomVelocity();
    }
    
    // Apply movement
    this.x += this.velocity.x * (delta / 1000);
    this.y += this.velocity.y * (delta / 1000);
    
    // Bounce off edges
    const store = useGameStore.getState();
    const safeY = GAME.ARENA_HEIGHT * (1 - store.binaryWrapHeight) - 100;
    
    if (this.x < 50) { this.x = 50; this.velocity.x *= -1; }
    if (this.x > GAME.ARENA_WIDTH - 50) { this.x = GAME.ARENA_WIDTH - 50; this.velocity.x *= -1; }
    if (this.y < 100) { this.y = 100; this.velocity.y *= -1; }
    if (this.y > safeY) { this.y = safeY; this.velocity.y *= -1; }
    
    // Update physics body position
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.position.set(this.x - 30, this.y - 30);
    }
    
    // Spawn trailing aura particles
    if (Math.random() > 0.7 && !this.isFlashing) {
      this.spawnAuraParticle();
    }
  }
  
  private spawnAuraParticle(): void {
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 20;
    
    const particle = this.scene.add.circle(
      this.x + Math.cos(angle) * dist,
      this.y + Math.sin(angle) * dist,
      3,
      Phaser.Display.Color.ValueToColor(LEVELS[this.levelIndex].color).color,
      0.6
    );
    
    this.scene.tweens.add({
      targets: particle,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      y: particle.y - 20,
      duration: 800,
      onComplete: () => particle.destroy()
    });
  }
  
  private startFlashing(): void {
    this.isFlashing = true;
    
    // Flash effect
    this.scene.tweens.add({
      targets: [this.bodySprite, this.headSprite, this.glowSprite],
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: -1
    });
    
    // Name text warns
    this.nameText.setText(this.mentorName + ' (leaving!)');
    this.nameText.setColor('#ff8800');
  }
  
  public onTouched(): void {
    if (this.isTouched) return;
    this.isTouched = true;
    
    // Give rewards
    useGameStore.getState().touchMentor();
    
    // Visual celebration
    this.playTouchAnimation();
    
    // Disappear after being touched (this appearance is done)
    this.scene.time.delayedCall(500, () => {
      this.disappear();
    });
  }
  
  private playTouchAnimation(): void {
    // Burst of rainbow particles
    const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0x8800ff, 0xff00ff];
    
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const color = colors[i % colors.length];
      const particle = this.scene.add.circle(this.x, this.y, 6, color, 1);
      
      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 100,
        y: this.y + Math.sin(angle) * 100,
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 600,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy()
      });
    }
    
    // Show reward text
    const rewardText = this.scene.add.text(this.x, this.y - 60, '+1 🌈 TOKEN\n+5 SECONDS', {
      fontSize: '16px',
      color: '#ffd700',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: rewardText,
      y: rewardText.y - 50,
      alpha: 0,
      duration: 1500,
      onComplete: () => rewardText.destroy()
    });
    
    // Scale up briefly
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 200,
      yoyo: true
    });
  }
  
  private disappear(): void {
    // Exit animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 300,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.destroy();
      }
    });
    
    // Exit particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = this.scene.add.circle(
        this.x,
        this.y,
        4,
        Phaser.Display.Color.ValueToColor(LEVELS[this.levelIndex].color).color,
        0.8
      );
      
      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 80,
        y: this.y + Math.sin(angle) * 80,
        alpha: 0,
        duration: 400,
        onComplete: () => particle.destroy()
      });
    }
  }
  
  public getMentorName(): string {
    return this.mentorName;
  }
}

