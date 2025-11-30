export interface LayerConfig {
  key: string;
  name: string;
  color: string;
  shardGoal: number;
  baseSpeed: number;
  essenceDensity: number;
  threat: number;
}

export const LAYERS: LayerConfig[] = [
  {
    key: 'crimson',
    name: 'Crimson Aether',
    color: '#DC143C',
    shardGoal: 50,
    baseSpeed: 120,
    essenceDensity: 25,
    threat: 1
  },
  {
    key: 'amber',
    name: 'Amber Flux',
    color: '#FF8C00',
    shardGoal: 65,
    baseSpeed: 140,
    essenceDensity: 22,
    threat: 2
  },
  {
    key: 'yellow',
    name: 'Solar Rift',
    color: '#FFD700',
    shardGoal: 78,
    baseSpeed: 160,
    essenceDensity: 19,
    threat: 3
  },
  {
    key: 'green',
    name: 'Verdant Pulse',
    color: '#32CD32',
    shardGoal: 94,
    baseSpeed: 180,
    essenceDensity: 16,
    threat: 4
  },
  {
    key: 'blue',
    name: 'Azure Void',
    color: '#1E90FF',
    shardGoal: 113,
    baseSpeed: 200,
    essenceDensity: 13,
    threat: 5
  },
  {
    key: 'indigo',
    name: 'Indigo Veil',
    color: '#4B0082',
    shardGoal: 136,
    baseSpeed: 220,
    essenceDensity: 10,
    threat: 6
  },
  {
    key: 'violet',
    name: 'Violet Crown',
    color: '#8B00FF',
    shardGoal: 163,
    baseSpeed: 240,
    essenceDensity: 7,
    threat: 7
  }
];

export const GAME_CONSTANTS = {
  ARENA_HEIGHT: 2400,
  ARENA_WIDTH: 800,
  VIEWPORT_HEIGHT: 600,
  TIMER: 180,
  STARTING_ESSENCE: 150,
  MAX_ESSENCE: 200,
  ESSENCE_DRAIN_RATE: 0.05
};