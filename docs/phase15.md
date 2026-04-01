# Phase 15 — Animations (MVP ready)

Phase 15 polishes the **readability** of key “watch moments” (start of game, debt payments, steals) by adding a small set of curated animations, without slowing down normal play (hand→bank / hand→set remain snappy).

## What shipped

### Game start: deal → toast → draw

Default New Game now animates:

- Deal **5** cards to each side (using the existing staged-deal animation).
- Show a toast: **`You start`** / **`AI starts`**.
- Animate the starting player drawing **2** more cards (explains the 5/7 start state).

This is triggered on **Title → New Game** and on **debug reset** when the scenario is `default` (tests can opt out via `skipGameStartAnim`).

### Pay/debt buffer visualization (`payDebt`)

During a `payDebt` prompt, selected cards go into a rules-owned buffer (`prompt.buf`). The UI now renders that buffer as a **non-selectable stack of actual card faces** near the middle of the center row (bank-like overlap) so it’s obvious where cards went.

The buffer stack stays visible while post-prompt transfers drain by using `view.anim.payBufUids` (a UI-owned visual list), so you don’t get “buffer disappears but transfers are still flying”.

### Curated transfer animations (no discards; sequential)

We animate **only** ownership-changing transfers, one card at a time:

- **Debt payment drain**: `promptBuf → (bank | recvProps)` (always animates).
- **Sly Deal steals**: `setProps → recvProps` (always animates).
- **AI pay selection readability**: `bank/setHouse/setProps → promptBuf` animates **only** when AI chose the card, with a short **hold-at-source** (green outline) before the card flies.

Non-goals for MVP polish:

- **No discard animations** (rare; excluded to reduce risk).
- **No same-owner placement flight** (e.g. `recvProps → setProps`); instead, received properties are made visible (see “opponent faux-hand” note below).

### Timing / pacing hooks (incl. slowmo)

- `xferHoldFromFrames`: pause at the source when AI chose a payment/steal source (drawn with a green outline overlay).
- `xferHoldFrames`: short pause after the final `payDebt` selection before the first `promptBuf → dest` transfer begins.
- `animSpeedMult`: global multiplier applied to shuffle/deal/xfer durations (and related toast durations). Useful for slow-motion debugging; set back to `1` for normal speed.

### Focus stability polish (cursor shouldn’t “wander”)

- Exiting `replaceWindow` when `playsLeft <= 0` snaps to the **End** button.
- During **deal** animation locks, selection is pinned to the anchored `uid` so the highlight doesn’t drift through bank indices as new cards reveal.
- During **transfer** (`xfer`) animation locks, the selection anchor is refreshed so focus preservation doesn’t “snap” when bank stacks splice/reflow (e.g. paying with a mid-stack bank card).

## How it works (architecture)

- The engine emits **structured events** (`draw`, `reshuffle`, and now curated `move` events with `{ uid, from, to }`).
- `src/65_ui.js` snapshots **pre-move screen positions** into `view.anim.lastPosByUid` during model computation so transfers have a reliable on-screen origin even after state mutates.
- `src/70_anim.js` turns events into a queue of timed steps (input/AI locked while active):
  - `shuffle`, `deal`, `gameStart`
  - `xferHold` (batch pause)
  - `xfer` (with optional `holdFrom` phase for AI-selected sources)
- Transfer origins:
  - Prefer `lastPosByUid[uid]` when the source was visible.
  - Otherwise originate from a fixed **center pay anchor** (near deck/discard) using `MC.config.render.layout.centerPayBufX`.
- Duplicate prevention / “no teleport + no double card”:
  - While a card is flying, `view.anim.hiddenByUid[uid]` hides it from its state location, so you don’t see both “already at destination” and “in flight”.
  - The pay-buffer overlay filters out `uid`s that are queued/active to move **into** `promptBuf`, avoiding 1-frame “buffer flash” during the UI tick ordering.
- AI selection hold doesn’t collapse stacks:
  - During `holdFrom` (to `promptBuf`), the source stack’s item positions are frozen using the last snapshot so the ghost/outline doesn’t cause the stack to reflow under the player’s eyes.

## Config knobs (frames @ 60fps)

All animation timings are validated in config sanity tests (avoid runtime fallbacks).

- `MC.config.ui.animSpeedMult`
- `MC.config.ui.dealFramesPerCard`, `MC.config.ui.dealGapFrames` (Phase 05c; now multiplied by `animSpeedMult`)
- `MC.config.ui.xferFramesPerCard`, `MC.config.ui.xferGapFrames`
- `MC.config.ui.xferHoldFromFrames`, `MC.config.ui.xferHoldFrames`
- `MC.config.ui.gameStartToastFrames`
- `MC.config.render.layout.centerPayBufX`

## Code touchpoints

- `src/05_config.js`: new/expanded animation knobs (see above)
- `src/45_rules.js`: curated `kind:"move"` events for Sly + payDebt transfers; `selectedByP` hint for AI-chosen selections
- `src/60_render.js`: center pay-buffer stack rendering + moveCard overlay + outline rendering for hold-at-source
- `src/65_ui.js`: pay-buffer overlay model + `lastPosByUid` snapshots + selection stability during animation locks
- `src/66_focus.js`: `replaceWindow` exit focus rule (`End` when out of plays)
- `src/70_anim.js`: game-start orchestration + curated transfer queue/lock + hide-by-uid presentation
- `src/90_debug.js`: debug reset triggers game-start anim for default scenario; tests can pass `{ skipGameStartAnim:true }`

## Tests updated/added

- `test/05_config_sanity.test.mjs`
- `test/45_rules.test.mjs`
- `test/60_render.test.mjs`
- `test/65_ui_controls.test.mjs`
- `test/65_view_shape.test.mjs`
- `test/70_anim_present_paybuf.test.mjs`

## Definition of done

- `npm test` passes
- `npm run build` regenerates `game.js` (not stale vs `src/`)

