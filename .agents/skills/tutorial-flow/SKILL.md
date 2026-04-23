---
name: tutorial-flow
description: Guides agents on implementing, debugging, and extending the in-game tutorial flow in Strategic Ludo. Use when changing tutorial steps, trigger actions, anchor targets, overlay behavior, or tutorial persistence/completion logic.
version: 1.0.0
license: MIT
---

# Tutorial Flow

## When to Use This Skill

Use this skill when the user asks to:
- change tutorial step order or wording
- add/remove a tutorial step
- change which action advances a step
- target a tip ring/popup to a real UI element
- update tutorial completion or reopen behavior
- fix blocked touches caused by the tutorial overlay

## Primary File Anchors

- `assets/store/tutorialSlice.jsx`
  - source of truth for tutorial state and step progression
- `GameComponents/TutorialGuide.jsx`
  - visual step content, popup, target ring, step badge
- `Menu/GameScreen.jsx`
  - tutorial start/reopen hooks and turn-change action dispatch
  - one-time tutorial board setup effects
- `GameComponents/Bases.jsx`
  - card/enter button action dispatches and measured anchors
- `GameComponents/SmalBoard.jsx`
  - soldier selection dispatch and measured soldier anchor
- `GameComponents/Soldier.jsx`
  - selected visual state + `measureInWindow` reporting
- `assets/store/gameSlice.jsx`
  - capture detection and tutorial capture action dispatch
- `assets/shared/hardCodedData.js`
  - localized tutorial strings

## Current Flow (Repo Snapshot)

Tutorial uses zero-based step indices in Redux (`currentStep`).

1. Step 0: select a blue soldier
   - action: `markTutorialAction({ type: 'soldier_selected' })`
2. Step 1: play card value 6 as blue
   - action: `markTutorialAction({ type: 'card_played', value: 6, color: 'blue' })`
3. Step 2: wait until blue turn returns
   - action: `markTutorialAction({ type: 'turn_changed', activePlayer })`
   - guarded by `waitForBlueTurnReturn`
4. Step 3: enter blue soldier
   - action: `markTutorialAction({ type: 'enter_soldier', color: 'blue' })`
5. Step 4: click card 3 and capture red
   - first action: `card_played` with `value: 3`, `color: 'blue'`
   - completion action: `capture` with `actorColor: 'blue'` and captured `color: 'red'`

Completion occurs only after both final-step conditions are satisfied.

## Anchor Model and Positioning

Tutorial anchors are stored in `state.tutorial.anchorByStep` using `setTutorialAnchor({ step, anchor })`.

Current dynamic targets:
- step 0: blue soldier at `1a`
- step 1: blue card `6`
- step 3: blue enter-soldier button
- step 4: blue card `3`

`TutorialGuide.jsx` should consume `anchorByStep[safeStep]` and fall back to static layout when no anchor exists.

## Overlay and Touch Rules

- Keep tutorial overlay as absolute `View` with `pointerEvents="box-none"`.
- Do not switch to native `Modal` for the tip container; that can block board touches.
- Keep target ring `pointerEvents="none"`.

## Board/Step Setup Notes

When adding scenario-specific tutorial steps, prefer one-time setup in `GameScreen.jsx` gated by:
- `tutorialActive`
- exact `tutorialStep`
- a local `useRef` guard to avoid re-running setup every render

For this repo's board position format, use `number + category` (e.g. `3a`, not `a3`).

## Safe Edit Pattern for Step Changes

1. Update reducer transitions first in `tutorialSlice.jsx`.
2. Ensure required action payload fields are present where dispatched.
3. Update `TutorialGuide.jsx` steps array and badge denominator.
4. Update anchor producers (`Bases`, `SmalBoard`, `Soldier`) for any new target step.
5. Update localized strings in `hardCodedData.js`.
6. Verify tutorial start/reopen persistence behavior still works.

## Common Pitfalls

- Mismatch between displayed step count and reducer step count.
- Updating text without updating reducer transitions.
- Dispatching `card_played` without `color` when reducer now relies on it.
- Using `a3` instead of `3a` in soldier position updates.
- Forgetting to reset guard flags (`waitForBlueTurnReturn`, capture flags) in `startTutorial`/`skipTutorial`/`completeTutorial`.
- Re-running step setup effect and repeatedly mutating board state.

## Testing Guidance

At minimum, run:

```bash
npx jest Menu/GameScreen.test.jsx GameComponents/Bases.test.jsx --runInBand
```

If reducer behavior changed, add/update a reducer test for:
- exact step transitions
- guard flag behavior
- completion condition(s)

## UX Guidance

- Keep step text action-oriented and explicit about what to click.
- Hide target ring on pure wait steps if no clickable target is intended.
- Prefer measured anchors over hardcoded coordinates across screen sizes.
