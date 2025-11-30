// store/gameState.ts
import { create } from 'zustand';
import { GAME_CONSTANTS } from '../config/layers';

interface GameState {
  currentLayer: number;
  essence: number;
  shards: number;
  timer: number;
  dronesDestroyed: number;
  chronicles: any[];

  // Actions
  resetTimer: () => void;
  decrementTimer: (delta: number) => void;
  addChronicle: (data: any) => void;
}

export const gameState = create<GameState>((set, get) => ({
  currentLayer: 1,
  essence: GAME_CONSTANTS.STARTING_ESSENCE,
  shards: 0,
  timer: GAME_CONSTANTS.TIMER,
  dronesDestroyed: 0,
  chronicles: [],

  resetTimer: () => set({ timer: GAME_CONSTANTS.TIMER }),
  decrementTimer: (delta) => set((state) => ({ timer: Math.max(0, state.timer - delta) })),
  addChronicle: (data) => set((state) => ({ chronicles: [...state.chronicles, data] })),
}));