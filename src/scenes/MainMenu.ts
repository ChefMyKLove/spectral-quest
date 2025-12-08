/**
 * MAIN MENU SCENE
 * 
 * Bubbly, rounded aesthetic with rainbow vibes.
 */

import Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';
import { GAME, DIFFICULTIES, LEVELS } from '../config/gameConfig';
import type { Difficulty } from '../config/gameConfig';
import { initializeWallet, getWallet, resetWallet } from '../systems/bsv/walletAdapter';
import { BSV_CONFIG } from '../systems/bsv/config';

export class MainMenu extends Phaser.Scene {
  private selectedDifficulty: Difficulty = 'weaver';
  private difficultyButtons: Map<Difficulty, Phaser.GameObjects.Container> = new Map();
  private bubbles: Phaser.GameObjects.Arc[] = [];
  private walletStatusText?: Phaser.GameObjects.Text;
  private walletConnected: boolean = false;
  
  constructor() {
    super('MainMenu');
  }
  
  private backgroundCycleIndex: number = 0;
  private backgroundImage?: Phaser.GameObjects.Image;
  private backgroundImageNext?: Phaser.GameObjects.Image;
  private backgroundImageKeys: string[] = [
    'bg_hummingbow',
    'bg_6794',
    'bg_6795',
    'bg_6796',
    'bg_6797',
    'bg_tunnelbow',
    'bg_6906',
    'bg_6907',
    'bg_6908',
    'bg_6909',
    'bg_6910',
    'bg_6911',
    'bg_6912'
  ];
  
  async create(): Promise<void> {
    const centerX = GAME.ARENA_WIDTH / 2;
    
    this.initializeBSVWallet();
    this.createCyclingBackground();
    this.createBubbles();
    
    const title = this.add.text(centerX, 70, 'SPECTRAL QUEST', {
      fontSize: '44px',
      fontFamily: 'Arial Rounded MT Bold, Helvetica, Arial, sans-serif',
      color: '#ffffff',
      stroke: '#6644aa',
      strokeThickness: 6
    });
    title.setOrigin(0.5);
    
    this.tweens.addCounter({
      from: 0,
      to: 360,
      duration: 3000,
      repeat: -1,
      onUpdate: (tween) => {
        const hue = tween.getValue();
        const color = Phaser.Display.Color.HSLToColor(hue / 360, 0.7, 0.8);
        title.setTint(color.color);
      }
    });
    
    this.add.text(centerX, 120, '✨ Rainbow Craft ✨', {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#bbaadd',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    this.add.text(centerX, 175, 'Choose Your Challenge', {
      fontSize: '16px',
      color: '#8888aa'
    }).setOrigin(0.5);
    
    const difficulties: Difficulty[] = ['dreamer', 'weaver', 'dancer', 'master'];
    const buttonWidth = 160;
    const buttonSpacing = 15;
    const totalWidth = difficulties.length * buttonWidth + (difficulties.length - 1) * buttonSpacing;
    const startX = centerX - totalWidth / 2 + buttonWidth / 2;
    
    difficulties.forEach((diff, index) => {
      const x = startX + index * (buttonWidth + buttonSpacing);
      const button = this.createRoundedButton(x, 245, diff);
      this.difficultyButtons.set(diff, button);
    });
    
    this.selectDifficulty('weaver');
    
    const startButton = this.createStartButton(centerX, 380);
    
    const controlsBg = this.add.graphics();
    controlsBg.fillStyle(0x000000, 0.3);
    controlsBg.fillRoundedRect(centerX - 200, 470, 400, 35, 17);
    
    this.add.text(centerX, 487, 'WASD: Move  •  Space: Shoot  •  Mouse: Aim', {
      fontSize: '13px',
      color: '#aaaacc'
    }).setOrigin(0.5);
    
    const walletButton = this.createPillButton(centerX, 540, '🔗 Connect Wallet', 0x3366aa);
    walletButton.on('pointerdown', async () => {
      await this.handleWalletConnection();
    });
    
    this.walletStatusText = this.add.text(centerX, 580, '🔗 Wallet: Not Connected', {
      fontSize: '12px',
      color: '#ff8888'
    }).setOrigin(0.5);
    
    this.add.text(GAME.ARENA_WIDTH - 15, GAME.VIEWPORT_HEIGHT - 15, 'v0.1.0', {
      fontSize: '11px',
      color: '#555577'
    }).setOrigin(1, 1);
    
    this.createTestModeSelector(centerX);
    
    const keyT = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.T);
    keyT?.on('down', () => {
      const testMode = this.children.getByName('testModeContainer');
      if (testMode) {
        testMode.setVisible(!testMode.visible);
      }
    });
  }
  
  private createTestModeSelector(centerX: number): void {
    const container = this.add.container(centerX, 300);
    container.setName('testModeContainer');
    container.setVisible(false);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRoundedRect(-200, -120, 400, 240, 20);
    bg.lineStyle(3, 0xffff00, 0.8);
    bg.strokeRoundedRect(-200, -120, 400, 240, 20);
    
    const title = this.add.text(0, -100, '🧪 TEST MODE 🧪', {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const subtitle = this.add.text(0, -70, 'Select Level to Test', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    
    const levelNames = [
      'Crimson', 'Amber', 'Yellow', 'Green',
      'Blue', 'Indigo', 'Violet', 'All'
    ];
    const levelKeys = [
      'CrimsonLevel', 'AmberLevel', 'YellowLevel', 'GreenLevel',
      'BlueLevel', 'IndigoLevel', 'VioletLevel', null
    ];
    
    const buttonWidth = 80;
    const buttonHeight = 35;
    const spacing = 15;
    const startX = -((buttonWidth + spacing) * 2 - spacing) / 2;
    
    levelNames.forEach((name, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      const x = startX + col * (buttonWidth + spacing);
      const y = -30 + row * (buttonHeight + spacing);
      
      const buttonBg = this.add.graphics();
      buttonBg.fillStyle(0x333333, 1);
      buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 8);
      buttonBg.lineStyle(2, 0x666666, 1);
      buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 8);
      
      const buttonText = this.add.text(x, y, name, {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0.5);
      
      const hitArea = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      
      hitArea.on('pointerover', () => {
        buttonBg.clear();
        buttonBg.fillStyle(0x555555, 1);
        buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 8);
        buttonBg.lineStyle(2, 0x888888, 1);
        buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 8);
      });
      
      hitArea.on('pointerout', () => {
        buttonBg.clear();
        buttonBg.fillStyle(0x333333, 1);
        buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 8);
        buttonBg.lineStyle(2, 0x666666, 1);
        buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 8);
      });
      
      hitArea.on('pointerdown', () => {
        if (levelKeys[index] === null) {
          useGameStore.getState().startLevel(0);
          this.scene.start('CrimsonLevel');
        } else {
          const levelIndex = index;
          useGameStore.getState().startLevel(levelIndex);
          this.scene.start(levelKeys[index]!);
        }
      });
      
      container.add([buttonBg, buttonText, hitArea]);
    });
    
    const hint = this.add.text(0, 80, 'Press T to toggle test mode', {
      fontSize: '11px',
      color: '#888888',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    container.add([bg, title, subtitle, hint]);
    container.setDepth(1000);
  }
  
  private createCyclingBackground(): void {
    const firstKey = this.backgroundImageKeys[0];
    if (!this.textures.exists(firstKey)) {
      console.warn('Background images not loaded, using fallback gradient');
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x1a0a2a, 0x1a0a2a, 0x0a1a2a, 0x0a1a2a);
      bg.fillRect(0, 0, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
      return;
    }
    
    this.backgroundImage = this.add.image(
      GAME.ARENA_WIDTH / 2,
      GAME.VIEWPORT_HEIGHT / 2,
      firstKey
    );
    this.setImageToCoverViewport(this.backgroundImage, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
    this.backgroundImage.setDepth(-100);
    this.backgroundImage.setAlpha(1);
    
    const secondKey = this.backgroundImageKeys[1];
    this.backgroundImageNext = this.add.image(
      GAME.ARENA_WIDTH / 2,
      GAME.VIEWPORT_HEIGHT / 2,
      secondKey
    );
    this.setImageToCoverViewport(this.backgroundImageNext, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
    this.backgroundImageNext.setDepth(-101);
    this.backgroundImageNext.setAlpha(0);
    
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.2);
    overlay.fillRect(0, 0, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
    overlay.setDepth(-99);
    
    this.time.addEvent({
      delay: 8000,
      callback: () => {
        this.backgroundCycleIndex = (this.backgroundCycleIndex + 1) % this.backgroundImageKeys.length;
        const nextKey = this.backgroundImageKeys[this.backgroundCycleIndex];
        
        if (!this.textures.exists(nextKey)) {
          console.warn(`Background image ${nextKey} not found, skipping`);
          return;
        }
        
        if (this.backgroundImageNext) {
          this.backgroundImageNext.setTexture(nextKey);
          this.setImageToCoverViewport(this.backgroundImageNext, GAME.ARENA_WIDTH, GAME.VIEWPORT_HEIGHT);
          this.backgroundImageNext.setDepth(-100);
          this.backgroundImageNext.setAlpha(0);
          
          this.tweens.add({
            targets: this.backgroundImage,
            alpha: 0,
            duration: 2000,
            ease: 'Sine.easeInOut'
          });
          
          this.tweens.add({
            targets: this.backgroundImageNext,
            alpha: 1,
            duration: 2000,
            ease: 'Sine.easeInOut',
            onComplete: () => {
              const temp = this.backgroundImage;
              this.backgroundImage = this.backgroundImageNext;
              this.backgroundImageNext = temp;
              if (this.backgroundImageNext) {
                this.backgroundImageNext.setDepth(-101);
              }
            }
          });
        }
      },
      callbackScope: this,
      loop: true
    });
  }
  
  private createBubbles(): void {
    const colors = [0xff6b9d, 0xffa06b, 0xffd93d, 0x6bcf6b, 0x6bb5ff, 0x9b6bff, 0xff6bdb];
    
    for (let i = 0; i < 35; i++) {
      const x = Phaser.Math.Between(30, GAME.ARENA_WIDTH - 30);
      const y = Phaser.Math.Between(30, GAME.VIEWPORT_HEIGHT - 30);
      const radius = Phaser.Math.Between(15, 45);
      const color = colors[i % colors.length];
      
      const bubble = this.add.circle(x, y, radius, color, 0.2);
      const shine = this.add.circle(x - radius * 0.3, y - radius * 0.3, radius * 0.2, 0xffffff, 0.4);
      
      const innerRadius = radius * 0.6;
      const innerBubble = this.add.circle(x, y, innerRadius, color, 0.15);
      const innerShine = this.add.circle(x - innerRadius * 0.3, y - innerRadius * 0.3, innerRadius * 0.2, 0xffffff, 0.3);
      
      const tinyRadius = innerRadius * 0.5;
      const tinyBubble = this.add.circle(x + radius * 0.2, y + radius * 0.2, tinyRadius, color, 0.25);
      
      this.bubbles.push(bubble);
      
      const floatDuration = Phaser.Math.Between(3000, 6000);
      this.tweens.add({
        targets: [bubble, shine, innerBubble, innerShine, tinyBubble],
        y: y - Phaser.Math.Between(20, 50),
        x: x + Phaser.Math.Between(-20, 20),
        duration: floatDuration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      this.tweens.add({
        targets: [innerBubble, tinyBubble],
        scaleX: 1.1,
        scaleY: 1.1,
        duration: floatDuration * 0.8,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
  
  private createRoundedButton(x: number, y: number, difficulty: Difficulty): Phaser.GameObjects.Container {
    const config = DIFFICULTIES[difficulty];
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    this.createGlassmorphismButton(bg, -75, -45, 150, 90, 20);
    
    const nameText = this.add.text(0, -15, config.name, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const descText = this.add.text(0, 15, config.description, {
      fontSize: '10px',
      color: '#aaaacc',
      align: 'center',
      wordWrap: { width: 130 }
    }).setOrigin(0.5);
    
    container.add([bg, nameText, descText]);
    container.setInteractive(new Phaser.Geom.Rectangle(-75, -45, 150, 90), Phaser.Geom.Rectangle.Contains);
    
    (container as any).bgGraphics = bg;
    (container as any).nameText = nameText;
    
    this.time.addEvent({
      delay: 8000,
      callback: () => {
        if (this.selectedDifficulty !== difficulty) {
          bg.clear();
          this.createGlassmorphismButton(bg, -75, -45, 150, 90, 20);
        }
      },
      callbackScope: this,
      loop: true
    });
    
    container.on('pointerover', () => {
      if (this.selectedDifficulty !== difficulty) {
        this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 });
      }
    });
    
    container.on('pointerout', () => {
      if (this.selectedDifficulty !== difficulty) {
        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
      }
    });
    
    container.on('pointerdown', () => {
      console.log(`[MainMenu] Button clicked: ${difficulty}`);
      this.selectDifficulty(difficulty);
    });
    
    return container;
  }
  
  private createGlassmorphismButton(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number, radius: number): void {
    graphics.fillStyle(0x000000, 0.5);
    graphics.fillRoundedRect(x, y, width, height, radius);
    
    const cycleColor = this.getCurrentCycleColor();
    graphics.fillStyle(cycleColor, 0.3);
    graphics.fillRoundedRect(x + 2, y + 2, width - 4, height - 4, radius - 2);
    
    graphics.lineStyle(2, 0x667eea, 0.6);
    graphics.strokeRoundedRect(x, y, width, height, radius);
    
    graphics.fillStyle(0xffffff, 0.1);
    graphics.fillRoundedRect(x + 2, y + 2, width - 4, height * 0.3, radius - 2);
  }
  
  private getCurrentCycleColor(): number {
    const colors = [
      0x8B4513, 0x2F4F4F, 0x556B2F, 0x483D8B, 0x8B008B, 0x191970, 0x2E8B57,
      0x8B4513, 0x4B0082, 0x800080, 0x2F4F4F, 0x556B2F, 0x8B4513
    ];
    return colors[this.backgroundCycleIndex % colors.length];
  }
  
  private createStartButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    this.createGlassmorphismButton(bg, -110, -35, 220, 70, 35);
    
    const cycleColor = this.getCurrentCycleColor();
    bg.fillStyle(cycleColor, 0.4);
    bg.fillRoundedRect(-105, -32, 210, 35, 30);
    
    const text = this.add.text(0, 0, 'START', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    container.add([bg, text]);
    container.setInteractive(new Phaser.Geom.Rectangle(-110, -35, 220, 70), Phaser.Geom.Rectangle.Contains);
    
    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scaleX: 1.08, scaleY: 1.08, duration: 100 });
    });
    
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
    });
    
    container.on('pointerdown', () => {
      this.startGame();
    });
    
    this.tweens.add({
      targets: container,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    return container;
  }
  
  private createPillButton(x: number, y: number, label: string, color: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.8);
    bg.fillRoundedRect(-90, -18, 180, 36, 18);
    
    const text = this.add.text(0, 0, label, {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    container.add([bg, text]);
    container.setInteractive(new Phaser.Geom.Rectangle(-90, -18, 180, 36), Phaser.Geom.Rectangle.Contains);
    
    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
    });
    
    return container;
  }
  
  private setImageToCoverViewport(image: Phaser.GameObjects.Image, targetWidth: number, targetHeight: number): void {
    const texture = image.texture;
    const sourceWidth = texture.source[0].width;
    const sourceHeight = texture.source[0].height;
    
    const scaleX = targetWidth / sourceWidth;
    const scaleY = targetHeight / sourceHeight;
    const scale = Math.max(scaleX, scaleY);
    
    image.setScale(scale);
    image.setDisplaySize(sourceWidth * scale, sourceHeight * scale);
  }
  
  private selectDifficulty(difficulty: Difficulty): void {
    console.log(`[MainMenu] ===  SELECTING DIFFICULTY: ${difficulty} ===`);
    console.log(`[MainMenu] Previous selection: ${this.selectedDifficulty}`);
    console.log(`[MainMenu] Number of buttons in map: ${this.difficultyButtons.size}`);
    
    this.difficultyButtons.forEach((container, diff) => {
      console.log(`[MainMenu] Processing button: ${diff}`);
      const bg = (container as any).bgGraphics as Phaser.GameObjects.Graphics;
      const nameText = (container as any).nameText as Phaser.GameObjects.Text;
      
      if (!bg) {
        console.error(`[MainMenu] ERROR: No bgGraphics found for ${diff}!`);
        return;
      }
      
      bg.clear();
      
      if (diff === difficulty) {
        console.log(`[MainMenu]   -> Drawing SELECTED style (cyan border)`);
        const cycleColor = this.getCurrentCycleColor();
        bg.fillStyle(0x000000, 0.7);
        bg.fillRoundedRect(-75, -45, 150, 90, 20);
        bg.fillStyle(cycleColor, 0.5);
        bg.fillRoundedRect(-73, -43, 146, 86, 18);
        bg.lineStyle(4, 0x667eea, 1);
        bg.strokeRoundedRect(-75, -45, 150, 90, 20);
        nameText.setColor('#ffffff');
        container.setScale(1.05);
      } else {
        console.log(`[MainMenu]   -> Drawing UNSELECTED style (dim)`);
        this.createGlassmorphismButton(bg, -75, -45, 150, 90, 20);
        nameText.setColor('#aaaaaa');
        container.setScale(1);
      }
    });
    
    this.selectedDifficulty = difficulty;
    console.log(`[MainMenu] === SELECTION COMPLETE. Current: ${this.selectedDifficulty} ===`);
  }
  
  private startGame(): void {
    console.log(`[MainMenu] Starting game with difficulty: ${this.selectedDifficulty}`);
    useGameStore.getState().startNewRun(this.selectedDifficulty);
    
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('CrimsonLevel');
    });
  }

  private async initializeBSVWallet(): Promise<void> {
    try {
      console.log('[MainMenu] Initializing BSV wallet...');
      
      const wallet = await initializeWallet({
        network: BSV_CONFIG.NETWORK,
        appName: BSV_CONFIG.APP_NAME,
        appIcon: BSV_CONFIG.APP_ICON
      });

      this.walletConnected = true;
      const identityKey = wallet.getIdentityKey();
      
      console.log(`[MainMenu] ✅ Wallet connected!`);
      console.log(`[MainMenu] Identity: ${identityKey.slice(0, 16)}...`);
      
      if (this.walletStatusText) {
        this.walletStatusText.setText(`🔗 Wallet: Connected (${identityKey.slice(0, 8)}...)`);
        this.walletStatusText.setColor('#88ff88');
      }
    } catch (error) {
      console.warn('[MainMenu] ⚠️ Wallet initialization failed:', error);
      console.log('[MainMenu] Game will continue without blockchain features');
      
      if (this.walletStatusText) {
        this.walletStatusText.setText('🔗 Wallet: Not Connected (Click to connect)');
        this.walletStatusText.setColor('#ff8888');
      }
      
      this.walletConnected = false;
    }
  }

  private async handleWalletConnection(): Promise<void> {
    try {
      if (this.walletConnected) {
        const wallet = getWallet();
        const identityKey = wallet.getIdentityKey();
        
        console.log(`[MainMenu] Wallet already connected: ${identityKey.slice(0, 16)}...`);
        
        if (this.walletStatusText) {
          this.walletStatusText.setText(`🔗 Wallet: Connected (${identityKey.slice(0, 8)}...)`);
          this.walletStatusText.setColor('#88ff88');
        }
        return;
      }

      console.log('[MainMenu] Attempting wallet connection...');
      
      if (this.walletStatusText) {
        this.walletStatusText.setText('🔗 Connecting...');
        this.walletStatusText.setColor('#ffaa00');
      }

      resetWallet();
      
      const wallet = await initializeWallet({
        network: BSV_CONFIG.NETWORK,
        appName: BSV_CONFIG.APP_NAME,
        appIcon: BSV_CONFIG.APP_ICON
      });

      this.walletConnected = true;
      const identityKey = wallet.getIdentityKey();
      
      console.log(`[MainMenu] ✅ Wallet connected!`);
      
      if (this.walletStatusText) {
        this.walletStatusText.setText(`🔗 Wallet: Connected (${identityKey.slice(0, 8)}...)`);
        this.walletStatusText.setColor('#88ff88');
      }

      const successText = this.add.text(GAME.ARENA_WIDTH / 2, 520, '✅ Wallet Connected!', {
        fontSize: '14px',
        color: '#88ff88'
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: successText,
        alpha: 0,
        y: successText.y - 20,
        duration: 2000,
        onComplete: () => successText.destroy()
      });

    } catch (error) {
      console.error('[MainMenu] ❌ Wallet connection failed:', error);
      
      if (this.walletStatusText) {
        this.walletStatusText.setText('🔗 Wallet: Connection Failed (Click to retry)');
        this.walletStatusText.setColor('#ff4444');
      }

      const errorText = this.add.text(GAME.ARENA_WIDTH / 2, 520, '❌ Wallet Connection Failed', {
        fontSize: '14px',
        color: '#ff4444'
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: errorText,
        alpha: 0,
        y: errorText.y - 20,
        duration: 2000,
        onComplete: () => errorText.destroy()
      });

      this.walletConnected = false;
    }
  }
}
