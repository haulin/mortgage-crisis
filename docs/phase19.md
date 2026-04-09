# Phase 19 — Demo polish + targeting/overlay refactor

Phase 19 was triggered by “demo polish” issues, but quickly converged on a deeper theme:
**targeting UI policy** had become a knot of duplicated entrypoints and cross-layer exceptions.

This phase focuses on:

- fixing several real UX bugs (mouse DnD titles/help text, Wild single-destination placement, prompt button behavior)
- refactoring the targeting/overlay pipeline to reduce duplication and make future changes safer

## What shipped

### Targeting overlay text + help consistency (mouse vs controller)

- Fix: while **mouse-dragging unsnapped**, targeting title shows **“Drop”** (even if the selected cmd is `source`), so it no longer reads like “Cancel Onto a target”.
- Normalize wording: “Confirm” is now used consistently for **release-to-apply** actions (instead of mixing “Drop”/“Confirm” across flows).
- Mouse-click targeting help is formatted in a stable, readable 2-line layout (vs. cramming everything onto one line).

Key code:

- `src/55_fmt.js` (`MC.fmt.targetingTitle`, `MC.fmt.targetingHelp`)
- `src/54_cmd_profiles.js` (`MC.cmd.titleForTargeting`)

### Wild “single-destination place” nuance (menu vs prompt)

We kept the original UX intent:
when placing a Wild from the **hand menu** and there is only one real destination, starting on `Source` avoids implying the game pre-selected the only target (“Place...” implies a follow-up choice).

But we fixed the policy leak:
the nuance should **not** apply to non-menu flows like `placeReceived` (recvProps prompt), where starting on `Source` suppresses destination affordances and makes cancel/title semantics confusing.

Key change:

- `MC.cmd.wildSingleDestPlaceCmd(targeting)` now applies only when `targeting.card.loc.zone === "hand"`.

Key code:

- `src/54_cmd_profiles.js` (`MC.cmd.wildSingleDestPlaceCmd`, `MC.cmd.titleForTargeting`)
- `src/65_ui.js` (targeting entry defaults)

### Prompt flows: consistent debug buttons + better error text

During prompts (notably `respondAction`), center-row debug buttons must remain usable.

- Debug buttons (Step/Reset/Next) are allowed during `respondAction` prompts.
- Disallowed “End” during forced-response prompts now yields a **prompt-appropriate** message (“Select the target or Just Say No”) instead of “no moves left”.

Key code:

- `src/65_ui.js` prompt handler for `respondAction`

### ReplaceWindow “snap” stability (no 1-frame flash)

We fixed a focus/anchor mismatch where controller-driven snap-back (after selecting an invalid card) could appear for a frame and then get undone by selection preservation.

Solution: any “snap cursor to X” that is meant to stick must also **recompute models/cameras** and **snapshot the selection anchor** immediately.

Key code:

- `src/65_ui.js` (prompt-local helper `snapReplaceWildAndResync` used by `replaceWindow` flows)

### Cursor-mode targeting (Sly Deal): mouse drag semantics

Cursor-mode targeting (Sly) has different affordances than preview-mode targeting:
cursor highlight is a strong “selected” signal, so during mouse drag we avoid moving the cursor highlight onto opponent targets.

Shipped behavior:

- While mouse is the active input mode, cursor-mode targeting does not “stick” selection by cursor highlight.
- While dragging, we show a preview highlight **only when snapped**.
- Preview is rendered **on top of** the destination stack (depth bump).

Key code:

- `src/65_ui.js` (`profileSyncCursor` gating when mouse is active)
- `src/67_ui_row_models.js` (`cursorMode` overlay pass)

## Refactors (readability + duplication reduction)

### Cmd profiles: centralized targeting labels + Wild policy helpers

- Introduced `MC.cmd.titleForTargeting(targeting, cmd)` so UI text policy is data-driven and lives next to cmd profiles.
- Kept `MC.fmt.targetingTitle` focused on drag-mode precedence and delegating to cmd profile policy.

Files:

- `src/54_cmd_profiles.js`
- `src/55_fmt.js`

### Row models: split `computeRowModels` into a dedicated module

The large overlay/preview logic formerly nested inside `src/65_ui.js` was moved into a dedicated module:

- `src/67_ui_row_models.js` introduces `MC.ui.rowModels`
- `MC.ui.computeRowModels` is now implemented in that module
- helpers are organized under:
  - `MC.ui.rowModels.ops` (pure helpers over a `ctx` object)
  - `MC.ui.rowModels.targetingPasses/targetingStrategies` (ordered overlay passes)

This reduces nesting, makes naming cleaner, and makes policy changes easier to isolate.

Files:

- `src/67_ui_row_models.js` (new)
- `src/65_ui.js` (now smaller; delegates row-model computation)

### File ordering: mouse module renumbering

To keep deterministic concatenation order consistent with numeric prefix convention:

- `src/67_ui_mouse.js` → `src/68_ui_mouse.js`
- Add `src/67_ui_row_models.js` at the correct load-order position (row models + overlays split out of `src/65_ui.js`).

## Tests updated / added

- `test/55_fmt.test.mjs` (new): targeting title/help regression tests.
- `test/65_ui_controls.test.mjs`: new/expanded coverage around:
  - Wild menu-place single-destination behavior
  - placeReceived targeting expectations
  - cursor-mode mouse drag behavior
  - moveWild cycling / ordering invariants
- `test/65_view_shape.test.mjs`: prompt toast behavior (mouse vs controller text) and shape invariants.
- `test/60_render.test.mjs`: minor updates driven by overlay/help text changes.

## Key code touchpoints

- `src/54_cmd_profiles.js`: cmd profile registry, targeting title/preview helpers
- `src/55_fmt.js`: targeting title/help formatting
- `src/65_ui.js`: UI step state machine (browse/menu/targeting/prompt), focus integration
- `src/67_ui_row_models.js`: row model computation + overlay policy (targeting/menu/prompt/payBuf)
- `src/68_ui_mouse.js`: mouse adapter helpers + mouse/controller latch behavior
- `src/60_render.js`: rendering of previews/ghosts/highlights (display-only)

## Definition of done

- `npm test` passes
- `npm run build` regenerates `game.js` (not stale vs `src/`)

