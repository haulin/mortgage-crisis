# Property Deal — TIC-80 Game

## Project Overview

This is a Monopoly Deal-inspired card game built for TIC-80 fantasy console.
Working title: Property Deal (cannot use Monopoly branding, mechanics are not copyrightable).
Target: 1v1 player vs AI, controller-first design for couch gaming on Google TV.

## Language

JavaScript (TIC-80 JS mode via duktape).

- The **runtime cartridge** is `game.js`. It must start with TIC-80 JS headers (`// script: js`, etc.).
- The **source of truth** lives in `src/` and is concatenated into `game.js`.

## Documentation

- TIC80_API.md — full TIC-80 API reference, pasted from official docs
- TIC-80.wiki/ — full offline clone of the TIC-80 GitHub wiki (local reference only)  
Always consult these before suggesting APIs or capabilities.
- [`docs/user-manual.md`](docs/user-manual.md) — user-facing guide (controls, UX behaviors, debug harness)

## Sprites & iconography

TIC-80 can rotate **sprites** (e.g. 180° via `spr(..., rotate=2)`), but cannot rotate `print()` text.

So **card values, rent amounts, and key icons** should be rendered using a small sprite atlas (digits + action icons). The mapping lives in `docs/sprites.md`.

## Development workflow

- **Build**: generate the paste-ready cart:

```bash
npm run build
```

- **Test**: minimal dependency-free test scaffold (loads `src/*.js` via Node `vm`):

```bash
npm test
```

### Testing workflow notes (practical)

- **Regression-first**: when fixing a bug (especially a visual/render bug), add at least one **assertion** or a small **new test** so we don’t re-break it later.
- **Renderer tests**: Phase 03 uses “draw-call recording” tests (stub TIC-80 draw APIs like `rect`, `spr`, etc. and assert call ordering/positions). See `test/11_render.test.mjs`.
- **Phase 03 render harness controls (debug-first)**:
  - `Y`: toggle DebugText ↔ Render
  - In Render mode: `A` steps a random legal move, `B` switches scenario, `X` resets scenario
  - This is intentionally not the final UX (Phase 04 introduces A/B confirm/back menus and real prompts)
  - DebugText includes extra dev hints (e.g. wild assigned color, bank count + total value)
- **Run in TIC-80**:
  - Open a JS cart in TIC-80
  - Recommended (PRO / external workflow): put `game.js` in the TIC-80 folder and run `import code game.js`
  - Fallback: copy/paste `game.js` into the TIC-80 code editor (subject to code size limits in non-PRO)

Notes:

- `game.js` is **generated**; edit `src/`* instead.
- Build details and guardrails are in `docs/phase00.md`.
- Keep a TIC-80 cart with your sprites; pasting `game.js` updates code while preserving sprite assets.

### Phase workflow (important)

We work in small increments:

- Plan one phase in `docs/phaseXX.md` (two-digit numbering: `phase00`, `phase01`, …)
- Implement that phase
- Update `docs/plan.md` → **Current progress** (mark the phase ✅)
- Update [`docs/user-manual.md`](docs/user-manual.md) when player/tester-visible behavior changes (controls, prompts, targeting, debug)
- Update this `README.md` if the developer workflow changes

## Key Constraints

- No DOM, no Node.js, no browser APIs — this is a fantasy console
- No external libraries — only TIC-80 built-in functions
- Code size limits depend on TIC-80 build (non-PRO paste workflow hits ~64KB; PRO supports much larger code buffers)
- Single file cartridge output: all code in `game.js`

## Input

Controller-first. Use btn() for held buttons, btnp() for single presses.
Player 1 button IDs: UP=0 DOWN=1 LEFT=2 RIGHT=3 A=4 B=5 X=6 Y=7

## Game Design

- Card game based on Monopoly Deal mechanics
- Property sets, money, action cards
- Win condition: first to 3 complete property sets
- Turn: draw 2 cards, play up to 3 cards
- "Inspired by Monopoly Deal" — not affiliated with Hasbro

