// script: js
// title: Mortgage Crisis
// saveid: MortgageCrisis
// generated: do not edit by hand (edit src/* instead)
// ---- src/00_prelude.js ----
// Prelude: initialize the global `MC` namespace and module namespaces exactly once.
// Invariant: other modules attach to these objects (no defensive `MC.x = MC.x || {}`).
var MC = MC || {};

// Module namespaces: created once here, never defensively elsewhere.
MC.controls = {};
MC.render = {};
MC.ui = {};
MC.anim = {};
MC.fmt = {};
MC.layout = {};
MC.moves = {};
MC.cmd = {};
MC.cmdProfiles = {};
MC.ai = {};
MC.state = {};
MC.engine = {};
MC.rules = {};
MC.util = {};
MC.shuffle = {};
MC.rng = {};
MC.seed = {};
MC.scenarios = {};
MC.debug = {};
MC.debug.toolsOn = false;
MC.title = {};
MC.howto = {};

// ---- src/05_config.js ----
// MC.config: central gameplay/UI/render tuning knobs (validated in tests; avoid runtime fallbacks).
MC.config = {
  screenW: 240,
  screenH: 136,
  seedBase: 1005
};

// Meta/version display.
MC.config.meta = {
  version: "MVP v0.15"
};

// Debug/dev knobs. Keep these centralized so we can disable later.
MC.config.debug = {
  enabled: true
};

// Controller UX knobs. All values are in frames (TIC runs at 60fps).
MC.config.controls = {
  // D-pad repeat: start repeating after delay, then pulse every period.
  dpadRepeatDelayFrames: 12,
  dpadRepeatPeriodFrames: 4,

  // Hold-A grab: if you hold A without moving, enter grab after this fallback threshold.
  // (Hold+move enters immediately.)
  aHoldFallbackFrames: 18,

  // Inspect overlay becomes active after holding X this long.
  xInspectDelayFrames: 6
};

// UI/navigation tuning.
MC.config.ui = {
  // Directional navigation cone penalty multiplier (per-axis):
  // used by MC.ui.navPickInDirection scoring:
  // score = along^2 + (perp^2)*k
  //
  // Bigger k => narrower cone (harder to jump across rows/columns).
  // k must be > 0. Typical values are ~4..30.
  //
  // - Left/Right usually wants a *narrower* cone to avoid jumping to other rows.
  // - Up/Down can stay more permissive.
  navConeKLeftRight: 18,
  navConeKUpDown: 6,

  // Timings are in frames (TIC runs at 60fps).
  // Debug aid: multiply timings for slow-motion debugging (1 = normal speed).
  animSpeedMult: 3,
  dealFramesPerCard: 8,
  dealGapFrames: 2,
  xferFramesPerCard: 8,
  xferGapFrames: 2,
  xferHoldFromFrames: 18,
  xferHoldFrames: 12,
  gameStartToastFrames: 60,
  // Shuffle: default includes ~1 extra 1→2→3 loop for readability.
  shuffleAnimFrames: 42,
  shuffleToastFrames: 42,

  aiStepDelayFrames: 60,
  aiNarrateToastFrames: 60,

  // Toast timings.
  toast: {
    infoFrames: 90,
    errorFrames: 90
  },

  // Sly Deal targeting presentation.
  // If true: show ghost outlines for non-selected Sly targets while targeting.
  slyShowTargetGhosts: false
 
};

// Title screen knobs. Keep numeric/layout values here for easy iteration.
MC.config.title = {
  // Right panel width (menu area).
  menuW: 90,

  // Logo text scale (TIC-80 print scale).
  logoScale: 3,
  logoX: 10,
  logoY: 18,

  // Subtitle (small).
  subtitleText: "Inspired by Monopoly Deal",
  subtitleX: 34,
  subtitleY: 69,

  // Controls panel (bottom-left).
  controlsX: 20,
  controlsW: 117,
  controlsH: 40,
  controlsBottomY: 8,

  // Menu layout (right panel).
  menuY: 50,
  menuDy: 12,
  menuArrowX: 6,
  menuTextX: 12,
  menuItemBoxes: true,
  menuItemGapY: 4,
  menuItemBoxPadX: 6,
  menuItemBoxPadY: 4,

  // Background tiling (optional): sprite id is top-left of a 2x2 block (16x16).
  // Defaults to the card-back TL sprite, which should exist in the cart.
  bgTileEnabled: true,
  bgTileSprId: 34,
  bgTileColorkey: 15
};

// AI policy knobs.
MC.config.ai = {
  // Per-player policy IDs (0=player, 1=opponent by default).
  policyByP: ["defaultHeuristic", "defaultHeuristic"],

  // Policy weight multipliers; 1 means neutral (equivalent to uniform random).
  biasExistingSetK: 8,
  biasPayDebtFromBankK: 8,

  // Early-turn discipline.
  earlyBankBufferTarget: 3,
  earlyEmptyHandKeepActionsMaxHand: 2,
  biasEarlyBankMoneyK: 6,
  biasEarlyEndTurnOverBankActionsK: 6,
  biasEarlyPlayRentIfPayableK: 3,
  biasEarlyPlaceWhenHoldingRentK: 2,

  biasPlayRentK: 4,
  biasPlaySlyDealK: 8,
  biasPlayJustSayNoK: 8,
  biasMoveWildK: 8
};

// Rule-note IDs. These are small display-only annotations in Inspect.
MC.RuleNote = {
  // MVP1 rule constraints.
  SlyDeal_NotFromFullSet: 1,

  // Optional / other-version rules (not enabled in MVP1).
  House_StationsUtilities: 2,
  JSN_Chain: 3
};

// Rules display knobs.
MC.config.rules = {
  // List of enabled RuleNote IDs to show in Inspect.
  // Note: keep this intentionally small; it's easy to mislead players with future-rule text.
  enabledRuleNotes: [
    MC.RuleNote.SlyDeal_NotFromFullSet
  ]
};

// TIC-80 default palette is Sweetie-16.
// These are palette *indices* (0..15), not RGB values.
MC.Pal = {
  Black: 0,       // #1a1c2c
  Purple: 1,      // #5d275d
  Red: 2,         // #b13e53
  Orange: 3,      // #ef7d57
  Yellow: 4,      // #ffcd75
  LightGreen: 5,  // #a7f070
  Green: 6,       // #38b764
  DarkGreen: 7,   // #257179
  DarkBlue: 8,    // #29366f
  Blue: 9,        // #3b5dc9
  LightBlue: 10,  // #41a6f6
  Cyan: 11,       // #73eff7
  White: 12,      // #f4f4f4
  LightGrey: 13,  // #94b0c2
  Grey: 14,       // #566c86
  DarkGrey: 15,   // #333c57
};

// How-to-play screen knobs. Keep layout/typography here for easy tuning.
MC.config.howto = {
  padX: 8,
  padY: 6,

  headerH: 10,
  footerH: 2,

  // Typography: fixed-width for predictable wrapping.
  headingCharW: 6,
  headingLineH: 7,
  bodyCharW: 4,
  bodyLineH: 6,

  // Layout spacing.
  blockGapY: 10,
  demoGapX: 6,
  demoGapY: 3,

  // Scrolling.
  scrollStepPx: 6,

  // Colors (Sweetie-16 indices).
  bgCol: MC.Pal.Black,
  panelCol: MC.Pal.DarkBlue,
  borderCol: MC.Pal.Grey,
  titleCol: MC.Pal.White,
  headingCol: MC.Pal.White,
  textCol: MC.Pal.LightGrey,
  mutedCol: MC.Pal.LightGrey,
  accentCol: MC.Pal.Yellow,
};

MC.config.render = {
  // Layout knobs: geometry + positions.
  layout: {
    screenW: MC.config.screenW,
    screenH: MC.config.screenH,

    // Row bands (0-based, inclusive bounds are derived).
    rowY: [0, 12, 39, 82, 109],
    rowH: [12, 27, 43, 27, 27],

    faceW: 17,
    faceH: 25,
    highlightPad: 1, // outside face border

    // Row placement rules for rows 2/4/5 (27px tall).
    faceInsetY: 1,

    // Stacks
    stackStrideX: 8, // next face origin
    stackGapX: 2,
    shadowBarDx: -1, // xFace-1

    // Hands
    handStrideX: 18,

    // Camera
    camMarginX: 12,
    rowPadX: 4,

    // Controls line (simple single print)
    hudLineEnabled: true,
    hudLineX: 6,
    hudLineY: 74,

    // Center row
    centerTopInsetY: 4,
    centerDeckX: 6,
    centerPileGapX: 6,
    // Payment/transfer buffer anchor (screen-space x).
    // Y uses rowY[ROW_CENTER] + centerTopInsetY to match deck/discard.
    centerPayBufX: 48,
    centerPreviewX: 70,
    centerPreviewGapX: 8,
    centerDescDy: 8,

    // Center row button strip.
    centerBtnStripW: 39,
    centerBtnStripPadRight: 1,

    // Inspect panel: screen-space panel bounds.
    // These are absolute so we can tune without coupling to centerPreviewX.
    inspectPanelX0: 48,
    inspectPanelY0: 35,
    inspectPanelX1: 198,
    inspectPanelY1: 85,
    // Content anchors derived from the panel.
    inspectPanelPadX: 2,
    inspectPanelPadY: 2,
    inspectTitleGapX: 2,
    inspectDescDy: 8,

    // Pile depth under-layers (visual only)
    pileUnderDx1: 2,
    pileUnderDy1: 2,
    pileUnderDx2: 4,
    pileUnderDy2: 4
  },

  // Style knobs: colors + template anchors + glyph/icon parameters.
  style: {
    // Digit glyph placement is 3x5; sprite tile may include a 1px border.
    digitGlyphW: 3,
    digitGlyphH: 5,
    digitTile: 8,
    glyphInsetX: 1, // inner glyph top-left in the 8x8 tile
    glyphInsetY: 1,
    glyphColorkey: 15,

    // Dual-color property anchors (0-based, card-local).
    propValueX: 1,
    propValueY: 1,
    propBarX: 5,
    propBarY: 1,
    propBarW: 11,
    propBarH: 5,
    propRentX: 1,
    propRentY: 7,
    propRentDx: 4, // 3px glyph + 1px gap

    // Money/Action/House template anchors (card-local).
    valX: 1,
    valY: 1,
    iconX: 4,
    iconY: 9,

    // Colors (Sweetie-16 indices).
    colBg: MC.Pal.Black,
    colText: MC.Pal.White,
    colCardBorder: MC.Pal.White,
    colCardInterior: MC.Pal.White,
    colShadow: MC.Pal.Black,
    colHighlight: MC.Pal.Yellow,
    colCenterPanel: MC.Pal.DarkBlue,
    colCenterPanelBorder: MC.Pal.White,
    hudLineCol: MC.Pal.White,
    colToastBgAi: MC.Pal.DarkBlue,

    // Center pile depth outlines
    pileShadowOutlineCol: MC.Pal.Black,
    pileOutlineUnder1Col: MC.Pal.LightGrey,
    pileOutlineUnder2Col: MC.Pal.Grey,

    // Inspect panel colors.
    inspectPanelFillCol: MC.Pal.DarkGreen,

    // Deck/Discard pile count digit offset.
    pileCountDx: 1,
    pileCountDy: 1
  },

  // Sprite IDs (NOT locked yet; keep all in one place for easy remap).
  spr: {
    // Reserve 0 as blank (convention).
    digit0: 1, // digit sprite IDs are digit0 + n

    // Card back (top-left tile id of a 2x3 sprite = 16x24).
    // Art convention: last column + last row are color 15 (colorkey),
    // yielding an effective 15x23 interior when drawn at xFace+1,yFace+1.
    cardBackTL: 32,

    // Optional icons (0 = skip). You’ll remap once the atlas is real.
    iconMoney: 16,
    iconRent: 20,
    iconSlyDeal: 18,
    iconJSN: 19,
    iconHouse: 17
  },

  // Money/value palette mapping from docs/session01.md: 1→4, 2→2, 3→5, 4→10, 5→1
  moneyBgByValue: [
    0,
    MC.Pal.Yellow,     // 1
    MC.Pal.Red,        // 2
    MC.Pal.LightGreen, // 3
    MC.Pal.LightBlue,  // 4
    MC.Pal.Purple      // 5
  ]
};

// ---- src/10_util.js ----
// MC.util: shared tiny utilities (pure helpers; no TIC-80 API usage).

MC.util.bankValueTotal = function (state, p) {
  var bank = state.players[p].bank;
  var sum = 0;
  var i;
  for (i = 0; i < bank.length; i++) {
    var uid = bank[i];
    var di = state.uidToDefI[uid];
    var def = MC.CARD_DEFS[di];
    if (def && def.bankValue) sum += def.bankValue;
  }
  return sum;
};

// ---- src/15_rng.js ----
// MC.rng: deterministic PRNG helpers (bitwise coercion stays localized here).
MC.rng.u32NonZero = function (n) {
  var x = (n >>> 0);
  return x ? x : 1;
};

MC.rng.xorshift32Step = function (sU32) {
  var x = sU32 >>> 0;
  if (!x) x = 1;
  x ^= x << 13;
  x >>>= 0;
  x ^= x >>> 17;
  x ^= x << 5;
  x >>>= 0;
  return x >>> 0;
};

MC.rng.RNG = function (seedU32) {
  this.s = MC.rng.u32NonZero(seedU32);
};

// Standalone RNG instances (handy for tests/utilities; separate from RNG-in-state).
MC.rng.RNG.prototype.nextU32 = function () {
  this.s = MC.rng.xorshift32Step(this.s >>> 0);
  return this.s >>> 0;
};

MC.rng.RNG.prototype.nextInt = function (n) {
  n = n | 0;
  if (n <= 0) return 0;
  return (this.nextU32() % n) | 0;
};

// RNG-in-state helpers (store evolving state in `state.rngS`).
MC.rng.nextIntInState = function (state, n) {
  n = n | 0;
  if (n <= 0) return 0;
  state.rngS = MC.rng.xorshift32Step(state.rngS >>> 0);
  return ((state.rngS >>> 0) % n) | 0;
};

// ---- src/20_seed.js ----
// MC.seed: seed policy for dev + release-ish runs.
// - Dev tools ON: deterministic per seedBase (reproducible debugging).
// - Dev tools OFF: time-based per-second seed so New Game isn't identical.
MC.seed.computeSeedU32 = function () {
  var seedBase = MC.config.seedBase;
  var toolsOn = !!(MC.debug && MC.debug.toolsOn);
  if (toolsOn) return MC.rng.u32NonZero(seedBase);

  var t = Math.floor(tstamp());
  return MC.rng.u32NonZero(seedBase + t);
};

// ---- src/25_controls.js ----
// MC.controls: input state machine (injected/pollable controls with repeat + hold/tap detection).
MC.controls.newState = function () {
  return {
    frame: 0,

    // Previous raw button-down state (0..7).
    prevDown: [false, false, false, false, false, false, false, false],

    // Per-button consecutive held frames.
    held: [0, 0, 0, 0, 0, 0, 0, 0],

    // A-hold grab tracking.
    aGrabActive: false,
    aGrabEnteredThisPress: false,

    // X inspect delay tracking.
    xInspectActive: false,

    // D-pad repeat counters (per direction button id 0..3).
    dpadRepeat: [0, 0, 0, 0],
  };
};

MC.controls.pollGlobals = function () {
  var down = [false, false, false, false, false, false, false, false];
  var pressed = [false, false, false, false, false, false, false, false];

  var hasBtn = (typeof btn === "function");
  var hasBtnp = (typeof btnp === "function");
  var i;
  for (i = 0; i < 8; i++) {
    down[i] = hasBtn ? !!btn(i) : false;
    pressed[i] = hasBtnp ? !!btnp(i) : false;
  }

  return { down: down, pressed: pressed };
};

MC.controls.actions = function (st, raw, cfg) {
  if (!st) st = MC.controls.newState();
  // Contract: caller provides {down[8], pressed[8]} and cfg from MC.config.controls.
  var down = raw.down;
  var pressed = raw.pressed;

  var repeatDelay = cfg.dpadRepeatDelayFrames;
  var repeatPeriod = cfg.dpadRepeatPeriodFrames;

  var grabFallback = cfg.aHoldFallbackFrames;

  var inspectDelay = cfg.xInspectDelayFrames;

  st.frame += 1;

  var i;
  for (i = 0; i < 8; i++) {
    var isDown = !!down[i];
    st.held[i] = isDown ? (st.held[i] + 1) : 0;
  }

  // Edge detection from down states (used in case caller doesn't provide pressed[]).
  function fell(iBtn) { return !!st.prevDown[iBtn] && !down[iBtn]; }
  function rose(iBtn) { return !st.prevDown[iBtn] && !!down[iBtn]; }

  // D-pad repeat: synthesize nav pulses.
  function navPulse(btnId) {
    if (!down[btnId]) { st.dpadRepeat[btnId] = 0; return false; }

    // Prefer provided pressed[] as the initial pulse.
    if (pressed[btnId] || rose(btnId)) { st.dpadRepeat[btnId] = 0; return true; }

    st.dpadRepeat[btnId] += 1;
    if (st.dpadRepeat[btnId] < repeatDelay) return false;

    var t = st.dpadRepeat[btnId] - repeatDelay;
    return (t % repeatPeriod) === 0;
  }

  var up = navPulse(0);
  var downNav = navPulse(1);
  var left = navPulse(2);
  var right = navPulse(3);

  var aDown = !!down[4];
  var aPressed = !!pressed[4] || rose(4);
  var aReleased = fell(4);

  var bPressed = !!pressed[5] || rose(5);

  var xDown = !!down[6];
  var xPressed = !!pressed[6] || rose(6);
  var xReleased = fell(6);

  // A grab mode: enter on hold+move (any nav pulse while A held),
  // or on fallback hold threshold.
  if (aPressed) {
    st.aGrabActive = false;
    st.aGrabEnteredThisPress = false;
  }

  var navAny = !!(up || downNav || left || right);
  var aHeldFrames = st.held[4];
  var aGrabStartNow = false;

  if (aDown && !st.aGrabActive) {
    var shouldEnter = false;
    if (navAny && aHeldFrames > 0) shouldEnter = true;
    else if (aHeldFrames >= grabFallback && grabFallback > 0) shouldEnter = true;
    if (shouldEnter) {
      st.aGrabActive = true;
      st.aGrabEnteredThisPress = true;
      aGrabStartNow = true;
    }
  }

  if (aReleased) {
    st.aGrabActive = false;
  }

  // Tap A is only when it was a press->release without entering grab.
  var aTap = false;
  if (aReleased) {
    aTap = !st.aGrabEnteredThisPress;
    st.aGrabEnteredThisPress = false;
  }

  // Inspect: active only after delay while X held.
  if (xPressed) st.xInspectActive = false;
  if (!xDown) st.xInspectActive = false;
  if (xDown && !st.xInspectActive) {
    if (st.held[6] >= inspectDelay && inspectDelay > 0) st.xInspectActive = true;
    if (inspectDelay === 0) st.xInspectActive = true;
  }
  if (xReleased) st.xInspectActive = false;

  // Persist prevDown.
  for (i = 0; i < 8; i++) st.prevDown[i] = !!down[i];

  return {
    nav: { up: up, down: downNav, left: left, right: right },

    a: {
      down: aDown,
      pressed: aPressed,
      released: aReleased,
      tap: aTap,
      grabActive: !!st.aGrabActive,
      grabStart: !!aGrabStartNow,
    },

    b: { pressed: !!bPressed },

    x: {
      down: xDown,
      pressed: xPressed,
      released: xReleased,
      inspectActive: !!st.xInspectActive,
    }
  };
};

// ---- src/30_shuffle.js ----
// MC.shuffle: deterministic shuffling helpers (seeded RNG / state RNG).
(function initShuffleModule() {
  function byNextInt(arr, nextInt) {
    var i;
    for (i = arr.length - 1; i > 0; i--) {
      var j = nextInt(i + 1);
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  MC.shuffle.inPlaceWithRng = function (arr, rng) {
    return byNextInt(arr, function (n) { return rng.nextInt(n); });
  };

  MC.shuffle.inPlaceWithStateRng = function (state, arr) {
    return byNextInt(arr, function (n) { return MC.rng.nextIntInState(state, n); });
  };
})();

// ---- src/35_defs.js ----
// Card/game definitions: enums + static data tables (treated as read-only).
MC.Color = {
  Cyan: 0,
  Magenta: 1,
  Orange: 2,
  Black: 3,
};

MC.CardKind = {
  Money: 0,
  Action: 1,
  Property: 2,
  House: 3,
};

MC.ActionKind = {
  Rent: 0,
  SlyDeal: 1,
  JustSayNo: 2,
};

// Rule note display text. These are appended in Inspect when enabled by config.
MC.ruleNoteTextById = [];
MC.ruleNoteTextById[MC.RuleNote.SlyDeal_NotFromFullSet] = "(Cannot be part of a full set)";
MC.ruleNoteTextById[MC.RuleNote.House_StationsUtilities] = "(Except stations & utilities)";
MC.ruleNoteTextById[MC.RuleNote.JSN_Chain] = "(You can say No to a No)";

MC.SET_RULES = [];
MC.SET_RULES[MC.Color.Cyan] = {
  requiredSize: 2,
  rent: [1, 3],
};
MC.SET_RULES[MC.Color.Magenta] = {
  requiredSize: 3,
  rent: [1, 2, 4],
};
MC.SET_RULES[MC.Color.Orange] = {
  requiredSize: 3,
  rent: [2, 3, 5],
};
MC.SET_RULES[MC.Color.Black] = {
  requiredSize: 4,
  rent: [1, 2, 3, 6],
};

MC.HOUSE_RENT_BONUS = 3;

MC.CARD_DEFS = [
  // Money (10)
  {
    id: "money_1",
    name: "Money",
    desc: "Spend to pay debts.\nBank as money.",
    kind: MC.CardKind.Money,
    count: 3,
    bankValue: 1,
  },
  {
    id: "money_2",
    name: "Money",
    desc: "Spend to pay debts.\nBank as money.",
    kind: MC.CardKind.Money,
    count: 3,
    bankValue: 2,
  },
  {
    id: "money_3",
    name: "Money",
    desc: "Spend to pay debts.\nBank as money.",
    kind: MC.CardKind.Money,
    count: 2,
    bankValue: 3,
  },
  {
    id: "money_4",
    name: "Money",
    desc: "Spend to pay debts.\nBank as money.",
    kind: MC.CardKind.Money,
    count: 1,
    bankValue: 4,
  },
  {
    id: "money_5",
    name: "Money",
    desc: "Spend to pay debts.\nBank as money.",
    kind: MC.CardKind.Money,
    count: 1,
    bankValue: 5,
  },

  // Properties (12 fixed + 2 wild = 14)
  {
    id: "prop_cyan",
    name: "Property Cyan",
    desc: "Full set: 2 required.\nRent for 1 property: $1\nRent for 2 properties: $3",
    kind: MC.CardKind.Property,
    count: 2,
    propertyColor: MC.Color.Cyan,
    propertyPayValue: 3,
  },
  {
    id: "prop_magenta",
    name: "Property Magenta",
    desc: "Full set: 3 required.\nRent for 1 property: $1\nRent for 2 properties: $2\nRent for 3 properties: $4",
    kind: MC.CardKind.Property,
    count: 3,
    propertyColor: MC.Color.Magenta,
    propertyPayValue: 2,
  },
  {
    id: "prop_orange",
    name: "Property Orange",
    desc: "Full set: 3 required.\nRent for 1 property: $2\nRent for 2 properties: $3\nRent for 3 properties: $5",
    kind: MC.CardKind.Property,
    count: 3,
    propertyColor: MC.Color.Orange,
    propertyPayValue: 2,
  },
  {
    id: "prop_black",
    name: "Property Black",
    desc: "Full set: 4 required.\nRent for 1 property: $1\nRent for 2 properties: $2\nRent for 3 properties: $3\nRent for 4 properties: $6",
    kind: MC.CardKind.Property,
    count: 4,
    propertyColor: MC.Color.Black,
    propertyPayValue: 1,
  },
  {
    id: "wild_mo",
    name: "Wild Magenta/Orange",
    desc: "Orange rent: $2/$3/$5\nMagenta rent: $1/$2/$4",
    kind: MC.CardKind.Property,
    count: 1,
    wildColors: [MC.Color.Magenta, MC.Color.Orange],
    propertyPayValue: 2,
  },
  {
    id: "wild_cb",
    name: "Wild Cyan/Black",
    desc: "Cyan rent: $1/$3\nBlack rent: $1/$2/$3/$6",
    kind: MC.CardKind.Property,
    count: 1,
    wildColors: [MC.Color.Cyan, MC.Color.Black],
    propertyPayValue: 2,
  },

  // Buildings (2)
  {
    id: "house",
    name: "House",
    desc: "Action card. Add onto any\nfull set you own to add\n$3 to the rent value.",
    kind: MC.CardKind.House,
    count: 2,
    bankValue: 3,
    ruleNotes: [MC.RuleNote.House_StationsUtilities]
  },

  // Actions (9)
  {
    id: "rent_mo",
    name: "Rent Magenta/Orange",
    desc: "Action card. Your opponent\npays you rent for your\nMagenta or Orange sets.\n(Play into center to use)",
    kind: MC.CardKind.Action,
    actionKind: MC.ActionKind.Rent,
    count: 2,
    bankValue: 1,
    rentAllowedColors: [MC.Color.Magenta, MC.Color.Orange],
  },
  {
    id: "rent_cb",
    name: "Rent Cyan/Black",
    desc: "Action card. Your opponent\npays you rent for your\nCyan or Black sets.\n(Play into center to use)",
    kind: MC.CardKind.Action,
    actionKind: MC.ActionKind.Rent,
    count: 2,
    bankValue: 1,
    rentAllowedColors: [MC.Color.Cyan, MC.Color.Black],
  },
  {
    id: "rent_any",
    name: "Rent Any",
    desc: "Action card. Your opponent\npays you rent for one set\nof your choice.\n(Play into center to use)",
    kind: MC.CardKind.Action,
    actionKind: MC.ActionKind.Rent,
    count: 1,
    bankValue: 1,
    rentAllowedColors: null,
  },
  {
    id: "sly_deal",
    name: "Sly Deal",
    desc: "Action card. Steal 1 property\nfrom your opponent.\n(Play into center to use)",
    kind: MC.CardKind.Action,
    actionKind: MC.ActionKind.SlyDeal,
    count: 2,
    bankValue: 3,
    ruleNotes: [MC.RuleNote.SlyDeal_NotFromFullSet]
  },
  {
    id: "just_say_no",
    name: "Just Say No",
    desc: "Action card. Use any time\nwhen an action is played\nagainst you.\n(Play into center to use)",
    kind: MC.CardKind.Action,
    actionKind: MC.ActionKind.JustSayNo,
    count: 2,
    bankValue: 4,
    ruleNotes: [MC.RuleNote.JSN_Chain]
  },
];

MC.DEF_INDEX_BY_ID = {};
(function initDefIndexById() {
  var i;
  for (i = 0; i < MC.CARD_DEFS.length; i++) {
    var id = MC.CARD_DEFS[i].id;
    if (MC.DEF_INDEX_BY_ID[id] != null) {
      throw new Error("duplicate card def id: " + id);
    }
    MC.DEF_INDEX_BY_ID[id] = i;
  }
})();

// ---- src/40_state.js ----
// MC.state: game state constructors + uid bookkeeping + prompt helpers (no UI/render).
MC.state.NO_COLOR = -1;
MC.state.NO_WINNER = -1;
MC.state.HAND_MAX = 7;

MC.state.clearPrompt = function (state) {
  state.prompt = null;
};

MC.state.setPrompt = function (state, prompt) {
  if (prompt == null) {
    state.prompt = null;
    return;
  }
  var k = String(prompt.kind);
  var p = prompt.p;

  if (k === "discardDown") {
    var nDiscarded = (prompt.nDiscarded != null) ? prompt.nDiscarded : 0;
    state.prompt = {
      kind: k,
      p: p,
      nDiscarded: nDiscarded
    };
    return;
  }

  if (k === "payDebt") {
    var src = prompt.srcAction;
    var srcAction = src ? { kind: String(src.kind || ""), fromP: src.fromP, actionUid: Math.floor(src.actionUid) } : null;
    state.prompt = {
      kind: k,
      p: p,
      toP: prompt.toP,
      rem: Math.floor(prompt.rem),
      buf: prompt.buf.slice(),
      srcAction: srcAction
    };
    return;
  }

  if (k === "respondAction") {
    // Generic response window prompt.
    // Keep payload minimal and validate via tests (avoid runtime shape asserts).
    var src2 = prompt.srcAction;
    var srcAction2 = src2 ? { kind: String(src2.kind || ""), fromP: src2.fromP, actionUid: Math.floor(src2.actionUid) } : null;
    var tgt = prompt.target;
    var loc = tgt && tgt.loc ? tgt.loc : null;
    state.prompt = {
      kind: k,
      p: p,
      srcAction: srcAction2,
      target: { uid: tgt ? tgt.uid : 0, loc: { p: loc ? loc.p : 0, zone: loc ? loc.zone : "", setI: loc ? loc.setI : 0, i: loc ? loc.i : 0 } }
    };
    return;
  }

  if (k === "placeReceived") {
    state.prompt = {
      kind: k,
      p: p,
      uids: prompt.uids.slice()
    };
    return;
  }

  if (k === "replaceWindow") {
    // Wild replace-window (optional reposition after property placement).
    // Keep payload minimal; validate shape via tests (avoid runtime asserts/fallbacks).
    var resume = prompt.resume;
    var resumeObj = null;
    if (resume && String(resume.kind || "") === "placeReceived") {
      resumeObj = { kind: "placeReceived", uids: resume.uids.slice() };
    }
    state.prompt = {
      kind: k,
      p: p,
      srcSetI: Math.floor(prompt.srcSetI),
      excludeUid: Math.floor(prompt.excludeUid),
      resume: resumeObj
    };
    return;
  }

  throw new Error("unknown_prompt_kind:" + k);
};

MC.state.hasAnyPayables = function (state, p) {
  var pl = state.players[p];
  if (pl.bank.length) return true;
  var sets = pl.sets;
  var si;
  for (si = 0; si < sets.length; si++) {
    var set = sets[si];
    if (set.houseUid) return true;
    if (set.props.length) return true;
  }
  return false;
};

MC.state.beginDebt = function (state, fromP, toP, amount, srcAction) {
  if (!(amount > 0)) return;
  if (!MC.state.hasAnyPayables(state, fromP)) return;
  MC.state.setPrompt(state, { kind: "payDebt", p: fromP, toP: toP, rem: amount, buf: [], srcAction: srcAction || null });
};

MC.rules.otherPlayer = function (p) {
  return (p ^ 1) & 1;
};

MC.rules.getSetColor = function (props) {
  if (!props || props.length === 0) return MC.state.NO_COLOR;
  return props[0][1];
};

MC.rules.isBankableDef = function (def) {
  if (!def) return false;
  return def.kind === MC.CardKind.Money || def.kind === MC.CardKind.Action || def.kind === MC.CardKind.House;
};

MC.rules.isWildDef = function (def) {
  return !!(def && def.kind === MC.CardKind.Property && def.wildColors && def.wildColors.length);
};

MC.rules.handHasActionKind = function (state, p, actionKind) {
  var hand = state && state.players && state.players[p] ? state.players[p].hand : null;
  if (!hand || hand.length === 0) return false;
  var i;
  for (i = 0; i < hand.length; i++) {
    var uid = hand[i];
    var def = MC.state.defByUid(state, uid);
    if (def && def.kind === MC.CardKind.Action && def.actionKind === actionKind) return true;
  }
  return false;
};

MC.rules.wildAllowsColor = function (def, color) {
  if (!MC.rules.isWildDef(def)) return false;
  return def.wildColors[0] === color || def.wildColors[1] === color;
};

MC.state.buildAllUids = function (state) {
  var uidToDefI = [0];
  var uid = 1;
  var di;
  for (di = 0; di < MC.CARD_DEFS.length; di++) {
    var def = MC.CARD_DEFS[di];
    var c = def.count;
    var k;
    for (k = 0; k < c; k++) {
      uidToDefI[uid] = di;
      uid++;
    }
  }
  state.uidToDefI = uidToDefI;
  state.totalUids = uidToDefI.length - 1;
};

MC.state.defByUid = function (state, uid) {
  var di = state.uidToDefI[uid];
  return MC.CARD_DEFS[di];
};

MC.state.newEmptySet = function () {
  return {
    // Properties are tuples: [uid, color]
    props: [],
    // House card uid (0/undefined means none).
    houseUid: 0
  };
};

MC.state.drawToHand = function (state, p, n, events) {
  if (n <= 0) return;

  var uids = [];
  while (n > 0) {
    var nAvail = state.deck.length;
    if (nAvail <= 0) {
      var nDisc = state.discard.length;
      if (nDisc <= 0) break;
      // Reshuffle discard into deck (deterministic).
      var i;
      for (i = 0; i < nDisc; i++) state.deck.push(state.discard[i]);
      state.discard = [];
      MC.shuffle.inPlaceWithStateRng(state, state.deck);
      if (events) events.push({ kind: "reshuffle", from: "discard", to: "deck", n: nDisc });
      nAvail = state.deck.length;
      if (nAvail <= 0) break;
    }

    var take = nAvail;
    if (take > n) take = n;
    var k;
    for (k = 0; k < take; k++) {
      var uid = state.deck.pop();
      state.players[p].hand.push(uid);
      uids.push(uid);
    }
    n -= take;
  }

  if (events && uids.length > 0) events.push({ kind: "draw", p: p, uids: uids });
};

MC.state.startTurn = function (state, events) {
  state.playsLeft = 3;
  MC.state.clearPrompt(state);
  var p = state.activeP;
  var nDraw = 2;
  if (state.players[p].hand.length === 0) nDraw = 5;
  MC.state.drawToHand(state, p, nDraw, events);
  if (events) events.push({ kind: "plays", p: state.activeP, playsLeft: state.playsLeft });
};

MC.state.newGame = function (opts) {
  var seedU32 = (opts.seedU32 == null) ? MC.seed.computeSeedU32() : MC.rng.u32NonZero(opts.seedU32);

  var state = {
    rngS: seedU32,
    uidToDefI: null,
    totalUids: 0,

    deck: [],
    discard: [],

    players: [
      { hand: [], bank: [], sets: [] },
      { hand: [], bank: [], sets: [] }
    ],

    activeP: 0,
    playsLeft: 0,
    prompt: null,
    winnerP: MC.state.NO_WINNER
  };

  MC.state.buildAllUids(state);

  if (opts.scenarioId) {
    MC.scenarios.applyScenario(state, String(opts.scenarioId));
    return state;
  }

  // Default game start: shuffle full deck, deal 5 each, choose first player randomly,
  // then start their turn (draw 2, playsLeft=3).
  var uid;
  for (uid = 1; uid <= state.totalUids; uid++) state.deck.push(uid);
  MC.shuffle.inPlaceWithStateRng(state, state.deck);

  MC.state.drawToHand(state, 0, 5, null);
  MC.state.drawToHand(state, 1, 5, null);

  state.activeP = MC.rng.nextIntInState(state, 2);
  var events = [];
  events.push({ kind: "turn", activeP: state.activeP });
  MC.state.startTurn(state, events);
  // Default newGame doesn't expose events, but tests may call startTurn/endTurn directly.

  return state;
};

// Scenario/test helpers (defId-first).
MC.state.cardPoolInit = function (state) {
  var pool = {};
  var uid;
  for (uid = 1; uid <= state.totalUids; uid++) {
    var di = state.uidToDefI[uid];
    var defId = MC.CARD_DEFS[di].id;
    var a = pool[defId];
    if (!a) {
      a = [];
      pool[defId] = a;
    }
    a.push(uid);
  }
  state._pool = pool;
  return pool;
};

MC.state.takeUid = function (state, defId) {
  if (!state._pool) MC.state.cardPoolInit(state);
  var a = state._pool[defId];
  if (!a || a.length === 0) throw new Error("pool_exhausted:" + defId);
  return a.pop();
};

// ---- src/45_rules.js ----
// MC.rules: pure rule computations. MC.engine: deterministic command application + move generation.
MC.rules.evaluateWin = function (state) {
  var p;
  for (p = 0; p < 2; p++) {
    var sets = state.players[p].sets;
    var complete = 0;
    var si;
    for (si = 0; si < sets.length; si++) {
      var set = sets[si];
      if (!set) continue;
      var color = MC.rules.getSetColor(set.props);
      if (color === MC.state.NO_COLOR) continue;
      var req = MC.SET_RULES[color].requiredSize;
      if (set.props.length >= req && req > 0) complete++;
    }
    if (complete >= 3) return p;
  }
  return MC.state.NO_WINNER;
};

MC.engine.assertCanApply = function (state) {
  if (state.winnerP !== MC.state.NO_WINNER) throw new Error("game_over");
};

MC.engine.locEqZone = function (loc, zone) {
  return !!loc && loc.zone === zone;
};

MC.rules.rentAmountForColorCount = function (color, nPropsUncapped, hasHouse) {
  if (color === MC.state.NO_COLOR) return 0;
  var rules = MC.SET_RULES[color];
  if (!rules || !rules.rent || rules.rent.length <= 0) return 0;

  var req = rules.requiredSize;
  var n = nPropsUncapped;
  if (!(n > 0)) return 0;
  if (req > 0 && n > req) n = req;
  if (!(n > 0)) return 0;

  var base = rules.rent[n - 1];
  var bonus = 0;
  if (hasHouse && req > 0 && nPropsUncapped >= req) bonus = MC.HOUSE_RENT_BONUS;
  return base + bonus;
};

MC.rules.rentAmountForSet = function (state, p, setI) {
  var sets = state.players[p].sets;
  if (setI < 0 || setI >= sets.length) return 0;
  var set = sets[setI];
  if (!set || !set.props || set.props.length <= 0) return 0;

  var color = MC.rules.getSetColor(set.props);
  return MC.rules.rentAmountForColorCount(color, set.props.length, !!set.houseUid);
};

MC.rules.replaceWindowEligibleWildLocs = function (state, p, srcSetI, excludeUid) {
  // Replace-window is offered only when we can remove exactly 1 Wild from
  // the just-played-into set while keeping that source set complete.
  if (!(p === 0 || p === 1)) return [];
  var sets = state.players[p] ? state.players[p].sets : null;
  if (!sets || srcSetI < 0 || srcSetI >= sets.length) return [];
  var set = sets[srcSetI];
  if (!set || !set.props || set.props.length <= 0) return [];

  var srcColor = MC.rules.getSetColor(set.props);
  if (srcColor === MC.state.NO_COLOR) return [];
  var req = MC.SET_RULES[srcColor].requiredSize;
  if (!(req > 0)) return [];

  // Need to still be complete after removing exactly 1 property.
  if ((set.props.length - 1) < req) return [];

  var out = [];
  var props = set.props;
  var i;
  for (i = 0; i < props.length; i++) {
    var tup = props[i];
    if (!tup) continue;
    var uid = tup[0];
    if (uid === excludeUid) continue;
    var def = MC.state.defByUid(state, uid);
    if (!MC.rules.isWildDef(def)) continue;
    out.push({ uid: uid, loc: { p: p, zone: "setProps", setI: srcSetI, i: i } });
  }
  return out;
};

MC.rules.replaceWindowDestinations = function (state, p, srcSetI, placedColor) {
  // Destinations: other matching-color sets (in setI order) plus newSet (last).
  if (!(p === 0 || p === 1)) return [{ p: p, newSet: true }];
  var sets = state.players[p] ? state.players[p].sets : null;
  if (!sets) return [{ p: p, newSet: true }];
  var out = [];
  var si;
  for (si = 0; si < sets.length; si++) {
    if (si === srcSetI) continue;
    var set = sets[si];
    var col = MC.rules.getSetColor(set ? set.props : null);
    if (col === MC.state.NO_COLOR) continue;
    if (col !== placedColor) continue;
    out.push({ p: p, setI: si });
  }
  out.push({ p: p, newSet: true });
  return out;
};

MC.rules.replaceWindowValidateMove = function (state, prompt, cmdMove, actorP) {
  if (!cmdMove || cmdMove.kind !== "moveWild") return { ok: false, err: "bad_cmd" };
  var card = cmdMove.card;
  var dest = cmdMove.dest;
  if (!card || !card.loc || !dest) return { ok: false, err: "bad_cmd" };
  if (card.loc.p !== actorP) return { ok: false, err: "not_your_card" };
  if (String(card.loc.zone || "") !== "setProps") return { ok: false, err: "bad_loc" };

  var srcSetI = prompt.srcSetI;
  if (card.loc.setI !== srcSetI) return { ok: false, err: "bad_src_set" };
  var uid = card.uid;
  if (uid === prompt.excludeUid) return { ok: false, err: "replace_exclude" };

  var sets = state.players[actorP] ? state.players[actorP].sets : null;
  if (!sets || srcSetI < 0 || srcSetI >= sets.length) return { ok: false, err: "bad_set" };
  var srcSet = sets[srcSetI];
  if (!srcSet || !srcSet.props) return { ok: false, err: "bad_set" };

  var pi = card.loc.i;
  if (!srcSet.props[pi] || srcSet.props[pi][0] !== uid) return { ok: false, err: "bad_loc" };

  var def = MC.state.defByUid(state, uid);
  if (!MC.rules.isWildDef(def)) return { ok: false, err: "not_wild" };

  var placedColor = cmdMove.color;
  if (!MC.rules.wildAllowsColor(def, placedColor)) return { ok: false, err: "wild_color_illegal" };

  // Source must remain complete after removing exactly 1 property.
  var srcColor = MC.rules.getSetColor(srcSet.props);
  if (srcColor === MC.state.NO_COLOR) return { ok: false, err: "empty_set" };
  var req = MC.SET_RULES[srcColor].requiredSize;
  if (!((srcSet.props.length - 1) >= req)) return { ok: false, err: "replace_src_incomplete" };

  // Destination: other set (matching color) or new set.
  var destSetI = -1;
  var isNewSet = !!dest.newSet;
  if (isNewSet) {
    destSetI = sets.length;
  } else {
    destSetI = dest.setI;
    if (destSetI === srcSetI) return { ok: false, err: "replace_same_set" };
    if (destSetI < 0 || destSetI >= sets.length) return { ok: false, err: "bad_set" };
    var setExisting = sets[destSetI];
    var setColor = MC.rules.getSetColor(setExisting ? setExisting.props : null);
    if (setColor === MC.state.NO_COLOR) return { ok: false, err: "empty_set" };
    if (setColor !== placedColor) return { ok: false, err: "set_color_mismatch" };
  }

  return {
    ok: true,
    uid: uid,
    srcSetI: srcSetI,
    srcI: pi,
    destSetI: destSetI,
    isNewSet: isNewSet,
    placedColor: placedColor
  };
};

MC.engine.removeHandAtLoc = function (state, card) {
  var loc = card.loc;
  var p = loc.p;
  var i = loc.i;
  var uid = card.uid;
  var hand = state.players[p].hand;
  if (hand[i] !== uid) throw new Error("bad_loc");
  hand.splice(i, 1);
};

MC.engine.applyCommand = function (state, cmd) {
  MC.engine.assertCanApply(state);
  if (!cmd || !cmd.kind) throw new Error("bad_cmd");

  var events = [];
  var prompt = state.prompt;
  var p = prompt ? prompt.p : state.activeP;
  var handP = state.players[p].hand;

  function decPlays() {
    state.playsLeft -= 1;
    events.push({ kind: "plays", p: p, playsLeft: state.playsLeft });
  }

  function applyEndTurn() {
    state.activeP = MC.rules.otherPlayer(state.activeP);
    events.push({ kind: "turn", activeP: state.activeP });
    MC.state.startTurn(state, events);
  }

  function applyDiscard(cmdDiscard) {
    var card = cmdDiscard.card;
    if (!card || !card.loc) throw new Error("bad_cmd");
    if (!MC.engine.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if (card.loc.p !== p) throw new Error("not_your_card");

    var uid = card.uid;
    MC.engine.removeHandAtLoc(state, card);
    state.discard.push(uid);

    events.push({
      kind: "move",
      uid: uid,
      from: card.loc,
      to: { zone: "discard", i: state.discard.length - 1 }
    });

    if (state.prompt && state.prompt.kind === "discardDown") {
      state.prompt.nDiscarded += 1;
    }

    // End-turn discard-down prompt: once <= HAND_MAX, finish ending the turn.
    if (handP.length <= MC.state.HAND_MAX) {
      MC.state.clearPrompt(state);
      applyEndTurn();
    }
  }

  function cleanupEmptySetsForPlayer(pp) {
    var sets = state.players[pp].sets;
    var i;
    for (i = sets.length - 1; i >= 0; i--) {
      var set = sets[i];
      var nProps = set.props.length;
      var hasHouse = !!set.houseUid;
      if (nProps === 0 && !hasHouse) sets.splice(i, 1);
    }
  }

  function tryBeginReplaceWindow(actorP, srcSetI, excludeUid, resume) {
    // After placing a property into a set, optionally allow moving one Wild
    // out of that same set (excluding the just-played card), but only if the source
    // set remains complete after removal.
    if (state.winnerP !== MC.state.NO_WINNER) return false;
    var elig = MC.rules.replaceWindowEligibleWildLocs(state, actorP, srcSetI, excludeUid);
    if (!elig || elig.length === 0) return false;
    MC.state.setPrompt(state, {
      kind: "replaceWindow",
      p: actorP,
      srcSetI: srcSetI,
      excludeUid: excludeUid,
      resume: resume || null
    });
    return true;
  }

  function applySlySteal(fromP, target) {
    if (!(fromP === 0 || fromP === 1)) throw new Error("bad_fromP");
    if (!target || !target.loc) throw new Error("bad_target");
    var loc = target.loc;
    if (!MC.engine.locEqZone(loc, "setProps")) throw new Error("bad_loc");

    var defP = loc.p;
    var setI = loc.setI;
    var pi = loc.i;
    if (!(defP === 0 || defP === 1)) throw new Error("bad_loc");
    var setsD = state.players[defP].sets;
    if (!setsD || setI < 0 || setI >= setsD.length) throw new Error("bad_set");
    var setD = setsD[setI];
    if (!setD || !setD.props) throw new Error("bad_set");

    var props = setD.props;
    if (!props[pi] || props[pi][0] !== target.uid) throw new Error("bad_loc");

    // Sly rule: cannot steal from a complete set (including overfilled).
    var color = MC.rules.getSetColor(props);
    if (color === MC.state.NO_COLOR) throw new Error("empty_set");
    var req = MC.SET_RULES[color].requiredSize;
    if (props.length >= req) throw new Error("sly_full_set");

    // Remove from defender set.
    props.splice(pi, 1);
    cleanupEmptySetsForPlayer(defP);

    // Attacker receives the property and must place it.
    MC.state.setPrompt(state, { kind: "placeReceived", p: fromP, uids: [target.uid] });
    events.push({
      kind: "move",
      uid: target.uid,
      selectedByP: fromP,
      from: { p: defP, zone: "setProps", setI: setI, i: pi },
      to: { p: fromP, zone: "recvProps", i: 0 }
    });
    // Direction: stolen from defender -> attacker.
    events.push({ kind: "slySteal", fromP: defP, toP: fromP, uid: target.uid });
  }

  // Prompt gating: only allow prompt-appropriate commands.
  if (prompt) {
    if (prompt.kind === "discardDown") {
      if (cmd.kind === "discard") {
        applyDiscard(cmd);
        return { events: events };
      }
      if (cmd.kind === "cancelPrompt") {
        if (prompt.nDiscarded > 0) throw new Error("prompt_forced");
        MC.state.clearPrompt(state);
        return { events: events };
      }
      throw new Error("prompt_active");
    }

    function payValueForUid(uid) {
      var def = MC.state.defByUid(state, uid);
      if (def.kind === MC.CardKind.Property) return def.propertyPayValue != null ? def.propertyPayValue : 0;
      return def.bankValue != null ? def.bankValue : 0;
    }

    function applyPayDebt(cmdPay) {
      var card = cmdPay.card;
      if (!card || !card.loc) throw new Error("bad_cmd");
      var loc = card.loc;
      if (loc.p !== p) throw new Error("not_your_card");

      var uid = card.uid;
      var buf = prompt.buf;

      if (loc.zone === "bank") {
        var bi = loc.i;
        var bank = state.players[p].bank;
        if (!bank || bank[bi] !== uid) throw new Error("bad_loc");
        bank.splice(bi, 1);
      } else if (loc.zone === "setHouse") {
        var hsI = loc.setI;
        var setsH = state.players[p].sets;
        if (hsI < 0 || hsI >= setsH.length) throw new Error("bad_set");
        var setH = setsH[hsI];
        if (!setH || setH.houseUid !== uid) throw new Error("bad_loc");
        setH.houseUid = 0;
      } else if (loc.zone === "setProps") {
        var psI = loc.setI;
        var pi = loc.i;
        var setsP = state.players[p].sets;
        if (psI < 0 || psI >= setsP.length) throw new Error("bad_set");
        var setP = setsP[psI];
        if (!setP || !setP.props) throw new Error("bad_loc");
        if (setP.houseUid) throw new Error("house_pay_first");
        if (!setP.props[pi] || setP.props[pi][0] !== uid) throw new Error("bad_loc");
        setP.props.splice(pi, 1);
      } else {
        throw new Error("bad_loc");
      }

      var bufI = buf.length;
      events.push({
        kind: "move",
        uid: uid,
        selectedByP: p,
        from: card.loc,
        to: { p: p, zone: "promptBuf", i: bufI }
      });
      buf.push(uid);
      prompt.rem = prompt.rem - payValueForUid(uid);

      events.push({ kind: "payDebt", p: p, uid: uid, rem: prompt.rem, toP: prompt.toP });

      cleanupEmptySetsForPlayer(p);

      // Auto-finalize when covered or out of payables.
      if (prompt.rem > 0 && MC.state.hasAnyPayables(state, p)) return;

      var toP = prompt.toP;
      var recv = [];
      var i;
      for (i = 0; i < buf.length; i++) {
        var uidT = buf[i];
        var defT = MC.state.defByUid(state, uidT);
        if (defT && defT.kind === MC.CardKind.Property) {
          var ri = recv.length;
          recv.push(uidT);
          events.push({
            kind: "move",
            uid: uidT,
            from: { p: p, zone: "promptBuf", i: i },
            to: { p: toP, zone: "recvProps", i: ri }
          });
        } else {
          state.players[toP].bank.push(uidT);
          events.push({
            kind: "move",
            uid: uidT,
            from: { p: p, zone: "promptBuf", i: i },
            to: { p: toP, zone: "bank", i: state.players[toP].bank.length - 1 }
          });
        }
      }

      if (recv.length > 0) {
        MC.state.setPrompt(state, { kind: "placeReceived", p: toP, uids: recv });
      } else {
        MC.state.clearPrompt(state);
      }
    }

    function applyPlayJustSayNo(cmdJsn) {
      var card = cmdJsn.card;
      if (!card || !card.loc) throw new Error("bad_cmd");
      if (!MC.engine.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
      if (card.loc.p !== p) throw new Error("not_your_card");

      var uid = card.uid;
      var def = MC.state.defByUid(state, uid);
      if (!def || def.kind !== MC.CardKind.Action || def.actionKind !== MC.ActionKind.JustSayNo) throw new Error("not_jsn");

      MC.engine.removeHandAtLoc(state, card);
      state.discard.push(uid);
      events.push({
        kind: "move",
        uid: uid,
        from: card.loc,
        to: { zone: "discard", i: state.discard.length - 1 }
      });

      // Cancel the active prompt and report the response (single-layer only).
      var src = prompt && prompt.srcAction ? prompt.srcAction : null;
      MC.state.clearPrompt(state);
      events.push({ kind: "jsn", p: p, srcAction: src });
    }

    function applyRespondPass() {
      if (!prompt || prompt.kind !== "respondAction") throw new Error("prompt_active");
      if (!prompt.srcAction) throw new Error("bad_srcAction");
      if (String(prompt.srcAction.kind || "") !== "slyDeal") throw new Error("bad_srcAction");
      var fromP = prompt.srcAction.fromP;
      var target = prompt.target;
      MC.state.clearPrompt(state);
      applySlySteal(fromP, target);
    }

    function applyPlaceReceived(cmdProp) {
      var card = cmdProp.card;
      var dest = cmdProp.dest;
      if (!card || !card.loc || !dest) throw new Error("bad_cmd");
      if (card.loc.p !== p) throw new Error("not_your_card");
      if (!MC.engine.locEqZone(card.loc, "recvProps")) throw new Error("bad_loc");

      var ri = card.loc.i;
      var uids = prompt.uids;
      var uid = card.uid;
      if (!uids[ri] || uids[ri] !== uid) throw new Error("bad_loc");

      var def = MC.state.defByUid(state, uid);
      if (!def || def.kind !== MC.CardKind.Property) throw new Error("not_property");

      var placedColor = MC.state.NO_COLOR;
      if (MC.rules.isWildDef(def)) {
        placedColor = cmdProp.color;
        if (!MC.rules.wildAllowsColor(def, placedColor)) throw new Error("wild_color_illegal");
      } else {
        placedColor = def.propertyColor;
      }

      // Remove from received buffer.
      uids.splice(ri, 1);

      var sets = state.players[p].sets;
      var setI;
      if (dest.newSet) {
        var newSet = MC.state.newEmptySet();
        setI = sets.length;
        sets.push(newSet);
        events.push({ kind: "createSet", p: p, setI: setI, color: placedColor });
      } else {
        setI = dest.setI;
        if (setI < 0 || setI >= sets.length) throw new Error("bad_set");
        var setExisting = sets[setI];
        var setColor = MC.rules.getSetColor(setExisting.props);
        if (setColor === MC.state.NO_COLOR) throw new Error("empty_set");
        if (setColor !== placedColor) throw new Error("set_color_mismatch");
      }

      var setT = sets[setI];
      setT.props.push([uid, placedColor]);

      events.push({
        kind: "move",
        uid: uid,
        from: card.loc,
        to: { p: p, zone: "setProps", setI: setI, i: setT.props.length - 1 }
      });

      var winner = MC.rules.evaluateWin(state);
      if (winner !== MC.state.NO_WINNER) {
        state.winnerP = winner;
        events.push({ kind: "win", winnerP: winner });
        // Winner: skip replace-window and let UI suppress prompts.
        if (prompt.uids.length === 0) MC.state.clearPrompt(state);
        return;
      }

      // Offer replace-window after each received placement (then resume).
      var resume = (prompt.uids.length > 0) ? { kind: "placeReceived", uids: prompt.uids.slice() } : null;
      var started = tryBeginReplaceWindow(p, setI, uid, resume);
      if (started) return;

      if (prompt.uids.length === 0) MC.state.clearPrompt(state);
    }

    if (prompt.kind === "payDebt") {
      if (cmd.kind === "payDebt") { applyPayDebt(cmd); return { events: events }; }
      if (cmd.kind === "playJustSayNo") {
        if (!prompt.srcAction) throw new Error("no_response_window");
        if (prompt.buf && prompt.buf.length > 0) throw new Error("response_too_late");
        applyPlayJustSayNo(cmd);
        return { events: events };
      }
      throw new Error("prompt_active");
    }
    if (prompt.kind === "respondAction") {
      if (cmd.kind === "respondPass") { applyRespondPass(); return { events: events }; }
      if (cmd.kind === "playJustSayNo") { applyPlayJustSayNo(cmd); return { events: events }; }
      throw new Error("prompt_active");
    }
    if (prompt.kind === "placeReceived") {
      if (cmd.kind === "playProp") { applyPlaceReceived(cmd); return { events: events }; }
      throw new Error("prompt_active");
    }
    if (prompt.kind === "replaceWindow") {
      function resumeOrClearReplaceWindow() {
        if (prompt.resume && String(prompt.resume.kind || "") === "placeReceived") {
          MC.state.setPrompt(state, { kind: "placeReceived", p: p, uids: prompt.resume.uids.slice() });
        } else {
          MC.state.clearPrompt(state);
        }
      }

      function applySkipReplaceWindow() {
        resumeOrClearReplaceWindow();
        events.push({ kind: "replaceSkip", p: p });
      }

      function applyMoveWild(cmdMove) {
        var v = MC.rules.replaceWindowValidateMove(state, prompt, cmdMove, p);
        if (!v.ok) throw new Error(v.err);

        var uid = v.uid;
        var srcSetI = v.srcSetI;
        var pi = v.srcI;
        var destSetI = v.destSetI;
        var isNewSet = v.isNewSet;
        var placedColor = v.placedColor;

        var sets = state.players[p].sets;
        var srcSet = sets[srcSetI];

        // Apply the move (mutating state) now that validation has passed.
        srcSet.props.splice(pi, 1);
        if (isNewSet) {
          var newSet = MC.state.newEmptySet();
          sets.push(newSet);
          events.push({ kind: "createSet", p: p, setI: destSetI, color: placedColor });
        }

        var destSet = sets[destSetI];
        destSet.props.push([uid, placedColor]);
        events.push({
          kind: "moveWild",
          p: p,
          uid: uid,
          from: { p: p, zone: "setProps", setI: srcSetI, i: pi },
          to: { p: p, zone: "setProps", setI: destSetI, i: destSet.props.length - 1 },
          color: placedColor
        });

        var winner = MC.rules.evaluateWin(state);
        if (winner !== MC.state.NO_WINNER) {
          state.winnerP = winner;
          events.push({ kind: "win", winnerP: winner });
          MC.state.clearPrompt(state);
          return;
        }

        resumeOrClearReplaceWindow();
      }

      if (cmd.kind === "skipReplaceWindow") { applySkipReplaceWindow(); return { events: events }; }
      if (cmd.kind === "moveWild") { applyMoveWild(cmd); return { events: events }; }
      throw new Error("prompt_active");
    }
    throw new Error("prompt_active");
  }

  function applyBank(cmdBank) {
    var card = cmdBank.card;
    if (!card || !card.loc) throw new Error("bad_cmd");
    if (!MC.engine.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if (card.loc.p !== p) throw new Error("not_your_card");

    var uid = card.uid;
    var def = MC.state.defByUid(state, uid);
    if (!MC.rules.isBankableDef(def)) throw new Error("not_bankable");

    MC.engine.removeHandAtLoc(state, card);
    state.players[p].bank.push(uid);

    events.push({
      kind: "move",
      uid: uid,
      from: card.loc,
      to: { p: p, zone: "bank", i: state.players[p].bank.length - 1 }
    });
    decPlays();
  }

  function applyPlayProp(cmdProp) {
    var card = cmdProp.card;
    var dest = cmdProp.dest;
    if (!card || !card.loc || !dest) throw new Error("bad_cmd");
    if (!MC.engine.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if (card.loc.p !== p) throw new Error("not_your_card");

    var uid = card.uid;
    var def = MC.state.defByUid(state, uid);
    if (!def || def.kind !== MC.CardKind.Property) throw new Error("not_property");

    var placedColor = MC.state.NO_COLOR;
    if (MC.rules.isWildDef(def)) {
      placedColor = cmdProp.color;
      if (!MC.rules.wildAllowsColor(def, placedColor)) throw new Error("wild_color_illegal");
    } else {
      placedColor = def.propertyColor;
    }

    var sets = state.players[p].sets;
    var setI;
    if (dest.newSet) {
      var newSet = MC.state.newEmptySet();
      setI = sets.length;
      sets.push(newSet);
      events.push({ kind: "createSet", p: p, setI: setI, color: placedColor });
    } else {
      setI = dest.setI;
      if (setI < 0 || setI >= sets.length) throw new Error("bad_set");
      var setExisting = sets[setI];
      var setColor = MC.rules.getSetColor(setExisting.props);
      if (setColor === MC.state.NO_COLOR) throw new Error("empty_set");
      if (setColor !== placedColor) throw new Error("set_color_mismatch");
    }

    MC.engine.removeHandAtLoc(state, card);
    var setT = sets[setI];
    setT.props.push([uid, placedColor]);

    events.push({
      kind: "move",
      uid: uid,
      from: card.loc,
      to: { p: p, zone: "setProps", setI: setI, i: setT.props.length - 1 }
    });
    decPlays();

    var winner = MC.rules.evaluateWin(state);
    if (winner !== MC.state.NO_WINNER) {
      state.winnerP = winner;
      events.push({ kind: "win", winnerP: winner });
      return;
    }

    // Offer replace-window after each property play into a set.
    tryBeginReplaceWindow(p, setI, uid, null);
  }

  function applyPlayHouse(cmdHouse) {
    var card = cmdHouse.card;
    var dest = cmdHouse.dest;
    if (!card || !card.loc || !dest) throw new Error("bad_cmd");
    if (!MC.engine.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if (card.loc.p !== p) throw new Error("not_your_card");

    var uid = card.uid;
    var def = MC.state.defByUid(state, uid);
    if (!def || def.kind !== MC.CardKind.House) throw new Error("not_house");

    var sets = state.players[p].sets;
    var setI = dest.setI;
    if (setI < 0 || setI >= sets.length) throw new Error("bad_set");
    var set = sets[setI];
    if (set.houseUid !== 0) throw new Error("house_already");

    var color = MC.rules.getSetColor(set.props);
    if (color === MC.state.NO_COLOR) throw new Error("empty_set");
    var req = MC.SET_RULES[color].requiredSize;
    if (set.props.length < req) throw new Error("set_not_complete");

    MC.engine.removeHandAtLoc(state, card);
    set.houseUid = uid;

    events.push({
      kind: "move",
      uid: uid,
      from: card.loc,
      to: { p: p, zone: "setHouse", setI: setI }
    });
    decPlays();
  }

  function applyPlayRent(cmdRent) {
    var card = cmdRent.card;
    if (!card || !card.loc) throw new Error("bad_cmd");
    if (!MC.engine.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if (card.loc.p !== p) throw new Error("not_your_card");

    var uid = card.uid;
    var def = MC.state.defByUid(state, uid);
    if (!def || def.kind !== MC.CardKind.Action || def.actionKind !== MC.ActionKind.Rent) throw new Error("not_rent");

    var setI = cmdRent.setI;
    var sets = state.players[p].sets;
    if (!sets || setI < 0 || setI >= sets.length) throw new Error("bad_set");
    var set = sets[setI];
    if (!set || !set.props || set.props.length <= 0) throw new Error("empty_set");

    var color = MC.rules.getSetColor(set.props);
    if (color === MC.state.NO_COLOR) throw new Error("empty_set");

    var allowed = def.rentAllowedColors;
    if (allowed && allowed.length) {
      var ok = false;
      var ai;
      for (ai = 0; ai < allowed.length; ai++) if (allowed[ai] === color) ok = true;
      if (!ok) throw new Error("rent_color_illegal");
    }

    var amount = MC.rules.rentAmountForSet(state, p, setI);
    if (amount <= 0) throw new Error("rent_zero");

    // Discard the rent card.
    MC.engine.removeHandAtLoc(state, card);
    state.discard.push(uid);
    events.push({
      kind: "move",
      uid: uid,
      from: card.loc,
      to: { zone: "discard", i: state.discard.length - 1 }
    });
    decPlays();

    // Trigger debt prompt for the opponent (if they have payables).
    var payer = MC.rules.otherPlayer(p);
    MC.state.beginDebt(state, payer, p, amount, { kind: "rent", fromP: p, actionUid: uid });
    events.push({ kind: "rent", p: p, setI: setI, color: color, amount: amount });
  }

  function applyPlaySlyDeal(cmdSly) {
    var card = cmdSly.card;
    var target = cmdSly.target;
    if (!card || !card.loc || !target || !target.loc) throw new Error("bad_cmd");
    if (!MC.engine.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if (card.loc.p !== p) throw new Error("not_your_card");

    var uid = card.uid;
    var def = MC.state.defByUid(state, uid);
    if (!def || def.kind !== MC.CardKind.Action || def.actionKind !== MC.ActionKind.SlyDeal) throw new Error("not_sly");

    // Validate target is opponent property.
    var otherP = MC.rules.otherPlayer(p);
    var tLoc = target.loc;
    if (!MC.engine.locEqZone(tLoc, "setProps")) throw new Error("bad_loc");
    if (tLoc.p !== otherP) throw new Error("bad_target");

    // Validate not from full set.
    var setsO = state.players[otherP].sets;
    if (!setsO || tLoc.setI < 0 || tLoc.setI >= setsO.length) throw new Error("bad_set");
    var setO = setsO[tLoc.setI];
    if (!setO || !setO.props) throw new Error("bad_set");
    var color = MC.rules.getSetColor(setO.props);
    if (color === MC.state.NO_COLOR) throw new Error("empty_set");
    var req = MC.SET_RULES[color].requiredSize;
    if (setO.props.length >= req) throw new Error("sly_full_set");
    if (!setO.props[tLoc.i] || setO.props[tLoc.i][0] !== target.uid) throw new Error("bad_loc");

    // Discard the action card.
    MC.engine.removeHandAtLoc(state, card);
    state.discard.push(uid);
    events.push({
      kind: "move",
      uid: uid,
      from: card.loc,
      to: { zone: "discard", i: state.discard.length - 1 }
    });
    decPlays();

    // If defender has JSN, open a response prompt; otherwise resolve immediately.
    var hasJsn = MC.rules.handHasActionKind(state, otherP, MC.ActionKind.JustSayNo);

    if (hasJsn) {
      MC.state.setPrompt(state, {
        kind: "respondAction",
        p: otherP,
        srcAction: { kind: "slyDeal", fromP: p, actionUid: uid },
        target: { uid: target.uid, loc: { p: tLoc.p, zone: tLoc.zone, setI: tLoc.setI, i: tLoc.i } }
      });
      events.push({ kind: "respondOffered", p: otherP, srcAction: { kind: "slyDeal", fromP: p, actionUid: uid } });
      return;
    }

    events.push({ kind: "respondSkipped", p: otherP, reason: "no_jsn", srcAction: { kind: "slyDeal", fromP: p, actionUid: uid } });
    applySlySteal(p, { uid: target.uid, loc: tLoc });
  }

  if (cmd.kind === "endTurn") {
    if (handP.length > MC.state.HAND_MAX) {
      MC.state.setPrompt(state, { kind: "discardDown", p: p });
      if (state.prompt) state.prompt.nDiscarded = 0;
      return { events: events };
    }
    applyEndTurn();
    return { events: events };
  }

  if (state.playsLeft <= 0) throw new Error("no_plays_left");

  if (cmd.kind === "bank") applyBank(cmd);
  else if (cmd.kind === "playProp") applyPlayProp(cmd);
  else if (cmd.kind === "playHouse") applyPlayHouse(cmd);
  else if (cmd.kind === "playRent") applyPlayRent(cmd);
  else if (cmd.kind === "playSlyDeal") applyPlaySlyDeal(cmd);
  else throw new Error("unknown_cmd:" + cmd.kind);

  return { events: events };
};

MC.engine._pushPlayPropMoves = function (outMoves, state, p, uid, loc, sets) {
  var def = MC.state.defByUid(state, uid);
  if (!def || def.kind !== MC.CardKind.Property) return;
  var cardRef = { uid: uid, loc: loc };

  if (MC.rules.isWildDef(def)) {
    // New set for each allowed color.
    outMoves.push({ kind: "playProp", card: cardRef, dest: { p: p, newSet: true }, color: def.wildColors[0] });
    outMoves.push({ kind: "playProp", card: cardRef, dest: { p: p, newSet: true }, color: def.wildColors[1] });
    // Existing sets that match allowed colors.
    var si;
    for (si = 0; si < sets.length; si++) {
      var set = sets[si];
      var setColor = MC.rules.getSetColor(set.props);
      if (setColor === MC.state.NO_COLOR) continue;
      if (MC.rules.wildAllowsColor(def, setColor)) {
        outMoves.push({ kind: "playProp", card: cardRef, dest: { p: p, setI: si }, color: setColor });
      }
    }
    return;
  }

  var c = def.propertyColor;
  outMoves.push({ kind: "playProp", card: cardRef, dest: { p: p, newSet: true } });
  var sj;
  for (sj = 0; sj < sets.length; sj++) {
    var setJ = sets[sj];
    var setColorJ = MC.rules.getSetColor(setJ.props);
    if (setColorJ === MC.state.NO_COLOR) continue;
    if (setColorJ === c) {
      outMoves.push({ kind: "playProp", card: cardRef, dest: { p: p, setI: sj } });
    }
  }
};

MC.engine.legalMoves = function (state) {
  if (state.winnerP !== MC.state.NO_WINNER) return [];
  if (state.prompt) {
    var pr = state.prompt;
    if (pr.kind === "discardDown") {
      var pp = pr.p;
      if (state.activeP !== pp) return [];
      var movesP = [];
      var nDiscarded = pr.nDiscarded;
      if (nDiscarded <= 0) movesP.push({ kind: "cancelPrompt" });
      var handP = state.players[pp].hand;
      var iP;
      for (iP = 0; iP < handP.length; iP++) {
        var uidP = handP[iP];
        movesP.push({ kind: "discard", card: { uid: uidP, loc: { p: pp, zone: "hand", i: iP } } });
      }
      return movesP;
    }
    if (pr.kind === "payDebt") {
      var pPay = pr.p;
      var out = [];
      var bank = state.players[pPay].bank;
      var i;
      for (i = 0; i < bank.length; i++) {
        out.push({ kind: "payDebt", card: { uid: bank[i], loc: { p: pPay, zone: "bank", i: i } } });
      }
      var sets = state.players[pPay].sets;
      var si;
      for (si = 0; si < sets.length; si++) {
        var set = sets[si];
        if (set.houseUid) out.push({ kind: "payDebt", card: { uid: set.houseUid, loc: { p: pPay, zone: "setHouse", setI: si } } });
        if (set.houseUid) continue;
        var props = set.props;
        var pi;
        for (pi = 0; pi < props.length; pi++) {
          out.push({ kind: "payDebt", card: { uid: props[pi][0], loc: { p: pPay, zone: "setProps", setI: si, i: pi } } });
        }
      }
      if (pr.srcAction && pr.buf && pr.buf.length === 0) {
        // Allow JSN response before any payment.
        var handJ = state.players[pPay].hand;
        var hj;
        for (hj = 0; hj < handJ.length; hj++) {
          var uidJ = handJ[hj];
          var defJ = MC.state.defByUid(state, uidJ);
          if (defJ && defJ.kind === MC.CardKind.Action && defJ.actionKind === MC.ActionKind.JustSayNo) {
            out.push({ kind: "playJustSayNo", card: { uid: uidJ, loc: { p: pPay, zone: "hand", i: hj } } });
          }
        }
      }
      return out;
    }
    if (pr.kind === "respondAction") {
      var pR = pr.p;
      var outR = [{ kind: "respondPass" }];
      var handR = state.players[pR].hand;
      var hr;
      for (hr = 0; hr < handR.length; hr++) {
        var uidR = handR[hr];
        var defR = MC.state.defByUid(state, uidR);
        if (defR && defR.kind === MC.CardKind.Action && defR.actionKind === MC.ActionKind.JustSayNo) {
          outR.push({ kind: "playJustSayNo", card: { uid: uidR, loc: { p: pR, zone: "hand", i: hr } } });
        }
      }
      return outR;
    }
    if (pr.kind === "placeReceived") {
      var pR = pr.p;
      var uids = pr.uids;
      var setsR = state.players[pR].sets;
      var outR = [];

      var iR;
      for (iR = 0; iR < uids.length; iR++) {
        var uidR = uids[iR];
        MC.engine._pushPlayPropMoves(outR, state, pR, uidR, { p: pR, zone: "recvProps", i: iR }, setsR);
      }
      return outR;
    }
    if (pr.kind === "replaceWindow") {
      var pW = pr.p;
      var outW = [{ kind: "skipReplaceWindow" }];
      var srcSetI = pr.srcSetI;
      var excludeUid = pr.excludeUid;
      var elig = MC.rules.replaceWindowEligibleWildLocs(state, pW, srcSetI, excludeUid);
      var iW;
      for (iW = 0; iW < elig.length; iW++) {
        var e = elig[iW];
        if (!e || !e.loc) continue;
        var uidW = e.uid;
        var defW = MC.state.defByUid(state, uidW);
        if (!MC.rules.isWildDef(defW)) continue;

        var c0 = defW.wildColors[0];
        var c1 = defW.wildColors[1];
        var cardRef = { uid: uidW, loc: e.loc };

        function pushMovesForColor(col) {
          var dests = MC.rules.replaceWindowDestinations(state, pW, srcSetI, col);
          var di;
          for (di = 0; di < dests.length; di++) {
            outW.push({ kind: "moveWild", card: cardRef, dest: dests[di], color: col });
          }
        }

        pushMovesForColor(c0);
        pushMovesForColor(c1);
      }
      return outW;
    }
    return [];
  }

  var moves = [];
  var p = state.activeP;
  var hand = state.players[p].hand;

  // End turn is always available; if hand > HAND_MAX it enters a discard-down prompt.
  moves.push({ kind: "endTurn" });

  if (state.playsLeft <= 0) return moves;

  var sets = state.players[p].sets;

  var i;
  for (i = 0; i < hand.length; i++) {
    var uid = hand[i];
    var def = MC.state.defByUid(state, uid);
    var cardRef = { uid: uid, loc: { p: p, zone: "hand", i: i } };

    if (MC.rules.isBankableDef(def)) {
      moves.push({ kind: "bank", card: cardRef });
    }

    if (def.kind === MC.CardKind.Property) {
      MC.engine._pushPlayPropMoves(moves, state, p, uid, cardRef.loc, sets);
    } else if (def.kind === MC.CardKind.House) {
      var sh;
      for (sh = 0; sh < sets.length; sh++) {
        var setH = sets[sh];
        if (setH.houseUid !== 0) continue;
        var col = MC.rules.getSetColor(setH.props);
        if (col === MC.state.NO_COLOR) continue;
        var req = MC.SET_RULES[col].requiredSize;
        if (setH.props.length >= req) {
          moves.push({ kind: "playHouse", card: cardRef, dest: { p: p, setI: sh } });
        }
      }
    } else if (def.kind === MC.CardKind.Action && def.actionKind === MC.ActionKind.Rent) {
      // Rent: one move per eligible set.
      var allowed = def.rentAllowedColors;
      var siR;
      for (siR = 0; siR < sets.length; siR++) {
        var setR = sets[siR];
        if (!setR || !setR.props || setR.props.length <= 0) continue;
        var colR = MC.rules.getSetColor(setR.props);
        if (colR === MC.state.NO_COLOR) continue;
        if (allowed && allowed.length) {
          var ok = false;
          var ai;
          for (ai = 0; ai < allowed.length; ai++) if (allowed[ai] === colR) ok = true;
          if (!ok) continue;
        }
        var amt = MC.rules.rentAmountForSet(state, p, siR);
        if (amt <= 0) continue;
        moves.push({ kind: "playRent", card: cardRef, setI: siR });
      }
    } else if (def.kind === MC.CardKind.Action && def.actionKind === MC.ActionKind.SlyDeal) {
      // Sly Deal: one move per eligible opponent property (not from complete set).
      var op = MC.rules.otherPlayer(p);
      var setsOp = state.players[op].sets;
      var siS;
      for (siS = 0; siS < setsOp.length; siS++) {
        var setS = setsOp[siS];
        if (!setS || !setS.props || setS.props.length <= 0) continue;
        var colS = MC.rules.getSetColor(setS.props);
        if (colS === MC.state.NO_COLOR) continue;
        var reqS = MC.SET_RULES[colS].requiredSize;
        if (setS.props.length >= reqS) continue;
        var piS;
        for (piS = 0; piS < setS.props.length; piS++) {
          moves.push({
            kind: "playSlyDeal",
            card: cardRef,
            target: { uid: setS.props[piS][0], loc: { p: op, zone: "setProps", setI: siS, i: piS } }
          });
        }
      }
    }
  }

  return moves;
};

// ---- src/50_scenarios.js ----
// MC.scenarios: deterministic starting-state builders for testing + debug smoke runs.
MC.scenarios.resetForScenario = function (state) {
  state.deck = [];
  state.discard = [];
  state.players[0].hand = [];
  state.players[0].bank = [];
  state.players[0].sets = [];
  state.players[1].hand = [];
  state.players[1].bank = [];
  state.players[1].sets = [];
  state.activeP = 0;
  state.playsLeft = 3;
  MC.state.clearPrompt(state);
  state.winnerP = MC.state.NO_WINNER;
  // Ensure pool exists.
  MC.state.cardPoolInit(state);
};

MC.scenarios.setAddFixedProp = function (set, uid, color) {
  set.props.push([uid, color]);
};

MC.scenarios.setAddPropByDefId = function (state, set, defId, forcedColor) {
  var uid = MC.state.takeUid(state, defId);
  var def = MC.state.defByUid(state, uid);
  var color = MC.state.NO_COLOR;
  if (MC.rules.isWildDef(def)) {
    color = forcedColor;
    if (!MC.rules.wildAllowsColor(def, color)) throw new Error("scenario_bad_color:" + defId);
  } else {
    color = def.propertyColor;
  }
  MC.scenarios.setAddFixedProp(set, uid, color);
  return uid;
};

MC.scenarios.fillDeckFromPool = function (state) {
  var deck = [];
  var i;
  for (i = 0; i < MC.CARD_DEFS.length; i++) {
    var defId = MC.CARD_DEFS[i].id;
    var a = state._pool[defId];
    if (!a || a.length === 0) continue;
    var k;
    for (k = 0; k < a.length; k++) deck.push(a[k]);
    state._pool[defId] = [];
  }
  state.deck = deck;
};

MC.scenarios.applyScenario = function (state, scenarioId) {
  MC.scenarios.resetForScenario(state);

  var fn = MC.scenarios._applyById[scenarioId];
  if (!fn) throw new Error("unknown_scenario:" + scenarioId);
  fn(state);

  MC.scenarios.fillDeckFromPool(state);
  // Scenario deck policy: shuffle the remaining deck with the scenario seed so scenarios
  // feel like "real" games while still being reproducible per seed.
  // (Hands/sets/discard are scenario-curated; only the remaining deck is randomized.)
  MC.shuffle.inPlaceWithStateRng(state, state.deck);
  return state;
};

// Scenario registry (single source of truth).
MC.scenarios.IDS = [
  // Replace-window + placement basics
  "replaceWindow",
  "placeBasic",
  "wildBasic",
  "houseBasic",
  "winCheck",
  "bankScrollShuffle",
  // Prompt-driven debt + recipient placement
  "debtHouseFirst",
  "placeReceived",
  // Move generation smoke / AI policy stress
  "moveStress",
  // Actions + responses
  "slyJSN",
  // Anim edge cases
  "payDebtShuffleDeal"
];

// Optional metadata for debug UI / docs.
MC.scenarios.INFO = {
  replaceWindow: { title: "Replace-window", desc: "Play into an overfill-complete set so the replace-window prompt is offered (move a Wild out of the just-played-into set)." },
  placeBasic: { title: "Place (basic)", desc: "Fixed property placement + Rent play-test (opponent has a small bank payable)." },
  wildBasic: { title: "Wild (basic)", desc: "Wild property placement + discard depth demo." },
  houseBasic: { title: "House (basic)", desc: "Build House on complete set only." },
  winCheck: { title: "Win check", desc: "Already-winning board state (game over)." },
  bankScrollShuffle: { title: "Bank+shuffle stress", desc: "Huge bank + reshuffle-on-draw stress case." },
  debtHouseFirst: { title: "Debt: house-first", desc: "Debt prompt where House must be paid before set properties (includes a JSN in hand to test action-sourced payDebt response gating)." },
  placeReceived: { title: "Place received", desc: "Faux-turn placement buffer (includes Wild color choice)." },
  moveStress: { title: "Move stress", desc: "Many partial sets + 9-card hand (props + wilds + rent-any + house) to maximize legalMoves fanout for smoke testing + AI policy tuning." },
  slyJSN: { title: "Sly+JSN+SlySingle", desc: "RespondAction prompt for Sly Deal (Allow vs Just Say No). Also includes a single-target Sly situation in parallel." },
  payDebtShuffleDeal: { title: "PayDebt shuffle deal", desc: "Repro helper: start in a rent-sourced payDebt prompt with empty hand + bank payment, then opponent is forced to endTurn and your next startTurn triggers deck reshuffle + staged deal animation." },
};

MC.scenarios._applyById = {
  replaceWindow: function (state) {
    // Source set (Orange, complete=3) includes a Wild not being played this turn.
    // Playing one more Orange into this set makes it overfilled (4), enabling replace-window:
    // moving exactly 1 Wild out still leaves the source set complete (3).
    var setSrc = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setSrc, "prop_orange", MC.state.NO_COLOR);
    MC.scenarios.setAddPropByDefId(state, setSrc, "prop_orange", MC.state.NO_COLOR);
    MC.scenarios.setAddPropByDefId(state, setSrc, "wild_mo", MC.Color.Orange);
    state.players[0].sets.push(setSrc);

    // Destination set (Magenta, 2/3) so moving the Wild as Magenta can complete it.
    var setM = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setM, "prop_magenta", MC.state.NO_COLOR);
    MC.scenarios.setAddPropByDefId(state, setM, "prop_magenta", MC.state.NO_COLOR);
    state.players[0].sets.push(setM);

    // Hand: play Orange into the source set to trigger replace-window.
    state.players[0].hand.push(MC.state.takeUid(state, "prop_orange"));
    state.players[0].hand.push(MC.state.takeUid(state, "money_1"));
  },

  placeBasic: function (state) {
    // P0 has 2 orange properties + $1. P0 also has an existing Orange set with 1 property.
    var setO = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setO, "prop_orange", MC.state.NO_COLOR);
    state.players[0].sets.push(setO);

    state.players[0].hand.push(MC.state.takeUid(state, "prop_orange"));
    state.players[0].hand.push(MC.state.takeUid(state, "prop_orange"));
    state.players[0].hand.push(MC.state.takeUid(state, "money_1"));
    // Add a rent card that matches Orange (Magenta/Orange rent).
    state.players[0].hand.push(MC.state.takeUid(state, "rent_mo"));

    // Ensure opponent has something payable so Rent triggers payDebt.
    state.players[1].bank.push(MC.state.takeUid(state, "money_1"));
  },

  wildBasic: function (state) {
    // P0 has Wild(M/O) and $1.
    state.players[0].hand.push(MC.state.takeUid(state, "wild_mo"));
    state.players[0].hand.push(MC.state.takeUid(state, "money_1"));

    // Discard demo (depth=3): top card is last.
    state.discard.push(MC.state.takeUid(state, "money_2"));
    state.discard.push(MC.state.takeUid(state, "money_1"));
    state.discard.push(MC.state.takeUid(state, "rent_cb"));
  },

  houseBasic: function (state) {
    // P0 has two Houses in hand.
    state.players[0].hand.push(MC.state.takeUid(state, "house"));
    state.players[0].hand.push(MC.state.takeUid(state, "house"));

    // One complete Cyan set (2).
    var setC = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setC, "prop_cyan", MC.state.NO_COLOR);
    MC.scenarios.setAddPropByDefId(state, setC, "prop_cyan", MC.state.NO_COLOR);
    state.players[0].sets.push(setC);

    // One incomplete Black set (3/4).
    var setB = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setB, "prop_black", MC.state.NO_COLOR);
    MC.scenarios.setAddPropByDefId(state, setB, "prop_black", MC.state.NO_COLOR);
    MC.scenarios.setAddPropByDefId(state, setB, "prop_black", MC.state.NO_COLOR);
    state.players[0].sets.push(setB);

    // Discard demo (depth=1).
    state.discard.push(MC.state.takeUid(state, "money_5"));
  },

  winCheck: function (state) {
    // P0 has 3 complete sets: Cyan(2), Magenta(3), Orange(3).
    var setC2 = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setC2, "prop_cyan", MC.state.NO_COLOR);
    MC.scenarios.setAddPropByDefId(state, setC2, "prop_cyan", MC.state.NO_COLOR);
    state.players[0].sets.push(setC2);

    var setM3 = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setM3, "prop_magenta", MC.state.NO_COLOR);
    MC.scenarios.setAddPropByDefId(state, setM3, "prop_magenta", MC.state.NO_COLOR);
    MC.scenarios.setAddPropByDefId(state, setM3, "prop_magenta", MC.state.NO_COLOR);
    state.players[0].sets.push(setM3);

    var setO3 = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setO3, "prop_orange", MC.state.NO_COLOR);
    MC.scenarios.setAddPropByDefId(state, setO3, "prop_orange", MC.state.NO_COLOR);
    MC.scenarios.setAddPropByDefId(state, setO3, "prop_orange", MC.state.NO_COLOR);
    state.players[0].sets.push(setO3);

    state.playsLeft = 0;
    state.winnerP = MC.rules.evaluateWin(state);
  },

  bankScrollShuffle: function (state) {
    // Dev scenario:
    // - P0 bank contains *all* bankable cards (money/action/house) to stress bank stack/scrolling.
    // - Most remaining cards are in discard (to stress reshuffle).
    // - Leave exactly 1 card in deck so the next draw forces a reshuffle.
    // - Ensure P1 hand is non-empty so endTurn draws 2 (not 5).

    // Seed P1 hand with 1 property so startTurn draws 2.
    state.players[1].hand.push(MC.state.takeUid(state, "prop_cyan"));

    // Drain pool: bankables -> P0 bank; non-bankables -> discard.
    var di;
    for (di = 0; di < MC.CARD_DEFS.length; di++) {
      var def = MC.CARD_DEFS[di];
      if (!def || !def.id) continue;
      var defId = def.id;
      var a = state._pool[defId];
      if (!a || a.length === 0) continue;

      // NOTE: scenario pool contains only uids, so we inspect the def kind here.
      var bankable = MC.rules.isBankableDef(def);
      while (a.length > 0) {
        var uid = a.pop();
        if (bankable) state.players[0].bank.push(uid);
        else state.discard.push(uid);
      }
    }

    // Put back one card into the pool so it becomes the (1-card) deck.
    // Prefer taking from discard so the discard->deck reshuffle still has plenty of cards.
    if (state.discard.length > 0) {
      var keepUid = state.discard.pop();
      var keepDef = MC.state.defByUid(state, keepUid);
      var keepId = String(keepDef.id);
      state._pool[keepId].push(keepUid);
    }

    // Keep hand small and end-turn legal.
    state.players[0].hand = [];
    state.activeP = 0;
    state.playsLeft = 0;
    state.winnerP = MC.state.NO_WINNER;
  },

  // Goal: exercise prompt actor separation + house-first redirect + overpay allowed.
  debtHouseFirst: function (state) {
    // P0: complete Cyan set with a House.
    var setC = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setC, "prop_cyan", MC.state.NO_COLOR);
    MC.scenarios.setAddPropByDefId(state, setC, "prop_cyan", MC.state.NO_COLOR);
    setC.houseUid = MC.state.takeUid(state, "house");
    state.players[0].sets.push(setC);

    // Keep bank empty so the only payable is the House (forces the rule).
    state.players[0].bank = [];

    // Add a little hand so the UI isn't empty.
    state.players[0].hand.push(MC.state.takeUid(state, "rent_cb"));
    state.players[0].hand.push(MC.state.takeUid(state, "just_say_no"));

    // Pay a small debt to P1; paying the House overpays and resolves immediately.
    var rentUid = MC.state.takeUid(state, "rent_any");
    state.discard.push(rentUid);
    MC.state.setPrompt(state, { kind: "payDebt", p: 0, toP: 1, rem: 1, buf: [], srcAction: { kind: "rent", fromP: 1, actionUid: rentUid } });
  },

  placeReceived: function (state) {
    // P0 has an existing Orange set to allow placing into existing sets.
    var setO = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setO, "prop_orange", MC.state.NO_COLOR);
    state.players[0].sets.push(setO);

    // Prompt buffer: one fixed property + one Wild to place (wild assignment chosen during placement).
    var recv = [];
    recv.push(MC.state.takeUid(state, "prop_orange"));
    recv.push(MC.state.takeUid(state, "wild_mo"));
    MC.state.setPrompt(state, { kind: "placeReceived", p: 0, uids: recv });

    // Keep normal hand visible for the “faux-hand + real hand” row layout.
    state.players[0].hand.push(MC.state.takeUid(state, "money_1"));
    state.players[0].hand.push(MC.state.takeUid(state, "rent_mo"));
  },

  moveStress: function (state) {
    // Board: P0 has many partial sets so properties/wilds have multiple existing destinations.
    // Hand: 9 cards including wilds + rent-any + house, so move list gets large.
    //
    // Note: hand > HAND_MAX is intentional; endTurn will enter discardDown prompt.

    // 1 complete Cyan set (2) so House has at least one legal build target.
    var setC = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setC, "prop_cyan", MC.state.NO_COLOR);
    MC.scenarios.setAddPropByDefId(state, setC, "prop_cyan", MC.state.NO_COLOR);
    state.players[0].sets.push(setC);

    // Opponent has at least one stealable property so Sly Deal has targets.
    // Prefer an Orange-ish pair (incomplete set) so Sly targeting can cycle more than one option.
    // (Orange set requires 3, so 2 cards stays stealable.)
    var setOp = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setOp, "wild_mo", MC.Color.Orange);
    MC.scenarios.setAddPropByDefId(state, setOp, "prop_orange", MC.state.NO_COLOR);
    state.players[1].sets.push(setOp);

    // 2 Magenta sets (each 1 prop) so Magenta + wild_mo can target multiple existing sets.
    var setM0 = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setM0, "prop_magenta", MC.state.NO_COLOR);
    state.players[0].sets.push(setM0);
    var setM1 = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setM1, "prop_magenta", MC.state.NO_COLOR);
    state.players[0].sets.push(setM1);

    // 2 Orange sets (each 1 prop) so Orange + wild_mo can target multiple existing sets.
    var setO0 = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setO0, "prop_orange", MC.state.NO_COLOR);
    state.players[0].sets.push(setO0);
    var setO1 = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setO1, "prop_orange", MC.state.NO_COLOR);
    state.players[0].sets.push(setO1);

    // 3 Black sets (each 1 prop) so Black + wild_cb can target multiple existing sets.
    var setB0 = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setB0, "prop_black", MC.state.NO_COLOR);
    state.players[0].sets.push(setB0);
    var setB1 = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setB1, "prop_black", MC.state.NO_COLOR);
    state.players[0].sets.push(setB1);
    var setB2 = MC.state.newEmptySet();
    MC.scenarios.setAddPropByDefId(state, setB2, "prop_black", MC.state.NO_COLOR);
    state.players[0].sets.push(setB2);

    // Hand: one of each base property (remaining), one wild, plus rent-any + house + $1 + one action.
    state.players[0].hand.push(MC.state.takeUid(state, "prop_magenta"));
    // Keep Orange out of hand here so we can use it for opponent Sly targets above.
    state.players[0].hand.push(MC.state.takeUid(state, "money_2"));
    state.players[0].hand.push(MC.state.takeUid(state, "prop_black"));
    state.players[0].hand.push(MC.state.takeUid(state, "wild_cb"));

    state.players[0].hand.push(MC.state.takeUid(state, "house"));
    state.players[0].hand.push(MC.state.takeUid(state, "rent_any"));
    state.players[0].hand.push(MC.state.takeUid(state, "money_1"));
    state.players[0].hand.push(MC.state.takeUid(state, "sly_deal"));
  },

  slyJSN: function (state) {
    // P0 has a stealable (incomplete) set with a single property.
    var setO = MC.state.newEmptySet();
    var uidT = MC.state.takeUid(state, "prop_orange");
    MC.scenarios.setAddFixedProp(setO, uidT, MC.Color.Orange);
    state.players[0].sets.push(setO);

    // P0 has JSN in hand to respond with.
    state.players[0].hand.push(MC.state.takeUid(state, "just_say_no"));
    state.players[0].hand.push(MC.state.takeUid(state, "money_1"));

    // Opponent played Sly Deal; the action card is already discarded.
    var slyUid = MC.state.takeUid(state, "sly_deal");
    state.discard.push(slyUid);

    // Also include a single-target Sly situation in parallel (for debugging menu behavior after the prompt):
    // P0 has a Sly Deal in hand, and P1 has exactly one eligible property on the table.
    state.players[0].hand.push(MC.state.takeUid(state, "sly_deal"));
    var setM = MC.state.newEmptySet();
    var uidM = MC.state.takeUid(state, "prop_magenta");
    MC.scenarios.setAddFixedProp(setM, uidM, MC.Color.Magenta);
    state.players[1].sets.push(setM);

    MC.state.setPrompt(state, {
      kind: "respondAction",
      p: 0,
      srcAction: { kind: "slyDeal", fromP: 1, actionUid: slyUid },
      target: { uid: uidT, loc: { p: 0, zone: "setProps", setI: 0, i: 0 } }
    });

    state.activeP = 1;
    state.playsLeft = 3;
  },

  payDebtShuffleDeal: function (state) {
    // Start in a payDebt prompt (rent-sourced). After payment, opponent has playsLeft=0
    // so the AI will immediately endTurn; the next startTurn draws with reshuffle+deal.
    state.activeP = 1;
    state.playsLeft = 0;

    // P0 has an empty hand and a single payable bank card to cover the debt.
    var payUid = MC.state.takeUid(state, "money_1");
    state.players[0].bank.push(payUid);

    // Put enough cards into discard so startTurn draw(5) must reshuffle from discard.
    // Include a rent card uid so srcAction can reference a real uid in discard.
    var rentUid = MC.state.takeUid(state, "rent_mo");
    state.discard.push(rentUid);
    state.discard.push(MC.state.takeUid(state, "money_2"));
    state.discard.push(MC.state.takeUid(state, "money_3"));
    state.discard.push(MC.state.takeUid(state, "prop_orange"));
    state.discard.push(MC.state.takeUid(state, "prop_magenta"));
    state.discard.push(MC.state.takeUid(state, "wild_mo"));

    // Open the debt prompt for P0 (payer). activeP remains the opponent (rent actor),
    // matching real gameplay: the prompt actor is prompt.p.
    MC.state.setPrompt(state, {
      kind: "payDebt",
      p: 0,
      toP: 1,
      rem: 1,
      buf: [],
      srcAction: { kind: "rent", fromP: 1, actionUid: rentUid }
    });

    // Ensure no additional pool cards get moved into deck by the scenario framework.
    // (We want deck empty so reshuffle is guaranteed.)
    var defId;
    for (defId in state._pool) state._pool[defId] = [];
  }
};

// ---- src/52_moves.js ----
// MC.moves: shared move helpers (rules + UI). Pure-ish: reads state/move lists, no view mutations.

// Helpers for Place command lists (shared by targeting + menu label tweaks).
MC.moves.defaultWildColorForPlace = function (state, uid, def) {
  if (!def || !MC.rules.isWildDef(def)) return MC.state.NO_COLOR;
  var moves = MC.engine.legalMoves(state);
  var c0 = def.wildColors[0];
  var c1 = def.wildColors[1];
  var has0 = false, has1 = false;
  var i;
  for (i = 0; i < moves.length; i++) {
    var mp = moves[i];
    if (!mp || mp.kind !== "playProp") continue;
    if (!mp.card || mp.card.uid !== uid) continue;
    if (mp.color === c0 && mp.dest && mp.dest.setI != null) has0 = true;
    if (mp.color === c1 && mp.dest && mp.dest.setI != null) has1 = true;
  }
  return has0 ? c0 : (has1 ? c1 : c0);
};

MC.moves.placeCmdsForUid = function (state, uid, def, wildColor) {
  var moves = MC.engine.legalMoves(state);
  var cmds = [];
  var i;
  var isWild = !!(def && MC.rules.isWildDef(def));
  for (i = 0; i < moves.length; i++) {
    var mf = moves[i];
    if (!mf || mf.kind !== "playProp") continue;
    if (!mf.card || mf.card.uid !== uid) continue;
    if (isWild && mf.color !== wildColor) continue;
    cmds.push(mf);
  }

  // Ordering: existing sets first (by setI), then newSet.
  var existing = [];
  var newSet = [];
  for (i = 0; i < cmds.length; i++) {
    var c = cmds[i];
    if (c && c.dest && c.dest.newSet) newSet.push(c);
    else existing.push(c);
  }
  existing.sort(function (a, b) {
    var ai = (a.dest && a.dest.setI != null) ? a.dest.setI : 9999;
    var bi = (b.dest && b.dest.setI != null) ? b.dest.setI : 9999;
    return ai - bi;
  });
  return existing.concat(newSet);
};

MC.moves.defaultWildColorForMoveWild = function (state, uid, def, loc) {
  if (!def || !MC.rules.isWildDef(def)) return MC.state.NO_COLOR;
  if (loc && String(loc.zone || "") === "setProps" && loc.p != null && loc.setI != null && loc.i != null) {
    var sets = state.players[loc.p] ? state.players[loc.p].sets : null;
    var set = sets ? sets[loc.setI] : null;
    var props = set ? set.props : null;
    if (props && props[loc.i] && props[loc.i][0] === uid) return props[loc.i][1];
  }
  // Fallback: same default heuristic as Place (favor a color with existing-set destinations).
  return MC.moves.defaultWildColorForPlace(state, uid, def);
};

MC.moves.moveWildCmdsForUid = function (state, uid, def, wildColor) {
  var moves = MC.engine.legalMoves(state);
  var cmds = [];
  var i;
  var isWild = !!(def && MC.rules.isWildDef(def));
  for (i = 0; i < moves.length; i++) {
    var mv = moves[i];
    if (!mv || mv.kind !== "moveWild") continue;
    if (!mv.card || mv.card.uid !== uid) continue;
    if (isWild && mv.color !== wildColor) continue;
    cmds.push(mv);
  }
  return cmds;
};

MC.moves.buildCmdsForUid = function (state, uid) {
  var moves = MC.engine.legalMoves(state);
  var buildMoves = [];
  var i;
  for (i = 0; i < moves.length; i++) {
    var mv = moves[i];
    if (mv && mv.kind === "playHouse" && mv.card && mv.card.uid === uid) buildMoves.push(mv);
  }
  return buildMoves;
};

MC.moves.rentMovesForUid = function (state, uid) {
  var moves = MC.engine.legalMoves(state);
  var rentMoves = [];
  var i;
  for (i = 0; i < moves.length; i++) {
    var mv = moves[i];
    if (mv && mv.kind === "playRent" && mv.card && mv.card.uid === uid) rentMoves.push(mv);
  }
  return rentMoves;
};

MC.moves.slyDealMovesForUid = function (state, uid) {
  var moves = MC.engine.legalMoves(state);
  var out = [];
  var i;
  for (i = 0; i < moves.length; i++) {
    var mv = moves[i];
    if (mv && mv.kind === "playSlyDeal" && mv.card && mv.card.uid === uid) out.push(mv);
  }
  return out;
};

MC.moves.sortRentMovesByAmount = function (state, p, rentMoves) {
  if (!rentMoves || rentMoves.length <= 1) return rentMoves;
  rentMoves.sort(function (a, b) {
    var ai = (a && a.setI != null) ? a.setI : -1;
    var bi = (b && b.setI != null) ? b.setI : -1;
    var aa = MC.rules.rentAmountForSet(state, p, ai);
    var bb = MC.rules.rentAmountForSet(state, p, bi);
    var d = bb - aa;
    if (d) return d;
    return ai - bi;
  });
  return rentMoves;
};

MC.moves.locAllowsSource = function (loc) {
  if (!loc || !loc.zone) return false;
  var z = String(loc.zone);
  return (z === "hand") || (z === "recvProps");
};

MC.moves.cmdsWithoutSource = function (cmds) {
  if (!cmds || cmds.length === 0) return [];
  var out = [];
  var i;
  for (i = 0; i < cmds.length; i++) {
    var c = cmds[i];
    if (!c || !c.kind) continue;
    if (c.kind === "source") continue;
    out.push(c);
  }
  return out;
};

// Build the list of cmds for a targeting mode.
// Returns { cmds, wildColor } or null (unknown kind).
MC.moves.cmdsForTargeting = function (state, kind, uid, loc) {
  kind = String(kind || "");
  var out = { cmds: [], wildColor: MC.state.NO_COLOR };

  // Cmd profiles: the single source of truth for targeting-mode cmd lists.
  var prof = MC.cmd.getProfile(kind);
  if (!prof) return null;

  var def = MC.state.defByUid(state, uid);
  var isWild = !!(def && MC.rules.isWildDef(def));
  if (isWild && prof.defaultWildColor) out.wildColor = prof.defaultWildColor(state, uid, def, loc);
  else out.wildColor = MC.state.NO_COLOR;

  if (prof.cmdsForUid) out.cmds = prof.cmdsForUid(state, uid, loc);
  else if (prof.cmdsForWildColor) out.cmds = prof.cmdsForWildColor(state, uid, def, out.wildColor, loc);
  else out.cmds = [];

  if (prof.includeSource && prof.includeSource(loc)) out.cmds.push({ kind: "source" });
  return out;
};

// Command semantics: interpret a cmd's destination in board-space terms.
// Returns one of:
// - {kind:"newSet", p}
// - {kind:"setEnd", p, setI}
// - {kind:"setTop", p, setI}
// - {kind:"bankEnd", p}
// - {kind:"source"}
// - null
MC.moves.destForCmd = function (cmd) {
  if (!cmd || !cmd.kind) return null;
  if (cmd.kind === "playProp") {
    if (cmd.dest && cmd.dest.newSet) return { kind: "newSet", p: cmd.dest.p };
    if (cmd.dest && cmd.dest.setI != null) return { kind: "setEnd", p: cmd.dest.p, setI: cmd.dest.setI };
    return null;
  }
  if (cmd.kind === "moveWild") {
    if (cmd.dest && cmd.dest.newSet) return { kind: "newSet", p: cmd.dest.p };
    if (cmd.dest && cmd.dest.setI != null) return { kind: "setEnd", p: cmd.dest.p, setI: cmd.dest.setI };
    return null;
  }
  if (cmd.kind === "playHouse") {
    if (cmd.dest && cmd.dest.setI != null) return { kind: "setEnd", p: cmd.dest.p, setI: cmd.dest.setI };
    return null;
  }
  if (cmd.kind === "bank") return { kind: "bankEnd", p: cmd.card && cmd.card.loc ? cmd.card.loc.p : 0 };
  if (cmd.kind === "playRent") return { kind: "setTop", p: cmd.card && cmd.card.loc ? cmd.card.loc.p : 0, setI: cmd.setI };
  if (cmd.kind === "source") return { kind: "source" };
  return null;
};

MC.moves.bankCmdsForUid = function (state, uid) {
  var moves = MC.engine.legalMoves(state);
  var cmds = [];
  var i;
  for (i = 0; i < moves.length; i++) {
    var mv = moves[i];
    if (!mv || mv.kind !== "bank") continue;
    if (!mv.card || mv.card.uid !== uid) continue;
    cmds.push(mv);
  }
  return cmds;
};

// ---- src/53_ai.js ----
// MC.ai: simple playtest AI (pick among legal moves using deterministic RNG + short narration).

MC.ai.policies = {
  uniform: {
    id: "uniform",
    weight: function () { return 1; }
  },

  biasExistingSet: {
    id: "biasExistingSet",
    weight: function (state, move) {
      // Soft bias: prefer placing properties into existing sets, but still allow anything.
      // Tuning knob lives in config.
      var k = MC.config.ai.biasExistingSetK;
      if (move && move.kind === "playProp" && move.dest && move.dest.setI != null) return k;
      return 1;
    }
  },

  biasPayDebtFromBank: {
    id: "biasPayDebtFromBank",
    weight: function (state, move) {
      // Prefer paying debts from bank to reduce surprise property transfers.
      // Tuning knob lives in config.
      var k = MC.config.ai.biasPayDebtFromBankK;
      if (!move || move.kind !== "payDebt") return 1;
      if (!(k > 1)) k = 1;
      var loc = (move.card && move.card.loc) ? move.card.loc : null;
      if (loc && loc.zone === "bank") return k;
      return 1;
    }
  },

  earlyTurnDiscipline: {
    id: "earlyTurnDiscipline",
    weight: function (state, move, moves) {
      // Simple “don’t play dumb early” heuristic.
      // Keep this broad but low-spike: prefer banking real money to reach a small buffer,
      // avoid wasting Rent when opponent can't pay, and avoid banking multiple valuable actions
      // when there are no other ways to spend plays (unless we're about to empty hand for draw-5).
      if (!state || !move) return 1;
      if (state.prompt) return 1;

      var p = MC.ai.actor(state);
      var op = MC.rules.otherPlayer(p);
      var hand = state.players[p].hand;
      var handLen = hand.length;
      var bankTotal = MC.util.bankValueTotal(state, p);
      var opPayable = MC.state.hasAnyPayables(state, op);

      var cfg = MC.config.ai;
      var bufferTarget = cfg.earlyBankBufferTarget;
      var keepActionsMaxHand = cfg.earlyEmptyHandKeepActionsMaxHand;

      var hasNonBankNonEnd = false;
      var hasBankMoneyHouse = false;
      var holdsRent = false;

      var i;
      for (i = 0; i < handLen; i++) {
        var uidH = hand[i];
        var defH = MC.state.defByUid(state, uidH);
        if (defH && defH.kind === MC.CardKind.Action && defH.actionKind === MC.ActionKind.Rent) holdsRent = true;
      }

      if (moves && moves.length) {
        for (i = 0; i < moves.length; i++) {
          var m = moves[i];
          if (!m || !m.kind) continue;
          var k = String(m.kind);
          if (k !== "bank" && k !== "endTurn") hasNonBankNonEnd = true;
          if (k === "bank" && m.card && m.card.uid) {
            var defB = MC.state.defByUid(state, m.card.uid);
            if (defB && (defB.kind === MC.CardKind.Money || defB.kind === MC.CardKind.House)) hasBankMoneyHouse = true;
          }
        }
      }

      var isBank = (move.kind === "bank");
      var isEnd = (move.kind === "endTurn");
      var isPlayProp = (move.kind === "playProp");
      var isPlayRent = (move.kind === "playRent");

      var def = null;
      var isBankMoneyHouse = false;
      var isBankAction = false;
      if (isBank && move.card && move.card.uid) {
        def = MC.state.defByUid(state, move.card.uid);
        isBankMoneyHouse = !!(def && (def.kind === MC.CardKind.Money || def.kind === MC.CardKind.House));
        isBankAction = !!(def && def.kind === MC.CardKind.Action);
      }

      // Cash buffer: prefer banking money/house until a small buffer is reached.
      if (isBankMoneyHouse && bankTotal < bufferTarget) return cfg.biasEarlyBankMoneyK;

      // Prefer playing Rent only when it will actually collect (opponent has payables).
      if (isPlayRent && opPayable) return cfg.biasEarlyPlayRentIfPayableK;

      // If we hold Rent, bias toward placing properties so Rent becomes meaningful.
      if (holdsRent && isPlayProp) return cfg.biasEarlyPlaceWhenHoldingRentK;

      // Tiny-move anti-dump: if the only spend-plays options are banking actions,
      // prefer EndTurn over banking multiple valuable actions (unless hand is tiny).
      var onlyBankActions = (!hasNonBankNonEnd) && (!hasBankMoneyHouse);
      if (onlyBankActions && handLen > keepActionsMaxHand) {
        if (isEnd) return cfg.biasEarlyEndTurnOverBankActionsK;
        if (isBankAction) return 1;
      }

      return 1;
    }
  },

  biasPlayRent: {
    id: "biasPlayRent",
    weight: function (state, move) {
      // Soft bias: prefer asking for rent rather than banking the Rent card.
      // Avoid wasting Rent when the opponent has nothing payable.
      // Tuning knob lives in config.
      var k = MC.config.ai.biasPlayRentK;
      if (!move || move.kind !== "playRent") return 1;
      if (!(k > 1)) k = 1;

      // Determine actor from cmd card loc when possible (works for prompt actor too).
      var loc = (move.card && move.card.loc) ? move.card.loc : null;
      var p = (loc && loc.p != null) ? loc.p : MC.ai.actor(state);
      var op = MC.rules.otherPlayer(p);
      if (!MC.state.hasAnyPayables(state, op)) return 1;
      return k;
    }
  },

  biasPlaySlyDeal: {
    id: "biasPlaySlyDeal",
    weight: function (state, move) {
      // Prefer stealing a property rather than banking Sly Deal when a target exists.
      // Tuning knob lives in config.
      var k = MC.config.ai.biasPlaySlyDealK;
      if (!move || move.kind !== "playSlyDeal") return 1;
      if (!(k > 1)) k = 1;
      return k;
    }
  },

  biasPlayJustSayNo: {
    id: "biasPlayJustSayNo",
    weight: function (state, move) {
      // Soft bias: prefer canceling negative actions when a response window exists.
      // Tuning knob lives in config.
      var k = MC.config.ai.biasPlayJustSayNoK;
      if (move && move.kind === "playJustSayNo") return k;
      return 1;
    }
  },

  biasMoveWild: {
    id: "biasMoveWild",
    weight: function (state, move) {
      // Simple heuristic for replace-window Wild repositioning.
      // Prefer moves that complete a set, then maximize rent delta on existing sets.
      // Tuning knob lives in config.
      var k = MC.config.ai.biasMoveWildK;
      if (!move || move.kind !== "moveWild") return 1;
      if (!(k > 1)) k = 1;

      var dest = move.dest;
      if (!dest) return 1;
      // New set: treat as neutral by default (can be strategically risky vs Sly Deal).
      if (dest.newSet) return 1;
      if (dest.setI == null) return 1;

      var card = move.card;
      var loc = card && card.loc ? card.loc : null;
      var p = (loc && loc.p != null) ? loc.p : state.activeP;
      var setI = dest.setI;
      var sets = state.players[p] ? state.players[p].sets : null;
      if (!sets || setI < 0 || setI >= sets.length) return 1;
      var set = sets[setI];
      if (!set || !set.props || set.props.length <= 0) return 1;

      var color = MC.rules.getSetColor(set.props);
      if (color === MC.state.NO_COLOR) return 1;
      var rules = MC.SET_RULES[color];
      if (!rules || !(rules.requiredSize > 0)) return 1;
      var req = rules.requiredSize;

      var nBefore = set.props.length;
      var nAfterUncapped = nBefore + 1;
      var completes = (nAfterUncapped >= req);

      // Compute rent before/after (rent caps at required size).
      var rentBefore = MC.rules.rentAmountForSet(state, p, setI);
      var rentAfter = MC.rules.rentAmountForColorCount(color, nAfterUncapped, !!set.houseUid);

      var delta = rentAfter - rentBefore;
      if (completes) return k * 20;
      if (delta > 0) return k * (1 + delta);
      return 1;
    }
  }
};

MC.ai.composePolicies = function (id, policyIds) {
  // Compose policies by multiplying their weights.
  // Contract: each component policy weight is a positive number (1 means neutral).
  var parts = [];
  var i;
  for (i = 0; i < policyIds.length; i++) {
    var pid = policyIds[i];
    var p = MC.ai.policies[pid];
    if (!p) throw new Error("ai_unknown_policy:" + String(pid));
    parts.push(p);
  }
  return {
    id: id,
    weight: function (state, move, moves) {
      var w = 1;
      var j;
      for (j = 0; j < parts.length; j++) w *= parts[j].weight(state, move, moves);
      return w;
    }
  };
};

MC.ai.policies.defaultHeuristic = MC.ai.composePolicies("defaultHeuristic", [
  "biasExistingSet",
  "biasPayDebtFromBank",
  "earlyTurnDiscipline",
  "biasPlayRent",
  "biasPlaySlyDeal",
  "biasPlayJustSayNo",
  "biasMoveWild"
]);

MC.ai.pickMove = function (state, moves, policy) {
  if (!moves || moves.length === 0) return null;

  // Fallback to uniform if policy is missing (should be caught by tests).
  var pol = policy || MC.ai.policies.uniform;

  var weights = [];
  var total = 0;
  var i;
  for (i = 0; i < moves.length; i++) {
    var w = pol.weight(state, moves[i], moves);
    if (!(w > 0)) w = 0;
    else w = Math.floor(w);
    weights[i] = w;
    total += w;
  }

  // Safety: if a policy produces all-zero weights, fall back to uniform.
  if (!(total > 0)) {
    var idxU = MC.rng.nextIntInState(state, moves.length);
    return moves[idxU];
  }

  var r = MC.rng.nextIntInState(state, total);
  var acc = 0;
  for (i = 0; i < moves.length; i++) {
    acc += weights[i];
    if (r < acc) return moves[i];
  }

  // Should be unreachable; keep deterministic behavior.
  return moves[moves.length - 1];
};

MC.ai.policyForP = function (p) {
  return MC.ai.policies[MC.config.ai.policyByP[p]];
};

MC.ai.actor = function (state) {
  var pr = state.prompt;
  if (pr && pr.p != null) return pr.p;
  return state.activeP;
};

MC.ai.pickRandomLegalMove = function (state) {
  var moves = MC.engine.legalMoves(state);
  if (!moves || moves.length === 0) return null;
  var p = MC.ai.actor(state);
  var policy = MC.ai.policyForP(p);
  return MC.ai.pickMove(state, moves, policy);
};

MC.ai.describeCmd = function (state, cmd) {
  if (!cmd || !cmd.kind) return "";
  var k = String(cmd.kind);
  if (k === "endTurn") return "AI: End turn";
  if (k === "bank") return "AI: Bank";
  if (k === "playRent") return "AI: Rent";
  if (k === "playSlyDeal") return "AI: Sly Deal";
  if (k === "respondPass") return "AI: Allow";
  if (k === "playJustSayNo") return "AI: Just Say No";
  if (k === "skipReplaceWindow") return "AI: Skip";
  if (k === "moveWild") return "AI: Move Wild";
  if (k === "playHouse") return "AI: Build";
  if (k === "playProp") {
    var dl = MC.fmt.destLabelForCmd(state, cmd);
    return dl ? ("AI: Place -> " + dl) : "AI: Place";
  }
  if (k === "payDebt") return "AI: Pay";
  if (k === "discard") return "AI: Discard";
  if (k === "cancelPrompt") return "AI: Cancel";
  return "AI: " + k;
};

// ---- src/54_cmd_profiles.js ----
// Cmd profiles: data-driven behavior by targeting kind, expressed in terms of cmd lists + UI hooks.
// This registry centralizes Source-cancel policy + overlay text + cursor/sort behavior.

MC.cmd.getProfile = function (kind) {
  kind = String(kind || "");
  return MC.cmdProfiles[kind] || null;
};

// Menu-capable cmd kinds (card menu items, ordered).
MC.cmd.menuKinds = ["place", "build", "rent", "sly", "bank"];

// Hold-A (grab) targeting: choose an ordered list of targeting kinds for a card.
// The chain builder filters out segments with no real (non-Source) cmds, so it's safe to
// include candidate kinds that may be illegal in the current state.
MC.cmd.holdChainKindsForDef = function (def) {
  if (!def || def.kind == null) return null;

  if (def.kind === MC.CardKind.Property) return ["place"];
  if (def.kind === MC.CardKind.Money) return ["bank"];
  if (def.kind === MC.CardKind.House) return ["build", "bank"];

  if (def.kind === MC.CardKind.Action) {
    if (def.actionKind === MC.ActionKind.SlyDeal) return ["sly", "bank"];
    if (def.actionKind === MC.ActionKind.Rent) return ["rent", "bank"];
    // Default for action cards that don't have a targeting mode (e.g. JSN): bank only.
    return ["bank"];
  }

  return null;
};

MC.cmd.titleForCmdKind = function (cmd) {
  if (!cmd || !cmd.kind) return "Target";
  var k = String(cmd.kind);
  if (k === "playRent") return "Rent";
  if (k === "playHouse") return "Build";
  if (k === "bank") return "Bank";
  if (k === "playProp") return "Place";
  if (k === "moveWild") return "Place";
  if (k === "playSlyDeal") return "Sly Deal";
  if (k === "source") return "Source";
  return "Target";
};

MC.cmd.destLineForCmd = function (state, targeting, cmd) {
  var t = targeting || null;
  if (!cmd || !cmd.kind) return "(no destination)";
  var k = String(cmd.kind);

  if (k === "playProp" || k === "moveWild") return MC.cmd.destLinePlaceLike(state, t, cmd);

  if (k === "playHouse") {
    var dH = MC.moves.destForCmd(cmd);
    if (!dH || dH.kind !== "setEnd") return "(no destination)";
    var setH = state.players[dH.p].sets[dH.setI];
    var colH = setH ? MC.rules.getSetColor(setH.props) : MC.state.NO_COLOR;
    return "Dest: " + MC.fmt.colorName(colH) + " set";
  }

  if (k === "playRent") {
    var p = cmd.card.loc.p;
    var setR = state.players[p].sets[cmd.setI];
    var colR = setR ? MC.rules.getSetColor(setR.props) : MC.state.NO_COLOR;
    var amt = MC.rules.rentAmountForSet(state, p, cmd.setI);
    return "From: " + MC.fmt.colorName(colR) + " set\nAmt: $" + amt;
  }

  if (k === "playSlyDeal") {
    var tl = (cmd.target && cmd.target.loc) ? cmd.target.loc : null;
    var colT = MC.state.NO_COLOR;
    if (tl && tl.zone === "setProps") {
      var setT = state.players[tl.p].sets[tl.setI];
      if (setT && setT.props) {
        var propT = setT.props[tl.i];
        if (propT) colT = propT[1];
      }
    }
    return "Target: " + MC.fmt.colorName(colT);
  }

  if (k === "bank") return "Dest: Bank";
  if (k === "source") return "Dest: Source";
  return "(no destination)";
};

MC.cmd.destLinePlaceLike = function (state, targeting, cmd) {
  var t = targeting || null;
  if (!cmd || !cmd.kind) return "(no destination)";
  if (cmd.kind === "source") return "Dest: Source";

  var d = MC.moves.destForCmd(cmd);
  var out = "";
  if (d) {
    if (d.kind === "newSet") out = "Dest: New set";
    else if (d.kind === "setEnd") {
      var set = state.players[d.p].sets[d.setI];
      var col = set ? MC.rules.getSetColor(set.props) : MC.state.NO_COLOR;
      out = "Dest: " + MC.fmt.colorName(col) + " set";
    }
  }

  if (t && t.card && t.card.def && MC.rules.isWildDef(t.card.def)) out += "\nAs: " + MC.fmt.colorName(t.wildColor);
  return out || "(no destination)";
};

MC.cmd.previewForCmd = function (state, cmd, card) {
  if (!cmd || !cmd.kind) return null;
  var k = String(cmd.kind);

  var uid = (card && card.uid) ? card.uid : 0;
  var def = (card && card.def) ? card.def : null;
  var wildColor = (card && card.wildColor != null) ? card.wildColor : MC.state.NO_COLOR;

  // Default: preview the source card itself.
  var out = { uid: uid, color: null, focusSrcGhost: false, forCmdKind: k };

  // Special-case: rent previews the top card of the selected set (not the rent action card).
  if (k === "playRent") {
    var pR = cmd.card.loc.p;
    var setR = state.players[pR].sets[cmd.setI];
    var topUid = setR && setR.houseUid ? setR.houseUid : ((setR.props && setR.props.length) ? setR.props[setR.props.length - 1][0] : 0);
    var topColor = null;
    if (setR && !setR.houseUid && setR.props && setR.props.length) topColor = setR.props[setR.props.length - 1][1];
    out.uid = topUid;
    out.color = topColor;
    out.focusSrcGhost = true;
    return out;
  }

  // Wild-color tinting.
  if (def && MC.rules.isWildDef(def)) {
    if (k === "source") out.color = wildColor;
    else if (cmd.color != null) out.color = cmd.color;
    else out.color = wildColor;
  }

  return out;
};

MC.cmd.buildHoldChain = function (state, uid, loc, kinds) {
  var out = { segs: [], wildColor: MC.state.NO_COLOR };
  var chainWildColor = MC.state.NO_COLOR;

  var iK;
  for (iK = 0; iK < kinds.length; iK++) {
    var kind = kinds[iK];
    var r = MC.moves.cmdsForTargeting(state, kind, uid, loc);
    if (chainWildColor === MC.state.NO_COLOR && r.wildColor != null && r.wildColor !== MC.state.NO_COLOR) chainWildColor = r.wildColor;
    var realCmds = MC.moves.cmdsWithoutSource(r.cmds);
    if (!realCmds || realCmds.length === 0) continue;
    out.segs.push({ kind: String(kind), cmds: realCmds, cmdI: 0 });
  }

  // Source/cancel segment (universal).
  if (out.segs.length > 0 && MC.moves.locAllowsSource(loc)) out.segs.push({ kind: "source", cmds: [{ kind: "source" }], cmdI: 0 });

  out.wildColor = chainWildColor;
  return out;
};

MC.cmdProfiles.place = {
  id: "place",
  title: "Place",
  helpLR: "L/R: Dest",
  menuLabel: function (state, cmds) { return MC.fmt.menuLabelForCmds("Place", state, cmds); },
  menuHoverPreview: true,
  includeSource: function (loc) {
    return MC.moves.locAllowsSource(loc);
  },
  defaultWildColor: function (state, uid, def) {
    return MC.moves.defaultWildColorForPlace(state, uid, def);
  },
  cmdsForWildColor: function (state, uid, def, wildColor) {
    return MC.moves.placeCmdsForUid(state, uid, def, wildColor);
  },
  destLine: MC.cmd.destLinePlaceLike,
  ui: { mode: "preview" }
};

MC.cmdProfiles.moveWild = {
  id: "moveWild",
  title: "Place",
  helpLR: "L/R: Dest",
  includeSource: function () {
    // Replace-window moveWild originates from setProps; still allow Source-cancel for consistency.
    return true;
  },
  defaultWildColor: function (state, uid, def, loc) {
    return MC.moves.defaultWildColorForMoveWild(state, uid, def, loc);
  },
  cmdsForWildColor: function (state, uid, def, wildColor) {
    return MC.moves.moveWildCmdsForUid(state, uid, def, wildColor);
  },
  sortRank: function (cmd) {
    if (cmd && cmd.kind === "source") return 2;
    if (cmd && cmd.dest && cmd.dest.newSet) return 1;
    return 0;
  },
  destLine: MC.cmd.destLinePlaceLike,
  ui: {
    mode: "preview",
    screenXForCmd: function (ctx, cmdW) {
      if (!cmdW || !cmdW.kind || cmdW.kind !== "moveWild") return 999999;
      if (cmdW.dest && cmdW.dest.newSet) return 999999;
      var setI = (cmdW.dest && cmdW.dest.setI != null) ? cmdW.dest.setI : null;
      if (setI == null) return 999999;
      var rmT = ctx.computed.models[MC.render.ROW_P_TABLE];
      var st = rmT.stacks["set:p0:set" + setI];
      if (!st) return 999999;
      var x = st.x0 + st.nReal * st.stride * st.fanDir;
      var cam = ctx.view.camX[MC.render.ROW_P_TABLE];
      return x - cam;
    },
    sortRank: function (cmd) {
      return MC.cmdProfiles.moveWild.sortRank(cmd);
    }
  }
};

MC.cmdProfiles.bank = {
  id: "bank",
  title: "Bank",
  helpLR: "L/R: Dest",
  menuLabel: function (state, cmds) { return MC.fmt.menuLabelForCmds("Bank", state, cmds); },
  menuHoverPreview: true,
  includeSource: function (loc) { return MC.moves.locAllowsSource(loc); },
  cmdsForUid: function (state, uid) { return MC.moves.bankCmdsForUid(state, uid); },
  destLine: MC.cmd.destLineForCmd,
  ui: { mode: "preview" }
};

MC.cmdProfiles.build = {
  id: "build",
  title: "Build",
  helpLR: "L/R: Dest",
  menuLabel: function (state, cmds) { return MC.fmt.menuLabelForCmds("Build", state, cmds); },
  menuHoverPreview: true,
  includeSource: function (loc) { return MC.moves.locAllowsSource(loc); },
  cmdsForUid: function (state, uid) { return MC.moves.buildCmdsForUid(state, uid); },
  destLine: MC.cmd.destLineForCmd,
  ui: { mode: "preview" }
};

MC.cmdProfiles.rent = {
  id: "rent",
  title: "Rent",
  helpLR: "L/R: Set",
  menuLabel: function (state, cmds) { return MC.fmt.menuLabelForRentMoves(state, cmds); },
  menuHoverPreview: true,
  includeSource: function (loc) { return MC.moves.locAllowsSource(loc); },
  cmdsForUid: function (state, uid, loc) {
    var cmds = MC.moves.rentMovesForUid(state, uid);
    MC.moves.sortRentMovesByAmount(state, loc ? loc.p : 0, cmds);
    return cmds;
  },
  destLine: MC.cmd.destLineForCmd,
  ui: { mode: "preview" }
};

MC.cmdProfiles.sly = {
  id: "sly",
  title: "Sly Deal",
  helpLR: "L/R: Target",
  menuLabel: function (state, cmds) { return MC.fmt.menuLabelForCmds("Sly Deal", state, cmds); },
  menuHoverPreview: true,
  includeSource: function (loc) { return MC.moves.locAllowsSource(loc); },
  cmdsForUid: function (state, uid, loc) {
    if (!loc || !loc.zone) return [];
    var z = String(loc.zone);
    if (z !== "hand") return [];
    return MC.moves.slyDealMovesForUid(state, uid);
  },
  destLine: MC.cmd.destLineForCmd,
  ui: {
    mode: "cursor",
    findItemForCmd: function (ctx, cmdSly) {
      if (!cmdSly || !cmdSly.kind) return null;
      var t = ctx.view.targeting;
      if (cmdSly.kind === "source") {
        if (!t || !t.card || !t.card.loc) return null;
        return MC.ui.findBestCursorTarget(ctx.computed.models, [MC.render.ROW_P_HAND], function (it) {
          return MC.ui.itemMatchesUidLoc(it, t.card.uid, t.card.loc);
        });
      }
      if (cmdSly.kind === "playSlyDeal" && cmdSly.target && cmdSly.target.loc) {
        var loc = cmdSly.target.loc;
        var uid = cmdSly.target.uid;
        return MC.ui.findBestCursorTarget(ctx.computed.models, [MC.render.ROW_OP_TABLE], function (it) {
          return MC.ui.itemMatchesUidLoc(it, uid, loc);
        });
      }
      return null;
    },
    screenXForCmd: function (ctx, cmdSly) {
      var pick = MC.cmdProfiles.sly.ui.findItemForCmd(ctx, cmdSly);
      if (!pick || !pick.item) return 999999;
      var row = pick.item.row;
      var cam = ctx.view.camX[row];
      return (pick.item.x - cam);
    },
    sortRank: function (cmd) { return (cmd && cmd.kind === "source") ? 1 : 0; },
    tieCmp: function (a, b) {
      var al = (a && a.target && a.target.loc) ? a.target.loc : null;
      var bl = (b && b.target && b.target.loc) ? b.target.loc : null;
      var asi = al && al.setI != null ? al.setI : 9999;
      var bsi = bl && bl.setI != null ? bl.setI : 9999;
      var di = asi - bsi;
      if (di) return di;
      var api = al && al.i != null ? al.i : 9999;
      var bpi = bl && bl.i != null ? bl.i : 9999;
      return api - bpi;
    }
  }
};

// ---- src/55_fmt.js ----
// MC.fmt: shared text formatting helpers (UI/debug narration).
MC.fmt.colorName = function (c) {
  if (c === MC.Color.Cyan) return "Cyan";
  if (c === MC.Color.Magenta) return "Magenta";
  if (c === MC.Color.Orange) return "Orange";
  if (c === MC.Color.Black) return "Black";
  return "c" + String(c);
};

MC.fmt.valueForDef = function (def) {
  if (!def) return null;
  if (def.kind === MC.CardKind.Property) {
    if (def.propertyPayValue != null) return def.propertyPayValue;
    return 0;
  }
  if (def.bankValue != null) return def.bankValue;
  return null;
};

MC.fmt.errorMessage = function (code) {
  code = String(code || "");
  if (code === "no_plays_left") return "No plays left";
  if (code === "hand_over_limit") return "Hand over limit";
  if (code === "not_bankable") return "Not bankable";
  if (code === "set_not_complete") return "Set not complete";
  if (code === "set_color_mismatch") return "Wrong set color";
  if (code === "wild_color_illegal") return "Wild color illegal";
  if (code === "no_targets") return "No valid destination";
  if (code === "house_pay_first") return "House must be paid first";
  if (code === "not_sly") return "Not a Sly Deal";
  if (code === "sly_full_set") return "Can't steal from a complete set";
  if (code === "not_jsn") return "Not Just Say No";
  if (code === "no_response_window") return "No response window";
  if (code === "response_too_late") return "Too late to respond";
  if (code === "bad_srcAction") return "Bad source action";
  return code || "error";
};

MC.fmt.appendRuleNotes = function (def, baseDesc) {
  baseDesc = baseDesc ? String(baseDesc) : "";
  if (!def || !def.ruleNotes || def.ruleNotes.length === 0) return baseDesc;
  var enabled = MC.config.rules.enabledRuleNotes;
  if (enabled.length === 0) return baseDesc;

  var out = baseDesc;
  var i;
  for (i = 0; i < def.ruleNotes.length; i++) {
    var id = def.ruleNotes[i];
    var j;
    var on = false;
    for (j = 0; j < enabled.length; j++) if (enabled[j] === id) { on = true; break; }
    if (!on) continue;
    var txt = MC.ruleNoteTextById[id] ? String(MC.ruleNoteTextById[id]) : "";
    if (!txt) continue;
    if (out) out += "\n";
    out += txt;
  }
  return out;
};

MC.fmt.inspectTitleForDef = function (def) {
  if (!def) return "";
  return def.name ? String(def.name) : (def.id ? String(def.id) : "");
};

MC.fmt.inspectDescForDef = function (def, selColor) {
  if (!def) return "";
  var base = def.desc ? String(def.desc) : "";
  base = MC.fmt.appendRuleNotes(def, base);
  var v = MC.fmt.valueForDef(def);
  var vLine = (v != null && v > 0) ? ("Value: $" + String(v)) : "";
  var usedAs = "";
  if (MC.rules.isWildDef(def)) {
    var cSel = selColor;
    if (cSel !== MC.state.NO_COLOR && def.wildColors && (cSel === def.wildColors[0] || cSel === def.wildColors[1])) {
      usedAs = "Currently used as: " + MC.fmt.colorName(cSel);
    }
  }

  var out = "";
  if (vLine) out = vLine;
  if (usedAs) out = out ? (out + "\n" + usedAs) : usedAs;
  if (base) out = out ? (out + "\n" + base) : base;
  return out;
};

MC.fmt.destLabelForCmd = function (state, cmd) {
  if (cmd && cmd.kind === "playSlyDeal" && cmd.target && cmd.target.loc) {
    var tl = cmd.target.loc;
    var colT = MC.state.NO_COLOR;
    if (tl && tl.zone === "setProps") {
      var setT = state.players[tl.p].sets[tl.setI];
      if (setT && setT.props) {
        var propT = setT.props[tl.i];
        if (propT) colT = propT[1];
      }
    }
    return (colT !== MC.state.NO_COLOR) ? MC.fmt.colorName(colT) : "";
  }
  var d = MC.moves.destForCmd(cmd);
  if (!d) return "";
  if (d.kind === "newSet") return "New Set";
  if (d.kind === "setEnd") return MC.fmt.setLabelForSetI(state, d.p, d.setI);
  return "";
};

MC.fmt.setLabelForSetI = function (state, p, setI) {
  var set = state.players[p].sets[setI];
  var col = set ? MC.rules.getSetColor(set.props) : MC.state.NO_COLOR;
  return MC.fmt.colorName(col) + " Set";
};

MC.fmt.menuLabelForCmds = function (baseLabel, state, cmds) {
  baseLabel = String(baseLabel || "");
  if (!baseLabel) baseLabel = "Action";
  if (!cmds || cmds.length === 0) return baseLabel;
  if (cmds.length !== 1) return baseLabel + "...";
  var dl = MC.fmt.destLabelForCmd(state, cmds[0]);
  return dl ? (baseLabel + " -> " + dl) : baseLabel;
};

MC.fmt.menuLabelForRentMoves = function (state, rentMoves) {
  if (!rentMoves || rentMoves.length === 0) return "";
  if (rentMoves.length !== 1) return "Rent...";
  var onlyR = rentMoves[0];
  var sl = MC.fmt.setLabelForSetI(state, 0, onlyR.setI);
  return sl ? ("Rent -> " + sl) : "Rent";
};

MC.fmt.targetingTitle = function (targeting, cmd) {
  var tKind = targeting && targeting.kind ? String(targeting.kind) : "";

  var prof = MC.cmd.getProfile(tKind);
  if (prof && prof.title) {
    if (typeof prof.title === "function") return String(prof.title(targeting || null, cmd || null));
    return String(prof.title);
  }

  return MC.cmd.titleForCmdKind(cmd);
};

MC.fmt.targetingDestLine = function (state, targeting, cmd) {
  var t = targeting || null;

  var tKind = t && t.kind ? String(t.kind) : "";
  var prof = MC.cmd.getProfile(tKind);
  if (prof && prof.destLine) return prof.destLine(state, t, cmd);
  return MC.cmd.destLineForCmd(state, t, cmd);
};

MC.fmt.targetingHelp = function (targeting) {
  var t = targeting || null;
  var kind = t && t.kind ? String(t.kind) : "";
  var prof = MC.cmd.getProfile(kind);
  var help = (prof && prof.helpLR) ? String(prof.helpLR) : "L/R: Dest";
  if (t && t.card && t.card.def && MC.rules.isWildDef(t.card.def)) help += "  U/D: Color";
  help += (t && t.hold) ? "\nRelease A: Drop  B:Cancel" : "\nA:Confirm  B:Cancel";
  return help;
};

// ---- src/56_layout.js ----
// MC.layout: shared layout/geometry helpers (UI + renderer). Pure; reads MC.config.

MC.layout.faceYForRow = function (row) {
  var L = MC.config.render.layout;
  if (row === 0) {
    // Opponent hand: bottom slice visible; cards extend upward off-screen.
    return L.rowY[0] + L.rowH[0] - L.faceH;
  }
  if (row === 1 || row === 3 || row === 4) {
    return L.rowY[row] + L.faceInsetY;
  }
  return L.rowY[row];
};

MC.layout.isOpponentRow = function (row) {
  return row === 0 || row === 1;
};

MC.layout.playerForRow = function (row) {
  if (row === 0 || row === 1) return 1;
  if (row === 3 || row === 4) return 0;
  return -1;
};

// ---- src/60_render.js ----
// MC.render: display-only renderer + TIC-80 draw-call boundary wrappers (no state mutation).
(function initRenderModule() {
  var R = MC.render;

  R.ROW_OP_HAND = 0;
  R.ROW_OP_TABLE = 1;
  R.ROW_CENTER = 2;
  R.ROW_P_TABLE = 3;
  R.ROW_P_HAND = 4;

  var renderCfg = MC.config.render;
  // Keep internal `cfg` for readability, but source-of-truth config is split
  // into `render.layout` and `render.style`.
  var layout = renderCfg.layout;
  var style = renderCfg.style;
  R.cfg = {};
  var k;
  for (k in layout) R.cfg[k] = layout[k];
  for (k in style) R.cfg[k] = style[k];
  R.spr = renderCfg.spr;
  R.moneyBgByValue = renderCfg.moneyBgByValue;
  R.center = null;
  R.center = (function () {
    var cfg = R.cfg;
    var row = R.ROW_CENTER;
    var y0 = cfg.rowY[row];
    var top = y0 + cfg.centerTopInsetY;
    var deckX = cfg.centerDeckX;
    var gapX = cfg.centerPileGapX;
    var prevX = cfg.centerPreviewX;
    var prevGapX = cfg.centerPreviewGapX;

    return {
      deck: { x: deckX, y: top },
      discard: { x: deckX + cfg.faceW + gapX, y: top },

      preview: { x: prevX, y: top },
      title: { x: prevX + cfg.faceW + prevGapX, y: top },
      desc: { x: prevX + cfg.faceW + prevGapX, y: top + cfg.centerDescDy }
    };
  })();

  // Property bar palette (placeholder; tweak later).
  R.propBarColByColor = [];
  var Pal = MC.Pal;
  R.propBarColByColor[MC.Color.Cyan] = Pal.Cyan;
  R.propBarColByColor[MC.Color.Magenta] = Pal.Purple;
  R.propBarColByColor[MC.Color.Orange] = Pal.Orange;
  R.propBarColByColor[MC.Color.Black] = Pal.DarkGrey;

  function rectSafe(x, y, w, h, c) {
    rect(x | 0, y | 0, w | 0, h | 0, c | 0);
  }

  function rectbSafe(x, y, w, h, c) {
    rectb(x | 0, y | 0, w | 0, h | 0, c | 0);
  }

  function sprSafe(id, x, y, colorkey, scale, flip, rotate, w, h) {
    spr(id | 0, x | 0, y | 0, colorkey, scale, flip, rotate, w, h);
  }

  function printSafe(s, x, y, c) {
    print(String(s), x | 0, y | 0, c | 0);
  }

  function printExSafe(s, x, y, c, fixed, scale, smallfont) {
    print(String(s), x | 0, y | 0, c | 0, !!fixed, (scale == null ? 1 : scale) | 0, !!smallfont);
  }

  function rowY0(row) { return R.cfg.rowY[row]; }
  function rowY1(row) { return rowY0(row) + R.cfg.rowH[row] - 1; }

  // Row policy lives in MC.layout; renderer uses it for flip decisions.
  function cardLocalRectToScreen(xFace, yFace, lx, ly, w, h, flip180) {
    if (!flip180) {
      return { x: xFace + lx, y: yFace + ly, w: w, h: h };
    }
    // 180° rotation: top-left becomes (W - (lx+w), H - (ly+h))
    return {
      x: xFace + (R.cfg.faceW - (lx + w)),
      y: yFace + (R.cfg.faceH - (ly + h)),
      w: w,
      h: h
    };
  }

  function drawShadowBar(xFace, yFace) {
    rectSafe(xFace + R.cfg.shadowBarDx, yFace, 1, R.cfg.faceH, R.cfg.colShadow);
  }

  function drawFannedShadowBar(xFace, yFace, fanDir) {
    // fanDir=+1 (fan right): shadow at xFace-1
    // fanDir=-1 (fan left): shadow at xFace+faceW
    if (fanDir < 0) rectSafe(xFace + R.cfg.faceW, yFace, 1, R.cfg.faceH, R.cfg.colShadow);
    else drawShadowBar(xFace, yFace);
  }

  function drawFannedStack(stackItems, opts) {
    if (!stackItems || stackItems.length === 0) return;
    var state = opts ? opts.state : null;
    var fanDir = (opts && opts.fanDir != null) ? opts.fanDir : 1;
    var camX = (opts && opts.camX != null) ? opts.camX : 0;
    var flip180 = !!(opts && opts.flip180);
    var selectedItem = opts ? opts.selectedItem : null;
    var drawSelected = !(opts && opts.drawSelected === false);
    var onlySelected = !!(opts && opts.onlySelected);
    var highlightCol = (opts && opts.highlightCol != null) ? opts.highlightCol : null;

    // Draw bottom->top by depth.
    var items = stackItems.slice();
    items.sort(function (a, b) { return a.depth - b.depth; });

    function drawGhostAt(xFace, yFace, col) {
      var shadowCol = MC.Pal.Black;
      if (col == null) col = MC.Pal.Green;
      rectbSafe(xFace - 1, yFace - 1, R.cfg.faceW, R.cfg.faceH, shadowCol);
      rectbSafe(xFace, yFace, R.cfg.faceW, R.cfg.faceH, col);
    }

    var i;
    if (!onlySelected) {
      for (i = 0; i < items.length; i++) {
        var it = items[i];
        if (selectedItem && it === selectedItem) continue;
        var xFace = it.x - camX;
        var yFace = it.y;
        if (it.kind === "ghost") {
          drawGhostAt(xFace, yFace, it.pal);
          continue;
        }
        if (it.kind === "preview") {
          if (!it.uid) continue;
          drawFannedShadowBar(xFace, yFace, fanDir);
          drawMiniCard(state, it.uid, xFace, yFace, flip180, it.color);
          drawHighlight(xFace, yFace, highlightCol);
          continue;
        }
        drawFannedShadowBar(xFace, yFace, fanDir);
        drawMiniCard(state, it.uid, xFace, yFace, flip180, it.color);
      }
    }

    if (drawSelected && selectedItem) {
      var xs = selectedItem.x - camX;
      var ys = selectedItem.y;
      drawFannedShadowBar(xs, ys, fanDir);
      drawMiniCard(state, selectedItem.uid, xs, ys, flip180, selectedItem.color);

      drawHighlight(xs, ys, highlightCol);
    }
  }

  function drawCardFaceBase(xFace, yFace, bgCol) {
    // Border
    rectSafe(xFace, yFace, R.cfg.faceW, R.cfg.faceH, R.cfg.colCardBorder);
    // Interior
    rectSafe(xFace + 1, yFace + 1, R.cfg.faceW - 2, R.cfg.faceH - 2, bgCol);
  }

  function drawHighlight(xFace, yFace, col) {
    if (col == null) col = R.cfg.colHighlight;
    rectbSafe(
      xFace - R.cfg.highlightPad,
      yFace - R.cfg.highlightPad,
      R.cfg.faceW + 2 * R.cfg.highlightPad,
      R.cfg.faceH + 2 * R.cfg.highlightPad,
      col
    );
  }

  function drawDigitGlyph(n, xGlyphTL, yGlyphTL, flip180) {
    if (n < 0 || n > 9) return;
    var id = R.spr.digit0 + n;
    var ck = R.cfg.glyphColorkey;
    var insetX = R.cfg.glyphInsetX;
    var insetY = R.cfg.glyphInsetY;
    var tile = R.cfg.digitTile;
    var w = R.cfg.digitGlyphW;
    var h = R.cfg.digitGlyphH;
    if (!flip180) {
      sprSafe(id, xGlyphTL - insetX, yGlyphTL - insetY, ck, 1, 0, 0, 1, 1);
      return;
    }
    // Rotate 180, but keep inner-glyph top-left anchored.
    sprSafe(
      id,
      xGlyphTL - (tile - insetX - w),
      yGlyphTL - (tile - insetY - h),
      ck,
      1,
      0,
      2,
      1,
      1
    );
  }

  function drawDualPropHalf(xFace, yFace, color, cardValue, flip180) {
    var barCol = R.propBarColByColor[color] != null ? R.propBarColByColor[color] : R.cfg.colText;
    // Value digit: property money value used for debt payment.
    var v = cardValue;
    if (v < 0) v = 0;
    if (v > 9) v = 9;
    var pv = cardLocalRectToScreen(xFace, yFace, R.cfg.propValueX, R.cfg.propValueY, R.cfg.digitGlyphW, R.cfg.digitGlyphH, flip180);
    drawDigitGlyph(v, pv.x, pv.y, flip180);

    // Color bar
    var pr = cardLocalRectToScreen(
      xFace,
      yFace,
      R.cfg.propBarX,
      R.cfg.propBarY,
      R.cfg.propBarW,
      R.cfg.propBarH,
      flip180
    );
    rectSafe(pr.x, pr.y, pr.w, pr.h, barCol);

    // Rent row (rent table)
    var rent = (MC.SET_RULES && MC.SET_RULES[color]) ? MC.SET_RULES[color].rent : null;
    if (rent && rent.length > 0) {
      var i;
      for (i = 0; i < rent.length; i++) {
        var v = rent[i];
        if (v < 0 || v > 9) continue;
        var lx = R.cfg.propRentX + i * R.cfg.propRentDx;
        var ly = R.cfg.propRentY;
        var p = cardLocalRectToScreen(xFace, yFace, lx, ly, R.cfg.digitGlyphW, R.cfg.digitGlyphH, flip180);
        drawDigitGlyph(v, p.x, p.y, flip180);
      }
    }
  }

  function iconForDef(def) {
    if (!def) return 0;
    if (def.kind === MC.CardKind.Money) {
      return R.spr.iconMoney || 0;
    }
    if (def.kind === MC.CardKind.House) return R.spr.iconHouse;
    if (def.kind === MC.CardKind.Action) {
      if (def.actionKind === MC.ActionKind.Rent) return R.spr.iconRent;
      if (def.actionKind === MC.ActionKind.SlyDeal) return R.spr.iconSlyDeal;
      if (def.actionKind === MC.ActionKind.JustSayNo) return R.spr.iconJSN;
    }
    return 0;
  }

  function drawRentBars(xFace, yFace, colors, flip180) {
    if (!colors || colors.length <= 0) return;
    var barH = 2;
    var maxBars = 4;
    var count = colors.length;
    if (count > maxBars) count = maxBars;

    var lx = 1;
    var w = R.cfg.faceW - 2;
    var bottomY = R.cfg.faceH - 1 - barH;
    var i;
    for (i = 0; i < count; i++) {
      var ly = bottomY - i * barH;
      var p = cardLocalRectToScreen(xFace, yFace, lx, ly, w, barH, flip180);
      var color = colors[i];
      var c;
      if (color === MC.Color.Black) c = MC.Pal.Black;
      else c = R.propBarColByColor[color];
      rectSafe(p.x, p.y, p.w, p.h, c != null ? c : R.cfg.colText);
    }
  }

  function drawValueDigit(xFace, yFace, value, flip180) {
    if (value < 0) value = 0;
    if (value > 9) value = 9;
    var p = cardLocalRectToScreen(xFace, yFace, R.cfg.valX, R.cfg.valY, R.cfg.digitGlyphW, R.cfg.digitGlyphH, flip180);
    drawDigitGlyph(value, p.x, p.y, flip180);
  }

  function drawCenterIcon(xFace, yFace, iconId, flip180) {
    if (!iconId) return;
    var ck = R.cfg.glyphColorkey;
    // Icon sprites are assumed full 8x8; no anchor offsets needed.
    var p = cardLocalRectToScreen(xFace, yFace, R.cfg.iconX, R.cfg.iconY, 8, 8, flip180);
    sprSafe(iconId, p.x, p.y, ck, 1, 0, flip180 ? 2 : 0, 1, 1);
  }

  function drawMiniCard(state, uid, xFace, yFace, flip180, assignedColor) {
    var def = state ? MC.state.defByUid(state, uid) : null;
    if (!def) {
      drawCardFaceBase(xFace, yFace, R.cfg.colCardInterior);
      return;
    }

    if (def.kind === MC.CardKind.Property) {
      drawCardFaceBase(xFace, yFace, R.cfg.colCardInterior);
      var payV = def.propertyPayValue != null ? def.propertyPayValue : 0;
      if (MC.rules.isWildDef(def)) {
        // Two halves: top (halfFlip=false), bottom (halfFlip=true). Effective flip is XOR.
        var c0 = def.wildColors[0];
        var c1 = def.wildColors[1];
        var a = (assignedColor == null) ? MC.state.NO_COLOR : assignedColor;
        var colHalfFalse = c0;
        var colHalfTrue = c1;
        if (a === c0 || a === c1) {
          var other = (a === c0) ? c1 : c0;
          // Keep the assigned color on the owner-facing half.
          // `colHalfFalse` is always drawn with the card's `flip180`, which maps to the owner-facing half.
          colHalfFalse = a;
          colHalfTrue = other;
        }
        drawDualPropHalf(xFace, yFace, colHalfFalse, payV, !!flip180);
        drawDualPropHalf(xFace, yFace, colHalfTrue, payV, !flip180);
      } else {
        var c = def.propertyColor;
        drawDualPropHalf(xFace, yFace, c, payV, !!flip180);
      }
      return;
    }

    if (def.kind === MC.CardKind.Action && def.actionKind === MC.ActionKind.Rent) {
      drawCardFaceBase(xFace, yFace, R.cfg.colCardInterior);
      var colors = def.rentAllowedColors;
      if (!(colors && colors.length)) {
        colors = [MC.Color.Cyan, MC.Color.Black, MC.Color.Magenta, MC.Color.Orange];
      }
      drawRentBars(xFace, yFace, colors, !!flip180);
      var rv = def.bankValue;
      drawValueDigit(xFace, yFace, rv, !!flip180);
      var rIcon = iconForDef(def);
      drawCenterIcon(xFace, yFace, rIcon, !!flip180);
      return;
    }

    // Money / Action / House
    var v = def.bankValue;
    var bg = (v >= 1 && v <= 5) ? R.moneyBgByValue[v] : R.cfg.colCardInterior;
    drawCardFaceBase(xFace, yFace, bg);
    drawValueDigit(xFace, yFace, v, !!flip180);
    var icon = iconForDef(def);
    drawCenterIcon(xFace, yFace, icon, !!flip180);
  }

  // Expose mini-card drawing so other modes (e.g. How-to-Play) can reuse it.
  R.drawMiniCard = drawMiniCard;

  function drawCardBack(xFace, yFace, flip180) {
    var cfg = R.cfg;
    var id = (R.spr && R.spr.cardBackTL != null) ? R.spr.cardBackTL : 0;

    if (id) {
      // Card back: 2x3 sprite (16x24) drawn inside the 1px border.
      // Art convention: last col + last row are colorkey (15) so the effective area is 15x23.
      drawCardFaceBase(xFace, yFace, cfg.colCardInterior);
      // When rotated 180°, the padded colorkey row/col becomes the top/left edge.
      // Shift origin so the visible pattern still starts at (1,1) inside the border.
      var sx = flip180 ? xFace : (xFace + 1);
      var sy = flip180 ? yFace : (yFace + 1);
      sprSafe(id, sx, sy, cfg.glyphColorkey, 1, 0, flip180 ? 2 : 0, 2, 3);
      return;
    }

    // Fallback back: border + interior + diagonal bars.
    drawCardFaceBase(xFace, yFace, 1);
    var p1 = cardLocalRectToScreen(xFace, yFace, 3, 6, 11, 2, flip180);
    rectSafe(p1.x, p1.y, p1.w, p1.h, 12);
    var p2 = cardLocalRectToScreen(xFace, yFace, 3, 16, 11, 2, flip180);
    rectSafe(p2.x, p2.y, p2.w, p2.h, 12);
  }

  function drawCenter(opts) {
    if (!opts || !opts.state || !opts.view || !opts.computed) return;
    var s = opts.state;
    var view = opts.view;
    var computed = opts.computed;
    var selectedItem = opts.selected;

    var cfg = R.cfg;
    var row = R.ROW_CENTER;
    var y0 = rowY0(row);
    var y1 = rowY1(row);
    rectSafe(0, y0, 239, y1 - y0 + 1, cfg.colCenterPanel);
    rectbSafe(0, y0, 239, y1 - y0 + 1, cfg.colCenterPanelBorder);

    var dbgEnabled = !!(MC.config.debug.enabled && MC.debug.toolsOn);
    var hlCol = (opts.highlightCol != null) ? opts.highlightCol : cfg.colHighlight;

    // Plays indicator is drawn in screen-space.

    function drawCountDigits(n, xFace, yFace) {
      var sN = String(n);
      if (sN.length > 2) sN = sN.slice(-2);
      var len = sN.length;
      var yTL = cfg.faceH - 1 - cfg.digitGlyphH + cfg.pileCountDy;
      var xEnd = cfg.faceW - 1 - cfg.digitGlyphW + cfg.pileCountDx;
      var xStart = xEnd - (len - 1) * cfg.propRentDx;
      var i;
      for (i = 0; i < len; i++) {
        var ch = sN.charCodeAt(i) - 48;
        if (ch < 0 || ch > 9) continue;
        drawDigitGlyph(ch, xFace + xStart + i * cfg.propRentDx, yFace + yTL, false);
      }
    }

    function drawUnderLayerOutline(xFace, yFace, dx, dy) {
      var colMain = cfg.pileOutlineUnder1Col;
      if (dx === cfg.pileUnderDx2 && dy === cfg.pileUnderDy2) colMain = cfg.pileOutlineUnder2Col;
      rectbSafe(xFace + dx - 1, yFace + dy - 1, cfg.faceW, cfg.faceH, cfg.pileShadowOutlineCol);
      rectbSafe(xFace + dx, yFace + dy, cfg.faceW, cfg.faceH, colMain);
    }

    function drawDeckAt(xFace, yFace, nVis, layersOverride) {
      var n = (nVis != null) ? nVis : s.deck.length;
      var layers = (layersOverride != null) ? layersOverride : -1;
      if (layers < 0) {
        // Default: derive visible pile depth from actual count.
        if (n > 2) layers = 2;
        else if (n > 1) layers = 1;
        else layers = 0;
      }

      // Underlayers first (so the top card is always on top).
      if (layers >= 2) drawUnderLayerOutline(xFace, yFace, cfg.pileUnderDx2, cfg.pileUnderDy2);
      if (layers >= 1) drawUnderLayerOutline(xFace, yFace, cfg.pileUnderDx1, cfg.pileUnderDy1);
      drawShadowBar(xFace, yFace);
      drawCardBack(xFace, yFace, false);
      drawCountDigits(n, xFace, yFace);
    }

    function drawDiscardAt(xFace, yFace, nVis, topUidVis) {
      var n = (nVis != null) ? nVis : s.discard.length;
      if (n > 2) {
        drawUnderLayerOutline(xFace, yFace, cfg.pileUnderDx2, cfg.pileUnderDy2);
        drawUnderLayerOutline(xFace, yFace, cfg.pileUnderDx1, cfg.pileUnderDy1);
      } else if (n > 1) {
        drawUnderLayerOutline(xFace, yFace, cfg.pileUnderDx1, cfg.pileUnderDy1);
      }

      if (n <= 0) {
        rectbSafe(xFace, yFace, cfg.faceW, cfg.faceH, cfg.colText);
        rectSafe(xFace + cfg.shadowBarDx, yFace, 1, cfg.faceH, cfg.colShadow);
        drawCountDigits(0, xFace, yFace);
        return;
      }

      var topUid = (topUidVis != null) ? topUidVis : s.discard[n - 1];
      drawShadowBar(xFace, yFace);
      if (topUid) drawMiniCard(s, topUid, xFace, yFace, false);
      else {
        // Masked-top fallback (used during shuffle animation): show an empty pile face with count.
        rectbSafe(xFace, yFace, cfg.faceW, cfg.faceH, cfg.colText);
      }
      drawCountDigits(n, xFace, yFace);
    }

    // Center row items (deck/discard/buttons). Presentation hints come from computed models.
    var rowM = computed.models ? computed.models[row] : null;
    var i;
    if (rowM && rowM.items) {
      for (i = 0; i < rowM.items.length; i++) {
        var it = rowM.items[i];
        if (!it) continue;
        if (it.kind === "deck") drawDeckAt(it.x, it.y, it.nVis, it.pileLayers);
        else if (it.kind === "discard") drawDiscardAt(it.x, it.y, it.nVis, it.topUidVis);
        else if (it.kind === "btn") {
          // Flat UI button: dark fill + white text; selected uses highlight fill + black text.
          // Note: debug gating and overlay hiding is handled in MC.ui.computeRowModels.

          var enabled = !it.disabled;

          var isSel = !!(selectedItem && selectedItem === it);
          var recommend = false;
          if (it.id === "endTurn" && enabled && (s.activeP === 0) && (s.playsLeft != null) && (s.playsLeft <= 0)) recommend = true;

          var bg = isSel ? hlCol : cfg.colCenterPanel;
          var border = isSel ? MC.Pal.Black : (recommend ? MC.Pal.Green : cfg.colCenterPanelBorder);
          var colText = enabled ? (isSel ? MC.Pal.Black : cfg.colText) : MC.Pal.Grey;
          if (!isSel && recommend && enabled) colText = MC.Pal.Green;

          rectSafe(it.x, it.y, it.w, it.h, bg);
          rectbSafe(it.x, it.y, it.w, it.h, border);

          // Vertically center 6px font in button height.
          var labelY = it.y + Math.floor((it.h - 6) / 2);
          printSafe(String(it.label || it.id || ""), it.x + 2, labelY, colText);
        }
      }
    }

    // Non-selectable center overlays (e.g. payDebt buffer stack).
    if (rowM && rowM.overlayItems) {
      for (i = 0; i < rowM.overlayItems.length; i++) {
        var itO = rowM.overlayItems[i];
        if (!itO) continue;
        if (itO.kind === "payBuf") {
          var uids = itO.uids;
          if (!uids || uids.length === 0) continue;
          var strideB = cfg.stackStrideX;
          var stack = [];
          var jB;
          for (jB = 0; jB < uids.length; jB++) {
            var uidB = uids[jB];
            if (!uidB) continue;
            stack.push({ kind: "payBufCard", uid: uidB, x: itO.x + jB * strideB, y: itO.y, depth: jB });
          }
          drawFannedStack(stack, { state: s, fanDir: 1, flip180: false, camX: 0, selectedItem: null, drawSelected: false, highlightCol: hlCol });
        }
      }
    }

    // Overlay content area (right side).
    var C = R.center;
    var xPrev = C.preview.x;
    var yPrev = C.preview.y;
    var xTitle = C.title.x;
    var yTitle = C.title.y;
    var xDesc = C.desc.x;
    var yDesc = C.desc.y;

    // Inspect uses a screen-space panel with panel-driven anchors.
    var panel = null;
    if (view.inspectActive) {
      var Lp = MC.config.render.layout;
      panel = {
        x0: Lp.inspectPanelX0,
        y0: Lp.inspectPanelY0,
        x1: Lp.inspectPanelX1,
        y1: Lp.inspectPanelY1
      };
      // Backing panel behind preview+title+desc.
      rectSafe(panel.x0, panel.y0, panel.x1 - panel.x0 + 1, panel.y1 - panel.y0 + 1, cfg.inspectPanelFillCol);
      rectbSafe(panel.x0, panel.y0, panel.x1 - panel.x0 + 1, panel.y1 - panel.y0 + 1, cfg.colCenterPanelBorder);

      var padX = Lp.inspectPanelPadX;
      var padY = Lp.inspectPanelPadY;
      var gapX = Lp.inspectTitleGapX;
      var descDy = Lp.inspectDescDy;
      xPrev = panel.x0 + padX;
      yPrev = panel.y0 + padY;
      xTitle = xPrev + cfg.faceW + gapX;
      yTitle = yPrev;
      xDesc = xTitle;
      yDesc = yTitle + descDy;
    }

    function drawInspectForSelection(sel) {
      if (!sel) return;

      // Non-card center widgets.
      if (sel.row === R.ROW_CENTER && !sel.uid) {
        if (sel.kind === "deck") {
          printSafe("Deck", xTitle, yTitle, cfg.colText);
          var deckDesc = "Cards: " + s.deck.length;
          if (dbgEnabled && s.deck.length > 0) {
            var topUid = s.deck[s.deck.length - 1];
            drawMiniCard(s, topUid, xPrev, yPrev, false);
            var defT = MC.state.defByUid(s, topUid);
            if (defT && defT.name) deckDesc += "\nTop: " + String(defT.name);
          }
          printExSafe(deckDesc, xDesc, yDesc, cfg.colText, false, 1, true);
          return;
        }
        if (sel.kind === "discard") {
          printSafe("Discard", xTitle, yTitle, cfg.colText);
          var discardDesc = "Cards: " + s.discard.length;
          if (s.discard.length > 0) {
            var topUid2 = s.discard[s.discard.length - 1];
            drawMiniCard(s, topUid2, xPrev, yPrev, false);
            var defD = MC.state.defByUid(s, topUid2);
            if (defD && defD.name) discardDesc += "\nTop: " + String(defD.name);
          }
          printExSafe(discardDesc, xDesc, yDesc, cfg.colText, false, 1, true);
          return;
        }
        if (sel.kind === "btn") {
          var title = String(sel.label || sel.id || "");
          printSafe(title, xTitle, yTitle, cfg.colText);
          var help = "";
          if (sel.id === "endTurn") help = "End your turn.\nIf hand > 7, discard down.";
          else if (sel.id === "mainMenu") help = "Return to the title\nscreen.";
          else if (sel.id === "step") help = "Debug: step 1 random\nlegal move.";
          else if (sel.id === "reset") help = "Debug: reset current\nscenario.";
          else if (sel.id === "nextScenario") help = "Debug: switch to next\nscenario.";
          printExSafe(help, xDesc, yDesc, cfg.colText, false, 1, true);
          return;
        }
      }

      // Card selection.
      if (!sel.uid) return;
      var uid = sel.uid;
      var def = MC.state.defByUid(s, uid);
      if (!def) return;

      // Opponent hand is hidden unless debug enabled.
      if (!dbgEnabled && sel.row === R.ROW_OP_HAND) {
        printSafe("Opponent card", xTitle, yTitle, cfg.colText);
        printExSafe("(hidden)", xDesc, yDesc, cfg.colText, false, 1, false);
        return;
      }

      drawMiniCard(s, uid, xPrev, yPrev, false, sel.color);
      printSafe(MC.fmt.inspectTitleForDef(def), xTitle, yTitle, cfg.colText);
      var desc = MC.fmt.inspectDescForDef(def, sel.color);
      printExSafe(desc, xDesc, yDesc, cfg.colText, false, 1, true);
    }

    function drawMenuOverlay() {
      var src = view.menu && view.menu.src ? view.menu.src : null;
      if (src && src.uid) drawMiniCard(s, src.uid, xPrev, yPrev, false);
      printSafe("Menu", xTitle, yTitle - 1, cfg.colText);
      var items = (view.menu && view.menu.items) ? view.menu.items : [];
      var selI = view.menu ? view.menu.i : 0;
      if (selI < 0) selI = 0;
      if (selI >= items.length) selI = items.length - 1;
      var j;
      var y = yDesc - 1;
      // Backing box so the menu is unmistakable.
      var boxX = xDesc - 2;
      var boxY = y - 2;
      var boxW = cfg.screenW - boxX - cfg.rowPadX;
      // Menu height is clamped so the border never overlaps the control hints line.
      var hintY = y1 - 7; // smallfont
      var boxH = (items.length * 7 + 10);
      // Let the box sit 1px closer to the hint band to fit 3 items cleanly.
      var maxH = (hintY - 2) - boxY;
      if (maxH > 0 && boxH > maxH) boxH = maxH;
      if (boxH < 16) boxH = 16;
      rectSafe(boxX, boxY, boxW, boxH, MC.Pal.Black);
      rectbSafe(boxX, boxY, boxW, boxH, cfg.colCenterPanelBorder);

      for (j = 0; j < items.length; j++) {
        var yy = y + j * 7;
        var label = String(items[j].label || items[j].id || "");
        if (j === selI) {
          rectSafe(boxX + 1, yy - 1, boxW - 2, 7, hlCol);
          printSafe(label, xDesc, yy, MC.Pal.Black);
        } else {
          printSafe(label, xDesc, yy, cfg.colText);
        }
      }
      printExSafe("A:Select  B:Back", xDesc, hintY, cfg.colText, false, 1, true);
    }

    function drawTargetingOverlay() {
      var t = view.targeting;
      if (!t || !t.active) return;
      if (t.card && t.card.uid) drawMiniCard(s, t.card.uid, xPrev, yPrev, false, (t.wildColor !== MC.state.NO_COLOR) ? t.wildColor : null);

      var cmd = (t.cmds && t.cmds.length) ? t.cmds[t.cmdI % t.cmds.length] : null;

      var title = MC.fmt.targetingTitle(t, cmd);
      printSafe(title, xTitle, yTitle, cfg.colText);
      var destLine = MC.fmt.targetingDestLine(s, t, cmd);
      // Backing box so targeting is unmistakable.
      var boxX = xDesc - 2;
      var boxY = yDesc - 2;
      var boxW = cfg.screenW - boxX - cfg.rowPadX;
      var boxH = 30;
      rectSafe(boxX, boxY, boxW, boxH, MC.Pal.Black);
      rectbSafe(boxX, boxY, boxW, boxH, cfg.colCenterPanelBorder);

      printExSafe(destLine, xDesc, yDesc, cfg.colText, false, 1, false);

      var help = MC.fmt.targetingHelp(t);
      printExSafe(help, xDesc, y1 - 18, cfg.colText, false, 1, true);
    }

    if (view.mode === "menu") drawMenuOverlay();
    else if (view.mode === "targeting") drawTargetingOverlay();
    else if (view.inspectActive) {
      drawInspectForSelection(selectedItem);
    }

    // Feedback message is drawn as a screen-top toast (see drawToast()).
  }

  function drawPlaysPips(state) {
    var cfg = R.cfg;
    if (!state) return;
    if (cfg.hudLineEnabled === false) return;
    var maxPlays = 3;
    var playsLeft = state.playsLeft;
    if (playsLeft < 0) playsLeft = 0;
    if (playsLeft > maxPlays) playsLeft = maxPlays;
    var used = maxPlays - playsLeft;
    if (used < 0) used = 0;
    if (used > maxPlays) used = maxPlays;

    var x0 = cfg.hudLineX;
    var y0 = cfg.hudLineY;
    var dx = 6; // 6px font cell width
    var i;
    for (i = 0; i < maxPlays; i++) {
      var col = (i < used) ? MC.Pal.Red : MC.Pal.Green;
      printSafe("o", x0 + i * dx, y0, col);
    }
  }

  function drawModeHintNearButtons(view, computed) {
    var cfg = R.cfg;
    if (cfg.hudLineEnabled === false) return;
    var dbgEnabled = !!(MC.config.debug.enabled && MC.debug.toolsOn);
    if (!dbgEnabled) return;
    // Prompts don't overlap this hint, so keep it visible in prompt mode too.
    if (!view || (view.mode !== "browse" && view.mode !== "prompt") || view.inspectActive) return;
    if (!computed || !computed.models) return;
    var rowM = computed.models[R.ROW_CENTER];
    if (!rowM || !rowM.items) return;

    // Only show this hint when debug buttons exist (Step/Reset/Next visible).
    var hasDebugBtn = false;
    var minBtnX = null;
    var maxBtnY = null;
    var i;
    for (i = 0; i < rowM.items.length; i++) {
      var it = rowM.items[i];
      if (!it || it.kind !== "btn") continue;
      if (it.id === "step" || it.id === "reset" || it.id === "nextScenario") hasDebugBtn = true;
      if (minBtnX == null || it.x < minBtnX) minBtnX = it.x;
      var yy = it.y + it.h;
      if (maxBtnY == null || yy > maxBtnY) maxBtnY = yy;
    }
    if (!hasDebugBtn || minBtnX == null || maxBtnY == null) return;

    // If debug buttons extend below the center row band (e.g. due to extra buttons),
    // keep the hint anchored inside the center row so it doesn't overlap gameplay rows.
    var yMaxCenter = rowY1(R.ROW_CENTER) + 1;
    if (maxBtnY > yMaxCenter) maxBtnY = yMaxCenter;

    // Place left of the strip, aligned to its bottom.
    var x = minBtnX - 52;
    if (x < cfg.rowPadX) x = cfg.rowPadX;
    var y = maxBtnY - 7; // 6px font + 1
    printSafe("Y:Mode", x, y, cfg.hudLineCol);
  }

  function drawToasts(view) {
    var cfg = R.cfg;
    if (!view || !view.toasts || view.toasts.length === 0) return;

    var charW = 6;
    var lineH = 7;
    var padX = 6;
    var padY = 4;

    var yCursor = 2;
    var ti;
    for (ti = 0; ti < view.toasts.length; ti++) {
      var t = view.toasts[ti];
      if (!t || !t.text) continue;
      var msg = String(t.text);
      if (!msg) continue;

      // Support 1–2 lines.
      var parts = msg.split("\n");
      if (parts.length > 2) parts = [parts[0], parts[1]];
      var maxLen = 0;
      var i;
      for (i = 0; i < parts.length; i++) if (parts[i].length > maxLen) maxLen = parts[i].length;

      var kind = t.kind ? String(t.kind) : "";
      var isError = (kind === "error");
      var iconW = isError ? 10 : 0;
      var boxW = (padX * 2) + iconW + maxLen * charW;
      if (boxW > cfg.screenW - 8) boxW = cfg.screenW - 8;
      var boxH = (padY * 2) + parts.length * lineH;

      var x0 = Math.floor((cfg.screenW - boxW) / 2);
      var y0 = yCursor;

      var bgCol = MC.Pal.Black;
      if (kind === "ai") bgCol = cfg.colToastBgAi;
      rectSafe(x0, y0, boxW, boxH, bgCol);
      rectbSafe(x0, y0, boxW, boxH, cfg.colCenterPanelBorder);
      // 1px shadow line under the bottom border so the box doesn't blend into bright elements behind it.
      if ((y0 + boxH) < cfg.screenH) rectSafe(x0, y0 + boxH, boxW, 1, cfg.colShadow);

      var textX = x0 + padX + iconW;
      if (isError) {
        printSafe("X", x0 + 4, y0 + padY, MC.Pal.Red);
      }
      for (i = 0; i < parts.length; i++) {
        // Fixed-width makes centering math exact (avoids proportional font whitespace).
        printExSafe(parts[i], textX, y0 + padY + i * lineH, cfg.colText, true, 1, false);
      }

      yCursor += boxH + 2;
      if (yCursor > cfg.screenH - 8) break;
    }
  }

  // Expose toast renderer so non-game modes (e.g. Title) can reuse it.
  R.drawToasts = drawToasts;

  function groupStacksByKey(items, camX) {
    var byKey = {};
    var keys = [];
    var i;
    for (i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it || !it.stackKey) continue;
      var k = String(it.stackKey);
      var a = byKey[k];
      if (!a) {
        a = [];
        byKey[k] = a;
        keys.push(k);
      }
      a.push(it);
    }

    // Stable visual ordering: sort stacks by their left edge on screen (after camera).
    keys.sort(function (ka, kb) {
      var aa = byKey[ka];
      var bb = byKey[kb];
      var mina = 999999;
      var minb = 999999;
      var j;
      for (j = 0; j < aa.length; j++) {
        var xa = aa[j].x - camX;
        if (xa < mina) mina = xa;
      }
      for (j = 0; j < bb.length; j++) {
        var xb = bb[j].x - camX;
        if (xb < minb) minb = xb;
      }
      return mina - minb;
    });

    return { byKey: byKey, keys: keys };
  }

  function drawRowCards(state, view, computed, rowModel, row, selected, cam, highlightCol) {
    var cfg = R.cfg;
    if (cam == null) cam = 0;
    if (highlightCol == null) highlightCol = cfg.colHighlight;
    var flipCards = MC.layout.isOpponentRow(row);
    var i;

    var overlayItems = rowModel && rowModel.overlayItems ? rowModel.overlayItems : null;
    var itemsForStacks = rowModel.items;
    if (overlayItems && overlayItems.length) itemsForStacks = itemsForStacks.concat(overlayItems);

    // Hide the source card when UI wants to represent its slot as a ghost/preview.
    var hideSrc = (computed && computed.meta && computed.meta.hideSrc) ? computed.meta.hideSrc : null;

    if (row === R.ROW_OP_TABLE || row === R.ROW_P_TABLE) {
      // When targeting moveWild, hide the source card in the table stack to avoid duplicating it
      // at both the source and preview destination.
      var selT = selected;
      if (hideSrc && hideSrc.loc && String(hideSrc.loc.zone) === "setProps") {
        // Remove the hidden card from the draw list.
        var outItems = [];
        for (i = 0; i < itemsForStacks.length; i++) {
          var itHid = itemsForStacks[i];
          if (!itHid || !itHid.loc) { outItems.push(itHid); continue; }
          if (itHid.uid === hideSrc.uid && itHid.loc.p === hideSrc.loc.p && String(itHid.loc.zone) === "setProps" && itHid.loc.setI === hideSrc.loc.setI && itHid.loc.i === hideSrc.loc.i) {
            continue;
          }
          outItems.push(itHid);
        }
        itemsForStacks = outItems;

        // Also suppress highlight if the selected item is the hidden one.
        if (selT && selT.loc && selT.uid === hideSrc.uid && selT.loc.p === hideSrc.loc.p && String(selT.loc.zone) === "setProps" && selT.loc.setI === hideSrc.loc.setI && selT.loc.i === hideSrc.loc.i) {
          selT = null;
        }
      }

      // Table rows must be drawn by stack depth (bottom->top), not x-order,
      // otherwise fan-left stacks layer incorrectly.
      var grouped = groupStacksByKey(itemsForStacks, cam);
      var byKey = grouped.byKey;
      var keys = grouped.keys;

      // Draw all stacks bottom->top, skipping selected.
      var si;
      for (si = 0; si < keys.length; si++) {
        var key = keys[si];
        var cards = byKey[key];
        var fanDir = (cards.length > 0 && cards[0].fanDir != null) ? cards[0].fanDir : (flipCards ? -1 : 1);
        drawFannedStack(cards, { state: state, fanDir: fanDir, flip180: !!flipCards, camX: cam, selectedItem: selT, drawSelected: false, highlightCol: highlightCol });
      }

      // Selected last + highlight.
      if (selT) {
        var sFan = (selT.fanDir != null) ? selT.fanDir : (flipCards ? -1 : 1);
        var sk = String(selT.stackKey);
        var stack = byKey[sk] || [selT];
        drawFannedStack(stack, { state: state, fanDir: sFan, flip180: !!flipCards, camX: cam, selectedItem: selT, onlySelected: true, highlightCol: highlightCol });
      }
      return;
    }

    // Hand rows (and opponent back row): simple x-order is fine for non-stack items.
    var groupedH = groupStacksByKey(itemsForStacks, cam);
    var byKeyH = groupedH.byKey;
    var keysH = groupedH.keys;

    // Draw non-bank hand items in x-order first.
    for (i = 0; i < rowModel.items.length; i++) {
      var it = rowModel.items[i];
      if (!it || it.stackKey) continue;
      if (selected && it === selected) continue;
      if (hideSrc && row === R.ROW_P_HAND && it.loc && (it.loc.zone === "hand" || it.loc.zone === "recvProps")) {
        if (it.uid === hideSrc.uid && it.loc.p === hideSrc.loc.p && String(it.loc.zone) === String(hideSrc.loc.zone) && it.loc.i === hideSrc.loc.i) {
          continue;
        }
      }
      var x = it.x - cam;
      var y = it.y;
      if (row === R.ROW_OP_HAND) {
        drawShadowBar(x, y);
        drawCardBack(x, y, true);
      } else if (row === R.ROW_P_HAND) {
        drawShadowBar(x, y);
        drawMiniCard(state, it.uid, x, y, !!flipCards);
      }
    }

    // Draw stack(s) bottom->top so overlap shadows remain visible (bank is a stack in hand rows).
    var ki;
    for (ki = 0; ki < keysH.length; ki++) {
      var k0 = keysH[ki];
      var stack0 = byKeyH[k0];
      if (!stack0 || stack0.length === 0) continue;
      var fanDirB = (stack0[0].fanDir != null) ? stack0[0].fanDir : 1;
      var flipBank = (row === R.ROW_OP_HAND);
      var selInThis = (selected && selected.stackKey === k0) ? selected : null;
      var camForThis = cam;
      drawFannedStack(stack0, { state: state, fanDir: fanDirB, flip180: !!flipBank, camX: camForThis, selectedItem: selInThis, drawSelected: false, highlightCol: highlightCol });
    }

    // Skip drawing the source selection highlight during hold-targeting; preview handles the feedback.
    var sel = selected;
    if (hideSrc && row === R.ROW_P_HAND && sel && sel.loc && (sel.loc.zone === "hand" || sel.loc.zone === "recvProps")) {
      if (sel.uid === hideSrc.uid && sel.loc.p === hideSrc.loc.p && String(sel.loc.zone) === String(hideSrc.loc.zone) && sel.loc.i === hideSrc.loc.i) {
        sel = null;
      }
    }

    if (sel) {
      var xs = sel.x - cam;
      var ys = sel.y;
      if (row === R.ROW_OP_HAND) {
        if (sel.stackKey) {
          var sFanO = (sel.fanDir != null) ? sel.fanDir : -1;
          var stackO = byKeyH[String(sel.stackKey)] || [sel];
          drawFannedStack(stackO, { state: state, fanDir: sFanO, flip180: true, camX: cam, selectedItem: sel, onlySelected: true, highlightCol: highlightCol });
        } else {
          drawShadowBar(xs, ys);
          drawCardBack(xs, ys, true);
          drawHighlight(xs, ys, highlightCol);
        }
      } else if (row === R.ROW_P_HAND) {
        if (sel.stackKey) {
          var sFanP = (sel.fanDir != null) ? sel.fanDir : 1;
          var stackP = byKeyH[String(sel.stackKey)] || [sel];
          drawFannedStack(stackP, { state: state, fanDir: sFanP, flip180: false, camX: cam, selectedItem: sel, onlySelected: true, highlightCol: highlightCol });
        } else {
          drawShadowBar(xs, ys);
          drawMiniCard(state, sel.uid, xs, ys, !!flipCards);
          drawHighlight(xs, ys, highlightCol);
        }
      }
    }
  }

  R.debug = {};

  // DebugText support: summarize current Render selection without drawing.
  R.debug.selectedLines = function (debug) {
    if (!debug || !debug.state) return ["Sel:(none)", ""];
    var it = null;
    if (debug.view) {
      var computed = MC.ui.computeRowModels(debug.state, debug.view);
      it = computed ? computed.selected : null;
    }
    if (!it) return ["Sel:(none)", ""];

    if (it.row === R.ROW_CENTER) {
      if (it.kind === "deck") return ["Sel:Deck", "Cards:" + debug.state.deck.length];
      if (it.kind === "discard") return ["Sel:Discard", "Cards:" + debug.state.discard.length];
      return ["Sel:" + String(it.kind || "?"), ""];
    }

    if (it.uid) {
      var uid = it.uid;
      var def = MC.state.defByUid(debug.state, uid);
      var defId = def ? def.id : "?";
      var line2 = (def && def.name) ? def.name : "";

      if (def && def.kind === MC.CardKind.Property) {
        if (MC.rules.isWildDef(def)) {
          var c0 = def.wildColors[0];
          var c1 = def.wildColors[1];
          line2 = "Wild:" + MC.fmt.colorName(c0) + "/" + MC.fmt.colorName(c1);
          if (it.color != null && it.color !== MC.state.NO_COLOR) {
            line2 += " As:" + MC.fmt.colorName(it.color);
          }
        } else {
          line2 = "Prop:" + MC.fmt.colorName(def.propertyColor);
        }
      }

      return ["Sel:" + defId + " uid:" + uid, line2];
    }

    return ["Sel:" + String(it.kind || "?"), ""];
  };

  // Shuffle + deal animations (render-only visuals).
  // Renderer is oblivious to `view.anim`; UI/anim modules provide presentation in `computed`.
  function drawAnimOverlay(state, view, computed) {
    if (!state || !view || !computed) return;
    var ov = computed.animOverlay;
    if (!ov || !ov.kind) return;
    if (ov.kind === "dealCard") {
      var x = ov.x;
      var y = ov.y;
      var p = ov.p;
      var uid = ov.uid;
      drawShadowBar(x, y);
      if (p === 1) drawCardBack(x, y, true);
      else drawMiniCard(state, uid, x, y, false);
    } else if (ov.kind === "moveCard") {
      var x2 = ov.x;
      var y2 = ov.y;
      var uid2 = ov.uid;
      var flip180 = !!ov.flip180;
      drawShadowBar(x2, y2);
      drawMiniCard(state, uid2, x2, y2, flip180);
      if (ov.outlinePal != null) {
        rectbSafe(x2 - 1, y2 - 1, R.cfg.faceW, R.cfg.faceH, MC.Pal.Black);
        rectbSafe(x2, y2, R.cfg.faceW, R.cfg.faceH, ov.outlinePal);
      }
    }
  }

  R.drawFrame = function (args) {
    if (!args) return;
    var state = args.state || (args.debug && args.debug.state) || args.state;
    var view = args.view || (args.debug && args.debug.view) || args.view;
    if (!state || !view) return;

    var computed = args.computed;
    if (!computed) computed = MC.ui.computeRowModels(state, view);
    if (!computed || !computed.models) return;

    var models = computed.models;
    // UI owns cursor/selection policy (clamping, relocation off empty rows, etc.).
    // Renderer should trust the computed selection rather than re-deriving from view.cursor.
    var sel = computed.selected || null;

    var cfg = R.cfg;
    var hlCol = (computed.highlightCol != null) ? computed.highlightCol : cfg.colHighlight;

    // Clear background.
    cls(cfg.colBg);

    // Draw non-center rows.
    var row;
    for (row = 0; row < 5; row++) {
      if (row === R.ROW_CENTER) continue;
      var rm = models[row];
      if (!rm || !rm.items) continue;
      var cam = (view.camX && view.camX[row] != null) ? view.camX[row] : 0;
      var selected = (sel && sel.row === row) ? sel : null;
      drawRowCards(state, view, computed, rm, row, selected, cam, hlCol);
    }

    // Center panel last (so text overlays are readable).
    drawCenter({ state: state, view: view, computed: computed, selected: sel, highlightCol: hlCol });

    // Animations on top of scene (but under toasts).
    drawAnimOverlay(state, view, computed);

    // Highlight center widgets if selected.
    if (sel && sel.row === R.ROW_CENTER) {
      rectbSafe(sel.x - 1, sel.y - 1, sel.w + 2, sel.h + 2, hlCol);
    }

    // HUD / UX chrome (draw last).
    drawPlaysPips(state);
    drawModeHintNearButtons(view, computed);
    drawToasts(view);
  };
})();

// ---- src/65_ui.js ----
// MC.ui: controller UX view-state machine + model computation (drives commands; does not author rules).
MC.ui.newView = function () {
  return {
    // View-only state (cursor/camera/menu focus). This is intentionally not part of GameState.
    cursor: { row: 4, i: 0 }, // default to player hand
    camX: [0, 0, 0, 0, 0],

    // browse | menu | targeting | prompt
    mode: "browse",

    // Menu (center panel)
    menu: {
      items: [],
      i: 0,
      // Source selection snapshot when menu opened.
      src: null
    },

    // Targeting (Place/Build via hold or via menu)
    targeting: {
      active: false,
      // kind: "place" | "build" | "bank"
      kind: "",
      // true if entered from A-hold (confirm on A release)
      hold: false,
      // source: { uid, loc }
      card: null,
      // for wilds
      wildColor: MC.state.NO_COLOR,
      // list of concrete engine commands (subset of MC.engine.legalMoves)
      cmds: [],
      cmdI: 0,

      // Hold-A chain: compose multiple targeting kinds (e.g. Sly→Bank→Source)
      // so cursor-mode targeting doesn't have to impersonate preview-mode destinations.
      chainActive: false,
      chainSegs: [],
      chainI: 0,
      // Cursor location to snap back to when entering non-cursor segments (bank/source).
      srcCursor: { row: 4, i: 0 }
    },

    // Inspect (hold X with delay)
    inspectActive: false,

    // Toasts: stacked notifications at screen top.
    // Each toast: { id?, kind?, text, frames?, persistent? }
    toasts: [],

    // Animations: shuffle + staged dealing. Purely view-owned.
    anim: {
      q: [],
      active: null,
      lock: false,
      // hiddenByP[p][uid] = true means uid is in-hand but not yet revealed.
      hiddenByP: [{}, {}],
      // Hide cards that are mid-transfer (any zone, any player).
      hiddenByUid: {},
      // Last seen screen-space face origins by uid (for transfer animations).
      lastPosByUid: {},
      // Visual list of cards in the pay/transfer buffer stack (center row).
      // Used to keep the buffer visible while promptBuf-sourced transfers drain after the prompt clears.
      payBufUids: []
    },

    // Feedback: blink + message, plus attempt counts.
    feedback: {
      blinkFrames: 0,
      blinkPhase: 0,
      lastCode: "",
      attemptsByCode: {}
    },

    // Small UX memory (used for one-shot nudges like snapping to End when out of plays).
    ux: {
      lastActiveP: null,
      lastPlaysLeft: null,
      lastHandLenP0: null,
      lastWinnerP: MC.state.NO_WINNER,
      lastPromptKind: "",
      lastPromptForP0: false,
      lastFocusRuleId: "",
      pendingFocusErrorCode: "",
      autoFocusPausedByDebug: false,
      selAnchor: null
    }
  };
};

MC.ui.toastPush = function (view, toast) {
  var t = {
    id: toast.id,
    kind: toast.kind,
    text: toast.text,
    frames: toast.frames,
    persistent: toast.persistent
  };

  // Replace-by-id if provided.
  var i;
  for (i = 0; i < view.toasts.length; i++) {
    var ex = view.toasts[i];
    if (ex && ex.id === t.id) { view.toasts[i] = t; return; }
  }
  view.toasts.push(t);
};

MC.ui.toastsTick = function (view) {
  var out = [];
  var i;
  for (i = 0; i < view.toasts.length; i++) {
    var t = view.toasts[i];
    if (t.persistent) { out.push(t); continue; }
    t.frames -= 1;
    if (t.frames > 0) out.push(t);
  }
  view.toasts = out;
};

MC.ui.syncPromptToast = function (state, view) {
  // Game over: hide prompt toast so Winner toast can take over.
  if (state && state.winnerP !== MC.state.NO_WINNER) {
    var iGo;
    for (iGo = 0; iGo < view.toasts.length; iGo++) {
      var tGo = view.toasts[iGo];
      if (tGo && tGo.id === "prompt") { view.toasts.splice(iGo, 1); break; }
    }
    return;
  }

  var pr = state.prompt;
  var has = !!(pr && pr.kind && pr.p === 0);
  var i;
  var idx = -1;
  for (i = 0; i < view.toasts.length; i++) {
    var t = view.toasts[i];
    if (t && t.id === "prompt") { idx = i; break; }
  }

  if (!has) {
    if (idx >= 0) view.toasts.splice(idx, 1);
    return;
  }

  var txt = "";
  if (pr.kind === "discardDown") {
    var over = state.players[0].hand.length - MC.state.HAND_MAX;
    txt = "Too many cards. Discard " + over;
  } else if (pr.kind === "payDebt") {
    // If action-sourced debt and JSN is available, teach the response window.
    var jsnAvail = !!(pr.srcAction && pr.buf && pr.buf.length === 0 && MC.rules.handHasActionKind(state, 0, MC.ActionKind.JustSayNo));
    if (jsnAvail && pr.srcAction && String(pr.srcAction.kind || "") === "rent") {
      txt = "Rent: Pay $" + pr.rem + " or Just Say No";
    } else if (jsnAvail) {
      txt = "Pay $" + pr.rem + " or Just Say No";
    } else {
      txt = "Pay debt: $" + pr.rem + " left";
    }
  } else if (pr.kind === "placeReceived") {
    txt = "Place received properties: " + pr.uids.length;
  } else if (pr.kind === "replaceWindow") {
    txt = "Move a Wild? A:move B:skip";
  } else if (pr.kind === "respondAction") {
    var col = MC.state.NO_COLOR;
    if (pr.target && pr.target.loc && pr.target.loc.zone === "setProps") {
      var tp = pr.target.loc.p;
      var setI = pr.target.loc.setI;
      var iP = pr.target.loc.i;
      var set = state.players[tp].sets[setI];
      if (set && set.props && set.props[iP]) col = set.props[iP][1];
    }
    txt = "Sly Deal: " + MC.fmt.colorName(col) + " or Just Say No";
  } else {
    txt = "Prompt: " + pr.kind;
  }

  var toast = { id: "prompt", kind: "prompt", text: txt, persistent: true };
  if (idx >= 0) {
    view.toasts[idx] = toast;
    // Keep prompt toast at the top.
    if (idx !== 0) {
      view.toasts.splice(idx, 1);
      view.toasts.unshift(toast);
    }
  } else {
    view.toasts.unshift(toast);
  }
};

MC.ui.syncWinnerToast = function (state, view) {
  if (!state || !view) return;
  var has = (state.winnerP !== MC.state.NO_WINNER);
  var i;
  var idx = -1;
  for (i = 0; i < view.toasts.length; i++) {
    var t = view.toasts[i];
    if (t && t.id === "winner") { idx = i; break; }
  }

  if (!has) {
    if (idx >= 0) view.toasts.splice(idx, 1);
    return;
  }

  var name = (state.winnerP === 0) ? "Player" : "Opponent";
  var toast = { id: "winner", kind: "info", text: "Winner: " + name, persistent: true };
  if (idx >= 0) {
    view.toasts[idx] = toast;
    if (idx !== 0) {
      view.toasts.splice(idx, 1);
      view.toasts.unshift(toast);
    }
  } else {
    view.toasts.unshift(toast);
  }
};

MC.ui.clampI = function (i, n) {
  if (n <= 0) return 0;
  if (i < 0) return 0;
  if (i >= n) return n - 1;
  return i;
};

MC.ui.itemMatchesUidLoc = function (it, uid, loc) {
  if (!it || !it.loc || !loc) return false;
  if (it.uid !== uid) return false;
  if (it.loc.p !== loc.p) return false;
  if (String(it.loc.zone) !== String(loc.zone)) return false;
  if ((it.loc.setI != null) && (loc.setI != null) && it.loc.setI !== loc.setI) return false;
  if ((it.loc.i != null) && (loc.i != null) && it.loc.i !== loc.i) return false;
  return true;
};

MC.ui.wrapI = function (i, n) {
  if (n <= 0) return 0;
  i = i % n;
  if (i < 0) i = i + n;
  return i;
};

// Pick the first item matching a predicate from the given row order.
// Returns { row, i, item } or null.
MC.ui.findBestCursorTarget = function (models, rowOrder, predicate) {
  if (!models) return null;
  rowOrder = rowOrder || [0, 1, 2, 3, 4];
  predicate = predicate || function () { return true; };

  var ri;
  for (ri = 0; ri < rowOrder.length; ri++) {
    var row = rowOrder[ri];
    if (row < 0 || row > 4) continue;

    var rm = models[row];
    if (!rm || !rm.items || rm.items.length === 0) continue;

    var i;
    for (i = 0; i < rm.items.length; i++) {
      var it = rm.items[i];
      if (!it) continue;
      if (!predicate(it)) continue;
      return { row: row, i: i, item: it };
    }
  }
  return null;
};

MC.ui.pickReplaceWindowWild = function (state, computed) {
  var pr = state ? state.prompt : null;
  if (!pr || String(pr.kind || "") !== "replaceWindow" || pr.p !== 0) return null;
  var models = computed ? computed.models : null;
  if (!models) return null;

  var srcSetI = pr.srcSetI;
  var excludeUid = pr.excludeUid;
  return MC.ui.findBestCursorTarget(models, [MC.render.ROW_P_TABLE], function (it) {
    if (!it || it.kind !== "setProp" || !it.loc) return false;
    if (it.loc.p !== 0) return false;
    if (it.loc.zone !== "setProps") return false;
    if (it.loc.setI !== srcSetI) return false;
    if (it.uid === excludeUid) return false;
    var def = MC.state.defByUid(state, it.uid);
    return !!(def && MC.rules.isWildDef(def));
  });
};

MC.ui.cursorMoveTo = function (view, pick) {
  if (!view || !view.cursor || !pick) return;
  view.cursor.row = pick.row;
  view.cursor.i = pick.i;
};

// Directional navigation: pick closest selectable in a direction,
// based on screen-space geometry (includes row camera offsets).

MC.ui.itemScreenCenter = function (view, item) {
  if (!item) return { cx: 0, cy: 0 };
  var row = item.row;
  var cam = view.camX[row];
  var x = item.x - cam;
  var y = item.y;
  var w = item.w;
  var h = item.h;
  return { cx: x + (w / 2), cy: y + (h / 2) };
};

MC.ui.navPickInDirection = function (view, computed, dir) {
  if (!view || !computed || !computed.models) return null;
  if (!computed.selected) return null;

  dir = String(dir || "");
  var cur = computed.selected;
  var curC = MC.ui.itemScreenCenter(view, cur);
  var curCx = curC.cx;
  var curCy = curC.cy;

  var models = computed.models;
  var cand = [];
  var row;
  for (row = 0; row < 5; row++) {
    var rm = models[row];
    if (!rm || !rm.items) continue;
    var i;
    for (i = 0; i < rm.items.length; i++) {
      var it = rm.items[i];
      if (!it) continue;
      if (it === cur) continue;
      var c = MC.ui.itemScreenCenter(view, it);
      cand.push({ row: row, i: i, it: it, cx: c.cx, cy: c.cy });
    }
  }
  if (cand.length === 0) return null;

  function inDir(c) {
    if (dir === "left") return c.cx < curCx;
    if (dir === "right") return c.cx > curCx;
    if (dir === "up") return c.cy < curCy;
    if (dir === "down") return c.cy > curCy;
    return false;
  }

  function scoreCone(c) {
    var dx = c.cx - curCx;
    var dy = c.cy - curCy;
    var along = (dir === "left" || dir === "right") ? Math.abs(dx) : Math.abs(dy);
    var perp = (dir === "left" || dir === "right") ? Math.abs(dy) : Math.abs(dx);
    // Config is validated in tests (avoid runtime fallbacks in the cartridge).
    var uiCfg = MC.config.ui;
    var k = (dir === "left" || dir === "right") ? uiCfg.navConeKLeftRight : uiCfg.navConeKUpDown;
    return (along * along) + (perp * perp) * k;
  }

  // Primary: closest candidate in the pressed direction.
  // For Left/Right, if the current row has any candidates in that direction,
  // prefer staying in-row (prevents surprising jumps to other rows when the
  // center row contains valid left/right targets like deck/discard).
  var preferSameRow = ((dir === "left" || dir === "right") && (cur && cur.row != null));
  var hasSameRowCandidate = false;
  if (preferSameRow) {
    for (j = 0; j < cand.length; j++) {
      var cs = cand[j];
      if (!inDir(cs)) continue;
      if (cs.it && cs.it.row === cur.row) { hasSameRowCandidate = true; break; }
    }
  }

  var best = null;
  var bestScore = 999999999;
  var j;
  for (j = 0; j < cand.length; j++) {
    var c = cand[j];
    if (!inDir(c)) continue;
    if (hasSameRowCandidate && (!c.it || c.it.row !== cur.row)) continue;
    var s = scoreCone(c);
    if (s < bestScore) { bestScore = s; best = c; }
  }
  if (best) return { row: best.row, i: best.i };

  // Fallback: global axis-wrap (pick farthest extreme on the opposite side).
  var extreme = null;
  if (dir === "up") extreme = -Infinity;
  else if (dir === "down") extreme = Infinity;
  else if (dir === "left") extreme = -Infinity;
  else if (dir === "right") extreme = Infinity;

  // Determine extreme along the axis.
  for (j = 0; j < cand.length; j++) {
    var cc = cand[j];
    if (dir === "up") { if (cc.cy > extreme) extreme = cc.cy; }
    else if (dir === "down") { if (cc.cy < extreme) extreme = cc.cy; }
    else if (dir === "left") { if (cc.cx > extreme) extreme = cc.cx; }
    else if (dir === "right") { if (cc.cx < extreme) extreme = cc.cx; }
  }

  best = null;
  bestScore = 999999999;
  for (j = 0; j < cand.length; j++) {
    var cw = cand[j];
    var atExtreme = false;
    if (dir === "up" || dir === "down") atExtreme = (cw.cy === extreme);
    else atExtreme = (cw.cx === extreme);
    if (!atExtreme) continue;
    // Use the same cone scoring to pick the most aligned extreme target.
    var sw = scoreCone(cw);
    if (sw < bestScore) { bestScore = sw; best = cw; }
  }
  if (best) return { row: best.row, i: best.i };

  return null;
};

MC.ui.layoutHint = function (state, view) {
  // Reservation hint: which stacks need an extra slot so ghosts/previews don't overlap.
  // Keep the policy here so buildRowItems + computeRowModels stay consistent.
  var hint = { bankReserve: false, needsExtraSlotBySetI: null, menuHoverCmd: null };
  if (!state || !view) return hint;

  // Targeting mode: reserve for all legal destinations.
  if (view.mode === "targeting" && view.targeting && view.targeting.active && view.targeting.cmds) {
    var needs = {};
    var t = view.targeting;

    // Hold-chain: reserve for the union of destinations across all segments (so bank can be
    // reserved/ghosted even while a cursor-mode segment is active).
    var segs = (t.chainActive && t.chainSegs && t.chainSegs.length) ? t.chainSegs : [{ cmds: t.cmds }];
    var si;
    for (si = 0; si < segs.length; si++) {
      var seg = segs[si];
      if (!seg || !seg.cmds) continue;
      var j;
      for (j = 0; j < seg.cmds.length; j++) {
        var cS = seg.cmds[j];
        var dS = MC.moves.destForCmd(cS);
        if (!dS) continue;
        if (dS.kind === "bankEnd") hint.bankReserve = true;
        if (dS.kind === "setEnd") needs[dS.setI] = true;
      }
    }
    hint.needsExtraSlotBySetI = needs;
    return hint;
  }

  // Menu-hover preview: reserve only when unambiguous (exactly 1 legal cmd).
  if (view.mode === "menu" && view.menu && view.menu.items && view.menu.items.length > 0 && view.menu.src && view.menu.src.uid) {
    var nMenuItems = view.menu.items.length;
    var mi = MC.ui.clampI(view.menu.i, nMenuItems);
    view.menu.i = mi;
    var it = view.menu.items[mi];
    var src = view.menu.src;
    if (!it || !src || !src.uid) return hint;

    var uid = src.uid;
    var kindM = String(it.id || "");
    var profM = MC.cmd.getProfile(kindM);
    if (!profM) return hint;
    if (!profM.menuHoverPreview) return hint;
    var rM = MC.moves.cmdsForTargeting(state, kindM, uid, src.loc || null);
    if (!rM || !rM.cmds) return hint;
    var cmdsM = MC.moves.cmdsWithoutSource(rM.cmds);

    // Only preview when unambiguous (exactly 1 legal cmd). Multi-target actions show "..." and should not
    // imply a default destination highlight while browsing the menu.
    if (cmdsM.length === 1) {
      hint.menuHoverCmd = cmdsM[0];
      var d2 = MC.moves.destForCmd(hint.menuHoverCmd);
      if (d2 && d2.kind === "bankEnd") hint.bankReserve = true;
      if (d2 && d2.kind === "setEnd") {
        var needs2 = {};
        needs2[d2.setI] = true;
        hint.needsExtraSlotBySetI = needs2;
      }
    }
  }

  return hint;
};

MC.ui.buildRowItems = function (state, view, row, hint) {
  var L = MC.config.render.layout;

  var out = { items: [], minX: 0, maxX: 0 };
  var isOp = MC.layout.isOpponentRow(row);
  var p = MC.layout.playerForRow(row);
  var yFace = MC.layout.faceYForRow(row);
  var padX = L.rowPadX;

  var i;

  if (row === 4 || row === 0) {
    // Hand row: hand cards + bank stack on opposite side.
    var hand = state.players[p].hand;
    var bank = state.players[p].bank;
    var nHand = hand.length;
    var nBank = bank.length;
    var minX = 999999, maxX = -999999;
    out.stacks = {};

    function pushHandRowItem(kind, uid, xFace, depth, fanDir) {
      out.items.push({
        kind: kind,
        row: row,
        p: p,
        uid: uid,
        depth: depth,
        fanDir: fanDir,
        x: xFace,
        y: yFace,
        w: L.faceW,
        h: L.faceH,
        loc: (kind === "hand") ? { p: p, zone: "hand", i: depth } : ((kind === "bank") ? { p: p, zone: "bank", i: depth } : null),
        stackKey: (kind === "bank") ? ("bank:p" + p + ":row" + row) : null
      });
      var xLo = xFace;
      var xHi = xFace + L.faceW - 1;
      // Include 1px shadow pixels that can be drawn outside the face.
      if (kind === "hand") {
        xLo = xFace + L.shadowBarDx;
      } else if (kind === "bank") {
        if (fanDir < 0) xHi = xFace + L.faceW;
        else xLo = xFace + L.shadowBarDx;
      }
      if (xLo < minX) minX = xLo;
      if (xHi > maxX) maxX = xHi;
    }

    function pushRecvHandItem(uid, xFace, depth) {
      out.items.push({
        kind: "hand",
        row: row,
        p: p,
        uid: uid,
        depth: depth,
        fanDir: isOp ? -1 : 1,
        x: xFace,
        y: yFace,
        w: L.faceW,
        h: L.faceH,
        loc: { p: p, zone: "recvProps", i: depth },
        stackKey: "recvProps:p" + p + ":row" + row
      });
      var xLo = xFace + L.shadowBarDx;
      var xHi = xFace + L.faceW - 1;
      if (xLo < minX) minX = xLo;
      if (xHi > maxX) maxX = xHi;
    }

    // Hand zone (spaced).
    var pr = state.prompt;
    var isRecvPrompt = !!(pr && pr.kind === "placeReceived" && pr.p === p);
    var recv = isRecvPrompt ? pr.uids : null;
    var nRecv = recv ? recv.length : 0;

    var xHandStart = isOp ? (L.screenW - padX - L.faceW) : padX;
    var handStep = isOp ? (-L.handStrideX) : L.handStrideX;

    if (!isOp && isRecvPrompt && nRecv > 0) {
      for (i = 0; i < nRecv; i++) {
        pushRecvHandItem(recv[i], padX + i * L.handStrideX, i);
      }
      var recvW = (nRecv > 0) ? ((nRecv - 1) * L.handStrideX + L.faceW) : 0;
      xHandStart = padX + recvW + L.stackGapX + 2;
    } else if (isOp && isRecvPrompt && nRecv > 0) {
      var xRecvStart = xHandStart;
      for (i = 0; i < nRecv; i++) {
        pushRecvHandItem(recv[i], xRecvStart - i * L.handStrideX, i);
      }
      var recvW2 = (nRecv > 0) ? ((nRecv - 1) * L.handStrideX + L.faceW) : 0;
      xHandStart = xRecvStart - recvW2 - L.stackGapX - 2;
    }

    for (i = 0; i < nHand; i++) {
      var uidH = hand[i];
      pushHandRowItem("hand", uidH, xHandStart + i * handStep, i, 0);
    }

    // Bank zone (overlapped stack), opposite side.
    var stride = L.stackStrideX;
    var gap = L.stackGapX;

    if (!isOp) {
      // Player bank: fan right, anchored on the right.
      var bankRightX = L.screenW - padX - L.faceW;
      // Reserve one extra slot when a bank destination is being indicated (ghost/preview),
      // so the "new top" location doesn't overlap the current top card.
      var bankReserve = !!(hint && hint.bankReserve);
      var bankLeftX = bankRightX - (nBank > 0 ? (((nBank - 1) + (bankReserve ? 1 : 0)) * stride) : 0);
      var handMaxX = (nHand > 0) ? (xHandStart + (nHand - 1) * L.handStrideX + L.faceW - 1) : (padX - 1);
      if (nBank > 0 && bankLeftX <= (handMaxX + gap)) bankLeftX = handMaxX + gap + 1;
      var bankKey = "bank:p" + p + ":row" + row;
      if (nBank > 0 || bankReserve) {
        out.stacks[bankKey] = { kind: "bank", x0: bankLeftX, y: yFace, stride: stride, fanDir: 1, nReal: nBank, nSlots: nBank + (bankReserve ? 1 : 0) };
      }
      for (i = 0; i < nBank; i++) {
        pushHandRowItem("bank", bank[i], bankLeftX + i * stride, i, 1);
      }
    } else {
      // Opponent bank: fan left, anchored on the left.
      var bankLeftX2 = padX;
      var bankRightX2 = bankLeftX2 + (nBank > 0 ? ((nBank - 1) * stride) : 0);
      var handMinX = (nHand > 0) ? (xHandStart + (nHand - 1) * handStep) : (xHandStart + 1);
      var bankMaxX = bankRightX2 + L.faceW - 1;
      if (nBank > 0 && (bankMaxX + gap) >= handMinX) {
        var desiredBankMax = handMinX - gap - 1;
        bankRightX2 = desiredBankMax - (L.faceW - 1);
      }
      var bankKey2 = "bank:p" + p + ":row" + row;
      if (nBank > 0) {
        out.stacks[bankKey2] = { kind: "bank", x0: bankRightX2, y: yFace, stride: stride, fanDir: -1, nReal: nBank, nSlots: nBank };
      }
      for (i = 0; i < nBank; i++) {
        pushHandRowItem("bank", bank[i], bankRightX2 - i * stride, i, -1);
      }
    }

    out.minX = (minX === 999999) ? 0 : minX;
    out.maxX = (maxX === -999999) ? 0 : maxX;
    out.items.sort(function (a, b) {
      var ax = (a && a.x != null) ? a.x : 0;
      var bx = (b && b.x != null) ? b.x : 0;
      var dx = ax - bx;
      if (dx) return dx;
      var ay = (a && a.y != null) ? a.y : 0;
      var by = (b && b.y != null) ? b.y : 0;
      return ay - by;
    });
    return out;
  }

  if (row === 3 || row === 1) {
    // Table row: property sets (with house as last card in stack).
    var sets = state.players[p].sets;
    var setCount = sets.length;
    var stride2 = L.stackStrideX;
    var minX2 = 999999, maxX2 = -999999;
    var fanDir = isOp ? -1 : 1;
    out.stacks = {};

    if (!isOp) {
      // While targeting, ghost destinations may include an extra slot at the end of a stack.
      // Reserve width so adjacent stacks shift and ghosts/previews don't overlap.
      var needsExtraSlot = (hint && hint.needsExtraSlotBySetI) ? hint.needsExtraSlotBySetI : {};

      var cursorX = padX;
      for (i = 0; i < setCount; i++) {
        var set = sets[i];
        if (!set) continue;
        var cards = [];
        var k;
        for (k = 0; k < set.props.length; k++) cards.push({ kind: "setProp", setI: i, depth: k, uid: set.props[k][0], color: set.props[k][1] });
        if (set.houseUid) cards.push({ kind: "setHouse", setI: i, depth: cards.length, uid: set.houseUid });

        var nCards = cards.length;
        if (nCards <= 0) continue;
        var stackKey = "set:p" + p + ":set" + i;
        out.stacks[stackKey] = { kind: "set", x0: cursorX, y: yFace, stride: stride2, fanDir: fanDir, nReal: nCards, nSlots: nCards + (needsExtraSlot[i] ? 1 : 0) };

        var depth;
        for (depth = 0; depth < nCards; depth++) {
          var xFaceP = cursorX + depth * stride2;
          out.items.push({
            kind: cards[depth].kind,
            row: row,
            p: p,
            uid: cards[depth].uid,
            color: cards[depth].color,
            setI: cards[depth].setI,
            depth: cards[depth].depth,
            fanDir: fanDir,
            stackKey: stackKey,
            x: xFaceP,
            y: yFace,
            w: L.faceW,
            h: L.faceH,
            loc: (cards[depth].kind === "setProp")
              ? { p: p, zone: "setProps", setI: cards[depth].setI, i: cards[depth].depth }
              : { p: p, zone: "setHouse", setI: cards[depth].setI }
          });
          var xLoP = xFaceP;
          var xHiP = xFaceP + L.faceW - 1;
          if (fanDir > 0) xLoP = xFaceP + L.shadowBarDx;
          else xHiP = xFaceP + L.faceW;
          if (xLoP < minX2) minX2 = xLoP;
          if (xHiP > maxX2) maxX2 = xHiP;
        }

        var stackW = L.faceW + (nCards - 1) * stride2;
        if (needsExtraSlot[i]) stackW += stride2;
        cursorX = cursorX + stackW + L.stackGapX;
      }
      out.newSetX = cursorX;
    } else {
      var rightCursor = L.screenW - padX - L.faceW;
      for (i = 0; i < setCount; i++) {
        var setO = sets[i];
        if (!setO) continue;
        var cardsO = [];
        var kk;
        for (kk = 0; kk < setO.props.length; kk++) cardsO.push({ kind: "setProp", setI: i, depth: kk, uid: setO.props[kk][0], color: setO.props[kk][1] });
        if (setO.houseUid) cardsO.push({ kind: "setHouse", setI: i, depth: cardsO.length, uid: setO.houseUid });

        var nCardsO = cardsO.length;
        if (nCardsO <= 0) continue;
        var stackKeyO = "set:p" + p + ":set" + i;
        out.stacks[stackKeyO] = { kind: "set", x0: rightCursor, y: yFace, stride: stride2, fanDir: fanDir, nReal: nCardsO, nSlots: nCardsO };

        var d2;
        for (d2 = 0; d2 < nCardsO; d2++) {
          var xFaceO = rightCursor - d2 * stride2;
          out.items.push({
            kind: cardsO[d2].kind,
            row: row,
            p: p,
            uid: cardsO[d2].uid,
            color: cardsO[d2].color,
            setI: cardsO[d2].setI,
            depth: cardsO[d2].depth,
            fanDir: fanDir,
            stackKey: stackKeyO,
            x: xFaceO,
            y: yFace,
            w: L.faceW,
            h: L.faceH,
            loc: (cardsO[d2].kind === "setProp")
              ? { p: p, zone: "setProps", setI: cardsO[d2].setI, i: cardsO[d2].depth }
              : { p: p, zone: "setHouse", setI: cardsO[d2].setI }
          });
          var xLoO = xFaceO;
          var xHiO = xFaceO + L.faceW - 1;
          if (fanDir > 0) xLoO = xFaceO + L.shadowBarDx;
          else xHiO = xFaceO + L.faceW;
          if (xLoO < minX2) minX2 = xLoO;
          if (xHiO > maxX2) maxX2 = xHiO;
        }

        var leftEdge = rightCursor - (nCardsO - 1) * stride2;
        rightCursor = leftEdge - L.stackGapX - L.faceW;
      }
    }

    out.minX = (minX2 === 999999) ? 0 : minX2;
    out.maxX = (maxX2 === -999999) ? 0 : maxX2;
    out.items.sort(function (a, b) {
      var ax = (a && a.x != null) ? a.x : 0;
      var bx = (b && b.x != null) ? b.x : 0;
      var dx = ax - bx;
      if (dx) return dx;
      var ay = (a && a.y != null) ? a.y : 0;
      var by = (b && b.y != null) ? b.y : 0;
      return ay - by;
    });
    return out;
  }

  if (row === 2) {
    // Center row: deck, discard, and UI buttons.
    var C = MC.config.render.layout;
    var top = C.rowY[2] + C.centerTopInsetY;
    var deckX = C.centerDeckX;
    var gapX = C.centerPileGapX;
    var x0 = deckX;
    out.items.push({ kind: "deck", row: 2, x: x0, y: top, w: C.faceW, h: C.faceH });
    out.items.push({ kind: "discard", row: 2, x: x0 + C.faceW + gapX, y: top, w: C.faceW, h: C.faceH });

    var dbgEnabled = !!(MC.config.debug.enabled && MC.debug.toolsOn);

    // Hide buttons while an overlay is active (menu/targeting).
    // Inspect should keep buttons visible/selectable so they can be inspected too.
    var overlayActive = !!(view && (view.mode === "menu" || view.mode === "targeting"));
    if (!overlayActive) {
      // Right-side vertical strip.
      //
      // Original layout: End/Step/Reset/Next were 10px tall with 1px gaps and filled the full
      // center row. Menu is below End; in dev mode this intentionally spills below the center
      // row band (acceptable dev-only overlap).
      var stripW = C.centerBtnStripW;
      var stripH = 10;
      var stripX = C.screenW - C.centerBtnStripPadRight - stripW;
      var stripY0 = C.rowY[2];

      function pushBtn(id, label, y, disabled) {
        out.items.push({ kind: "btn", id: id, label: label, disabled: !!disabled, row: 2, x: stripX, y: y, w: stripW, h: stripH });
      }

      // End is always available on your turn; if hand > HAND_MAX the engine enters a discard-down prompt.
      var endDisabled = (state.winnerP !== MC.state.NO_WINNER) || (state.activeP !== 0);
      pushBtn("endTurn", "End", stripY0, endDisabled);
      pushBtn("mainMenu", "Menu", stripY0 + 11, false);
      if (dbgEnabled) {
        // Game over: Step would attempt to mutate state via debugStep and can throw.
        // Keep Reset/Next available for recovery.
        pushBtn("step", "Step", stripY0 + 22, (state.winnerP !== MC.state.NO_WINNER));
        pushBtn("reset", "Reset", stripY0 + 33, false);
        pushBtn("nextScenario", "Next", stripY0 + 44, false);
      }
    }

    out.minX = 0;
    out.maxX = C.screenW - 1;
    out.items.sort(function (a, b) {
      var ax = (a && a.x != null) ? a.x : 0;
      var bx = (b && b.x != null) ? b.x : 0;
      var dx = ax - bx;
      if (dx) return dx;
      var ay = (a && a.y != null) ? a.y : 0;
      var by = (b && b.y != null) ? b.y : 0;
      return ay - by;
    });
    return out;
  }

  return out;
};

MC.ui.computeRowModels = function (state, view) {
  var hint = MC.ui.layoutHint(state, view);
  var models = [
    MC.ui.buildRowItems(state, view, 0, hint),
    MC.ui.buildRowItems(state, view, 1, hint),
    MC.ui.buildRowItems(state, view, 2, hint),
    MC.ui.buildRowItems(state, view, 3, hint),
    MC.ui.buildRowItems(state, view, 4, hint)
  ];

  // Render overlays (ghosts/previews) live alongside row models, not in the renderer.
  var ri;
  for (ri = 0; ri < models.length; ri++) models[ri].overlayItems = [];

  // Small render meta so the renderer doesn't have to rediscover intent.
  var meta = { hideSrc: null, focus: null };

  // Clamp cursor to existing rows/items.
  if (!view || !view.cursor) return { models: models, selected: null, meta: meta };
  var row = view.cursor.row;
  if (row < 0) row = 0;
  if (row > 4) row = 4;
  view.cursor.row = row;

  var rm = models[row];
  var n = (rm && rm.items) ? rm.items.length : 0;
  view.cursor.i = MC.ui.clampI(view.cursor.i, n);

  var sel = (rm && rm.items && rm.items.length) ? rm.items[view.cursor.i] : null;

  // Note: cursor relocation off empty selections is handled by MC.ui.focus.preserve().

  var L = MC.config.render.layout;
  var yTable = MC.layout.faceYForRow(3);

  function pushOverlay(row0, it0) {
    if (row0 == null) return;
    var rm0 = models[row0];
    if (!rm0 || !rm0.overlayItems) return;
    rm0.overlayItems.push(it0);
  }

  function findItemByUidLoc(uid, loc) {
    if (!uid || !loc) return null;
    var row;
    for (row = 0; row < models.length; row++) {
      var rm = models[row];
      if (!rm || !rm.items) continue;
      var i;
      for (i = 0; i < rm.items.length; i++) {
        var it = rm.items[i];
        if (!it || it.uid !== uid || !it.loc) continue;
        if (it.loc.p !== loc.p) continue;
        if (String(it.loc.zone) !== String(loc.zone)) continue;
        if ((it.loc.setI != null) && (loc.setI != null) && it.loc.setI !== loc.setI) continue;
        if ((it.loc.i != null) && (loc.i != null) && it.loc.i !== loc.i) continue;
        return it;
      }
    }
    return null;
  }

  function stackX(st, depth) {
    if (!st) return 0;
    return st.x0 + depth * st.stride * st.fanDir;
  }

  function tableStack(setI) {
    var rmTable = models[MC.render.ROW_P_TABLE];
    var stacks = (rmTable && rmTable.stacks) ? rmTable.stacks : null;
    return stacks ? stacks["set:p0:set" + setI] : null;
  }

  function slotNewSet() {
    var rmTable = models[MC.render.ROW_P_TABLE];
    var newSetX = (rmTable && rmTable.newSetX != null) ? rmTable.newSetX : L.rowPadX;
    return { row: 3, x: newSetX, y: yTable, stackKey: "newSet:p0:row3", depth: 0 };
  }

  function slotSetEnd(setI) {
    var st = tableStack(setI);
    if (!st) return null;
    return { row: 3, x: stackX(st, st.nReal), y: st.y, stackKey: "set:p0:set" + setI, depth: st.nReal };
  }

  function slotSetTop(setI) {
    var st = tableStack(setI);
    if (!st || st.nReal <= 0) return null;
    return { row: 3, x: stackX(st, st.nReal - 1), y: st.y, stackKey: "set:p0:set" + setI, depth: st.nReal };
  }

  function slotBankEnd() {
    var rmHand = models[MC.render.ROW_P_HAND];
    var bankSt = (rmHand && rmHand.stacks) ? rmHand.stacks["bank:p0:row4"] : null;
    if (!bankSt) return null;
    return { row: 4, x: stackX(bankSt, bankSt.nReal), y: bankSt.y, stackKey: "bank:p0:row4", depth: bankSt.nReal };
  }

  function slotForCmd(cmd, srcSlot) {
    var d = MC.moves.destForCmd(cmd);
    if (!d) return null;
    if (d.kind === "newSet") return slotNewSet();
    if (d.kind === "setEnd") return slotSetEnd(d.setI);
    if (d.kind === "setTop") return slotSetTop(d.setI);
    if (d.kind === "bankEnd") return slotBankEnd();
    if (d.kind === "source") return srcSlot || null;
    return null;
  }

  function pushGhost(slot) {
    if (!slot) return;
    pushOverlay(slot.row, { kind: "ghost", x: slot.x, y: slot.y, stackKey: slot.stackKey, depth: slot.depth });
  }

  function setFocus(slot, uid, color, forCmdKind, focusSrcGhost) {
    if (!slot) return;
    meta.focus = {
      kind: "preview",
      row: slot.row,
      forCmdKind: forCmdKind,
      focusSrcGhost: !!focusSrcGhost,
      uid: uid,
      color: color,
      x: slot.x,
      y: slot.y,
      w: L.faceW,
      h: L.faceH,
      stackKey: slot.stackKey,
      depth: slot.depth
    };
    pushOverlay(slot.row, meta.focus);
  }

  function previewForCmd(cmd, srcSlot, card) {
    if (!cmd || !cmd.kind) return null;
    var slot = slotForCmd(cmd, srcSlot);
    if (!slot) return null;
    var prev = MC.cmd.previewForCmd(state, cmd, card);
    if (!prev) return null;
    return { slot: slot, uid: prev.uid, color: prev.color, forCmdKind: prev.forCmdKind, focusSrcGhost: prev.focusSrcGhost };
  }

  function setFocusForCmd(cmd, srcSlot, card) {
    var prev = previewForCmd(cmd, srcSlot, card);
    if (!prev) return;
    setFocus(prev.slot, prev.uid, prev.color, prev.forCmdKind, prev.focusSrcGhost);
  }

  // Targeting overlays: ghosts + preview-in-stack for the selected destination.
  if (view.mode === "targeting" && view.targeting && view.targeting.active) {
    var t = view.targeting;
    var cmds = t.cmds;
    var cmdI = MC.ui.clampI(t.cmdI, cmds.length);
    t.cmdI = cmdI;
    var cmdSel0 = (cmds && cmds.length) ? cmds[cmdI] : null;
    var profT = MC.cmd.getProfile(t.kind);
    var uiT = (profT && profT.ui) ? profT.ui : null;
    var uiMode = (uiT && uiT.mode) ? String(uiT.mode) : "preview";
    var isCursorMode = (uiMode === "cursor");
    var isSourceSel = !!(cmdSel0 && cmdSel0.kind === "source");

    // Find source slot in models (for hold-targeting Source destination).
    var srcX = null, srcY = null, srcRow = null;
    if (t.card && t.card.uid && t.card.loc) {
      var srcLoc = t.card.loc;
      var z = String(srcLoc.zone || "");
      if (z === "hand" || z === "recvProps") {
        var rowHand = MC.render.ROW_P_HAND;
        var rmHand = models[rowHand];
        if (rmHand && rmHand.items) {
          var hi;
          for (hi = 0; hi < rmHand.items.length; hi++) {
            var itH = rmHand.items[hi];
            if (!itH || itH.kind !== "hand" || !itH.loc) continue;
            if (itH.loc.p !== srcLoc.p) continue;
            if (String(itH.loc.zone) !== String(srcLoc.zone)) continue;
            if (itH.loc.i !== srcLoc.i) continue;
            if (itH.uid !== t.card.uid) continue;
            srcX = itH.x;
            srcY = itH.y;
            srcRow = rowHand;
            break;
          }
        }
      } else {
        // Generic fallback: locate source in current models (supports setProps moveWild targeting).
        var itSrc = findItemByUidLoc(t.card.uid, srcLoc);
        if (itSrc) {
          srcX = itSrc.x;
          srcY = itSrc.y;
          srcRow = itSrc.row;
        }
      }
    }

    // While targeting, hide the source card so the source slot can be represented by a ghost/preview.
    // Exception: when the selected destination is Source, show the real source card + normal highlight.
    if (!isSourceSel) if (t.card && t.card.uid && t.card.loc && (t.card.loc.zone === "hand" || t.card.loc.zone === "recvProps" || t.card.loc.zone === "setProps")) {
      meta.hideSrc = { uid: t.card.uid, loc: t.card.loc };
    }

    var srcSlot = (srcX != null && srcY != null && srcRow != null)
      ? { row: srcRow, x: srcX, y: srcY, stackKey: "overlay:src:row" + srcRow, depth: 0 }
      : null;

    // Hold-chain: ghost non-selected segment destinations so the player can see the full cycle
    // (e.g. Sly targets while Bank segment exists, or Rent sets while Bank segment exists).
    if (t.chainActive && t.chainSegs && t.chainSegs.length) {
      var sgi;
      for (sgi = 0; sgi < t.chainSegs.length; sgi++) {
        var segG = t.chainSegs[sgi];
        if (!segG || !segG.kind || !segG.cmds) continue;
        var kindG = String(segG.kind);
        if (kindG === String(t.kind || "")) continue;
        if (kindG === "source") continue;

        var profG = MC.cmd.getProfile(kindG);
        var uiG = (profG && profG.ui) ? profG.ui : null;
        var modeG = (uiG && uiG.mode) ? String(uiG.mode) : "preview";
        if (modeG === "cursor") continue; // cursor-mode cross-ghosting handled separately (optional)

        var ciG;
        for (ciG = 0; ciG < segG.cmds.length; ciG++) {
          var cmdG = segG.cmds[ciG];
          if (!cmdG || !cmdG.kind) continue;
          pushGhost(slotForCmd(cmdG, srcSlot));
        }
      }
    }

    if (isCursorMode) {
      // Cursor-moving targeting: no preview card (avoid “two cursors” look). Cursor moves to the target instead.
      // Source slot is still represented by a ghost when the real source card is hidden.
      if (meta.hideSrc && srcRow != null && srcX != null && srcY != null) {
        pushOverlay(srcRow, { kind: "ghost", x: srcX, y: srcY, stackKey: "overlay:src:row" + srcRow, depth: 0 });
      }

      // Optional: ghost outlines for non-selected targets.
      var showGhosts = !!MC.config.ui.slyShowTargetGhosts;
      if (showGhosts && cmds && cmds.length && uiT && uiT.findItemForCmd) {
        var ctxC = { state: state, view: view, computed: computed };
        var jS;
        for (jS = 0; jS < cmds.length; jS++) {
          var cS = cmds[jS];
          if (!cS || cS.kind === "source") continue;
          if (!isSourceSel && jS === cmdI) continue;
          var pick = uiT.findItemForCmd(ctxC, cS);
          if (!pick || !pick.item) continue;
          var itT = pick.item;
          // Draw the outline late so it stays readable.
          pushOverlay(itT.row, { kind: "ghost", x: itT.x, y: itT.y, stackKey: itT.stackKey, depth: (itT.depth != null ? itT.depth + 100 : 100) });
        }
      }
    } else {
      // Ghosts for all non-selected legal destinations in this targeting mode.
      var hasSourceCmd = false;
      var j;
      for (j = 0; j < cmds.length; j++) if (cmds[j] && cmds[j].kind === "source") { hasSourceCmd = true; break; }

      for (j = 0; j < cmds.length; j++) {
        if (j === cmdI) continue;
        var c = cmds[j];
        if (!c || !c.kind) continue;
        pushGhost(slotForCmd(c, srcSlot));
      }

      // Preview-in-stack for selected destination. If Source is selected, rely on the real card + highlight
      // (otherwise we would double-render the same card at the same position).
      var cmdSel = cmds[cmdI];
      if (cmdSel && cmdSel.kind !== "source") {
        setFocusForCmd(cmdSel, srcSlot, { uid: (t.card && t.card.uid) ? t.card.uid : 0, def: (t.card && t.card.def) ? t.card.def : null, wildColor: t.wildColor });
      }

      // If the selected destination previews the same uid elsewhere, ensure the source slot is still readable.
      // (This keeps menu-targeting and recvProps placement consistent with hold-targeting: source becomes a ghost.)
      if (
        t.card &&
        t.card.uid &&
        srcX != null &&
        srcY != null &&
        srcRow != null &&
        meta.focus &&
        (meta.focus.uid === t.card.uid || meta.focus.focusSrcGhost) &&
        !hasSourceCmd
      ) {
        pushOverlay(srcRow, { kind: "ghost", x: srcX, y: srcY, stackKey: "overlay:src:row" + srcRow, depth: 0 });
      }
    }
  }

  // Menu-hover destination preview (only when unambiguous).
  if (!meta.focus && view.mode === "menu" && view.menu && view.menu.items && view.menu.items.length > 0 && view.menu.src) {
    var srcM = view.menu.src;
    var uidM = (srcM && srcM.uid) ? srcM.uid : 0;
    var cm = (hint && hint.menuHoverCmd) ? hint.menuHoverCmd : null;
    if (uidM && cm) {
      if (cm.kind === "playSlyDeal" && cm.target && cm.target.loc) {
        // Cursor-mode menu hover preview: highlight the (single) target and ghost the source card.
        var itT = findItemByUidLoc(cm.target.uid, cm.target.loc);
        // Reuse preview overlay to get the standard yellow highlight (no new overlay kinds).
        if (itT) {
          var slotT = { row: itT.row, x: itT.x, y: itT.y, stackKey: itT.stackKey, depth: (itT.depth != null ? itT.depth + 100 : 100) };
          setFocus(slotT, cm.target.uid, null, "playSlyDeal", false);
        }

        if (srcM.uid && srcM.loc && (srcM.loc.zone === "hand" || srcM.loc.zone === "recvProps")) {
          meta.hideSrc = { uid: srcM.uid, loc: srcM.loc };
          var rowHandS = MC.render.ROW_P_HAND;
          var rmHandS = models[rowHandS];
          if (rmHandS && rmHandS.items) {
            var hiS;
            for (hiS = 0; hiS < rmHandS.items.length; hiS++) {
              var itHS = rmHandS.items[hiS];
              if (!itHS || itHS.kind !== "hand" || !itHS.loc) continue;
              if (itHS.uid !== uidM) continue;
              if (itHS.loc.p !== srcM.loc.p) continue;
              if (String(itHS.loc.zone) !== String(srcM.loc.zone)) continue;
              if (itHS.loc.i !== srcM.loc.i) continue;
              models[rowHandS].overlayItems.push({ kind: "ghost", x: itHS.x, y: itHS.y, stackKey: "overlay:menuSrc:row" + rowHandS, depth: 0 });
              break;
            }
          }
        }
      } else {
        var defM = MC.state.defByUid(state, uidM);
        setFocusForCmd(cm, null, { uid: uidM, def: defM, wildColor: (defM && MC.rules.isWildDef(defM)) ? cm.color : null });
      }
    }

    // When menu hover produces a preview of the same uid (or Rent preview where the preview card differs),
    // ghost the source slot so it doesn't look duplicated.
    if (meta.focus && uidM && srcM && srcM.loc && (meta.focus.uid === uidM || meta.focus.focusSrcGhost)) {
      if (srcM.uid && srcM.loc && (srcM.loc.zone === "hand" || srcM.loc.zone === "recvProps")) {
        meta.hideSrc = { uid: srcM.uid, loc: srcM.loc };
      }
      var rowHandM = MC.render.ROW_P_HAND;
      var rmHandM = models[rowHandM];
      if (rmHandM && rmHandM.items) {
        var hiM;
        for (hiM = 0; hiM < rmHandM.items.length; hiM++) {
          var itHM = rmHandM.items[hiM];
          if (!itHM || itHM.kind !== "hand" || !itHM.loc) continue;
          if (itHM.uid !== uidM) continue;
          if (itHM.loc.p !== srcM.loc.p) continue;
          if (String(itHM.loc.zone) !== String(srcM.loc.zone)) continue;
          if (itHM.loc.i !== srcM.loc.i) continue;
          models[rowHandM].overlayItems.push({ kind: "ghost", x: itHM.x, y: itHM.y, stackKey: "overlay:menuSrc:row" + rowHandM, depth: 0 });
          break;
        }
      }
    }
  }

  // RespondAction prompt: keep a ghost outline on the forced target when cursor is away.
  var pr = state ? state.prompt : null;
  if (pr && pr.kind === "respondAction" && pr.p === 0 && pr.target && pr.target.loc) {
    var tgt = pr.target;
    var onTarget = false;
    if (sel && sel.loc) {
      onTarget = MC.ui.itemMatchesUidLoc(sel, tgt.uid, tgt.loc);
    }
    if (!onTarget) {
      var itT2 = findItemByUidLoc(tgt.uid, tgt.loc);
      if (itT2) {
        pushOverlay(itT2.row, { kind: "ghost", x: itT2.x, y: itT2.y, stackKey: itT2.stackKey, depth: (itT2.depth != null ? itT2.depth + 100 : 100) });
      }
    }
  }

  // Visualize the pay/transfer buffer as a non-selectable center-row stack.
  // - During payDebt: show prompt.buf (what has been committed so far).
  // - While draining: show view.anim.payBufUids even after the prompt clears.
  var payBufUids = null;
  if (pr && pr.kind === "payDebt" && pr.buf && pr.buf.length > 0) {
    payBufUids = pr.buf.slice();
  } else if (view.anim.payBufUids.length > 0) {
    payBufUids = view.anim.payBufUids.slice();
  }

  if (payBufUids && payBufUids.length > 0) {
    var rowCenter2 = MC.render.ROW_CENTER;
    var rmCenter2 = models[rowCenter2];
    if (rmCenter2 && rmCenter2.overlayItems) {
      var topC = L.rowY[rowCenter2] + L.centerTopInsetY;
      rmCenter2.overlayItems.push({
        kind: "payBuf",
        row: rowCenter2,
        x: L.centerPayBufX,
        y: topC,
        w: L.faceW,
        h: L.faceH,
        uids: payBufUids,
        nVis: payBufUids.length
      });
    }
  }

  var computed = { models: models, selected: sel, meta: meta };
  computed = MC.anim.present(state, view, computed) || computed;

  // Snapshot last-seen screen-space positions for transfer animations.
  if (view && view.anim && view.anim.lastPosByUid && computed && computed.models) {
    var posByUid = view.anim.lastPosByUid;
    var k;
    for (k in posByUid) delete posByUid[k];

    var row;
    for (row = 0; row < computed.models.length; row++) {
      var rmSnap = computed.models[row];
      if (!rmSnap || !rmSnap.items) continue;
      var camSnap = (view.camX && view.camX[row] != null) ? view.camX[row] : 0;
      var iSnap;
      for (iSnap = 0; iSnap < rmSnap.items.length; iSnap++) {
        var itSnap = rmSnap.items[iSnap];
        if (!itSnap || !itSnap.uid) continue;
        posByUid[itSnap.uid] = { x: (itSnap.x - camSnap), y: itSnap.y, row: row };
      }
    }
  }

  return computed;
};

MC.ui.ensureCamForSelection = function (rowModel, row, selItem, camArr) {
  var L = MC.config.render.layout;
  if (!camArr) return;

  var cam = camArr[row];
  var margin = L.camMarginX;

  if (!rowModel || !rowModel.items || rowModel.items.length === 0 || !selItem) {
    camArr[row] = 0;
    return;
  }

  var contentW = (rowModel.maxX - rowModel.minX + 1);
  if (contentW <= L.screenW) { camArr[row] = 0; return; }

  var x0 = selItem.x;
  var x1 = selItem.x + selItem.w - 1;
  var maxVisibleX = (L.screenW - 1 - margin);

  if ((x0 - cam) < margin) cam = (x0 - margin);
  if ((x1 - cam) > maxVisibleX) cam = (x1 - maxVisibleX);

  var camA = (rowModel.minX - margin);
  var camB = (rowModel.maxX - maxVisibleX);
  var camLo = camA < camB ? camA : camB;
  var camHi = camA < camB ? camB : camA;
  if (cam < camLo) cam = camLo;
  if (cam > camHi) cam = camHi;

  camArr[row] = Math.floor(cam);
};

MC.ui.updateCameras = function (state, view, computed) {
  if (!view || !view.camX) return;
  if (!computed || !computed.models) return;

  var models = computed.models;
  var row;
  for (row = 0; row < 5; row++) {
    if (!(row === 0 || row === 1 || row === 3 || row === 4)) continue;

    // Default selection is the cursor selection when in that row.
    var selItem = null;
    if (view.cursor.row === row) {
      var rm = models[row];
      if (rm && rm.items && rm.items.length) {
        var i = MC.ui.clampI(view.cursor.i, rm.items.length);
        selItem = rm.items[i];
      }
    } else {
      // For non-active rows, use first item to keep cam stable.
      var rm2 = models[row];
      if (rm2 && rm2.items && rm2.items.length) selItem = rm2.items[0];
    }

    // In overlay modes, have the preview destination row camera follow the preview.
    if ((view.mode === "targeting" || view.mode === "menu") && computed.meta && computed.meta.focus && row === computed.meta.focus.row) selItem = computed.meta.focus;

    MC.ui.ensureCamForSelection(models[row], row, selItem, view.camX);
  }
};

MC.ui.menuOpenForSelection = function (state, view, sel) {
  if (!view || !view.menu) return;
  if (state && state.winnerP !== MC.state.NO_WINNER) return;
  view.menu.items = [];
  view.menu.i = 0;
  view.menu.src = sel ? { row: sel.row, i: view.cursor.i, uid: sel.uid, loc: sel.loc || null } : null;

  if (!sel || !sel.loc) return;
  var zSel = String(sel.loc.zone || "");
  if (!(zSel === "hand" || zSel === "recvProps")) return;
  if (sel.loc.p !== 0) return;

  var uid = sel.uid;
  var kinds = MC.cmd.menuKinds;
  var iKind;
  for (iKind = 0; iKind < kinds.length; iKind++) {
    var kind = kinds[iKind];
    var prof = MC.cmd.getProfile(kind);
    if (!prof) continue;

    var r = MC.moves.cmdsForTargeting(state, kind, uid, sel.loc || null);
    if (!r || !r.cmds) continue;
    var realCmds = MC.moves.cmdsWithoutSource(r.cmds);
    if (!realCmds || realCmds.length === 0) continue; // actionable-only

    var label = prof.menuLabel(state, realCmds);
    view.menu.items.push({ id: kind, label: label });
  }

  // Explicit cancel option so A-confirm can cancel too (in addition to B).
  // Only add when there's at least one actionable item; otherwise let callers treat it as "no actions".
  if (view.menu.items.length > 0) view.menu.items.push({ id: "source", label: "Cancel" });

  // Always allow cancel/back with B; no explicit menu item needed.
};

MC.ui.targetingEnter = function (state, view, kind, hold, uid, loc) {
  if (!view || !view.targeting) return;
  var t = view.targeting;
  t.active = true;
  t.kind = String(kind || "");
  t._profileSorted = false;
  t._profileSyncCmdI = -1;
  t.hold = !!hold;
  t.cmds = [];
  t.cmdI = 0;
  t.chainActive = false;
  t.chainSegs = [];
  t.chainI = 0;
  t.srcCursor = { row: view.cursor ? view.cursor.row : 4, i: view.cursor ? view.cursor.i : 0 };

  var def = MC.state.defByUid(state, uid);
  t.card = { uid: uid, loc: loc || null, def: def || null };

  var r = MC.moves.cmdsForTargeting(state, t.kind, uid, t.card ? t.card.loc : null);
  if (!r) {
    t.active = false;
    view.mode = "browse";
    return;
  }

  t.cmds = r.cmds;
  t.wildColor = (r.wildColor != null) ? r.wildColor : MC.state.NO_COLOR;
  t.cmdI = 0; // default always-existing if any

  // Unknown targeting kind.
  if (!t.cmds || t.cmds.length === 0) {
    t.active = false;
    view.mode = "browse";
    return;
  }

  // If the only legal destination is Source/cancel, disallow entering targeting.
  if (MC.moves.cmdsWithoutSource(t.cmds).length === 0) {
    MC.anim.feedbackError(view, "no_actions", "No actions");
    t.active = false;
    view.mode = "browse";
    return;
  }

  view.mode = "targeting";
};

MC.ui.targetingEnterHoldChain = function (state, view, kinds, uid, loc) {
  if (!view || !view.targeting) return;
  var t = view.targeting;

  t.active = true;
  t._profileSorted = false;
  t._profileSyncCmdI = -1;
  t.hold = true;
  t.cmds = [];
  t.cmdI = 0;
  t.wildColor = MC.state.NO_COLOR;

  t.chainActive = true;
  t.chainSegs = [];
  t.chainI = 0;
  t.srcCursor = { row: view.cursor ? view.cursor.row : 4, i: view.cursor ? view.cursor.i : 0 };

  var def = MC.state.defByUid(state, uid);
  t.card = { uid: uid, loc: loc || null, def: def || null };

  var chain = MC.cmd.buildHoldChain(state, uid, t.card ? t.card.loc : null, kinds);
  if (chain && chain.segs) t.chainSegs = chain.segs;

  if (!t.chainSegs || t.chainSegs.length === 0) {
    MC.anim.feedbackError(view, "no_actions", "No actions");
    t.active = false;
    view.mode = "browse";
    return;
  }

  // Apply first segment (default).
  var seg0 = t.chainSegs[0];
  t.chainI = 0;
  t.kind = seg0.kind;
  t.cmds = seg0.cmds;
  t.cmdI = 0;
  t.wildColor = (chain && chain.wildColor != null) ? chain.wildColor : MC.state.NO_COLOR;
  view.mode = "targeting";
};

MC.ui.targetingRetargetWild = function (state, view, dir) {
  if (!view || !view.targeting || !view.targeting.active) return;
  var t = view.targeting;
  if (!t.card || !t.card.def || !MC.rules.isWildDef(t.card.def)) return;

  var def = t.card.def;
  var c0 = def.wildColors[0];
  var c1 = def.wildColors[1];
  var prevColor = t.wildColor;
  var nextColor = (prevColor === c0) ? c1 : c0;
  if (dir < 0) nextColor = (prevColor === c1) ? c0 : c1;

  var uid = t.card.uid;
  var loc = t.card ? t.card.loc : null;

  function pickSelI(cmds, keepNewSet, keepSetI, keepSource) {
    var selI = 0;
    var i;
    if (keepNewSet) {
      for (i = 0; i < cmds.length; i++) if (cmds[i] && cmds[i].dest && cmds[i].dest.newSet) { selI = i; break; }
    } else if (keepSetI != null) {
      for (i = 0; i < cmds.length; i++) if (cmds[i] && cmds[i].dest && cmds[i].dest.setI === keepSetI) { selI = i; break; }
    } else if (keepSource) {
      for (i = 0; i < cmds.length; i++) if (cmds[i] && cmds[i].kind === "source") { selI = i; break; }
    }
    return selI;
  }

  t.wildColor = nextColor;

  // Hold-chain: retarget the appropriate segment (even when the active segment is Source),
  // and never inject Source into segment cmd lists (Source is a dedicated segment).
  if (t.chainActive && t.chainSegs && t.chainSegs.length) {
    var segI = MC.ui.clampI(t.chainI, t.chainSegs.length);
    var seg = t.chainSegs[segI];
    var profSeg = seg ? MC.cmd.getProfile(seg.kind) : null;
    if (!profSeg || !profSeg.cmdsForWildColor) {
      var si;
      for (si = 0; si < t.chainSegs.length; si++) {
        var cand = t.chainSegs[si];
        var profC = cand ? MC.cmd.getProfile(cand.kind) : null;
        if (profC && profC.cmdsForWildColor) { segI = si; seg = cand; profSeg = profC; break; }
      }
    }
    if (!seg || !profSeg || !profSeg.cmdsForWildColor) return;

    var prevCmdS = (seg.cmds && seg.cmds.length) ? seg.cmds[MC.ui.clampI(seg.cmdI, seg.cmds.length)] : null;
    var keepNewSetS = !!(prevCmdS && prevCmdS.dest && prevCmdS.dest.newSet);
    var keepSetIS = (prevCmdS && prevCmdS.dest && prevCmdS.dest.setI != null) ? prevCmdS.dest.setI : null;

    var cmdsS = profSeg.cmdsForWildColor(state, uid, def, nextColor, loc);
    var realCmdsS = MC.moves.cmdsWithoutSource(cmdsS);
    seg.cmds = realCmdsS;
    seg.cmdI = pickSelI(seg.cmds, keepNewSetS, keepSetIS, false);

    // If we retargeted the currently active segment, update the active targeting view too.
    if (segI === MC.ui.clampI(t.chainI, t.chainSegs.length)) {
      t.cmds = seg.cmds;
      t.cmdI = seg.cmdI;
      t._profileSorted = false;
      t._profileSyncCmdI = -1;
    }

    return;
  }

  // Non-chain targeting: retarget the current kind/profile (may include Source in cmds list).
  var prof = MC.cmd.getProfile(t.kind);
  if (!prof || !prof.cmdsForWildColor) return;
  var prevCmd = (t.cmds && t.cmds.length) ? t.cmds[MC.ui.clampI(t.cmdI, t.cmds.length)] : null;
  var keepNewSet = !!(prevCmd && prevCmd.dest && prevCmd.dest.newSet);
  var keepSetI = (prevCmd && prevCmd.dest && prevCmd.dest.setI != null) ? prevCmd.dest.setI : null;
  var keepSource = !!(prevCmd && prevCmd.kind === "source");

  var cmds = prof.cmdsForWildColor(state, uid, def, nextColor, loc);
  var include = prof.includeSource ? prof.includeSource(loc) : false;
  if (include) cmds.push({ kind: "source" });

  t.cmds = cmds;
  t._profileSorted = false;
  t._profileSyncCmdI = -1;
  t.cmdI = pickSelI(cmds, keepNewSet, keepSetI, keepSource);

  // Note: no hold-chain persistence here because chain retargeting is handled above.
};

MC.ui.step = function (state, view, actions) {
  if (!state || !view) return null;

  // Tick feedback timers.
  MC.anim.feedbackTick(view);
  MC.ui.toastsTick(view);
  MC.ui.syncPromptToast(state, view);
  MC.ui.syncWinnerToast(state, view);
  MC.anim.tick(state, view);

  var gameOver = (state.winnerP !== MC.state.NO_WINNER);
  var prevWinner = (view.ux && view.ux.lastWinnerP != null) ? view.ux.lastWinnerP : MC.state.NO_WINNER;
  var justEnded = (gameOver && prevWinner === MC.state.NO_WINNER);

  // Game over: close overlays and allow free navigation/inspect.
  if (gameOver) {
    if (view.mode === "menu") { view.menu.items = []; }
    if (view.targeting) view.targeting.active = false;
    view.mode = "browse";
  }

  // Prompt mode sync: prompts are rules-owned, UI adopts a dedicated mode.
  var pr = state.prompt;
  var hasPrompt = !!pr;
  var promptForP0 = !!(hasPrompt && pr.p === 0);
  if (!gameOver && promptForP0) {
    var k = pr && pr.kind ? String(pr.kind) : "";
    var allowOverlays = (k === "placeReceived" || k === "replaceWindow");
    if (!allowOverlays) {
      // Prompts override overlays.
      if (view.mode === "menu") { view.menu.items = []; }
      if (view.targeting) view.targeting.active = false;
      view.mode = "prompt";
    } else {
      // Keep menu/targeting when active; otherwise remain in prompt mode.
      if (!(view.mode === "menu" || view.mode === "targeting")) view.mode = "prompt";
    }
  } else {
    // If a prompt ended while we were in a prompt-only targeting flow, drop it.
    if (view.mode === "targeting" && view.targeting && view.targeting.active && view.targeting.card && view.targeting.card.loc && view.targeting.card.loc.zone === "recvProps") {
      view.targeting.active = false;
      view.mode = "browse";
    }
    if (view.mode === "prompt") view.mode = "browse";
  }

  // Inspect is meaningful in browse + prompt mode.
  view.inspectActive = !!((view.mode === "browse" || view.mode === "prompt") && actions.x && actions.x.inspectActive);

  // Compute models for navigation helpers.
  var computed = MC.ui.computeRowModels(state, view);
  MC.ui.updateCameras(state, view, computed);

  // While animating (shuffle/deal), lock input and just keep the view stable.
  if (view.anim && view.anim.lock) {
    computed = MC.ui.computeRowModels(state, view);
    MC.ui.updateCameras(state, view, computed);

    // During deal animations, keep cursor stable by anchored uid so
    // the selection highlight doesn't drift through the bank as new hand cards appear.
    if (view.anim.active && view.anim.active.kind === "deal" && view.ux && view.ux.selAnchor && view.ux.selAnchor.uid && view.ux.selAnchor.loc) {
      var a = view.ux.selAnchor;
      var rowA = a.row;
      if (rowA != null && rowA >= 0 && rowA < computed.models.length) {
        var rmA = computed.models[rowA];
        if (rmA && rmA.items) {
          var iA;
          var pick = null;
          for (iA = 0; iA < rmA.items.length; iA++) {
            var itA = rmA.items[iA];
            if (!itA || !itA.uid || !itA.loc) continue;
            if (itA.uid !== a.uid) continue;
            if (String(itA.loc.zone || "") !== String(a.loc.zone || "")) continue;
            if ((itA.loc.p != null) && (a.loc.p != null) && itA.loc.p !== a.loc.p) continue;
            pick = { row: rowA, i: iA, item: itA };
            break;
          }

          if (pick) {
            MC.ui.cursorMoveTo(view, pick);
            computed = MC.ui.computeRowModels(state, view);
            MC.ui.updateCameras(state, view, computed);
          }
        }
      }
    }

    // During non-deal animation locks (notably xfer), refresh the selection
    // anchor so focus preservation doesn't "snap" when the lock clears after list splices
    // (e.g., paying with a mid-stack bank card).
    if (!(view.anim.active && view.anim.active.kind === "deal")) {
      MC.ui.focus.snapshot(state, view, computed);
    }
    return null;
  }

  // Focus policy (selection preservation + centralized autofocus rules).
  // (Defined in a later-concatenated module; safe to call at runtime.)
  var allowFocus = (view.mode === "browse" || view.mode === "prompt");
  var isHardLockedPrompt = !!(promptForP0 && pr && pr.kind === "discardDown");
  if (allowFocus && !isHardLockedPrompt) {
    var didFocus = MC.ui.focus.apply(state, view, computed, actions);
    if (didFocus) {
      computed = MC.ui.computeRowModels(state, view);
      MC.ui.updateCameras(state, view, computed);
    }
  }

  // Track transitions for focus rules (after applying them).
  view.ux.lastActiveP = state.activeP;
  view.ux.lastPlaysLeft = state.playsLeft;
  view.ux.lastHandLenP0 = state.players[0].hand.length;
  view.ux.lastWinnerP = state.winnerP;
  view.ux.lastPromptForP0 = !!promptForP0;
  view.ux.lastPromptKind = promptForP0 && pr && pr.kind ? String(pr.kind) : "";

  // Prevent accidental immediate Reset/Next activation if the player is pressing A
  // during the same frame the win becomes visible.
  if (justEnded && actions && actions.a && (actions.a.tap || actions.a.grabStart)) {
    MC.anim.feedbackError(view, "game_over", "");
    return null;
  }

  function focusSnapshot() {
    MC.ui.focus.snapshot(state, view, computed);
  }

  function setAutoFocusPauseForCenterBtn(id) {
    if (id === "step" || id === "nextScenario" || id === "reset") {
      view.ux.autoFocusPausedByDebug = true;
    }
  }

  function currentSelection() {
    var row = view.cursor.row;
    var rm = computed.models[row];
    if (!rm || !rm.items || rm.items.length === 0) return null;
    var i = MC.ui.clampI(view.cursor.i, rm.items.length);
    return rm.items[i];
  }

  function promptPickHandItemIndices() {
    var out = [];
    if (!computed || !computed.models) return out;
    var rowHand = MC.render.ROW_P_HAND;
    var rm = computed.models[rowHand];
    if (!rm || !rm.items) return out;
    var i;
    for (i = 0; i < rm.items.length; i++) {
      var it = rm.items[i];
      if (!it || it.kind !== "hand" || !it.loc) continue;
      if (it.loc.zone !== "hand") continue;
      if (it.loc.p !== 0) continue;
      out.push(i);
    }
    return out;
  }

  function promptSnapCursorToHand(handItemIs) {
    var rowHand = MC.render.ROW_P_HAND;
    view.cursor.row = rowHand;
    if (!handItemIs || handItemIs.length === 0) { view.cursor.i = 0; return; }
    // If current cursor isn't on a hand card, snap to the first hand card.
    var rm = computed.models[rowHand];
    var cur = rm && rm.items ? rm.items[MC.ui.clampI(view.cursor.i, rm.items.length)] : null;
    if (!cur || cur.kind !== "hand" || !cur.loc || cur.loc.zone !== "hand") {
      view.cursor.i = handItemIs[0];
      return;
    }
    // Otherwise, ensure i is an actual hand-item index.
    var j;
    for (j = 0; j < handItemIs.length; j++) if (handItemIs[j] === view.cursor.i) return;
    view.cursor.i = handItemIs[0];
  }

  function promptCycleHand(handItemIs, dir) {
    if (!handItemIs || handItemIs.length === 0) return;
    var curI = view.cursor.i;
    var k;
    var curK = 0;
    for (k = 0; k < handItemIs.length; k++) if (handItemIs[k] === curI) { curK = k; break; }
    var nextK = curK + dir;
    nextK = MC.ui.wrapI(nextK, handItemIs.length);
    view.cursor.i = handItemIs[nextK];
  }

  // Menu mode
  if (view.mode === "menu") {
    if (actions.b && actions.b.pressed) {
      view.mode = "browse";
      view.menu.items = [];
      return null;
    }

    var nItems = view.menu.items ? view.menu.items.length : 0;
    if (nItems > 0) {
      if (actions.nav && actions.nav.up) view.menu.i = MC.ui.wrapI(view.menu.i - 1, nItems);
      if (actions.nav && actions.nav.down) view.menu.i = MC.ui.wrapI(view.menu.i + 1, nItems);
    }

    if (actions.a && actions.a.tap) {
      if (!view.menu.items || view.menu.items.length === 0) {
        view.mode = "browse";
        return null;
      }
      var mi = MC.ui.clampI(view.menu.i, view.menu.items.length);
      var it = view.menu.items[mi];
      var src = view.menu.src;
      view.mode = "browse";
      view.menu.items = [];

      if (!it || !src) return null;
      if (it.id === "source") return null;
      if (!src.loc || src.loc.p !== 0) return null;
      var uid = src.uid;

      // Cmd-profile-driven menu execution.
      var kind = String(it.id || "");
      var prof = MC.cmd.getProfile(kind);
      if (!prof) return null;

      var r = MC.moves.cmdsForTargeting(state, kind, uid, src.loc || null);
      if (!r || !r.cmds) return null;
      var realCmds = MC.moves.cmdsWithoutSource(r.cmds);
      if (!realCmds || realCmds.length === 0) return null;

      // Auto-apply when unambiguous.
      if (realCmds.length === 1) {
        focusSnapshot();
        return { kind: "applyCmd", cmd: realCmds[0] };
      }

      MC.ui.targetingEnter(state, view, kind, false, uid, src.loc);
      return null;
    }

    return null;
  }

  // Targeting mode
  if (view.mode === "targeting" && view.targeting && view.targeting.active) {
    var t = view.targeting;

    // Cancel
    if (actions.b && actions.b.pressed) {
      t.active = false;
      view.mode = "browse";
      return null;
    }

    function sortCmdsByScreenX(cmds, rankFn, screenXFn, tieCmp) {
      if (!cmds || cmds.length <= 1) return cmds;
      var out = cmds.slice();
      out.sort(function (a, b) {
        var ar = rankFn ? rankFn(a) : 0;
        var br = rankFn ? rankFn(b) : 0;
        var dr = ar - br;
        if (dr) return dr;
        var ax = screenXFn ? screenXFn(a) : 0;
        var bx = screenXFn ? screenXFn(b) : 0;
        var dx = ax - bx;
        if (dx) return dx;
        return tieCmp ? tieCmp(a, b) : 0;
      });
      return out;
    }

    // Optional: profile-driven screen-space sorting and cursor-moving targeting.
    // IMPORTANT: `t.kind` can change mid-frame via hold-chain segment switching, so always
    // resolve the current profile/UI dynamically inside helpers (avoid capturing stale `ui`).
    function curUi() {
      var prof = MC.cmd.getProfile(t.kind);
      return (prof && prof.ui) ? prof.ui : null;
    }

    function profileEnsureSortedOnce() {
      var ui = curUi();
      if (!ui || !ui.screenXForCmd) return;
      if (!t.cmds || t.cmds.length === 0) return;
      if (t._profileSorted) return;

      var prev = t.cmds[MC.ui.clampI(t.cmdI, t.cmds.length)];
      var keepSource = !!(prev && prev.kind === "source");
      // Preserve selection across sort only when we're not at the default index 0.
      // This avoids letting pre-sort engine order influence the default selection on first entry.
      var preserveNonDefault = (t.cmdI !== 0);
      var keepNewSet = preserveNonDefault && !!(prev && prev.dest && prev.dest.newSet);
      var keepSetI = preserveNonDefault && (prev && prev.dest && prev.dest.setI != null) ? prev.dest.setI : null;
      var keepTargetUid = preserveNonDefault && (prev && prev.target && prev.target.uid) ? prev.target.uid : 0;
      var keepTargetLoc = preserveNonDefault && (prev && prev.target && prev.target.loc) ? prev.target.loc : null;

      var cmds = sortCmdsByScreenX(
        t.cmds,
        ui.sortRank || null,
        function (c) { return ui.screenXForCmd({ state: state, view: view, computed: computed }, c); },
        ui.tieCmp || null
      );
      t.cmds = cmds;

      // Preserve selection if possible.
      var selI = 0;
      var i;
      if (keepSource) {
        for (i = 0; i < cmds.length; i++) if (cmds[i] && cmds[i].kind === "source") { selI = i; break; }
      } else if (keepNewSet) {
        for (i = 0; i < cmds.length; i++) if (cmds[i] && cmds[i].dest && cmds[i].dest.newSet) { selI = i; break; }
      } else if (keepSetI != null) {
        for (i = 0; i < cmds.length; i++) if (cmds[i] && cmds[i].dest && cmds[i].dest.setI === keepSetI) { selI = i; break; }
      } else if (keepTargetUid && keepTargetLoc) {
        for (i = 0; i < cmds.length; i++) {
          var c = cmds[i];
          if (!c || !c.kind) continue;
          if (!c.target || c.target.uid !== keepTargetUid || !c.target.loc) continue;
          var al = c.target.loc;
          var bl = keepTargetLoc;
          if (al.p !== bl.p) continue;
          if (String(al.zone || "") !== String(bl.zone || "")) continue;
          if ((al.setI != null) && (bl.setI != null) && al.setI !== bl.setI) continue;
          if ((al.i != null) && (bl.i != null) && al.i !== bl.i) continue;
          selI = i;
          break;
        }
      }
      t.cmdI = selI;
      t._profileSorted = true;

      // If this targeting is part of a hold-chain, persist the sorted cmd order in the active segment
      // so segment switching doesn't keep reintroducing an unsorted order.
      if (t.chainActive && t.chainSegs && t.chainSegs.length) {
        var seg = t.chainSegs[MC.ui.clampI(t.chainI, t.chainSegs.length)];
        if (seg) { seg.cmds = t.cmds; seg.cmdI = t.cmdI; }
      }
    }

    function profileSyncCursor() {
      var ui = curUi();
      if (!ui || ui.mode !== "cursor" || !ui.findItemForCmd) return false;
      if (!t.cmds || t.cmds.length === 0) return false;
      var cmdI = MC.ui.clampI(t.cmdI, t.cmds.length);
      t.cmdI = cmdI;
      if (t._profileSyncCmdI === cmdI) return false;
      var cmdSel = t.cmds[cmdI];
      var pick = ui.findItemForCmd({ state: state, view: view, computed: computed }, cmdSel);
      if (pick) MC.ui.cursorMoveTo(view, pick);
      t._profileSyncCmdI = cmdI;
      return true;
    }

    profileEnsureSortedOnce();

    // Cycle destinations
    var nCmds = t.cmds ? t.cmds.length : 0;
    if (nCmds > 0) {
      function kindIsCursorMode(kind) {
        var profK = MC.cmd.getProfile(kind);
        var uiK = (profK && profK.ui) ? profK.ui : null;
        return !!(uiK && String(uiK.mode || "") === "cursor");
      }

      function chainApplySeg(nextSegI, dirSeg) {
        if (!t.chainActive || !t.chainSegs || t.chainSegs.length === 0) return false;

        // Persist current cmdI into current segment.
        var curSeg = t.chainSegs[MC.ui.clampI(t.chainI, t.chainSegs.length)];
        if (curSeg) curSeg.cmdI = t.cmdI;

        nextSegI = MC.ui.wrapI(nextSegI, t.chainSegs.length);
        var seg = t.chainSegs[nextSegI];
        if (!seg || !seg.cmds || seg.cmds.length === 0) return false;

        t.chainI = nextSegI;
        t.kind = String(seg.kind || "");
        t.cmds = seg.cmds;
        // Directional segment entry: land on start/end (keeps a stable global cycle).
        t.cmdI = (dirSeg < 0) ? (seg.cmds.length - 1) : 0;
        seg.cmdI = t.cmdI;
        t._profileSorted = false;
        t._profileSyncCmdI = -1;

        // Entering non-cursor segments should snap cursor back to the source selection,
        // to avoid leaving a stale highlight on a previous cursor-mode target.
        if (!kindIsCursorMode(t.kind) && t.srcCursor) {
          view.cursor.row = t.srcCursor.row;
          view.cursor.i = t.srcCursor.i;
        }

        return true;
      }

      if (actions.nav && actions.nav.left) {
        if (t.chainActive && t.chainSegs && t.chainSegs.length) {
          if (t.cmdI > 0) t.cmdI -= 1;
          else chainApplySeg(t.chainI - 1, -1);
        } else {
          t.cmdI = MC.ui.wrapI(t.cmdI - 1, nCmds);
        }
      }
      if (actions.nav && actions.nav.right) {
        if (t.chainActive && t.chainSegs && t.chainSegs.length) {
          if (t.cmdI < (nCmds - 1)) t.cmdI += 1;
          else chainApplySeg(t.chainI + 1, 1);
        } else {
          t.cmdI = MC.ui.wrapI(t.cmdI + 1, nCmds);
        }
      }
    }

    // Wild color toggle (Up/Down)
    if (actions.nav && (actions.nav.up || actions.nav.down)) {
      var dir = actions.nav.down ? 1 : -1;
      MC.ui.targetingRetargetWild(state, view, dir);
    }

    // Confirm: tap-A (menu targeting) OR release-A (hold targeting).
    var shouldConfirm = false;
    if (!t.hold && actions.a && actions.a.tap) shouldConfirm = true;
    if (t.hold && actions.a && actions.a.released) shouldConfirm = true;
    if (!shouldConfirm) {
      // Update cameras to follow destination preview / cursor-moving selection.
      computed = MC.ui.computeRowModels(state, view);
      profileSyncCursor();
      MC.ui.updateCameras(state, view, computed);
      return null;
    }

    if (!t.cmds || t.cmds.length === 0) {
      MC.anim.feedbackError(view, "no_targets", "No valid destination");
      t.active = false;
      view.mode = "browse";
      return null;
    }

    var cmdI = MC.ui.clampI(t.cmdI, t.cmds.length);
    var cmdSel = t.cmds[cmdI];
    t.active = false;
    view.mode = "browse";

    if (!cmdSel) return null;
    if (cmdSel.kind === "source") return null;
    focusSnapshot();
    return { kind: "applyCmd", cmd: cmdSel };
  }

  // Browse mode
  if (view.mode !== "prompt") view.mode = "browse";

  // Prompt mode: rules-owned prompts.
  if (view.mode === "prompt") {
    var prompt = state.prompt;
    if (!prompt || prompt.p !== 0) {
      view.mode = "browse";
      return null;
    }

    function applyPromptNav() {
      if (!actions.nav) return;
      var dir = null;
      if (actions.nav.up) dir = "up";
      else if (actions.nav.down) dir = "down";
      else if (actions.nav.left) dir = "left";
      else if (actions.nav.right) dir = "right";
      if (!dir) return;
      var pick = MC.ui.navPickInDirection(view, computed, dir);
      if (pick) {
        view.cursor.row = pick.row;
        view.cursor.i = pick.i;
      }
    }

    function snapCursorToFirstRecv() {
      var pick = MC.ui.findBestCursorTarget(computed.models, [MC.render.ROW_P_HAND], function (it) {
        return it && it.kind === "hand" && it.loc && it.loc.zone === "recvProps" && it.loc.p === 0;
      });
      if (pick) MC.ui.cursorMoveTo(view, pick);
    }

    function snapCursorToFirstReplaceWild() {
      var pick = MC.ui.pickReplaceWindowWild(state, computed);
      if (pick) MC.ui.cursorMoveTo(view, pick);
    }

    if (prompt.kind === "discardDown") {
      // Lock cursor to player hand cards only (not bank).
      var handIs = promptPickHandItemIndices();
      promptSnapCursorToHand(handIs);

      // Recompute after snapping cursor.
      computed = MC.ui.computeRowModels(state, view);
      MC.ui.updateCameras(state, view, computed);

      // Left/Right cycle within hand.
      if (actions.nav && actions.nav.left) promptCycleHand(handIs, -1);
      if (actions.nav && actions.nav.right) promptCycleHand(handIs, 1);

      // Cancel: only before any discard has happened in this prompt instance.
      if (actions.b && actions.b.pressed) {
        if (prompt.nDiscarded <= 0) {
          focusSnapshot();
          return { kind: "applyCmd", cmd: { kind: "cancelPrompt" } };
        }
        MC.anim.feedbackError(view, "prompt_forced", "Must discard");
        return null;
      }

      // Discard with A tap.
      if (actions.a && actions.a.tap) {
        computed = MC.ui.computeRowModels(state, view);
        MC.ui.updateCameras(state, view, computed);
        var selP = currentSelection();
        if (selP && selP.loc && selP.loc.zone === "hand" && selP.loc.p === 0) {
          focusSnapshot();
          return { kind: "applyCmd", cmd: { kind: "discard", card: { uid: selP.uid, loc: selP.loc } } };
        }
      }

      return null;
    }

    // Hold-A grab: enter targeting *before* directional nav so the nudge that triggers
    // grabStart doesn't also move the cursor to a different card in the same frame.
    if (prompt.kind === "placeReceived" && actions.a && actions.a.grabStart) {
      var selGrabP = currentSelection();
      if (!selGrabP || !selGrabP.loc) { MC.anim.feedbackError(view, "no_actions", "No actions"); snapCursorToFirstRecv(); return null; }
      if (selGrabP.loc.zone !== "recvProps") {
        MC.anim.feedbackError(view, "place_recv_only", "Select a received property");
        snapCursorToFirstRecv();
        return null;
      }
      MC.ui.targetingEnter(state, view, "place", true, selGrabP.uid, selGrabP.loc);
      return null;
    }
    if (prompt.kind === "replaceWindow" && actions.a && actions.a.grabStart) {
      var selGrabW = currentSelection();
      if (!selGrabW || !selGrabW.loc) { MC.anim.feedbackError(view, "no_actions", "No actions"); snapCursorToFirstReplaceWild(); return null; }
      if (selGrabW.loc.zone !== "setProps" || selGrabW.loc.p !== 0 || selGrabW.loc.setI == null || selGrabW.loc.setI !== prompt.srcSetI) {
        MC.anim.feedbackError(view, "replace_pick_wild", "Select a Wild");
        snapCursorToFirstReplaceWild();
        return null;
      }
      if (selGrabW.uid === prompt.excludeUid) {
        MC.anim.feedbackError(view, "replace_pick_wild", "Select a Wild");
        snapCursorToFirstReplaceWild();
        return null;
      }
      var defW = MC.state.defByUid(state, selGrabW.uid);
      if (!defW || !MC.rules.isWildDef(defW)) {
        MC.anim.feedbackError(view, "replace_pick_wild", "Select a Wild");
        snapCursorToFirstReplaceWild();
        return null;
      }
      MC.ui.targetingEnter(state, view, "moveWild", true, selGrabW.uid, selGrabW.loc);
      return null;
    }

    applyPromptNav();
    computed = MC.ui.computeRowModels(state, view);
    MC.ui.updateCameras(state, view, computed);
    // Refresh selection anchor during prompt ticks so selection preservation doesn't fight user navigation.
    MC.ui.focus.snapshot(state, view, computed);

    // Global prompt escape: allow returning to the title screen via the center Menu button.
    if (actions.a && actions.a.tap) {
      var selPromptBtn = currentSelection();
      if (selPromptBtn && selPromptBtn.kind === "btn" && selPromptBtn.id === "mainMenu") {
        setAutoFocusPauseForCenterBtn("mainMenu");
        focusSnapshot();
        return { kind: "mainMenu" };
      }
    }

    if (prompt.kind === "payDebt") {
      if (actions.b && actions.b.pressed) {
        MC.anim.feedbackError(view, "prompt_forced", "Must pay");
        return null;
      }

      if (actions.a && actions.a.tap) {
        var selD = currentSelection();
        // Allow debug buttons (Step/Reset/Next) during this prompt; End remains disallowed.
        if (selD && selD.kind === "btn") {
          if (selD.id === "step") { setAutoFocusPauseForCenterBtn("step"); focusSnapshot(); return { kind: "debug", action: "step" }; }
          if (selD.id === "reset") { setAutoFocusPauseForCenterBtn("reset"); focusSnapshot(); return { kind: "debug", action: "reset" }; }
          if (selD.id === "nextScenario") { setAutoFocusPauseForCenterBtn("nextScenario"); focusSnapshot(); return { kind: "debug", action: "nextScenario" }; }
          if (selD.id === "endTurn") { MC.anim.feedbackError(view, "prompt_forced", "Must pay"); return null; }
        }
        if (!selD || !selD.loc) { MC.anim.feedbackError(view, "no_actions", "No actions"); return null; }

        if (selD.loc.zone === "hand" && selD.loc.p === 0) {
          var canJsn = !!(prompt.srcAction && prompt.buf && prompt.buf.length === 0);
          if (canJsn) {
            var defJ = MC.state.defByUid(state, selD.uid);
            if (defJ && defJ.kind === MC.CardKind.Action && defJ.actionKind === MC.ActionKind.JustSayNo) {
              focusSnapshot();
              return { kind: "applyCmd", cmd: { kind: "playJustSayNo", card: { uid: selD.uid, loc: selD.loc } } };
            }
          }
        }

        // House-pay-first redirect: selecting a property in a housed set snaps to the House.
        if (selD.loc.zone === "setProps" && selD.loc.setI != null) {
          var setI = selD.loc.setI;
          var set = state.players[0].sets[setI];
          if (set && set.houseUid) {
            var rmT = computed.models[MC.render.ROW_P_TABLE];
            if (rmT && rmT.items) {
              var ii;
              for (ii = 0; ii < rmT.items.length; ii++) {
                var itH = rmT.items[ii];
                if (!itH || itH.kind !== "setHouse" || !itH.loc) continue;
                if (itH.loc.p !== 0) continue;
                if (itH.loc.setI !== setI) continue;
                view.cursor.row = MC.render.ROW_P_TABLE;
                view.cursor.i = ii;
                MC.ui.toastPush(view, { id: "err:house_pay_first", kind: "error", text: "House must be paid first", frames: MC.config.ui.toast.errorFrames });
                MC.anim.feedbackError(view, "house_pay_first", "");
                return null;
              }
            }
            MC.anim.feedbackError(view, "house_pay_first", "House must be paid first");
            return null;
          }
        }

        if (selD.loc.zone === "bank" || selD.loc.zone === "setProps" || selD.loc.zone === "setHouse") {
          focusSnapshot();
          return { kind: "applyCmd", cmd: { kind: "payDebt", card: { uid: selD.uid, loc: selD.loc } } };
        }

        MC.anim.feedbackError(view, "cant_pay", "Can't pay with that");
      }

      return null;
    }

    if (prompt.kind === "respondAction") {
      if (actions.b && actions.b.pressed) {
        MC.anim.feedbackError(view, "prompt_forced", "Must respond");
        return null;
      }

      if (actions.a && actions.a.tap) {
        var selR0 = currentSelection();
        if (!selR0 || !selR0.loc) { MC.anim.feedbackError(view, "no_actions", "No actions"); return null; }

        var tgt = prompt.target;
        var isTarget =
          tgt &&
          tgt.loc &&
          (selR0.uid === tgt.uid) &&
          (selR0.loc.p === tgt.loc.p) &&
          (String(selR0.loc.zone) === String(tgt.loc.zone)) &&
          ((selR0.loc.setI == null) || (selR0.loc.setI === tgt.loc.setI)) &&
          ((selR0.loc.i == null) || (selR0.loc.i === tgt.loc.i));

        if (isTarget) {
          focusSnapshot();
          return { kind: "applyCmd", cmd: { kind: "respondPass" } };
        }

        if (selR0.loc.zone === "hand" && selR0.loc.p === 0) {
          var defRJ = MC.state.defByUid(state, selR0.uid);
          if (defRJ && defRJ.kind === MC.CardKind.Action && defRJ.actionKind === MC.ActionKind.JustSayNo) {
            focusSnapshot();
            return { kind: "applyCmd", cmd: { kind: "playJustSayNo", card: { uid: selR0.uid, loc: selR0.loc } } };
          }
        }

        MC.anim.feedbackError(view, "must_respond", "Select the target or Just Say No");
        return null;
      }

      return null;
    }

    if (prompt.kind === "placeReceived") {
      if (actions.b && actions.b.pressed) {
        MC.anim.feedbackError(view, "prompt_forced", "Must place");
        snapCursorToFirstRecv();
        return null;
      }

      if (actions.a && actions.a.tap) {
        var selR = currentSelection();
        // Allow debug buttons (Step/Reset/Next) during this prompt; End remains disallowed.
        if (selR && selR.kind === "btn") {
          if (selR.id === "step") { setAutoFocusPauseForCenterBtn("step"); focusSnapshot(); return { kind: "debug", action: "step" }; }
          if (selR.id === "reset") { setAutoFocusPauseForCenterBtn("reset"); focusSnapshot(); return { kind: "debug", action: "reset" }; }
          if (selR.id === "nextScenario") { setAutoFocusPauseForCenterBtn("nextScenario"); focusSnapshot(); return { kind: "debug", action: "nextScenario" }; }
          if (selR.id === "endTurn") {
            MC.anim.feedbackError(view, "prompt_forced", "Must place");
            snapCursorToFirstRecv();
            return null;
          }
        }
        if (!selR || !selR.loc) { MC.anim.feedbackError(view, "no_actions", "No actions"); snapCursorToFirstRecv(); return null; }
        if (selR.loc.zone !== "recvProps") {
          MC.anim.feedbackError(view, "place_recv_only", "Select a received property");
          snapCursorToFirstRecv();
          return null;
        }
        // Tap-A workflow: go directly to placement targeting (only action in this prompt).
        MC.ui.targetingEnter(state, view, "place", false, selR.uid, selR.loc);
        return null;
      }

      return null;
    }

    if (prompt.kind === "replaceWindow") {
      if (actions.b && actions.b.pressed) {
        focusSnapshot();
        return { kind: "applyCmd", cmd: { kind: "skipReplaceWindow" } };
      }

      if (actions.a && actions.a.tap) {
        var selW = currentSelection();
        // Allow debug buttons (Step/Reset/Next) during this prompt; End remains disallowed.
        if (selW && selW.kind === "btn") {
          if (selW.id === "step") { setAutoFocusPauseForCenterBtn("step"); focusSnapshot(); return { kind: "debug", action: "step" }; }
          if (selW.id === "reset") { setAutoFocusPauseForCenterBtn("reset"); focusSnapshot(); return { kind: "debug", action: "reset" }; }
          if (selW.id === "nextScenario") { setAutoFocusPauseForCenterBtn("nextScenario"); focusSnapshot(); return { kind: "debug", action: "nextScenario" }; }
          if (selW.id === "endTurn") { MC.anim.feedbackError(view, "prompt_forced", "Move a Wild or skip"); snapCursorToFirstReplaceWild(); return null; }
        }
        if (!selW || !selW.loc) { MC.anim.feedbackError(view, "no_actions", "No actions"); snapCursorToFirstReplaceWild(); return null; }
        if (selW.loc.zone !== "setProps" || selW.loc.p !== 0 || selW.loc.setI == null || selW.loc.setI !== prompt.srcSetI) {
          MC.anim.feedbackError(view, "replace_pick_wild", "Select a Wild");
          snapCursorToFirstReplaceWild();
          return null;
        }
        if (selW.uid === prompt.excludeUid) {
          MC.anim.feedbackError(view, "replace_pick_wild", "Select a Wild");
          snapCursorToFirstReplaceWild();
          return null;
        }
        var defW2 = MC.state.defByUid(state, selW.uid);
        if (!defW2 || !MC.rules.isWildDef(defW2)) {
          MC.anim.feedbackError(view, "replace_pick_wild", "Select a Wild");
          snapCursorToFirstReplaceWild();
          return null;
        }
        // Tap-A workflow: enter moveWild targeting.
        MC.ui.targetingEnter(state, view, "moveWild", false, selW.uid, selW.loc);
        return null;
      }

      return null;
    }

    // Unknown prompt kind (UI doesn't handle yet).
    view.mode = "browse";
    return null;
  }

  // Navigation (directional, screen-space).
  // Hold-A grab: enter targeting *before* directional nav so the nudge that triggers
  // grabStart doesn't also move the cursor to a different card in the same frame.
  if (gameOver && actions.a && actions.a.grabStart) {
    MC.anim.feedbackError(view, "game_over", "");
    return null;
  }
  if (actions.a && actions.a.grabStart) {
    var selGrab = currentSelection();
    if (selGrab && selGrab.loc && selGrab.loc.zone === "hand" && selGrab.loc.p === 0) {
      var uidGrab = selGrab.uid;
      var defGrab = MC.state.defByUid(state, uidGrab);
      var kinds = MC.cmd.holdChainKindsForDef(defGrab);
      if (kinds) {
        MC.ui.targetingEnterHoldChain(state, view, kinds, uidGrab, selGrab.loc);
        return null;
      }
      MC.anim.feedbackError(view, "hold_noop", "Can't do that");
      return null;
    }
  }

  if (actions.nav) {
    var dir = null;
    if (actions.nav.up) dir = "up";
    else if (actions.nav.down) dir = "down";
    else if (actions.nav.left) dir = "left";
    else if (actions.nav.right) dir = "right";

    if (dir) {
      var pick = MC.ui.navPickInDirection(view, computed, dir);
      if (pick) {
        view.cursor.row = pick.row;
        view.cursor.i = pick.i;
      }
    }
  }

  // Recompute after nav, then update cameras.
  computed = MC.ui.computeRowModels(state, view);
  MC.ui.updateCameras(state, view, computed);

  // Context actions on tap A.
  if (actions.a && actions.a.tap) {
    var sel = currentSelection();
    if (!sel) return null;

    // Game over: only allow Reset/Next debug buttons; everything else is a no-op with feedback blink.
    if (gameOver) {
      var allowBtn = !!(sel.row === 2 && sel.kind === "btn" && (sel.id === "mainMenu" || sel.id === "reset" || sel.id === "nextScenario"));
      if (!allowBtn) {
        MC.anim.feedbackError(view, "game_over", "");
        return null;
      }
    }

    // Center buttons.
    if (sel.row === 2 && sel.kind === "btn") {
      if (sel.disabled) {
        var msg = "Not available";
        if (sel.id === "endTurn" && state.activeP !== 0) msg = "Opponent turn";
        MC.anim.feedbackError(view, "disabled_btn", msg);

        // Move selection to next available center button (prefer Step).
        var pickNext =
          MC.ui.findBestCursorTarget(computed.models, [2], function (it) {
            return it && it.kind === "btn" && it.id === "step" && !it.disabled;
          }) ||
          MC.ui.findBestCursorTarget(computed.models, [2], function (it) {
            return it && it.kind === "btn" && !it.disabled && it.id !== "endTurn";
          }) ||
          MC.ui.findBestCursorTarget(computed.models, [2], function (it) {
            return it && (it.kind === "discard" || it.kind === "deck");
          });

        if (pickNext) {
          MC.ui.cursorMoveTo(view, pickNext);
          computed = MC.ui.computeRowModels(state, view);
          MC.ui.updateCameras(state, view, computed);
        }

        return null;
      }

      if (sel.id === "mainMenu") { setAutoFocusPauseForCenterBtn("mainMenu"); focusSnapshot(); return { kind: "mainMenu" }; }
      if (sel.id === "endTurn") { setAutoFocusPauseForCenterBtn("endTurn"); focusSnapshot(); return { kind: "applyCmd", cmd: { kind: "endTurn" } }; }
      if (sel.id === "step") { setAutoFocusPauseForCenterBtn("step"); focusSnapshot(); return { kind: "debug", action: "step" }; }
      if (sel.id === "reset") { setAutoFocusPauseForCenterBtn("reset"); focusSnapshot(); return { kind: "debug", action: "reset" }; }
      if (sel.id === "nextScenario") { setAutoFocusPauseForCenterBtn("nextScenario"); focusSnapshot(); return { kind: "debug", action: "nextScenario" }; }
      return null;
    }

    // Hand card menu (P0 only).
    if (sel.loc && sel.loc.zone === "hand" && sel.loc.p === 0) {
      MC.ui.menuOpenForSelection(state, view, sel);
      if (view.menu.items && view.menu.items.length > 0) {
        view.mode = "menu";
      } else {
        MC.anim.feedbackError(view, "no_actions", "No actions");
      }
    }
  }

  // If hold targeting is active and A is no longer held, auto-confirm is handled in targeting mode.

  // Keep selection anchor fresh for the next tick.
  focusSnapshot();
  return null;
};

// ---- src/66_focus.js ----
// MC.ui.focus: centralized focus policy (autofocus + selection preservation).

MC.ui.focus = {};

MC.ui.focus._screenCenter = function (view, item) {
  var row = item.row;
  var cam = view.camX[row];
  var x = item.x;
  var y = item.y;
  var w = item.w;
  var h = item.h;
  return { cx: (x - cam) + (w / 2), cy: y + (h / 2) };
};

MC.ui.focus.snapshot = function (state, view, computed) {
  var row = view.cursor.row;
  var rm = computed.models[row];
  var items = rm.items;
  var sel = items[MC.ui.clampI(view.cursor.i, items.length)];
  if (!sel) { view.ux.selAnchor = null; return; }

  var c = MC.ui.focus._screenCenter(view, sel);
  view.ux.selAnchor = {
    row: sel.row,
    kind: sel.kind,
    uid: sel.uid,
    loc: sel.loc,
    screenCx: c.cx,
    screenCy: c.cy
  };
};

MC.ui.focus._findItemByUidLoc = function (computed, uid, loc) {
  var models = computed.models;
  var row;
  for (row = 0; row < models.length; row++) {
    var rm = models[row];
    if (!rm || !rm.items) continue;
    var i;
    for (i = 0; i < rm.items.length; i++) {
      var it = rm.items[i];
      if (!it) continue;
      if (it.uid !== uid) continue;
      if (loc) {
        // Match on zone/p and indices when available.
        if (!it.loc) continue;
        if (it.loc.zone !== loc.zone) continue;
        if ((it.loc.p != null) && (loc.p != null) && it.loc.p !== loc.p) continue;
        if ((it.loc.i != null) && (loc.i != null) && it.loc.i !== loc.i) continue;
        if ((it.loc.setI != null) && (loc.setI != null) && it.loc.setI !== loc.setI) continue;
      }
      return { row: row, i: i, item: it };
    }
  }
  return null;
};

MC.ui.focus._nearestByGeometry = function (view, computed, anchor) {
  var models = computed.models;
  var best = null;
  var bestScore = 999999999;
  var ax = anchor.screenCx;
  var ay = anchor.screenCy;

  var row;
  for (row = 0; row < models.length; row++) {
    var rm = models[row];
    if (!rm || !rm.items || rm.items.length === 0) continue;
    var i;
    for (i = 0; i < rm.items.length; i++) {
      var it = rm.items[i];
      if (!it) continue;
      var c = MC.ui.focus._screenCenter(view, it);
      var dx = c.cx - ax;
      var dy = c.cy - ay;
      var d2 = dx * dx + dy * dy;
      // Prefer staying in the same row when distances are similar.
      var rowPenalty = (anchor.row != null && row !== anchor.row) ? 2000 : 0;
      var score = d2 + rowPenalty;
      if (score < bestScore) { bestScore = score; best = { row: row, i: i, item: it }; }
    }
  }
  return best;
};

MC.ui.focus.preserve = function (state, view, computed) {
  var sel = computed.selected;

  // Try anchor restore first; otherwise relocate to any selectable when selection is missing.
  var a = view.ux.selAnchor;
  var pick = null;
  if (a && (a.uid || !sel)) {
    // If the currently-selected item still matches the anchor, keep it.
    if (sel && a.uid && sel.uid === a.uid) {
      // If anchor had a loc, require zone match too.
      if (!a.loc || (sel.loc && sel.loc.zone === a.loc.zone)) {
        return false;
      }
    }

    if (a.uid) pick = MC.ui.focus._findItemByUidLoc(computed, a.uid, a.loc);
    if (!pick) pick = MC.ui.focus._nearestByGeometry(view, computed, a);
  }

  // If we have no anchor-based pick and selection is missing, pick any valid item.
  if (!pick && !sel) {
    pick = MC.ui.findBestCursorTarget(computed.models, [4, 3, 2, 1, 0], function () { return true; });
  }

  if (pick) {
    // Avoid churn if already there.
    if (view.cursor && view.cursor.row === pick.row && view.cursor.i === pick.i) return false;
    MC.ui.cursorMoveTo(view, pick);
    view.ux.lastFocusRuleId = "preserve";
    return true;
  }

  return false;
};

MC.ui.focus._pickCenterBtn = function (computed, id) {
  return MC.ui.findBestCursorTarget(computed.models, [2], function (it) {
    return it && it.kind === "btn" && it.id === id && !it.disabled;
  });
};

MC.ui.focus._pickPayDebtDefault = function (computed) {
  var rmHand = computed.models[MC.render.ROW_P_HAND];
  var rmTable = computed.models[MC.render.ROW_P_TABLE];

  // Prefer bank if any cards exist.
  if (rmHand && rmHand.items) {
    var i;
    for (i = rmHand.items.length - 1; i >= 0; i--) {
      var it = rmHand.items[i];
      if (it && it.loc && it.loc.p === 0 && it.loc.zone === "bank") return { row: MC.render.ROW_P_HAND, i: i, item: it };
    }
  }

  // Then houses (house-pay-first friendly).
  if (rmTable && rmTable.items) {
    var j;
    for (j = 0; j < rmTable.items.length; j++) {
      var itH = rmTable.items[j];
      if (itH && itH.loc && itH.loc.p === 0 && itH.loc.zone === "setHouse") return { row: MC.render.ROW_P_TABLE, i: j, item: itH };
    }
    for (j = 0; j < rmTable.items.length; j++) {
      var itP = rmTable.items[j];
      if (itP && itP.loc && itP.loc.p === 0 && itP.loc.zone === "setProps") return { row: MC.render.ROW_P_TABLE, i: j, item: itP };
    }
  }

  return null;
};

MC.ui.focus._pickHandCard = function (computed) {
  return MC.ui.findBestCursorTarget(computed.models, [MC.render.ROW_P_HAND], function (it) {
    return it && it.kind === "hand" && it.loc && it.loc.p === 0 && it.loc.zone === "hand";
  });
};

MC.ui.focus.rules = [
  {
    id: "PauseAfterDebug",
    enabled: function () { return true; },
    when: function (ctx) { return !!ctx.view.ux.autoFocusPausedByDebug; },
    pick: function () {
      // No pick; this rule acts as a gate in apply().
      return null;
    }
  },
  {
    id: "OnGameOverEntered_Reset",
    enabled: function () { return !!(MC.config.debug.enabled && MC.debug.toolsOn); },
    when: function (ctx) { return (ctx.view.ux.lastWinnerP === MC.state.NO_WINNER && ctx.state.winnerP !== MC.state.NO_WINNER); },
    pick: function (ctx) {
      return MC.ui.focus._pickCenterBtn(ctx.computed, "reset");
    }
  },
  {
    id: "OnGameOverEntered_Menu",
    enabled: function () { return true; },
    when: function (ctx) { return (ctx.view.ux.lastWinnerP === MC.state.NO_WINNER && ctx.state.winnerP !== MC.state.NO_WINNER); },
    pick: function (ctx) {
      return MC.ui.focus._pickCenterBtn(ctx.computed, "mainMenu");
    }
  },
  {
    id: "OnInvalidActionGameOver_Reset",
    enabled: function () { return !!(MC.config.debug.enabled && MC.debug.toolsOn); },
    when: function (ctx) {
      if (ctx.state.winnerP === MC.state.NO_WINNER) return false;
      if (ctx.view.mode !== "browse" || ctx.view.inspectActive) return false;
      return (ctx.view.ux.pendingFocusErrorCode === "game_over");
    },
    pick: function (ctx) {
      ctx.view.ux.pendingFocusErrorCode = "";
      return MC.ui.focus._pickCenterBtn(ctx.computed, "reset");
    }
  },
  {
    id: "OnInvalidActionGameOver_Menu",
    enabled: function () { return true; },
    when: function (ctx) {
      if (ctx.state.winnerP === MC.state.NO_WINNER) return false;
      if (ctx.view.mode !== "browse" || ctx.view.inspectActive) return false;
      return (ctx.view.ux.pendingFocusErrorCode === "game_over");
    },
    pick: function (ctx) {
      ctx.view.ux.pendingFocusErrorCode = "";
      return MC.ui.focus._pickCenterBtn(ctx.computed, "mainMenu");
    }
  },
  {
    id: "OnPlaysExhausted_End",
    enabled: function () { return true; },
    when: function (ctx) {
      if (ctx.state.winnerP !== MC.state.NO_WINNER) return false;
      if (ctx.state.activeP !== 0) return false;
      if (ctx.view.mode !== "browse" || ctx.view.inspectActive) return false;
      return (ctx.view.ux.lastActiveP === 0 && ctx.view.ux.lastPlaysLeft > 0 && ctx.state.playsLeft <= 0);
    },
    pick: function (ctx) {
      return MC.ui.focus._pickCenterBtn(ctx.computed, "endTurn");
    }
  },
  {
    id: "OnHandBecameEmpty_End",
    enabled: function () { return true; },
    when: function (ctx) {
      if (ctx.state.winnerP !== MC.state.NO_WINNER) return false;
      if (ctx.state.activeP !== 0) return false;
      if (ctx.view.mode !== "browse" || ctx.view.inspectActive) return false;
      if (ctx.state.prompt) return false;
      if (ctx.view.ux.autoFocusPausedByDebug) return false;
      return (ctx.view.ux.lastHandLenP0 > 0 && ctx.state.players[0].hand.length === 0);
    },
    pick: function (ctx) {
      return MC.ui.focus._pickCenterBtn(ctx.computed, "endTurn");
    }
  },
  {
    id: "OnPlayerTurnStart_FocusHandOrEnd",
    enabled: function () { return true; },
    when: function (ctx) {
      if (ctx.state.winnerP !== MC.state.NO_WINNER) return false;
      if (ctx.state.activeP !== 0) return false;
      if (ctx.view.mode !== "browse" || ctx.view.inspectActive) return false;
      if (ctx.state.prompt && ctx.state.prompt.p === 0) return false;
      if (ctx.view.ux.autoFocusPausedByDebug) return false;
      // Turn-start transition into P0.
      return (ctx.view.ux.lastActiveP !== 0);
    },
    pick: function (ctx) {
      if (ctx.state.players[0].hand.length > 0) return MC.ui.focus._pickHandCard(ctx.computed);
      if (ctx.state.playsLeft > 0) return MC.ui.focus._pickCenterBtn(ctx.computed, "endTurn");
      return null;
    }
  },
  {
    id: "OnInvalidActionWhileHandEmpty_End",
    enabled: function () { return true; },
    when: function (ctx) {
      if (ctx.state.winnerP !== MC.state.NO_WINNER) return false;
      if (ctx.state.activeP !== 0) return false;
      if (ctx.view.mode !== "browse" || ctx.view.inspectActive) return false;
      if (ctx.state.prompt) return false;
      if (ctx.view.ux.autoFocusPausedByDebug) return false;
      if (!ctx.view.ux.pendingFocusErrorCode) return false;
      return (ctx.state.players[0].hand.length === 0 && ctx.state.playsLeft > 0);
    },
    pick: function (ctx) {
      ctx.view.ux.pendingFocusErrorCode = "";
      return MC.ui.focus._pickCenterBtn(ctx.computed, "endTurn");
    }
  },
  {
    id: "OnEnterPlaceReceivedPrompt",
    enabled: function () { return true; },
    when: function (ctx) {
      var pr = ctx.state.prompt;
      var cur = !!(pr && pr.kind === "placeReceived" && pr.p === 0);
      return cur && (!ctx.view.ux.lastPromptForP0 || ctx.view.ux.lastPromptKind !== "placeReceived");
    },
    pick: function (ctx) {
      // First recvProps card in hand row.
      return MC.ui.findBestCursorTarget(ctx.computed.models, [MC.render.ROW_P_HAND], function (it) {
        return it && it.kind === "hand" && it.loc && it.loc.zone === "recvProps" && it.loc.p === 0;
      });
    }
  },
  {
    id: "OnEnterReplaceWindowPrompt_FocusWild",
    enabled: function () { return true; },
    when: function (ctx) {
      var pr = ctx.state.prompt;
      var cur = !!(pr && pr.kind === "replaceWindow" && pr.p === 0);
      return cur && (!ctx.view.ux.lastPromptForP0 || ctx.view.ux.lastPromptKind !== "replaceWindow");
    },
    pick: function (ctx) {
      return MC.ui.pickReplaceWindowWild(ctx.state, ctx.computed);
    }
  },
  {
    id: "OnExitPlaceReceivedPrompt_End",
    enabled: function () { return true; },
    when: function (ctx) {
      if (ctx.state.winnerP !== MC.state.NO_WINNER) return false;
      var pr = ctx.state.prompt;
      var cur = !!(pr && pr.kind === "placeReceived" && pr.p === 0);
      var exited = (ctx.view.ux.lastPromptForP0 && ctx.view.ux.lastPromptKind === "placeReceived" && !cur);
      if (!exited) return false;
      if (ctx.state.activeP !== 0) return false;
      // Common case: last play was Rent and playsLeft is now 0.
      return (ctx.state.playsLeft <= 0);
    },
    pick: function (ctx) {
      return MC.ui.focus._pickCenterBtn(ctx.computed, "endTurn");
    }
  },
  {
    id: "OnExitReplaceWindowPrompt_End",
    enabled: function () { return true; },
    when: function (ctx) {
      if (ctx.state.winnerP !== MC.state.NO_WINNER) return false;
      var pr = ctx.state.prompt;
      var cur = !!(pr && pr.kind === "replaceWindow" && pr.p === 0);
      var exited = (ctx.view.ux.lastPromptForP0 && ctx.view.ux.lastPromptKind === "replaceWindow" && !cur);
      if (!exited) return false;
      if (ctx.state.activeP !== 0) return false;
      return (ctx.state.playsLeft <= 0);
    },
    pick: function (ctx) {
      return MC.ui.focus._pickCenterBtn(ctx.computed, "endTurn");
    }
  },
  {
    id: "OnEnterRespondActionPrompt_FocusTarget",
    enabled: function () { return true; },
    when: function (ctx) {
      var pr = ctx.state.prompt;
      var cur = !!(pr && pr.kind === "respondAction" && pr.p === 0);
      return cur && (!ctx.view.ux.lastPromptForP0 || ctx.view.ux.lastPromptKind !== "respondAction");
    },
    pick: function (ctx) {
      var pr = ctx.state.prompt;
      if (!pr || !pr.target || !pr.target.loc) return null;
      var tgt = pr.target;
      // Prefer opponent table row, but fall back to any match.
      return (
        MC.ui.findBestCursorTarget(ctx.computed.models, [MC.render.ROW_OP_TABLE], function (it) {
          return MC.ui.itemMatchesUidLoc(it, tgt.uid, tgt.loc);
        }) ||
        MC.ui.findBestCursorTarget(ctx.computed.models, [0, 1, 2, 3, 4], function (it) {
          return MC.ui.itemMatchesUidLoc(it, tgt.uid, tgt.loc);
        })
      );
    }
  },
  {
    id: "OnEnterPayDebtPrompt_DefaultFocus",
    enabled: function () { return true; },
    when: function (ctx) {
      var pr = ctx.state.prompt;
      var cur = !!(pr && pr.kind === "payDebt" && pr.p === 0);
      return cur && (!ctx.view.ux.lastPromptForP0 || ctx.view.ux.lastPromptKind !== "payDebt");
    },
    pick: function (ctx) {
      return MC.ui.focus._pickPayDebtDefault(ctx.computed);
    }
  },
  {
    id: "OnInvalidActionPayDebt_DefaultFocus",
    enabled: function () { return true; },
    when: function (ctx) {
      var pr = ctx.state.prompt;
      if (!(pr && pr.kind === "payDebt" && pr.p === 0)) return false;
      return (ctx.view.ux.pendingFocusErrorCode === "cant_pay");
    },
    pick: function (ctx) {
      var pick = MC.ui.focus._pickPayDebtDefault(ctx.computed);
      if (pick) ctx.view.ux.pendingFocusErrorCode = "";
      return pick;
    }
  }
];

MC.ui.focus.apply = function (state, view, computed, actions) {
  var nav = actions.nav;
  var a = actions.a;
  var hasNav = !!(nav && (nav.up || nav.down || nav.left || nav.right));
  var hasA = !!(a && (a.tap || a.grabStart));

  // Debug-pause latch: suppress all snapping until the player provides a non-debug input.
  if (view.ux.autoFocusPausedByDebug) {
    if (hasNav) { view.ux.autoFocusPausedByDebug = false; return false; }
    if (hasA) {
      var sel = computed.selected;
      var isDebugBtn = !!(sel && sel.kind === "btn" && sel.row === MC.render.ROW_CENTER &&
        (sel.id === "step" || sel.id === "reset" || sel.id === "nextScenario"));
      if (!isDebugBtn) view.ux.autoFocusPausedByDebug = false;
      return false;
    }

    // While latched, allow preservation only when selection disappears.
    if (!computed.selected) return MC.ui.focus.preserve(state, view, computed);
    return false;
  }

  // Never move the cursor out from under the player during the same tick that they
  // are navigating or confirming; preservation/autofocus is for state churn between ticks.
  if (hasNav || hasA) return false;

  // Always preserve selection stability first.
  var changed = false;
  if (MC.ui.focus.preserve(state, view, computed)) changed = true;

  var ctx = { state: state, view: view, computed: computed, actions: actions };

  var ri;
  for (ri = 0; ri < MC.ui.focus.rules.length; ri++) {
    var r = MC.ui.focus.rules[ri];
    if (!r.enabled(ctx)) continue;
    if (!r.when(ctx)) continue;
    var pick = r.pick(ctx);
    if (pick && pick.row != null && pick.i != null) {
      MC.ui.cursorMoveTo(view, pick);
      view.ux.lastFocusRuleId = r.id;
      return true;
    }
  }

  return changed;
};

// ---- src/70_anim.js ----
// MC.anim: UI-owned animation plumbing (turn events into timed, input-locking “watch moments”).
// This module owns view.anim queue/steps, but still manipulates UI view state
// (mode/menu/targeting) because animations are a UI-owned “watch” moment.

MC.anim.onEvents = function (state, view, events) {
  if (!state || !view || !events || events.length === 0) return;
  var anim = view.anim;

  // Clear overlays: animations are a read-only “watch” moment.
  if (view.mode !== "prompt") view.mode = "browse";
  if (view.menu) view.menu.items = [];
  if (view.targeting) view.targeting.active = false;

  // Config knobs are validated in tests (avoid runtime fallbacks in the cartridge).
  var uiCfg = MC.config.ui;
  var animSpeedMult = uiCfg.animSpeedMult;
  var dealFrames = Math.floor(uiCfg.dealFramesPerCard * animSpeedMult);
  var dealGap = Math.floor(uiCfg.dealGapFrames * animSpeedMult);
  var xferFrames = Math.floor(uiCfg.xferFramesPerCard * animSpeedMult);
  var xferGap = Math.floor(uiCfg.xferGapFrames * animSpeedMult);
  var xferHoldFromFrames = Math.floor(uiCfg.xferHoldFromFrames * animSpeedMult);
  var xferHoldFrames = Math.floor(uiCfg.xferHoldFrames * animSpeedMult);
  var shuffleFrames = Math.floor(uiCfg.shuffleAnimFrames * animSpeedMult);
  var shuffleToastFrames = Math.floor(uiCfg.shuffleToastFrames * animSpeedMult);
  if (shuffleFrames < shuffleToastFrames) shuffleFrames = shuffleToastFrames;

  var didPromptBufOutHold = false;

  function payBufAnchor() {
    var L = MC.config.render.layout;
    var rowCenter = MC.render.ROW_CENTER;
    return { x: L.centerPayBufX, y: L.rowY[rowCenter] + L.centerTopInsetY };
  }

  var i;
  for (i = 0; i < events.length; i++) {
    var ev = events[i];
    if (!ev || !ev.kind) continue;

    if (ev.kind === "reshuffle") {
      // Toast + simple deck animation; input locked until finished.
      MC.ui.toastPush(view, { id: "deck_shuffle", kind: "info", text: "Deck ran out. Shuffling", frames: shuffleToastFrames });
      anim.q.push({
        kind: "shuffle",
        t: 0,
        frames: shuffleFrames,
        // Visual masking: during shuffle, show deck as empty and discard as empty.
        // Conceptually the discard has already been consumed into the deck; we only animate the deck.
        deckNVis: 0,
        discardNVis: 0
      });
      continue;
    }

    if (ev.kind === "draw") {
      var p = ev.p;
      if (!(p === 0 || p === 1)) continue;
      var uids = ev.uids;
      if (uids.length === 0) continue;

      // Find the hand indices for these drawn uids (engine already moved them into hand).
      var hand = state.players[p].hand;
      var handIs = [];
      var j;
      for (j = 0; j < uids.length; j++) {
        var uid = uids[j];
        var k;
        var found = -1;
        for (k = 0; k < hand.length; k++) {
          if (hand[k] === uid) found = k;
        }
        handIs.push(found);
        if (found >= 0) anim.hiddenByP[p][uid] = true;
      }

      anim.q.push({
        kind: "deal",
        p: p,
        uids: uids.slice(),
        handIs: handIs,
        dealFrames: dealFrames,
        gapFrames: dealGap,
        i: 0,
        phase: "move",
        t: 0
      });
    }

    if (ev.kind === "move") {
      var uidM = ev.uid;
      var from = ev.from;
      var to = ev.to;
      if (!uidM || !from || !to) continue;
      var fz = String(from.zone || "");
      var tz = String(to.zone || "");
      var selectedByP = ev.selectedByP;

      var isPromptBufOut = (fz === "promptBuf");
      var isPromptBufIn = (tz === "promptBuf");
      var isSlySteal = (fz === "setProps" && tz === "recvProps");

      // Curated transfer animations for MVP polish.
      var animate = false;
      if (isPromptBufIn) {
        // payDebt selection into the buffer: animate only when AI chose it.
        animate = (selectedByP != null && selectedByP !== 0);
      } else if (isPromptBufOut) {
        if (tz === "bank") animate = true;
        else if (tz === "recvProps") animate = true;
      } else if (isSlySteal) {
        animate = true; // to.p may be 0 (visible) or 1 (invisible -> fly to buffer anchor)
      }
      if (!animate) continue;

      if (xferFrames < 1) xferFrames = 1;
      if (xferGap < 0) xferGap = 0;

      // Source position is taken from the last rendered snapshot when possible.
      var fromX = null, fromY = null;
      if (fz === "promptBuf") {
        var pb = payBufAnchor();
        fromX = pb.x;
        fromY = pb.y;
      } else if (anim.lastPosByUid && anim.lastPosByUid[uidM]) {
        fromX = anim.lastPosByUid[uidM].x;
        fromY = anim.lastPosByUid[uidM].y;
      } else {
        var pb2 = payBufAnchor();
        fromX = pb2.x;
        fromY = pb2.y;
      }

      // Source presentation hints (used for hold-at-source readability).
      var fromRow = MC.render.ROW_CENTER;
      var fromFlip180 = false;
      var fromStackKey = null;
      if (fz === "bank") {
        fromRow = (from.p === 0) ? MC.render.ROW_P_HAND : MC.render.ROW_OP_HAND;
        fromFlip180 = (fromRow === MC.render.ROW_OP_HAND);
        fromStackKey = "bank:p" + from.p + ":row" + fromRow;
      } else if (fz === "setProps" || fz === "setHouse") {
        fromRow = (from.p === 0) ? MC.render.ROW_P_TABLE : MC.render.ROW_OP_TABLE;
        fromFlip180 = (fromRow === MC.render.ROW_OP_TABLE);
        fromStackKey = "set:p" + from.p + ":set" + from.setI;
      } else if (fz === "recvProps") {
        fromRow = (from.p === 0) ? MC.render.ROW_P_HAND : MC.render.ROW_OP_HAND;
        fromFlip180 = (fromRow === MC.render.ROW_OP_HAND);
        fromStackKey = "recvProps:p" + from.p + ":row" + fromRow;
      } else if (fz === "hand") {
        fromRow = (from.p === 0) ? MC.render.ROW_P_HAND : MC.render.ROW_OP_HAND;
        fromFlip180 = (fromRow === MC.render.ROW_OP_HAND);
      }

      // Hide the moved card until it “lands” (presentation-only).
      anim.hiddenByUid[uidM] = true;

      // Keep the pay/transfer buffer visible while promptBuf-sourced transfers drain out.
      if (isPromptBufOut) {
        anim.payBufUids.push(uidM);
      }

      var holdFrom = 0;
      if (selectedByP != null && selectedByP !== 0 && fz !== "promptBuf") holdFrom = xferHoldFromFrames;

      // After the final payDebt selection, promptBuf can drain immediately; insert a short hold
      // before the first promptBuf->dest transfer so the player can register the full buffer.
      if (isPromptBufOut && !didPromptBufOutHold && xferHoldFrames > 0) {
        anim.q.push({ kind: "xferHold", t: 0, frames: xferHoldFrames });
        didPromptBufOutHold = true;
      }

      anim.q.push({
        kind: "xfer",
        uid: uidM,
        fromX: fromX,
        fromY: fromY,
        fromRow: fromRow,
        fromFlip180: fromFlip180,
        fromStackKey: fromStackKey,
        to: {
          p: (to.p != null) ? to.p : 0,
          zone: tz,
          setI: (to.setI != null) ? to.setI : null,
          i: (to.i != null) ? to.i : null
        },
        fromPromptBuf: !!isPromptBufOut,
        t: 0,
        holdFromFrames: holdFrom,
        frames: xferFrames,
        gapFrames: xferGap,
        phase: (holdFrom > 0) ? "holdFrom" : "move"
      });
    }
  }

  // Start immediately if idle so the very first queued step can be presented this frame.
  // (MC.ui.step ticks anim before commands apply; without this, new anims would start 1 frame later.)
  if (!anim.active && anim.q && anim.q.length > 0) {
    anim.active = anim.q.shift();
  }

  anim.lock = !!(anim.active || (anim.q && anim.q.length));
};

// Game-start animation orchestration.
// Default newGame mutates directly into the final 5/7 start state; this function hides cards
// and schedules synthetic draw events to make the start readable.
MC.anim.beginGameStart = function (state, view) {
  if (!state || !view || !view.anim) return false;
  var anim = view.anim;
  if (!state.players || !state.players[0] || !state.players[1]) return false;
  var h0 = state.players[0].hand ? state.players[0].hand.length : 0;
  var h1 = state.players[1].hand ? state.players[1].hand.length : 0;
  var starterP = state.activeP;
  if (!(starterP === 0 || starterP === 1)) return false;

  // Only arm for the canonical default start shape (avoid surprising animations in scenarios).
  if (!((h0 === 7 && h1 === 5) || (h0 === 5 && h1 === 7))) return false;

  // Clear any prior anim state.
  anim.q = [];
  anim.active = null;
  anim.lock = false;
  anim.hiddenByP = [{}, {}];
  anim.hiddenByUid = {};
  anim.payBufUids = [];
  if (anim.lastPosByUid) {
    var kPos;
    for (kPos in anim.lastPosByUid) delete anim.lastPosByUid[kPos];
  }

  // Initial 5-card deal per player (starter has 2 extra cards appended).
  var deal0 = state.players[0].hand.slice(0, 5);
  var deal1 = state.players[1].hand.slice(0, 5);

  // Starter's draw-2 cards are the last 2 in their hand.
  var handS = state.players[starterP].hand;
  var draw2 = [];
  if (handS && handS.length >= 7) {
    draw2 = [handS[handS.length - 2], handS[handS.length - 1]];
  }

  // Hide the starter's draw-2 until after the initial deal + toast.
  var i;
  for (i = 0; i < draw2.length; i++) {
    var uidD = draw2[i];
    if (uidD) anim.hiddenByP[starterP][uidD] = true;
  }

  // Schedule initial deal as synthetic draws.
  MC.anim.onEvents(state, view, [
    { kind: "draw", p: 0, uids: deal0 },
    { kind: "draw", p: 1, uids: deal1 }
  ]);

  // Then show toast + deal the starter's draw-2.
  var hold = Math.floor(MC.config.ui.gameStartToastFrames * MC.config.ui.animSpeedMult);
  if (!(hold > 0)) hold = 1;
  anim.q.push({
    kind: "gameStart",
    starterP: starterP,
    drawUids: draw2.slice(),
    didToast: false,
    t: 0,
    frames: hold
  });

  anim.lock = true;
  return true;
};

MC.anim.tick = function (state, view) {
  if (!view) return;
  var anim = view.anim;

  // Start next step if idle.
  if (!anim.active && anim.q && anim.q.length > 0) {
    anim.active = anim.q.shift();
  }

  var a = anim.active;
  if (!a) {
    anim.lock = false;
    return;
  }

  if (a.kind === "shuffle") {
    a.t += 1;
    if (a.t >= a.frames) anim.active = null;
    anim.lock = !!(anim.active || (anim.q && anim.q.length));
    return;
  }

  if (a.kind === "gameStart") {
    if (!a.didToast) {
      var starterP = a.starterP;
      var txt = (starterP === 0) ? "You start" : "AI starts";
      MC.ui.toastPush(view, { id: "game_start", kind: "info", text: txt, frames: Math.floor(MC.config.ui.gameStartToastFrames * MC.config.ui.animSpeedMult) });
      a.didToast = true;
    }

    a.t += 1;
    if (a.t >= a.frames) {
      var starterP2 = a.starterP;
      var uids2 = a.drawUids;
      if (uids2 && uids2.length > 0) {
        MC.anim.onEvents(state, view, [{ kind: "draw", p: starterP2, uids: uids2.slice() }]);
      }
      anim.active = null;
    }

    anim.lock = !!(anim.active || (anim.q && anim.q.length));
    return;
  }

  if (a.kind === "xferHold") {
    a.t += 1;
    if (a.t >= a.frames) anim.active = null;
    anim.lock = !!(anim.active || (anim.q && anim.q.length));
    return;
  }

  if (a.kind === "xfer") {
    var uidX = a.uid;
    if (!uidX) { anim.active = null; anim.lock = !!(anim.q && anim.q.length); return; }

    // Keep the moved uid hidden from its state location for the full duration of the step.
    // (Important for multi-step chains where the same uid flies into promptBuf, then out.)
    if (a.phase !== "gap") anim.hiddenByUid[uidX] = true;

    a.t += 1;
    if (a.phase === "holdFrom") {
      if (a.t >= a.holdFromFrames) {
        a.phase = "move";
        a.t = 0;
      }
    } else if (a.phase === "move") {
      if (a.t >= a.frames) {
        // Reveal at destination (but promptBuf is not a rendered zone; buffer is drawn separately).
        var tzX = String(a.to.zone || "");
        if (tzX !== "promptBuf") delete anim.hiddenByUid[uidX];
        if (a.fromPromptBuf) {
          var bi = anim.payBufUids.indexOf(uidX);
          if (bi >= 0) anim.payBufUids.splice(bi, 1);
        }

        a.t = 0;
        if (a.gapFrames > 0) {
          a.phase = "gap";
        } else {
          anim.active = null;
        }
      }
    } else {
      // gap
      if (a.t >= a.gapFrames) {
        anim.active = null;
      }
    }

    anim.lock = !!(anim.active || (anim.q && anim.q.length));
    return;
  }

  if (a.kind === "deal") {
    var p = a.p;
    var uids = a.uids;
    if (uids.length === 0) { anim.active = null; anim.lock = !!(anim.q && anim.q.length); return; }

    if (a.i >= uids.length) { anim.active = null; anim.lock = !!(anim.q && anim.q.length); return; }

    a.t += 1;
    if (a.phase === "move") {
      if (a.t >= a.dealFrames) {
        // Reveal current card.
        var uid = uids[a.i];
        delete anim.hiddenByP[p][uid];
        a.i += 1;
        a.t = 0;
        if (a.i >= uids.length) {
          anim.active = null;
        } else {
          a.phase = "gap";
        }
      }
    } else {
      // gap
      if (a.t >= a.gapFrames) {
        a.phase = "move";
        a.t = 0;
      }
    }

    anim.lock = !!(anim.active || (anim.q && anim.q.length));
    return;
  }

  // Unknown anim kind: drop it.
  anim.active = null;
  anim.lock = !!(anim.q && anim.q.length);
};

// Treat cursor-flash feedback as an animation/fx owned here.
MC.anim.feedbackError = function (view, code, msg) {
  if (!view || !view.feedback) return;
  code = String(code || "error");
  msg = String(msg || "");

  var fb = view.feedback;
  fb.lastCode = code;

  // Focus policy can optionally respond to the *next* idle tick after an invalid action.
  // Keep the first error until consumed so repeated blinks don't overwrite the trigger.
  if (view.ux && !view.ux.pendingFocusErrorCode) view.ux.pendingFocusErrorCode = code;
  var attempts = fb.attemptsByCode[code] || 0;
  attempts += 1;
  fb.attemptsByCode[code] = attempts;

  // Always blink; only show message on repeated attempts.
  fb.blinkFrames = 18;
  fb.blinkPhase = 0;

  if (attempts >= 2 && msg) {
    // Toast UI lives in MC.ui; this just triggers it as part of the feedback FX.
    MC.ui.toastPush(view, { id: "err:" + code, kind: "error", text: msg, frames: MC.config.ui.toast.errorFrames });
  }
};

MC.anim.feedbackTick = function (view) {
  if (!view || !view.feedback) return;
  var fb = view.feedback;

  var blinkFrames = fb.blinkFrames;
  if (blinkFrames > 0) {
    blinkFrames = blinkFrames - 1;
    fb.blinkFrames = blinkFrames;
    // 2 blinks: toggle every 3 frames.
    fb.blinkPhase = Math.floor(blinkFrames / 3);
  } else {
    fb.blinkFrames = 0;
    fb.blinkPhase = 0;
    fb.lastCode = "";
    if (view.ux) view.ux.pendingFocusErrorCode = "";
  }
};

// Presentation (render-facing view of state/models).
// Renderer should not depend on `view.anim`; instead, UI calls this after building models.
MC.anim.present = function (state, view, computed) {
  if (!state || !view || !computed || !computed.models) return computed;
  var anim = view.anim;
  var a = anim ? anim.active : null;

  // Reset any prior overlay presentation (computed is rebuilt each call, but be explicit).
  computed.animOverlay = null;

  // Provide highlight color for render (cursor flash on disallowed actions).
  // Default highlight color lives in render config.
  var colDefault = MC.config.render.style.colHighlight;
  var hl = colDefault;
  if (view.feedback && view.feedback.blinkFrames > 0) {
    if ((view.feedback.blinkPhase % 2) === 0) hl = MC.Pal.Red;
  }
  computed.highlightCol = hl;

  // Hide in-flight dealt cards until revealed (presentation-only).
  if (anim && anim.hiddenByP) {
    var rowPH = MC.render.ROW_P_HAND;
    var rowOH = MC.render.ROW_OP_HAND;
    var rows = [rowOH, rowPH];
    var ri;
    for (ri = 0; ri < rows.length; ri++) {
      var row = rows[ri];
      var rm = computed.models[row];
      if (!rm || !rm.items) continue;
      var p = (row === rowPH) ? 0 : 1;
      var hidden = anim.hiddenByP[p];
      if (!hidden) continue;
      var out = [];
      var i;
      for (i = 0; i < rm.items.length; i++) {
        var it0 = rm.items[i];
        if (!it0 || it0.kind !== "hand") { out.push(it0); continue; }
        var uid0 = it0.uid;
        if (hidden[uid0]) continue;
        out.push(it0);
      }
      rm.items = out;

      // If the cursor is on this row, recompute selection from the filtered items so
      // hidden cards can't be revealed via the selection redraw path in the renderer.
      if (view.cursor && view.cursor.row === row) {
        if (rm.items.length === 0) computed.selected = null;
        else {
          var ci = MC.ui.clampI(view.cursor.i, rm.items.length);
          computed.selected = rm.items[ci];
        }
      }
    }
  }

  // Hide in-flight transfer cards until they “land” (presentation-only).
  if (anim && anim.hiddenByUid) {
    var hidU = anim.hiddenByUid;
    var rowH;
    for (rowH = 0; rowH < computed.models.length; rowH++) {
      var rmH = computed.models[rowH];
      if (!rmH || !rmH.items) continue;
      var outH = [];
      var ii;
      for (ii = 0; ii < rmH.items.length; ii++) {
        var itH = rmH.items[ii];
        if (!itH || !itH.uid) { outH.push(itH); continue; }
        if (hidU[itH.uid]) continue;
        outH.push(itH);
      }
      rmH.items = outH;

      // If the cursor is on this row, recompute selection from the filtered items so
      // hidden cards can't be revealed via the selection redraw path in the renderer.
      if (view.cursor && view.cursor.row === rowH) {
        if (rmH.items.length === 0) computed.selected = null;
        else {
          var ci2 = MC.ui.clampI(view.cursor.i, rmH.items.length);
          computed.selected = rmH.items[ci2];
        }
      } else if (computed.selected && computed.selected.uid && hidU[computed.selected.uid]) {
        computed.selected = null;
      }
    }
  }

  // Avoid duplicating in-flight cards in the center buffer stack.
  // - promptBuf->dest: remove the leaving card from the stack during flight
  // - src->promptBuf (AI selection): don't show the card in the stack until its flight lands
  var hidePayBufByUid = {};
  var hidePayBufAny = false;
  function hidePayBuf(uid) {
    if (!uid) return;
    hidePayBufByUid[uid] = true;
    hidePayBufAny = true;
  }

  if (a && a.kind === "xfer" && a.uid && a.phase !== "gap") {
    if (a.fromPromptBuf) hidePayBuf(a.uid);
    var tzH = (a.to && a.to.zone) ? String(a.to.zone) : "";
    if (tzH === "promptBuf") hidePayBuf(a.uid);
  }

  if (anim && anim.q && anim.q.length) {
    var qi;
    for (qi = 0; qi < anim.q.length; qi++) {
      var qit = anim.q[qi];
      if (!qit || qit.kind !== "xfer" || !qit.uid || qit.phase === "gap") continue;
      var tzQ = (qit.to && qit.to.zone) ? String(qit.to.zone) : "";
      if (tzQ === "promptBuf") hidePayBuf(qit.uid);
    }
  }

  if (hidePayBufAny) {
    var rowCenterPB = MC.render.ROW_CENTER;
    var rmPB = computed.models[rowCenterPB];
    if (rmPB && rmPB.overlayItems) {
      var oiPB;
      for (oiPB = 0; oiPB < rmPB.overlayItems.length; oiPB++) {
        var ovPB = rmPB.overlayItems[oiPB];
        if (!ovPB || ovPB.kind !== "payBuf" || !ovPB.uids) continue;
        var uOutPB = [];
        var uiPB;
        for (uiPB = 0; uiPB < ovPB.uids.length; uiPB++) {
          var uidPB = ovPB.uids[uiPB];
          if (!uidPB) continue;
          if (hidePayBufByUid[uidPB]) continue;
          uOutPB.push(uidPB);
        }
        ovPB.uids = uOutPB;
        ovPB.nVis = uOutPB.length;
      }
    }
  }

  if (!a || !a.kind) return computed;

  // When AI selects a payment card (xfer-to-promptBuf), keep the source
  // stack visually stable during the hold-at-source so it doesn't collapse under the highlight.
  if (a.kind === "xfer" && a.phase === "holdFrom" && String(a.to.zone || "") === "promptBuf") {
    var rowF = a.fromRow;
    var stKeyF = a.fromStackKey;
    if (stKeyF && anim && anim.lastPosByUid && computed.models[rowF] && computed.models[rowF].items) {
      var rmF = computed.models[rowF];
      var camF = (view.camX && view.camX[rowF] != null) ? view.camX[rowF] : 0;
      var Lf = MC.config.render.layout;

      var iF;
      for (iF = 0; iF < rmF.items.length; iF++) {
        var itF = rmF.items[iF];
        if (!itF || !itF.uid || !itF.stackKey) continue;
        if (String(itF.stackKey) !== String(stKeyF)) continue;
        var posF = anim.lastPosByUid[itF.uid];
        if (!posF) continue;
        itF.x = posF.x + camF;
        itF.y = posF.y;
      }

      // Recompute bounds to keep camera stable while frozen.
      var minXF = 999999, maxXF = -999999;
      for (iF = 0; iF < rmF.items.length; iF++) {
        var itB = rmF.items[iF];
        if (!itB || itB.x == null || itB.w == null) continue;
        var xFaceB = itB.x;
        var xLoB = xFaceB;
        var xHiB = xFaceB + itB.w - 1;
        var kindB = String(itB.kind || "");
        var fanB = (itB.fanDir != null) ? itB.fanDir : 0;
        if (kindB === "hand") {
          xLoB = xFaceB + Lf.shadowBarDx;
        } else if (kindB === "bank" || kindB === "setProp" || kindB === "setHouse") {
          if (fanB < 0) xHiB = xFaceB + itB.w;
          else xLoB = xFaceB + Lf.shadowBarDx;
        }
        if (xLoB < minXF) minXF = xLoB;
        if (xHiB > maxXF) maxXF = xHiB;
      }
      rmF.minX = (minXF === 999999) ? 0 : minXF;
      rmF.maxX = (maxXF === -999999) ? 0 : maxXF;
    }
  }

  var rowCenter = MC.render.ROW_CENTER;
  var rmC = computed.models[rowCenter];

  if (a.kind === "shuffle") {
    // Drive deck/discard pile presentation via model item hints.
    if (rmC && rmC.items) {
      var i;
      for (i = 0; i < rmC.items.length; i++) {
        var it = rmC.items[i];
        if (!it || !it.kind) continue;
        if (it.kind === "deck") {
          it.nVis = (a.deckNVis != null) ? a.deckNVis : null;
          // Cycle 0/1/2 underlayers to suggest shuffling.
          var phase = a.t % 12;
          var layers = 0;
          if (phase >= 4 && phase < 8) layers = 1;
          else if (phase >= 8) layers = 2;
          it.pileLayers = layers;
        } else if (it.kind === "discard") {
          // Discard is conceptually consumed at reshuffle time.
          it.nVis = 0;
          it.topUidVis = 0;
        }
      }
    }
    return computed;
  }

  if (a.kind === "deal") {
    if (a.phase !== "move") return computed;
    var p = a.p;
    var uids = a.uids;
    var handIs = a.handIs;
    var iCard = a.i;
    if (iCard < 0 || iCard >= uids.length) return computed;

    var frames = a.dealFrames;
    if (frames < 1) frames = 1;
    var t = a.t;
    if (t < 0) t = 0;
    if (t > frames) t = frames;
    var u = t / frames;

    // Find deck position from computed center-row model.
    var deckX = null, deckY = null;
    if (rmC && rmC.items) {
      var j;
      for (j = 0; j < rmC.items.length; j++) {
        var it2 = rmC.items[j];
        if (it2 && it2.kind === "deck") { deckX = it2.x; deckY = it2.y; break; }
      }
    }
    if (deckX == null || deckY == null) return computed;

    var rowHand = (p === 0) ? MC.render.ROW_P_HAND : MC.render.ROW_OP_HAND;

    var camCenter = view.camX[rowCenter];
    var camH = view.camX[rowHand];

    var L = MC.config.render.layout;
    var padX = L.rowPadX;
    var xHandStart = (p === 0) ? padX : (L.screenW - padX - L.faceW);
    var handStep = (p === 0) ? L.handStrideX : (-L.handStrideX);
    var handI = handIs[iCard];
    if (handI < 0) return computed;

    var xToW = xHandStart + handI * handStep;
    var yToW = L.rowY[rowHand] + 1;

    // Screen-space endpoints (camera-adjusted).
    var xFromS = (deckX - camCenter);
    var yFromS = deckY;
    var xToS = (xToW - camH);
    var yToS = yToW;

    var x = Math.floor(xFromS + (xToS - xFromS) * u);
    var y = Math.floor(yFromS + (yToS - yFromS) * u);

    computed.animOverlay = {
      kind: "dealCard",
      x: x,
      y: y,
      p: p,
      uid: uids[iCard]
    };
    return computed;
  }

  if (a.kind === "xfer") {
    if (a.phase === "gap") return computed;
    var framesX = a.frames;
    if (framesX < 1) framesX = 1;
    var uX = 0;
    if (a.phase === "move") {
      var tX = a.t;
      if (tX < 0) tX = 0;
      if (tX > framesX) tX = framesX;
      uX = tX / framesX;
    }

    function payBufAnchor() {
      var Lp = MC.config.render.layout;
      var rowC = MC.render.ROW_CENTER;
      return { x: Lp.centerPayBufX, y: Lp.rowY[rowC] + Lp.centerTopInsetY, flip180: false };
    }

    function screenPosForLoc(loc) {
      if (!loc) return null;
      var p = loc.p;
      var z = String(loc.zone || "");
      var L = MC.config.render.layout;

      // Prompt buffer and AI received props are not rendered; use the center buffer anchor.
      if (z === "promptBuf") return payBufAnchor();
      if (z === "recvProps" && p === 1) {
        var rowHandO = MC.render.ROW_OP_HAND;
        var camO = (view.camX && view.camX[rowHandO] != null) ? view.camX[rowHandO] : 0;
        var idxO = (loc.i != null) ? loc.i : 0;
        var xWO = (L.screenW - L.rowPadX - L.faceW) - idxO * L.handStrideX;
        var yWO = MC.layout.faceYForRow(rowHandO);
        return { x: xWO - camO, y: yWO, flip180: true };
      }

      if (z === "recvProps" && p === 0) {
        var rowHand = MC.render.ROW_P_HAND;
        var camH = (view.camX && view.camX[rowHand] != null) ? view.camX[rowHand] : 0;
        var idxR = (loc.i != null) ? loc.i : 0;
        var xW = L.rowPadX + idxR * L.handStrideX;
        var yW = MC.layout.faceYForRow(rowHand);
        return { x: xW - camH, y: yW, flip180: false };
      }

      if (z === "bank") {
        var rowB = (p === 0) ? MC.render.ROW_P_HAND : MC.render.ROW_OP_HAND;
        var rmB = computed.models[rowB];
        var stKeyB = "bank:p" + p + ":row" + rowB;
        var stB = (rmB && rmB.stacks) ? rmB.stacks[stKeyB] : null;
        if (!stB) return null;
        var camB = (view.camX && view.camX[rowB] != null) ? view.camX[rowB] : 0;
        var depthB = (loc.i != null) ? loc.i : 0;
        var xBW = stB.x0 + depthB * stB.stride * stB.fanDir;
        return { x: xBW - camB, y: stB.y, flip180: (rowB === MC.render.ROW_OP_HAND) };
      }

      if (z === "setProps") {
        var rowT = (p === 0) ? MC.render.ROW_P_TABLE : MC.render.ROW_OP_TABLE;
        var rmT = computed.models[rowT];
        var stKeyT = "set:p" + p + ":set" + loc.setI;
        var stT = (rmT && rmT.stacks) ? rmT.stacks[stKeyT] : null;
        if (!stT) return null;
        var camT = (view.camX && view.camX[rowT] != null) ? view.camX[rowT] : 0;
        var depthT = (loc.i != null) ? loc.i : 0;
        var xTW = stT.x0 + depthT * stT.stride * stT.fanDir;
        return { x: xTW - camT, y: stT.y, flip180: (rowT === MC.render.ROW_OP_TABLE) };
      }

      return null;
    }

    var toPos = screenPosForLoc(a.to);
    if (!toPos) return computed;

    var xFromS = a.fromX;
    var yFromS = a.fromY;
    var xToS = toPos.x;
    var yToS = toPos.y;

    var xX = Math.floor(xFromS + (xToS - xFromS) * uX);
    var yX = Math.floor(yFromS + (yToS - yFromS) * uX);

    computed.animOverlay = {
      kind: "moveCard",
      x: xX,
      y: yX,
      uid: a.uid,
      flip180: !!((a.phase === "holdFrom" || (a.phase === "move" && a.t === 0)) ? a.fromFlip180 : toPos.flip180),
      outlinePal: (a.phase === "holdFrom") ? MC.Pal.Green : null
    };
    return computed;
  }

  return computed;
};

// ---- src/80_title.js ----
// MC.title: boot title screen.
(function initTitleModule() {
  var T = MC.title;

  // Local state (kept minimal for now).
  T.st = { menuI: 0, confirm: null };
  T.ctrl = MC.controls.newState();
  T.toastView = { toasts: [] };

  function printShadow(txt, x, y, col, opts) {
    txt = String(txt);
    if (opts == null) opts = {};
    var scale = (opts.scale == null) ? 1 : opts.scale;
    var small = !!opts.small;
    var shadowCol = (opts.shadowCol == null) ? MC.Pal.Black : opts.shadowCol;
    var dx = (opts.dx == null) ? 1 : opts.dx;
    var dy = (opts.dy == null) ? 1 : opts.dy;
    // fixed=false => proportional font (better kerning than fixed-width).
    print(txt, x + dx, y + dy, shadowCol, false, scale, small);
    return print(txt, x, y, col, false, scale, small);
  }

  function drawTiledBg(tc, W, H) {
    if (!tc || !tc.bgTileEnabled) return;
    if (typeof spr !== "function") return;
    var tid = tc.bgTileSprId;
    var ck = tc.bgTileColorkey;
    var xT, yT;
    for (yT = 0; yT < H; yT += 16) {
      for (xT = 0; xT < W; xT += 16) {
        spr(tid, xT, yT, ck, 1, 0, 0, 2, 2);
      }
    }
  }

  function drawControlsTable(tc, Pal, cx, cy, cw) {
    // Table-style layout (no borders):
    // header: Controls | Controller | Keyboard
    // rows: Move/Confirm/Cancel/Inspect
    var x0 = cx + 2;
    var x1 = cx + Math.floor(cw * 0.34);
    var x2 = cx + Math.floor(cw * 0.73);
    var y = cy + 1;
    var dy = 8;

    printShadow("Controls", x0, y, Pal.White, { small: true, shadowCol: Pal.Black });
    printShadow("Controller", x1, y, Pal.LightGrey, { small: true, shadowCol: Pal.Black });
    printShadow("Keyboard", x2, y, Pal.LightGrey, { small: true, shadowCol: Pal.Black });
    y += dy;

    function row(label, ctrl, kb) {
      printShadow(label, x0, y, Pal.LightGrey, { small: true, shadowCol: Pal.Black });
      printShadow(ctrl, x1, y, Pal.Yellow, { small: true, shadowCol: Pal.Black });
      printShadow(kb, x2, y, Pal.Cyan, { small: true, shadowCol: Pal.Black });
      y += dy;
    }

    row("Move", "D-pad", "Arrows");
    row("Confirm", "A", "Z");
    row("Cancel", "B", "X");
    row("Inspect", "X", "A");
  }

  function wrapI(i, n) {
    if (n <= 0) return 0;
    i = i % n;
    if (i < 0) i += n;
    return i;
  }

  function titleClearToasts(toastView) {
    toastView.toasts = [];
  }

  function titlePushToast(toastView, cfg, kind, text) {
    text = String(text || "");
    var id = "title:" + text;
    var frames = (kind === "error") ? cfg.ui.toast.errorFrames : cfg.ui.toast.infoFrames;
    MC.ui.toastPush(toastView, { id: id, kind: kind, text: text, frames: frames });
  }

  function titleBuildMenuItems(hasSession, devAvail, toolsOn) {
    var menuItems = [
      { id: "startNewGame", text: "New Game", enabled: true },
      { id: "continueGame", text: "Continue", enabled: hasSession },
      { id: "howToPlay", text: "How to Play", enabled: true }
    ];
    if (devAvail) {
      menuItems.push({ id: "toggleDev", text: (toolsOn ? "Dev: ON" : "Dev: OFF"), enabled: true });
    }
    return menuItems;
  }

  function titleEnterConfirmOverwrite(st, toastView) {
    st.confirm = "overwriteNewGame";
    titleClearToasts(toastView);
    var text = "Overwrite current game?\nA:Confirm  B:Cancel";
    MC.ui.toastPush(toastView, { id: "title:" + text, kind: "prompt", text: text, persistent: true });
  }

  function titleStep(st, cfg, actions, toastView, menuItems, hasSession) {
    var intent = null;
    var nItems = menuItems.length;
    st.menuI = wrapI(st.menuI, nItems);

    // Confirm state: ignore nav and interpret A/B as confirm/cancel.
    if (String(st.confirm || "") === "overwriteNewGame") {
      if (actions.b && actions.b.pressed) {
        st.confirm = null;
        titleClearToasts(toastView);
      } else if (actions.a && actions.a.tap) {
        st.confirm = null;
        titleClearToasts(toastView);
        intent = { kind: "startNewGame" };
      }
      return intent;
    }

    // Menu navigation.
    if (actions.nav && actions.nav.up) st.menuI = wrapI(st.menuI - 1, nItems);
    if (actions.nav && actions.nav.down) st.menuI = wrapI(st.menuI + 1, nItems);

    // Activate selection.
    if (actions.a && actions.a.tap) {
      var itSel = menuItems[st.menuI];
      if (itSel && itSel.enabled) {
        if (itSel.id === "startNewGame") {
          if (hasSession) {
            titleEnterConfirmOverwrite(st, toastView);
          } else {
            titleClearToasts(toastView);
            intent = { kind: "startNewGame" };
          }
        }
        else if (itSel.id === "continueGame") {
          titleClearToasts(toastView);
          intent = { kind: "continueGame" };
        }
        else if (itSel.id === "howToPlay") {
          titleClearToasts(toastView);
          intent = { kind: "howToPlay" };
        }
        else if (itSel.id === "toggleDev") {
          MC.debug.toolsOn = !MC.debug.toolsOn;
          titlePushToast(toastView, cfg, "info", MC.debug.toolsOn ? "Dev tools enabled" : "Dev tools disabled");
        }
      } else if (itSel) {
        // Disabled feedback (toast).
        var msg = "Not available";
        if (itSel.id === "continueGame") msg = "No game to continue";
        titlePushToast(toastView, cfg, "error", msg);
      }
    }

    return intent;
  }

  function drawMenuItem(tc, Pal, leftW, menuW, mxA, mxT, my0, dy, gap, i, text, selected, enabled) {
    var y0 = my0 + i * (dy + gap);
    var padY = tc.menuItemBoxPadY;
    var xBox = leftW + 2;
    var wBox = menuW - 8;
    var hBox = dy - 2;
    // IMPORTANT: title renders in vbank(1) with transparency index = 15,
    // so avoid using palette index 15 for UI borders (it becomes see-through).
    // Use a consistent inactive border and only "light up" enabled selections.
    var colB = selected && enabled ? Pal.White : Pal.Grey;
    var colT = enabled ? (selected ? Pal.White : Pal.LightGrey) : Pal.Grey;
    if (tc.menuItemBoxes) {
      rect(xBox, y0 - padY, wBox, hBox + padY, Pal.Black);
      rectb(xBox, y0 - padY, wBox, hBox + padY, colB);
    }
    if (selected) printShadow(">", mxA, y0, enabled ? Pal.White : Pal.Grey, { shadowCol: Pal.Black });
    printShadow(text, mxT, y0, colT, { shadowCol: Pal.Black });
  }

  function drawTitle(cfg, st, menuItems, toastView) {
    var tc = cfg.title;
    var Pal = MC.Pal;

    var W = cfg.screenW;
    var H = cfg.screenH;
    var menuW = tc.menuW;
    var leftW = W - menuW;

    // Background.
    // Render title into vbank(1) so it can use a distinct palette.
    // vbank(1) overlays vbank(0); OVR transparency index lives at 0x03FF8 on vbank(1).
    var hasVbank = (typeof vbank === "function");
    if (hasVbank) {
      // Clear the base bank too, so any transparent pixels in the overlay
      // can't reveal stale game frames underneath.
      vbank(0);
      cls(Pal.DarkBlue);

      vbank(1);
      if (typeof poke === "function") poke(0x03FF8, 15);
    }
    cls(Pal.DarkBlue);
    drawTiledBg(tc, W, H);

    // Logo (placeholder text).
    var logoScale = tc.logoScale;
    var logoX = tc.logoX;
    var logoY = tc.logoY;
    printShadow("MORTGAGE", logoX, logoY, Pal.White, { scale: logoScale, dx: 2, dy: 2 });
    printShadow("CRISIS", logoX + 20, logoY + 20, Pal.Yellow, { scale: logoScale, dx: 2, dy: 2 });

    // Subtitle.
    if (tc.subtitleText) {
      rect(tc.subtitleX - 1, tc.subtitleY - 1, 12 * 8 - 1, 8, Pal.DarkBlue);
      printShadow(String(tc.subtitleText), tc.subtitleX, tc.subtitleY, Pal.LightGrey, { small: true, shadowCol: Pal.Black });
    }

    // Controls legend (bottom-left).
    var cx = tc.controlsX;
    var ch = tc.controlsH;
    var cy = H - tc.controlsBottomY - ch;
    var cw = tc.controlsW;
    if (cw > leftW - cx - 6) cw = leftW - cx - 6;
    if (cw < 60) cw = 60;
    rect(cx - 2, cy - 2, cw + 4, ch + 4, Pal.Black);
    rectb(cx - 2, cy - 2, cw + 4, ch + 4, Pal.Grey);
    drawControlsTable(tc, Pal, cx, cy, cw);

    // Static menu list (right).
    var mxA = leftW + tc.menuArrowX;
    var mxT = leftW + tc.menuTextX;
    var my0 = tc.menuY;
    var dy = tc.menuDy;
    var gap = tc.menuItemGapY;
    if (gap == null) gap = 0;

    var mi;
    for (mi = 0; mi < menuItems.length; mi++) {
      var it = menuItems[mi];
      drawMenuItem(tc, Pal, leftW, menuW, mxA, mxT, my0, dy, gap, mi, it.text, (mi === st.menuI), !!it.enabled);
    }

    // Version.
    var ver = String(cfg.meta.version || "");
    if (ver) {
      var xVer = W + 3 - ver.length * 4;
      if (xVer < 0) xVer = 0;
      var yVer = H - 7;
      if (yVer < 0) yVer = 0;
      printShadow(ver, xVer, yVer, Pal.LightGrey, { small: true });
    }

    // Toasts (reuse in-game toast UI).
    MC.render.drawToasts(toastView);

    // Always restore bank 0 so other modes render normally.
    if (hasVbank) vbank(0);
  }

  T.tick = function (raw) {
    var cfg = MC.config;
    if (!raw) raw = MC.controls.pollGlobals();
    var actions = MC.controls.actions(T.ctrl, raw, cfg.controls);

    // Toast feedback (reuse main UI toast state/timing).
    // Title owns its own toast view so messages don't leak into gameplay.
    var toastView = T.toastView;
    MC.ui.toastsTick(toastView);

    var hasSession = !!(MC.debug && MC.debug.state != null);
    var devAvail = !!(cfg.debug && cfg.debug.enabled);
    var menuItems = titleBuildMenuItems(hasSession, devAvail, !!MC.debug.toolsOn);

    var intent = titleStep(T.st, cfg, actions, toastView, menuItems, hasSession);
    drawTitle(cfg, T.st, menuItems, toastView);

    return intent;
  };
})();

// ---- src/81_howto.js ----
// MC.howto: in-game How to Play screen.
(function initHowtoModule() {
  var H = MC.howto;

  H.ctrl = MC.controls.newState();
  H.st = {
    pageI: 0,
    scrollByPage: [],
    layoutByPage: null,
    layoutForN: 0
  };

  H._demoState = null;

  function clamp(v, lo, hi) {
    if (v < lo) return lo;
    if (v > hi) return hi;
    return v;
  }

  function wrapI(i, n) {
    if (n <= 0) return 0;
    i = i % n;
    if (i < 0) i += n;
    return i;
  }

  function rectSafe(x, y, w, h, c) { rect(x, y, w, h, c); }
  function printExSafe(s, x, y, c, fixed, smallfont) {
    // scale=1 always in this screen for predictable metrics.
    return print(String(s), x, y, c, !!fixed, 1, !!smallfont);
  }

  function ensureDemoState() {
    if (H._demoState) return H._demoState;
    var s = { uidToDefI: [0], totalUids: 0 };
    MC.state.buildAllUids(s);
    H._demoState = s;
    return s;
  }

  function uidForCardId(cardId) {
    var di = (MC.DEF_INDEX_BY_ID && MC.DEF_INDEX_BY_ID[String(cardId)]) != null ? MC.DEF_INDEX_BY_ID[String(cardId)] : -1;
    if (di < 0) return 0;
    var uid = 1;
    var i;
    for (i = 0; i < di; i++) {
      uid += (MC.CARD_DEFS[i] && MC.CARD_DEFS[i].count) ? MC.CARD_DEFS[i].count : 0;
    }
    return uid;
  }

  H.drawMiniCardById = function (cardId, xFace, yFace, assignedColor) {
    if (!MC.render || typeof MC.render.drawMiniCard !== "function") return;
    var uid = uidForCardId(cardId);
    if (!uid) return;
    var s = ensureDemoState();
    MC.render.drawMiniCard(s, uid, xFace, yFace, false, assignedColor);
  };

  function parseMarkupTokens(txt, defaultCol) {
    txt = String(txt || "");
    var tokens = [];
    var curCol = defaultCol;
    var i = 0;

    function pushText(s) {
      if (!s) return;
      tokens.push({ text: s, col: curCol });
    }

    while (i < txt.length) {
      var lt = txt.indexOf("<", i);
      if (lt < 0) { pushText(txt.slice(i)); break; }
      if (lt > i) pushText(txt.slice(i, lt));

      // Try parse a tag.
      var gt = txt.indexOf(">", lt + 1);
      if (gt < 0) { pushText("<"); i = lt + 1; continue; }

      var tag = txt.slice(lt + 1, gt); // without < >
      // Opening: cN
      if (tag.length >= 2 && tag.charAt(0) === "c") {
        var num = tag.slice(1);
        if (/^\d+$/.test(num)) {
          curCol = Number(num);
          i = gt + 1;
          continue;
        }
      }
      // Closing: /c or /cN
      if (tag.length >= 2 && tag.charAt(0) === "/" && tag.charAt(1) === "c") {
        curCol = defaultCol;
        i = gt + 1;
        continue;
      }

      // Not a recognized tag: keep literal.
      pushText("<");
      i = lt + 1;
    }

    return tokens;
  }

  function wordsFromTokens(tokens) {
    var out = [];
    var cur = [];
    var curLen = 0;

    function flush() {
      if (!curLen) { cur = []; return; }
      out.push({ tokens: cur, len: curLen });
      cur = [];
      curLen = 0;
    }

    var ti;
    for (ti = 0; ti < tokens.length; ti++) {
      var t = tokens[ti];
      if (!t || !t.text) continue;
      var s = String(t.text);
      var col = t.col;
      var j = 0;
      while (j < s.length) {
        var ch = s.charAt(j);
        var isSpace = (ch === " " || ch === "\t");
        if (isSpace) {
          flush();
          // Skip consecutive whitespace.
          while (j < s.length && (s.charAt(j) === " " || s.charAt(j) === "\t")) j++;
          continue;
        }
        // Consume a non-space run.
        var k = j;
        while (k < s.length) {
          var ch2 = s.charAt(k);
          if (ch2 === " " || ch2 === "\t") break;
          k++;
        }
        var part = s.slice(j, k);
        cur.push({ text: part, col: col });
        curLen += part.length;
        j = k;
      }
    }
    flush();
    return out;
  }

  function wrapTokens(tokens, maxChars, spaceCol) {
    if (!(maxChars > 0)) return [];
    var words = wordsFromTokens(tokens);
    var lines = [];
    var line = [];
    var lineLen = 0;
    var wi;

    function pushLine() {
      lines.push({ tokens: line, len: lineLen });
      line = [];
      lineLen = 0;
    }

    for (wi = 0; wi < words.length; wi++) {
      var w = words[wi];
      if (!w || !w.len) continue;

      if (w.len > maxChars) {
        // Finish current line, then allow the long word to overflow.
        if (lineLen) pushLine();
        lines.push({ tokens: w.tokens, len: w.len });
        continue;
      }

      if (!lineLen) {
        line = w.tokens.slice();
        lineLen = w.len;
        continue;
      }

      if ((lineLen + 1 + w.len) <= maxChars) {
        line.push({ text: " ", col: spaceCol });
        Array.prototype.push.apply(line, w.tokens);
        lineLen += 1 + w.len;
      } else {
        pushLine();
        line = w.tokens.slice();
        lineLen = w.len;
      }
    }

    if (lineLen) pushLine();
    return lines;
  }

  function layoutPage(page, cfg, textCol, headingCol) {
    var items = [];
    var y = 0;
    var blocks = page && page.blocks ? page.blocks : [];

    var i;
    for (i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      if (!b || !b.kind) continue;

      var yBlock0 = y;

      var demo = b.demo || null;
      var demoLayout = demo ? String(demo.layout || "") : "";
      var demoW = demo && demo.w != null ? demo.w : 0;
      var demoH = demo && demo.h != null ? demo.h : 0;

      var textX = 0;
      var maxW = cfg.contentW + 16;
      if (demo && demoLayout === "left" && demoW > 0) {
        textX = demoW + cfg.demoGapX;
        maxW = cfg.contentW - textX;
        if (maxW < cfg.bodyCharW * 10) maxW = cfg.bodyCharW * 10;
        items.push({ kind: "demo", x: 0, y: yBlock0, w: demoW, h: demoH, draw: demo.draw });
      }

      if (demo && demoLayout === "above" && demoH > 0) {
        items.push({ kind: "demo", x: 0, y: yBlock0, w: demoW, h: demoH, draw: demo.draw });
        y += demoH + cfg.demoGapY;
      }

      if (b.kind === "h") {
        var hTxt = String(b.text || "");
        var parasH = hTxt.split("\n");
        var piH;
        for (piH = 0; piH < parasH.length; piH++) {
          var pH = String(parasH[piH] || "");
          if (!pH.trim()) { y += cfg.headingLineH; continue; }
          var tH = parseMarkupTokens(pH, headingCol);
          var maxCharsH = Math.floor(maxW / cfg.headingCharW);
          var linesH = wrapTokens(tH, maxCharsH, headingCol);
          var liH;
          for (liH = 0; liH < linesH.length; liH++) {
            items.push({ kind: "text", x: textX, y: y, tokens: linesH[liH].tokens, small: false });
            y += cfg.headingLineH - 6;
          }
        }
      }
      else if (b.kind === "p") {
        var pTxt = String(b.text || "");
        var paras = pTxt.split("\n");
        var pi;
        for (pi = 0; pi < paras.length; pi++) {
          var p = String(paras[pi] || "");
          if (!p.trim()) { y += cfg.bodyLineH; continue; }
          var t = parseMarkupTokens(p, textCol);
          var maxChars = Math.floor(maxW / cfg.bodyCharW);
          var lines = wrapTokens(t, maxChars, textCol);
          var li;
          for (li = 0; li < lines.length; li++) {
            items.push({ kind: "text", x: textX, y: y, tokens: lines[li].tokens, small: true });
            y += cfg.bodyLineH;
          }
        }
      }
      else if (b.kind === "bullets") {
        var bulletItems = b.items;
        if (!bulletItems || bulletItems.length === 0) { y += cfg.blockGapY; continue; }
        var bi;
        for (bi = 0; bi < bulletItems.length; bi++) {
          var sIt = String(bulletItems[bi] || "");
          if (!sIt.trim()) continue;
          var tIt = parseMarkupTokens(sIt, textCol);
          var bulletPrefix = "-";
          var prefixW = cfg.bodyCharW * 2; // "- "
          var bulletTextX = textX + prefixW;
          var maxWB = maxW - prefixW;
          if (maxWB < cfg.bodyCharW * 10) maxWB = cfg.bodyCharW * 10;
          var maxCharsB = Math.floor(maxWB / cfg.bodyCharW);
          var linesB = wrapTokens(tIt, maxCharsB, textCol);
          var liB;
          for (liB = 0; liB < linesB.length; liB++) {
            items.push({
              kind: "text",
              x: bulletTextX,
              y: y,
              tokens: linesB[liB].tokens,
              small: true,
              prefix: (liB === 0) ? bulletPrefix : null,
              prefixX: textX
            });
            y += cfg.bodyLineH;
          }
          y += 1;
        }
      }

      // If demo is left-aligned, make sure block height accounts for it.
      if (demo && demoLayout === "left" && demoH > 0) {
        var demoBottom = yBlock0 + demoH;
        if (demoBottom > y) y = demoBottom;
      }

      y += cfg.blockGapY;
    }

    return { items: items, contentH: y };
  }

  function ensureLayouts(cfg, pages) {
    var st = H.st;
    var n = pages.length;
    if (st.layoutByPage && st.layoutForN === n) return;

    var hc = cfg.howto;
    var screenW = cfg.screenW;
    var padX = hc.padX;
    var bodyX0 = padX;
    var bodyX1 = screenW - padX - 1;
    var contentW = bodyX1 - bodyX0 + 1;

    var perCfg = {
      contentW: contentW,
      padX: hc.padX,
      padY: hc.padY,
      demoGapX: hc.demoGapX,
      demoGapY: hc.demoGapY,
      blockGapY: hc.blockGapY,
      headingCharW: hc.headingCharW,
      headingLineH: hc.headingLineH,
      bodyCharW: hc.bodyCharW,
      bodyLineH: hc.bodyLineH
    };

    var layouts = [];
    var i;
    for (i = 0; i < n; i++) {
      layouts[i] = layoutPage(pages[i], perCfg, hc.textCol, hc.headingCol);
    }
    st.layoutByPage = layouts;
    st.layoutForN = n;
  }

  function ensureScrollMemory(nPages) {
    var st = H.st;
    var arr = st.scrollByPage;
    var i;
    for (i = 0; i < nPages; i++) {
      if (arr[i] == null) arr[i] = 0;
    }
    if (arr.length > nPages) arr.length = nPages;
  }

  function pagesFromContent() {
    var c = H.CONTENT;
    var pages = c && c.pages ? c.pages : [];
    if (!pages || !pages.length) return [];
    return pages;
  }

  function drawTokensLine(tokens, x, y, charW, fixed, smallfont, defaultCol) {
    var dx = 0;
    var i;
    for (i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (!t || !t.text) continue;
      var s = String(t.text);
      if (!s) continue;
      var col = (t.col != null) ? t.col : defaultCol;
      var w = print(String(s), x + dx, y, col, !!fixed, 1, !!smallfont);
      if (typeof w === "number" && Number.isFinite(w)) dx += w;
      else dx += s.length * charW;
    }
  }

  function drawHowto(cfg, pages, layout, pageI, scrollY) {
    var hc = cfg.howto;
    var W = cfg.screenW;
    var Hh = cfg.screenH;

    // Background (blue-only; no inner panel).
    cls(hc.bgCol);

    var headerH = hc.headerH;
    var footerH = hc.footerH;
    var bodyY0 = headerH;
    var bodyY1 = Hh - footerH - 1;

    // Header (drawn last; background bar masks any overdraw while scrolling).
    var page = pages[pageI];
    var title = page ? String(page.title || "") : "";

    // Body content window (with padding).
    var contentX0 = hc.padX;
    var contentX1 = W - hc.padX - 1;
    var contentY0 = bodyY0 + hc.padY;
    var contentY1 = bodyY1 - hc.padY;

    // Draw items. Header/footer bars mask any overflow.
    var items = layout ? layout.items : [];
    var itI;
    for (itI = 0; itI < items.length; itI++) {
      var it = items[itI];
      if (!it) continue;
      var yScreen = contentY0 + it.y - scrollY;

      if (it.kind === "demo") {
        if (typeof it.draw === "function") {
          it.draw({
            x: contentX0 + it.x,
            y: yScreen,
            w: it.w,
            h: it.h,
            clipX0: contentX0,
            clipY0: contentY0,
            clipX1: contentX1,
            clipY1: contentY1
          });
        }
        continue;
      }

      if (it.kind === "text") {
        if (it.prefix) {
          printExSafe("- ", contentX0 + it.prefixX, yScreen, hc.textCol, false, true);
        }

        var xx = contentX0 + it.x;
        var charW = it.small ? hc.bodyCharW : hc.headingCharW;
        var toks = it.tokens;
        if (toks && toks.length) {
          drawTokensLine(toks, xx, yScreen, charW, false, !!it.small, hc.textCol);
        }
      }
    }

    // Scrollbar (only when needed).
    var contentH = layout ? layout.contentH : 0;
    var viewH = (contentY1 - contentY0 + 1);
    if (contentH > viewH && viewH > 0) {
      var trackX = contentX1 + 2;
      if (trackX < W - 2) {
        var trackY0 = contentY0;
        var trackH = viewH;
        rectSafe(trackX, trackY0, 2, trackH, hc.borderCol);
        var maxScroll = contentH - viewH;
        var thumbH = Math.floor((viewH * viewH) / contentH);
        if (thumbH < 6) thumbH = 6;
        if (thumbH > trackH) thumbH = trackH;
        var thumbY = trackY0 + Math.floor((scrollY * (trackH - thumbH)) / maxScroll);
        rectSafe(trackX, thumbY, 2, thumbH, hc.accentCol);
      }
    }

    // Header/footer masks (to hide any demo overdraw in the margins).
    if (headerH > 0) rectSafe(0, 0, W, headerH, hc.panelCol);
    if (footerH > 0) rectSafe(0, Hh - footerH, W, footerH, hc.panelCol);
    if (footerH > 0) rectSafe(0, Hh - footerH - 1, W, 1, hc.bgCol);

    // Single-line header: "How to play (1/3): Quick Start" + controls on the right.
    if (headerH > 0) {
      // Separator line under the header bar.
      rectSafe(0, headerH - 1, W, 1, hc.borderCol);
      rectSafe(0, headerH, W, 1, hc.bgCol);

      var controls = "B:Back L/R:Page U/D:Scroll";
      var charW = hc.bodyCharW;
      var yH = Math.floor((headerH - hc.bodyLineH) / 2);
      if (yH < 0) yH = 0;

      var xCtrl = W - hc.padX - controls.length * charW;
      if (xCtrl < hc.padX) xCtrl = hc.padX;
      printExSafe(controls, xCtrl, yH, hc.mutedCol, true, true);

      var prefix = "How to Play (" + (pageI + 1) + "/" + pages.length + "): ";
      var x0 = hc.padX;
      var gapPx = 2 * charW;
      var wPrefix = printExSafe(prefix, x0, yH, hc.mutedCol, false, true);
      var hasPrefixW = (typeof wPrefix === "number" && Number.isFinite(wPrefix));
      if (!hasPrefixW) wPrefix = prefix.length * charW;

      var xTitle = x0 + wPrefix;

      var xMax = xCtrl - gapPx;
      if (xMax < xTitle) xMax = xTitle;

      var availPx = xMax - xTitle;
      var availChars = hasPrefixW ? Math.floor(availPx / charW) : title.length;
      if (availChars < 0) availChars = 0;

      var titleDraw = title;
      if (titleDraw.length > availChars) {
        if (availChars <= 3) titleDraw = titleDraw.slice(0, availChars);
        else titleDraw = titleDraw.slice(0, availChars - 3) + "...";
      }

      if (titleDraw) {
        printExSafe(titleDraw, xTitle, yH, hc.titleCol, false, true);
      }
    }
  }

  H.tick = function (raw) {
    var cfg = MC.config;
    if (!raw) raw = MC.controls.pollGlobals();

    var pages = pagesFromContent();
    if (!pages || pages.length === 0) {
      cls(MC.Pal.Black);
      printExSafe("How to Play", 8, 8, MC.Pal.White, false, false);
      printExSafe("(missing content)", 8, 18, MC.Pal.LightGrey, false, true);
      return null;
    }

    ensureLayouts(cfg, pages);
    ensureScrollMemory(pages.length);

    var st = H.st;
    st.pageI = wrapI(st.pageI, pages.length);

    var actions = MC.controls.actions(H.ctrl, raw, cfg.controls);

    if (actions.b && actions.b.pressed) {
      return { kind: "backToTitle" };
    }

    if (actions.nav && actions.nav.left) st.pageI = wrapI(st.pageI - 1, pages.length);
    if (actions.nav && actions.nav.right) st.pageI = wrapI(st.pageI + 1, pages.length);

    var layout = st.layoutByPage ? st.layoutByPage[st.pageI] : null;

    // Scroll input.
    var hc = cfg.howto;
    var headerH = hc.headerH;
    var footerH = hc.footerH;
    var bodyY0 = headerH;
    var bodyY1 = cfg.screenH - footerH - 1;
    var contentY0 = bodyY0 + hc.padY;
    var contentY1 = bodyY1 - hc.padY;
    var viewH = (contentY1 - contentY0 + 1);
    var contentH = layout ? layout.contentH : 0;
    var maxScroll = (contentH > viewH) ? (contentH - viewH) : 0;

    var scroll = st.scrollByPage[st.pageI];
    if (actions.nav && actions.nav.up) scroll -= hc.scrollStepPx;
    if (actions.nav && actions.nav.down) scroll += hc.scrollStepPx;
    scroll = clamp(scroll, 0, maxScroll);
    st.scrollByPage[st.pageI] = scroll;

    drawHowto(cfg, pages, layout, st.pageI, scroll);
    return null;
  };
})();

// ---- src/82_howto_content.js ----
// How-to-Play content.
// Intended workflow: humans edit strings; small demo draw() blocks are optional.
(function initHowtoContent() {
  var H = MC.howto;

  function demoTwoCards(idA, idB, dx) {
    dx = dx || 20;
    return function (ctx) {
      H.drawMiniCardById(idA, ctx.x, ctx.y);
      H.drawMiniCardById(idB, ctx.x + dx, ctx.y);
    };
  }

  function shadowBarAt(xFace, yFace) {
    var L = MC.config.render.layout;
    var S = MC.config.render.style;
    rect(xFace + L.shadowBarDx, yFace, 1, L.faceH, S.colShadow);
  }

  H.CONTENT = {
    pages: [
      {
        id: "quickStart",
        title: "Quick Start",
        blocks: [
          { kind: "h", text: "Goal" },
          {
            kind: "p",
            text:
              "Be the first player to complete <c4>3</c> property <c4>sets</c>. A set is complete when it has the required number of properties (2, 3, or 4 depending on the color).",
            demo: { layout: "left", w: 30, h: 25, draw: function(ctx) {
              var L = MC.config.render.layout;
              var dx = L.stackStrideX;
              demoTwoCards("wild_cb", "prop_cyan", dx)(ctx);
              shadowBarAt(ctx.x + dx, ctx.y);
            }}
          },

          { kind: "h", text: "On your turn" },
          {
            kind: "bullets",
            items: [
              "<c4>Draw 2</c> cards (or <c4>5</c> if you start the turn with an empty hand).",
              "<c4>Play</c> up to <c4>3</c> cards.",
              "End your turn. If you have more than <c4>7</c> cards, you must <c4>discard</c> down."
            ]
          },

          { kind: "h", text: "Quick tips" },
          {
            kind: "bullets",
            items: [
              "<c4>Tap A</c> on a hand card to see what it can do right now.",
              "<c4>Hold X</c> to Inspect the selected card to learn about its properties and effects.",
              "If you owe money, you choose what to pay with (from your <c4>Bank</c> and your <c4>Properties</c>).",
              "The value of every card is shown in the top left corner."
            ]
          }
        ]
      },

      {
        id: "controls",
        title: "Controls",
        blocks: [
          { kind: "h", text: "Basics" },
          {
            kind: "bullets",
            items: [
              "<c4>D-pad</c>: move selection (cursor).",
              "<c4>A (tap)</c>: open a card menu / confirm a choice.",
              "<c4>A (hold)</c>: enter quick play (use D-pad to cycle options, release A confirms).",
              "<c4>B</c>: back / cancel (when allowed).",
              "<c4>X (hold)</c>: Inspect cards, buttons, deck for more information.",
              "Similarly with keyboard, use arrow keys for navigation, Z for action/confirm, X for back/cancel, and A for inspect."
            ],
            demo: { layout: "above", w: 60, h: 14, draw: function (ctx) {
              // Tiny button legend mock.
              rect(ctx.x, ctx.y, 60, 14, MC.Pal.Black);
              rectb(ctx.x, ctx.y, 60, 14, MC.Pal.Grey);
              print("A", ctx.x + 6, ctx.y + 4, MC.Pal.Yellow);
              print("B", ctx.x + 20, ctx.y + 4, MC.Pal.Red);
              print("X", ctx.x + 34, ctx.y + 4, MC.Pal.Cyan);
              print("Y", ctx.x + 48, ctx.y + 4, MC.Pal.LightGrey);
            } }
          },

          { kind: "h", text: "Menus and targeting" },
          {
            kind: "p",
            text:
              "Most actions start from the card menu (tap <c4>A</c> on a hand card).\n" +
              "If an action needs a destination/target, you enter targeting and cycle options with <c4>L/R</c>."
          }
        ]
      },

      {
        id: "details",
        title: "Details",
        blocks: [
          { kind: "h", text: "Cards (what they do)" },
          {
            kind: "bullets",
            items: [
              "<c12>1</c> - <c4>Money</c>: bank it as cash, or spend it to pay debts.",
              "<c12>2</c> - <c4>Properties</c>: place into sets on your table. (Not bankable.)",
              "<c12>3</c> - <c4>Wild</c>: a property that can be used as either color.",
              "<c12>4</c> - <c4>Rent</c>: charge rent for one of your sets that matches the color bars (opponent must pay).",
              "<c12>5</c> - <c4>Sly Deal</c>: steal one opponent property (not from a complete set).",
              "<c12>6</c> - <c4>Just Say No</c>: cancel an action played against you.",
              "<c4>Banking action cards</c>: action cards can be banked for money. Once banked, they count as money only for the rest of the game (you can't play them as actions)."
            ],
            demo: { layout: "above", w: 150, h: 25, draw: function (ctx) {
              var dx = 0
              print("1", ctx.x + dx,  ctx.y + 0, MC.Pal.White, true, 1, true);
              H.drawMiniCardById("money_1", ctx.x + dx + 6, ctx.y);
              dx += 26;
              print("2", ctx.x + dx, ctx.y + 0, MC.Pal.White, true, 1, true);
              H.drawMiniCardById("prop_orange", ctx.x + dx + 6, ctx.y);
              dx += 26;
              print("3", ctx.x + dx, ctx.y + 0, MC.Pal.White, true, 1, true);
              H.drawMiniCardById("wild_mo", ctx.x + dx + 6, ctx.y);
              dx += 26;
              print("4", ctx.x + dx, ctx.y + 0, MC.Pal.White, true, 1, true);
              H.drawMiniCardById("rent_mo", ctx.x + dx + 6, ctx.y);
              dx += 26;
              print("5", ctx.x + dx, ctx.y + 0, MC.Pal.White, true, 1, true);
              H.drawMiniCardById("sly_deal", ctx.x + dx + 6, ctx.y);
              dx += 26;
              print("6", ctx.x + dx,ctx.y + 0, MC.Pal.White, true, 1, true);
              H.drawMiniCardById("just_say_no", ctx.x + dx + 6, ctx.y);
            } }  
          },
          { kind: "h", text: "Paying a debt" },
          {
            kind: "p",
            text:
              "When you owe money (for example, Rent), you must pay until the debt is covered.\n" +
              "Navigate to a payable card and press <c4>A</c> to pay it.",
            demo: { layout: "left", w: 40, h: 25, draw: demoTwoCards("money_2", "prop_black", 20) }
          },
          {
            kind: "bullets",
            items: [
              "You can pay using cards from your <c4>Bank</c> and <c4>Properties</c> (not from hand).",
              "If you pay with a <c4>Property</c>, the opponent receives it and must place it.",
              "If a set has a <c4>House</c>, that House must be paid first before properties from that set.",
              "Overpay is allowed. <c4>No change</c> is returned."
            ]
          },

          { kind: "h", text: "Placing received properties" },
          {
            kind: "p",
            text:
              "When you receive properties as payment, you place them one-by-one into your sets.\n" +
              "Wild properties let you pick which color they count as while placing.",
          },

          { kind: "h", text: "Wild move (optional prompt)" },
          {
            kind: "p",
            text:
              "After some property placements, the game may offer a one-time option to move a Wild.\n" +
              "Press <c4>A</c> to move it, or <c4>B</c> to skip.",
          },

          { kind: "h", text: "Just Say No windows" },
          {
            kind: "p",
            text:
              "If you have a Just Say No in hand, you can use it when an action targets you.\n" +
              "Important: for action-sourced debts, JSN is only allowed before any payment is made."
          }
        ]
      }
    ]
  };
})();

// ---- src/90_debug.js ----
// MC.debug: dev harness (scenario cycling/reset/step) + main tick wiring for playtesting.
MC.debug.scenarioI = 0;
MC.debug.scenarios = ["default"].concat(MC.scenarios.IDS);
MC.debug.state = null;
MC.debug.view = MC.ui.newView();
MC.debug.ctrl = MC.controls.newState();
MC.debug.ai = { wait: 0 };
MC.debug.lastCmd = "";
MC.debug.lastEvents = [];
MC.debug.lastRaw = null;
MC.debug.lastUiIntentSummary = "";

MC.debug.reset = function (opts) {
  var d = MC.debug;
  var keepPrevPause = !(opts && opts.keepPrevAutoFocusPause === false);
  var prevPaused = keepPrevPause ? !!d.view.ux.autoFocusPausedByDebug : false;
  var shouldPause = !!(opts && opts.pauseAutoFocus) || prevPaused;
  var skipGameStartAnim = !!(opts && opts.skipGameStartAnim);
  var seedU32 = MC.seed.computeSeedU32();
  var scenarioId = d.scenarios[d.scenarioI];
  if (scenarioId === "default") {
    d.state = MC.state.newGame({ seedU32: seedU32 });
  } else {
    d.state = MC.state.newGame({ seedU32: seedU32, scenarioId: scenarioId });
  }
  d.view = MC.ui.newView();
  if (shouldPause) d.view.ux.autoFocusPausedByDebug = true;
  // Default newGame starts in the final 5/7 state; animate the initial deal.
  // Skip scenarios so resets stay fast and deterministic for debugging.
  if (scenarioId === "default" && !skipGameStartAnim) MC.anim.beginGameStart(d.state, d.view);
  d.ctrl = MC.controls.newState();
  d.ai = { wait: 0 };
  d.lastCmd = "";
  d.lastEvents = [];
  d.lastRaw = null;
  d.lastUiIntentSummary = "";
};

MC.debug.startNewGame = function () {
  var d = MC.debug;
  d.scenarioI = 0;
  MC.debug.reset({ keepPrevAutoFocusPause: false });
};

MC.debug.nextScenario = function () {
  var d = MC.debug;
  d.scenarioI = (d.scenarioI + 1) % d.scenarios.length;
  MC.debug.reset({ pauseAutoFocus: true });

  // Keep cursor on Next after switching scenarios (debug harness ergonomics).
  var view = d.view;
  var state = d.state;
  if (view && state && MC.ui && MC.render) {
    var computed = MC.ui.computeRowModels(state, view);
    MC.ui.updateCameras(state, view, computed);
    computed = MC.ui.computeRowModels(state, view);
    var pick = MC.ui.findBestCursorTarget(computed.models, [MC.render.ROW_CENTER], function (it) {
      return it && it.kind === "btn" && it.id === "nextScenario" && !it.disabled;
    });
    if (pick) MC.ui.cursorMoveTo(view, pick);
  }
};

MC.debug.step = function () {
  var d = MC.debug;
  var state = d.state;
  var moves = MC.engine.legalMoves(state);
  var p = MC.ai.actor(state);
  var policy = MC.ai.policyForP(p);
  var cmd = MC.ai.pickMove(state, moves, policy);
  if (!cmd) return;

  var res = MC.engine.applyCommand(state, cmd);
  d.lastCmd = cmd.kind;
  d.lastEvents = (res && res.events) ? res.events : [];
};

MC.debug.eventsToLine = function (events) {
  if (!events || events.length === 0) return "(none)";
  var parts = [];
  var i;
  for (i = 0; i < events.length; i++) {
    parts.push(events[i].kind);
  }
  return parts.join(",");
};

MC.debug.tickTextMode = function () {
  var d = MC.debug;

  if (typeof btnp === "function") {
    // A: step, B: next scenario, X: reset
    if (btnp(4)) MC.debug.step();
    if (btnp(5)) MC.debug.nextScenario();
    if (btnp(6)) MC.debug.reset({ pauseAutoFocus: true });
  }

  var s = d.state;

  function printSmall(msg, x, y, col) {
    if (col == null) col = 12;
    // smallfont=true and fixed=true keeps layout predictable.
    print(String(msg || ""), x, y, col, true, 1, true);
  }

  function bool01(v) { return v ? 1 : 0; }

  cls(0);
  var x = 0;
  var y = 6;
  var step = 6;
  var xR = 120;

  printSmall("Debug", x, y, 12); y += step;
  var sid = d.scenarios[d.scenarioI];
  var info = (MC.scenarios.INFO && sid) ? MC.scenarios.INFO[String(sid)] : null;
  var title = (info && info.title) ? String(info.title) : String(sid);
  printSmall("Scn:" + title, x, y, 12); y += step;
  var pendingDesc = (info && info.desc) ? String(info.desc) : "";
  printSmall("Seed:" + MC.seed.computeSeedU32(), x, y, 12); y += step;

  if (MC.render && MC.render.debug && typeof MC.render.debug.selectedLines === "function") {
    var sel = MC.render.debug.selectedLines(d);
    if (sel && sel.length) {
      printSmall(sel[0] || "", x, y, 12); y += step;
      if (sel[1]) { printSmall(sel[1], x, y, 12); y += step; }
    }
  }

  printSmall("Active:P" + s.activeP + " Plays:" + s.playsLeft, x, y, 12); y += step;
  printSmall((function (state) {
    if (!state) return "Prompt:(none)";
    var pr = state.prompt;
    if (!pr || !pr.kind) return "Prompt:(none)";
    var k = String(pr.kind);

    if (k === "payDebt") {
      var rem = pr.rem;
      var bufN = (pr.buf && pr.buf.length) ? pr.buf.length : 0;
      return "Prompt:payDebt rem:$" + rem + " buf:" + bufN;
    }

    if (k === "placeReceived") {
      var uN = (pr.uids && pr.uids.length) ? pr.uids.length : 0;
      return "Prompt:placeRecv n:" + uN;
    }

    if (k === "discardDown") {
      var p = pr.p;
      var hand = (state.players && state.players[p] && state.players[p].hand) ? state.players[p].hand : [];
      var handLen = hand.length;
      var nDiscarded = pr.nDiscarded;
      // Stable target count: initialHand - HAND_MAX.
      var nToDiscard = (handLen + nDiscarded) - MC.state.HAND_MAX;
      if (nToDiscard < 0) nToDiscard = 0;
      var left = handLen - MC.state.HAND_MAX;
      if (left < 0) left = 0;
      return "Prompt:discardDown to:" + nToDiscard + " left:" + left;
    }

    return "Prompt:" + k;
  })(s), x, y, 12); y += step;
  var w = s.winnerP;
  if (w !== MC.state.NO_WINNER) { printSmall("Winner:P" + w, x, y, 11); y += step; }

  printSmall("Deck:" + s.deck.length + " Disc:" + s.discard.length, x, y, 12); y += step;
  printSmall("Hand0/1:" + s.players[0].hand.length + "/" + s.players[1].hand.length, x, y, 12); y += step;
  printSmall(
    "Bank0/1:" +
    s.players[0].bank.length + "($" + MC.util.bankValueTotal(s, 0) + ")/" +
    s.players[1].bank.length + "($" + MC.util.bankValueTotal(s, 1) + ")",
    x,
    y,
    12
  ); y += step;
  printSmall("Sets0/1:" + s.players[0].sets.length + "/" + s.players[1].sets.length, x, y, 12); y += step;

  var moves = MC.engine.legalMoves(s);
  printSmall("Legal:" + moves.length, x, y, 12); y += step;
  printSmall("LastCmd:" + (d.lastCmd || "(none)"), x, y, 12); y += step;
  printSmall("Events:" + MC.debug.eventsToLine(d.lastEvents), x, y, 12); y += step;

  // Long focus rule ids don't fit well in the right column; render them full-width here.
  var vFocus = d.view;
  if (vFocus && vFocus.ux && vFocus.ux.lastFocusRuleId) {
    printSmall("FocusRule:" + String(vFocus.ux.lastFocusRuleId), x, y, 12); y += step;
  }

  // Render scenario description after Events so it doesn't overlap the right UI column.
  if (pendingDesc) {
    var lines = (function (txt, maxChars) {
      txt = String(txt || "");
      maxChars = maxChars || 55;
      if (!txt) return [];

      // Preserve explicit newlines, but word-wrap within each paragraph.
      var paras = txt.split("\n");
      var out = [];
      var pi;
      for (pi = 0; pi < paras.length; pi++) {
        var p = String(paras[pi] || "").trim();
        if (!p) { out.push(""); continue; }

        var words = p.split(/\s+/);
        var line = "";
        var wi;
        for (wi = 0; wi < words.length; wi++) {
          var w = words[wi];
          if (!w) continue;
          if (!line) { line = w; continue; }
          if ((line.length + 1 + w.length) <= maxChars) {
            line += " " + w;
          } else {
            out.push(line);
            line = w;
          }
        }
        if (line) out.push(line);
      }
      return out;
    })(pendingDesc, 55);
    var li;
    for (li = 0; li < lines.length; li++) {
      if (lines[li]) printSmall(lines[li], x, y, 13);
      y += step;
    }
  }

  // Right column: UI snapshot (from last Render-mode tick).
  var v = d.view;
  var yR = 6;
  if (v) {
    var isDragging = !!(v.mode === "targeting" && v.targeting && v.targeting.active && v.targeting.hold);
    printSmall("UI:" + String(v.mode || "?") + " I:" + bool01(v.inspectActive) + " Drag:" + bool01(isDragging), xR, yR, 12); yR += step;
    if (v.cursor) printSmall("Cur:r" + v.cursor.row + " i" + v.cursor.i, xR, yR, 12);
    yR += step;

    if (v.ux) {
      var a = v.ux.selAnchor;
      if (a) {
        var zone = (a.loc && a.loc.zone) ? String(a.loc.zone) : "?";
        var head = "Anchor:";
        if (a.uid != null && a.uid !== 0) head += "uid" + String(a.uid);
        else if (a.id) head += String(a.id);
        else if (a.kind) head += String(a.kind);
        else head += "?";
        printSmall(head + " " + zone, xR, yR, 12); yR += step;
      }
      if (v.ux.pendingFocusErrorCode) {
        printSmall("FocusErr:" + String(v.ux.pendingFocusErrorCode), xR, yR, 12); yR += step;
      }
    }

    if (v.mode === "menu" && v.menu && v.menu.items) {
      var nM = v.menu.items.length;
      var mi = (nM > 0) ? MC.ui.clampI(v.menu.i, nM) : 0;
      var it = (nM > 0) ? v.menu.items[mi] : null;
      var id = it ? String(it.id || "?") : "(none)";
      printSmall("Menu:" + mi + "/" + nM + " " + id, xR, yR, 12); yR += step;
    }

    if (v.mode === "targeting" && v.targeting && v.targeting.active) {
      var t = v.targeting;
      var nC = (t.cmds && t.cmds.length) ? t.cmds.length : 0;
      var ci = (nC > 0) ? MC.ui.clampI(t.cmdI, nC) : 0;
      printSmall("Tgt:" + String(t.kind || "?") + " " + ci + "/" + nC + " h:" + bool01(t.hold), xR, yR, 12); yR += step;
    }

    if (v.mode === "prompt" && s.prompt && s.prompt.kind) {
      printSmall("Prompt:" + String(s.prompt.kind), xR, yR, 12); yR += step;
    }
  } else {
    printSmall("UI:(no view)", xR, yR, 12); yR += step;
  }

  // Inputs/state (favor persistent states over one-frame pulses).
  var raw0 = d.lastRaw;
  var down0 = raw0 && raw0.down ? raw0.down : null;
  if (down0) {
    printSmall(
      "Down:U" + bool01(down0[0]) + "D" + bool01(down0[1]) + "L" + bool01(down0[2]) + "R" + bool01(down0[3]) +
      " A" + bool01(down0[4]) + "B" + bool01(down0[5]) + "X" + bool01(down0[6]) + "Y" + bool01(down0[7]),
      xR,
      yR,
      13
    ); yR += step;
  } else {
    printSmall("Down:(no raw yet)", xR, yR, 13); yR += step;
  }

  var st = d.ctrl;
  if (st && st.held) {
    var held = st.held;
    var heldA = held[4];
    var heldX = held[6];
    printSmall(
      "Held:A" + heldA + " X" + heldX + " Grab:" + bool01(st.aGrabActive) + " XLatch:" + bool01(st.xInspectActive),
      xR,
      yR,
      13
    ); yR += step;
  } else {
    printSmall("Held:(no ctrl yet)", xR, yR, 13); yR += step;
  }

  printSmall("Intent:" + (d.lastUiIntentSummary || "(none)"), xR, yR, 13);

  printSmall("A:Step  B:Next  X:Reset  Y:Mode", 6, 128, 13);
};

// Main modes:
// 0=DebugText, 1=Render, 2=Title, 3=HowTo
MC.mainTick = function () {
  var dbgEnabled = !!(MC.config.debug.enabled && MC.debug.toolsOn);

  function clearTitleOverlay() {
    // Clear vbank(1) overlay so it doesn't persist into DebugText/Render.
    if (typeof vbank === "function") {
      vbank(1);
      if (typeof poke === "function") poke(0x03FF8, 15);
      cls(15);
      vbank(0);
    }
  }

  // Title mode: main entry point.
  if (MC._mainMode === 2) {
    var rawT = MC.controls.pollGlobals();
    var intentT = null;
    if (MC.title && typeof MC.title.tick === "function") intentT = MC.title.tick(rawT);

    if (intentT && intentT.kind) {
      if (intentT.kind === "howToPlay") {
        clearTitleOverlay();
        MC._mainMode = 3;
        return;
      }

      if (intentT.kind === "startNewGame") {
        clearTitleOverlay();
        if (MC.debug && typeof MC.debug.startNewGame === "function") MC.debug.startNewGame();
        MC._mainMode = 1;
        return;
      }

      if (intentT.kind === "continueGame") {
        if (MC.debug && MC.debug.state != null) {
          clearTitleOverlay();
          MC._mainMode = 1;
          return;
        }
      }
    }

    return;
  }

  // How-to-Play mode.
  if (MC._mainMode === 3) {
    var rawH = MC.controls.pollGlobals();
    var intentH = null;
    if (MC.howto && typeof MC.howto.tick === "function") intentH = MC.howto.tick(rawH);
    if (intentH && intentH.kind === "backToTitle") {
      MC._mainMode = 2;
      return;
    }
    return;
  }

  // Modes: 0=DebugText, 1=Render. Y toggles DebugText ↔ Render (dev-only).
  if (dbgEnabled && (MC._mainMode === 0 || MC._mainMode === 1) && typeof btnp === "function" && btnp(7)) {
    MC._mainMode = MC._mainMode ? 0 : 1;
  }

  if (MC._mainMode === 0) {
    if (!dbgEnabled) { MC._mainMode = 1; return; }
    if (MC.debug.state == null) MC.debug.reset(null);
    MC.debug.tickTextMode();
    return;
  }

  // Render mode
  var d = MC.debug;
  if (d.state == null) { MC._mainMode = 2; return; }

  {
    var raw = MC.controls.pollGlobals();
    d.lastRaw = raw;
    var actions = MC.controls.actions(d.ctrl, raw, MC.config.controls);

    // AI acts for actor=1 (activeP or prompt.p). While AI is acting, suppress player input.
    var actor = MC.ai.actor(d.state);
    var gameOver = (d.state.winnerP !== MC.state.NO_WINNER);
    if (actor !== 0 && !gameOver) actions = {};

    var intent = MC.ui.step(d.state, d.view, actions);
    {
      var sum = "(none)";
      if (intent && intent.kind) {
        if (intent.kind === "applyCmd" && intent.cmd && intent.cmd.kind) sum = "applyCmd:" + String(intent.cmd.kind);
        else if (intent.kind === "debug" && intent.action) sum = "debug:" + String(intent.action);
        else sum = String(intent.kind);
      }
      d.lastUiIntentSummary = sum;
    }

    if (intent && intent.kind === "mainMenu") {
      MC._mainMode = 2;
      return;
    }

    if (actor === 0 && intent && intent.kind === "applyCmd" && intent.cmd) {
      try {
        var res = MC.engine.applyCommand(d.state, intent.cmd);
        d.lastCmd = intent.cmd.kind;
        d.lastEvents = (res && res.events) ? res.events : [];
        MC.anim.onEvents(d.state, d.view, d.lastEvents);
      } catch (err) {
        d.lastCmd = intent.cmd.kind + "(!)";
        d.lastEvents = [];
        var code = (err && err.message) ? String(err.message) : "error";
        var msg = MC.fmt.errorMessage(code);
        MC.anim.feedbackError(d.view, code, msg);
      }
    } else if ((actor === 0 || gameOver) && dbgEnabled && intent && intent.kind === "debug") {
      if (intent.action === "step") {
        MC.debug.step();
        MC.anim.onEvents(d.state, d.view, d.lastEvents);
      }
      else if (intent.action === "reset") MC.debug.reset({ pauseAutoFocus: true });
      else if (intent.action === "nextScenario") MC.debug.nextScenario();
    }

    // AI pacing loop (one command per step, with fixed delay).
    if (!gameOver && actor !== 0 && !(d.view && d.view.anim && d.view.anim.lock)) {
      if (d.ai.wait > 0) {
        d.ai.wait -= 1;
      } else {
        var cmdAi = MC.ai.pickRandomLegalMove(d.state);
        if (cmdAi) {
          var txt = MC.ai.describeCmd(d.state, cmdAi);
          if (txt) {
            MC.ui.toastPush(d.view, { id: "ai:narrate", kind: "ai", text: txt, frames: MC.config.ui.aiNarrateToastFrames });
          }
          try {
            var resAi = MC.engine.applyCommand(d.state, cmdAi);
            d.lastCmd = "ai:" + cmdAi.kind;
            d.lastEvents = (resAi && resAi.events) ? resAi.events : [];
            MC.anim.onEvents(d.state, d.view, d.lastEvents);
          } catch (errAi) {
            d.lastCmd = "ai:" + cmdAi.kind + "(!)";
            d.lastEvents = [];
            var codeAi = (errAi && errAi.message) ? String(errAi.message) : "error";
            var msgAi = MC.fmt.errorMessage(codeAi);
            MC.anim.feedbackError(d.view, codeAi, msgAi);
          }
          d.ai.wait = MC.config.ui.aiStepDelayFrames;
        } else {
          d.ai.wait = MC.config.ui.aiStepDelayFrames;
        }
      }
    }

    var computed = MC.ui.computeRowModels(d.state, d.view);
    MC.ui.updateCameras(d.state, d.view, computed);
    // Recompute after camera updates (selection/cam are orthogonal, but keep it stable).
    computed = MC.ui.computeRowModels(d.state, d.view);

    MC.render.drawFrame({ state: d.state, view: d.view, computed: computed });
  }
};

MC._mainMode = 2;

// ---- src/99_main.js ----
// Cartridge entrypoint: TIC-80 calls `TIC()` once per frame.
function TIC() {
  MC.mainTick();
}

