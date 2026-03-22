# Sprites & Iconography (UI Glyph Atlas)

TIC-80 can rotate **sprites** (via `spr(..., rotate=2)`), but cannot rotate `print()` text 180°.

That means **card values, rent amounts, and key iconography** should be rendered using sprites so we can draw them upright for the player and upside-down for the opponent.

## Approach

- Use **rectangles + `print()`** for most UI chrome and long text (prompts, descriptions).
- Use a dedicated **UI glyph atlas** in the sprite sheet for:
  - digits `0–9`
  - currency symbol (e.g., `M`)
  - plus/minus or small markers (optional)
  - action icons: Rent / Sly Deal / Just Say No / House
  - (optional) property color icons

We keep a **single mapping** for these sprite IDs in both:

- **Code** (constants like `PD.SPR_DIGIT_0 = ...`)
- **This doc** (human-readable table)

## Sprite sheet conventions

- **Tile size**: 8×8
- **Glyph size**: start with 1 tile (8×8). If something needs more detail, use a 2×1 or 2×2 sprite block and treat it as an atlas entry.
- **15×15 icons (plan)**: implement as a **2×2 (16×16)** block where the **last column + last row** are color **15** (colorkey), yielding an effective **15×15** visible icon. (Matches the Phase 03b card-back padding convention.)
- **Reserved ID range (proposal)**: `0–63` for UI glyphs/icons. (Adjust if you already use IDs in that range.)

## MVP glyph inventory (minimum)

### Digits + currency

- Digits `0–9`
- Currency symbol `M`

### Action/building icons

- Rent icon
- Sly Deal icon
- Just Say No icon
- House icon

## Proposed sprite ID map (initial draft)

> This is a *starting point* so we can code against stable IDs. We can revise once the actual art is in place.

| Purpose | Sprite ID | Notes |
|---|---:|---|
| Digit `0` | 0 | 8×8 |
| Digit `1` | 1 | 8×8 |
| Digit `2` | 2 | 8×8 |
| Digit `3` | 3 | 8×8 |
| Digit `4` | 4 | 8×8 |
| Digit `5` | 5 | 8×8 |
| Digit `6` | 6 | 8×8 |
| Digit `7` | 7 | 8×8 |
| Digit `8` | 8 | 8×8 |
| Digit `9` | 9 | 8×8 |
| Currency `M` | 10 | 8×8 |
| Icon Rent | 16 | 8×8 |
| Icon SlyDeal | 17 | 8×8 |
| Icon JSN | 18 | 8×8 |
| Icon House | 19 | 8×8 |

## Rendering notes

### Rotating for opponent

To draw a glyph upside-down for the opponent, use the sprite rotation parameter:

- `rotate=0` → 0° (normal)
- `rotate=2` → 180°

So a helper like `drawGlyph(id, x, y, isOpponent)` can do:

- `spr(id, x, y, -1, 1, 0, isOpponent ? 2 : 0, 1, 1)`

### Multi-digit numbers

For values like `10`:

- draw digit `1` then `0` with a 1px gap
- keep the whole block right-aligned within the card corner so it looks consistent

## Asset workflow (practical)

- Create/maintain the sprite atlas in a TIC-80 cart (sprite editor).
- When updating code, paste the new generated `game.js` into that same cart so **sprites persist**.
- Export the sprite sheet to PNG as needed for review/versioning (optional).

