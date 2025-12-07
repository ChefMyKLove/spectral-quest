# Spectral Quest: Rainbow Craft - Complete Project Context

**Document Version:** 1.0  
**Date:** Current  
**Purpose:** Complete context for continuing development in another AI model session

---

## 📋 PROJECT OVERVIEW

**Spectral Quest: Rainbow Craft** is a precision platformer built with Phaser 3, TypeScript, and Zustand. The player controls **Lirien**, a unicorn weaver collecting numbered motes across seven spectral layers (Crimson, Amber, Yellow, Green, Blue, Indigo, Violet) to restore the shattered Spectral Core and save cousin Maxim.

### Core Gameplay Loop
1. Player starts with full energy (150/150) at bottom of arena
2. Collect numbered motes in sequence (1, 2, 3...) scattered across arena
3. Avoid binary wrap (growing from bottom) and hostile drones
4. Collect energy particles to maintain flight
5. Complete level by collecting all motes before wrap consumes arena
6. Progress through 7 levels with increasing difficulty

---

## 🗂️ COMPLETE FILE STRUCTURE

```
spectral-quest/
├── index.html                 # Main HTML entry point
├── package.json               # Dependencies and scripts
├── vite.config.ts            # Vite build configuration
├── tsconfig.json             # TypeScript configuration
│
├── src/
│   ├── main.ts               # Game entry point, Phaser config, scene registration
│   │
│   ├── config/
│   │   ├── gameConfig.ts     # ✅ MASTER CONFIG: All game constants, levels, difficulty settings
│   │   ├── layers.ts         # Layer configuration (legacy?)
│   │   └── physics.ts        # Physics configuration
│   │
│   ├── scenes/
│   │   ├── BootScene.ts      # Initial loading/splash screen
│   │   ├── MainMenu.ts       # Main menu with difficulty selection and test mode
│   │   ├── BaseLevel.ts      # ✅ BASE CLASS: All level logic (spawning, collisions, UI, etc.)
│   │   ├── LevelComplete.ts  # Level completion screen with minting
│   │   ├── GameOver.ts       # Game over screen with minting
│   │   │
│   │   └── levels/           # ✅ 7 LEVEL SCENES (all extend BaseLevel)
│   │       ├── CrimsonLevel.ts   # Level 0: 7 motes, tutorial overlay
│   │       ├── AmberLevel.ts     # Level 1: 12 motes
│   │       ├── YellowLevel.ts    # Level 2: 18 motes
│   │       ├── GreenLevel.ts     # Level 3: 24 motes
│   │       ├── BlueLevel.ts      # Level 4: 35 motes
│   │       ├── IndigoLevel.ts    # Level 5: 44 motes
│   │       └── VioletLevel.ts    # Level 6: 49 motes
│   │
│   ├── entities/             # ✅ GAME OBJECTS (extend Phaser sprites)
│   │   ├── Lirien.ts         # Player character (movement, shooting, collisions)
│   │   ├── Drone.ts          # Harvester & Hostile drones
│   │   ├── Mentor.ts         # Mentor NPCs that appear randomly
│   │   ├── Essence.ts        # Energy particles (small collectibles)
│   │   └── Shard.ts          # Projectiles/shot sprites
│   │
│   ├── store/
│   │   ├── gameStore.ts      # ✅ ZUSTAND STORE: Global game state management
│   │   └── gameState.ts      # TypeScript interfaces/types
│   │
│   ├── systems/
│   │   ├── bsv/              # Bitcoin SV integration (wallet, minting)
│   │   │   ├── config.ts
│   │   │   └── walletAdapter.ts
│   │   └── RouteRecorder.ts  # Records player path for SVG export
│   │
│   ├── utils/
│   │   └── backgroundCycle.ts # Image cycling utility
│   │
│   └── styles/
│       └── carousel.css      # CSS styles (for reference)
│
├── docs.html                 # Comprehensive HTML documentation page (created for user)
└── PROJECT_CONTEXT.md        # This file
```

---

## 🛠️ TECHNICAL STACK

### Core Technologies
- **Phaser 3** (`^3.80.1`) - Game framework
- **TypeScript** (`~5.9.3`) - Primary language
- **Zustand** (`^5.0.8`) - State management
- **Vite** (`npm:rolldown-vite@7.1.14`) - Build tool & dev server

### Bitcoin SV Integration
- **@babbage/sdk-ts** (`^0.2.75`) - Babbage wallet SDK
- **@bsv/sdk** (`^1.9.17`) - Bitcoin SV SDK

### Build Commands
```bash
npm run dev      # Start dev server (port 5173, host 0.0.0.0)
npm run build    # TypeScript compile + Vite build
npm run preview  # Preview production build
```

---

## 🎮 GAME MECHANICS & SYSTEMS

### 1. Energy System (UNIVERSAL - All Levels)
- **Starting Energy:** 150/150 (full tank)
- **Max Energy:** 150
- **Flying Drain:** 1.0/second (holding movement)
- **Gliding Drain:** 0.2/second (no input, falling)
- **Shooting Cost:** 10 per shot
- **Cloud Regen:** 8/second (while in cloud)
- **Particle Collection:** +30 per particle
- **Recovery Threshold:** 10 energy minimum to recover from tumbling

### 2. Levels & Motes
| Level | Name | Index | Motes | Time (s) | Mentor | Shooting Unlock |
|-------|------|-------|-------|----------|--------|-----------------|
| 1 | Crimson Aether | 0 | 7 | 120 | Umber (4x) | 1 mote |
| 2 | Amber Flux | 1 | 12 | 130 | Calen (3x) | 2 motes |
| 3 | Solar Rift | 2 | 18 | 140 | Sol (3x) | 3 motes |
| 4 | Verdant Pulse | 3 | 24 | 150 | Veyra (3x) | 4 motes |
| 5 | Azure Void | 4 | 35 | 160 | Zorah (3x) | 5 motes |
| 6 | Indigo Veil | 5 | 44 | 170 | Nyx (2x) | 6 motes |
| 7 | Violet Crown | 6 | 49 | 180 | Sylvara (2x) | 7 motes |

**Important:** Motes must be collected in sequence (1, 2, 3...). Collecting out of order is tracked but doesn't prevent completion.

### 3. Binary Wrap
- Grows from bottom of arena upward
- Growth: 70% time-based, 30% from harvester drones reaching Maxim
- Collision detection: 3-second grace period, 5% minimum height
- Player death if consumed by wrap

### 4. Drones
- **Harvester Drones:** Collect energy, return to bottom. If they reach Maxim, binary wrap grows.
- **Hostile Drones:** Only attack if player has collected more than 1 mote. Chase player to knock motes loose.

### 5. Lives System
- Starting lives: 3
- Max lives: 4
- Lose life on death (binary wrap crash or bottom crash)
- Game over when lives reach 0

### 6. Difficulty Modes
- **Dreamer:** 1.5x time, 0.7x drone speed, 0.7x energy drain
- **Weaver:** 1.0x (standard)
- **Dancer:** 0.8x time, 1.2x drone speed, 1.2x energy drain
- **Master:** 0.6x time, 1.5x drone speed, 1.4x energy drain

---

## 🔧 KEY CODE STRUCTURE

### BaseLevel.ts (Most Important File)
**Location:** `src/scenes/BaseLevel.ts`  
**Purpose:** Base class for all 7 levels. Handles:
- Background creation (solid gradient during gameplay)
- Player creation and initialization
- Mote spawning (scattered across arena, high up)
- Energy particle spawning (40 immediate near start, then continuous)
- Binary wrap creation and growth
- Collision detection (wrap, motes, energy, clouds, drones)
- UI (energy bar, mote counter, timer)
- Level completion logic
- Death handling (with modal showing cause)
- Test mode support

**Key Methods:**
- `create()` - Main initialization
- `spawnMotes()` - Creates motes from config
- `startEnergySpawning()` - Spawns energy particles
- `checkBinaryWrapCollision()` - Wrap collision detection
- `onPlayerCrash()` - Bottom crash handler
- `onPlayerConsumedByWrap()` - Wrap death handler
- `onLevelComplete()` - Level win handler
- `update()` - Main game loop

### gameStore.ts (State Management)
**Location:** `src/store/gameStore.ts`  
**Purpose:** Zustand store managing global game state

**Key State:**
- `phase`: 'menu' | 'playing' | 'paused' | 'complete' | 'gameOver'
- `energy`: Current energy (0-150)
- `motes`: Array of MoteData
- `motesCollected`: Count of collected motes
- `lives`: Remaining lives
- `currentLevelIndex`: 0-6
- `timeRemaining`: Level timer
- `binaryWrapHeight`: 0-1 percentage

**Key Actions:**
- `startLevel(levelIndex)` - Resets state, sets energy to MAX
- `drainEnergy(amount)` - Drains energy (no tumbling check)
- `collectMote(moteId)` - Marks mote collected, checks completion
- `loseLife(deathType)` - Decrements lives, returns false if game over
- `setPhase(phase)` - Changes game phase

### gameConfig.ts (Master Configuration)
**Location:** `src/config/gameConfig.ts`  
**Purpose:** Single source of truth for all game constants

**Key Exports:**
- `LEVELS[]` - Array of level configurations
- `GAME` - Object with all game constants
- `DIFFICULTIES` - Difficulty multipliers
- `RARITY_ORDER` - Card rarity system

**Important:** All energy/difficulty values are defined here and used universally across all levels. No level-specific overrides.

---

## 🐛 FIXES & CHANGES MADE (Recent Session)

### 1. Energy System Overhaul
**Problem:** Player starting with no energy, falling immediately  
**Fix:**
- `STARTING_ENERGY`: 75 → 150 (full tank)
- `ENERGY_DRAIN_FLYING`: 4 → 1.0 (much slower)
- `ENERGY_DRAIN_GLIDING`: 1 → 0.2 (minimal)
- `ENERGY_FROM_PARTICLE`: 5 → 30 (much more meaningful)
- `ENERGY_REGEN_CLOUD`: 5 → 8 (better regen)
- `FALL_RECOVERY_THRESHOLD`: 20 → 10 (easier recovery)
- `ENERGY_DRAIN_SHOOTING`: 15 → 10 (reduced cost)
- `gameStore.startLevel()`: Now sets energy to `GAME.MAX_ENERGY` every level
- `BaseLevel.startEnergySpawning()`: Spawns 40 immediate particles near player start

### 2. Mote Spawning Improvements
**Problem:** Only 6 motes in level 2 (should be 12)  
**Fix:**
- Added comprehensive logging to `spawnMotes()` method
- Added verification checks in `init()` method
- Verified level indices are correct (0-6)
- All levels now properly use `this.levelConfig.moteCount`

### 3. Death Handling Fixes
**Problem:** Game freezing on binary wrap crash  
**Fix:**
- Changed `store.setGamePhase('paused')` → `store.setPhase('paused')`
- Added `this.time.removeAllEvents()` to clear timers
- Removed `this.time.paused = true` (conflicted with delayedCall)
- Added `showDeathScreen()` modal with cause and lives remaining

### 4. Level Completion Fix
**Problem:** Level not ending after collecting all motes  
**Fix:**
- Moved `useGameStore.getState()` call AFTER `store.collectMote()` in `onMoteCollision`
- Ensures completion check uses updated `motesCollected` count

### 5. Hostile Drone Fix
**Problem:** Drones not attacking player  
**Fix:**
- Moved `motesCollected > 1` check to `update()` method before `chaseTarget()`
- Ensures drones only chase when player has enough motes

### 6. Energy Collection While Tumbling
**Problem:** Can't collect energy particles while tumbling  
**Fix:**
- Removed `isTumbling` check from `drainEnergy()` function
- `collectEnergy()` now calls `setTumbling(false)` when energy collected

### 7. Test Mode Implementation
**Feature:** Press 'T' key to toggle test mode, select any level  
**Implementation:**
- Added `TEST_MODE` global variable in `main.ts`
- Added keyboard listener in `main.ts`
- Test mode panel in `MainMenu.ts` for level selection

### 8. Vite Configuration
**Fix:** Dev server binding issues  
**Solution:**
- Created `vite.config.ts` with `host: '0.0.0.0'` and `port: 5173`
- Ensures consistent network binding

---

## ⚠️ KNOWN ISSUES & TODO

### Current Issue: Mote Count Verification
**Status:** In Progress  
**Problem:** Level 2 (Amber) showing only 6 motes instead of 12  
**Action Taken:** Added comprehensive logging to diagnose issue  
**Next Steps:** Check console logs during gameplay to identify where count drops

### Pending Features (From User Requests)
1. **Harvester Drones:** Need implementation (currently missing)
   - Spawn from bottom (Maxim location)
   - Collect energy particles randomly
   - Return to bottom when collected 15 energy
   - Grow binary wrap when they reach Maxim

2. **Maxim Character:** Evil cyborg unicorn at bottom building wrap
   - Visual representation at wrap starting point
   - Animations/interactions

3. **Spectral Core:** Broken core in lower quadrant
   - Gradual rebuilding visual per level
   - Adjacent to arena or at wrap start corner

4. **Mote Ejection:** Q key to eject motes
   - Restore order if drone knocks motes out of sequence
   - Selection screen or simple sequential drop

5. **Minting Animation:** Card placeholder spinning
   - "Successfully minted 'rare' Rainbow card" or "Successfully minted 'common' Binary card"
   - On LevelComplete and GameOver screens

---

## 🎨 VISUAL & UI DETAILS

### Backgrounds
- **Gameplay:** Solid color gradient (no image cycling during play)
- **Menus:** Image cycling with cross-fade transitions
- **Tutorial (Level 1):** Image cycling background with fallback gradient

### Glassmorphism Aesthetic
- Transparent backgrounds with backdrop blur
- Smooth animations and transitions
- Modern UI design throughout

### Energy Particles
- All same color per level (no mixed colors)
- Slight size variation
- Fade in/out animation
- Immediate visibility when spawned at level start

### Motes
- Numbered (1, 2, 3...)
- Scattered high in arena (Y: 200-1800)
- Respawn if consumed by binary wrap
- Sequence number tracking for collection order

---

## 🔄 GAME FLOW

### Scene Progression
```
BootScene → MainMenu → [Level Scene] → LevelComplete → [Next Level] OR GameOver
```

### Level Flow
1. `BaseLevel.create()` called
2. Store initialized via `store.startLevel(levelIndex)`
3. Background created
4. Motes spawned via `spawnMotes()` (uses `this.levelConfig.moteCount`)
5. Energy particles start spawning (40 immediate + continuous)
6. Player created at bottom
7. Binary wrap initialized at bottom
8. UI created (timer, energy bar, mote counter)
9. Game loop starts (`update()`)
10. On completion: pause → `LevelCompleteScene`
11. On death: lose life → restart or `GameOverScene`

---

## 📝 IMPORTANT CODE PATTERNS

### Creating Entities
```typescript
// Entities extend Phaser.Physics.Arcade.Sprite
export class Lirien extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'lirien');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    // ... setup
  }
}
```

### Accessing Store
```typescript
const store = useGameStore.getState();
store.addEnergy(30);
const energy = store.energy; // Read value
```

### Spawning Timed Events
```typescript
// Continuous spawning
this.time.addEvent({
  delay: 50,
  callback: this.spawnEnergyParticle,
  callbackScope: this,
  loop: true
});

// One-off delayed
this.time.delayedCall(2000, () => {
  this.doSomething();
});
```

### Collision Detection
```typescript
this.physics.add.overlap(
  this.player,
  this.moteSprites,
  this.onMoteCollision,
  undefined,
  this
);
```

---

## 🔍 DEBUGGING TIPS

### Console Logs
The codebase has extensive logging:
- `=== SPAWNING MOTES ===` - Mote spawning process
- `[STORE]` - Store operations
- `Creating level:` - Level initialization
- Death causes and lives remaining

### Test Mode
- Press 'T' in game to toggle test mode
- Access from MainMenu to jump to any level
- Useful for testing specific levels quickly

### Phaser Debug
- Set `debug: true` in `main.ts` physics config to see collision boxes
- Access game instance via `window.game` in browser console

---

## 📚 KEY LEARNING RESOURCES

### Technologies
- **Phaser 3:** https://phaser.io/learn
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Zustand:** https://docs.pmnd.rs/zustand/getting-started/introduction
- **Vite:** https://vitejs.dev/guide/

### Game Development Concepts
- Scene management (Phaser scenes)
- Physics bodies (Arcade physics)
- State management (Zustand patterns)
- Collision detection
- Timed events and spawning

---

## 🎯 CURRENT DEVELOPMENT PRIORITIES

1. **Verify Mote Spawning** - Ensure all levels spawn correct number of motes
2. **Implement Harvester Drones** - Critical missing feature
3. **Add Maxim Character** - Visual representation at bottom
4. **Spectral Core Visual** - Progressive rebuilding per level
5. **Mote Ejection System** - Q key functionality
6. **Minting Animations** - Card spinning animation on completion

---

## 📧 NOTES FOR NEXT SESSION

### When Continuing Development
1. Check browser console for mote spawning logs
2. Verify `this.levelConfig.moteCount` matches expected values
3. All energy logic is UNIVERSAL - changes to `gameConfig.ts` affect all levels
4. Test mode available (press 'T') for quick level testing
5. `BaseLevel.ts` is the most complex file - handles all level logic
6. Store state is global - use `useGameStore.getState()` for access

### File Modification Priorities
- **gameConfig.ts** - Change any game constants (energy, timers, etc.)
- **BaseLevel.ts** - Modify level behavior, spawning, collisions
- **gameStore.ts** - Adjust state management logic
- **Individual Level Files** - Only for level-specific overrides (rarely needed)

---

## ✅ VERIFIED WORKING FEATURES

- ✅ Energy system (universal across all levels)
- ✅ Mote collection with sequence tracking
- ✅ Binary wrap growth and collision
- ✅ Level progression (7 levels)
- ✅ Lives system
- ✅ Death handling with modals
- ✅ UI (energy bar, timer, mote counter)
- ✅ Test mode (press 'T')
- ✅ Difficulty selection
- ✅ Main menu and level complete screens

---

## 🚧 PARTIALLY IMPLEMENTED

- ⚠️ Hostile drones (attacking works, but may need tuning)
- ⚠️ Harvester drones (mentioned but not fully implemented)
- ⚠️ Mentor NPCs (structure exists, may need testing)
- ⚠️ Minting UI (buttons exist, animation pending)

---

## 📖 ADDITIONAL CONTEXT

### User Feedback Patterns
- User values thoroughness: "slow down there AI take your time... i don't think this is the game we want to ship.... we have lots of work to do... let's make every commit count"
- Energy balance is critical - user was very frustrated with instant energy drain
- Visual consistency important - same color energy particles per level, consistent aesthetics

### Design Philosophy
- Universal mechanics across all levels (energy, difficulty)
- Centralized configuration (gameConfig.ts)
- Clear separation: BaseLevel for shared logic, individual levels for overrides
- Glassmorphism aesthetic throughout
- Precision platformer gameplay with meaningful choices

---

**END OF PROJECT CONTEXT DOCUMENT**

This document should provide complete context for continuing development. Refer to specific file paths and code patterns when making changes. All game constants are in `src/config/gameConfig.ts` - modify there for universal changes.

