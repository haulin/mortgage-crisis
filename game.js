// script: js
// title: Property Deal
// saveid: PropertyDeal
// generated: do not edit by hand (edit src/* instead)
// ---- src/00_prelude.js ----
// Prelude: initialize the global `PD` namespace and module namespaces exactly once.
// Invariant: other modules attach to these objects (no defensive `PD.x = PD.x || {}`).
var PD = PD || {};

// Module namespaces: created once here, never defensively elsewhere.
PD.controls = {};
PD.render = {};
PD.ui = {};
PD.anim = {};
PD.fmt = {};
PD.layout = {};
PD.moves = {};
PD.ai = {};
PD.state = {};
PD.engine = {};
PD.rules = {};
PD.util = {};
PD.shuffle = {};
PD.rng = {};
PD.seed = {};
PD.scenarios = {};
PD.debug = {};

// ---- src/05_config.js ----
// PD.config: central gameplay/UI/render tuning knobs (validated in tests; avoid runtime fallbacks).
PD.config = {
  screenW: 240,
  screenH: 136,
  seedBase: 1001
};

// Debug/dev knobs (Phase 03b+). Keep these centralized so we can disable later.
PD.config.debug = {
  enabled: true
};

// Controller UX knobs (Phase 04+). All values are in frames (TIC runs at 60fps).
PD.config.controls = {
  // D-pad repeat: start repeating after delay, then pulse every period.
  dpadRepeatDelayFrames: 12,
  dpadRepeatPeriodFrames: 4,

  // Hold-A grab: if you hold A without moving, enter grab after this fallback threshold.
  // (Hold+move enters immediately.)
  aHoldFallbackFrames: 18,

  // Inspect overlay becomes active after holding X this long.
  xInspectDelayFrames: 6
};

// UI/navigation tuning (Phase 04+).
PD.config.ui = {
  // Directional navigation cone penalty multiplier (per-axis):
  // used by PD.ui.navPickInDirection scoring:
  // score = along^2 + (perp^2)*k
  //
  // Bigger k => narrower cone (harder to jump across rows/columns).
  // k must be > 0. Typical values are ~4..30.
  //
  // - Left/Right usually wants a *narrower* cone to avoid jumping to other rows.
  // - Up/Down can stay more permissive.
  navConeKLeftRight: 18,
  navConeKUpDown: 6,

  // Phase 05c+: animation timings (frames at 60fps).
  dealFramesPerCard: 8,
  dealGapFrames: 2,
  // Shuffle: default includes ~1 extra 1→2→3 loop for readability.
  shuffleAnimFrames: 42,
  shuffleToastFrames: 42,

  // Phase 07: AI pacing (frames at 60fps).
  aiStepDelayFrames: 60,
  aiNarrateToastFrames: 60,
 
};

// AI policy knobs (Phase 07+).
PD.config.ai = {
  // Per-player policy IDs (0=player, 1=opponent by default).
  policyByP: ["defaultHeuristic", "defaultHeuristic"],

  // Weight multiplier for "place property into an existing set" moves.
  // 1 means no bias (equivalent to uniform random).
  biasExistingSetK: 8,

  // Weight multiplier for "play Rent" moves (bias asking for rent over banking Rent).
  // 1 means no bias (equivalent to uniform random).
  biasPlayRentK: 4
};

// Rule-note IDs (Phase 05+). These are small display-only annotations in Inspect.
PD.RuleNote = {
  // MVP1 rule constraints.
  SlyDeal_NotFromFullSet: 1,

  // Optional / other-version rules (not enabled in MVP1).
  House_StationsUtilities: 2,
  JSN_Chain: 3
};

// Rules display knobs (Phase 05+).
PD.config.rules = {
  // List of enabled RuleNote IDs to show in Inspect.
  // Note: keep this intentionally small; it's easy to mislead players with future-rule text.
  enabledRuleNotes: [
    PD.RuleNote.SlyDeal_NotFromFullSet
  ]
};

// TIC-80 default palette is Sweetie-16.
// These are palette *indices* (0..15), not RGB values.
PD.Pal = {
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

PD.config.render = {
  // Layout knobs: geometry + positions.
  layout: {
    screenW: PD.config.screenW,
    screenH: PD.config.screenH,

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

    // Center row (Phase 03b+)
    centerTopInsetY: 4,
    centerDeckX: 6,
    centerPileGapX: 6,
    centerPreviewX: 70,
    centerPreviewGapX: 8,
    centerDescDy: 8,

    // Center row button strip (Phase 04+).
    centerBtnStripW: 39,
    centerBtnStripPadRight: 1,

    // Inspect panel (Phase 05): screen-space panel bounds.
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
    colBg: PD.Pal.Black,
    colText: PD.Pal.White,
    colCardBorder: PD.Pal.White,
    colCardInterior: PD.Pal.White,
    colShadow: PD.Pal.Black,
    colHighlight: PD.Pal.Yellow,
    colCenterPanel: PD.Pal.DarkBlue,
    colCenterPanelBorder: PD.Pal.White,
    colValuePatch: PD.Pal.White,
    colValuePatchBorder: PD.Pal.Black,
    hudLineCol: PD.Pal.White,
    colToastBgAi: PD.Pal.DarkBlue,

    // Center pile depth outlines (Phase 03b polish)
    pileShadowOutlineCol: PD.Pal.Black,
    // Under-layer outline colors (screen-space depth):
    // - under1: the closer (smaller offset) layer
    // - under2: the deeper (larger offset) layer
    // Deeper is intentionally darker.
    pileOutlineUnder1Col: PD.Pal.LightGrey,
    pileOutlineUnder2Col: PD.Pal.Grey,

    // Inspect panel colors (Phase 05).
    inspectPanelFillCol: PD.Pal.DarkGreen,

    // Deck/Discard pile count digit offset (Phase 05).
    pileCountDx: 1,
    pileCountDy: 1
  },

  // Sprite IDs (NOT locked yet; keep all in one place for easy remap).
  spr: {
    // Reserve 0 as blank (convention).
    digit0: 1, // digit sprite IDs are digit0 + n

    // Card back (top-left tile id of a 2x3 sprite = 16x24).
    // Art convention for Phase 03b: last column + last row are color 15 (colorkey),
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
    PD.Pal.Yellow,     // 1
    PD.Pal.Red,        // 2
    PD.Pal.LightGreen, // 3
    PD.Pal.LightBlue,  // 4
    PD.Pal.Purple      // 5
  ]
};

// ---- src/10_util.js ----
// PD.util: shared tiny utilities (pure helpers; no TIC-80 API usage).

PD.util.bankValueTotal = function (state, p) {
  var bank = state.players[p].bank;
  var sum = 0;
  var i;
  for (i = 0; i < bank.length; i++) {
    var uid = bank[i];
    var di = state.uidToDefI[uid];
    var def = PD.CARD_DEFS[di];
    if (def && def.bankValue) sum += def.bankValue;
  }
  return sum;
};

// ---- src/15_rng.js ----
// PD.rng: deterministic PRNG helpers (bitwise coercion stays localized here).
PD.rng.u32 = function (n) {
  return (n >>> 0);
};

PD.rng.u32NonZero = function (n) {
  var x = (n >>> 0);
  return x ? x : 1;
};

PD.rng.xorshift32Step = function (sU32) {
  var x = sU32 >>> 0;
  if (!x) x = 1;
  x ^= x << 13;
  x >>>= 0;
  x ^= x >>> 17;
  x ^= x << 5;
  x >>>= 0;
  return x >>> 0;
};

PD.rng.RNG = function (seedU32) {
  this.s = PD.rng.u32NonZero(seedU32);
};

// Standalone RNG instances (handy for tests/utilities; separate from RNG-in-state).
PD.rng.RNG.prototype.nextU32 = function () {
  this.s = PD.rng.xorshift32Step(this.s >>> 0);
  return this.s >>> 0;
};

PD.rng.RNG.prototype.nextInt = function (n) {
  n = n | 0;
  if (n <= 0) return 0;
  return (this.nextU32() % n) | 0;
};

// RNG-in-state helpers (store evolving state in `state.rngS`).
PD.rng.nextU32InState = function (state) {
  state.rngS = PD.rng.xorshift32Step(state.rngS >>> 0);
  return state.rngS >>> 0;
};

PD.rng.nextIntInState = function (state, n) {
  n = n | 0;
  if (n <= 0) return 0;
  return (PD.rng.nextU32InState(state) % n) | 0;
};

// ---- src/20_seed.js ----
// PD.seed: seed policy for deterministic runs (dev-friendly, reproducible).
PD.seed.computeSeedU32 = function () {
  return PD.rng.u32NonZero(PD.config.seedBase);
};

// ---- src/25_controls.js ----
// PD.controls: input state machine (injected/pollable controls with repeat + hold/tap detection).
PD.controls.newState = function () {
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

PD.controls.pollGlobals = function () {
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

PD.controls.actions = function (st, raw, cfg) {
  if (!st) st = PD.controls.newState();
  // Contract: caller provides {down[8], pressed[8]} and cfg from PD.config.controls.
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
// PD.shuffle: deterministic shuffling helpers (seeded RNG / state RNG).
PD.shuffle.byNextInt = function (arr, nextInt) {
  var i;
  for (i = arr.length - 1; i > 0; i--) {
    var j = nextInt(i + 1);
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
};

PD.shuffle.inPlaceWithRng = function (arr, rng) {
  return PD.shuffle.byNextInt(arr, function (n) { return rng.nextInt(n); });
};

PD.shuffle.inPlaceWithStateRng = function (state, arr) {
  return PD.shuffle.byNextInt(arr, function (n) { return PD.rng.nextIntInState(state, n); });
};

// ---- src/35_defs.js ----
// Card/game definitions: enums + static data tables (treated as read-only).
PD.Color = {
  Cyan: 0,
  Magenta: 1,
  Orange: 2,
  Black: 3,
};

PD.CardKind = {
  Money: 0,
  Action: 1,
  Property: 2,
  House: 3,
};

PD.ActionKind = {
  Rent: 0,
  SlyDeal: 1,
  JustSayNo: 2,
};

// Rule note display text (Phase 05+). These are appended in Inspect when enabled by config.
PD.ruleNoteTextById = [];
PD.ruleNoteTextById[PD.RuleNote.SlyDeal_NotFromFullSet] = "(Cannot be part of a full set)";
PD.ruleNoteTextById[PD.RuleNote.House_StationsUtilities] = "(Except stations & utilities)";
PD.ruleNoteTextById[PD.RuleNote.JSN_Chain] = "(You can say No to a No)";

PD.SET_RULES = [];
PD.SET_RULES[PD.Color.Cyan] = {
  requiredSize: 2,
  rent: [1, 3],
};
PD.SET_RULES[PD.Color.Magenta] = {
  requiredSize: 3,
  rent: [1, 2, 4],
};
PD.SET_RULES[PD.Color.Orange] = {
  requiredSize: 3,
  rent: [2, 3, 5],
};
PD.SET_RULES[PD.Color.Black] = {
  requiredSize: 4,
  rent: [1, 2, 3, 6],
};

PD.HOUSE_RENT_BONUS = 3;

PD.CARD_DEFS = [
  // Money (10)
  {
    id: "money_1",
    name: "Money",
    desc: "Spend to pay debts.\nBank as money.",
    kind: PD.CardKind.Money,
    count: 3,
    bankValue: 1,
  },
  {
    id: "money_2",
    name: "Money",
    desc: "Spend to pay debts.\nBank as money.",
    kind: PD.CardKind.Money,
    count: 3,
    bankValue: 2,
  },
  {
    id: "money_3",
    name: "Money",
    desc: "Spend to pay debts.\nBank as money.",
    kind: PD.CardKind.Money,
    count: 2,
    bankValue: 3,
  },
  {
    id: "money_4",
    name: "Money",
    desc: "Spend to pay debts.\nBank as money.",
    kind: PD.CardKind.Money,
    count: 1,
    bankValue: 4,
  },
  {
    id: "money_5",
    name: "Money",
    desc: "Spend to pay debts.\nBank as money.",
    kind: PD.CardKind.Money,
    count: 1,
    bankValue: 5,
  },

  // Properties (12 fixed + 2 wild = 14)
  {
    id: "prop_cyan",
    name: "Property Cyan",
    desc: "Full set: 2 required.\nRent for 1 property: $1\nRent for 2 properties: $3",
    kind: PD.CardKind.Property,
    count: 2,
    propertyColor: PD.Color.Cyan,
    propertyPayValue: 3,
  },
  {
    id: "prop_magenta",
    name: "Property Magenta",
    desc: "Full set: 3 required.\nRent for 1 property: $1\nRent for 2 properties: $2\nRent for 3 properties: $4",
    kind: PD.CardKind.Property,
    count: 3,
    propertyColor: PD.Color.Magenta,
    propertyPayValue: 2,
  },
  {
    id: "prop_orange",
    name: "Property Orange",
    desc: "Full set: 3 required.\nRent for 1 property: $2\nRent for 2 properties: $3\nRent for 3 properties: $5",
    kind: PD.CardKind.Property,
    count: 3,
    propertyColor: PD.Color.Orange,
    propertyPayValue: 2,
  },
  {
    id: "prop_black",
    name: "Property Black",
    desc: "Full set: 4 required.\nRent for 1 property: $1\nRent for 2 properties: $2\nRent for 3 properties: $3\nRent for 4 properties: $6",
    kind: PD.CardKind.Property,
    count: 4,
    propertyColor: PD.Color.Black,
    propertyPayValue: 1,
  },
  {
    id: "wild_mo",
    name: "Wild Magenta/Orange",
    desc: "Orange rent: $2/$3/$5\nMagenta rent: $1/$2/$4",
    kind: PD.CardKind.Property,
    count: 1,
    wildColors: [PD.Color.Magenta, PD.Color.Orange],
    propertyPayValue: 2,
  },
  {
    id: "wild_cb",
    name: "Wild Cyan/Black",
    desc: "Cyan rent: $1/$3\nBlack rent: $1/$2/$3/$6",
    kind: PD.CardKind.Property,
    count: 1,
    wildColors: [PD.Color.Cyan, PD.Color.Black],
    propertyPayValue: 2,
  },

  // Buildings (2)
  {
    id: "house",
    name: "House",
    desc: "Action card. Add onto any\nfull set you own to add\n$3 to the rent value.",
    kind: PD.CardKind.House,
    count: 2,
    bankValue: 3,
    ruleNotes: [PD.RuleNote.House_StationsUtilities]
  },

  // Actions (9)
  {
    id: "rent_mo",
    name: "Rent Magenta/Orange",
    desc: "Action card. Your opponent\npays you rent for your\nMagenta or Orange sets.\n(Play into center to use)",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.Rent,
    count: 2,
    bankValue: 1,
    rentAllowedColors: [PD.Color.Magenta, PD.Color.Orange],
  },
  {
    id: "rent_cb",
    name: "Rent Cyan/Black",
    desc: "Action card. Your opponent\npays you rent for your\nCyan or Black sets.\n(Play into center to use)",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.Rent,
    count: 2,
    bankValue: 1,
    rentAllowedColors: [PD.Color.Cyan, PD.Color.Black],
  },
  {
    id: "rent_any",
    name: "Rent Any",
    desc: "Action card. Your opponent\npays you rent for one set\nof your choice.\n(Play into center to use)",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.Rent,
    count: 1,
    bankValue: 1,
    rentAllowedColors: null,
  },
  {
    id: "sly_deal",
    name: "Sly Deal",
    desc: "Action card. Steal 1 property\nfrom your opponent.\n(Play into center to use)",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.SlyDeal,
    count: 2,
    bankValue: 3,
    ruleNotes: [PD.RuleNote.SlyDeal_NotFromFullSet]
  },
  {
    id: "just_say_no",
    name: "Just Say No",
    desc: "Action card. Use any time\nwhen an action is played\nagainst you.\n(Play into center to use)",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.JustSayNo,
    count: 2,
    bankValue: 4,
    ruleNotes: [PD.RuleNote.JSN_Chain]
  },
];

PD.DEF_INDEX_BY_ID = {};
(function initDefIndexById() {
  var i;
  for (i = 0; i < PD.CARD_DEFS.length; i++) {
    var id = PD.CARD_DEFS[i].id;
    if (PD.DEF_INDEX_BY_ID[id] != null) {
      throw new Error("duplicate card def id: " + id);
    }
    PD.DEF_INDEX_BY_ID[id] = i;
  }
})();

// ---- src/40_state.js ----
// PD.state: game state constructors + uid bookkeeping + prompt helpers (no UI/render).
PD.state.NO_COLOR = -1;
PD.state.NO_WINNER = -1;
PD.state.HAND_MAX = 7;

PD.state.clearPrompt = function (state) {
  state.prompt = null;
};

PD.state.setPrompt = function (state, prompt) {
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
    state.prompt = {
      kind: k,
      p: p,
      toP: prompt.toP,
      rem: Math.floor(prompt.rem),
      buf: prompt.buf.slice()
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

  throw new Error("unknown_prompt_kind:" + k);
};

PD.state.hasAnyPayables = function (state, p) {
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

PD.state.beginDebt = function (state, fromP, toP, amount) {
  if (!(amount > 0)) return;
  if (!PD.state.hasAnyPayables(state, fromP)) return;
  PD.state.setPrompt(state, { kind: "payDebt", p: fromP, toP: toP, rem: amount, buf: [] });
};

PD.rules.otherPlayer = function (p) {
  return (p ^ 1) & 1;
};

PD.rules.getSetColor = function (props) {
  if (!props || props.length === 0) return PD.state.NO_COLOR;
  return props[0][1];
};

PD.rules.isBankableDef = function (def) {
  if (!def) return false;
  return def.kind === PD.CardKind.Money || def.kind === PD.CardKind.Action || def.kind === PD.CardKind.House;
};

PD.rules.isWildDef = function (def) {
  return !!(def && def.kind === PD.CardKind.Property && def.wildColors && def.wildColors.length);
};

PD.rules.wildAllowsColor = function (def, color) {
  if (!PD.rules.isWildDef(def)) return false;
  return def.wildColors[0] === color || def.wildColors[1] === color;
};

PD.state.buildAllUids = function (state) {
  var uidToDefI = [0];
  var uid = 1;
  var di;
  for (di = 0; di < PD.CARD_DEFS.length; di++) {
    var def = PD.CARD_DEFS[di];
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

PD.state.defByUid = function (state, uid) {
  var di = state.uidToDefI[uid];
  return PD.CARD_DEFS[di];
};

PD.state.newEmptySet = function () {
  return {
    // Properties are tuples: [uid, color]
    props: [],
    // House card uid (0/undefined means none).
    houseUid: 0
  };
};

PD.state.drawToHand = function (state, p, n, events) {
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
      PD.shuffle.inPlaceWithStateRng(state, state.deck);
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

PD.state.startTurn = function (state, events) {
  state.playsLeft = 3;
  PD.state.clearPrompt(state);
  var p = state.activeP;
  var nDraw = 2;
  if (state.players[p].hand.length === 0) nDraw = 5;
  PD.state.drawToHand(state, p, nDraw, events);
  if (events) events.push({ kind: "plays", p: state.activeP, playsLeft: state.playsLeft });
};

PD.state.newGame = function (opts) {
  var seedU32 = (opts.seedU32 == null) ? PD.seed.computeSeedU32() : PD.rng.u32NonZero(opts.seedU32);

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
    winnerP: PD.state.NO_WINNER
  };

  PD.state.buildAllUids(state);

  if (opts.scenarioId) {
    PD.scenarios.applyScenario(state, String(opts.scenarioId));
    return state;
  }

  // Default game start: shuffle full deck, deal 5 each, choose first player randomly,
  // then start their turn (draw 2, playsLeft=3).
  var uid;
  for (uid = 1; uid <= state.totalUids; uid++) state.deck.push(uid);
  PD.shuffle.inPlaceWithStateRng(state, state.deck);

  PD.state.drawToHand(state, 0, 5, null);
  PD.state.drawToHand(state, 1, 5, null);

  state.activeP = PD.rng.nextIntInState(state, 2);
  var events = [];
  events.push({ kind: "turn", activeP: state.activeP });
  PD.state.startTurn(state, events);
  // Default newGame doesn't expose events, but tests may call startTurn/endTurn directly.

  return state;
};

// Scenario/test helpers (defId-first).
PD.state.cardPoolInit = function (state) {
  var pool = {};
  var uid;
  for (uid = 1; uid <= state.totalUids; uid++) {
    var di = state.uidToDefI[uid];
    var defId = PD.CARD_DEFS[di].id;
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

PD.state.takeUid = function (state, defId) {
  if (!state._pool) PD.state.cardPoolInit(state);
  var a = state._pool[defId];
  if (!a || a.length === 0) throw new Error("pool_exhausted:" + defId);
  return a.pop();
};

// ---- src/45_rules.js ----
// PD.rules: pure rule computations. PD.engine: deterministic command application + move generation.
PD.rules.evaluateWin = function (state) {
  var p;
  for (p = 0; p < 2; p++) {
    var sets = state.players[p].sets;
    var complete = 0;
    var si;
    for (si = 0; si < sets.length; si++) {
      var set = sets[si];
      if (!set) continue;
      var color = PD.rules.getSetColor(set.props);
      if (color === PD.state.NO_COLOR) continue;
      var req = PD.SET_RULES[color].requiredSize;
      if (set.props.length >= req && req > 0) complete++;
    }
    if (complete >= 3) return p;
  }
  return PD.state.NO_WINNER;
};

PD.engine.assertCanApply = function (state) {
  if (state.winnerP !== PD.state.NO_WINNER) throw new Error("game_over");
};

PD.engine.locEqZone = function (loc, zone) {
  return !!loc && loc.zone === zone;
};

PD.rules.rentAmountForSet = function (state, p, setI) {
  var sets = state.players[p].sets;
  if (setI < 0 || setI >= sets.length) return 0;
  var set = sets[setI];
  if (!set || !set.props || set.props.length <= 0) return 0;

  var color = PD.rules.getSetColor(set.props);
  if (color === PD.state.NO_COLOR) return 0;
  var rules = PD.SET_RULES[color];
  if (!rules || !rules.rent || rules.rent.length <= 0) return 0;

  var req = rules.requiredSize;
  var n = set.props.length;
  if (req > 0 && n > req) n = req;
  if (n <= 0) return 0;

  var base = rules.rent[n - 1];
  var bonus = 0;
  if (set.houseUid && req > 0 && set.props.length >= req) bonus = PD.HOUSE_RENT_BONUS;
  return base + bonus;
};

PD.engine.removeHandAtLoc = function (state, card) {
  var loc = card.loc;
  var p = loc.p;
  var i = loc.i;
  var uid = card.uid;
  var hand = state.players[p].hand;
  if (hand[i] !== uid) throw new Error("bad_loc");
  hand.splice(i, 1);
};

PD.engine.applyCommand = function (state, cmd) {
  PD.engine.assertCanApply(state);
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
    state.activeP = PD.rules.otherPlayer(state.activeP);
    events.push({ kind: "turn", activeP: state.activeP });
    PD.state.startTurn(state, events);
  }

  function applyDiscard(cmdDiscard) {
    var card = cmdDiscard.card;
    if (!card || !card.loc) throw new Error("bad_cmd");
    if (!PD.engine.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if (card.loc.p !== p) throw new Error("not_your_card");

    var uid = card.uid;
    PD.engine.removeHandAtLoc(state, card);
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
    if (handP.length <= PD.state.HAND_MAX) {
      PD.state.clearPrompt(state);
      applyEndTurn();
    }
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
        PD.state.clearPrompt(state);
        return { events: events };
      }
      throw new Error("prompt_active");
    }

    function payValueForUid(uid) {
      var def = PD.state.defByUid(state, uid);
      if (def.kind === PD.CardKind.Property) return def.propertyPayValue != null ? def.propertyPayValue : 0;
      return def.bankValue != null ? def.bankValue : 0;
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

      buf.push(uid);
      prompt.rem = prompt.rem - payValueForUid(uid);

      events.push({ kind: "payDebt", p: p, uid: uid, rem: prompt.rem, toP: prompt.toP });

      cleanupEmptySetsForPlayer(p);

      // Auto-finalize when covered or out of payables.
      if (prompt.rem > 0 && PD.state.hasAnyPayables(state, p)) return;

      var toP = prompt.toP;
      var recv = [];
      var i;
      for (i = 0; i < buf.length; i++) {
        var uidT = buf[i];
        var defT = PD.state.defByUid(state, uidT);
        if (defT && defT.kind === PD.CardKind.Property) {
          recv.push(uidT);
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
        PD.state.setPrompt(state, { kind: "placeReceived", p: toP, uids: recv });
      } else {
        PD.state.clearPrompt(state);
      }
    }

    function applyPlaceReceived(cmdProp) {
      var card = cmdProp.card;
      var dest = cmdProp.dest;
      if (!card || !card.loc || !dest) throw new Error("bad_cmd");
      if (card.loc.p !== p) throw new Error("not_your_card");
      if (!PD.engine.locEqZone(card.loc, "recvProps")) throw new Error("bad_loc");

      var ri = card.loc.i;
      var uids = prompt.uids;
      var uid = card.uid;
      if (!uids[ri] || uids[ri] !== uid) throw new Error("bad_loc");

      var def = PD.state.defByUid(state, uid);
      if (!def || def.kind !== PD.CardKind.Property) throw new Error("not_property");

      var placedColor = PD.state.NO_COLOR;
      if (PD.rules.isWildDef(def)) {
        placedColor = cmdProp.color;
        if (!PD.rules.wildAllowsColor(def, placedColor)) throw new Error("wild_color_illegal");
      } else {
        placedColor = def.propertyColor;
      }

      // Remove from received buffer.
      uids.splice(ri, 1);

      var sets = state.players[p].sets;
      var setI;
      if (dest.newSet) {
        var newSet = PD.state.newEmptySet();
        setI = sets.length;
        sets.push(newSet);
        events.push({ kind: "createSet", p: p, setI: setI, color: placedColor });
      } else {
        setI = dest.setI;
        if (setI < 0 || setI >= sets.length) throw new Error("bad_set");
        var setExisting = sets[setI];
        var setColor = PD.rules.getSetColor(setExisting.props);
        if (setColor === PD.state.NO_COLOR) throw new Error("empty_set");
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

      if (prompt.uids.length === 0) PD.state.clearPrompt(state);

      var winner = PD.rules.evaluateWin(state);
      if (winner !== PD.state.NO_WINNER) {
        state.winnerP = winner;
        events.push({ kind: "win", winnerP: winner });
      }
    }

    if (prompt.kind === "payDebt") {
      if (cmd.kind === "payDebt") { applyPayDebt(cmd); return { events: events }; }
      throw new Error("prompt_active");
    }
    if (prompt.kind === "placeReceived") {
      if (cmd.kind === "playProp") { applyPlaceReceived(cmd); return { events: events }; }
      throw new Error("prompt_active");
    }
    throw new Error("prompt_active");
  }

  function applyBank(cmdBank) {
    var card = cmdBank.card;
    if (!card || !card.loc) throw new Error("bad_cmd");
    if (!PD.engine.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if (card.loc.p !== p) throw new Error("not_your_card");

    var uid = card.uid;
    var def = PD.state.defByUid(state, uid);
    if (!PD.rules.isBankableDef(def)) throw new Error("not_bankable");

    PD.engine.removeHandAtLoc(state, card);
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
    if (!PD.engine.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if (card.loc.p !== p) throw new Error("not_your_card");

    var uid = card.uid;
    var def = PD.state.defByUid(state, uid);
    if (!def || def.kind !== PD.CardKind.Property) throw new Error("not_property");

    var placedColor = PD.state.NO_COLOR;
    if (PD.rules.isWildDef(def)) {
      placedColor = cmdProp.color;
      if (!PD.rules.wildAllowsColor(def, placedColor)) throw new Error("wild_color_illegal");
    } else {
      placedColor = def.propertyColor;
    }

    var sets = state.players[p].sets;
    var setI;
    if (dest.newSet) {
      var newSet = PD.state.newEmptySet();
      setI = sets.length;
      sets.push(newSet);
      events.push({ kind: "createSet", p: p, setI: setI, color: placedColor });
    } else {
      setI = dest.setI;
      if (setI < 0 || setI >= sets.length) throw new Error("bad_set");
      var setExisting = sets[setI];
      var setColor = PD.rules.getSetColor(setExisting.props);
      if (setColor === PD.state.NO_COLOR) throw new Error("empty_set");
      if (setColor !== placedColor) throw new Error("set_color_mismatch");
    }

    PD.engine.removeHandAtLoc(state, card);
    var setT = sets[setI];
    setT.props.push([uid, placedColor]);

    events.push({
      kind: "move",
      uid: uid,
      from: card.loc,
      to: { p: p, zone: "setProps", setI: setI, i: setT.props.length - 1 }
    });
    decPlays();

    var winner = PD.rules.evaluateWin(state);
    if (winner !== PD.state.NO_WINNER) {
      state.winnerP = winner;
      events.push({ kind: "win", winnerP: winner });
    }
  }

  function applyPlayHouse(cmdHouse) {
    var card = cmdHouse.card;
    var dest = cmdHouse.dest;
    if (!card || !card.loc || !dest) throw new Error("bad_cmd");
    if (!PD.engine.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if (card.loc.p !== p) throw new Error("not_your_card");

    var uid = card.uid;
    var def = PD.state.defByUid(state, uid);
    if (!def || def.kind !== PD.CardKind.House) throw new Error("not_house");

    var sets = state.players[p].sets;
    var setI = dest.setI;
    if (setI < 0 || setI >= sets.length) throw new Error("bad_set");
    var set = sets[setI];
    if (set.houseUid !== 0) throw new Error("house_already");

    var color = PD.rules.getSetColor(set.props);
    if (color === PD.state.NO_COLOR) throw new Error("empty_set");
    var req = PD.SET_RULES[color].requiredSize;
    if (set.props.length < req) throw new Error("set_not_complete");

    PD.engine.removeHandAtLoc(state, card);
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
    if (!PD.engine.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if (card.loc.p !== p) throw new Error("not_your_card");

    var uid = card.uid;
    var def = PD.state.defByUid(state, uid);
    if (!def || def.kind !== PD.CardKind.Action || def.actionKind !== PD.ActionKind.Rent) throw new Error("not_rent");

    var setI = cmdRent.setI;
    var sets = state.players[p].sets;
    if (!sets || setI < 0 || setI >= sets.length) throw new Error("bad_set");
    var set = sets[setI];
    if (!set || !set.props || set.props.length <= 0) throw new Error("empty_set");

    var color = PD.rules.getSetColor(set.props);
    if (color === PD.state.NO_COLOR) throw new Error("empty_set");

    var allowed = def.rentAllowedColors;
    if (allowed && allowed.length) {
      var ok = false;
      var ai;
      for (ai = 0; ai < allowed.length; ai++) if (allowed[ai] === color) ok = true;
      if (!ok) throw new Error("rent_color_illegal");
    }

    var amount = PD.rules.rentAmountForSet(state, p, setI);
    if (amount <= 0) throw new Error("rent_zero");

    // Discard the rent card.
    PD.engine.removeHandAtLoc(state, card);
    state.discard.push(uid);
    events.push({
      kind: "move",
      uid: uid,
      from: card.loc,
      to: { zone: "discard", i: state.discard.length - 1 }
    });
    decPlays();

    // Trigger debt prompt for the opponent (if they have payables).
    var payer = PD.rules.otherPlayer(p);
    PD.state.beginDebt(state, payer, p, amount);
    events.push({ kind: "rent", p: p, setI: setI, color: color, amount: amount });
  }

  if (cmd.kind === "endTurn") {
    if (handP.length > PD.state.HAND_MAX) {
      PD.state.setPrompt(state, { kind: "discardDown", p: p });
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
  else throw new Error("unknown_cmd:" + cmd.kind);

  return { events: events };
};

PD.engine._pushPlayPropMoves = function (outMoves, state, p, uid, loc, sets) {
  var def = PD.state.defByUid(state, uid);
  if (!def || def.kind !== PD.CardKind.Property) return;
  var cardRef = { uid: uid, loc: loc };

  if (PD.rules.isWildDef(def)) {
    // New set for each allowed color.
    outMoves.push({ kind: "playProp", card: cardRef, dest: { p: p, newSet: true }, color: def.wildColors[0] });
    outMoves.push({ kind: "playProp", card: cardRef, dest: { p: p, newSet: true }, color: def.wildColors[1] });
    // Existing sets that match allowed colors.
    var si;
    for (si = 0; si < sets.length; si++) {
      var set = sets[si];
      var setColor = PD.rules.getSetColor(set.props);
      if (setColor === PD.state.NO_COLOR) continue;
      if (PD.rules.wildAllowsColor(def, setColor)) {
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
    var setColorJ = PD.rules.getSetColor(setJ.props);
    if (setColorJ === PD.state.NO_COLOR) continue;
    if (setColorJ === c) {
      outMoves.push({ kind: "playProp", card: cardRef, dest: { p: p, setI: sj } });
    }
  }
};

PD.engine.legalMoves = function (state) {
  if (state.winnerP !== PD.state.NO_WINNER) return [];
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
      return out;
    }
    if (pr.kind === "placeReceived") {
      var pR = pr.p;
      var uids = pr.uids;
      var setsR = state.players[pR].sets;
      var outR = [];

      var iR;
      for (iR = 0; iR < uids.length; iR++) {
        var uidR = uids[iR];
        PD.engine._pushPlayPropMoves(outR, state, pR, uidR, { p: pR, zone: "recvProps", i: iR }, setsR);
      }
      return outR;
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
    var def = PD.state.defByUid(state, uid);
    var cardRef = { uid: uid, loc: { p: p, zone: "hand", i: i } };

    if (PD.rules.isBankableDef(def)) {
      moves.push({ kind: "bank", card: cardRef });
    }

    if (def.kind === PD.CardKind.Property) {
      PD.engine._pushPlayPropMoves(moves, state, p, uid, cardRef.loc, sets);
    } else if (def.kind === PD.CardKind.House) {
      var sh;
      for (sh = 0; sh < sets.length; sh++) {
        var setH = sets[sh];
        if (setH.houseUid !== 0) continue;
        var col = PD.rules.getSetColor(setH.props);
        if (col === PD.state.NO_COLOR) continue;
        var req = PD.SET_RULES[col].requiredSize;
        if (setH.props.length >= req) {
          moves.push({ kind: "playHouse", card: cardRef, dest: { p: p, setI: sh } });
        }
      }
    } else if (def.kind === PD.CardKind.Action && def.actionKind === PD.ActionKind.Rent) {
      // Rent: one move per eligible set.
      var allowed = def.rentAllowedColors;
      var siR;
      for (siR = 0; siR < sets.length; siR++) {
        var setR = sets[siR];
        if (!setR || !setR.props || setR.props.length <= 0) continue;
        var colR = PD.rules.getSetColor(setR.props);
        if (colR === PD.state.NO_COLOR) continue;
        if (allowed && allowed.length) {
          var ok = false;
          var ai;
          for (ai = 0; ai < allowed.length; ai++) if (allowed[ai] === colR) ok = true;
          if (!ok) continue;
        }
        var amt = PD.rules.rentAmountForSet(state, p, siR);
        if (amt <= 0) continue;
        moves.push({ kind: "playRent", card: cardRef, setI: siR });
      }
    }
  }

  return moves;
};

// ---- src/50_scenarios.js ----
// PD.scenarios: deterministic starting-state builders for testing + debug smoke runs.
PD.scenarios.resetForScenario = function (state) {
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
  PD.state.clearPrompt(state);
  state.winnerP = PD.state.NO_WINNER;
  // Ensure pool exists.
  PD.state.cardPoolInit(state);
};

PD.scenarios.setAddFixedProp = function (set, uid, color) {
  set.props.push([uid, color]);
};

PD.scenarios.setAddPropByDefId = function (state, set, defId, forcedColor) {
  var uid = PD.state.takeUid(state, defId);
  var def = PD.state.defByUid(state, uid);
  var color = PD.state.NO_COLOR;
  if (PD.rules.isWildDef(def)) {
    color = forcedColor;
    if (!PD.rules.wildAllowsColor(def, color)) throw new Error("scenario_bad_color:" + defId);
  } else {
    color = def.propertyColor;
  }
  PD.scenarios.setAddFixedProp(set, uid, color);
  return uid;
};

PD.scenarios.fillDeckFromPool = function (state) {
  var deck = [];
  var i;
  for (i = 0; i < PD.CARD_DEFS.length; i++) {
    var defId = PD.CARD_DEFS[i].id;
    var a = state._pool[defId];
    if (!a || a.length === 0) continue;
    var k;
    for (k = 0; k < a.length; k++) deck.push(a[k]);
    state._pool[defId] = [];
  }
  state.deck = deck;
};

PD.scenarios.applyScenario = function (state, scenarioId) {
  PD.scenarios.resetForScenario(state);

  var fn = PD.scenarios._applyById[scenarioId];
  if (!fn) throw new Error("unknown_scenario:" + scenarioId);
  fn(state);

  PD.scenarios.fillDeckFromPool(state);
  // Keep deck deterministic for scenarios; callers can shuffle if desired.
  return state;
};

// Scenario registry (single source of truth).
PD.scenarios.IDS = [
  "placeBasic",
  "wildBasic",
  "houseBasic",
  "winCheck",
  "bankScrollShuffle",
  // Phase 06
  "debtHouseFirst",
  "placeReceived",
  // Phase 07+: move generation smoke / AI policy stress
  "moveStress"
];

// Optional metadata for debug UI / docs.
PD.scenarios.INFO = {
  placeBasic: { title: "Place (basic)", desc: "Fixed property placement + Rent play-test (opponent has a small bank payable)." },
  wildBasic: { title: "Wild (basic)", desc: "Wild property placement + discard depth demo." },
  houseBasic: { title: "House (basic)", desc: "Build House on complete set only." },
  winCheck: { title: "Win check", desc: "Already-winning board state (game over)." },
  bankScrollShuffle: { title: "Bank+shuffle stress", desc: "Huge bank + reshuffle-on-draw stress case." },
  debtHouseFirst: { title: "Debt: house-first", desc: "Debt prompt where House must be paid before set properties." },
  placeReceived: { title: "Place received", desc: "Faux-turn placement buffer (includes Wild color choice)." },
  moveStress: { title: "Move stress", desc: "Many partial sets + 9-card hand (props + wilds + rent-any + house) to maximize legalMoves fanout for smoke testing + AI policy tuning." },
};

PD.scenarios._applyById = {
  placeBasic: function (state) {
    // P0 has 2 orange properties + $1. P0 also has an existing Orange set with 1 property.
    var setO = PD.state.newEmptySet();
    PD.scenarios.setAddPropByDefId(state, setO, "prop_orange", PD.state.NO_COLOR);
    state.players[0].sets.push(setO);

    state.players[0].hand.push(PD.state.takeUid(state, "prop_orange"));
    state.players[0].hand.push(PD.state.takeUid(state, "prop_orange"));
    state.players[0].hand.push(PD.state.takeUid(state, "money_1"));
    // Add a rent card that matches Orange (Magenta/Orange rent).
    state.players[0].hand.push(PD.state.takeUid(state, "rent_mo"));

    // Ensure opponent has something payable so Rent triggers payDebt.
    state.players[1].bank.push(PD.state.takeUid(state, "money_1"));
  },

  wildBasic: function (state) {
    // P0 has Wild(M/O) and $1.
    state.players[0].hand.push(PD.state.takeUid(state, "wild_mo"));
    state.players[0].hand.push(PD.state.takeUid(state, "money_1"));

    // Discard demo (depth=3): top card is last.
    state.discard.push(PD.state.takeUid(state, "money_2"));
    state.discard.push(PD.state.takeUid(state, "money_1"));
    state.discard.push(PD.state.takeUid(state, "rent_cb"));
  },

  houseBasic: function (state) {
    // P0 has two Houses in hand.
    state.players[0].hand.push(PD.state.takeUid(state, "house"));
    state.players[0].hand.push(PD.state.takeUid(state, "house"));

    // One complete Cyan set (2).
    var setC = PD.state.newEmptySet();
    PD.scenarios.setAddPropByDefId(state, setC, "prop_cyan", PD.state.NO_COLOR);
    PD.scenarios.setAddPropByDefId(state, setC, "prop_cyan", PD.state.NO_COLOR);
    state.players[0].sets.push(setC);

    // One incomplete Black set (3/4).
    var setB = PD.state.newEmptySet();
    PD.scenarios.setAddPropByDefId(state, setB, "prop_black", PD.state.NO_COLOR);
    PD.scenarios.setAddPropByDefId(state, setB, "prop_black", PD.state.NO_COLOR);
    PD.scenarios.setAddPropByDefId(state, setB, "prop_black", PD.state.NO_COLOR);
    state.players[0].sets.push(setB);

    // Discard demo (depth=1).
    state.discard.push(PD.state.takeUid(state, "money_5"));
  },

  winCheck: function (state) {
    // P0 has 3 complete sets: Cyan(2), Magenta(3), Orange(3).
    var setC2 = PD.state.newEmptySet();
    PD.scenarios.setAddPropByDefId(state, setC2, "prop_cyan", PD.state.NO_COLOR);
    PD.scenarios.setAddPropByDefId(state, setC2, "prop_cyan", PD.state.NO_COLOR);
    state.players[0].sets.push(setC2);

    var setM3 = PD.state.newEmptySet();
    PD.scenarios.setAddPropByDefId(state, setM3, "prop_magenta", PD.state.NO_COLOR);
    PD.scenarios.setAddPropByDefId(state, setM3, "prop_magenta", PD.state.NO_COLOR);
    PD.scenarios.setAddPropByDefId(state, setM3, "prop_magenta", PD.state.NO_COLOR);
    state.players[0].sets.push(setM3);

    var setO3 = PD.state.newEmptySet();
    PD.scenarios.setAddPropByDefId(state, setO3, "prop_orange", PD.state.NO_COLOR);
    PD.scenarios.setAddPropByDefId(state, setO3, "prop_orange", PD.state.NO_COLOR);
    PD.scenarios.setAddPropByDefId(state, setO3, "prop_orange", PD.state.NO_COLOR);
    state.players[0].sets.push(setO3);

    state.playsLeft = 0;
    state.winnerP = PD.rules.evaluateWin(state);
  },

  bankScrollShuffle: function (state) {
    // Dev scenario:
    // - P0 bank contains *all* bankable cards (money/action/house) to stress bank stack/scrolling.
    // - Most remaining cards are in discard (to stress reshuffle).
    // - Leave exactly 1 card in deck so the next draw forces a reshuffle.
    // - Ensure P1 hand is non-empty so endTurn draws 2 (not 5).

    // Seed P1 hand with 1 property so startTurn draws 2.
    state.players[1].hand.push(PD.state.takeUid(state, "prop_cyan"));

    // Drain pool: bankables -> P0 bank; non-bankables -> discard.
    var di;
    for (di = 0; di < PD.CARD_DEFS.length; di++) {
      var def = PD.CARD_DEFS[di];
      if (!def || !def.id) continue;
      var defId = def.id;
      var a = state._pool[defId];
      if (!a || a.length === 0) continue;

      // NOTE: scenario pool contains only uids, so we inspect the def kind here.
      var bankable = PD.rules.isBankableDef(def);
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
      var keepDef = PD.state.defByUid(state, keepUid);
      var keepId = String(keepDef.id);
      state._pool[keepId].push(keepUid);
    }

    // Keep hand small and end-turn legal.
    state.players[0].hand = [];
    state.activeP = 0;
    state.playsLeft = 0;
    state.winnerP = PD.state.NO_WINNER;
  },

  // Phase 06: prompt-driven debt payment where House must be paid first.
  // Goal: exercise prompt actor separation + house-first redirect + overpay allowed.
  debtHouseFirst: function (state) {
    // P0: complete Cyan set with a House.
    var setC = PD.state.newEmptySet();
    PD.scenarios.setAddPropByDefId(state, setC, "prop_cyan", PD.state.NO_COLOR);
    PD.scenarios.setAddPropByDefId(state, setC, "prop_cyan", PD.state.NO_COLOR);
    setC.houseUid = PD.state.takeUid(state, "house");
    state.players[0].sets.push(setC);

    // Keep bank empty so the only payable is the House (forces the rule).
    state.players[0].bank = [];

    // Add a little hand so the UI isn't empty.
    state.players[0].hand.push(PD.state.takeUid(state, "rent_cb"));

    // Pay a small debt to P1; paying the House overpays and resolves immediately.
    PD.state.setPrompt(state, { kind: "payDebt", p: 0, toP: 1, rem: 1, buf: [] });
  },

  // Phase 06: recipient faux-turn placement buffer (received properties).
  placeReceived: function (state) {
    // P0 has an existing Orange set to allow placing into existing sets.
    var setO = PD.state.newEmptySet();
    PD.scenarios.setAddPropByDefId(state, setO, "prop_orange", PD.state.NO_COLOR);
    state.players[0].sets.push(setO);

    // Prompt buffer: one fixed property + one Wild to place (wild assignment chosen during placement).
    var recv = [];
    recv.push(PD.state.takeUid(state, "prop_orange"));
    recv.push(PD.state.takeUid(state, "wild_mo"));
    PD.state.setPrompt(state, { kind: "placeReceived", p: 0, uids: recv });

    // Keep normal hand visible for the “faux-hand + real hand” row layout.
    state.players[0].hand.push(PD.state.takeUid(state, "money_1"));
    state.players[0].hand.push(PD.state.takeUid(state, "rent_mo"));
  },

  // Phase 07+: maximize legalMoves fanout for smoke testing + AI policy tuning.
  moveStress: function (state) {
    // Board: P0 has many partial sets so properties/wilds have multiple existing destinations.
    // Hand: 9 cards including wilds + rent-any + house, so move list gets large.
    //
    // Note: hand > HAND_MAX is intentional; endTurn will enter discardDown prompt.

    // 1 complete Cyan set (2) so House has at least one legal build target.
    var setC = PD.state.newEmptySet();
    PD.scenarios.setAddPropByDefId(state, setC, "prop_cyan", PD.state.NO_COLOR);
    PD.scenarios.setAddPropByDefId(state, setC, "prop_cyan", PD.state.NO_COLOR);
    state.players[0].sets.push(setC);

    // 2 Magenta sets (each 1 prop) so Magenta + wild_mo can target multiple existing sets.
    var setM0 = PD.state.newEmptySet();
    PD.scenarios.setAddPropByDefId(state, setM0, "prop_magenta", PD.state.NO_COLOR);
    state.players[0].sets.push(setM0);
    var setM1 = PD.state.newEmptySet();
    PD.scenarios.setAddPropByDefId(state, setM1, "prop_magenta", PD.state.NO_COLOR);
    state.players[0].sets.push(setM1);

    // 2 Orange sets (each 1 prop) so Orange + wild_mo can target multiple existing sets.
    var setO0 = PD.state.newEmptySet();
    PD.scenarios.setAddPropByDefId(state, setO0, "prop_orange", PD.state.NO_COLOR);
    state.players[0].sets.push(setO0);
    var setO1 = PD.state.newEmptySet();
    PD.scenarios.setAddPropByDefId(state, setO1, "prop_orange", PD.state.NO_COLOR);
    state.players[0].sets.push(setO1);

    // 3 Black sets (each 1 prop) so Black + wild_cb can target multiple existing sets.
    var setB0 = PD.state.newEmptySet();
    PD.scenarios.setAddPropByDefId(state, setB0, "prop_black", PD.state.NO_COLOR);
    state.players[0].sets.push(setB0);
    var setB1 = PD.state.newEmptySet();
    PD.scenarios.setAddPropByDefId(state, setB1, "prop_black", PD.state.NO_COLOR);
    state.players[0].sets.push(setB1);
    var setB2 = PD.state.newEmptySet();
    PD.scenarios.setAddPropByDefId(state, setB2, "prop_black", PD.state.NO_COLOR);
    state.players[0].sets.push(setB2);

    // Hand: one of each base property (remaining), both wilds, plus rent-any + house + $1 + one action.
    state.players[0].hand.push(PD.state.takeUid(state, "prop_magenta"));
    state.players[0].hand.push(PD.state.takeUid(state, "prop_orange"));
    state.players[0].hand.push(PD.state.takeUid(state, "prop_black"));
    state.players[0].hand.push(PD.state.takeUid(state, "wild_mo"));
    state.players[0].hand.push(PD.state.takeUid(state, "wild_cb"));

    state.players[0].hand.push(PD.state.takeUid(state, "house"));
    state.players[0].hand.push(PD.state.takeUid(state, "rent_any"));
    state.players[0].hand.push(PD.state.takeUid(state, "money_1"));
    state.players[0].hand.push(PD.state.takeUid(state, "sly_deal"));
  },
};

// ---- src/52_moves.js ----
// PD.moves: shared move helpers (rules + UI). Pure-ish: reads state/move lists, no view mutations.

// Helpers for Place command lists (shared by targeting + menu label tweaks).
PD.moves.defaultWildColorForPlace = function (state, uid, def) {
  if (!def || !PD.rules.isWildDef(def)) return PD.state.NO_COLOR;
  var moves = PD.engine.legalMoves(state);
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

PD.moves.placeCmdsForUid = function (state, uid, def, wildColor) {
  var moves = PD.engine.legalMoves(state);
  var cmds = [];
  var i;
  var isWild = !!(def && PD.rules.isWildDef(def));
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

PD.moves.buildCmdsForUid = function (state, uid) {
  var moves = PD.engine.legalMoves(state);
  var buildMoves = [];
  var i;
  for (i = 0; i < moves.length; i++) {
    var mv = moves[i];
    if (mv && mv.kind === "playHouse" && mv.card && mv.card.uid === uid) buildMoves.push(mv);
  }
  return buildMoves;
};

PD.moves.rentMovesForUid = function (state, uid) {
  var moves = PD.engine.legalMoves(state);
  var rentMoves = [];
  var i;
  for (i = 0; i < moves.length; i++) {
    var mv = moves[i];
    if (mv && mv.kind === "playRent" && mv.card && mv.card.uid === uid) rentMoves.push(mv);
  }
  return rentMoves;
};

PD.moves.sortRentMovesByAmount = function (state, p, rentMoves) {
  if (!rentMoves || rentMoves.length <= 1) return rentMoves;
  rentMoves.sort(function (a, b) {
    var ai = (a && a.setI != null) ? a.setI : -1;
    var bi = (b && b.setI != null) ? b.setI : -1;
    var aa = PD.rules.rentAmountForSet(state, p, ai);
    var bb = PD.rules.rentAmountForSet(state, p, bi);
    var d = bb - aa;
    if (d) return d;
    return ai - bi;
  });
  return rentMoves;
};

PD.moves.locAllowsSource = function (loc) {
  if (!loc || !loc.zone) return false;
  var z = String(loc.zone);
  return (z === "hand") || (z === "recvProps");
};

// Build the list of cmds for a targeting mode.
// Returns { cmds, wildColor } or null (unknown kind).
PD.moves.cmdsForTargeting = function (state, kind, uid, loc) {
  kind = String(kind || "");
  var allowSource = PD.moves.locAllowsSource(loc);
  var out = { cmds: [], wildColor: PD.state.NO_COLOR };

  if (kind === "bank") {
    out.cmds = PD.moves.bankCmdsForUid(state, uid);
    if (allowSource) out.cmds.push({ kind: "source" });
    return out;
  }

  if (kind === "rent") {
    out.cmds = PD.moves.rentMovesForUid(state, uid);
    PD.moves.sortRentMovesByAmount(state, loc ? loc.p : 0, out.cmds);
    if (allowSource) out.cmds.push({ kind: "source" });
    return out;
  }

  if (kind === "quick") {
    var rentCmds = PD.moves.rentMovesForUid(state, uid);
    PD.moves.sortRentMovesByAmount(state, loc ? loc.p : 0, rentCmds);
    var buildCmds = PD.moves.buildCmdsForUid(state, uid);
    var bankCmds = PD.moves.bankCmdsForUid(state, uid);
    out.cmds = rentCmds.concat(buildCmds).concat(bankCmds);
    if (allowSource) out.cmds.push({ kind: "source" });
    return out;
  }

  if (kind === "build") {
    out.cmds = PD.moves.buildCmdsForUid(state, uid);
    if (allowSource) out.cmds.push({ kind: "source" });
    return out;
  }

  if (kind === "place") {
    var def = PD.state.defByUid(state, uid);
    if (def && PD.rules.isWildDef(def)) {
      out.wildColor = PD.moves.defaultWildColorForPlace(state, uid, def);
      out.cmds = PD.moves.placeCmdsForUid(state, uid, def, out.wildColor);
    } else {
      out.wildColor = PD.state.NO_COLOR;
      out.cmds = PD.moves.placeCmdsForUid(state, uid, def, PD.state.NO_COLOR);
    }
    if (allowSource) out.cmds.push({ kind: "source" });
    return out;
  }

  return null;
};

// Command semantics: interpret a cmd's destination in board-space terms.
// Returns one of:
// - {kind:"newSet", p}
// - {kind:"setEnd", p, setI}
// - {kind:"setTop", p, setI}
// - {kind:"bankEnd", p}
// - {kind:"source"}
// - null
PD.moves.destForCmd = function (cmd) {
  if (!cmd || !cmd.kind) return null;
  if (cmd.kind === "playProp") {
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

PD.moves.bankCmdsForUid = function (state, uid) {
  var moves = PD.engine.legalMoves(state);
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
// PD.ai: simple playtest AI (pick among legal moves using deterministic RNG + short narration).

PD.ai.policies = {
  uniform: {
    id: "uniform",
    weight: function () { return 1; }
  },

  biasExistingSet: {
    id: "biasExistingSet",
    weight: function (state, move) {
      // Soft bias: prefer placing properties into existing sets, but still allow anything.
      // Tuning knob lives in config.
      var k = PD.config.ai.biasExistingSetK;
      if (move && move.kind === "playProp" && move.dest && move.dest.setI != null) return k;
      return 1;
    }
  },

  biasPlayRent: {
    id: "biasPlayRent",
    weight: function (state, move) {
      // Soft bias: prefer asking for rent rather than banking the Rent card.
      // Tuning knob lives in config.
      var k = PD.config.ai.biasPlayRentK;
      if (move && move.kind === "playRent") return k;
      return 1;
    }
  }
};

PD.ai.composePolicies = function (id, policyIds) {
  // Compose policies by multiplying their weights.
  // Contract: each component policy weight is a positive number (1 means neutral).
  var parts = [];
  var i;
  for (i = 0; i < policyIds.length; i++) {
    var pid = policyIds[i];
    var p = PD.ai.policies[pid];
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

PD.ai.policies.defaultHeuristic = PD.ai.composePolicies("defaultHeuristic", [
  "biasExistingSet",
  "biasPlayRent"
]);

PD.ai.pickMove = function (state, moves, policy) {
  if (!moves || moves.length === 0) return null;

  // Fallback to uniform if policy is missing (should be caught by tests).
  var pol = policy || PD.ai.policies.uniform;

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
    var idxU = PD.rng.nextIntInState(state, moves.length);
    return moves[idxU];
  }

  var r = PD.rng.nextIntInState(state, total);
  var acc = 0;
  for (i = 0; i < moves.length; i++) {
    acc += weights[i];
    if (r < acc) return moves[i];
  }

  // Should be unreachable; keep deterministic behavior.
  return moves[moves.length - 1];
};

PD.ai.policyForP = function (p) {
  return PD.ai.policies[PD.config.ai.policyByP[p]];
};

PD.ai.actor = function (state) {
  var pr = state.prompt;
  if (pr && pr.p != null) return pr.p;
  return state.activeP;
};

PD.ai.pickRandomLegalMove = function (state) {
  var moves = PD.engine.legalMoves(state);
  if (!moves || moves.length === 0) return null;
  var p = PD.ai.actor(state);
  var policy = PD.ai.policyForP(p);
  return PD.ai.pickMove(state, moves, policy);
};

PD.ai.describeCmd = function (state, cmd) {
  if (!cmd || !cmd.kind) return "";
  var k = String(cmd.kind);
  if (k === "endTurn") return "Opponent: End turn";
  if (k === "bank") return "Opponent: Bank";
  if (k === "playRent") return "Opponent: Rent";
  if (k === "playHouse") return "Opponent: Build";
  if (k === "playProp") {
    var dl = PD.fmt.destLabelForCmd(state, cmd);
    return dl ? ("Opponent: Place -> " + dl) : "Opponent: Place";
  }
  if (k === "payDebt") return "Opponent: Pay";
  if (k === "discard") return "Opponent: Discard";
  if (k === "cancelPrompt") return "Opponent: Cancel";
  return "Opponent: " + k;
};

// ---- src/55_fmt.js ----
// PD.fmt: shared text formatting helpers (UI/debug narration).
PD.fmt.colorName = function (c) {
  if (c === PD.Color.Cyan) return "Cyan";
  if (c === PD.Color.Magenta) return "Magenta";
  if (c === PD.Color.Orange) return "Orange";
  if (c === PD.Color.Black) return "Black";
  return "c" + String(c);
};

PD.fmt.valueForDef = function (def) {
  if (!def) return null;
  if (def.kind === PD.CardKind.Property) {
    if (def.propertyPayValue != null) return def.propertyPayValue;
    return 0;
  }
  if (def.bankValue != null) return def.bankValue;
  return null;
};

PD.fmt.errorMessage = function (code) {
  code = String(code || "");
  if (code === "no_plays_left") return "No plays left";
  if (code === "hand_over_limit") return "Hand over limit";
  if (code === "not_bankable") return "Not bankable";
  if (code === "set_not_complete") return "Set not complete";
  if (code === "set_color_mismatch") return "Wrong set color";
  if (code === "wild_color_illegal") return "Wild color illegal";
  if (code === "no_targets") return "No valid destination";
  if (code === "house_pay_first") return "House must be paid first";
  return code || "error";
};

PD.fmt.appendRuleNotes = function (def, baseDesc) {
  baseDesc = baseDesc ? String(baseDesc) : "";
  if (!def || !def.ruleNotes || def.ruleNotes.length === 0) return baseDesc;
  var enabled = PD.config.rules.enabledRuleNotes;
  if (enabled.length === 0) return baseDesc;

  var out = baseDesc;
  var i;
  for (i = 0; i < def.ruleNotes.length; i++) {
    var id = def.ruleNotes[i];
    var j;
    var on = false;
    for (j = 0; j < enabled.length; j++) if (enabled[j] === id) { on = true; break; }
    if (!on) continue;
    var txt = PD.ruleNoteTextById[id] ? String(PD.ruleNoteTextById[id]) : "";
    if (!txt) continue;
    if (out) out += "\n";
    out += txt;
  }
  return out;
};

PD.fmt.inspectTitleForDef = function (def) {
  if (!def) return "";
  return def.name ? String(def.name) : (def.id ? String(def.id) : "");
};

PD.fmt.inspectDescForDef = function (def, selColor) {
  if (!def) return "";
  var base = def.desc ? String(def.desc) : "";
  base = PD.fmt.appendRuleNotes(def, base);
  var v = PD.fmt.valueForDef(def);
  var vLine = (v != null && v > 0) ? ("Value: $" + String(v)) : "";
  var usedAs = "";
  if (PD.rules.isWildDef(def)) {
    var cSel = selColor;
    if (cSel !== PD.state.NO_COLOR && def.wildColors && (cSel === def.wildColors[0] || cSel === def.wildColors[1])) {
      usedAs = "Currently used as: " + PD.fmt.colorName(cSel);
    }
  }

  var out = "";
  if (vLine) out = vLine;
  if (usedAs) out = out ? (out + "\n" + usedAs) : usedAs;
  if (base) out = out ? (out + "\n" + base) : base;
  return out;
};

PD.fmt.destLabelForCmd = function (state, cmd) {
  var d = PD.moves.destForCmd(cmd);
  if (!d) return "";
  if (d.kind === "newSet") return "New Set";
  if (d.kind === "setEnd") return PD.fmt.setLabelForSetI(state, d.p, d.setI);
  return "";
};

PD.fmt.setLabelForSetI = function (state, p, setI) {
  var set = state.players[p].sets[setI];
  var col = set ? PD.rules.getSetColor(set.props) : PD.state.NO_COLOR;
  return PD.fmt.colorName(col) + " Set";
};

PD.fmt.menuLabelForCmds = function (baseLabel, state, cmds) {
  baseLabel = String(baseLabel || "");
  if (!baseLabel) baseLabel = "Action";
  if (!cmds || cmds.length === 0) return baseLabel;
  if (cmds.length !== 1) return baseLabel + "...";
  var dl = PD.fmt.destLabelForCmd(state, cmds[0]);
  return dl ? (baseLabel + " -> " + dl) : baseLabel;
};

PD.fmt.menuLabelForRentMoves = function (state, rentMoves) {
  if (!rentMoves || rentMoves.length === 0) return "";
  if (rentMoves.length !== 1) return "Rent...";
  var onlyR = rentMoves[0];
  var sl = PD.fmt.setLabelForSetI(state, 0, onlyR.setI);
  return sl ? ("Rent -> " + sl) : "Rent";
};

PD.fmt.targetingTitle = function (targeting, cmd) {
  var tKind = targeting && targeting.kind ? String(targeting.kind) : "";

  function titleForCmd(cmd0) {
    if (!cmd0 || !cmd0.kind) return (tKind === "quick") ? "Action" : "Target";
    if (cmd0.kind === "playRent") return "Rent";
    if (cmd0.kind === "playHouse") return "Build";
    if (cmd0.kind === "bank") return "Bank";
    if (cmd0.kind === "playProp") return "Place";
    if (cmd0.kind === "source") return "Source";
    return "Target";
  }

  if (tKind === "build") return "Build";
  if (tKind === "place") return "Place";
  if (tKind === "rent") return "Rent";
  if (tKind === "quick") return titleForCmd(cmd);
  return "Bank";
};

PD.fmt.targetingDestLine = function (state, targeting, cmd) {
  var t = targeting || null;
  var k = String(cmd.kind);

  if (k === "playProp") {
    var out = "";
    if (cmd.dest && cmd.dest.newSet) out = "Dest: New set";
    else if (cmd.dest && cmd.dest.setI != null) {
      var set = state.players[cmd.dest.p].sets[cmd.dest.setI];
      var col = set ? PD.rules.getSetColor(set.props) : PD.state.NO_COLOR;
      out = "Dest: " + PD.fmt.colorName(col) + " set";
    }
    if (t && t.card && t.card.def && PD.rules.isWildDef(t.card.def)) out += "\nAs: " + PD.fmt.colorName(t.wildColor);
    return out || "(no destination)";
  }

  if (k === "playHouse") {
    var set2 = state.players[cmd.dest.p].sets[cmd.dest.setI];
    var col2 = set2 ? PD.rules.getSetColor(set2.props) : PD.state.NO_COLOR;
    return "Dest: " + PD.fmt.colorName(col2) + " set";
  }

  if (k === "playRent") {
    var p = cmd.card.loc.p;
    var setR = state.players[p].sets[cmd.setI];
    var colR = setR ? PD.rules.getSetColor(setR.props) : PD.state.NO_COLOR;
    var amt = PD.rules.rentAmountForSet(state, p, cmd.setI);
    return "From: " + PD.fmt.colorName(colR) + " set\nAmt: $" + amt;
  }

  if (k === "bank") return "Dest: Bank";
  if (k === "source") return "Dest: Source";
  return "(no destination)";
};

PD.fmt.targetingHelp = function (targeting) {
  var t = targeting || null;
  var kind = t && t.kind ? String(t.kind) : "";
  var help = (kind === "quick") ? "L/R: Option" : ((kind === "rent") ? "L/R: Set" : "L/R: Dest");
  if (t && t.card && t.card.def && PD.rules.isWildDef(t.card.def)) help += "  U/D: Color";
  help += (t && t.hold) ? "\nRelease A: Drop  B:Cancel" : "\nA:Confirm  B:Cancel";
  return help;
};

// ---- src/56_layout.js ----
// PD.layout: shared layout/geometry helpers (UI + renderer). Pure; reads PD.config.

PD.layout.rowY0 = function (row) {
  return PD.config.render.layout.rowY[row];
};

PD.layout.rowH = function (row) {
  return PD.config.render.layout.rowH[row];
};

PD.layout.faceYForRow = function (row) {
  var L = PD.config.render.layout;
  if (row === 0) {
    // Opponent hand: bottom slice visible; cards extend upward off-screen.
    return L.rowY[0] + L.rowH[0] - L.faceH;
  }
  if (row === 1 || row === 3 || row === 4) {
    return L.rowY[row] + L.faceInsetY;
  }
  return L.rowY[row];
};

PD.layout.isOpponentRow = function (row) {
  return row === 0 || row === 1;
};

PD.layout.playerForRow = function (row) {
  if (row === 0 || row === 1) return 1;
  if (row === 3 || row === 4) return 0;
  return -1;
};

// ---- src/60_render.js ----
// PD.render: display-only renderer + TIC-80 draw-call boundary wrappers (no state mutation).
(function initRenderModule() {
  var R = PD.render;

  R.ROW_OP_HAND = 0;
  R.ROW_OP_TABLE = 1;
  R.ROW_CENTER = 2;
  R.ROW_P_TABLE = 3;
  R.ROW_P_HAND = 4;

  var renderCfg = PD.config.render;
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

  function initCenterFromLayout() {
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
  }

  R.center = initCenterFromLayout();

  // Property bar palette (placeholder; tweak later).
  R.propBarColByColor = [];
  var Pal = PD.Pal;
  R.propBarColByColor[PD.Color.Cyan] = Pal.Cyan;
  R.propBarColByColor[PD.Color.Magenta] = Pal.Purple;
  R.propBarColByColor[PD.Color.Orange] = Pal.Orange;
  R.propBarColByColor[PD.Color.Black] = Pal.DarkGrey;

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
  function rowH(row) { return R.cfg.rowH[row]; }
  function rowY1(row) { return rowY0(row) + rowH(row) - 1; }

  // Row policy lives in PD.layout; renderer uses it for flip decisions.
  function isOpponentRow(row) { return PD.layout.isOpponentRow(row); }

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

    function drawGhostAt(xFace, yFace) {
      var shadowCol = PD.Pal.Black;
      var col = PD.Pal.Green;
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
          drawGhostAt(xFace, yFace);
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

  function digitSpriteId(n) {
    return R.spr.digit0 + n;
  }

  function drawDigitGlyph(n, xGlyphTL, yGlyphTL, flip180) {
    if (n < 0 || n > 9) return;
    var id = digitSpriteId(n);
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

  function drawRentRow(xFace, yFace, rentArr, flip180) {
    if (!rentArr || rentArr.length <= 0) return;
    var i;
    for (i = 0; i < rentArr.length; i++) {
      var v = rentArr[i];
      if (v < 0 || v > 9) continue;
      var lx = R.cfg.propRentX + i * R.cfg.propRentDx;
      var ly = R.cfg.propRentY;
      var p = cardLocalRectToScreen(xFace, yFace, lx, ly, R.cfg.digitGlyphW, R.cfg.digitGlyphH, flip180);
      drawDigitGlyph(v, p.x, p.y, flip180);
    }
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
    var rent = (PD.SET_RULES && PD.SET_RULES[color]) ? PD.SET_RULES[color].rent : null;
    drawRentRow(xFace, yFace, rent, flip180);
  }

  function iconForDef(def) {
    if (!def) return 0;
    if (def.kind === PD.CardKind.Money) {
      return R.spr.iconMoney || 0;
    }
    if (def.kind === PD.CardKind.House) return R.spr.iconHouse;
    if (def.kind === PD.CardKind.Action) {
      if (def.actionKind === PD.ActionKind.Rent) return R.spr.iconRent;
      if (def.actionKind === PD.ActionKind.SlyDeal) return R.spr.iconSlyDeal;
      if (def.actionKind === PD.ActionKind.JustSayNo) return R.spr.iconJSN;
    }
    return 0;
  }

  function rentColorsForDef(def) {
    if (!def || def.actionKind !== PD.ActionKind.Rent) return null;
    var a = def.rentAllowedColors;
    if (a && a.length) return a;
    // rent_any: treat as 4 colors in a stable order.
    return [PD.Color.Cyan, PD.Color.Black, PD.Color.Magenta, PD.Color.Orange];
  }

  function rentBarColForColor(color) {
    if (color === PD.Color.Black) return PD.Pal.Black;
    var c = R.propBarColByColor[color];
    return c != null ? c : R.cfg.colText;
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
      rectSafe(p.x, p.y, p.w, p.h, rentBarColForColor(colors[i]));
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
    var def = state ? PD.state.defByUid(state, uid) : null;
    if (!def) {
      drawCardFaceBase(xFace, yFace, R.cfg.colCardInterior);
      return;
    }

    if (def.kind === PD.CardKind.Property) {
      drawCardFaceBase(xFace, yFace, R.cfg.colCardInterior);
      var payV = def.propertyPayValue != null ? def.propertyPayValue : 0;
      if (PD.rules.isWildDef(def)) {
        // Two halves: top (halfFlip=false), bottom (halfFlip=true). Effective flip is XOR.
        var c0 = def.wildColors[0];
        var c1 = def.wildColors[1];
        var a = (assignedColor == null) ? PD.state.NO_COLOR : assignedColor;
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

    if (def.kind === PD.CardKind.Action && def.actionKind === PD.ActionKind.Rent) {
      drawCardFaceBase(xFace, yFace, R.cfg.colCardInterior);
      drawRentBars(xFace, yFace, rentColorsForDef(def), !!flip180);
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

  function drawCardBack(xFace, yFace, flip180) {
    var cfg = R.cfg;
    var id = (R.spr && R.spr.cardBackTL != null) ? R.spr.cardBackTL : 0;

    if (id) {
      // Phase 03b back: 2x3 sprite (16x24) drawn inside the 1px border.
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

  // Phase 04: renderer no longer computes row models/navigation/cameras.
  // UI owns selection + cameras via PD.ui, and passes computed models in.

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

    var dbgEnabled = !!PD.config.debug.enabled;
    var hlCol = (opts.highlightCol != null) ? opts.highlightCol : cfg.colHighlight;

    // Header: removed (Phase 04). Plays indicator is drawn in screen-space.

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
          // Note: debug gating and overlay hiding is handled in PD.ui.computeRowModels.

          var enabled = true;
          if (it.id === "endTurn") {
            enabled = (s.activeP === 0) && (s.players[0].hand.length <= PD.state.HAND_MAX);
          }

          var isSel = !!(selectedItem && selectedItem === it);
          var recommend = false;
          if (it.id === "endTurn" && enabled && (s.activeP === 0) && (s.playsLeft != null) && (s.playsLeft <= 0)) recommend = true;

          var bg = isSel ? hlCol : cfg.colCenterPanel;
          var border = isSel ? PD.Pal.Black : (recommend ? PD.Pal.Green : cfg.colCenterPanelBorder);
          var colText = enabled ? (isSel ? PD.Pal.Black : cfg.colText) : PD.Pal.Grey;
          if (!isSel && recommend && enabled) colText = PD.Pal.Green;

          rectSafe(it.x, it.y, it.w, it.h, bg);
          rectbSafe(it.x, it.y, it.w, it.h, border);

          // Vertically center 6px font in 10px button: y+2.
          printSafe(String(it.label || it.id || ""), it.x + 2, it.y + 2, colText);
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

    // Phase 05: Inspect uses a screen-space panel with panel-driven anchors.
    var panel = null;
    if (view.inspectActive) {
      var Lp = PD.config.render.layout;
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
            var defT = PD.state.defByUid(s, topUid);
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
            var defD = PD.state.defByUid(s, topUid2);
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
      var def = PD.state.defByUid(s, uid);
      if (!def) return;

      // Opponent hand is hidden unless debug enabled.
      if (!dbgEnabled && sel.row === R.ROW_OP_HAND) {
        printSafe("Opponent card", xTitle, yTitle, cfg.colText);
        printExSafe("(hidden)", xDesc, yDesc, cfg.colText, false, 1, false);
        return;
      }

      drawMiniCard(s, uid, xPrev, yPrev, false, sel.color);
      printSafe(PD.fmt.inspectTitleForDef(def), xTitle, yTitle, cfg.colText);
      var desc = PD.fmt.inspectDescForDef(def, sel.color);
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
      rectSafe(boxX, boxY, boxW, boxH, PD.Pal.Black);
      rectbSafe(boxX, boxY, boxW, boxH, cfg.colCenterPanelBorder);

      for (j = 0; j < items.length; j++) {
        var yy = y + j * 7;
        var label = String(items[j].label || items[j].id || "");
        if (j === selI) {
          rectSafe(boxX + 1, yy - 1, boxW - 2, 7, hlCol);
          printSafe(label, xDesc, yy, PD.Pal.Black);
        } else {
          printSafe(label, xDesc, yy, cfg.colText);
        }
      }
      printExSafe("A:Select  B:Back", xDesc, hintY, cfg.colText, false, 1, true);
    }

    function drawTargetingOverlay() {
      var t = view.targeting;
      if (!t || !t.active) return;
      if (t.card && t.card.uid) drawMiniCard(s, t.card.uid, xPrev, yPrev, false, (t.wildColor !== PD.state.NO_COLOR) ? t.wildColor : null);

      var cmd = (t.cmds && t.cmds.length) ? t.cmds[t.cmdI % t.cmds.length] : null;

      var title = PD.fmt.targetingTitle(t, cmd);
      printSafe(title, xTitle, yTitle, cfg.colText);
      var destLine = PD.fmt.targetingDestLine(s, t, cmd);
      // Backing box so targeting is unmistakable.
      var boxX = xDesc - 2;
      var boxY = yDesc - 2;
      var boxW = cfg.screenW - boxX - cfg.rowPadX;
      var boxH = 30;
      rectSafe(boxX, boxY, boxW, boxH, PD.Pal.Black);
      rectbSafe(boxX, boxY, boxW, boxH, cfg.colCenterPanelBorder);

      printExSafe(destLine, xDesc, yDesc, cfg.colText, false, 1, false);

      var help = PD.fmt.targetingHelp(t);
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
      var col = (i < used) ? PD.Pal.Red : PD.Pal.Green;
      printSafe("o", x0 + i * dx, y0, col);
    }
  }

  function drawModeHintNearButtons(view, computed) {
    var cfg = R.cfg;
    if (cfg.hudLineEnabled === false) return;
    var dbgEnabled = !!PD.config.debug.enabled;
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

    // Place left of the strip, aligned to its bottom.
    var x = minBtnX - 52;
    if (x < cfg.rowPadX) x = cfg.rowPadX;
    var y = maxBtnY - 7; // 6px font + 1
    var yPhase = y - 7;
    if (yPhase < 0) yPhase = 0;
    printSafe("Phase 07", x, yPhase, cfg.hudLineCol);
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

      var bgCol = PD.Pal.Black;
      if (kind === "ai") bgCol = cfg.colToastBgAi;
      rectSafe(x0, y0, boxW, boxH, bgCol);
      rectbSafe(x0, y0, boxW, boxH, cfg.colCenterPanelBorder);

      var textX = x0 + padX + iconW;
      if (isError) {
        printSafe("X", x0 + 4, y0 + padY, PD.Pal.Red);
      }
      for (i = 0; i < parts.length; i++) {
        // Fixed-width makes centering math exact (avoids proportional font whitespace).
        printExSafe(parts[i], textX, y0 + padY + i * lineH, cfg.colText, true, 1, false);
      }

      yCursor += boxH + 2;
      if (yCursor > cfg.screenH - 8) break;
    }
  }

  function drawTopLeftStatus(debug, selectedItem) {
    var cfg = R.cfg;
    if (!debug || !debug.state) return;

    var s = debug.state;
    var x0 = (cfg.topStatusX != null) ? cfg.topStatusX : 0;
    var y0 = (cfg.topStatusY != null) ? cfg.topStatusY : 0;
    var step = (cfg.topStatusLineStep != null) ? cfg.topStatusLineStep : 7;
    if (cfg.topStatusEnabled === false) return;

    var lines = [];
    lines.push("Phase 03 Render");
    lines.push("Scenario:" + String(debug.scenarios[debug.scenarioI]));
    lines.push("Active:P" + s.activeP + " Plays:" + s.playsLeft);

    if (selectedItem && selectedItem.row === R.ROW_CENTER) {
      var k = selectedItem.kind;
      if (k === "deck") {
        lines.push("Sel:Deck");
        lines.push("Cards:" + s.deck.length);
      } else if (k === "discard") {
        lines.push("Sel:Disc");
        lines.push("Cards:" + s.discard.length);
      } else if (k === "bank0") {
        lines.push("Sel:B0");
        lines.push("Total:" + PD.util.bankValueTotal(s, 0));
      } else if (k === "bank1") {
        lines.push("Sel:B1");
        lines.push("Total:" + PD.util.bankValueTotal(s, 1));
      } else {
        lines.push("Sel:" + String(k || "?"));
        lines.push("");
      }
    } else if (selectedItem && selectedItem.uid) {
      var uid = selectedItem.uid;
      var def = PD.state.defByUid(s, uid);
      var defId = def ? def.id : "?";
      lines.push("Sel:" + defId + " uid:" + uid);

      var detail = "";
      if (def && def.kind === PD.CardKind.Property) {
        if (PD.rules.isWildDef(def)) {
          detail = "Wild:" + def.wildColors[0] + "/" + def.wildColors[1];
          if (selectedItem && selectedItem.color != null && selectedItem.color !== PD.state.NO_COLOR) {
            detail += " As:c" + selectedItem.color;
          }
        }
        else detail = "Prop:c" + def.propertyColor;
      } else if (def && def.bankValue != null) {
        detail = "Value:" + def.bankValue;
      } else {
        detail = "(no detail)";
      }
      lines.push(detail);
    } else {
      lines.push("Sel:(none)");
      lines.push("");
    }

    var i;
    for (i = 0; i < 5; i++) {
      printSafe(lines[i] || "", x0, y0 + i * step, cfg.colText);
    }
  }

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
    var flipCards = isOpponentRow(row);
    var i;

    var overlayItems = rowModel && rowModel.overlayItems ? rowModel.overlayItems : null;
    var itemsForStacks = rowModel.items;
    if (overlayItems && overlayItems.length) itemsForStacks = itemsForStacks.concat(overlayItems);

    if (row === R.ROW_OP_TABLE || row === R.ROW_P_TABLE) {
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
        drawFannedStack(cards, { state: state, fanDir: fanDir, flip180: !!flipCards, camX: cam, selectedItem: selected, drawSelected: false, highlightCol: highlightCol });
      }

      // Selected last + highlight.
      if (selected) {
        var sFan = (selected.fanDir != null) ? selected.fanDir : (flipCards ? -1 : 1);
        var sk = String(selected.stackKey);
        var stack = byKey[sk] || [selected];
        drawFannedStack(stack, { state: state, fanDir: sFan, flip180: !!flipCards, camX: cam, selectedItem: selected, onlySelected: true, highlightCol: highlightCol });
      }
      return;
    }

    // Hand rows (and opponent back row): simple x-order is fine for non-stack items.
    var groupedH = groupStacksByKey(itemsForStacks, cam);
    var byKeyH = groupedH.byKey;
    var keysH = groupedH.keys;

    // Hide the source card when UI wants to represent its slot as a ghost/preview.
    var hideSrc = (computed && computed.meta && computed.meta.hideSrc) ? computed.meta.hideSrc : null;

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
      var computed = PD.ui.computeRowModels(debug.state, debug.view);
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
      var def = PD.state.defByUid(debug.state, uid);
      var defId = def ? def.id : "?";
      var line2 = (def && def.name) ? def.name : "";

      if (def && def.kind === PD.CardKind.Property) {
        if (PD.rules.isWildDef(def)) {
          var c0 = def.wildColors[0];
          var c1 = def.wildColors[1];
          line2 = "Wild:" + PD.fmt.colorName(c0) + "/" + PD.fmt.colorName(c1);
          if (it.color != null && it.color !== PD.state.NO_COLOR) {
            line2 += " As:" + PD.fmt.colorName(it.color);
          }
        } else {
          line2 = "Prop:" + PD.fmt.colorName(def.propertyColor);
        }
      }

      return ["Sel:" + defId + " uid:" + uid, line2];
    }

    return ["Sel:" + String(it.kind || "?"), ""];
  };

  // Phase 05c: shuffle + deal animations (render-only visuals).
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
    }
  }

  R.drawFrame = function (args) {
    if (!args) return;
    var state = args.state || (args.debug && args.debug.state) || args.state;
    var view = args.view || (args.debug && args.debug.view) || args.view;
    if (!state || !view) return;

    var computed = args.computed;
    if (!computed) computed = PD.ui.computeRowModels(state, view);
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

    // Phase 05c: animations on top of scene (but under toasts).
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
// PD.ui: controller UX view-state machine + model computation (drives commands; does not author rules).
PD.ui.newView = function () {
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
      wildColor: PD.state.NO_COLOR,
      // list of concrete engine commands (subset of PD.engine.legalMoves)
      cmds: [],
      cmdI: 0
    },

    // Inspect (hold X with delay)
    inspectActive: false,

    // Toasts (Phase 05b+): stacked notifications at screen top.
    // Each toast: { id?, kind?, text, frames?, persistent? }
    toasts: [],

    // Animations (Phase 05c+): shuffle + staged dealing. Purely view-owned.
    anim: {
      q: [],
      active: null,
      lock: false,
      // hiddenByP[p][uid] = true means uid is in-hand but not yet revealed.
      hiddenByP: [{}, {}]
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
      lastWinnerP: PD.state.NO_WINNER,
      lastPromptKind: "",
      lastPromptForP0: false,
      lastCenterBtnPressedId: "",
      lastFocusRuleId: "",
      pendingFocusErrorCode: "",
      autoFocusPausedByDebug: false,
      selAnchor: null
    }
  };
};

PD.ui.toastPush = function (view, toast) {
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

PD.ui.toastsTick = function (view) {
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

PD.ui.syncPromptToast = function (state, view) {
  // Game over: hide prompt toast so Winner toast can take over.
  if (state && state.winnerP !== PD.state.NO_WINNER) {
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
    var over = state.players[0].hand.length - PD.state.HAND_MAX;
    txt = "Too many cards. Discard " + over;
  } else if (pr.kind === "payDebt") {
    txt = "Pay debt: $" + pr.rem + " left";
  } else if (pr.kind === "placeReceived") {
    txt = "Place received properties: " + pr.uids.length;
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

PD.ui.syncWinnerToast = function (state, view) {
  if (!state || !view) return;
  var has = (state.winnerP !== PD.state.NO_WINNER);
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

PD.ui.clampI = function (i, n) {
  if (n <= 0) return 0;
  if (i < 0) return 0;
  if (i >= n) return n - 1;
  return i;
};

PD.ui.wrapI = function (i, n) {
  if (n <= 0) return 0;
  i = i % n;
  if (i < 0) i = i + n;
  return i;
};

PD.ui.cmdsWithoutSource = function (cmds) {
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

// Pick the first item matching a predicate from the given row order.
// Returns { row, i, item } or null.
PD.ui.findBestCursorTarget = function (models, rowOrder, predicate) {
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

PD.ui.cursorMoveTo = function (view, pick) {
  if (!view || !view.cursor || !pick) return;
  view.cursor.row = pick.row;
  view.cursor.i = pick.i;
};

PD.ui.nearestByX = function (items, xCenter) {
  if (!items || items.length === 0) return 0;
  var bestI = 0;
  var bestD = 999999;
  var i;
  for (i = 0; i < items.length; i++) {
    var it = items[i];
    var cx = it.x + (it.w / 2);
    var d = cx - xCenter;
    if (d < 0) d = -d;
    if (d < bestD) { bestD = d; bestI = i; }
  }
  return bestI;
};

// Directional navigation (Phase 04 polish): pick closest selectable in a direction,
// based on screen-space geometry (includes row camera offsets).

PD.ui.itemScreenCenter = function (view, item) {
  if (!item) return { cx: 0, cy: 0 };
  var row = item.row;
  var cam = view.camX[row];
  var x = item.x - cam;
  var y = item.y;
  var w = item.w;
  var h = item.h;
  return { cx: x + (w / 2), cy: y + (h / 2) };
};

PD.ui.navPickInDirection = function (view, computed, dir) {
  if (!view || !computed || !computed.models) return null;
  if (!computed.selected) return null;

  dir = String(dir || "");
  var cur = computed.selected;
  var curC = PD.ui.itemScreenCenter(view, cur);
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
      var c = PD.ui.itemScreenCenter(view, it);
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
    var uiCfg = PD.config.ui;
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

PD.ui.layoutHint = function (state, view) {
  // Reservation hint: which stacks need an extra slot so ghosts/previews don't overlap.
  // Keep the policy here so buildRowItems + computeRowModels stay consistent.
  var hint = { bankReserve: false, needsExtraSlotBySetI: null, menuHoverCmd: null };
  if (!state || !view) return hint;

  // Targeting mode: reserve for all legal destinations.
  if (view.mode === "targeting" && view.targeting && view.targeting.active && view.targeting.cmds) {
    var needs = {};
    var cmds = view.targeting.cmds;
    var i;
    for (i = 0; i < cmds.length; i++) {
      var c = cmds[i];
      var d = PD.moves.destForCmd(c);
      if (!d) continue;
      if (d.kind === "bankEnd") hint.bankReserve = true;
      if (d.kind === "setEnd") needs[d.setI] = true;
    }
    hint.needsExtraSlotBySetI = needs;
    return hint;
  }

  // Menu-hover preview: reserve only when unambiguous (exactly 1 legal cmd).
  if (view.mode === "menu" && view.menu && view.menu.items && view.menu.items.length > 0 && view.menu.src && view.menu.src.uid) {
    var nMenuItems = view.menu.items.length;
    var mi = PD.ui.clampI(view.menu.i, nMenuItems);
    view.menu.i = mi;
    var it = view.menu.items[mi];
    var src = view.menu.src;
    if (!it || !src || !src.uid) return hint;

    var uid = src.uid;
    var def = PD.state.defByUid(state, uid);
    var cmdsM = [];
    var isRent = (it.id === "rent");

    if (it.id === "bank") {
      cmdsM = PD.moves.bankCmdsForUid(state, uid);
    } else if (it.id === "place") {
      if (def && def.kind === PD.CardKind.Property) {
        var wildColorM = (def && PD.rules.isWildDef(def)) ? PD.moves.defaultWildColorForPlace(state, uid, def) : PD.state.NO_COLOR;
        cmdsM = PD.moves.placeCmdsForUid(state, uid, def, wildColorM);
      }
    } else if (it.id === "build") {
      if (def && def.kind === PD.CardKind.House) {
        cmdsM = PD.moves.buildCmdsForUid(state, uid);
      }
    } else if (isRent) {
      if (def && def.kind === PD.CardKind.Action && def.actionKind === PD.ActionKind.Rent) {
        cmdsM = PD.moves.rentMovesForUid(state, uid);
        PD.moves.sortRentMovesByAmount(state, (src && src.loc) ? src.loc.p : 0, cmdsM);
      }
    }

    // Only preview when unambiguous (exactly 1 legal cmd). Multi-target actions show "..." and should not
    // imply a default destination highlight while browsing the menu.
    if (cmdsM.length === 1) {
      hint.menuHoverCmd = cmdsM[0];
      var d2 = PD.moves.destForCmd(hint.menuHoverCmd);
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

PD.ui.buildRowItems = function (state, view, row, hint) {
  var L = PD.config.render.layout;

  var out = { items: [], minX: 0, maxX: 0 };
  var isOp = PD.layout.isOpponentRow(row);
  var p = PD.layout.playerForRow(row);
  var yFace = PD.layout.faceYForRow(row);
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
        fanDir: 0,
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
    var isRecvPrompt = !!(!isOp && row === 4 && pr && pr.kind === "placeReceived" && pr.p === 0 && p === 0);
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
    var C = PD.config.render.layout;
    var top = C.rowY[2] + C.centerTopInsetY;
    var deckX = C.centerDeckX;
    var gapX = C.centerPileGapX;
    var x0 = deckX;
    out.items.push({ kind: "deck", row: 2, x: x0, y: top, w: C.faceW, h: C.faceH });
    out.items.push({ kind: "discard", row: 2, x: x0 + C.faceW + gapX, y: top, w: C.faceW, h: C.faceH });

    var dbgEnabled = !!PD.config.debug.enabled;

    // Hide buttons while an overlay is active (menu/targeting).
    // Inspect should keep buttons visible/selectable so they can be inspected too.
    var overlayActive = !!(view && (view.mode === "menu" || view.mode === "targeting"));
    if (!overlayActive) {
      // Right-side vertical strip: 4*10px = 40px tall, fits inside center row.
      var stripW = C.centerBtnStripW;
      var stripH = 10;
      var stripX = C.screenW - C.centerBtnStripPadRight - stripW;
      // Bottom-align within the center row band.
      var stripY0 = (C.rowY[2] + C.rowH[2] - 43);

      function pushBtn(id, label, y, disabled) {
        out.items.push({ kind: "btn", id: id, label: label, disabled: !!disabled, row: 2, x: stripX, y: y, w: stripW, h: stripH });
      }

      // End is always available on your turn; if hand > HAND_MAX the engine enters a discard-down prompt.
      var endDisabled = (state.winnerP !== PD.state.NO_WINNER) || (state.activeP !== 0);
      pushBtn("endTurn", "End", stripY0, endDisabled);
      if (dbgEnabled) {
        // Game over: Step would attempt to mutate state via debugStep and can throw.
        // Keep Reset/Next available for recovery.
        pushBtn("step", "Step", stripY0 + 11, (state.winnerP !== PD.state.NO_WINNER));
        pushBtn("reset", "Reset", stripY0 + 22, false);
        pushBtn("nextScenario", "Next", stripY0 + 33, false);
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

PD.ui.computeRowModels = function (state, view) {
  var hint = PD.ui.layoutHint(state, view);
  var models = [
    PD.ui.buildRowItems(state, view, 0, hint),
    PD.ui.buildRowItems(state, view, 1, hint),
    PD.ui.buildRowItems(state, view, 2, hint),
    PD.ui.buildRowItems(state, view, 3, hint),
    PD.ui.buildRowItems(state, view, 4, hint)
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
  view.cursor.i = PD.ui.clampI(view.cursor.i, n);

  var sel = (rm && rm.items && rm.items.length) ? rm.items[view.cursor.i] : null;

  // Note: cursor relocation off empty selections is handled by PD.ui.focus.preserve().

  var L = PD.config.render.layout;
  var yTable = PD.layout.faceYForRow(3);

  function pushOverlay(row0, it0) {
    if (row0 == null) return;
    var rm0 = models[row0];
    if (!rm0 || !rm0.overlayItems) return;
    rm0.overlayItems.push(it0);
  }

  function stackX(st, depth) {
    if (!st) return 0;
    return st.x0 + depth * st.stride * st.fanDir;
  }

  function tableStack(setI) {
    var rmTable = models[PD.render.ROW_P_TABLE];
    var stacks = (rmTable && rmTable.stacks) ? rmTable.stacks : null;
    return stacks ? stacks["set:p0:set" + setI] : null;
  }

  function slotNewSet() {
    var rmTable = models[PD.render.ROW_P_TABLE];
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
    var rmHand = models[PD.render.ROW_P_HAND];
    var bankSt = (rmHand && rmHand.stacks) ? rmHand.stacks["bank:p0:row4"] : null;
    if (!bankSt) return null;
    return { row: 4, x: stackX(bankSt, bankSt.nReal), y: bankSt.y, stackKey: "bank:p0:row4", depth: bankSt.nReal };
  }

  function slotForCmd(cmd, srcSlot) {
    var d = PD.moves.destForCmd(cmd);
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

  function setFocus(slot, uid, color, forCmdKind) {
    if (!slot) return;
    meta.focus = {
      kind: "preview",
      row: slot.row,
      forCmdKind: forCmdKind,
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

  function setFocusForCmd(cmd, srcSlot, card) {
    if (!cmd || !cmd.kind) return;
    var k = String(cmd.kind);
    var uid = (card && card.uid) ? card.uid : 0;
    var def = (card && card.def) ? card.def : null;
    var wildColor = (card && card.wildColor != null) ? card.wildColor : null;

    if (k === "playProp") {
      var slotP = slotForCmd(cmd, srcSlot);
      if (!slotP) return;
      var colP = null;
      if (def && PD.rules.isWildDef(def)) colP = (cmd.color != null) ? cmd.color : wildColor;
      setFocus(slotP, uid, colP, "playProp");
      return;
    }

    if (k === "playHouse") {
      var slotH = slotForCmd(cmd, srcSlot);
      if (!slotH) return;
      setFocus(slotH, uid, null, "playHouse");
      return;
    }

    if (k === "playRent") {
      var slotR = slotForCmd(cmd, srcSlot);
      if (!slotR) return;
      var sets = state.players[0].sets;
      var setR = sets[cmd.setI];
      var stRR = tableStack(cmd.setI);
      if (!setR || !stRR || stRR.nReal <= 0) return;
      var topUid = setR.houseUid ? setR.houseUid : ((setR.props && setR.props.length) ? setR.props[setR.props.length - 1][0] : 0);
      var topColor = null;
      if (!setR.houseUid && setR.props && setR.props.length) topColor = setR.props[setR.props.length - 1][1];
      setFocus(slotR, topUid, topColor, "rent");
      return;
    }

    if (k === "bank") {
      var slotB = slotForCmd(cmd, srcSlot);
      if (!slotB) return;
      setFocus(slotB, uid, null, "bank");
      return;
    }

    if (k === "source") {
      if (!srcSlot) return;
      var colS = null;
      if (def && PD.rules.isWildDef(def)) colS = wildColor;
      setFocus(srcSlot, uid, colS, "source");
      return;
    }
  }

  // Targeting overlays: ghosts + preview-in-stack for the selected destination.
  if (view.mode === "targeting" && view.targeting && view.targeting.active) {
    var t = view.targeting;
    var cmds = t.cmds;
    var cmdI = PD.ui.clampI(t.cmdI, cmds.length);
    t.cmdI = cmdI;

    // Find source slot in models (for hold-targeting Source destination).
    var srcX = null, srcY = null, srcRow = null;
    if (t.card && t.card.loc && (t.card.loc.zone === "hand" || t.card.loc.zone === "recvProps")) {
      var srcLoc = t.card.loc;
      var rowHand = PD.render.ROW_P_HAND;
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
    }

    // While targeting, hide the source card so the source slot can be represented by a ghost/preview.
    if (t.card && t.card.uid && t.card.loc && (t.card.loc.zone === "hand" || t.card.loc.zone === "recvProps")) {
      meta.hideSrc = { uid: t.card.uid, loc: t.card.loc };
    }

    var srcSlot = (srcX != null && srcY != null && srcRow != null)
      ? { row: srcRow, x: srcX, y: srcY, stackKey: "overlay:src:row" + srcRow, depth: 0 }
      : null;

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

    // Preview-in-stack for selected destination.
    var cmdSel = cmds[cmdI];
    setFocusForCmd(cmdSel, srcSlot, { uid: (t.card && t.card.uid) ? t.card.uid : 0, def: (t.card && t.card.def) ? t.card.def : null, wildColor: t.wildColor });

    // If the selected destination previews the same uid elsewhere, ensure the source slot is still readable.
    // (This keeps menu-targeting and recvProps placement consistent with hold-targeting: source becomes a ghost.)
    if (
      t.card &&
      t.card.uid &&
      srcX != null &&
      srcY != null &&
      srcRow != null &&
      meta.focus &&
      (meta.focus.uid === t.card.uid || meta.focus.forCmdKind === "rent") &&
      !hasSourceCmd
    ) {
      pushOverlay(srcRow, { kind: "ghost", x: srcX, y: srcY, stackKey: "overlay:src:row" + srcRow, depth: 0 });
    }
  }

  // Menu-hover destination preview (only when unambiguous).
  if (!meta.focus && view.mode === "menu" && view.menu && view.menu.items && view.menu.items.length > 0 && view.menu.src) {
    var srcM = view.menu.src;
    var uidM = (srcM && srcM.uid) ? srcM.uid : 0;
    var cm = (hint && hint.menuHoverCmd) ? hint.menuHoverCmd : null;
    if (uidM && cm) {
      var defM = PD.state.defByUid(state, uidM);
      setFocusForCmd(cm, null, { uid: uidM, def: defM, wildColor: (defM && PD.rules.isWildDef(defM)) ? cm.color : null });
    }

    // When menu hover produces a preview of the same uid (or Rent preview where the preview card differs),
    // ghost the source slot so it doesn't look duplicated.
    if (meta.focus && uidM && srcM && srcM.loc && (meta.focus.uid === uidM || meta.focus.forCmdKind === "rent")) {
      if (srcM.uid && srcM.loc && (srcM.loc.zone === "hand" || srcM.loc.zone === "recvProps")) {
        meta.hideSrc = { uid: srcM.uid, loc: srcM.loc };
      }
      var rowHandM = PD.render.ROW_P_HAND;
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

  var computed = { models: models, selected: sel, meta: meta };
  computed = PD.anim.present(state, view, computed) || computed;
  return computed;
};

PD.ui.ensureCamForSelection = function (rowModel, row, selItem, camArr) {
  var L = PD.config.render.layout;
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

PD.ui.updateCameras = function (state, view, computed) {
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
        var i = PD.ui.clampI(view.cursor.i, rm.items.length);
        selItem = rm.items[i];
      }
    } else {
      // For non-active rows, use first item to keep cam stable.
      var rm2 = models[row];
      if (rm2 && rm2.items && rm2.items.length) selItem = rm2.items[0];
    }

    // In overlay modes, have the preview destination row camera follow the preview.
    if ((view.mode === "targeting" || view.mode === "menu") && computed.meta && computed.meta.focus && row === computed.meta.focus.row) selItem = computed.meta.focus;

    PD.ui.ensureCamForSelection(models[row], row, selItem, view.camX);
  }
};

PD.ui.menuOpenForSelection = function (state, view, sel) {
  if (!view || !view.menu) return;
  if (state && state.winnerP !== PD.state.NO_WINNER) return;
  view.menu.items = [];
  view.menu.i = 0;
  view.menu.src = sel ? { row: sel.row, i: view.cursor.i, uid: sel.uid, loc: sel.loc || null } : null;

  if (!sel || !sel.loc) return;
  var zSel = String(sel.loc.zone || "");
  if (!(zSel === "hand" || zSel === "recvProps")) return;
  if (sel.loc.p !== 0) return;

  var uid = sel.uid;
  var def = PD.state.defByUid(state, uid);
  if (!def) return;

  // Build/Place actions are only meaningful for the currently implemented rules.
  if (def.kind === PD.CardKind.Property) {
    var wildColor = (def && PD.rules.isWildDef(def)) ? PD.moves.defaultWildColorForPlace(state, uid, def) : PD.state.NO_COLOR;
    var placeCmds = PD.moves.placeCmdsForUid(state, uid, def, wildColor);
    view.menu.items.push({ id: "place", label: PD.fmt.menuLabelForCmds("Place", state, placeCmds) });
  }
  if (def.kind === PD.CardKind.House) {
    var buildMoves = PD.moves.buildCmdsForUid(state, uid);
    if (buildMoves.length > 0) {
      view.menu.items.push({ id: "build", label: PD.fmt.menuLabelForCmds("Build", state, buildMoves) });
    }
  }
  if (def.kind === PD.CardKind.Action && def.actionKind === PD.ActionKind.Rent) {
    // Offer Rent only if there is at least one legal rent target.
    var rentMoves = PD.moves.rentMovesForUid(state, uid);
    if (rentMoves.length > 0) {
      view.menu.items.push({ id: "rent", label: PD.fmt.menuLabelForRentMoves(state, rentMoves) });
    }
  }
  if (PD.rules.isBankableDef(def)) {
    view.menu.items.push({ id: "bank", label: "Bank" });
  }

  // Explicit cancel option so A-confirm can cancel too (in addition to B).
  view.menu.items.push({ id: "source", label: "Cancel" });

  // Always allow cancel/back with B; no explicit menu item needed.
};

PD.ui.targetingEnter = function (state, view, kind, hold, uid, loc) {
  if (!view || !view.targeting) return;
  var t = view.targeting;
  t.active = true;
  t.kind = String(kind || "");
  t.hold = !!hold;
  t.cmds = [];
  t.cmdI = 0;

  var def = PD.state.defByUid(state, uid);
  t.card = { uid: uid, loc: loc || null, def: def || null };

  var r = PD.moves.cmdsForTargeting(state, t.kind, uid, t.card ? t.card.loc : null);
  if (!r) {
    t.active = false;
    view.mode = "browse";
    return;
  }

  t.cmds = r.cmds;
  t.wildColor = (r.wildColor != null) ? r.wildColor : PD.state.NO_COLOR;
  t.cmdI = 0; // default always-existing if any

  // Unknown targeting kind.
  if (!t.cmds || t.cmds.length === 0) {
    t.active = false;
    view.mode = "browse";
    return;
  }

  view.mode = "targeting";
};

PD.ui.targetingRetargetWild = function (state, view, dir) {
  if (!view || !view.targeting || !view.targeting.active) return;
  var t = view.targeting;
  if (t.kind !== "place") return;
  if (!t.card || !t.card.def || !PD.rules.isWildDef(t.card.def)) return;

  var def = t.card.def;
  var c0 = def.wildColors[0];
  var c1 = def.wildColors[1];
  var prevColor = t.wildColor;
  var nextColor = (prevColor === c0) ? c1 : c0;
  if (dir < 0) nextColor = (prevColor === c1) ? c0 : c1;

  var prevCmd = (t.cmds && t.cmds.length) ? t.cmds[PD.ui.clampI(t.cmdI, t.cmds.length)] : null;
  var keepNewSet = !!(prevCmd && prevCmd.dest && prevCmd.dest.newSet);
  var keepSetI = (prevCmd && prevCmd.dest && prevCmd.dest.setI != null) ? prevCmd.dest.setI : null;
  var keepSource = !!(prevCmd && prevCmd.kind === "source");

  var uid = t.card.uid;
  var cmds = PD.moves.placeCmdsForUid(state, uid, def, nextColor);
  if (PD.moves.locAllowsSource(t.card ? t.card.loc : null)) cmds.push({ kind: "source" });

  t.wildColor = nextColor;
  t.cmds = cmds;

  // Preserve selection if possible.
  var selI = 0;
  var i;
  if (keepNewSet) {
    for (i = 0; i < cmds.length; i++) if (cmds[i] && cmds[i].dest && cmds[i].dest.newSet) { selI = i; break; }
  } else if (keepSetI != null) {
    for (i = 0; i < cmds.length; i++) if (cmds[i] && cmds[i].dest && cmds[i].dest.setI === keepSetI) { selI = i; break; }
  } else if (keepSource) {
    for (i = 0; i < cmds.length; i++) if (cmds[i] && cmds[i].kind === "source") { selI = i; break; }
  }
  t.cmdI = selI;
};

PD.ui.step = function (state, view, actions) {
  if (!state || !view) return null;

  // Tick feedback timers.
  PD.anim.feedbackTick(view);
  PD.ui.toastsTick(view);
  PD.ui.syncPromptToast(state, view);
  PD.ui.syncWinnerToast(state, view);
  PD.anim.tick(state, view);

  var gameOver = (state.winnerP !== PD.state.NO_WINNER);
  var prevWinner = (view.ux && view.ux.lastWinnerP != null) ? view.ux.lastWinnerP : PD.state.NO_WINNER;
  var justEnded = (gameOver && prevWinner === PD.state.NO_WINNER);

  // Game over: close overlays and allow free navigation/inspect.
  if (gameOver) {
    if (view.mode === "menu") { view.menu.items = []; }
    if (view.targeting) view.targeting.active = false;
    view.mode = "browse";
  }

  // Prompt mode sync (Phase 05b+): prompts are rules-owned, UI adopts a dedicated mode.
  var pr = state.prompt;
  var hasPrompt = !!pr;
  var promptForP0 = !!(hasPrompt && pr.p === 0);
  if (!gameOver && promptForP0) {
    var k = pr && pr.kind ? String(pr.kind) : "";
    // Phase 06: allow overlays during recipient placement prompt.
    var allowOverlays = (k === "placeReceived");
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
  var computed = PD.ui.computeRowModels(state, view);
  PD.ui.updateCameras(state, view, computed);

  // While animating (shuffle/deal), lock input and just keep the view stable.
  if (view.anim && view.anim.lock) {
    computed = PD.ui.computeRowModels(state, view);
    PD.ui.updateCameras(state, view, computed);
    return null;
  }

  // Focus policy (selection preservation + centralized autofocus rules).
  // (Defined in a later-concatenated module; safe to call at runtime.)
  var allowFocus = (view.mode === "browse" || view.mode === "prompt");
  var isHardLockedPrompt = !!(promptForP0 && pr && pr.kind === "discardDown");
  if (allowFocus && !isHardLockedPrompt) {
    var didFocus = PD.ui.focus.apply(state, view, computed, actions);
    if (didFocus) {
      computed = PD.ui.computeRowModels(state, view);
      PD.ui.updateCameras(state, view, computed);
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
    PD.anim.feedbackError(view, "game_over", "");
    return null;
  }

  function focusSnapshot() {
    PD.ui.focus.snapshot(state, view, computed);
  }

  function setAutoFocusPauseForCenterBtn(id) {
    view.ux.lastCenterBtnPressedId = id;
    if (id === "step" || id === "nextScenario" || id === "reset") {
      view.ux.autoFocusPausedByDebug = true;
    }
  }

  function currentSelection() {
    var row = view.cursor.row;
    var rm = computed.models[row];
    if (!rm || !rm.items || rm.items.length === 0) return null;
    var i = PD.ui.clampI(view.cursor.i, rm.items.length);
    return rm.items[i];
  }

  function promptPickHandItemIndices() {
    var out = [];
    if (!computed || !computed.models) return out;
    var rowHand = PD.render.ROW_P_HAND;
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
    var rowHand = PD.render.ROW_P_HAND;
    view.cursor.row = rowHand;
    if (!handItemIs || handItemIs.length === 0) { view.cursor.i = 0; return; }
    // If current cursor isn't on a hand card, snap to the first hand card.
    var rm = computed.models[rowHand];
    var cur = rm && rm.items ? rm.items[PD.ui.clampI(view.cursor.i, rm.items.length)] : null;
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
    nextK = PD.ui.wrapI(nextK, handItemIs.length);
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
      if (actions.nav && actions.nav.up) view.menu.i = PD.ui.wrapI(view.menu.i - 1, nItems);
      if (actions.nav && actions.nav.down) view.menu.i = PD.ui.wrapI(view.menu.i + 1, nItems);
    }

    if (actions.a && actions.a.tap) {
      if (!view.menu.items || view.menu.items.length === 0) {
        view.mode = "browse";
        return null;
      }
      var mi = PD.ui.clampI(view.menu.i, view.menu.items.length);
      var it = view.menu.items[mi];
      var src = view.menu.src;
      view.mode = "browse";
      view.menu.items = [];

      if (!it || !src) return null;
      if (it.id === "source") return null;
      if (!src.loc || src.loc.p !== 0) return null;
      var uid = src.uid;
      var srcZone = String(src.loc.zone || "");

      if (it.id === "bank") {
        if (srcZone !== "hand") return null;
        var cmd = { kind: "bank", card: { uid: uid, loc: src.loc } };
        focusSnapshot();
        return { kind: "applyCmd", cmd: cmd };
      }

      if (it.id === "rent") {
        if (srcZone !== "hand") return null;
        // If unambiguous, auto-apply. Otherwise enter targeting.
        var rentMoves = PD.moves.rentMovesForUid(state, uid);
        if (rentMoves.length === 1) {
          focusSnapshot();
          return { kind: "applyCmd", cmd: rentMoves[0] };
        }
        PD.ui.targetingEnter(state, view, "rent", false, uid, src.loc);
        return null;
      }

      if (it.id === "place") {
        if (!(srcZone === "hand" || srcZone === "recvProps")) return null;
        PD.ui.targetingEnter(state, view, "place", false, uid, src.loc);
        if (view.targeting && view.targeting.active && view.targeting.cmds) {
          var real = PD.ui.cmdsWithoutSource(view.targeting.cmds);
          if (real.length === 1) {
            var only = real[0];
            view.targeting.active = false;
            view.mode = "browse";
            if (only && only.kind) { focusSnapshot(); return { kind: "applyCmd", cmd: only }; }
          }
        }
        return null;
      }

      if (it.id === "build") {
        if (srcZone !== "hand") return null;
        PD.ui.targetingEnter(state, view, "build", false, uid, src.loc);
        if (view.targeting && view.targeting.active && view.targeting.cmds) {
          var realB = PD.ui.cmdsWithoutSource(view.targeting.cmds);
          if (realB.length === 1) {
            var onlyB = realB[0];
            view.targeting.active = false;
            view.mode = "browse";
            if (onlyB && onlyB.kind) { focusSnapshot(); return { kind: "applyCmd", cmd: onlyB }; }
          }
        }
        return null;
      }
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

    // Cycle destinations
    var nCmds = t.cmds ? t.cmds.length : 0;
    if (nCmds > 0) {
      if (actions.nav && actions.nav.left) t.cmdI = PD.ui.wrapI(t.cmdI - 1, nCmds);
      if (actions.nav && actions.nav.right) t.cmdI = PD.ui.wrapI(t.cmdI + 1, nCmds);
    }

    // Wild color toggle (Up/Down)
    if (actions.nav && (actions.nav.up || actions.nav.down)) {
      var dir = actions.nav.down ? 1 : -1;
      PD.ui.targetingRetargetWild(state, view, dir);
    }

    // Confirm: tap-A (menu targeting) OR release-A (hold targeting).
    var shouldConfirm = false;
    if (!t.hold && actions.a && actions.a.tap) shouldConfirm = true;
    if (t.hold && actions.a && actions.a.released) shouldConfirm = true;
    if (!shouldConfirm) {
      // Update cameras to follow destination preview.
      computed = PD.ui.computeRowModels(state, view);
      PD.ui.updateCameras(state, view, computed);
      return null;
    }

    if (!t.cmds || t.cmds.length === 0) {
      PD.anim.feedbackError(view, "no_targets", "No valid destination");
      t.active = false;
      view.mode = "browse";
      return null;
    }

    var cmdI = PD.ui.clampI(t.cmdI, t.cmds.length);
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

  // Prompt mode (Phase 05b+): rules-owned prompts.
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
      var pick = PD.ui.navPickInDirection(view, computed, dir);
      if (pick) {
        view.cursor.row = pick.row;
        view.cursor.i = pick.i;
      }
    }

    function snapCursorToFirstRecv() {
      var pick = PD.ui.findBestCursorTarget(computed.models, [PD.render.ROW_P_HAND], function (it) {
        return it && it.kind === "hand" && it.loc && it.loc.zone === "recvProps" && it.loc.p === 0;
      });
      if (pick) PD.ui.cursorMoveTo(view, pick);
    }

    if (prompt.kind === "discardDown") {
      // Lock cursor to player hand cards only (not bank).
      var handIs = promptPickHandItemIndices();
      promptSnapCursorToHand(handIs);

      // Recompute after snapping cursor.
      computed = PD.ui.computeRowModels(state, view);
      PD.ui.updateCameras(state, view, computed);

      // Left/Right cycle within hand.
      if (actions.nav && actions.nav.left) promptCycleHand(handIs, -1);
      if (actions.nav && actions.nav.right) promptCycleHand(handIs, 1);

      // Cancel: only before any discard has happened in this prompt instance.
      if (actions.b && actions.b.pressed) {
        if (prompt.nDiscarded <= 0) {
          focusSnapshot();
          return { kind: "applyCmd", cmd: { kind: "cancelPrompt" } };
        }
        PD.anim.feedbackError(view, "prompt_forced", "Must discard");
        return null;
      }

      // Discard with A tap.
      if (actions.a && actions.a.tap) {
        computed = PD.ui.computeRowModels(state, view);
        PD.ui.updateCameras(state, view, computed);
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
      if (!selGrabP || !selGrabP.loc) { PD.anim.feedbackError(view, "no_actions", "No actions"); snapCursorToFirstRecv(); return null; }
      if (selGrabP.loc.zone !== "recvProps") {
        PD.anim.feedbackError(view, "place_recv_only", "Select a received property");
        snapCursorToFirstRecv();
        return null;
      }
      PD.ui.targetingEnter(state, view, "place", true, selGrabP.uid, selGrabP.loc);
      return null;
    }

    // For Phase 06 prompts, allow normal directional navigation (screen-space).
    applyPromptNav();
    computed = PD.ui.computeRowModels(state, view);
    PD.ui.updateCameras(state, view, computed);
    // Refresh selection anchor during prompt ticks so selection preservation doesn't fight user navigation.
    PD.ui.focus.snapshot(state, view, computed);

    if (prompt.kind === "payDebt") {
      if (actions.b && actions.b.pressed) {
        PD.anim.feedbackError(view, "prompt_forced", "Must pay");
        return null;
      }

      if (actions.a && actions.a.tap) {
        var selD = currentSelection();
        // Allow debug buttons (Step/Reset/Next) during this prompt; End remains disallowed.
        if (selD && selD.kind === "btn") {
          if (selD.id === "step") { setAutoFocusPauseForCenterBtn("step"); focusSnapshot(); return { kind: "debug", action: "step" }; }
          if (selD.id === "reset") { setAutoFocusPauseForCenterBtn("reset"); focusSnapshot(); return { kind: "debug", action: "reset" }; }
          if (selD.id === "nextScenario") { setAutoFocusPauseForCenterBtn("nextScenario"); focusSnapshot(); return { kind: "debug", action: "nextScenario" }; }
          if (selD.id === "endTurn") { PD.anim.feedbackError(view, "prompt_forced", "Must pay"); return null; }
        }
        if (!selD || !selD.loc) { PD.anim.feedbackError(view, "no_actions", "No actions"); return null; }

        // House-pay-first redirect: selecting a property in a housed set snaps to the House.
        if (selD.loc.zone === "setProps" && selD.loc.setI != null) {
          var setI = selD.loc.setI;
          var set = state.players[0].sets[setI];
          if (set && set.houseUid) {
            var rmT = computed.models[PD.render.ROW_P_TABLE];
            if (rmT && rmT.items) {
              var ii;
              for (ii = 0; ii < rmT.items.length; ii++) {
                var itH = rmT.items[ii];
                if (!itH || itH.kind !== "setHouse" || !itH.loc) continue;
                if (itH.loc.p !== 0) continue;
                if (itH.loc.setI !== setI) continue;
                view.cursor.row = PD.render.ROW_P_TABLE;
                view.cursor.i = ii;
                PD.ui.toastPush(view, { id: "debt:houseFirst", kind: "info", text: "House must be paid first", frames: 45 });
                PD.anim.feedbackError(view, "house_pay_first", "");
                return null;
              }
            }
            PD.anim.feedbackError(view, "house_pay_first", "House must be paid first");
            return null;
          }
        }

        if (selD.loc.zone === "bank" || selD.loc.zone === "setProps" || selD.loc.zone === "setHouse") {
          focusSnapshot();
          return { kind: "applyCmd", cmd: { kind: "payDebt", card: { uid: selD.uid, loc: selD.loc } } };
        }

        PD.anim.feedbackError(view, "cant_pay", "Can't pay with that");
      }

      return null;
    }

    if (prompt.kind === "placeReceived") {
      if (actions.b && actions.b.pressed) {
        PD.anim.feedbackError(view, "prompt_forced", "Must place");
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
            PD.anim.feedbackError(view, "prompt_forced", "Must place");
            snapCursorToFirstRecv();
            return null;
          }
        }
        if (!selR || !selR.loc) { PD.anim.feedbackError(view, "no_actions", "No actions"); snapCursorToFirstRecv(); return null; }
        if (selR.loc.zone !== "recvProps") {
          PD.anim.feedbackError(view, "place_recv_only", "Select a received property");
          snapCursorToFirstRecv();
          return null;
        }
        // Tap-A workflow: go directly to placement targeting (only action in this prompt).
        PD.ui.targetingEnter(state, view, "place", false, selR.uid, selR.loc);
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
    PD.anim.feedbackError(view, "game_over", "");
    return null;
  }
  if (actions.a && actions.a.grabStart) {
    var selGrab = currentSelection();
    if (selGrab && selGrab.loc && selGrab.loc.zone === "hand" && selGrab.loc.p === 0) {
      var uidGrab = selGrab.uid;
      var defGrab = PD.state.defByUid(state, uidGrab);
      if (defGrab && defGrab.kind === PD.CardKind.Property) {
        PD.ui.targetingEnter(state, view, "place", true, uidGrab, selGrab.loc);
        return null;
      } else if (defGrab && (defGrab.kind === PD.CardKind.House || (defGrab.kind === PD.CardKind.Action && defGrab.actionKind === PD.ActionKind.Rent))) {
        PD.ui.targetingEnter(state, view, "quick", true, uidGrab, selGrab.loc);
        return null;
      } else if (defGrab && PD.rules.isBankableDef(defGrab)) {
        PD.ui.targetingEnter(state, view, "bank", true, uidGrab, selGrab.loc);
        return null;
      }
      PD.anim.feedbackError(view, "hold_noop", "Can't do that");
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
      var pick = PD.ui.navPickInDirection(view, computed, dir);
      if (pick) {
        view.cursor.row = pick.row;
        view.cursor.i = pick.i;
      }
    }
  }

  // Recompute after nav, then update cameras.
  computed = PD.ui.computeRowModels(state, view);
  PD.ui.updateCameras(state, view, computed);

  // Context actions on tap A.
  if (actions.a && actions.a.tap) {
    var sel = currentSelection();
    if (!sel) return null;

    // Game over: only allow Reset/Next debug buttons; everything else is a no-op with feedback blink.
    if (gameOver) {
      var allowBtn = !!(sel.row === 2 && sel.kind === "btn" && (sel.id === "reset" || sel.id === "nextScenario"));
      if (!allowBtn) {
        PD.anim.feedbackError(view, "game_over", "");
        return null;
      }
    }

    // Center buttons.
    if (sel.row === 2 && sel.kind === "btn") {
      if (sel.disabled) {
        var msg = "Not available";
        if (sel.id === "endTurn" && state.activeP !== 0) msg = "Opponent turn";
        PD.anim.feedbackError(view, "disabled_btn", msg);

        // Move selection to next available center button (prefer Step).
        var pickNext =
          PD.ui.findBestCursorTarget(computed.models, [2], function (it) {
            return it && it.kind === "btn" && it.id === "step" && !it.disabled;
          }) ||
          PD.ui.findBestCursorTarget(computed.models, [2], function (it) {
            return it && it.kind === "btn" && !it.disabled && it.id !== "endTurn";
          }) ||
          PD.ui.findBestCursorTarget(computed.models, [2], function (it) {
            return it && (it.kind === "discard" || it.kind === "deck");
          });

        if (pickNext) {
          PD.ui.cursorMoveTo(view, pickNext);
          computed = PD.ui.computeRowModels(state, view);
          PD.ui.updateCameras(state, view, computed);
        }

        return null;
      }

      if (sel.id === "endTurn") { setAutoFocusPauseForCenterBtn("endTurn"); focusSnapshot(); return { kind: "applyCmd", cmd: { kind: "endTurn" } }; }
      if (sel.id === "step") { setAutoFocusPauseForCenterBtn("step"); focusSnapshot(); return { kind: "debug", action: "step" }; }
      if (sel.id === "reset") { setAutoFocusPauseForCenterBtn("reset"); focusSnapshot(); return { kind: "debug", action: "reset" }; }
      if (sel.id === "nextScenario") { setAutoFocusPauseForCenterBtn("nextScenario"); focusSnapshot(); return { kind: "debug", action: "nextScenario" }; }
      return null;
    }

    // Hand card menu (P0 only).
    if (sel.loc && sel.loc.zone === "hand" && sel.loc.p === 0) {
      PD.ui.menuOpenForSelection(state, view, sel);
      if (view.menu.items && view.menu.items.length > 0) {
        view.mode = "menu";
      } else {
        PD.anim.feedbackError(view, "no_actions", "No actions");
      }
    }
  }

  // If hold targeting is active and A is no longer held, auto-confirm is handled in targeting mode.

  // Keep selection anchor fresh for the next tick.
  focusSnapshot();
  return null;
};

// ---- src/66_focus.js ----
// PD.ui.focus: centralized focus policy (autofocus + selection preservation).

PD.ui.focus = {};

PD.ui.focus._screenCenter = function (view, item) {
  var row = item.row;
  var cam = view.camX[row];
  var x = item.x;
  var y = item.y;
  var w = item.w;
  var h = item.h;
  return { cx: (x - cam) + (w / 2), cy: y + (h / 2) };
};

PD.ui.focus.snapshot = function (state, view, computed) {
  var row = view.cursor.row;
  var rm = computed.models[row];
  var items = rm.items;
  var sel = items[PD.ui.clampI(view.cursor.i, items.length)];
  if (!sel) { view.ux.selAnchor = null; return; }

  var c = PD.ui.focus._screenCenter(view, sel);
  view.ux.selAnchor = {
    row: sel.row,
    kind: sel.kind,
    uid: sel.uid,
    loc: sel.loc,
    screenCx: c.cx,
    screenCy: c.cy
  };
};

PD.ui.focus._findItemByUidLoc = function (computed, uid, loc) {
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

PD.ui.focus._nearestByGeometry = function (view, computed, anchor) {
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
      var c = PD.ui.focus._screenCenter(view, it);
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

PD.ui.focus.preserve = function (state, view, computed) {
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

    if (a.uid) pick = PD.ui.focus._findItemByUidLoc(computed, a.uid, a.loc);
    if (!pick) pick = PD.ui.focus._nearestByGeometry(view, computed, a);
  }

  // If we have no anchor-based pick and selection is missing, pick any valid item.
  if (!pick && !sel) {
    pick = PD.ui.findBestCursorTarget(computed.models, [4, 3, 2, 1, 0], function () { return true; });
  }

  if (pick) {
    // Avoid churn if already there.
    if (view.cursor && view.cursor.row === pick.row && view.cursor.i === pick.i) return false;
    PD.ui.cursorMoveTo(view, pick);
    view.ux.lastFocusRuleId = "preserve";
    return true;
  }

  return false;
};

PD.ui.focus._pickCenterBtn = function (computed, id) {
  return PD.ui.findBestCursorTarget(computed.models, [2], function (it) {
    return it && it.kind === "btn" && it.id === id && !it.disabled;
  });
};

PD.ui.focus._pickPayDebtDefault = function (computed) {
  var rmHand = computed.models[PD.render.ROW_P_HAND];
  var rmTable = computed.models[PD.render.ROW_P_TABLE];

  // Prefer bank if any cards exist.
  if (rmHand && rmHand.items) {
    var i;
    for (i = rmHand.items.length - 1; i >= 0; i--) {
      var it = rmHand.items[i];
      if (it && it.loc && it.loc.p === 0 && it.loc.zone === "bank") return { row: PD.render.ROW_P_HAND, i: i, item: it };
    }
  }

  // Then houses (house-pay-first friendly).
  if (rmTable && rmTable.items) {
    var j;
    for (j = 0; j < rmTable.items.length; j++) {
      var itH = rmTable.items[j];
      if (itH && itH.loc && itH.loc.p === 0 && itH.loc.zone === "setHouse") return { row: PD.render.ROW_P_TABLE, i: j, item: itH };
    }
    for (j = 0; j < rmTable.items.length; j++) {
      var itP = rmTable.items[j];
      if (itP && itP.loc && itP.loc.p === 0 && itP.loc.zone === "setProps") return { row: PD.render.ROW_P_TABLE, i: j, item: itP };
    }
  }

  return null;
};

PD.ui.focus._pickHandCard = function (computed) {
  return PD.ui.findBestCursorTarget(computed.models, [PD.render.ROW_P_HAND], function (it) {
    return it && it.kind === "hand" && it.loc && it.loc.p === 0 && it.loc.zone === "hand";
  });
};

PD.ui.focus.rules = [
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
    enabled: function (ctx) { return !!(PD.config && PD.config.debug && PD.config.debug.enabled); },
    when: function (ctx) { return (ctx.view.ux.lastWinnerP === PD.state.NO_WINNER && ctx.state.winnerP !== PD.state.NO_WINNER); },
    pick: function (ctx) {
      return PD.ui.focus._pickCenterBtn(ctx.computed, "reset");
    }
  },
  {
    id: "OnInvalidActionGameOver_Reset",
    enabled: function (ctx) { return !!(PD.config && PD.config.debug && PD.config.debug.enabled); },
    when: function (ctx) {
      if (ctx.state.winnerP === PD.state.NO_WINNER) return false;
      if (ctx.view.mode !== "browse" || ctx.view.inspectActive) return false;
      return (ctx.view.ux.pendingFocusErrorCode === "game_over");
    },
    pick: function (ctx) {
      ctx.view.ux.pendingFocusErrorCode = "";
      return PD.ui.focus._pickCenterBtn(ctx.computed, "reset");
    }
  },
  {
    id: "OnPlaysExhausted_End",
    enabled: function () { return true; },
    when: function (ctx) {
      if (ctx.state.winnerP !== PD.state.NO_WINNER) return false;
      if (ctx.state.activeP !== 0) return false;
      if (ctx.view.mode !== "browse" || ctx.view.inspectActive) return false;
      return (ctx.view.ux.lastActiveP === 0 && ctx.view.ux.lastPlaysLeft > 0 && ctx.state.playsLeft <= 0);
    },
    pick: function (ctx) {
      return PD.ui.focus._pickCenterBtn(ctx.computed, "endTurn");
    }
  },
  {
    id: "OnHandBecameEmpty_End",
    enabled: function () { return true; },
    when: function (ctx) {
      if (ctx.state.winnerP !== PD.state.NO_WINNER) return false;
      if (ctx.state.activeP !== 0) return false;
      if (ctx.view.mode !== "browse" || ctx.view.inspectActive) return false;
      if (ctx.state.prompt) return false;
      if (ctx.view.ux.autoFocusPausedByDebug) return false;
      return (ctx.view.ux.lastHandLenP0 > 0 && ctx.state.players[0].hand.length === 0);
    },
    pick: function (ctx) {
      return PD.ui.focus._pickCenterBtn(ctx.computed, "endTurn");
    }
  },
  {
    id: "OnPlayerTurnStart_FocusHandOrEnd",
    enabled: function () { return true; },
    when: function (ctx) {
      if (ctx.state.winnerP !== PD.state.NO_WINNER) return false;
      if (ctx.state.activeP !== 0) return false;
      if (ctx.view.mode !== "browse" || ctx.view.inspectActive) return false;
      if (ctx.state.prompt && ctx.state.prompt.p === 0) return false;
      if (ctx.view.ux.autoFocusPausedByDebug) return false;
      // Turn-start transition into P0.
      return (ctx.view.ux.lastActiveP !== 0);
    },
    pick: function (ctx) {
      if (ctx.state.players[0].hand.length > 0) return PD.ui.focus._pickHandCard(ctx.computed);
      if (ctx.state.playsLeft > 0) return PD.ui.focus._pickCenterBtn(ctx.computed, "endTurn");
      return null;
    }
  },
  {
    id: "OnInvalidActionWhileHandEmpty_End",
    enabled: function () { return true; },
    when: function (ctx) {
      if (ctx.state.winnerP !== PD.state.NO_WINNER) return false;
      if (ctx.state.activeP !== 0) return false;
      if (ctx.view.mode !== "browse" || ctx.view.inspectActive) return false;
      if (ctx.state.prompt) return false;
      if (ctx.view.ux.autoFocusPausedByDebug) return false;
      if (!ctx.view.ux.pendingFocusErrorCode) return false;
      return (ctx.state.players[0].hand.length === 0 && ctx.state.playsLeft > 0);
    },
    pick: function (ctx) {
      ctx.view.ux.pendingFocusErrorCode = "";
      return PD.ui.focus._pickCenterBtn(ctx.computed, "endTurn");
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
      return PD.ui.findBestCursorTarget(ctx.computed.models, [PD.render.ROW_P_HAND], function (it) {
        return it && it.kind === "hand" && it.loc && it.loc.zone === "recvProps" && it.loc.p === 0;
      });
    }
  },
  {
    id: "OnExitPlaceReceivedPrompt_End",
    enabled: function () { return true; },
    when: function (ctx) {
      if (ctx.state.winnerP !== PD.state.NO_WINNER) return false;
      var pr = ctx.state.prompt;
      var cur = !!(pr && pr.kind === "placeReceived" && pr.p === 0);
      var exited = (ctx.view.ux.lastPromptForP0 && ctx.view.ux.lastPromptKind === "placeReceived" && !cur);
      if (!exited) return false;
      if (ctx.state.activeP !== 0) return false;
      // Common case: last play was Rent and playsLeft is now 0.
      return (ctx.state.playsLeft <= 0);
    },
    pick: function (ctx) {
      return PD.ui.focus._pickCenterBtn(ctx.computed, "endTurn");
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
      return PD.ui.focus._pickPayDebtDefault(ctx.computed);
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
      var pick = PD.ui.focus._pickPayDebtDefault(ctx.computed);
      if (pick) ctx.view.ux.pendingFocusErrorCode = "";
      return pick;
    }
  }
];

PD.ui.focus.apply = function (state, view, computed, actions) {
  var nav = actions.nav;
  var a = actions.a;
  var hasNav = !!(nav && (nav.up || nav.down || nav.left || nav.right));
  var hasA = !!(a && (a.tap || a.grabStart));

  // Debug-pause latch: suppress all snapping until the player provides a non-debug input.
  if (view.ux.autoFocusPausedByDebug) {
    if (hasNav) { view.ux.autoFocusPausedByDebug = false; return false; }
    if (hasA) {
      var sel = computed.selected;
      var isDebugBtn = !!(sel && sel.kind === "btn" && sel.row === PD.render.ROW_CENTER &&
        (sel.id === "step" || sel.id === "reset" || sel.id === "nextScenario"));
      if (!isDebugBtn) view.ux.autoFocusPausedByDebug = false;
      return false;
    }

    // While latched, allow preservation only when selection disappears.
    if (!computed.selected) return PD.ui.focus.preserve(state, view, computed);
    return false;
  }

  // Never move the cursor out from under the player during the same tick that they
  // are navigating or confirming; preservation/autofocus is for state churn between ticks.
  if (hasNav || hasA) return false;

  // Always preserve selection stability first.
  var changed = false;
  if (PD.ui.focus.preserve(state, view, computed)) changed = true;

  var ctx = { state: state, view: view, computed: computed, actions: actions };

  var ri;
  for (ri = 0; ri < PD.ui.focus.rules.length; ri++) {
    var r = PD.ui.focus.rules[ri];
    if (!r.enabled(ctx)) continue;
    if (!r.when(ctx)) continue;
    var pick = r.pick(ctx);
    if (pick && pick.row != null && pick.i != null) {
      PD.ui.cursorMoveTo(view, pick);
      view.ux.lastFocusRuleId = r.id;
      return true;
    }
  }

  return changed;
};

// ---- src/70_anim.js ----
// PD.anim: UI-owned animation plumbing (turn events into timed, input-locking “watch moments”).
// This module owns view.anim queue/steps, but still manipulates UI view state
// (mode/menu/targeting) because animations are a UI-owned “watch” moment.

PD.anim.onEvents = function (state, view, events) {
  if (!state || !view || !events || events.length === 0) return;
  var anim = view.anim;

  // Clear overlays: animations are a read-only “watch” moment.
  if (view.mode !== "prompt") view.mode = "browse";
  if (view.menu) view.menu.items = [];
  if (view.targeting) view.targeting.active = false;

  // Config knobs are validated in tests (avoid runtime fallbacks in the cartridge).
  var uiCfg = PD.config.ui;
  var dealFrames = Math.floor(uiCfg.dealFramesPerCard);
  var dealGap = Math.floor(uiCfg.dealGapFrames);
  var shuffleFrames = Math.floor(uiCfg.shuffleAnimFrames);
  var shuffleToastFrames = Math.floor(uiCfg.shuffleToastFrames);
  if (shuffleFrames < shuffleToastFrames) shuffleFrames = shuffleToastFrames;

  var i;
  for (i = 0; i < events.length; i++) {
    var ev = events[i];
    if (!ev || !ev.kind) continue;

    if (ev.kind === "reshuffle") {
      // Toast + simple deck animation; input locked until finished.
      PD.ui.toastPush(view, { id: "deck_shuffle", kind: "info", text: "Deck ran out. Shuffling", frames: shuffleToastFrames });
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
  }

  anim.lock = !!(anim.active || (anim.q && anim.q.length));
};

PD.anim.tick = function (state, view) {
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

// Phase 05c+: treat cursor-flash feedback as an animation/fx owned here.
PD.anim.feedbackError = function (view, code, msg) {
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
    // Toast UI lives in PD.ui; this just triggers it as part of the feedback FX.
    PD.ui.toastPush(view, { id: "err:" + code, kind: "error", text: msg, frames: 90 });
  }
};

PD.anim.feedbackTick = function (view) {
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

// Phase 05c: presentation (render-facing view of state/models).
// Renderer should not depend on `view.anim`; instead, UI calls this after building models.
PD.anim.present = function (state, view, computed) {
  if (!state || !view || !computed || !computed.models) return computed;
  var anim = view.anim;
  var a = anim ? anim.active : null;

  // Reset any prior overlay presentation (computed is rebuilt each call, but be explicit).
  computed.animOverlay = null;

  // Provide highlight color for render (cursor flash on disallowed actions).
  // Default highlight color lives in render config.
  var colDefault = PD.config.render.style.colHighlight;
  var hl = colDefault;
  if (view.feedback && view.feedback.blinkFrames > 0) {
    if ((view.feedback.blinkPhase % 2) === 0) hl = PD.Pal.Red;
  }
  computed.highlightCol = hl;

  // Phase 05c: hide in-flight dealt cards until revealed (presentation-only).
  if (anim && anim.hiddenByP) {
    var rowPH = PD.render.ROW_P_HAND;
    var rowOH = PD.render.ROW_OP_HAND;
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
    }
  }

  if (!a || !a.kind) return computed;

  var rowCenter = PD.render.ROW_CENTER;
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

    var rowHand = (p === 0) ? PD.render.ROW_P_HAND : PD.render.ROW_OP_HAND;

    var camCenter = view.camX[rowCenter];
    var camH = view.camX[rowHand];

    var L = PD.config.render.layout;
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

  return computed;
};

// ---- src/90_debug.js ----
// PD.debug: dev harness (scenario cycling/reset/step) + main tick wiring for playtesting.
PD.debug.scenarioI = 0;
PD.debug.scenarios = ["default"].concat(PD.scenarios.IDS);
PD.debug.state = null;
PD.debug.view = PD.ui.newView();
PD.debug.ctrl = PD.controls.newState();
PD.debug.ai = { wait: 0 };
PD.debug.lastCmd = "";
PD.debug.lastEvents = [];
PD.debug.lastRaw = null;
PD.debug.lastUiActions = null;
PD.debug.lastUiIntentSummary = "";

PD.debug.reset = function (opts) {
  var d = PD.debug;
  var prevPaused = !!d.view.ux.autoFocusPausedByDebug;
  var shouldPause = !!(opts && opts.pauseAutoFocus) || prevPaused;
  var seedU32 = PD.seed.computeSeedU32();
  var scenarioId = d.scenarios[d.scenarioI];
  if (scenarioId === "default") {
    d.state = PD.state.newGame({ seedU32: seedU32 });
  } else {
    d.state = PD.state.newGame({ seedU32: seedU32, scenarioId: scenarioId });
  }
  d.view = PD.ui.newView();
  if (shouldPause) d.view.ux.autoFocusPausedByDebug = true;
  d.ctrl = PD.controls.newState();
  d.ai = { wait: 0 };
  d.lastCmd = "";
  d.lastEvents = [];
  d.lastRaw = null;
  d.lastUiActions = null;
  d.lastUiIntentSummary = "";
};

PD.debug.nextScenario = function () {
  var d = PD.debug;
  d.scenarioI = (d.scenarioI + 1) % d.scenarios.length;
  PD.debug.reset({ pauseAutoFocus: true });
};

PD.debug.step = function () {
  var d = PD.debug;
  var state = d.state;
  var moves = PD.engine.legalMoves(state);
  var p = PD.ai.actor(state);
  var policy = PD.ai.policyForP(p);
  var cmd = PD.ai.pickMove(state, moves, policy);
  if (!cmd) return;

  var res = PD.engine.applyCommand(state, cmd);
  d.lastCmd = cmd.kind;
  d.lastEvents = (res && res.events) ? res.events : [];
};

PD.debug.eventsToLine = function (events) {
  if (!events || events.length === 0) return "(none)";
  var parts = [];
  var i;
  for (i = 0; i < events.length; i++) {
    parts.push(events[i].kind);
  }
  return parts.join(",");
};

PD.debug.tickTextMode = function () {
  var d = PD.debug;

  if (typeof btnp === "function") {
    // A: step, B: next scenario, X: reset
    if (btnp(4)) PD.debug.step();
    if (btnp(5)) PD.debug.nextScenario();
    if (btnp(6)) PD.debug.reset({ pauseAutoFocus: true });
  }

  var s = d.state;

  function printSmall(msg, x, y, col) {
    if (col == null) col = 12;
    // smallfont=true and fixed=true keeps layout predictable.
    print(String(msg || ""), x, y, col, true, 1, true);
  }

  function bool01(v) { return v ? 1 : 0; }

  function promptLine(state) {
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
      var nToDiscard = (handLen + nDiscarded) - PD.state.HAND_MAX;
      if (nToDiscard < 0) nToDiscard = 0;
      var left = handLen - PD.state.HAND_MAX;
      if (left < 0) left = 0;
      return "Prompt:discardDown to:" + nToDiscard + " left:" + left;
    }

    return "Prompt:" + k;
  }

  cls(0);
  var x = 6;
  var y = 6;
  var step = 6;
  var xR = 120;

  printSmall("Phase 02 Debug", x, y, 12); y += step;
  var sid = d.scenarios[d.scenarioI];
  var info = (PD.scenarios.INFO && sid) ? PD.scenarios.INFO[String(sid)] : null;
  var title = (info && info.title) ? String(info.title) : String(sid);
  printSmall("Scenario:" + title, x, y, 12); y += step;
  var pendingDesc = (info && info.desc) ? String(info.desc) : "";
  printSmall("Seed:" + PD.seed.computeSeedU32(), x, y, 12); y += step;

  if (PD.render && PD.render.debug && typeof PD.render.debug.selectedLines === "function") {
    var sel = PD.render.debug.selectedLines(d);
    if (sel && sel.length) {
      printSmall(sel[0] || "", x, y, 12); y += step;
      if (sel[1]) { printSmall(sel[1], x, y, 12); y += step; }
    }
  }

  printSmall("Active:P" + s.activeP + " Plays:" + s.playsLeft, x, y, 12); y += step;
  printSmall(promptLine(s), x, y, 12); y += step;
  var w = s.winnerP;
  if (w !== PD.state.NO_WINNER) { printSmall("Winner:P" + w, x, y, 11); y += step; }

  printSmall("Deck:" + s.deck.length + " Disc:" + s.discard.length, x, y, 12); y += step;
  printSmall("Hand0/1:" + s.players[0].hand.length + "/" + s.players[1].hand.length, x, y, 12); y += step;
  printSmall(
    "Bank0/1:" +
    s.players[0].bank.length + "($" + PD.util.bankValueTotal(s, 0) + ")/" +
    s.players[1].bank.length + "($" + PD.util.bankValueTotal(s, 1) + ")",
    x,
    y,
    12
  ); y += step;
  printSmall("Sets0/1:" + s.players[0].sets.length + "/" + s.players[1].sets.length, x, y, 12); y += step;

  var moves = PD.engine.legalMoves(s);
  printSmall("Legal:" + moves.length, x, y, 12); y += step;
  printSmall("LastCmd:" + (d.lastCmd || "(none)"), x, y, 12); y += step;
  printSmall("Events:" + PD.debug.eventsToLine(d.lastEvents), x, y, 12); y += step;

  // Long focus rule ids don't fit well in the right column; render them full-width here.
  var vFocus = d.view;
  if (vFocus && vFocus.ux && vFocus.ux.lastFocusRuleId) {
    printSmall("FocusRule:" + String(vFocus.ux.lastFocusRuleId), x, y, 12); y += step;
  }

  // Render scenario description after Events so it doesn't overlap the right UI column.
  if (pendingDesc) { printSmall(pendingDesc, x, y, 13); y += step; }

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
        printSmall("Anchor:uid" + a.uid + " " + zone, xR, yR, 12); yR += step;
      }
      if (v.ux.pendingFocusErrorCode) {
        printSmall("FocusErr:" + String(v.ux.pendingFocusErrorCode), xR, yR, 12); yR += step;
      }
    }

    if (v.mode === "menu" && v.menu && v.menu.items) {
      var nM = v.menu.items.length;
      var mi = (nM > 0) ? PD.ui.clampI(v.menu.i, nM) : 0;
      var it = (nM > 0) ? v.menu.items[mi] : null;
      var id = it ? String(it.id || "?") : "(none)";
      printSmall("Menu:" + mi + "/" + nM + " " + id, xR, yR, 12); yR += step;
    }

    if (v.mode === "targeting" && v.targeting && v.targeting.active) {
      var t = v.targeting;
      var nC = (t.cmds && t.cmds.length) ? t.cmds.length : 0;
      var ci = (nC > 0) ? PD.ui.clampI(t.cmdI, nC) : 0;
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

PD.mainTick = function () {
  // Modes: 0=DebugText, 1=Render
  if (typeof btnp === "function" && btnp(7)) PD._mainMode = PD._mainMode ? 0 : 1;

  if (PD._mainMode === 0) {
    if (PD.debug.state == null) PD.debug.reset(null);
    PD.debug.tickTextMode();
    return;
  }

  // Render mode
  var d = PD.debug;
  if (d.state == null) PD.debug.reset(null);

  {
    function summarizeUiIntent(intent) {
      if (!intent || !intent.kind) return "(none)";
      if (intent.kind === "applyCmd" && intent.cmd && intent.cmd.kind) return "applyCmd:" + String(intent.cmd.kind);
      if (intent.kind === "debug" && intent.action) return "debug:" + String(intent.action);
      return String(intent.kind);
    }

    var raw = PD.controls.pollGlobals();
    d.lastRaw = raw;
    var actions = PD.controls.actions(d.ctrl, raw, PD.config.controls);
    d.lastUiActions = actions;

    // Phase 07: AI acts for actor=1 (activeP or prompt.p). While AI is acting, suppress player input.
    var actor = PD.ai.actor(d.state);
    if (actor !== 0) actions = {};

    var intent = PD.ui.step(d.state, d.view, actions);
    d.lastUiIntentSummary = summarizeUiIntent(intent);

    if (actor === 0 && intent && intent.kind === "applyCmd" && intent.cmd) {
      try {
        var res = PD.engine.applyCommand(d.state, intent.cmd);
        d.lastCmd = intent.cmd.kind;
        d.lastEvents = (res && res.events) ? res.events : [];
        PD.anim.onEvents(d.state, d.view, d.lastEvents);
      } catch (err) {
        d.lastCmd = intent.cmd.kind + "(!)";
        d.lastEvents = [];
        var code = (err && err.message) ? String(err.message) : "error";
        var msg = PD.fmt.errorMessage(code);
        PD.anim.feedbackError(d.view, code, msg);
      }
    } else if (actor === 0 && intent && intent.kind === "debug") {
      if (intent.action === "step") {
        PD.debug.step();
        PD.anim.onEvents(d.state, d.view, d.lastEvents);
      }
      else if (intent.action === "reset") PD.debug.reset({ pauseAutoFocus: true });
      else if (intent.action === "nextScenario") PD.debug.nextScenario();
    }

    // Phase 07: AI pacing loop (one command per step, with fixed delay).
    if (actor !== 0 && !(d.view && d.view.anim && d.view.anim.lock)) {
      if (d.ai.wait > 0) {
        d.ai.wait -= 1;
      } else {
        var cmdAi = PD.ai.pickRandomLegalMove(d.state);
        if (cmdAi) {
          var txt = PD.ai.describeCmd(d.state, cmdAi);
          if (txt) {
            PD.ui.toastPush(d.view, { id: "ai:narrate", kind: "ai", text: txt, frames: PD.config.ui.aiNarrateToastFrames });
          }
          try {
            var resAi = PD.engine.applyCommand(d.state, cmdAi);
            d.lastCmd = "ai:" + cmdAi.kind;
            d.lastEvents = (resAi && resAi.events) ? resAi.events : [];
            PD.anim.onEvents(d.state, d.view, d.lastEvents);
          } catch (errAi) {
            d.lastCmd = "ai:" + cmdAi.kind + "(!)";
            d.lastEvents = [];
            var codeAi = (errAi && errAi.message) ? String(errAi.message) : "error";
            var msgAi = PD.fmt.errorMessage(codeAi);
            PD.anim.feedbackError(d.view, codeAi, msgAi);
          }
          d.ai.wait = PD.config.ui.aiStepDelayFrames;
        } else {
          d.ai.wait = PD.config.ui.aiStepDelayFrames;
        }
      }
    }

    var computed = PD.ui.computeRowModels(d.state, d.view);
    PD.ui.updateCameras(d.state, d.view, computed);
    // Recompute after camera updates (selection/cam are orthogonal, but keep it stable).
    computed = PD.ui.computeRowModels(d.state, d.view);

    PD.render.drawFrame({ state: d.state, view: d.view, computed: computed });
  }
};

PD._mainMode = 0;

// ---- src/99_main.js ----
// Cartridge entrypoint: TIC-80 calls `TIC()` once per frame.
function TIC() {
  PD.mainTick();
}

