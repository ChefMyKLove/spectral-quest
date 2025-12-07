/**
 * SPECTRAL QUEST: RAINBOW CRAFT
 * 
 * A precision platformer where you play as Lirien, a unicorn weaver
 * collecting motes across seven spectral layers to restore the
 * shattered Spectral Core and save your cousin Maxim.
 * 
 * Built with Phaser 3 + TypeScript + Zustand
 */

import Phaser from 'phaser';
import { GAME } from './config/gameConfig';
import './styles/carousel.css'; // Import carousel styles for reference

// Scenes
import { BootScene } from './scenes/BootScene';
import { MainMenu } from './scenes/MainMenu';
import { CrimsonLevel } from './scenes/levels/CrimsonLevel';
import { AmberLevel } from './scenes/levels/AmberLevel';
import { YellowLevel } from './scenes/levels/YellowLevel';
import { GreenLevel } from './scenes/levels/GreenLevel';
import { BlueLevel } from './scenes/levels/BlueLevel';
import { IndigoLevel } from './scenes/levels/IndigoLevel';
import { VioletLevel } from './scenes/levels/VioletLevel';
import { LevelComplete } from './scenes/LevelComplete';
import { GameOver } from './scenes/GameOver';

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME.ARENA_WIDTH,
  height: GAME.VIEWPORT_HEIGHT,
  parent: 'game',
  backgroundColor: '#000000',
  
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false  // Set to true to see collision boxes
    }
  },
  
  scene: [
    BootScene,
    MainMenu,
    CrimsonLevel,
    AmberLevel,
    YellowLevel,
    GreenLevel,
    BlueLevel,
    IndigoLevel,
    VioletLevel,
    LevelComplete,
    GameOver
  ],
  
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 600,
      height: 450
    },
    max: {
      width: 2400,
      height: 1800
    }
  },
  
  input: {
    keyboard: true,
    mouse: true,
    touch: true
  },
  
  render: {
    pixelArt: false,
    antialias: true
  }
};

// Create the game instance
const game = new Phaser.Game(config);

// Export for debugging
(window as any).game = game;

console.log('🌈 Spectral Quest: Rainbow Craft initialized');
console.log('Arena size:', GAME.ARENA_WIDTH, 'x', GAME.ARENA_HEIGHT);
console.log('Viewport:', GAME.ARENA_WIDTH, 'x', GAME.VIEWPORT_HEIGHT);
