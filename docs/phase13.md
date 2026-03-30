# Phase 13 — Menu as main entry point

Phase 13 turns the Title screen into the **real entry point** for the cartridge, while keeping dev/test tooling available behind an explicit dev path.

## What shipped

### Boot flow: Title → (menu selection)

- The cartridge boots into the **Title** mode and stays there until the player chooses a menu item.
- The Title menu is now **interactive**:
  - **Up/Down**: change selection
  - **A**: select
- With **Dev tools OFF**, starting **New Game** uses a **time-based seed** so repeated New Games feel fresh.
- With **Dev tools ON**, starting **New Game** remains **deterministic** (reproducible debugging).

### Title menu items

- **New Game**: starts a fresh game session (default scenario).
  - If a game session already exists, the Title asks for confirmation before overwriting it (**A** confirm, **B** cancel).
- **Continue**: returns to the current in-memory game session (disabled until you’ve started one).
- **How to Play**: placeholder (disabled; implemented in Phase 14).
- **Dev: ON/OFF** (only when `MC.config.debug.enabled` is true): toggles dev tooling.
  - When **Dev** is ON:
    - center-row debug buttons (**Step/Reset/Next**) are visible
    - **Y** toggles **DebugText ↔ Render**
  - When **Dev** is OFF:
    - debug buttons are hidden
    - **Y** does nothing

### Title feedback uses toasts

- Title menu feedback (disabled items, dev toggle) uses the same **toast boxes** as in-game notifications.
- Title toasts **stack**; identical messages dedupe by message text.

### Return to menu (in-game)

- The center button strip now includes **Menu** (below **End**).
- Selecting **Menu** returns to the Title screen **without resetting** game state.
- **Continue** returns you to the same session.

### Version display

- `MC.config.meta.version` is now shown on the **Title** screen (and removed from the in-game HUD hint).

## Code / config touchpoints

- `src/80_title.js`: title screen input + menu rendering + version display
- `src/90_debug.js`: main tick wiring + title/menu transitions + dev-only Y toggle gating
- `src/65_ui.js`: center-row **Menu** button + debug button gating + prompt escape via Menu
- `src/60_render.js`: button rendering supports variable heights; removed in-game version hint; added Menu help text
- `src/66_focus.js`: game-over autofocus prefers **Reset** when dev tools are ON, otherwise **Menu**
- `src/00_prelude.js`: runtime flag `MC.debug.toolsOn` default
- `src/05_config.js`: version bump

