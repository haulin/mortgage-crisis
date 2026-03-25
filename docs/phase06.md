# Phase 06 — Debt/payment + “faux-turn placement”

Phase 06 implements the **debt/payment pipeline** and the recipient’s **explicit placement step** for received properties.

Key idea: prompts are **rules-owned** and can bind to a player via `prompt.p` independent of `state.activeP`, so future actions (Rent/SlyDeal/etc.) can force the opponent to act without mutating turn order.

## What shipped

### Prompt actor separation

- Prompts are bound to an **actor** `prompt.p`.
- `PD.applyCommand` and `PD.legalMoves` both treat `prompt.p` as the acting player for prompt commands.
- This is intentionally decoupled from `state.activeP`.

### New prompt kinds

- **`payDebt`**
  - Shape: `{ kind:"payDebt", p:<payer>, toP:<payee>, rem:<int>, buf:[uids...] }`
  - Meaning: payer must pay down a remaining amount `rem`.
  - Selected cards are removed from the payer’s zones and pushed into `buf` (prompt-owned).
  - **Auto-finalizes** when `rem <= 0` or the payer has no remaining payables.

- **`placeReceived`**
  - Shape: `{ kind:"placeReceived", p:<recipient>, uids:[uids...] }`
  - Meaning: recipient must place each received property explicitly.
  - Cards in this buffer are treated as **unassigned** (Wild color is chosen during placement).

### New command kind

- **`payDebt`**
  - Used only during a `payDebt` prompt.
  - Selectable sources:
    - `bank` cards (`loc.zone === "bank"`)
    - `setHouse` cards (`loc.zone === "setHouse"`)
    - `setProps` cards (`loc.zone === "setProps"`) when the set has **no House**

### House-pay-first rule

- Engine enforcement: paying a `setProps` card from a set that still has a House throws `house_pay_first`.
- UI behavior: pressing `A` on a property in a housed set **redirects selection** to the House (it does **not** pay it automatically; the player must press `A` again on the House).

### Transfer + placement behavior

- When debt finalizes:
  - Bankables (money/actions/houses) are transferred to the payee’s **bank**.
  - Properties are transferred into a `placeReceived` prompt for the payee.
- Wild assignment is effectively “cleared” on transfer because the received buffer stores only `uid`s; placement assigns the color.

### Faux-hand UI (recipient placement)

- During `placeReceived` (P0-only UI for now):
  - Row 4 shows a **faux-hand** (received properties) on the left, and the real hand/bank on the right.
  - Only faux-hand cards are actionable.
  - `A` on a faux-hand card enters **targeting** to choose destination set / new set.

### Rent (vertical slice)

Rent cards are now playable:

- Engine:
  - New command `playRent` charges rent from a chosen set and triggers `PD.beginDebt(opponent, you, amount)`.
  - Amount is computed from set size (capped at required size) plus House bonus when applicable.
- UI:
  - Rent cards show a **Rent** menu option when at least one eligible set exists.
  - Rent uses a targeting-like picker where **L/R cycles sets**, defaulting to the **highest** rent amount but allowing player override (strategic low-rent plays).
- Harness note:
  - During Phase 06 development, the debug harness temporarily auto-resolved opponent `payDebt` prompts for playtesting; this is superseded by Phase 07’s simple AI loop.

## Files changed

- `src/40_state.js`
  - prompt shapes now preserve extra fields
  - `PD.beginDebt` + `PD.hasAnyPayables`
- `src/45_rules.js`
  - prompt actor separation (`prompt.p`)
  - `payDebt` / `placeReceived` prompt handling
  - `payDebt` command + placement from `recvProps`
  - `playRent` command + rent amount helper
- `src/65_ui.js`
  - prompt toast text for `payDebt` / `placeReceived`
  - prompt-mode handling for `payDebt` / `placeReceived`
  - faux-hand rendering + additional `loc` wiring for selectable bank/set items
- `src/50_scenarios.js`
  - scenario renames + optional titles/descriptions (`PD.SCENARIO_INFO`)
  - minimal Phase 06 scenarios: `debtHouseFirst`, `placeReceived`
- `test/40_state.test.mjs`, `test/45_rules.test.mjs`, `test/65_ui_controls.test.mjs`
  - invariants updated to include prompt buffers
  - new tests for prompt actor, house-first, placement UX

## Scenarios (current IDs)

- `placeBasic`, `wildBasic`, `houseBasic`, `winCheck`, `bankScrollShuffle`
- Phase 06:
  - `debtHouseFirst`: payDebt prompt where House must be paid first (designed to overpay and resolve without entering placement).
  - `placeReceived`: placeReceived prompt with a fixed property + a Wild.

## Debugging the rent/debt cycle

In **DebugText mode**, the left column includes a `Prompt:` stage line so you can see which part of the pipeline is active:

- `Prompt:payDebt rem:$N buf:N` (payer is selecting payment cards)
- `Prompt:placeRecv n:N` (recipient is placing received properties)

## Notes / future hooks

- The debt + placement pipeline is intentionally generic so Phase 07+ can reuse it for Rent/SlyDeal and later Phase 11 “pay/select/transfer” actions.
- UI for prompts where `prompt.p !== 0` (opponent acting) is intentionally deferred (AI/hotseat decisions later).

