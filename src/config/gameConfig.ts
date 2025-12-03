/**
 * SPECTRAL QUEST: RAINBOW CRAFT
 * Master Game Configuration
 */

// =============================================================================
// LEVEL CONFIGURATIONS
// =============================================================================

export interface LevelConfig {
  key: string;
  name: string;
  color: string;
  moteCount: number;
  baseTime: number;          // seconds
  motesToUnlockShooting: number;
  mentorName: string;
  mentorAppearances: number; // how many times mentor can appear
}

export const LEVELS: LevelConfig[] = [
  {
    key: 'crimson',
    name: 'Crimson Aether',
    color: '#DC143C',
    moteCount: 7,
    baseTime: 120,
    motesToUnlockShooting: 1,
    mentorName: 'Umber',
    mentorAppearances: 4
  },
  {
    key: 'amber',
    name: 'Amber Flux',
    color: '#FF8C00',
    moteCount: 12,
    baseTime: 130,
    motesToUnlockShooting: 2,
    mentorName: 'Calen',
    mentorAppearances: 3
  },
  {
    key: 'yellow',
    name: 'Solar Rift',
    color: '#FFD700',
    moteCount: 18,
    baseTime: 140,
    motesToUnlockShooting: 3,
    mentorName: 'Sol',
    mentorAppearances: 3
  },
  {
    key: 'green',
    name: 'Verdant Pulse',
    color: '#32CD32',
    moteCount: 24,
    baseTime: 150,
    motesToUnlockShooting: 4,
    mentorName: 'Veyra',
    mentorAppearances: 3
  },
  {
    key: 'blue',
    name: 'Azure Void',
    color: '#1E90FF',
    moteCount: 35,
    baseTime: 160,
    motesToUnlockShooting: 5,
    mentorName: 'Zorah',
    mentorAppearances: 3
  },
  {
    key: 'indigo',
    name: 'Indigo Veil',
    color: '#4B0082',
    moteCount: 44,
    baseTime: 170,
    motesToUnlockShooting: 6,
    mentorName: 'Nyx',
    mentorAppearances: 2
  },
  {
    key: 'violet',
    name: 'Violet Crown',
    color: '#8B00FF',
    moteCount: 49,
    baseTime: 180,
    motesToUnlockShooting: 7,
    mentorName: 'Sylvara',
    mentorAppearances: 2
  }
];

// =============================================================================
// DIFFICULTY SETTINGS
// =============================================================================

export type Difficulty = 'dreamer' | 'weaver' | 'dancer' | 'master';

export interface DifficultyConfig {
  key: Difficulty;
  name: string;
  description: string;
  timeMultiplier: number;      // 1.0 = normal
  droneSpeedMultiplier: number;
  energyDrainMultiplier: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  dreamer: {
    key: 'dreamer',
    name: 'Dreamer',
    description: 'Relaxed pace, forgiving energy',
    timeMultiplier: 1.5,
    droneSpeedMultiplier: 0.7,
    energyDrainMultiplier: 0.7
  },
  weaver: {
    key: 'weaver',
    name: 'Weaver',
    description: 'Standard challenge',
    timeMultiplier: 1.0,
    droneSpeedMultiplier: 1.0,
    energyDrainMultiplier: 1.0
  },
  dancer: {
    key: 'dancer',
    name: 'Dancer',
    description: 'Fast and demanding',
    timeMultiplier: 0.8,
    droneSpeedMultiplier: 1.2,
    energyDrainMultiplier: 1.2
  },
  master: {
    key: 'master',
    name: 'Master',
    description: 'Brutal precision required',
    timeMultiplier: 0.6,
    droneSpeedMultiplier: 1.5,
    energyDrainMultiplier: 1.4
  }
};

// =============================================================================
// GAME CONSTANTS
// =============================================================================

export const GAME = {
  // Arena dimensions
  ARENA_WIDTH: 800,
  ARENA_HEIGHT: 2400,        // 4 screen heights
  VIEWPORT_HEIGHT: 600,
  
  // Player (Lirien)
  PLAYER_SPEED: 250,
  PLAYER_GLIDE_SPEED: 100,   // when not holding movement
  
  // Energy system - UNIVERSAL FOR ALL LEVELS
  // These values apply to ALL 7 levels (Crimson, Amber, Yellow, Green, Blue, Indigo, Violet)
  // No level-specific overrides - consistent energy mechanics everywhere
  STARTING_ENERGY: 150,  // Start with MAX energy - full tank to get up into the sky immediately
  MAX_ENERGY: 150,
  ENERGY_DRAIN_FLYING: 1.0,    // per second while holding movement (much lower for better flight)
  ENERGY_DRAIN_GLIDING: 0.2,   // per second while gliding (minimal drain)
  ENERGY_DRAIN_SHOOTING: 10, // per shot (reduced)
  ENERGY_REGEN_CLOUD: 8,     // per second in clouds (increased)
  ENERGY_FROM_PARTICLE: 30,   // per particle collected (MUCH higher - makes particles meaningful!)
  
  // Lives
  STARTING_LIVES: 3,
  MAX_LIVES: 4,
  
  // Mentor
  MENTOR_DURATION: 10,       // seconds visible
  MENTOR_FLASH_TIME: 2,      // seconds of flashing before disappearing
  MENTOR_TIME_BONUS: 5,      // seconds added per touch
  TOKENS_PER_MENTOR_TOUCH: 1,
  MENTOR_STREAK_FOR_LIFE: 3, // consecutive levels for extra life
  
  // Binary wrap
  WRAP_BASE_GROWTH_PERCENT: 0.7,  // 70% from time
  WRAP_DRONE_GROWTH_PERCENT: 0.3, // 30% from drones
  
  // Shooting
  SHOT_SPEED: 400,
  SHOT_COOLDOWN: 250,        // milliseconds
  
  // Drones
  DRONE_HARVESTER_SPEED: 80,
  DRONE_HOSTILE_SPEED: 120,
  
  // Physics
  GRAVITY: 300,              // for tumbling when out of energy
  FALL_RECOVERY_THRESHOLD: 10, // minimum energy to recover from fall (lower = easier recovery)
};

// =============================================================================
// CARD RARITY
// =============================================================================

export type CardRarity = 
  | 'common' 
  | 'uncommon' 
  | 'rare' 
  | 'epic' 
  | 'legendary' 
  | 'mythic' 
  | 'ultimate' 
  | 'prismatic_ultimate'  // WIN: perfect sequence all levels
  | 'defiant_ultimate';   // LOSE: all defiant achievements

export const RARITY_ORDER: CardRarity[] = [
  'common',
  'uncommon', 
  'rare',
  'epic',
  'legendary',
  'mythic',
  'ultimate',
  'prismatic_ultimate',
  'defiant_ultimate'
];

export const RARITY_COLORS: Record<CardRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
  mythic: '#EF4444',
  ultimate: '#EC4899',
  prismatic_ultimate: 'linear-gradient(90deg, #FF0000, #FF8000, #FFFF00, #00FF00, #0080FF, #8000FF)',
  defiant_ultimate: '#1F2937'
};

