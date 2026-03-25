# Property Deal — Build Plan (MVP1)

This document captures the **shared MVP1 spec** and a **piece-by-piece implementation plan** for building Property Deal (Monopoly Deal–inspired) on **TIC-80 JS**.

Documentation convention (for future phases):

- `docs/phaseXX.md` should record **everything implemented** in that phase (detailed).
- `docs/plan.md` should include **minimal Phase summary bullets** (scan-friendly; link to the phase doc).
- Keep phase docs **current and non-contradictory**. It’s fine to edit older phase docs to correct factual statements when architecture/conventions change.

## Current progress

- **Phase 00 ✅**: build pipeline + committed `game.js` artifact + minimal boot cart + `node --test` scaffold. See `docs/phase00.md`.
- **Phase 01 ✅**: deterministic RNG (xorshift32) + shuffle + tests + `saveid` metadata injection. See `docs/phase01.md`.
- **Phase 02 ✅**: rules engine + command API + scenarios + debug screen + tests. See `docs/phase02.md`.
- **Phase 03 ✅**: rendering baseline (5-row layout), navigation + camera, mini-card templates, rent special rendering, and draw-call render tests. See `docs/phase03.md`.
- **Phase 03b ✅**: center-panel “big preview” + card backs + deck + discard rendering. See `docs/phase03b.md`.
- **Phase 03c ✅**: bridge rules polish (empty-hand draw-5, end-turn hand cap) + debug stepping realism. See `docs/phase03c.md`.
- **Phase 04 ✅**: UI-owned controller UX (menus/targeting/inspect) + injected controls; renderer is display-only (bounded to existing commands). See `docs/phase04.md`.
- **Phase 05 ✅**: Inspect overlay becomes a real panel (config-driven, small-font desc) + improved card copy + rule-note gating + pile count digit offset. See `docs/phase05.md`.
- **Phase 05b ✅**: turn loop framing + discard-down-to-7 prompt + deterministic reshuffle + toast/prompt foundation polish. See `docs/phase05b.md`.
- **Phase 05c ✅**: draw + reshuffle visibility (staged dealing + shuffle toast/animation), plus renderer‑oblivious animation presentation via `PD.anim.present`. See `docs/phase05c.md`.
- **Phase 06 ✅**: debt/payment prompt + recipient “faux-turn placement” for received properties (incl. Wild color choice), using prompt actor `prompt.p` (not `activeP`). See `docs/phase06.md`.
- **Phase 07 ✅**: AI (random legal) + narrated pacing. See `docs/phase07.md`.

## Goals + Constraints

- **Platform**: TIC-80 fantasy console, **JavaScript** (duktape)
- **Cartridge**: single pasted file output `**game.js`**
- **Constraints**: no DOM/Node/browser APIs, no external libs, 8 banks of 64KB code limit
- **Target**: **1v1 player vs AI**, controller-first (Google TV couch play)
- **UI space**: 240×136 usable area
- **Sprites**: `print()` text cannot be rotated 180°; use **sprites** for card values/rent/icons (rotate sprites with `spr(..., rotate=2)` for opponent). See `docs/sprites.md`.

### Naming conventions (codebase)

- **Namespaces / enums**: PascalCase objects (e.g. `PD.ActionKind`, `PD.CardKind`)
- **Scalar constants**: ALL_CAPS (e.g. `PD.HOUSE_RENT_BONUS`)
- **Functions**: camelCase (e.g. `PD.applyCommand`, `PD.legalMoves`)

### Engineering guardrails (cartridge hygiene)

- **No runtime fallbacks**: avoid `x = x || {}`, `|| []`, “should never happen” defaults in runtime code. Prefer canonical constructors/canonicalizers plus tests.
- **No runtime shape asserts**: don’t ship “assert shape” helpers in `game.js`; enforce invariants in unit tests.
- **Numeric coercion**: keep `|0` / `>>>0` localized to TIC-80 draw-call boundary wrappers (e.g. `rectSafe`, `sprSafe`) and deterministic engine/RNG hot spots.
- **Namespaces**: `src/00_prelude.js` creates `PD` and module namespaces once; don’t repeat `PD.ui = PD.ui || {}` in modules.
- **Build artifact rule**: after any change in `src/` or `scripts/build.mjs`, run `npm test` and `npm run build` so committed `game.js` stays in sync.

## Locked MVP1 Rules (Source of Truth)

### Win condition

- Win = **first player to 3 complete property sets**
- **Win check** runs after **every state change** that can affect sets/properties (including during debt/payment resolution), to avoid continuing after a win.

### Game start

- Shuffle deck
- Deal **5** cards to each player
- Choose first player **randomly** (uses our deterministic PRNG; seed is a constant in MVP1)

### Turn structure

- Start of turn: **draw 2** (or **draw 5** if you start the turn with **0 cards in hand**)
- Main phase: **play up to 3 cards**
- End phase: **discard down to 7** (you cannot end the turn while your hand is **>7**)

### MVP1 card pool (35-card deck)

#### Property ecosystem (14 property cards total)

Property sets in MVP1:

- **Magenta**: requires **3**
- **Orange**: requires **3**
- **Cyan**: requires **2**
- **Black**: requires **4**

Wild properties:

- **1×** dual-color **Magenta/Orange**
- **1×** dual-color **Cyan/Black**

Notes:

- **Overfill allowed**: a set/stack may exceed its required size; it is still one set.
- Rent calculation caps at the required size (see rent rules).

#### Buildings

- **House ×2** (House only in MVP1; no Hotel)

House rules:

- Can be played only onto a **completed** set
- **House bonus** adds to rent (see rent tables)
- If paying a debt from a set with a House, the owner must **pay/remove the House first**
  - House payment goes to the recipient’s **bank** (as money)

#### Action cards

Included action cards:

- **Rent** ×5 (2× Magenta/Orange, 2× Cyan/Black, 1× Any)
- **Sly Deal** ×2
- **Just Say No** ×2

Just Say No (JSN):

- **Single-layer** only (no JSN-on-JSN chain in MVP1)
- Played from **hand** in a response window
- Does **not** consume plays (reaction, not an active-turn play)
- When JSN cancels an action: **both JSN and the canceled action go to discard**

#### Money cards

- **Money ×10**
- Values are small; **no 10-value** money in MVP1
- Recommended distribution: **1×3, 2×3, 3×2, 4×1, 5×1**

### Banking rules

- Bankable: **Money cards**, **Action cards**, and **House**
- Not bankable: **Property cards** (including Wilds)

### Debt/payment rules

- When a player owes money (e.g., Rent), the **payer chooses** what to pay with.
- Payment sources: **bank + properties only** (not hand).

Where paid cards go:

- Paid **money/actions/house** → recipient **bank**
- Paid **properties** → recipient **properties**

Placement UX for received properties:

- **No auto-placement in MVP1**
- Recipient performs an explicit **“faux-turn placement”** for each received property:
  - choose destination set or create new set
  - if Wild, choose active color and destination

### Rent rules (MVP1)

- Rent can be charged from **partial sets** (rent scales with current set size)
- Overfill does **not** increase rent beyond the set’s required size (rent caps at required size)

Concrete rent tables (Option A):

- **Cyan(2)**: 1, 3]
- **Magenta(3)**: 1, 2, 4]
- **Orange(3)**: 2, 3, 5]
- **Black(4)**: 1, 2, 3, 6]
- **House bonus**: **+3** (only when charging rent from a completed set that has a House)

### Property money values (for debt payment)

Properties are not bankable, but they have money values used to satisfy debts when paid as properties.

- Cyan properties: **more valuable than others** (exact number to tune; initial default **3M each**)
- Magenta properties: initial default **2M each**
- Orange properties: initial default **2M each**
- Black properties: initial default **1M each**
- Wild (M/O): initial default **2M**
- Wild (C/B): initial default **2M**

### Wild “replace-window” repositioning

Wild repositioning is intentionally constrained in MVP1.

- Repositioning is only available in a **replace-window** after playing a property into a set (including playing a Wild).
- At most **1 Wild** may be repositioned per play.
- Repositioning is included in the **same play** (no additional play cost).
- Player **chooses destination** (existing set or new set + color assignment).
- **Eligibility**: repositioning is only legal if removing the Wild would leave the **source set still complete**.

### Sly Deal targeting constraint

- Sly Deal may not steal from an opponent’s **complete** set.

## Locked UI Layout (5-row, deterministic)

Rows (top to bottom):

- Row 1: opponent hand backs, showing ~**11px** height
- Row 2: opponent table stacks (**~25px**)
- Row 3 (center): deck/discard + action buttons + overlays (menu/targeting/inspect); **no always-on big preview**
- Row 4: player table stacks (**~25px**, selectable/highlight)
- Row 5: player hand full cards (**~25px**, selectable/highlight)

Overflow:

- If a property row has too many stacks to fit, the row becomes **horizontally scrollable** (row-local camera offset that follows selection).

### Navigation model

- **Directional (screen-space) cursor + UI state machine**
  - D-pad picks the nearest selectable in that direction (cone-scored), with **axis-wrap** fallback when nothing is in-direction
  - Left/Right prefers staying in-row when possible (reduces surprising cross-row jumps)
  - `A`: confirm/select (opens context menu, chooses targets, confirms prompts)
  - `B`: back/cancel
  - A dedicated **Inspect/Zoom** button (e.g., `Y` or `X`) shows the highlighted card enlarged with text in the center panel

### Hand card action

- Pressing `A` on a hand card opens a **context menu** (card-dependent):
  - Property: place to new/existing set
  - Wild: place to eligible set + pick active color
  - Action: play (and/or bank if bankable)
  - Money: bank

### Center row selectables

- Center includes selectable: **draw pile**, **discard pile**, and **action buttons** (e.g. End + debug buttons when enabled)
- Banks are selectable in the hand rows (bank is rendered as a fanned stack opposite the hand)

## AI (MVP1)

AI is required in MVP1, but intentionally simple.

- Policy: **pure random legal move**
- UX: step-by-step narrated actions with a configurable delay (no skip in MVP1)
  - e.g. “AI: Played property”, then “AI: Started a new set”, etc.

## Dev/Testing Requirements

- RNG seed is a **constant** in MVP1 (memorable values like `1`, `2`, `3`, `4`, `1001`, `1002`…)
- We implement our own **deterministic PRNG** (do not rely on `Math.random()`), so shuffles/AI are reproducible.
- Scenario injection: a list of predefined edge-case starting states
  - Examples: forced Rent payment with only properties; JSN response; Wild replace eligibility; House-pay-first debt case

## Implementation Plan (Piece-by-piece)

### Phase 00 ✅ — Repo workflow

- Author modular code under `src/`
- Generate paste-ready `game.js` via a **light build step** (pure concatenation; no runtime deps)
- Ensure `game.js` includes required TIC-80 headers:
  - `// script: js`
  - `// title: Property Deal`
  - (Phase 00 complete and validated in TIC-80; details in `docs/phase00.md`.)

### Phase 01 ✅ — Foundations (data + RNG + state)

- Implement deterministic PRNG (seeded by a constant in MVP1) and deterministic shuffle
- Define card definitions (data-driven):
  - `CARD_DEFS` (id, kind, **name**, **description**, moneyValue, propertyColor/wildColors, action kind, counts)
  - `SET_RULES` (requiredSize, rentTable, UI color index)
- Define `GameState` structure:
  - deck, discard
  - per-player: hand, bank, propertySets (stacks), etc.
  - current turn, phase, `playsLeft`
  - active prompts / UI mode state

### Phase 02 ✅ — Rules engine + commands API (single source of truth)

Implement a command-driven rules engine so **UI and AI share the same primitives**.

Core pieces:

- `legalMoves(state)` returns legal commands for the active player (and for prompts like payment/placement).
- `applyCommand(state, cmd)` mutates state deterministically and emits events/messages for UI.
- `evaluateWin(state)` checks 3 complete sets for either player.

Command examples (exact naming can vary, but shape should match):

- Play/bank:
  - Bank a card (money/action/house)
  - Play property/wild to a set
  - Play House onto a completed set
- Actions:
  - Play Rent (choose color / choose set)
  - Play Sly Deal (choose target property)
  - Play Just Say No (response window)
- Debt resolution:
  - Select payment cards from bank/properties
  - Transfer cards to recipient bank/properties
  - Recipient places received properties (faux-turn)
- Wild replace-window:
  - Optional “move 1 Wild from source set to destination”

### Phase 03 ✅ — Rendering + 5-row layout baseline

- Implement renderer for:
  - card rectangles, stack peeks, highlights
  - row scroll camera
  - center panel: deck/discard/bank widgets + minimal debug overlays (preview/prompt UI deferred to Phase 03b)
- Keep drawing deterministic: highlight drawn last; stacks draw top last.

Status:

- Phase 03 baseline renderer is **complete** (see `docs/phase03.md` for exact shipped behavior and constraints).

### Phase 03b ✅ — Center preview

Phase 03 grew larger than originally expected, so we split the missing “center panel UX” into a small bridging phase before Phase 04.

- Implement:
  - Center-panel **big card preview** for the currently-selected item (hand/table/bank/deck/discard)
  - One or two additional render tests that lock the preview/prompt output invariants (draw order + anchors)

Definition of done:

- `npm test` passes, including updated render draw-call tests
- Center preview updates as you navigate selection in Render mode

### Phase 03c ✅ — Bridge: turn draw polish + end-turn hand cap

This is a small “in-between” phase to keep the debug/render harness faithful to core rules before we build the full Phase 04+ UI:

- Start-of-turn draw rule: **draw 5 instead of 2 when starting with an empty hand**
- End-turn legality: **cannot end turn while hand > 7**
- Debug stepping: step a random legal move (prefers adding properties to **existing** sets; end turns occur naturally when allowed)
- Render polish: opponent Wilds keep assigned color **owner-facing** (orientation fix + regression test)
- Debug HUD polish: DebugText shows Wild assignment and bank **count + total value**

### Phase 04 **✅** — UI state machine (controller UX)

- Implement a **UI-owned view state machine** (`PD.ui`) + injected controls (`PD.controls`), with renderer as **display-only**.
- **Selection model by zone** (5-row layout retained):
  - opponent hand (inspect only; hidden unless debug)
  - opponent table (inspect only in Phase 04)
  - center row widgets (deck/discard + action buttons)
  - player table (inspect + targeting destinations)
  - player hand (primary selection)
- **Controller UX (Phase 04)**:
  - D-pad navigation with **repeat** (hold to scroll)
  - `A` **tap**: open a context menu (Place/Build/Bank depending on card)
  - `A` **hold+move** (or fallback hold): enter **targeting**; release `A` to drop
  - `B`: back/cancel (menu/targeting)
  - `X` **hold** (after short delay): **Inspect** overlay; D-pad still navigates while held
  - `Y`: DebugText ↔ Render toggle (dev harness)
- **Targeting UI**:
  - show **ghost outlines** for legal destinations (green)
  - selected destination shows **preview-in-stack** + highlight
  - Wilds: `Up/Down` toggles color while targeting
  - default destination prefers **existing set** (then New Set); wrap-around cycling
  - banking shows a preview at the bank-stack drop position
- **Center row buttons**:
  - `End` (always; legality enforced by rules)
  - Debug-only: `Step`, `Reset`, `Next` (gated by `PD.config.debug.enabled`)
- **Bounded scope**: Phase 04 UI only drives currently-implemented commands:
  - `endTurn`, `bank`, `playProp` (Place), `playHouse` (Build)
  - Rent/SlyDeal/JSN/debt/payment/received-property placement/wild replace-window are deferred to later phases (Phase 05+).

### Phase 05 **✅** — Inspect overlay + tiny render polish

- Fix Inspect overlay (hold `X`) so it **does not overlap** player table sets (keep it visually contained to the center panel area)
- Improve Inspect overlay readability (no big-card rendering yet):
  - Use **small font** for description text
  - Nicer-looking overlay box (layout/spacing/borders so it reads as an intentional modal)
- Upgrade per-card `def.desc` copy (make descriptions real/useful, not boilerplate)
- Shift Deck/Discard pile count digits **+1,+1** so they visually “stick out” from the top card (not read as part of the card face)

### Phase 05b **✅** — Turn loop + discard down to 7

- Implement full turn loop framing around the existing start-of-turn draw rule (draw 2, or draw 5 if hand is empty)
- Formalize “3 plays per turn” UX around `state.playsLeft` (already exists in state/rules; Phase 05b ensures the *full loop* uses it consistently)
- Implement discard-down-to-7 at end of turn (selection UI)
  - If the player attempts to end turn while hand > 7, Phase 05b UI enters a discard-down-to-7 prompt before passing the turn
  - `B` cancels **only before the first discard** in that prompt instance (after any discard, it’s forced)
- Reshuffle discard into deck when needed (required for any future mid-turn draw/reveal effects too)

Quality-of-life (still UX-level; no new rules commands):

- Targeting/menu shortcut: if a menu action (e.g. Place/Build) yields **exactly 1** legal destination, consider skipping the extra confirm step (or at minimum show a more specific label like “Place → New set”)
- Add an easier cancel path for hold‑A targeting (avoid requiring `B` while holding `A`):
  - option A: treat the **source** as a valid “destination” (drop back onto source = cancel)

### Phase 05c **✅** — Draw + reshuffle visibility (animations) + animation architecture

- Make draws readable: stage multi-card draws so cards appear **one-by-one** instead of popping in instantly
- Make reshuffles readable:
  - show a short toast **“Deck ran out. Shuffling”**
  - animate the deck pile underlayers (0/1/2) while input is locked
  - during shuffle, show discard as **empty** and mask the deck count as **empty** until the shuffle finishes
- Refactor: centralize animation + feedback presentation in `PD.anim` so the renderer stays display-only:
  - renderer consumes `computed` presentation (`nVis/pileLayers`, `computed.animOverlay`, `computed.highlightCol`) and is oblivious to `view.anim` / `view.feedback`

### Phase 06 **✅** — Debt/payment + “faux-turn placement”

- Implement prompt-owned debt context:
  - prompt actor is `prompt.p` (prompt can target a non-`activeP` player)
  - payer selects cards from **bank + properties + houses-in-sets**
  - enforce **House-pay-first** (engine + UI redirect)
  - selected cards live in a prompt-owned buffer until finalized (auto-finalize)
  - transfer bankables to recipient **bank**; transfer properties to recipient **placement prompt**
- Implement recipient placement (“faux-turn placement”):
  - received properties appear as a faux-hand at the left of the real hand row
  - `A` on a received property enters targeting (choose existing/new set; Wild chooses color)
  - received props are the only actionable cards during that prompt (real hand remains visible)
- Debug harness polish:
  - DebugText shows `Prompt:` stage line (e.g. `payDebt rem:$N buf:N`, `placeRecv n:N`, `discardDown to:N left:N`)

See `docs/phase06.md` for exact shipped behavior.

Content expansion readiness:

- Keep the debt/payment UX generic so Phase 11 can add “pay/select/transfer” actions (e.g. Forced Purchase) without inventing new interaction patterns

### Phase 07 — AI (random legal) + narrated pacing

- Implement AI as:
  - `legalMoves(state)` → choose random → enqueue commands
- Show narrated messages with fixed delay between steps

Content expansion readiness:

- Create a system that will allow future phases to integrate easily

Issues:
- When player is out of moves and they attempt to place a card, the only valid destination is source. They no longer get negative feedback about no action possible. If only source is a valid destination then action should be disallowed.
- keep numeric coercion (`|0`, `>>>0`) localized to TIC-80 API boundary wrappers and determinism hot spots; prefer wrappers over ad-hoc coercion in UI/layout/render logic.
- scrolling in the last scenario is not good
- the project was renamed to Mortgage Crisis, so we should update all references
- action menu should maybe get rendered as a bigger overlay, similar to inspect and not cover buttons
- descriptions of some scenarios don't fit screen in Debug
- press A when there is a default action such as Rent > Cyan set do not show the highlight of the set.
- pay debt prompt triggerring can't pay with that should auto-focus on bank if available, on props if not.

### Phase 08 — Actions + responses

- Implement Rent + JSN response window
- Implement Sly Deal + JSN response window + legality (not from complete set)

Content expansion readiness:

- Keep the response window + targeting UX generic so Phase 11 can add additional action card types without bespoke UI

### Phase 09 — Wild replace-window

- Detect replace-window eligibility after property plays
- Offer optional prompt to move exactly 1 Wild if legal (source remains complete)

Content expansion readiness:

- Keep replace-window prompts generic so Phase 11 can add more Wild/board-state manipulation cards that reuse this workflow

### Phase 10 — Scenarios + dev boot

- Replace dev-only `Y:Mode` hint/toggle with a proper dev entrypoint (e.g. hidden debug menu) or remove for non-dev builds
- Implement scenario list and boot selection (e.g., hidden title-screen menu)
- (Optional later) implement seed display and seed override in dev
- Add a scroll-stress scenario to verify row horizontal scrolling/cameras (e.g. 12 cards in hand + lots of money cards in bank + many property stacks)
- Add a Rules / How-to-play screen (reachable from boot/title screen) so the game is self-explanatory without external docs

### Phase 11 — Post‑MVP1 content expansion (make it feel like a real game)

- Add more property colors/sets (new `PD.Color` entries + `PD.SET_RULES` + `CARD_DEFS`)
- Expand deck composition (properties/money/actions) while keeping turn UX readable
- Add additional card types **only once the workflow exists** (so no dead draws). Practical rule of thumb:
  - After Phase 06 (debt/payment): add 1–2 “pay/select/transfer” actions that reuse that pipeline (e.g. Forced Purchase)
  - After Phase 07 (actions + responses): add 1–2 action cards that reuse the response window (JSN)
  - After Phase 08 (replace-window): add 1–2 Wild/board-state manipulation cards that reuse replace eligibility

### Phase 12 — UX/readability polish

- Optional vertical area labels explaining the different zones (hand/bank/properties/opponent areas)
- Continue Inspect overlay polish as needed (still not “big cards”)
- (Optional later) Reduced motion accessibility toggle:
  - make `PD.anim.present()` a no-op pass-through
  - optionally skip/short-circuit `PD.anim.onEvents/tick` so there’s no waiting/locks beyond toasts (or keep only toast pauses)
- Free organization / preparation actions (UI-only; no play cost):
  - Reorder/sort hand, bank, and stacks for readability (purely cosmetic; no rules/commands)
  - Flip a Wild property’s preferred color **in the source** (e.g. via context menu) so you can “pre-set” it before targeting/placing

### Phase 13 — Card art + palette polish

- Replace placeholder action icons with larger **~15×15** icons (implemented as a 2×2 sprite block with a colorkey padding row/col to yield an effective 15×15)
- Money/action card faces: dithered / lighter background treatment (sprite pattern or fast overlay)
- (Optional, later) implement true “big card” rendering for previews once icons exist for all card types (keeps big-card work dependent on art readiness)

### Phase 14 — Background treatment

- More exciting animated abstract background; fallback to tiled sprite patterns if per-frame generation is too expensive

### Phase 15 — Mouse + audio + extra polish grab-bag

- Add mouse controls (TIC-80 `mouse()`) layered on top of controller UX
- Music / sound effects (TIC-80 `music()` / `sfx()`)

## Recommended file layout (after Phase 0)

- `src/` (flat, numeric prefixes; deterministic concatenation order)
  - `00_prelude.js` (`PD` namespace)
  - `05_config.js` (palette + render config + gameplay/UI knobs)
  - `10_util.js`
  - `15_rng.js`, `20_seed.js`, `30_shuffle.js`
  - `35_defs.js`, `40_state.js`, `45_rules.js`, `50_scenarios.js`
  - `52_moves.js` (command/move helpers; UI queries)
  - `53_ai.js` (simple AI helpers for harness playtesting)
  - `55_fmt.js` (shared formatting/labels)
  - `56_layout.js` (shared geometry/row policy)
  - `60_render.js` (renderer; namespaced under `PD.render.`*)
  - `65_ui.js` (UI state machine + view models; namespaced under `PD.ui.`*)
  - `70_anim.js` (renderer‑oblivious animation presentation)
  - `90_debug.js` (debug harness + `PD.mainTick`)
  - `99_main.js` (single `TIC()` entry point)

Module organization is enforced via namespaces (e.g. `PD.render`, future `PD.ui`) rather than subfolders, because the build/test tooling currently only includes top-level `src/*.js`.

- `scripts/build.mjs` (Node; generates `game.js`)
- `game.js` (generated, paste into TIC-80)

## Architecture sketch

```mermaid
flowchart TD
  ui[UIStateMachine] --> cmds[Commands]
  ai[AI_RandomLegal] --> cmds
  cmds --> rules[RulesEngine_applyCommand]
  rules --> state[GameState]
  state --> render[Renderer]
  rules --> win[WinEvaluator]
  rules --> legal[LegalMoves]
```



