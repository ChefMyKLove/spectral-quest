# Spectral Quest: Rainbow Craft - Development Summary

## Project Overview

**Spectral Quest: Rainbow Craft** is a precision platformer game built with **Phaser 3**, **TypeScript**, **Vite**, and **Zustand**. The player controls Lirien, a unicorn weaver, collecting numbered motes across seven spectral levels to restore the shattered Spectral Core and save cousin Maxim from the binary wrap.

## Current State

### ✅ Completed Features

1. **Core Game Architecture**
   - Phaser 3 game setup with proper scene management
   - Zustand store for global game state management
   - TypeScript throughout for type safety
   - Vite build system with dev server

2. **Scene System**
   - **BootScene**: Loading screen with image cycling background and progress indicator
   - **MainMenu**: Difficulty selection, test mode (press T), cycling background images
   - **BaseLevel**: Base class for all game levels with shared functionality
   - **7 Level Scenes**: Crimson, Amber, Yellow, Green, Blue, Indigo, Violet (all extend BaseLevel)
   - **LevelComplete**: Post-level stats and minting interface
   - **GameOver**: Game over screen with minting options

3. **Game Mechanics**
   - **Player (Lirien)**: Flight mechanics with energy system
     - Energy drains while flying/gliding
     - Energy replenished by collecting particles and entering clouds
     - Tumbling state when energy depleted
     - Shooting mechanics (unlocked after collecting motes)
   - **Motes System**: Numbered collectibles that must be collected in sequence
     - Each level has specific mote count (7, 12, 18, 24, 35, 44, 49)
     - Sequence tracking for perfect runs
   - **Energy Particles**: Spawn throughout arena, replenish energy
   - **Clouds**: Energy regeneration zones
   - **Binary Wrap**: Growing threat from bottom of screen
   - **Drones**: 
     - Harvester drones (passive, collect energy)
     - Hostile drones (attack when player has >1 mote)
   - **Mentor System**: Appears at intervals, provides time bonuses

4. **Visual Systems**
   - Image cycling backgrounds (13 images with cross-fade transitions)
   - Floating rainbow bubbles
   - Glassmorphism UI effects
   - Gradient backgrounds during gameplay
   - Particle effects

5. **Game Configuration**
   - Centralized config in `src/config/gameConfig.ts`
   - Difficulty levels: Dreamer, Weaver, Dancer, Master
   - Level-specific settings (mote counts, time limits, mentor appearances)
   - Energy system parameters (drain rates, replenishment values)

6. **State Management**
   - Zustand store tracks:
     - Player energy, lives, motes collected
     - Game phase (menu, playing, paused, complete)
     - Level progression
     - Statistics (shots fired, drones destroyed, etc.)
     - Sequence correctness for perfect runs

## File Structure

```
src/
├── main.ts                    # Game entry point, scene registration
├── config/
│   └── gameConfig.ts          # Global game constants and level configs
├── store/
│   └── gameStore.ts           # Zustand state management
├── scenes/
│   ├── BootScene.ts           # Loading screen
│   ├── MainMenu.ts            # Main menu with difficulty selection
│   ├── BaseLevel.ts           # Base class for all levels (1970 lines)
│   ├── LevelComplete.ts       # Level completion screen
│   ├── GameOver.ts            # Game over screen
│   └── levels/
│       ├── CrimsonLevel.ts   # Level 1 (7 motes, tutorial)
│       ├── AmberLevel.ts      # Level 2 (12 motes)
│       ├── YellowLevel.ts     # Level 3 (18 motes)
│       ├── GreenLevel.ts      # Level 4 (24 motes)
│       ├── BlueLevel.ts       # Level 5 (35 motes)
│       ├── IndigoLevel.ts     # Level 6 (44 motes)
│       └── VioletLevel.ts     # Level 7 (49 motes, boss level)
├── entities/
│   ├── Lirien.ts              # Player character
│   └── Drone.ts               # Harvester and hostile drones
└── utils/
    └── backgroundCycle.ts     # Background image cycling utility
```

## Recent Work & Fixes

### Energy System Balancing
- **Starting Energy**: Set to 150 (max energy)
- **Energy Drain**: Reduced flying drain (4 → 1.0), gliding drain (1 → 0.2)
- **Energy Replenishment**: Increased particle value (5 → 30), cloud regen (5 → 8)
- **Initial Spawning**: 40 immediate energy particles near player start
- **Energy Collection**: Fixed to work while tumbling

### Level Progression
- All 7 levels created and registered
- Level completion properly transitions to next level
- Lives system implemented (game over after lives depleted)
- Test mode added (press T in MainMenu to jump to any level)

### Bug Fixes
1. **MainMenu.ts Corruption**: File was corrupted (only contained "a"), fully restored
2. **Game Freezing on Death**: Fixed physics pausing and state management
3. **Level Completion**: Fixed state update timing for mote collection checks
4. **Hostile Drones**: Fixed attack logic (only attack when player has >1 mote)
5. **Energy System**: Universal application across all levels via BaseLevel

### Current Issue: Mote Count Verification
- **Problem**: Level 2 (Amber) showing only 6 motes instead of 12
- **Status**: Added comprehensive logging to diagnose
- **Expected Counts**:
  - Level 1 (Crimson): 7 motes ✅
  - Level 2 (Amber): 12 motes ❌ (showing 6)
  - Level 3 (Yellow): 18 motes
  - Level 4 (Green): 24 motes
  - Level 5 (Blue): 35 motes
  - Level 6 (Indigo): 44 motes
  - Level 7 (Violet): 49 motes

## Key Systems & Mechanics

### Energy System
- **Max Energy**: 150
- **Drain Rates**: 
  - Flying: 1.0 per update
  - Gliding: 0.2 per update
  - Shooting: 10 per shot
- **Replenishment**:
  - Energy particles: +30 energy
  - Clouds: +8 energy per second
- **Tumbling**: When energy reaches 0, player falls and cannot fly until energy > 10

### Mote Collection
- Motes must be collected in sequence (1, 2, 3, ...)
- Sequence tracking for perfect run badges
- Motes spawn scattered throughout arena (high up, away from wrap)
- Motes respawn if consumed by binary wrap

### Binary Wrap
- Grows from bottom of screen
- Consumes player if they fall into it
- Consumes motes if they reach it (motes respawn)
- Grace period: 3 seconds after wrap reaches 5% of screen height

### Difficulty System
- **Dreamer**: Easiest (not fully implemented)
- **Weaver**: Standard difficulty
- **Dancer**: Harder (not fully implemented)
- **Master**: Hardest (not fully implemented)

## Technical Stack

- **Phaser 3**: Game framework
- **TypeScript**: Language
- **Vite**: Build tool and dev server (port 5173)
- **Zustand**: State management
- **HTML/CSS**: UI elements (glassmorphism styling)

## Development Server

- **Command**: `npm run dev`
- **Port**: 5173 (configured in `vite.config.ts`)
- **URL**: `http://localhost:5173`

## Known Issues & TODO

1. **Mote Count Verification**: Need to verify all levels spawn correct number of motes (Level 2 issue)
2. **Difficulty Scaling**: Dreamer, Dancer, Master not fully implemented
3. **Harvester Drones**: Not yet implemented (should collect energy and return to Maxim)
4. **Maxim Character**: Evil cyborg unicorn at bottom not yet implemented
5. **Spectral Core**: Broken core visualization in lower quadrant not yet implemented
6. **Minting System**: Placeholder buttons, actual minting not implemented
7. **Mote Ejection**: Q key to eject motes (mentioned but not implemented)
8. **Drone Collisions**: Player-drone collision mechanics need refinement
9. **Shooting Mechanics**: Basic implementation exists, may need balancing

## Code Quality Notes

- **BaseLevel.ts**: Large file (1970 lines) - contains all shared level logic
- **Logging**: Extensive console logging for debugging (can be cleaned up for production)
- **Error Handling**: Basic error handling in place, could be improved
- **Type Safety**: Good TypeScript usage throughout
- **State Management**: Clean Zustand implementation

## How to Continue Development

1. **Test Mote Spawning**: 
   - Check browser console logs when starting each level
   - Verify expected vs actual mote counts
   - Fix any discrepancies in `BaseLevel.spawnMotes()` or `gameStore.initializeMotes()`

2. **Implement Missing Features**:
   - Harvester drones (passive, collect energy, return to Maxim)
   - Maxim character sprite and behavior
   - Spectral Core visualization
   - Mote ejection system (Q key)
   - Full difficulty scaling

3. **Balance & Polish**:
   - Fine-tune energy values
   - Adjust drone behavior
   - Improve visual feedback
   - Add sound effects (not yet implemented)
   - Add particle effects for collisions

4. **Minting Integration**:
   - Connect mint buttons to actual blockchain/API
   - Implement card generation
   - Add rarity calculation logic

## Key Configuration Files

- **`src/config/gameConfig.ts`**: All game constants, level configs, difficulty settings
- **`src/store/gameStore.ts`**: State management, actions, getters
- **`src/scenes/BaseLevel.ts`**: Core gameplay logic (spawning, collisions, updates)
- **`vite.config.ts`**: Build configuration

## Important Notes for New Developers

1. **All levels extend BaseLevel**: Changes to BaseLevel affect all levels
2. **Global config in gameConfig.ts**: Modify `GAME` constants to change game-wide behavior
3. **State in Zustand store**: Game state is global, accessed via `useGameStore.getState()`
4. **Scene flow**: BootScene → MainMenu → Level → LevelComplete → Next Level (or GameOver)
5. **Test mode**: Press T in MainMenu to jump to any level for testing
6. **Image assets**: Background images should be in `public/images/` folder
7. **HTML integration**: MainMenu connects to buttons in `index.html`

## Recent Conversation Focus

The conversation primarily focused on:
1. Fixing energy system balance (starting energy, drain rates, replenishment)
2. Ensuring energy logic is universal across all levels
3. Fixing MainMenu.ts corruption
4. Adding mote count verification and logging
5. Debugging level progression and game state management

The game is in a playable state but needs mote count verification and several features still need implementation (harvester drones, Maxim, Spectral Core, etc.).

