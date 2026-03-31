# Phase 14 — How to Play

Phase 14 adds an in-game **How to Play** screen so the cartridge is self-explanatory without external docs, while keeping the content easy to edit.

## What shipped

### Entry point

- The Title screen menu item **How to Play** is enabled and enters the How-to-Play screen.
- Press **B** to return to the Title screen.

### Navigation + layout

- The How-to-Play screen ships with **3 pages**: **Quick Start**, **Controls**, **Details**.
- **Left/Right** cycles pages (wrap-around).
- **Up/Down** scrolls within the current page when content overflows.
- The header is a **single line**: `How to Play (n/3): <PageTitle>` plus right-aligned controls hints.
- A small scrollbar appears when a page is scrollable.
- The screen remembers **last page + per-page scroll** when you exit and reopen it.

### Content system (human-editable)

- Content lives in `src/82_howto_content.js` as `MC.howto.CONTENT`:
  - Blocks: headings, paragraphs, bullets, and optional block-level demos (`demo.draw`) rendered above/left of text.
  - Inline emphasis supports numeric palette tags like `<c4>highlight</c>` (single-level; no nesting).
  - Word-wrapping is intentionally whitespace-normalizing (multiple spaces collapse) to keep layout predictable.

### Important rules called out

- **Banking action cards**: if you bank an action card, it counts as **money only** for the rest of the game (you can’t play it as an action later).
- **No change**: overpay is allowed when paying debts, but **no change is returned**.

## Code / config touchpoints

- `src/00_prelude.js`: adds `MC.howto`
- `src/05_config.js`: adds `MC.config.howto` layout/style knobs
- `src/80_title.js`: enables How-to-Play menu entry + intent
- `src/81_howto.js`: How-to-Play rendering/layout engine + paging/scroll state
- `src/82_howto_content.js`: editable content + demos
- `src/90_debug.js`: main mode routing adds a How-to-Play mode
- `src/60_render.js`: exports `MC.render.drawMiniCard` for demo reuse
- Tests:
  - `test/14_howto_screen.test.mjs`
  - `test/12_title_screen.test.mjs` (updated for new Title behavior)
  - `test/05_config_sanity.test.mjs` (validates `MC.config.howto`)

