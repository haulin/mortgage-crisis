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

- **Left/Right**: cycle destinations
- **Up/Down**: toggle Wild color (when targeting a Wild property)
- **B**: cancel targeting and return to browse

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

