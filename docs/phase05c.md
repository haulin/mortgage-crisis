# Phase 05c — Draw + reshuffle animations

Phase 05c makes **draws and reshuffles visible** to the player by staging them over time, and temporarily locking input so the user can’t miss what happened.

## What Phase 05c implements

### Reshuffle visibility (discard → deck)

When the deck runs out during a draw and discard is reshuffled into deck:

- the rules emit a `reshuffle` event
- the UI shows a short toast: **“Deck ran out. Shuffling”**
- the renderer plays a simple deck underlayer outline animation
- input is locked while the shuffle animation/toast is active
- during the shuffle animation, the deck count is temporarily **masked** (shown as empty) so it doesn’t look “already full” before the shuffle finishes
  - the discard pile is shown **empty** during the shuffle (it has already been consumed into the deck)

### Staged dealing for any draw

When the rules emit a `draw` event:

- the UI enqueues a deal animation step
- the drawn cards are **hidden** from the hand row models until revealed
- cards are revealed **one-by-one** (player sees faces; opponent sees card backs)
- input is locked while dealing runs

This avoids “2–5 cards appear instantly” and makes draw timing readable.

## Where it lives

- `src/00_prelude.js`
  - creates the `PD.anim` namespace (module namespaces are initialized once in the prelude)
- `src/07_state.js`
  - `PD.drawToHand()` emits `{ kind: "reshuffle", ... }` when it consumes discard into deck
- `src/13_anim.js`
  - `PD.anim.onEvents(state, view, events)` converts engine events → animation steps + toasts
  - `PD.anim.tick(state, view)` advances animations and reveals dealt cards
  - `PD.anim.present(state, view, computed)` applies animation **presentation** to row models (pile masking, shuffle underlayers, deal overlay, and hiding in‑flight dealt cards)
  - `PD.anim.feedbackTick/feedbackError` owns the “flash red on disallowed action” feedback effect
- `src/12_ui.js`
  - `view.anim` holds queued/active animation steps + hidden dealt cards (canonicalized by `PD.ui.newView()` and enforced in tests)
  - `PD.ui.step()` locks input while animations are active (via `view.anim.lock`)
  - `PD.ui.computeRowModels()` calls `PD.anim.present(...)` before returning so render consumes a fully “presented” model
- `src/11_render.js`
  - renderer is **oblivious** to `view.anim` and `view.feedback`
  - consumes presentation hints from `computed` (pile `nVis`/`pileLayers`, `computed.animOverlay`, `computed.highlightCol`)

## Config knobs

Animation timings are tunable in `PD.config.ui` (frames @ 60fps):

- `dealFramesPerCard`
- `dealGapFrames`
- `shuffleAnimFrames`
- `shuffleToastFrames`

These are validated in `test/01_config_sanity.test.mjs`.

## Definition of done

- `npm test` passes
- `npm run build` regenerates `game.js` (not stale vs `src/`)
- In play:
  - reshuffles are obvious (toast + deck animation)
  - draws are staged and readable (cards don’t “pop” into hand instantly)

