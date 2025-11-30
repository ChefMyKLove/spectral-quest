export const PHYSICS_CONFIG = {
  default: 'arcade',
  arcade: {
    gravity: { x: 0, y: 0 },
    debug: false
  }
} as const;

export const PLAYER_SPEED = 300;
export const ESSENCE_COLLECT_RADIUS = 60;
export const SHARD_COLLECT_RADIUS = 80;