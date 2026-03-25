# Phase 07 — AI (random legal) + narrated pacing

This phase adds a very small opponent AI for play-testing flows end-to-end.

## What shipped

- Opponent (P1) takes actions automatically in Render mode (`PD.mainTick`).
- AI picks **one random legal move** per step and waits a fixed number of frames between steps.
- Each AI command can emit a short narration toast (“Opponent: Rent”, “Opponent: Place -> …”).

## Implementation

- `src/53_ai.js`
  - `PD.ai.actor(state)`: returns `prompt.p` when prompting, else `activeP`
  - `PD.ai.pickRandomLegalMove(state)`: chooses from `PD.legalMoves(state)` using deterministic RNG (`PD.rngNextInt`)
  - `PD.ai.describeCmd(state, cmd)`: short, player-facing narration; uses `PD.fmt.destLabelForCmd` for placement

- `src/90_debug.js`
  - Suppresses player input while the AI is the actor
  - Runs the pacing loop when not animation-locked

## Config knobs

In `src/05_config.js` under `PD.config.ui`:

- `aiStepDelayFrames`
- `aiNarrateToastFrames`

Toast visuals are renderer-owned. The AI narration toast is pushed with `kind: "ai"` and rendered with a distinct background color:

- `PD.config.render.style.colToastBgAi`

