# Property Deal — User Manual (WIP)

This document describes **how to play and test the current build** of Property Deal, from the user’s point of view.

It will evolve as new phases land. If something in the game feels “undocumented”, that’s a bug in the docs.

## Quick start (TIC-80)

- Build the cartridge:

```bash
npm run build
```

- In TIC-80, import/run `game.js` (see `README.md` for workflow notes).
- Controls are **controller-first** (D-pad + A/B/X/Y).

## Controls (current)

Button IDs are TIC-80 defaults for player 1: UP=0 DOWN=1 LEFT=2 RIGHT=3 A=4 B=5 X=6 Y=7.

- **D-pad**: move selection (cursor) between zones and items.
- **A (tap)**:
  - on a hand card: open the action menu (Place/Build/Bank, depending on the card)
  - in menus: choose the hovered menu item
  - in prompts: confirm the prompt action (e.g. discard)
- **A (hold)**:
  - start “grab/targeting” quickly (hold + nudge a direction enters targeting immediately)
  - release A to confirm (when targeting was entered from a hold)
- **B (tap)**: back/cancel out of menu/targeting (and some prompts, if allowed).
- **X (hold)**: Inspect overlay (after a short delay).
- **Y (tap)**: dev harness toggle (DebugText ↔ Render).

## Gameplay loop (current)

Property Deal is still under active development; the full card set is not implemented yet. The current gameplay focuses on:

- **Turn loop**:
  - start-of-turn draw (draw 2, or draw 5 if your hand is empty)
  - play up to **3** cards (`playsLeft`)
  - end turn
- **Win condition**: first to **3 complete property sets**

### Ending the turn with too many cards (discard prompt)

If you end your turn with more than 7 cards, you enter a forced prompt:

- A banner/toast shows **“Too many cards. Discard N”**
- **A** discards the highlighted hand card
- **B** cancels only **before the first discard** in that prompt instance; after you discard once, it’s forced

### Paying a debt (pay-debt prompt)

Some effects can force a “pay a debt” prompt (Phase 06 foundation).

- A banner/toast shows **“Pay debt: $N left”**
- **D-pad**: navigate to a payable card (bank cards, properties, or a House on a set)
- **A**: pay the highlighted card (it’s removed immediately)
- **House-pay-first**: if a set has a House, you can’t pay properties from that set until the House is paid
  - pressing **A** on a property in that set redirects selection to the House (it does **not** pay automatically)
  - press **A** again on the House to pay it
- The prompt **auto-finishes** when the debt is covered or you run out of payables (overpay is allowed; no change is returned)

### Placing received properties (faux-turn placement prompt)

When you receive properties as payment, you place them explicitly:

- A banner/toast shows **“Place received properties: N”**
- Row 4 shows a **faux-hand** of received properties on the **left**, plus your real hand/bank to the right
- Only the faux-hand cards are actionable
- **A** on a received property enters targeting to choose its destination (existing set or new set)
  - For Wild properties: **Up/Down** toggles the chosen color during targeting
- **B** is not a general cancel during this prompt (you must place the received properties)

### Playing a Rent card (Phase 06 vertical slice)

If you have a Rent card and at least one eligible set, it can be played (not just banked):

- Cursor the Rent card in hand, then **tap A** to open the menu
- Choose **Rent**
- If there are multiple eligible sets, you enter a Rent picker:
  - **Left/Right**: cycle which of your sets you’re charging rent from
  - the overlay shows the chosen set and the amount
  - **A** confirms, **B** cancels (or cycle to **Source** and confirm)
- After confirming, the opponent pays (currently auto-resolved in the dev harness; full AI/response UX comes later)

## Inspect (hold X)

Inspect shows the selected card’s details. Notes:

- Inspect only shows while you’re in normal browsing / prompt flow.
- In menus/targeting, Inspect is intentionally suppressed to reduce UI noise.

## Hand card actions (menu)

When your cursor is on a hand card, **tap A** to open a menu of actions that are currently legal for that card:

- **Place** (property cards)
- **Build** (house cards, only when legal)
- **Bank** (money/action cards that can be banked)

### Single-destination shortcuts

If **Place** or **Build** has exactly **one** legal destination, the UI may:

- show a more specific label (e.g. **“Place → New Set”**), and
- auto-apply the action without making you go through targeting.

## Targeting (destination selection)

Targeting appears when an action needs a destination selection (e.g. placing a property into one of multiple sets).

There are two ways to enter targeting:

- **From the menu**: tap A on Place/Build to enter targeting; confirm with **tap A**.
- **From a hold**: hold A on a hand card to enter targeting; confirm with **release A**.

While targeting:

- **Left/Right**: cycle destinations (or **options** when using hold‑A quick targeting)
- **Up/Down**: toggle Wild color (only when targeting a Wild property placement)
- **B**: cancel targeting and return to browse

### Hold‑A “quick targeting” (action cycling)

When you **hold A** on certain hand cards (currently **Rent** and **House**), the UI enters a quick targeting mode:

- **Left/Right** cycles a flat list of options, such as: **Rent**, **Build**, **Bank**, **Source**
- Default choice prefers **Rent (highest amount)** when available
- Confirm by **releasing A**

### Source destination (cancel-by-dropping-back)

Targeting includes a special destination called **Source**:

- Cycling to **Source** and confirming cancels the action (no command is applied).
- While targeting, the grabbed source card is hidden in-hand so it doesn’t look like you have “two copies” on screen.

## Banking preview behavior

When banking is previewed into the bank stack, the preview should not overlap the current top bank card:

- the existing bank stack shifts left by one stack stride so the preview can occupy the “new top” slot.

## Draw + reshuffle visibility (animations)

Draws are staged so they’re readable:

- When you draw multiple cards, they are **dealt one-by-one** instead of instantly appearing.
- If the deck runs out and the game reshuffles discard into deck, you’ll see a short **“Deck ran out. Shuffling”** toast plus a simple deck animation.
- While shuffle/deal animations run, **input is temporarily locked** so you don’t miss it.
  - During the shuffle, the discard pile is shown **empty** (it has already been consumed) and the deck count is temporarily shown as **empty** until the shuffle finishes.

## Disallowed action feedback

When you try to do something illegal or currently unavailable:

- The selection highlight **flashes red** briefly.
- If you repeat the same mistake, you’ll also get a short toast explaining why (e.g. “Not available”).

## Debug harness (for testers/dev)

The project includes a built-in harness to make testing faster.

### Modes

- **DebugText mode**: text-only debug view
- **Render mode**: the actual rendered game UI
- Toggle with **Y**

### DebugText controls

DebugText mode uses the simplest possible bindings:

- **A**: step one random legal move
- **B**: next scenario
- **X**: reset scenario
- **Y**: toggle DebugText ↔ Render

### DebugText prompt stage line

The DebugText screen’s **left column** includes a `Prompt:` line to show which rules prompt is active (useful for tracking the Rent/debt cycle):

- `Prompt:(none)`
- `Prompt:payDebt rem:$<n> buf:<n>` (selecting payment)
- `Prompt:placeRecv n:<n>` (placing received properties)
- `Prompt:discardDown to:<n> left:<n>` (discarding down to 7)

### DebugText “UI snapshot” column legend

The DebugText screen has a **right column** showing a compact UI snapshot (captured from the last Render-mode tick).

- **`UI:<mode> I:<0/1> Drag:<0/1>`**
  - `mode`: `browse` | `menu` | `targeting` | `prompt`
  - `I`: `view.inspectActive` (1 when Inspect overlay is active)
  - `Drag`: 1 when you are in hold-targeting (i.e. currently “dragging” a card)
- **`Cur:r<row> i<i>`**
  - current cursor position (row + index)
- **`Menu:<i>/<n> <id>`** (only when `UI:menu`)
  - hovered menu index / count, and menu item id (e.g. `place`, `build`, `bank`)
- **`Tgt:<kind> <cmdI>/<n>`** (only when `UI:targeting`)
  - `kind`: `place` | `build` | `bank`
  - `cmdI/n`: selected destination index + total destinations
- **`Prompt:<kind>`** (only when `UI:prompt`)
  - currently `discardDown`
- **`Tgt:<kind> <cmdI>/<n> h:<0/1>`** (only when `UI:targeting`)
  - `h`: 1 when targeting was entered from **holding A** (confirm on A release)
- **`Down:...`**
  - raw “currently held” button states (not one-frame pulses), captured from the last Render-mode tick
- **`Held:A<frames> X<frames> Grab:<0/1> XLatch:<0/1>`**
  - `Held:A` / `Held:X`: how many frames A/X have been held (controls state)
  - `Grab`: whether the controls layer considers “A grab mode” active
  - `XLatch`: whether the controls layer considers Inspect latched (after delay)
- **`Intent:<summary>`**
  - what the UI returned last frame, e.g. `applyCmd:bank`, `debug:step`, or `(none)`

