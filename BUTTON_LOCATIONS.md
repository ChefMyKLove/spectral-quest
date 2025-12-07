# Button Modification Guide

## Main Menu (Begin Page) Buttons

### Location: `index.html`

1. **Difficulty Selection Buttons** (Dreamer, Weaver, Dancer, Master)
   - Lines: **181-554**
   - Each button has inline styles and HTML structure
   - Event handlers in: `src/scenes/MainMenu.ts` → `setupHTMLMenu()` (line 103)

2. **START Button**
   - Lines: **559-602**
   - Event handler in: `src/scenes/MainMenu.ts` → `setupHTMLMenu()` (line 159)

3. **Wallet Button**
   - Lines: **614-655**
   - Event handler in: `src/scenes/MainMenu.ts` → `setupHTMLMenu()` (line 182)

**To modify:** Edit the HTML in `index.html` and/or the event handlers in `src/scenes/MainMenu.ts`

---

## Level Begin Page (Tutorial) Buttons

### Location: `src/scenes/levels/CrimsonLevel.ts`

1. **BEGIN! Button**
   - Method: `showTutorial()` (line 47)
   - Button creation: **Lines 98-159**
   - Visual style: Lines 99-110
   - Interaction: Lines 116-159

**To modify:** Edit the `showTutorial()` method in `CrimsonLevel.ts`

---

## Level End Page Buttons

### Location: `src/scenes/LevelComplete.ts`

1. **MINT CARD Button**
   - Method: `create()` (line 41)
   - Button creation: **Lines 140-165**
   - Visual style: Lines 141-150
   - Interaction: Lines 152-165

2. **CONTINUE/BOSS BATTLE Button**
   - Method: `create()` (line 41)
   - Button creation: **Lines 167-216**
   - Visual style: Lines 173-183
   - Interaction: Lines 186-216

**To modify:** Edit the `create()` method in `LevelComplete.ts`

---

## Quick Reference

| Button Type | File | Lines |
|------------|------|-------|
| Difficulty buttons | `index.html` | 181-554 |
| START button | `index.html` | 559-602 |
| Wallet button | `index.html` | 614-655 |
| BEGIN! (level start) | `src/scenes/levels/CrimsonLevel.ts` | 98-159 |
| MINT CARD | `src/scenes/LevelComplete.ts` | 140-165 |
| CONTINUE/BOSS BATTLE | `src/scenes/LevelComplete.ts` | 167-216 |

