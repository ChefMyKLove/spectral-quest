/**
 * SPECTRAL QUEST: Game State Store
 * Using Zustand for state management
 * 
 * This store tracks ALL data needed for card generation
 */

import { createStore } from 'zustand/vanilla';
import { GAME, LEVELS, DIFFICULTIES } from '../config/gameConfig';
import type { Difficulty, CardRarity } from '../config/gameConfig';

// =============================================================================
// TYPES
// =============================================================================

export type GameOutcome = 'win' | 'lose' | null;
export type DeathType = 'crash' | 'time_out' | null;
export type GamePhase = 'menu' | 'playing' | 'paused' | 'level_complete' | 'game_over' | 'boss';

export interface MoteData {
  id: number;
  sequenceNumber: number;  // The "correct" order number
  collected: boolean;
  collectedAt: number;     // Timestamp when collected (0 if not)
  x: number;
  y: number;
}

export interface PathPoint {
  x: number;
  y: number;
  t: number;  // timestamp
}

export interface LevelStats {
  // Identity
  levelIndex: number;
  levelKey: string;
  outcome: GameOutcome;
  
  // Timing
  timeBase: number;
  timeAddedFromMentors: number;
  timeRemaining: number;
  timeSurvived: number;
  diedInFinal3Seconds: boolean;
  
  // Motes
  motesTotal: number;
  motesCollected: number;
  motesSequenceCorrect: number;
  motesSequencePerfect: boolean;
  partialSequencePerfect: boolean;  // For LOSE cards
  
  // Combat
  shotsFired: number;
  shotsHit: number;
  harvestersDestroyed: number;
  harvestersReachedMaxim: number;
  hostileDronesDestroyed: number;
  
  // Survival
  livesAtStart: number;
  livesAtEnd: number;
  deathType: DeathType;
  
  // Exploration
  levelAreaExplored: number;  // 0-1 percentage
  cloudsEntered: number;
  
  // Mentor
  mentorName: string;
  mentorTouches: number;
  mentorContacted: boolean;
  tokensEarned: number;
  
  // Energy
  energyCollected: number;
  energySpentFlying: number;
  energySpentShooting: number;
  
  // Path
  pathData: PathPoint[];
  
  // Badges
  badges: string[];
  
  // Rarity
  finalRarity: CardRarity;
}

export interface GameState {
  // === GAME PHASE ===
  phase: GamePhase;
  
  // === RUN DATA ===
  runId: string;
  difficulty: Difficulty;
  loopNumber: number;
  
  // === CURRENT LEVEL ===
  currentLevelIndex: number;
  
  // === LIVES ===
  lives: number;
  
  // === TIMER ===
  timeRemaining: number;
  timeAddedFromMentors: number;
  levelStartTime: number;
  
  // === ENERGY ===
  energy: number;
  isTumbling: boolean;
  
  // === MOTES ===
  motes: MoteData[];
  motesCollected: number;
  lastCollectedSequence: number;  // Track sequence progress
  sequenceCorrect: number;        // How many collected in correct order
  
  // === COMBAT ===
  canShoot: boolean;
  shotsFired: number;
  shotsHit: number;
  
  // === DRONES ===
  harvestersDestroyed: number;
  harvestersReachedMaxim: number;
  hostileDronesDestroyed: number;
  
  // === BINARY WRAP ===
  binaryWrapHeight: number;  // 0-1, percentage of screen
  
  // === MENTOR ===
  mentorTouchesThisLevel: number;
  mentorStreak: number;  // Consecutive levels with contact
  
  // === TOKENS ===
  tokensThisRun: number;
  tokensTotal: number;  // Lifetime (would be saved to wallet)
  
  // === PATH TRACKING ===
  pathData: PathPoint[];
  exploredAreas: Set<string>;  // Grid cells visited
  cloudsEntered: number;
  
  // === ENERGY TRACKING ===
  energyCollected: number;
  energySpentFlying: number;
  energySpentShooting: number;
  
  // === LEVEL HISTORY ===
  completedLevels: LevelStats[];
  allSequencesPerfect: boolean;  // For Prismatic Ultimate
  
  // === ACTIONS ===
  // Phase
  setPhase: (phase: GamePhase) => void;
  startNewRun: (difficulty: Difficulty) => void;
  startLevel: (levelIndex: number) => void;
  
  // Lives
  loseLife: (deathType: DeathType) => boolean;  // Returns false if game over
  gainLife: () => boolean;  // Returns false if at cap
  
  // Timer
  tick: (deltaSeconds: number) => void;
  addTime: (seconds: number) => void;
  
  // Energy
  addEnergy: (amount: number) => void;
  drainEnergy: (amount: number, source: 'flying' | 'shooting') => void;
  setTumbling: (tumbling: boolean) => void;
  
  // Motes
  initializeMotes: (count: number) => void;
  collectMote: (moteId: number) => void;
  dropMotes: (count: number) => void;  // When hit by hostile drone
  
  // Combat
  unlockShooting: () => void;
  fireShot: () => void;
  registerHit: () => void;
  
  // Drones
  destroyHarvester: () => void;
  harvesterReachedMaxim: () => void;
  destroyHostileDrone: () => void;
  
  // Binary Wrap
  updateBinaryWrap: () => void;
  
  // Mentor
  touchMentor: () => void;
  
  // Path
  recordPosition: (x: number, y: number) => void;
  enterCloud: () => void;
  markAreaExplored: (gridX: number, gridY: number) => void;
  
  // Level completion
  completeLevel: (outcome: GameOutcome, deathType?: DeathType) => LevelStats;
  
  // Helpers
  getCurrentLevelConfig: () => typeof LEVELS[0];
  getEffectiveTime: () => number;
}

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const gameStore = createStore<GameState>()((set, get) => ({
  // === INITIAL STATE ===
  phase: 'menu',
  runId: '',
  difficulty: 'weaver',
  loopNumber: 1,
  currentLevelIndex: 0,
  lives: GAME.STARTING_LIVES,
  timeRemaining: 0,
  timeAddedFromMentors: 0,
  levelStartTime: 0,
  energy: GAME.STARTING_ENERGY,
  isTumbling: false,
  motes: [],
  motesCollected: 0,
  lastCollectedSequence: 0,
  sequenceCorrect: 0,
  canShoot: false,
  shotsFired: 0,
  shotsHit: 0,
  harvestersDestroyed: 0,
  harvestersReachedMaxim: 0,
  hostileDronesDestroyed: 0,
  binaryWrapHeight: 0,
  mentorTouchesThisLevel: 0,
  mentorStreak: 0,
  tokensThisRun: 0,
  tokensTotal: 0,
  pathData: [],
  exploredAreas: new Set(),
  cloudsEntered: 0,
  energyCollected: 0,
  energySpentFlying: 0,
  energySpentShooting: 0,
  completedLevels: [],
  allSequencesPerfect: true,

  // === ACTIONS ===
  
  setPhase: (phase) => set({ phase }),
  
  startNewRun: (difficulty) => set({
    phase: 'menu',
    runId: crypto.randomUUID(),
    difficulty,
    loopNumber: 1,
    currentLevelIndex: 0,
    lives: GAME.STARTING_LIVES,
    tokensThisRun: 0,
    completedLevels: [],
    allSequencesPerfect: true,
    mentorStreak: 0,
  }),
  
  startLevel: (levelIndex) => {
    const config = LEVELS[levelIndex];
    const state = get();
    const { difficulty } = state;
    
    // Calculate effective time based on difficulty
    const { timeMultiplier } = DIFFICULTIES[difficulty];
    const effectiveTime = Math.floor(config.baseTime * timeMultiplier);
    
    set({
      phase: 'playing',
      currentLevelIndex: levelIndex,
      timeRemaining: effectiveTime,
      timeAddedFromMentors: 0,
      levelStartTime: Date.now(),
      energy: GAME.MAX_ENERGY, // Always start with FULL energy - maximum flight time
      isTumbling: false,
      motes: [],
      motesCollected: 0,
      lastCollectedSequence: 0,
      sequenceCorrect: 0,
      canShoot: false,
      shotsFired: 0,
      shotsHit: 0,
      harvestersDestroyed: 0,
      harvestersReachedMaxim: 0,
      hostileDronesDestroyed: 0,
      binaryWrapHeight: 0,
      mentorTouchesThisLevel: 0,
      pathData: [],
      exploredAreas: new Set(),
      cloudsEntered: 0,
      energyCollected: 0,
      energySpentFlying: 0,
      energySpentShooting: 0,
    });
  },
  
  loseLife: (deathType) => {
    const state = get();
    const newLives = state.lives - 1;
    
    if (newLives <= 0) {
      set({ lives: 0, phase: 'game_over' });
      return false;  // Game over
    }
    
    set({ lives: newLives });
    return true;  // Can retry
  },
  
  gainLife: () => {
    const state = get();
    if (state.lives >= GAME.MAX_LIVES) {
      return false;  // At cap
    }
    set({ lives: state.lives + 1 });
    return true;
  },
  
  tick: (deltaSeconds) => {
    const state = get();
    const newTime = Math.max(0, state.timeRemaining - deltaSeconds);
    
    set({ timeRemaining: newTime });
    
    // Update binary wrap
    get().updateBinaryWrap();
    
    // Check for time out
    if (newTime <= 0) {
      get().completeLevel('lose', 'time_out');
    }
  },
  
  addTime: (seconds) => {
    set(state => ({
      timeRemaining: state.timeRemaining + seconds,
      timeAddedFromMentors: state.timeAddedFromMentors + seconds
    }));
  },
  
  addEnergy: (amount) => {
    set(state => ({
      energy: Math.min(GAME.MAX_ENERGY, state.energy + amount),
      energyCollected: state.energyCollected + amount
    }));
  },
  
  drainEnergy: (amount, source) => {
    const state = get();
    const newEnergy = Math.max(0, state.energy - amount);
    
    const updates: Partial<GameState> = { energy: newEnergy };
    
    if (source === 'flying') {
      updates.energySpentFlying = state.energySpentFlying + amount;
    } else {
      updates.energySpentShooting = state.energySpentShooting + amount;
    }
    
    // Start tumbling if energy depleted
    if (newEnergy <= 0 && !state.isTumbling) {
      updates.isTumbling = true;
    }
    
    set(updates);
  },
  
  setTumbling: (tumbling) => set({ isTumbling: tumbling }),
  
  initializeMotes: (count) => {
    console.log(`[STORE] initializeMotes called with count: ${count}`);
    
    if (!count || count <= 0) {
      console.error('[STORE] Invalid mote count:', count);
      return;
    }
    
    // Create motes with random sequence numbers
    const sequenceNumbers = Array.from({ length: count }, (_, i) => i + 1);
    // Shuffle for random placement, but keep sequence numbers
    const shuffledPositions = [...sequenceNumbers].sort(() => Math.random() - 0.5);
    
    const motes: MoteData[] = shuffledPositions.map((seq, index) => ({
      id: index,
      sequenceNumber: seq,
      collected: false,
      collectedAt: 0,
      x: 0,  // Will be set by level scene
      y: 0,
    }));
    
    console.log(`[STORE] Created ${motes.length} motes, setting in store...`);
    set({ motes, motesCollected: 0, lastCollectedSequence: 0, sequenceCorrect: 0 });
    
    // Verify it was set
    const verifyState = get();
    console.log(`[STORE] Verification: motes in store = ${verifyState.motes.length}`);
  },
  
  collectMote: (moteId) => {
    const state = get();
    const mote = state.motes.find(m => m.id === moteId);
    if (!mote || mote.collected) return;
    
    const expectedSequence = state.lastCollectedSequence + 1;
    const isCorrectSequence = mote.sequenceNumber === expectedSequence;
    
    const newMotes = state.motes.map(m => 
      m.id === moteId 
        ? { ...m, collected: true, collectedAt: Date.now() }
        : m
    );
    
    const newCollected = state.motesCollected + 1;
    const newSequenceCorrect = isCorrectSequence 
      ? state.sequenceCorrect + 1 
      : state.sequenceCorrect;
    
    set({
      motes: newMotes,
      motesCollected: newCollected,
      lastCollectedSequence: isCorrectSequence ? expectedSequence : state.lastCollectedSequence,
      sequenceCorrect: newSequenceCorrect,
    });
    
    // Check if shooting should unlock
    const config = get().getCurrentLevelConfig();
    if (newCollected >= config.motesToUnlockShooting && !state.canShoot) {
      get().unlockShooting();
    }
    
    // Level win check is handled in BaseLevel.onMoteCollision() to ensure proper scene transition
  },
  
  dropMotes: (count) => {
    // When hit by hostile drone, drop some collected motes
    const state = get();
    const collectedMotes = state.motes.filter(m => m.collected);
    const toDrop = Math.min(count, collectedMotes.length);
    
    if (toDrop === 0) return;
    
    // Drop the most recently collected ones
    const sortedByTime = [...collectedMotes].sort((a, b) => b.collectedAt - a.collectedAt);
    const droppedIds = new Set(sortedByTime.slice(0, toDrop).map(m => m.id));
    
    const newMotes = state.motes.map(m =>
      droppedIds.has(m.id)
        ? { ...m, collected: false, collectedAt: 0 }
        : m
    );
    
    set({
      motes: newMotes,
      motesCollected: state.motesCollected - toDrop,
    });
  },
  
  unlockShooting: () => set({ canShoot: true }),
  
  fireShot: () => {
    const state = get();
    if (!state.canShoot) return;
    
    set({ shotsFired: state.shotsFired + 1 });
    get().drainEnergy(GAME.ENERGY_DRAIN_SHOOTING, 'shooting');
  },
  
  registerHit: () => {
    set(state => ({ shotsHit: state.shotsHit + 1 }));
  },
  
  destroyHarvester: () => {
    set(state => ({ harvestersDestroyed: state.harvestersDestroyed + 1 }));
  },
  
  harvesterReachedMaxim: () => {
    set(state => ({ harvestersReachedMaxim: state.harvestersReachedMaxim + 1 }));
  },
  
  destroyHostileDrone: () => {
    set(state => ({ hostileDronesDestroyed: state.hostileDronesDestroyed + 1 }));
  },
  
  updateBinaryWrap: () => {
    const state = get();
    const config = get().getCurrentLevelConfig();
    const { difficulty } = state;
    const { timeMultiplier } = DIFFICULTIES[difficulty];
    
    const totalTime = config.baseTime * timeMultiplier;
    const elapsed = totalTime - state.timeRemaining;
    const timePercent = elapsed / totalTime;
    
    // Base growth from time (70%)
    const baseGrowth = timePercent * GAME.WRAP_BASE_GROWTH_PERCENT;
    
    // Growth from drones feeding Maxim (30%)
    // Assume some max harvesters could reach Maxim
    const maxHarvesters = 20;  // Tunable
    const droneGrowth = (state.harvestersReachedMaxim / maxHarvesters) * GAME.WRAP_DRONE_GROWTH_PERCENT;
    
    const totalWrap = Math.min(1, baseGrowth + droneGrowth);
    
    set({ binaryWrapHeight: totalWrap });
  },
  
  touchMentor: () => {
    const state = get();
    const isFirstTouch = state.mentorTouchesThisLevel === 0;
    
    // Always give token and time
    set({
      mentorTouchesThisLevel: state.mentorTouchesThisLevel + 1,
      tokensThisRun: state.tokensThisRun + GAME.TOKENS_PER_MENTOR_TOUCH,
      tokensTotal: state.tokensTotal + GAME.TOKENS_PER_MENTOR_TOUCH,
    });
    
    get().addTime(GAME.MENTOR_TIME_BONUS);
    
    // First touch counts toward streak
    if (isFirstTouch) {
      const newStreak = state.mentorStreak + 1;
      set({ mentorStreak: newStreak });
      
      // Check for extra life from streak
      if (newStreak >= GAME.MENTOR_STREAK_FOR_LIFE) {
        get().gainLife();
        set({ mentorStreak: 0 });  // Reset streak
      }
    }
  },
  
  recordPosition: (x, y) => {
    const state = get();
    state.pathData.push({ x, y, t: Date.now() - state.levelStartTime });
  },
  
  enterCloud: () => {
    set(state => ({ cloudsEntered: state.cloudsEntered + 1 }));
  },
  
  markAreaExplored: (gridX, gridY) => {
    const state = get();
    const key = `${gridX},${gridY}`;
    if (!state.exploredAreas.has(key)) {
      const newSet = new Set(state.exploredAreas);
      newSet.add(key);
      set({ exploredAreas: newSet });
    }
  },
  
  completeLevel: (outcome, deathType = null) => {
    const state = get();
    const config = get().getCurrentLevelConfig();
    const { difficulty } = state;
    const { timeMultiplier } = DIFFICULTIES[difficulty];
    
    const totalTime = config.baseTime * timeMultiplier + state.timeAddedFromMentors;
    const timeSurvived = totalTime - state.timeRemaining;
    
    // Calculate exploration percentage (assume 10x10 grid)
    const totalCells = 100;
    const exploredPercent = state.exploredAreas.size / totalCells;
    
    // Check if sequence was perfect
    const sequencePerfect = state.sequenceCorrect === state.motesCollected && 
                            state.motesCollected === config.moteCount;
    
    // For lose cards: was sequence perfect for collected motes?
    const partialSequencePerfect = state.sequenceCorrect === state.motesCollected && 
                                   state.motesCollected > 0;
    
    // Determine badges
    const badges: string[] = [];
    
    if (outcome === 'win') {
      if (state.lives === GAME.STARTING_LIVES) badges.push('flawless');
      if (sequencePerfect) badges.push('harmonic');
      if (state.mentorTouchesThisLevel > 0) badges.push('mentor_blessed');
      if (state.harvestersReachedMaxim === 0) badges.push('drone_denial');
    } else {
      // Lose badges (Defiant Stand)
      if (state.timeRemaining <= 3) badges.push('last_breath');
      if (partialSequencePerfect && state.motesCollected > 0) badges.push('partial_harmony');
      if (state.harvestersReachedMaxim === 0) badges.push('drone_denial');
      if (exploredPercent >= 0.9) badges.push('cartographer');
      
      // Check for Defiant Ultimate
      if (badges.includes('last_breath') && 
          badges.includes('partial_harmony') && 
          badges.includes('drone_denial') && 
          badges.includes('cartographer')) {
        badges.push('defiant_ultimate');
      }
    }
    
    // Calculate rarity (simplified for now)
    let finalRarity: CardRarity = 'common';
    // TODO: Implement full rarity calculation
    
    const levelStats: LevelStats = {
      levelIndex: state.currentLevelIndex,
      levelKey: config.key,
      outcome,
      timeBase: config.baseTime,
      timeAddedFromMentors: state.timeAddedFromMentors,
      timeRemaining: state.timeRemaining,
      timeSurvived,
      diedInFinal3Seconds: state.timeRemaining <= 3 && outcome === 'lose',
      motesTotal: config.moteCount,
      motesCollected: state.motesCollected,
      motesSequenceCorrect: state.sequenceCorrect,
      motesSequencePerfect: sequencePerfect,
      partialSequencePerfect,
      shotsFired: state.shotsFired,
      shotsHit: state.shotsHit,
      harvestersDestroyed: state.harvestersDestroyed,
      harvestersReachedMaxim: state.harvestersReachedMaxim,
      hostileDronesDestroyed: state.hostileDronesDestroyed,
      livesAtStart: state.lives + (outcome === 'lose' ? 1 : 0),
      livesAtEnd: state.lives,
      deathType,
      levelAreaExplored: exploredPercent,
      cloudsEntered: state.cloudsEntered,
      mentorName: config.mentorName,
      mentorTouches: state.mentorTouchesThisLevel,
      mentorContacted: state.mentorTouchesThisLevel > 0,
      tokensEarned: state.mentorTouchesThisLevel * GAME.TOKENS_PER_MENTOR_TOUCH,
      energyCollected: state.energyCollected,
      energySpentFlying: state.energySpentFlying,
      energySpentShooting: state.energySpentShooting,
      pathData: [...state.pathData],
      badges,
      finalRarity,
    };
    
    // Update all sequences perfect tracking
    if (!sequencePerfect && outcome === 'win') {
      set({ allSequencesPerfect: false });
    }
    
    // Add to completed levels
    set(state => ({
      completedLevels: [...state.completedLevels, levelStats],
      phase: outcome === 'win' ? 'level_complete' : 'game_over',
    }));
    
    // Check for extra life from perfect sequence on levels 5, 6, 7
    if (outcome === 'win' && sequencePerfect && state.currentLevelIndex >= 4) {
      get().gainLife();
    }
    
    return levelStats;
  },
  
  getCurrentLevelConfig: () => {
    const state = get();
    return LEVELS[state.currentLevelIndex];
  },
  
  getEffectiveTime: () => {
    const state = get();
    const config = get().getCurrentLevelConfig();
    const { timeMultiplier } = DIFFICULTIES[state.difficulty];
    return Math.floor(config.baseTime * timeMultiplier);
  },
}));

// Helper to access store (compatible with previous useGameStore.getState() pattern)
export const useGameStore = {
  getState: () => gameStore.getState(),
  setState: (partial: Partial<GameState>) => gameStore.setState(partial),
  subscribe: (listener: (state: GameState) => void) => gameStore.subscribe(listener),
};

