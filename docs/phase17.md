# Phase 17 — Mouse controls (hover + click + drag-and-drop)

Phase 17 adds **mouse controls** on top of the existing controller/keyboard UX, without breaking the “controller-first” model.

The mouse can be used on:

- Title screen
- How-to-play screen
- In-game UI (browse/menu/targeting/prompts)

## What shipped

### Mouse → UI controls mapping

- **Hover**: moves the selection cursor (so the existing UI highlight/inspect systems keep working)
- **Left click**: confirm / open menu (equivalent to **A tap**)
- **Left drag**: drag-and-drop quick play (equivalent to **A hold** → targeting; release confirms)
- **Right click**: cancel/back (equivalent to **B**)
- **Middle click (hold)**: Inspect (equivalent to **X hold**)
- **Wheel**: optional nav up/down pulses (configurable; with invert knob)

### Real drag-and-drop visuals

- While dragging and **not snapped** to a destination, the card is rendered as a **floating preview under the cursor**
- Legal destinations show as **ghost outlines**
- When snapped, the targeting preview shows the card in-stack (existing targeting preview model)

### Source cancel (leave-source latch)

During drag-and-drop targeting, **Source** is a cancel destination:

- you can cancel by releasing off-target, or
- by dragging back onto the source card and releasing.

To avoid “instant snap back” when starting a drag, Source snapping is gated by a **leave-source latch**:
Source is only eligible after the pointer has left the source area once during that drag.

### Autofocus pause in mouse mode

Autofocus “snap” rules are paused while the mouse is the active input source, to prevent hover selection from fighting focus rules.
Controller input clears the mouse pause latch (“controller wins”).

Important nuance:

- The latch is now sticky across AI-turn input suppression (so player-turn autofocus doesn’t unexpectedly override mouse mode right after AI finishes).

### Canonical actions shape (removes defensive UI checks)

Input/action objects now have a canonical “empty” shape (`MC.controls.emptyActions()`), and tests/harness code canonicalize partial patches.
This allowed simplifying UI code by removing many `if (actions.nav && ...)` style guards.

## Key code touchpoints

- `src/25_controls.js`
  - `mouse()` polling and per-frame mouse edges
  - mouse → A/B/X mapping (LMB/RMB/MMB)
  - `MC.controls.emptyActions()`
- `src/68_ui_mouse.js`
  - UI-specific mouse helpers (hit-testing, menu hover, targeting snap)
  - autofocus pause latch (`syncAutoFocusPause`)
- `src/65_ui.js`
  - mouse hover cursor-pick in browse/prompt
  - drag-and-drop entry + confirm/cancel behavior
- `src/66_focus.js`
  - honors `view.ux.autoFocusPausedByMouse` (mouse detection moved out)
- `src/80_title.js`, `src/82_howto_content.js`
  - in-game documentation updates

## Config knobs added/used

- `MC.config.mouse.dragStartPx`
- `MC.config.mouse.snapPadPx`
- `MC.config.mouse.wheelNav`
- `MC.config.mouse.wheelInvertY`
- `MC.config.mouse.hoverSelect`

## Tests added/updated

- `test/65_ui_controls.test.mjs`
  - drag gating + DnD confirm/cancel
  - **new**: cancel by snapping back to source (hysteresis)
- `test/05_config_sanity.test.mjs`
  - config knob presence (no runtime fallbacks)

## Definition of done

- `npm test` passes
- `npm run build` regenerates `game.js` (not stale vs `src/`)

