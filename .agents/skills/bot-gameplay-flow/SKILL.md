---
name: bot-gameplay-flow
description: Guides agents on implementing, tuning, and debugging the offline bot gameplay flow in the Strategic Ludo app. Use when Codex needs to change bot turns, bot move selection, offline bot mode navigation, bot difficulty ideas, or tests for bot behavior.
---

# Bot Gameplay Flow

## Focus Area

Use this skill for work related to the app's offline bot mode and turn automation.

Primary code anchors in this repo:

- `Menu/HomeScreen.jsx` for entering offline mode
- `Menu/Home.jsx` for the offline mode choice modal
- `Menu/GameScreen.jsx` for bot turn logic
- `Menu/GameScreen.test.jsx` for regression coverage
- `assets/store/gameSlice.jsx` for turn and player state
- `GameComponents/Bases.logic` for move execution helpers

## Current Repo Behavior

The current bot flow is driven from `Menu/GameScreen.jsx`.

- Bot mode is selected by navigating to `Game` with `mode: 'bot'`.
- The human player is pinned to blue with `setCurrentPlayerColor('blue')`.
- Non-blue turns are automated through a delayed effect.
- Bot decisions currently use simple heuristics:
  - move an on-board soldier when a usable card exists
  - otherwise enter a new soldier
  - otherwise skip the turn
- Bot actions eventually call:
  - `movePlayerCore(...)`
  - `handleEnterNewSoldierCore(...)`
  - or `setActivePlayer()` plus `resetTimer()`

## How to Work on Bot Changes

1. Start from `Menu/GameScreen.jsx` and trace these functions first:
   - `getCardsForColor`
   - `getSoldiersForColor`
   - `getFirstAvailableBotPlayer`
   - `getBotMove`
   - `handleBotTurn`
2. Preserve the distinction between:
   - decision making: choosing the action
   - execution: dispatching state changes or calling board logic helpers
3. Keep bot mode isolated from:
   - local multiplayer behavior
   - online multiplayer / websocket behavior
4. Prefer extracting new pure helper functions when bot logic grows.
5. When adding smarter heuristics, rank actions explicitly instead of burying priority in nested conditionals.

## Recommended Heuristic Order

When improving the bot, evaluate candidate actions in this order unless the task requires something else:

1. Finish a soldier if a legal move reaches the goal.
2. Capture an opponent if the move is safe enough.
3. Move a vulnerable soldier to a safer square.
4. Enter a new soldier if board pressure is low.
5. Advance the most valuable active soldier.
6. Skip only when no legal move exists.

If the current move engine cannot validate all of these directly, add the smallest helper needed instead of duplicating board rules inside the screen.

## Implementation Guidelines

- Keep UI state and bot decision logic separate.
- Avoid triggering bot turns while the screen is still loading or after a winner is detected.
- Keep the existing delay before bot actions unless the user explicitly wants a faster or instant bot.
- Prefer deterministic behavior first; add randomness only when the user asks for less predictable play.
- If adding difficulty levels, model them as named strategies such as `easy`, `normal`, and `hard` rather than scattering probability checks inline.
- Reuse existing Redux actions and board logic helpers instead of reimplementing movement rules in the screen.

## Testing Guidance

Whenever bot behavior changes, update or add tests in `Menu/GameScreen.test.jsx`.

Minimum coverage to keep:

- bot mode initializes blue as the human-controlled color
- bot acts only on non-blue turns
- bot skips cleanly when no legal move exists
- bot chooses the expected action for the scenario being changed

If the logic becomes more complex, extract the chooser into a pure helper and test that helper with table-driven cases.

## UX Notes

- Keep bot mode entry discoverable from the offline play modal.
- If bot turns take time, show clear feedback rather than making the app feel frozen.
- Avoid native `Alert` for important offline mode flows when a controlled modal already exists in the screen architecture.

## Repo-Specific Cautions

- `mode`, `activePlayer`, loading state, and winner state all gate bot execution. Re-check these dependencies after refactors.
- `movePlayerCore` and `handleEnterNewSoldierCore` are the safest extension points for action execution.
- Do not let bot-only changes leak into websocket multiplayer code paths.
