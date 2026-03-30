# Phase 12 — Title screen (boot + static menu)

Phase 12 adds a **boot-first title screen** so the first thing a player sees is the game’s identity and controls.

This phase is intentionally **non-interactive** (menu items are visual only). Phase 13 will make the menu the real entry point and hide the dev harness behind a dev-only path.

## What shipped

### Boot flow: Title → DebugText

- The cartridge now boots into a **Title** main mode (`MC._mainMode = 2`).
- Phase 12 shipped with a temporary dev-friendly flow: **press any button** to advance into the existing **DebugText** harness (`MC._mainMode = 0`) for fast iteration.
- Note: this boot flow is **superseded in Phase 13** (Title becomes the real menu entry point; DebugText is behind a dev toggle).

### Layout (MVP)

- **Left area**: large “MORTGAGE / CRISIS” title.
- **Subtitle**: “Inspired by Monopoly Deal”.
- **Bottom-left**: controls table (Controller vs Keyboard).
- **Right area**: static menu list (`New Game`, `Continue`, `How to Play`) with boxed items and a small gap between buttons.
- **Background**: optional 16×16 sprite-tiled background.

## Code / config touchpoints

- `src/80_title.js`: title screen drawing
- `src/90_debug.js`: main tick wiring + mode switch behavior
- `src/05_config.js`: `MC.config.title` tuning knobs (validated by `test/05_config_sanity.test.mjs`)

## Deferred to Phase 13

- Menu interactivity / real navigation (`New Game`, `Continue`, `How to Play`)
- Replacing the dev harness as the default entry point (hide `DebugText`/debug buttons behind a dev-only path)

