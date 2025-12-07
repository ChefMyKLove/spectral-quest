import { create } from 'zustand';
import type { Difficulty } from '../config/gameConfig';

interface Chronicle {
  layer: number;
  time: number;
  essence: number;
  shards: number;
  dronesDestroyed: number;
  routeSVG: string;
}

interface GameState {
  // Current session
  currentLayer: number;
  essence: number;
  shards: number;
  timer: number;
  dronesDestroyed: number;
  
  // Progression
  chronicles: Chronicle[];
  selectedSkin: string;
  difficulty: Difficulty;
  
  // Actions
  setLayer: (layer: number) => void;
  addEssence: (amount: number) => void;
  drainEssence: (amount: number) => void;
  addShard: () => void;
  removeShard: () => void;
  incrementDrones: () => void;
  decrementTimer: (delta: number) => void;
  resetTimer: () => void;
  addChronicle: (chronicle: Chronicle) => void;
  resetForNewLayer: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
}

export const useGameState = create<GameState>((set) => ({
  // Initial state
  currentLayer: 1,
  essence: 150,
  shards: 0,
  timer: 180,
  dronesDestroyed: 0,
  chronicles: [],
  selectedSkin: 'rainbow-activist',
  difficulty: 'weaver',
  
  // Actions
  setLayer: (layer) => set({ currentLayer: layer }),
  
  addEssence: (amount) => set((state) => ({ 
    essence: Math.min(200, state.essence + amount) 
  })),
  
  drainEssence: (amount) => set((state) => ({ 
    essence: Math.max(0, state.essence - amount) 
  })),
  
  addShard: () => set((state) => ({ shards: state.shards + 1 })),
  
  removeShard: () => set((state) => ({ 
    shards: Math.max(0, state.shards - 1) 
  })),
  
  incrementDrones: () => set((state) => ({ 
    dronesDestroyed: state.dronesDestroyed + 1 
  })),
  
  decrementTimer: (delta) => set((state) => ({ 
    timer: Math.max(0, state.timer - delta) 
  })),
  
  resetTimer: () => set({ timer: 180 }),
  
  addChronicle: (chronicle) => set((state) => ({ 
    chronicles: [...state.chronicles, chronicle] 
  })),
  
  resetForNewLayer: () => set((state) => ({
    essence: 150,
    shards: 0,
    timer: 180,
    dronesDestroyed: 0,
    currentLayer: state.currentLayer + 1
  })),
  setDifficulty: (difficulty: Difficulty) => set({ difficulty })
}));