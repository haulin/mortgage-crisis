# Phase 16 — Targeting-cycle refactor (spatial order + Rent default)

Phase 16 fixes the most unintuitive targeting-cycle behavior (especially for **Rent**) and reduces duplication by making **L/R targeting order consistently spatial** across targeting kinds.

## Problem

Targeting cycles should feel like you’re moving left/right across the board.

The worst offender was **Rent** targeting: the cmd list was sorted by **rent amount**, which caused the cycle order to jump between sets (e.g. set 2 → 1 → 3). This made L/R feel unpredictable even though the UI was visually laid out left-to-right.

## What shipped

### Spatial L/R ordering across targeting kinds

Targeting cmd lists are now sorted (once per targeting entry) by **on-screen X position** for:

- `place`
- `build`
- `bank`
- `rent`

`sly` was already cursor-mode + screen-space ordered, and remains so.

### Rent default selection = highest rent

Rent targeting now **cycles spatially**, but the initial selection defaults to the **highest-rent eligible set** (so you don’t have to “scroll to the best option” every time).

### Less duplication: shared destination→screenX helper

Added a shared helper for targeting profiles to compute destination X coordinates in one place, rather than re-implementing table/bank geometry lookups in each profile.

## How it works (architecture)

### Cmd profiles drive spatial sorting

Cmd profiles can provide UI hooks under `prof.ui`:

- `screenXForCmd(ctx, cmd)`: returns the screen-space X coordinate for the cmd’s destination
- `sortRank(cmd)`: optional rank key to keep semantic ordering stable (e.g. Source last, NewSet after existing sets)

`src/65_ui.js` has a `profileEnsureSortedOnce()` helper that sorts the active targeting cmd list by `(rank, screenX, tieCmp)` exactly once per targeting activation.

### Rent default selection hook

`MC.cmdProfiles.rent` defines `defaultCmdI(state, cmds, loc)` which selects the cmd that yields the maximum `MC.rules.rentAmountForSet(...)` (tie-break: lower `setI`).

`src/65_ui.js` applies that default on entry:

- `MC.ui.targetingEnter(...)` (menu targeting)
- `MC.ui.targetingEnterHoldChain(...)` (hold-A first segment)

### Selection preservation across sort uses destination semantics

Some cmds (notably `playRent`) don’t encode their destination as `cmd.dest.*`. To preserve selection reliably, the targeting sort-preservation logic now uses:

- `MC.moves.destForCmd(cmd)` (interpreted destination kind + setI/p)

This keeps the selected destination stable across the first spatial sort even when the default index is not `0`.

## Code touchpoints

- `src/54_cmd_profiles.js`
  - `MC.cmd.screenXForCmdDest(...)`
  - `place/build/bank/rent` now expose `ui.screenXForCmd` and `ui.sortRank`
  - `rent` no longer sorts by amount; instead uses spatial sorting + `defaultCmdI`
- `src/65_ui.js`
  - apply `defaultCmdI` on targeting entry
  - preserve selection across profile-driven sort using `MC.moves.destForCmd`
- `src/05_config.js`
  - version bump: `MVP v0.16`

## Tests added

- `test/66_targeting_rent_cycle.test.mjs`
  - Rent cycle order is spatial (not amount-sorted)
  - Rent default selection picks the highest-rent set

## Definition of done

- `npm test` passes
- `npm run build` regenerates `game.js` (not stale vs `src/`)

