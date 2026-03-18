# Session 01 - Layout Prototype

## Summary
- Built a hybrid first-pass layout using TIC-80 primitives (rect/rectb/print).
- Established card sizes, stack peeks, and selection highlight behavior.
- Confirmed TIC-80 drawable area is 240x136 (256x144p, but UI padding is not drawable).

## Layout + Rendering (current)
- Card art area: 17x25, with a 1px border (overall 19x27).
- Hand row and table row for both players (top = opponent, bottom = player).
- Opponent rows are mirrored in order (left-to-right reads reversed).
- Stacks show 7px interior peeks; top card is always drawn last.
- Labels are simple text; opponent labels are placed bottom-right.

## Input + Selection
- D-pad moves selection within row and between player rows.
- Highlight is drawn after all cards so it always appears on top.
- Table selection is per-card within stacks.

## Palette Notes
- Using default Sweetie-16 palette indices.
- Money colors mapped to: 1→4, 2→2, 3→5, 4→10, 5→1, 10→3.

## Notes for Future
- True 180° text rotation will require custom glyph drawing.
- Center row (discard + info panel) still open; vertical space reserved.
