# Phase 07 — AI (random legal) + narrated pacing

This phase adds a very small opponent AI for play-testing flows end-to-end.

## What shipped

- Opponent (P1) takes actions automatically in Render mode (`PD.mainTick`).
- AI picks **one random legal move** per step and waits a fixed number of frames between steps.
- Each AI command can emit a short narration toast (“Opponent: Rent”, “Opponent: Place -> …”).

In practice, Phase 07 also became our “playtest polish” phase: we tightened several UX edges (Rent preview consistency, endgame handling, and—most importantly—centralized focus/autofocus so the cursor stops fighting the player).

## Implementation

- `src/53_ai.js`
  - `PD.ai.actor(state)`: returns `prompt.p` when prompting, else `activeP`
  - `PD.ai.pickRandomLegalMove(state)`: chooses from `PD.legalMoves(state)` using deterministic RNG (`PD.rngNextInt`)
  - `PD.ai.describeCmd(state, cmd)`: short, player-facing narration; uses `PD.fmt.destLabelForCmd` for placement

- `src/90_debug.js`
  - Suppresses player input while the AI is the actor
  - Runs the pacing loop when not animation-locked

## Focus policy (Phase 07 playtest ergonomics)

We moved autofocus/selection preservation out of scattered UI logic into a single module so it’s easier to tweak, test, and reason about.

- `src/66_focus.js`
  - `PD.ui.focus.preserve(state, view, computed)`: keeps selection stable across between-tick state churn (e.g. cards moving, stacks changing).
  - `PD.ui.focus.apply(state, view, computed, actions)`: applies preservation + **event-driven one-shot focus rules**.
  - Rules are **not** state invariants; they trigger on transitions or specific invalid-action signals to avoid “browsing triggers autofocus”.

### Debug pause latch (no autofocus after debug buttons)

Playtesting with `Step`/`Next`/`Reset` should not immediately snap the cursor somewhere else.

- `view.ux.autoFocusPausedByDebug`: boolean latch set when pressing debug buttons.
- While latched:
  - no autofocus rules run (and preservation only runs if selection disappears)
  - latch clears on the **first non-debug input** (D-pad, or `A` on a non-debug selection)
- `src/90_debug.js`: preserves this latch across scenario resets (`Next`) so it doesn’t get dropped when the view is recreated.

### One-shot focus rules we added/updated

All are gated to avoid interfering with prompts, inspection, game over, and debug-pause as appropriate.

- **Turn start**: `OnPlayerTurnStart_FocusHandOrEnd`
  - on transition into P0’s turn, focus hand if non-empty, otherwise `End` (if plays remain)
- **Plays exhausted**: `OnPlaysExhausted_End` (when plays transition from \(>0\) to \(<=0\))
- **Hand became empty mid-turn**: `OnHandBecameEmpty_End` (hand length transition \(>0\) → \(0\))
- **Pay debt default focus**: `OnEnterPayDebtPrompt_DefaultFocus` (bank if available, else properties/houses)
- **Pay debt invalid attempt**: `OnInvalidActionPayDebt_DefaultFocus` triggered by `pendingFocusErrorCode === "cant_pay"`
- **Empty-hand invalid attempt**: `OnInvalidActionWhileHandEmpty_End` triggered by `pendingFocusErrorCode` while hand empty

### Debug visibility

To aid future bug reports, DebugText now shows:

- `Anchor:uid... <zone>` (selection anchor)
- `FocusErr:<code>` (pending focus error channel)
- `FocusRule:<id>` (rendered full-width so long ids fit)

## Rent/menu preview consistency (tap-A vs hold-A)

- Actions that invoke targeting show an ellipsis (e.g. `Rent...`) to signal “more steps”.
- For **single-target Rent**, tap‑A menu-hover previews now:
  - highlight the destination set like hold‑A targeting
  - ghost the source hand card (no “double-highlight”)
- For **multi-target** `Rent...`, menu-hover does **not** preview a default destination (avoid implying a default choice).

Implementation notes:

- `src/55_fmt.js`: adds `...` for multi-target actions.
- `src/65_ui.js`: menu-hover preview now only activates when unambiguous; and Rent preview ghosts the source.
- `src/60_render.js`: respects `computed.meta.hideSrc` to suppress drawing/highlighting the source card.

## Endgame UX (winner clarity + safe inputs)

When a win is detected mid-flow (including during prompts like received-property placement), we now:

- replace stale prompt messaging with a persistent `Winner: Player/Opponent` toast
- keep navigation + inspect working
- block tap‑A on non-buttons (blink feedback only; no menu/targeting/command attempts)
- auto-focus `Reset` (debug enabled) and render it in the “ready” style

## Config knobs

In `src/05_config.js` under `PD.config.ui`:

- `aiStepDelayFrames`
- `aiNarrateToastFrames`

Toast visuals are renderer-owned. The AI narration toast is pushed with `kind: "ai"` and rendered with a distinct background color:

- `PD.config.render.style.colToastBgAi`

