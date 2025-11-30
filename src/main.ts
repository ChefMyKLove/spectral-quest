import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { CrimsonLayer } from './scenes/layers/CrimsonLayer';
import { ChronicleScene } from './scenes/ChronicleScene';
import { GAME_CONSTANTS } from './config/layers';
import { PHYSICS_CONFIG } from './config/physics';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONSTANTS.ARENA_WIDTH,
  height: GAME_CONSTANTS.VIEWPORT_HEIGHT,
  physics: PHYSICS_CONFIG,
  scene: [
    BootScene,
    MenuScene,
    CrimsonLayer,
    ChronicleScene
  ],
  parent: 'game',
  backgroundColor: '#000000'
};

new Phaser.Game(config);
