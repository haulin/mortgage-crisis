# Phase 05 — Inspect overlay + tiny render polish

This phase focuses on **readability and iteration speed**: make Inspect useful (bigger, clearer, non-accidental), improve the center HUD ergonomics, and upgrade card copy so the game is understandable without relying on future icons/large cards.

## What Phase 05 implements

### Inspect overlay becomes a real panel (with config-driven geometry)

- Inspect (`hold X`) now uses a single **screen-space backing panel** with **panel-driven anchors** (preview + title + description).
- The panel bounds and internal padding are **explicit config knobs** under `PD.config.render.layout.`* so we can tune quickly.
- The panel fill color is configurable via `PD.config.render.style.inspectPanelFillCol`.
- Description text uses **small font** (`smallfont=true`) for density.
- Deck/Discard and the center button strip remain visible; the panel intentionally occupies most of the center area.

### Center buttons remain available during Inspect

Previously, the center button strip was hidden while Inspect was held. This made it impossible to inspect button help text.

Phase 05 changes the center-row model so **buttons are only hidden during Menu/Targeting**, not during Inspect.

### “Value” line is generated (not hand-authored)

Inspect descriptions automatically include:

- `Value: $X`

…derived from `bankValue` (money/actions/house) or `propertyPayValue` (properties/wilds). This keeps card copy consistent and avoids duplicating values across `name/desc`.

### Rule-note system (gated by config)

We add a tiny rule-note mechanism for short constraints/notes that should appear in Inspect:

- `PD.RuleNote.`* enum IDs
- `def.ruleNotes: [...]` on card defs
- `PD.ruleNoteTextById[id] = "..."`
- `PD.config.rules.enabledRuleNotes = [...]`

Important: `enabledRuleNotes` is **not empty** in MVP1 builds because **Sly Deal’s constraint** (“not from full set”) is an MVP1 rule.

### Deck/Discard pile count digits “stick out”

Deck/Discard count digits are shifted by **(+1,+1)** via config knobs (`pileCountDx/Dy`) so the count reads as “outside” the card face, not part of its art.

### Card copy upgrade (all current MVP1 cards)

All current `CARD_DEFS` entries have updated `name`/`desc` text with:

- clearer 1v1 wording (“opponent”)
- properties/wilds include required set size + rent tables in text
- action/house copy upgraded (while keeping Phase 07+ gameplay still deferred)

## Files changed

- `src/01_config.js`: add inspect panel/layout knobs, button strip sizing knobs, pile count offsets, and rules enabled notes
- `src/06_defs.js`: update `name/desc`, add `ruleNotes`, add `PD.ruleNoteTextById`
- `src/11_render.js`: render Inspect as a panel, small-font desc, generated Value suffix, rule-note append, pile count offset applied
- `src/12_ui.js`: keep center buttons visible during Inspect; read button strip sizing from config

Tests:

- `test/01_config_sanity.test.mjs`: validate new required config knobs (including non-empty enabled rule notes)
- `test/12_ui_controls.test.mjs`: regression test ensuring center buttons remain present during Inspect

## Definition of Done

- `npm test` passes
- `npm run build` regenerates `game.js` (not stale vs `src/`)
- In TIC-80 Render mode:
  - Holding `X` shows a clear Inspect panel (small-font description)
  - Deck/Discard and the button strip remain visible/selectable during Inspect
  - Deck/Discard counts look visually “offset” from the card face

