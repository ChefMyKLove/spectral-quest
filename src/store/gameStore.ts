/**
 * SPECTRAL QUEST: Game State Store
 * Using Zustand for state management
 * 
 * This store tracks ALL data needed for card generation
 */

import { createStore } from 'zustand/vanilla';
import { GAME, LEVELS, DIFFICULTIES, RARITY_ORDER } from '../config/gameConfig';
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
  dropMotes: (count: number) => number[];  // When hit by hostile drone, returns dropped mote IDs
  
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
    // When hit by hostile drone or Q key pressed, drop some collected motes
    const state = get();
    const collectedMotes = state.motes.filter(m => m.collected);
    const toDrop = Math.min(count, collectedMotes.length);
    
    console.log(`[STORE] dropMotes called: count=${count}, collected=${collectedMotes.length}, toDrop=${toDrop}`);
    
    if (toDrop === 0) {
      console.warn(`[STORE] dropMotes: No motes to drop (collected=${collectedMotes.length})`);
      return [];
    }
    
    // Drop the most recently collected ones
    const sortedByTime = [...collectedMotes].sort((a, b) => b.collectedAt - a.collectedAt);
    const droppedMotes = sortedByTime.slice(0, toDrop);
    const droppedIds = new Set(droppedMotes.map(m => m.id));
    
    console.log(`[STORE] Dropping motes: ${droppedMotes.map(m => `id=${m.id}, seq=${m.sequenceNumber}`).join(', ')}`);
    
    const newMotes = state.motes.map(m =>
      droppedIds.has(m.id)
        ? { ...m, collected: false, collectedAt: 0 }
        : m
    );
    
    const newMotesCollected = state.motesCollected - toDrop;
    
    set({
      motes: newMotes,
      motesCollected: newMotesCollected,
    });
    
    // Validate state after drop
    const verifyState = get();
    const verifyCollected = verifyState.motes.filter(m => m.collected).length;
    if (verifyCollected !== newMotesCollected) {
      console.error(`[STORE] ⚠️ MOTE COUNT MISMATCH after drop! Expected ${newMotesCollected} collected, but store has ${verifyCollected}`);
    }
    
    const droppedIdsArray = droppedMotes.map(m => m.id);
    console.log(`[STORE] ✅ Dropped ${toDrop} motes. IDs: [${droppedIdsArray.join(', ')}]. New collected count: ${newMotesCollected}`);
    
    // Return the IDs of dropped motes so they can be respawned
    return droppedIdsArray;
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
    
    // Calculate rarity based on performance
    let finalRarity: CardRarity = 'common';
    
    console.log(`[STORE] Rarity calculation start: outcome=${outcome}, sequencePerfect=${sequencePerfect}, sequenceCorrect=${state.sequenceCorrect}, motesCollected=${state.motesCollected}, moteCount=${config.moteCount}, badges=[${badges.join(', ')}]`);
    
    // Check for special ultimates first
    if (outcome === 'lose' && badges.includes('defiant_ultimate')) {
      finalRarity = 'defiant_ultimate';
      console.log(`[STORE] → Defiant Ultimate (all defiant badges)`);
    } else if (outcome === 'win') {
      // Check for Prismatic Ultimate (perfect sequences on all completed levels)
      const updatedState = get();
      const allCompleted = updatedState.completedLevels.length + 1; // +1 for current level
      const allPerfect = updatedState.allSequencesPerfect && sequencePerfect;
      
      console.log(`[STORE] Prismatic check: allSequencesPerfect=${updatedState.allSequencesPerfect}, sequencePerfect=${sequencePerfect}, allCompleted=${allCompleted}`);
      
      // Prismatic Ultimate: perfect sequence on all levels (all 7 levels)
      if (allPerfect && allCompleted >= 7) {
        finalRarity = 'prismatic_ultimate';
        console.log(`[STORE] → Prismatic Ultimate (perfect sequences on all 7 levels)`);
      } else {
        // Calculate base rarity from sequence performance
        const sequenceRatio = config.moteCount > 0 
          ? state.sequenceCorrect / config.moteCount 
          : 0;
        const allMotesCollected = state.motesCollected === config.moteCount;
        
        console.log(`[STORE] Sequence stats: ratio=${sequenceRatio.toFixed(2)}, allMotesCollected=${allMotesCollected}`);
        
        // Base rarity from sequence performance
        if (sequencePerfect && allMotesCollected) {
          // Perfect sequence + all motes = Ultimate
          finalRarity = 'ultimate';
          console.log(`[STORE] → Ultimate (perfect sequence + all motes)`);
        } else if (sequenceRatio >= 0.9 && allMotesCollected) {
          // 90%+ sequence accuracy + all motes = Mythic
          finalRarity = 'mythic';
          console.log(`[STORE] → Mythic (90%+ sequence + all motes)`);
        } else if (sequenceRatio >= 0.7 && allMotesCollected) {
          // 70%+ sequence accuracy + all motes = Legendary
          finalRarity = 'legendary';
          console.log(`[STORE] → Legendary (70%+ sequence + all motes)`);
        } else if (sequenceRatio >= 0.5 && allMotesCollected) {
          // 50%+ sequence accuracy + all motes = Epic
          finalRarity = 'epic';
          console.log(`[STORE] → Epic (50%+ sequence + all motes)`);
        } else if (allMotesCollected) {
          // All motes but poor sequence = Rare
          finalRarity = 'rare';
          console.log(`[STORE] → Rare (all motes but poor sequence)`);
        } else if (sequenceRatio >= 0.8) {
          // High sequence accuracy but missing motes = Uncommon
          finalRarity = 'uncommon';
          console.log(`[STORE] → Uncommon (high sequence but missing motes)`);
        } else {
          // Default
          finalRarity = 'common';
          console.log(`[STORE] → Common (default)`);
        }
        
        // Boost rarity based on badges and achievements
        let rarityBoost = 0;
        
        if (badges.includes('flawless')) {
          rarityBoost += 1;
          console.log(`[STORE] +1 boost: flawless (full lives)`);
        }
        if (badges.includes('harmonic')) {
          rarityBoost += 1;
          console.log(`[STORE] +1 boost: harmonic (perfect sequence badge)`);
        }
        if (badges.includes('mentor_blessed')) {
          rarityBoost += 0.5;
          console.log(`[STORE] +0.5 boost: mentor_blessed`);
        }
        if (badges.includes('drone_denial')) {
          rarityBoost += 0.5;
          console.log(`[STORE] +0.5 boost: drone_denial`);
        }
        
        // Time bonus (more time remaining = better)
        const timeRatio = totalTime > 0 ? state.timeRemaining / totalTime : 0;
        if (timeRatio > 0.75) {
          rarityBoost += 0.5;
          console.log(`[STORE] +0.5 boost: time > 75%`);
        } else if (timeRatio > 0.5) {
          rarityBoost += 0.5;
          console.log(`[STORE] +0.5 boost: time > 50%`);
        }
        
        // Apply boost (but don't exceed ultimate unless it's prismatic)
        if (rarityBoost > 0 && finalRarity !== 'ultimate' && finalRarity !== 'prismatic_ultimate') {
          const currentIndex = RARITY_ORDER.indexOf(finalRarity);
          const boostedIndex = Math.min(
            currentIndex + Math.floor(rarityBoost),
            RARITY_ORDER.indexOf('ultimate')
          );
          const oldRarity = finalRarity;
          finalRarity = RARITY_ORDER[boostedIndex];
          console.log(`[STORE] Rarity boosted: ${oldRarity} → ${finalRarity} (boost=${rarityBoost})`);
        } else if (rarityBoost > 0) {
          console.log(`[STORE] No boost applied (already at ${finalRarity})`);
        }
      }
    } else {
      // Lose outcome - lower rarities, but can still get defiant_ultimate (already checked)
      const sequenceRatio = state.motesCollected > 0
        ? state.sequenceCorrect / state.motesCollected
        : 0;
      
      if (partialSequencePerfect && state.motesCollected >= config.moteCount * 0.8) {
        // Good partial sequence = Uncommon
        finalRarity = 'uncommon';
        console.log(`[STORE] → Uncommon (good partial sequence on loss)`);
      } else if (sequenceRatio >= 0.7 && state.motesCollected > 0) {
        // Decent sequence = Rare
        finalRarity = 'rare';
        console.log(`[STORE] → Rare (decent sequence on loss)`);
      } else if (state.motesCollected > 0) {
        // Some motes collected = Uncommon
        finalRarity = 'uncommon';
        console.log(`[STORE] → Uncommon (some motes collected on loss)`);
      } else {
        console.log(`[STORE] → Common (loss with no motes)`);
      }
    }
    
    console.log(`[STORE] ✅ Final rarity: ${finalRarity}`);
    
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

