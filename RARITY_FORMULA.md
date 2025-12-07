# Card Rarity Calculation Formula

## Overview
Card rarity is calculated in `src/store/gameStore.ts` in the `completeLevel()` function. The formula considers sequence accuracy, mote collection, badges, time remaining, and special achievements.

## Rarity Tiers (in order)
```
common → uncommon → rare → epic → legendary → mythic → ultimate → prismatic_ultimate → defiant_ultimate
```

## Calculation Process

### Step 1: Check for Special Ultimates (Highest Priority)

#### Defiant Ultimate (LOSE only)
- **Condition**: `outcome === 'lose'` AND `badges.includes('defiant_ultimate')`
- **Requires**: All defiant badges earned on a loss
- **Result**: `defiant_ultimate`

#### Prismatic Ultimate (WIN only)
- **Condition**: `outcome === 'win'` AND perfect sequence on all 7 levels
- **Check**: `allSequencesPerfect && sequencePerfect && allCompleted >= 7`
- **Result**: `prismatic_ultimate`

---

### Step 2: Base Rarity Calculation (WIN outcomes)

#### Key Metrics
- **sequenceRatio** = `sequenceCorrect / moteCount` (0.0 to 1.0)
- **allMotesCollected** = `motesCollected === moteCount` (boolean)
- **sequencePerfect** = All motes collected in perfect order (boolean)

#### Base Rarity Rules (WIN)

| Condition | Rarity |
|-----------|--------|
| `sequencePerfect && allMotesCollected` | **Ultimate** |
| `sequenceRatio >= 0.9 && allMotesCollected` | **Mythic** |
| `sequenceRatio >= 0.7 && allMotesCollected` | **Legendary** |
| `sequenceRatio >= 0.5 && allMotesCollected` | **Epic** |
| `allMotesCollected` (but poor sequence) | **Rare** |
| `sequenceRatio >= 0.8` (but missing motes) | **Uncommon** |
| Default | **Common** |

**Formula**: `sequenceRatio = sequenceCorrect / moteCount`

---

### Step 3: Rarity Boosts (WIN only, applied after base rarity)

Boosts are added to the base rarity but cannot exceed `ultimate` (unless it's already `prismatic_ultimate`).

#### Badge Boosts
- **flawless** (full lives): `+1.0`
- **harmonic** (perfect sequence badge): `+1.0`
- **mentor_blessed**: `+0.5`
- **drone_denial**: `+0.5`

#### Time Boosts
- **timeRatio > 0.75** (75%+ time remaining): `+0.5`
- **timeRatio > 0.5** (50%+ time remaining): `+0.5`

**Formula**: `timeRatio = timeRemaining / totalTime`

#### Boost Application
```typescript
rarityBoost = sum of all applicable boosts
currentIndex = RARITY_ORDER.indexOf(finalRarity)
boostedIndex = min(currentIndex + floor(rarityBoost), indexOf('ultimate'))
finalRarity = RARITY_ORDER[boostedIndex]
```

**Note**: Boosts are only applied if `finalRarity !== 'ultimate' && finalRarity !== 'prismatic_ultimate'`

---

### Step 4: Loss Outcomes (Lower Rarities)

For `outcome === 'lose'` (and not `defiant_ultimate`):

#### Key Metrics
- **sequenceRatio** = `sequenceCorrect / motesCollected` (0.0 to 1.0)
- **partialSequencePerfect** = Perfect sequence on collected motes (boolean)

#### Loss Rarity Rules

| Condition | Rarity |
|-----------|--------|
| `partialSequencePerfect && motesCollected >= 80% of moteCount` | **Uncommon** |
| `sequenceRatio >= 0.7 && motesCollected > 0` | **Rare** |
| `motesCollected > 0` | **Uncommon** |
| Default (no motes) | **Common** |

**Note**: Loss outcomes do NOT receive rarity boosts.

---

## Complete Formula Summary

### For WIN Outcomes:
```
1. Check Prismatic Ultimate (perfect on all 7 levels)
2. Calculate base rarity from sequenceRatio and allMotesCollected
3. Apply boosts from badges and time
4. Cap at 'ultimate' (unless already prismatic_ultimate)
```

### For LOSE Outcomes:
```
1. Check Defiant Ultimate (all defiant badges)
2. Calculate rarity from partialSequencePerfect and sequenceRatio
3. No boosts applied
```

## Example Calculations

### Example 1: Perfect Win
- Sequence: Perfect (7/7 correct)
- Motes: All collected (7/7)
- Badges: flawless, harmonic
- Time: 80% remaining
- **Base**: Ultimate
- **Boosts**: +1 (flawless) + 1 (harmonic) + 0.5 (time) = +2.5
- **Result**: Ultimate (already max, boosts don't apply)

### Example 2: Good Win with Boosts
- Sequence: 8/12 correct (66.7%)
- Motes: All collected (12/12)
- Badges: mentor_blessed
- Time: 60% remaining
- **Base**: Epic (50%+ sequence + all motes)
- **Boosts**: +0.5 (mentor_blessed) + 0.5 (time) = +1.0
- **Result**: Legendary (Epic → +1 = Legendary)

### Example 3: Loss with Good Sequence
- Sequence: 5/7 collected, all in perfect order
- Motes: 5/7 collected (71%)
- **Result**: Uncommon (partialSequencePerfect + 71% > 80% threshold)

### Example 4: Prismatic Ultimate
- All 7 levels completed
- Perfect sequence on all 7 levels
- **Result**: Prismatic Ultimate (highest rarity)

## Code Location
- **File**: `src/store/gameStore.ts`
- **Function**: `completeLevel()`
- **Lines**: 630-758

## Rarity Order Array
```typescript
RARITY_ORDER = [
  'common',           // 0
  'uncommon',          // 1
  'rare',              // 2
  'epic',              // 3
  'legendary',         // 4
  'mythic',            // 5
  'ultimate',          // 6
  'prismatic_ultimate', // 7
  'defiant_ultimate'   // 8
]
```

