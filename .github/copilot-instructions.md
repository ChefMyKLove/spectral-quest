## Quick context for AI contributors

- Project type: Phaser 3 game written in TypeScript and bundled with Vite (custom `rolldown-vite` alias). Entry: `src/main.ts` -> `index.html`.
- Run dev: `npm run dev` (runs `vite`). Build: `npm run build` (runs `tsc && vite build`). Preview: `npm run preview`.
- Key directories: `src/scenes` (game flow & screens), `src/entities` (Phaser sprites), `src/systems` (utility systems like `RouteRecorder`), `src/config` (constants), `src/store` (Zustand game state).

## Architecture & component boundaries (why it’s organized this way)

- Scenes own high-level flow and orchestration: look at `src/scenes/BootScene.ts`, `src/scenes/MenuScene.ts`, `src/scenes/ChronicleScene.ts`, and `src/scenes/layers/*` (e.g. `CrimsonLayer.ts`). Scenes create entities, UI, and schedule timed events.
- Entities are small Phaser classes that extend `Phaser.Physics.Arcade.Sprite` and call `scene.add.existing(this)` + `scene.physics.add.existing(this)` in their constructor (see `src/entities/Lirien.ts`, `Essence.ts`, `Shard.ts`). Use this pattern when adding new interactive objects.
- Systems are pure-ish helpers with no Phaser dependencies where reasonable (e.g., `src/systems/RouteRecorder.ts` records player coordinates and exports `toSVG()` for chronicle/NFT data).
- Global config/constants live in `src/config/*` (central source of truth for gameplay numbers and physics). Scenes and entities consume these constants rather than hardcoding values.
- Global mutable state is managed through a single Zustand store: `src/store/gameState.ts`. Code generally reads/writes via `useGameState.getState()` where game loops or non-react code needs synchronous access.

## Useful patterns & idioms (copyable examples)

- Spawn timed events: use `this.time.addEvent({ delay, callback, loop: true })` in a Scene (see `LayerScene.startEssenceSpawning`).
- Spawn one-off delayed waves: `this.time.delayedCall(delay, () => { /* spawn */ })` (see `startShardWaves` / `spawnShardWave`).
- Group-managed children: `this.add.group({ classType: Essence, runChildUpdate: true })` — new objects can be `this.essences.add(new Essence(this, x, y))` and the group will call `update` on them each frame.
- Collision-by-distance: many pickups use distance checks instead of Arcade overlap (see `Essence.checkCollision` and `Shard.checkCollision` using `Phaser.Math.Distance.Between`).
- UI anchored to camera: use `this.add.container(0,0).setScrollFactor(0)` for HUD that shouldn't move with camera (see `LayerScene.createUI`).
- Camera & world bounds: `this.cameras.main.setBounds(...)` and `this.physics.world.setBounds(...)` are used in `LayerScene.create()`; keep sizes in `GAME_CONSTANTS` (`src/config/layers.ts`).

## Common developer tasks & where to look

- Add a new layer scene: clone `src/scenes/layers/CrimsonLayer.ts` -> adjust `LayerConfig` in `src/config/layers.ts` and add the scene class to `src/main.ts` scene list.
- Add a new entity: follow `Lirien`, `Essence`, `Shard` constructors (add to scene via `add.existing` / `physics.add.existing`, and register animations/tweens inside constructor).
- Adjust physics/debugging: toggle `debug` in `src/config/physics.ts` (set `arcade.debug = true`) to see Arcade bodies.
- State changes: prefer `useGameState.getState().<action>()` in scene/entity logic. Examples: `useGameState.getState().addShard()` and `useGameState.getState().drainEssence(amount)`.

## Build / run / debug commands (exact)

- Install: `npm install`
- Dev server (fast reload in browser): `npm run dev` (Vite). Open the dev URL printed by Vite (default http://localhost:5173).
- Build for production: `npm run build` (runs `tsc` type-check then `vite build`). Note: tsconfig has `noEmit: true` so `tsc` is only used to type-check the project before bundling.
- Preview the production build: `npm run preview`.

## External deps & integration points

- Phaser 3 for the game engine (`phaser`). Scenes/entities/systems assume Arcade physics.
- Zustand for in-memory game state (`src/store/gameState.ts`) used widely across scenes and entities.
- `@handcash/sdk` is present in package.json — look for future integration points (not currently referenced extensively in core files). Be cautious when touching payment/NFT code; review usages before changing.

## Project-specific conventions (don’t violate these)

- Entities should call `scene.add.existing(this)` and `scene.physics.add.existing(this)` in their constructor.
- Shared constants belong in `src/config/*`. Avoid scattering magic numbers (e.g., arena sizes, timers, collect radii).
- Scenes create UI via a container with `setScrollFactor(0)` for HUDs; keep depth ordering consistent (UI uses depth >= 1000 in `LayerScene`).
- Use groups with `runChildUpdate: true` for collections of objects that have their own `update()`.
- Prefer distance-based pickup checks for collectibles (consistent gameplay feel across layers).

## Small gotchas

- The project uses placeholder remote assets loaded in `BootScene.ts` — switching to local assets requires updating asset keys and URLs in `BootScene` and ensuring the files are available to Vite's dev server (public/ or import).
- TypeScript is strict; new code must satisfy strict compiler options (see `tsconfig.json`). Fix types or add narrow casts rather than disabling compiler checks.

## Where to add tests or changes

- There are no test harness files currently. If you add tests, prefer small unit tests for pure systems (e.g., `RouteRecorder`) and integration checks for store actions (Zustand functions).

---
If anything above is unclear or you want more detail for a specific area (scene flow, entity lifecycle, or NFT/chronicle integration), tell me which part to expand or point me to specific files to inspect and I'll iterate.
