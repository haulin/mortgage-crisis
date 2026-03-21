# Phase 03c — Bridge: turn draw polish + end-turn hand cap

Phase 03b got the UI to a good “dev harness” place, but it surfaced two rules/behavior gaps that are worth fixing before building the full Phase 04+ UI flows:

- The debug stepper effectively avoided ending the turn, so it didn’t exercise turn swaps and start-of-turn draw rules.
- We were missing the Monopoly Deal rule: **if you start your turn with 0 cards in hand, you draw 5 instead of 2**.

This phase is intentionally small: it tightens rules correctness and makes stepping behavior more representative, without introducing the full discard UI yet.

## What Phase 03c implements

### Start-of-turn draw rule

- Start of turn:
  - If active player hand is **empty (0)**: **draw 5**
  - Otherwise: **draw 2**

Note: the current engine allows **partial draws** if the deck is short. This is a pragmatic bridge until Phase 05 adds discard/reshuffle.

### End-turn legality (hand cap)

- You **cannot end the turn** while your hand is **> 7**.
- In the rules engine this is enforced in both places:
  - `legalMoves` does not offer `endTurn` when hand > 7
  - `applyCommand(endTurn)` throws if called anyway

Phase 05 will implement the actual discard-down-to-7 prompt/UI (including the “forced discard before ending turn” experience).

### Debug stepping realism

- The debug stepper picks a random legal move, with a small heuristic:
  - prefer `playProp` moves that add to an **existing set** when possible
- With the end-turn hand cap in place, ending a turn becomes a natural outcome only when it’s actually legal.

### Render + debug HUD polish (dev-only)

- Fix: opponent wild property orientation now keeps the **assigned** color on the **owner-facing** half (also when flipped for opponent).
  - Regression test added in `test/11_render.test.mjs`.
- Restore: DebugText selection line for Wilds shows current assignment:
  - e.g. `Wild:Cyan/Black As:Black`
- Clarify: DebugText bank line shows both **count** and **value total**:
  - e.g. `Bank P0/P1: 8($13)/6($19)`
- Code hygiene: keep DebugText harness readable (avoid spreading noisy `|0` coercions).

## Files changed

- `src/07_state.js`: start-of-turn draw (2 vs 5) + partial draw behavior
- `src/08_rules.js`: end-turn hand cap enforcement
- `src/10_debug.js`: move stepping (prefers stacking into existing sets) + clearer bank/debug lines
- `src/11_render.js`: wild rendering orientation fix + debug selection details
- `test/08_rules.test.mjs`: updated + new tests for the above
- `test/11_render.test.mjs`: add opponent-wild regression test
- `docs/plan.md`: spec updated to include the draw-5 rule and the end-turn cap

## Definition of Done

- `npm test` passes
- `npm run build` regenerates `game.js` (and it’s not stale vs `src/`)
- Debug/Render stepping can advance turns naturally, and the engine applies:
  - draw 5 when starting a turn with 0 cards in hand
  - end-turn blocked while hand > 7
  - opponent wilds render with assigned color owner-facing

