# Phase 02 — Rules Engine + Commands API

Phase 02 introduces the **single source of truth** rules layer: a deterministic, command-driven engine that both UI and AI will use.

This phase is intentionally UI-light. It focuses on **state**, **legality**, **commands**, **events**, and **unit tests**.

## Decisions locked (Phase 02)

- **Card identity**: each physical card has a numeric `uid` (internal). Tests/scenarios prefer stable **defIds** from `CARD_DEFS[*].id`.
- **Engine style**: `applyCommand(state, cmd)` mutates in place and returns `{events}`.
- **Enums**: colors/kinds use small ints (e.g. `PD.Color.*`).
- **Property-in-set representation**: properties in a set are stored as tuples: `[uid, color]`.
  - Sets are **single-color** (derived), but can include Wilds assigned to that color.
  - Set color is derived via `PD.getSetColor(props)` (no stored `set.color` field).
- **Command targeting**: commands carry `{uid, loc}` and validate that `uid` matches the location.
- **Illegal commands**: throw before mutating state (fail-fast).
- **Turn loop (minimal)**: `endTurn` swaps active player, draws 2, resets `playsLeft=3`.
- **House**: playable only on a completed set; **max 1 House per set** (MVP1).
- **Scenarios**: minimal mechanism plus 4 scenarios: `placeBasic`, `wildBasic`, `houseBasic`, `winCheck`.
- **Tests**: prefer invariants + determinism checks (avoid brittle shuffled-order snapshots).

## Naming conventions

- **Namespaces / enums**: PascalCase objects (e.g. `PD.ActionKind`, `PD.CardKind`)
- **Scalar constants**: ALL_CAPS (e.g. `PD.HOUSE_RENT_BONUS`)
- **Functions**: camelCase (e.g. `PD.applyCommand`, `PD.legalMoves`)

## Scope implemented in code

### State + setup

- `PD.newGame({seedU32, scenarioId})`
  - default: shuffle full deck, deal 5 each, choose first player randomly, then start turn (draw 2 + `playsLeft=3`)
  - scenario: build a deterministic state via `PD.applyScenario`
- RNG lives in state as `state.rngS` (u32)

### Rules engine

- `PD.legalMoves(state)` (Phase 02 subset)
- `PD.applyCommand(state, cmd)` supports:
  - `bank`
  - `playProp` (fixed + wild, new set or existing set)
  - `playHouse`
  - `endTurn`
- `PD.evaluateWin(state)` (3 complete sets)

### Event output (minimal structured)

Events are returned from `applyCommand` as an array, with kinds such as:
- `move`
- `draw`
- `createSet`
- `plays`
- `turn`
- `win`

## Files added/changed

- `src/35_defs.js`: card defs + set rules + enums
- `src/40_state.js`: state, RNG-in-state, shuffle, `newGame`, scenario helpers
- `src/45_rules.js`: `evaluateWin`, `legalMoves`, `applyCommand`
- `src/50_scenarios.js`: `applyScenario` + minimal scenario catalog
- `test/40_state.test.mjs`: deck invariants + determinism tests
- `test/45_rules.test.mjs`: scenario-driven rules tests

## Definition of Done

Phase 02 is done when:
- `npm test` passes (including Phase 02 tests)
- `npm run build` produces a valid `game.js`
- `docs/plan.md` progress is updated and Phase 02 notes are captured here

## Notes for Phase 03 (Rendering baseline)

- Start with a **debug-first renderer**: rectangles + text + highlights are enough to validate the 5-row layout and navigation before sprite polish.
- Keep Phase 03 rendering **read-only**: rendering should never mutate `GameState`. UI should only mutate state via commands.
- The Phase 02 debug screen (`src/90_debug.js`) can remain as a fallback harness while Phase 03 rendering is being built.
- If we introduce new TIC-80 globals (e.g. `btnp`, `spr`, `rect`, `rectb`) into `src/*`, update `test/helpers/loadSrcIntoVm.mjs` stubs to keep tests frictionless.

