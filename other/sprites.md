# Sprites & Iconography (UI Glyph Atlas)

TIC-80 can rotate **sprites** (via `spr(..., rotate=2)`), but cannot rotate `print()` text 180°.
So **card values, rent amounts, and key iconography** are rendered using sprites so they can be drawn upright for the player and upside-down for the opponent.

## Conventions

- **Tile size**: 8×8
- **Colorkey / transparency index**: palette index **15**
  - used as the sprite **colorkey** (holes in tiles/icons)
  - also used as the `vbank(1)` **transparent index** so UI overlays can reveal the `vbank(0)` background
- **15×15 icons**: author as a **2×2 (16×16)** sprite block where the **last column + last row** are colorkey (index 15), yielding an effective **15×15** visible icon with consistent padding.

## Canonical mapping (MVP)

Source of truth is configuration:

- Gameplay rendering: `MC.config.render.spr`
- Title background: `MC.config.title.bgTileSprId`

| Purpose | Sprite ID | Size | Notes |
|---|---:|---:|---|
| Digit `0` | 1 | 1×1 | Digits are contiguous: `digit0 + n` |
| Gameplay BG tile (top-left) | 96 | 2×2 | Repeating 16×16 pattern |
| Card-back tile | 32 | 1×1 | Repeating 8×8 pattern (fills the 15×23 interior) |
| Center panel fill tile | 78 | 1×1 | Dither tile (uses colorkey holes) |
| Icon Money | 36 | 2×2 | 15×15 effective |
| Icon House | 38 | 2×2 | 15×15 effective |
| Icon Sly Deal | 40 | 2×2 | 15×15 effective |
| Icon Just Say No | 42 | 2×2 | 15×15 effective |
| Icon Rent | 44 | 2×2 | 15×15 effective |
| Title BG tile (top-left) | 34 | 2×2 | Repeating 16×16 pattern |

## Rendering notes

### Rotating for opponent

- `rotate=0` → 0° (normal)
- `rotate=2` → 180° (opponent)

This applies to both **1×1 glyphs** and **2×2 icons**.

## Asset workflow (practical)

- Maintain the sprite atlas in a TIC-80 cart (sprite editor).
- When updating code, paste/import the new generated `game.js` into that same cart so **sprites persist**.
- When remapping IDs, update both config and this doc so they stay consistent.
