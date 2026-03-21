# Phase 03b — Center Preview + Prompt Scaffolding

Phase 03 delivered the core 5-row renderer, navigation, camera, and mini-card templates, but the original Phase 03 plan also described a richer center panel (“big preview” + prompt text). Phase 03b implements those missing center-panel pieces so Phase 04 can focus on the actual UI state machine and prompt flows.

## Goals

- Provide a **deterministic center-panel preview** of the currently selected item.
- Provide a stable **prompt UI slot** (even if it renders “no prompt”) that Phase 04 can reuse for menus/choices/payment selection.
- Keep rendering **read-only** with respect to `GameState` (state changes remain rules-command-driven).

## Scope

### Center preview

When an item is selected in Render mode, show a center-panel preview that depends on the item kind:

- **Hand / bank / set card**: render a larger version (or a 1:1 “big” layout) plus 1–2 lines of text:
  - card name / defId
  - money value / property color / wild colors / assigned color (as applicable)
- **Opponent hand backs**: preview reveals the real underlying card (debug-only behavior).
- **Deck / discard widgets**: preview shows count + (optional) top card defId (debug-only; deterministic).

### Prompt scaffolding

Add a dedicated, consistent area in the center panel for prompt UI:

- If `state.prompt` is `null`, render a stable “no prompt” line (or empty area).
- If `state.prompt` is non-null (future phases), render:
  - prompt title line
  - up to N option lines (layout-only; interaction comes in Phase 04)

## Tests (Phase 03b)

Add/extend draw-call recording tests to lock invariants:

- Preview is drawn **after** the rows (so it is readable and on top of row visuals).
- Preview output is **deterministic** for a given `debug.state` + selection.
- Prompt slot exists and does not shift other center-panel widgets.

## Definition of Done

- `npm test` passes (including render tests).
- In TIC-80 Render mode, preview changes as selection changes across all rows/zones.
- Prompt scaffolding renders consistently (even when unused).

