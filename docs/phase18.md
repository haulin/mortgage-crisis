# Phase 18 — Demo-ready visuals (icons + background polish)

Phase 18 is a UI polish pass aimed at making the demo feel more intentional within TIC-80 constraints (palette limits, no true alpha, tight CPU/code budgets).

## What shipped

### Larger 15×15 action/building icons

- Action/building cards now use **~15×15** center icons.
- Implementation convention: author icons as a **2×2 (16×16)** sprite block where the **last column + last row** are **colorkey** (palette index 15), yielding an effective **15×15** visible icon with consistent padding.
- Icon sprite IDs are kept configurable and documented in `docs/sprites.md`.

### VRAM bank layering (background + UI overlay)

- `vbank(0)` is treated as the **base/background** layer.
- `vbank(1)` is treated as the **UI overlay** layer.
- The overlay bank is cleared each frame to the configured colorkey index so the background can show through where UI elements use colorkey “holes”.

### Background + panel treatment

- Gameplay background is a **static repeating tile pattern** (cheap + stable; avoids motion nausea).
- The center panel uses a **dither tile fill** so the background can subtly show through without needing real transparency/alpha blending.

### Plasma showcase extracted (not shipped in main game)

The procedural plasma + palette cycling experiment was kept as a **separate standalone demo cartridge**:

- `plasma.js` (showcase cart)

The main game no longer includes the plasma background code (keeps cartridge size and per-frame cost down).

## Key code touchpoints

- `src/05_config.js`: sprite ID mapping lives under `MC.config.render.spr`
- `src/60_render.js`: shared tiling helper + centralized overlay clearing/begin workflow
- `src/80_title.js`: title background uses the same tiling helper
- `src/90_debug.js`: debug harness ensures overlay state can’t leak across modes

## Tests updated

- Config sanity checks updated to match the simplified render/background configuration.
- Renderer tests updated to match the tiled card-back behavior.

## Definition of done

- `npm test` passes
- `npm run build` regenerates `game.js` (not stale vs `src/`)
