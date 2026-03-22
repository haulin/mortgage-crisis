// script: js
// title: Property Deal
// saveid: PropertyDeal
// generated: do not edit by hand (edit src/* instead)
// ---- src/00_prelude.js ----
var PD = PD || {};

// ---- src/01_config.js ----
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
  navConeKUpDown: 6
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

// ---- src/03_rng.js ----
PD.xorshift32Step = function (sU32) {
  var x = sU32 >>> 0;
  if (!x) x = 1;
  x ^= x << 13;
  x >>>= 0;
  x ^= x >>> 17;
  x ^= x << 5;
  x >>>= 0;
  return x >>> 0;
};

PD.RNG = function (seedU32) {
  var s = (seedU32 >>> 0) || 1;
  this.s = s >>> 0;
};

// Standalone RNG instances (handy for tests/utilities; separate from RNG-in-state).
PD.RNG.prototype.nextU32 = function () {
  this.s = PD.xorshift32Step(this.s >>> 0);
  return this.s >>> 0;
};

PD.RNG.prototype.nextInt = function (n) {
  n = n | 0;
  if (n <= 0) return 0;
  return (this.nextU32() % n) | 0;
};

// RNG-in-state helpers (store evolving state in `state.rngS`).
PD.rngNextU32 = function (state) {
  state.rngS = PD.xorshift32Step(state.rngS >>> 0);
  return state.rngS >>> 0;
};

PD.rngNextInt = function (state, n) {
  n = n | 0;
  if (n <= 0) return 0;
  return (PD.rngNextU32(state) % n) | 0;
};

// ---- src/04_controls.js ----
PD.controls = PD.controls || {};

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
  raw = raw || { down: [], pressed: [] };
  cfg = cfg || {};

  var down = raw.down || [];
  var pressed = raw.pressed || [];

  var repeatDelay = (cfg.dpadRepeatDelayFrames != null) ? (cfg.dpadRepeatDelayFrames | 0) : 12;
  var repeatPeriod = (cfg.dpadRepeatPeriodFrames != null) ? (cfg.dpadRepeatPeriodFrames | 0) : 4;
  if (repeatDelay < 0) repeatDelay = 0;
  if (repeatPeriod < 1) repeatPeriod = 1;

  var grabFallback = (cfg.aHoldFallbackFrames != null) ? (cfg.aHoldFallbackFrames | 0) : 18;
  if (grabFallback < 0) grabFallback = 0;

  var inspectDelay = (cfg.xInspectDelayFrames != null) ? (cfg.xInspectDelayFrames | 0) : 6;
  if (inspectDelay < 0) inspectDelay = 0;

  st.frame = (st.frame | 0) + 1;

  var i;
  for (i = 0; i < 8; i++) {
    var isDown = !!down[i];
    st.held[i] = isDown ? ((st.held[i] | 0) + 1) : 0;
  }

  // Edge detection from down states (used in case caller doesn't provide pressed[]).
  function fell(iBtn) { return !!st.prevDown[iBtn] && !down[iBtn]; }
  function rose(iBtn) { return !st.prevDown[iBtn] && !!down[iBtn]; }

  // D-pad repeat: synthesize nav pulses.
  function navPulse(btnId) {
    btnId = btnId | 0;
    if (!down[btnId]) { st.dpadRepeat[btnId] = 0; return false; }

    // Prefer provided pressed[] as the initial pulse.
    if (pressed[btnId] || rose(btnId)) { st.dpadRepeat[btnId] = 0; return true; }

    st.dpadRepeat[btnId] = (st.dpadRepeat[btnId] | 0) + 1;
    if ((st.dpadRepeat[btnId] | 0) < (repeatDelay | 0)) return false;

    var t = (st.dpadRepeat[btnId] | 0) - (repeatDelay | 0);
    return ((t % repeatPeriod) | 0) === 0;
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
  var aHeldFrames = st.held[4] | 0;
  var aGrabStartNow = false;

  if (aDown && !st.aGrabActive) {
    var shouldEnter = false;
    if (navAny && aHeldFrames > 0) shouldEnter = true;
    else if (aHeldFrames >= (grabFallback | 0) && (grabFallback | 0) > 0) shouldEnter = true;
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
    if ((st.held[6] | 0) >= (inspectDelay | 0) && (inspectDelay | 0) > 0) st.xInspectActive = true;
    if ((inspectDelay | 0) === 0) st.xInspectActive = true;
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

// ---- src/04_seed.js ----
PD.computeSeed = function () {
  var s = (PD.config.seedBase >>> 0) || 1;
  return s >>> 0;
};

PD.newGameRng = function () {
  return new PD.RNG(PD.computeSeed());
};

// ---- src/05_shuffle.js ----
PD.shuffleInPlace = function (arr, rng) {
  var i;
  for (i = (arr.length | 0) - 1; i > 0; i--) {
    var j = rng.nextInt(i + 1);
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
};

// ---- src/06_defs.js ----
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
PD.ruleNoteTextById = PD.ruleNoteTextById || [];
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

// ---- src/07_state.js ----
PD.NO_COLOR = -1;
PD.NO_WINNER = -1;
PD.HAND_MAX = 7;

PD.assertPromptShape = function (prompt) {
  if (prompt == null) return;
  if (typeof prompt !== "object") throw new Error("bad_prompt");
  if (!prompt.kind || typeof prompt.kind !== "string") throw new Error("bad_prompt");
  if (prompt.p == null) throw new Error("bad_prompt");
};

PD.clearPrompt = function (state) {
  state.prompt = null;
};

PD.setPrompt = function (state, prompt) {
  PD.assertPromptShape(prompt);
  if (prompt == null) {
    state.prompt = null;
    return;
  }
  state.prompt = {
    kind: String(prompt.kind),
    p: prompt.p | 0
  };
};

PD.otherPlayer = function (p) {
  return (p ^ 1) & 1;
};

PD.getSetColor = function (props) {
  if (!props || props.length === 0) return PD.NO_COLOR;
  return props[0][1];
};

PD.isBankableDef = function (def) {
  if (!def) return false;
  return def.kind === PD.CardKind.Money || def.kind === PD.CardKind.Action || def.kind === PD.CardKind.House;
};

PD.isWildDef = function (def) {
  return !!(def && def.kind === PD.CardKind.Property && def.wildColors && def.wildColors.length);
};

PD.wildAllowsColor = function (def, color) {
  if (!PD.isWildDef(def)) return false;
  color = color | 0;
  return def.wildColors[0] === color || def.wildColors[1] === color;
};

PD.shuffleUidsInPlace = function (state, arr) {
  var i;
  for (i = arr.length - 1; i > 0; i--) {
    var j = PD.rngNextInt(state, i + 1);
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
};

PD.buildAllUids = function (state) {
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

PD.defByUid = function (state, uid) {
  uid = uid | 0;
  var di = state.uidToDefI[uid];
  return PD.CARD_DEFS[di];
};

PD.newEmptySet = function () {
  return {
    // Properties are tuples: [uid, color]
    props: [],
    // House card uid (0/undefined means none).
    houseUid: 0
  };
};

PD.drawToHand = function (state, p, n, events) {
  p = p | 0;
  n = n | 0;
  if (n <= 0) return;
  if (!state.deck) state.deck = [];
  var nAvail = state.deck.length | 0;
  if (nAvail <= 0) return;
  if (n > nAvail) n = nAvail;

  var uids = [];
  var k;
  for (k = 0; k < n; k++) {
    var uid = state.deck.pop();
    state.players[p].hand.push(uid);
    uids.push(uid);
  }

  if (events && (uids.length | 0) > 0) events.push({ kind: "draw", p: p, uids: uids });
};

PD.startTurn = function (state, events) {
  state.playsLeft = 3;
  PD.clearPrompt(state);
  var p = state.activeP | 0;
  var nDraw = 2;
  if ((state.players[p].hand.length | 0) === 0) nDraw = 5;
  PD.drawToHand(state, p, nDraw, events);
  if (events) events.push({ kind: "plays", p: state.activeP, playsLeft: state.playsLeft });
};

PD.newGame = function (opts) {
  opts = opts || {};
  var seedU32 = opts.seedU32 == null ? PD.computeSeed() : (opts.seedU32 >>> 0);
  if (!seedU32) seedU32 = 1;

  var state = {
    rngS: seedU32 >>> 0,
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
    winnerP: PD.NO_WINNER
  };

  PD.buildAllUids(state);

  if (opts.scenarioId) {
    PD.applyScenario(state, String(opts.scenarioId));
    return state;
  }

  // Default game start: shuffle full deck, deal 5 each, choose first player randomly,
  // then start their turn (draw 2, playsLeft=3).
  var uid;
  for (uid = 1; uid <= state.totalUids; uid++) state.deck.push(uid);
  PD.shuffleUidsInPlace(state, state.deck);

  PD.drawToHand(state, 0, 5, null);
  PD.drawToHand(state, 1, 5, null);

  state.activeP = PD.rngNextInt(state, 2);
  var events = [];
  events.push({ kind: "turn", activeP: state.activeP });
  PD.startTurn(state, events);
  // Default newGame doesn't expose events, but tests may call startTurn/endTurn directly.

  return state;
};

// Scenario/test helpers (defId-first).
PD.cardPoolInit = function (state) {
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

PD.takeUid = function (state, defId) {
  if (!state._pool) PD.cardPoolInit(state);
  var a = state._pool[defId];
  if (!a || a.length === 0) throw new Error("pool_exhausted:" + defId);
  return a.pop();
};

// ---- src/08_rules.js ----
PD.evaluateWin = function (state) {
  var p;
  for (p = 0; p < 2; p++) {
    var sets = state.players[p].sets;
    var complete = 0;
    var si;
    for (si = 0; si < sets.length; si++) {
      var set = sets[si];
      if (!set) continue;
      var color = PD.getSetColor(set.props);
      if (color === PD.NO_COLOR) continue;
      var req = PD.SET_RULES[color].requiredSize;
      if (set.props.length >= req && req > 0) complete++;
    }
    if (complete >= 3) return p;
  }
  return PD.NO_WINNER;
};

PD.assertCanApply = function (state) {
  if (state.winnerP !== PD.NO_WINNER) throw new Error("game_over");
  if (state.prompt) throw new Error("prompt_active");
};

PD.locEqZone = function (loc, zone) {
  return !!loc && loc.zone === zone;
};

PD.removeHandAtLoc = function (state, card) {
  var loc = card.loc;
  var p = loc.p | 0;
  var i = loc.i | 0;
  var uid = card.uid | 0;
  var hand = state.players[p].hand;
  if (hand[i] !== uid) throw new Error("bad_loc");
  hand.splice(i, 1);
};

PD.applyCommand = function (state, cmd) {
  PD.assertCanApply(state);
  if (!cmd || !cmd.kind) throw new Error("bad_cmd");

  var events = [];
  var p = state.activeP;
  var handP = state.players[p].hand;

  function decPlays() {
    state.playsLeft -= 1;
    events.push({ kind: "plays", p: p, playsLeft: state.playsLeft });
  }

  function applyEndTurn() {
    state.activeP = PD.otherPlayer(state.activeP);
    events.push({ kind: "turn", activeP: state.activeP });
    PD.startTurn(state, events);
  }

  function applyBank(cmdBank) {
    var card = cmdBank.card;
    if (!card || !card.loc) throw new Error("bad_cmd");
    if (!PD.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if ((card.loc.p | 0) !== (p | 0)) throw new Error("not_your_card");

    var uid = card.uid | 0;
    var def = PD.defByUid(state, uid);
    if (!PD.isBankableDef(def)) throw new Error("not_bankable");

    PD.removeHandAtLoc(state, card);
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
    if (!PD.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if ((card.loc.p | 0) !== (p | 0)) throw new Error("not_your_card");

    var uid = card.uid | 0;
    var def = PD.defByUid(state, uid);
    if (!def || def.kind !== PD.CardKind.Property) throw new Error("not_property");

    var placedColor = PD.NO_COLOR;
    if (PD.isWildDef(def)) {
      placedColor = cmdProp.color | 0;
      if (!PD.wildAllowsColor(def, placedColor)) throw new Error("wild_color_illegal");
    } else {
      placedColor = def.propertyColor;
    }

    var sets = state.players[p].sets;
    var setI;
    if (dest.newSet) {
      var newSet = PD.newEmptySet();
      setI = sets.length;
      sets.push(newSet);
      events.push({ kind: "createSet", p: p, setI: setI, color: placedColor });
    } else {
      setI = dest.setI | 0;
      if (setI < 0 || setI >= sets.length) throw new Error("bad_set");
      var setExisting = sets[setI];
      var setColor = PD.getSetColor(setExisting.props);
      if (setColor === PD.NO_COLOR) throw new Error("empty_set");
      if (setColor !== placedColor) throw new Error("set_color_mismatch");
    }

    PD.removeHandAtLoc(state, card);
    var setT = sets[setI];
    setT.props.push([uid, placedColor]);

    events.push({
      kind: "move",
      uid: uid,
      from: card.loc,
      to: { p: p, zone: "setProps", setI: setI, i: setT.props.length - 1 }
    });
    decPlays();

    var winner = PD.evaluateWin(state);
    if (winner !== PD.NO_WINNER) {
      state.winnerP = winner;
      events.push({ kind: "win", winnerP: winner });
    }
  }

  function applyPlayHouse(cmdHouse) {
    var card = cmdHouse.card;
    var dest = cmdHouse.dest;
    if (!card || !card.loc || !dest) throw new Error("bad_cmd");
    if (!PD.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if ((card.loc.p | 0) !== (p | 0)) throw new Error("not_your_card");

    var uid = card.uid | 0;
    var def = PD.defByUid(state, uid);
    if (!def || def.kind !== PD.CardKind.House) throw new Error("not_house");

    var sets = state.players[p].sets;
    var setI = dest.setI | 0;
    if (setI < 0 || setI >= sets.length) throw new Error("bad_set");
    var set = sets[setI];
    if (set.houseUid !== 0) throw new Error("house_already");

    var color = PD.getSetColor(set.props);
    if (color === PD.NO_COLOR) throw new Error("empty_set");
    var req = PD.SET_RULES[color].requiredSize;
    if (set.props.length < req) throw new Error("set_not_complete");

    PD.removeHandAtLoc(state, card);
    set.houseUid = uid;

    events.push({
      kind: "move",
      uid: uid,
      from: card.loc,
      to: { p: p, zone: "setHouse", setI: setI }
    });
    decPlays();
  }

  if (cmd.kind === "endTurn") {
    if ((handP.length | 0) > (PD.HAND_MAX | 0)) throw new Error("hand_over_limit");
    applyEndTurn();
    return { events: events };
  }

  if (state.playsLeft <= 0) throw new Error("no_plays_left");

  if (cmd.kind === "bank") applyBank(cmd);
  else if (cmd.kind === "playProp") applyPlayProp(cmd);
  else if (cmd.kind === "playHouse") applyPlayHouse(cmd);
  else throw new Error("unknown_cmd:" + cmd.kind);

  return { events: events };
};

PD.legalMoves = function (state) {
  if (state.winnerP !== PD.NO_WINNER) return [];
  if (state.prompt) return [];

  var moves = [];
  var p = state.activeP;
  var hand = state.players[p].hand;

  if ((hand.length | 0) <= (PD.HAND_MAX | 0)) moves.push({ kind: "endTurn" });

  if (state.playsLeft <= 0) return moves;

  var sets = state.players[p].sets;

  var i;
  for (i = 0; i < hand.length; i++) {
    var uid = hand[i];
    var def = PD.defByUid(state, uid | 0);
    var cardRef = { uid: uid, loc: { p: p, zone: "hand", i: i } };

    if (PD.isBankableDef(def)) {
      moves.push({ kind: "bank", card: cardRef });
    }

    if (def.kind === PD.CardKind.Property) {
      if (PD.isWildDef(def)) {
        // New set for each allowed color.
        moves.push({ kind: "playProp", card: cardRef, dest: { p: p, newSet: true }, color: def.wildColors[0] });
        moves.push({ kind: "playProp", card: cardRef, dest: { p: p, newSet: true }, color: def.wildColors[1] });

        // Existing sets that match allowed colors.
        var si;
        for (si = 0; si < sets.length; si++) {
          var set = sets[si];
          var setColor = PD.getSetColor(set.props);
          if (setColor === PD.NO_COLOR) continue;
          if (PD.wildAllowsColor(def, setColor)) {
            moves.push({ kind: "playProp", card: cardRef, dest: { p: p, setI: si }, color: setColor });
          }
        }
      } else {
        var c = def.propertyColor;
        // New set.
        moves.push({ kind: "playProp", card: cardRef, dest: { p: p, newSet: true } });
        // Existing sets of same color.
        var sj;
        for (sj = 0; sj < sets.length; sj++) {
          var setJ = sets[sj];
          var setColorJ = PD.getSetColor(setJ.props);
          if (setColorJ === PD.NO_COLOR) continue;
          if (setColorJ === c) {
            moves.push({ kind: "playProp", card: cardRef, dest: { p: p, setI: sj } });
          }
        }
      }
    } else if (def.kind === PD.CardKind.House) {
      var sh;
      for (sh = 0; sh < sets.length; sh++) {
        var setH = sets[sh];
        if (setH.houseUid !== 0) continue;
        var col = PD.getSetColor(setH.props);
        if (col === PD.NO_COLOR) continue;
        var req = PD.SET_RULES[col].requiredSize;
        if (setH.props.length >= req) {
          moves.push({ kind: "playHouse", card: cardRef, dest: { p: p, setI: sh } });
        }
      }
    }
  }

  return moves;
};

// ---- src/09_scenarios.js ----
PD.resetForScenario = function (state) {
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
  PD.clearPrompt(state);
  state.winnerP = PD.NO_WINNER;
  // Ensure pool exists.
  PD.cardPoolInit(state);
};

PD.setAddFixedProp = function (set, uid, color) {
  set.props.push([uid | 0, color | 0]);
};

PD.setAddPropByDefId = function (state, set, defId, forcedColor) {
  var uid = PD.takeUid(state, defId) | 0;
  var def = PD.defByUid(state, uid);
  var color = PD.NO_COLOR;
  if (PD.isWildDef(def)) {
    color = forcedColor | 0;
    if (!PD.wildAllowsColor(def, color)) throw new Error("scenario_bad_color:" + defId);
  } else {
    color = def.propertyColor | 0;
  }
  PD.setAddFixedProp(set, uid, color);
  return uid | 0;
};

PD.fillDeckFromPool = function (state) {
  var deck = [];
  var i;
  for (i = 0; i < PD.CARD_DEFS.length; i++) {
    var defId = PD.CARD_DEFS[i].id;
    var a = state._pool[defId];
    if (!a || (a.length | 0) === 0) continue;
    var k;
    for (k = 0; k < (a.length | 0); k++) deck.push(a[k] | 0);
    state._pool[defId] = [];
  }
  state.deck = deck;
};

PD.applyScenario = function (state, scenarioId) {
  PD.resetForScenario(state);

  var fn = PD._scenarioApplyById && PD._scenarioApplyById[scenarioId];
  if (!fn) throw new Error("unknown_scenario:" + scenarioId);
  fn(state);

  PD.fillDeckFromPool(state);
  // Keep deck deterministic for scenarios; callers can shuffle if desired.
  return state;
};

// Scenario registry (single source of truth).
PD.SCENARIO_IDS = ["placeFixed", "placeWild", "houseOnComplete", "winCheck"];

PD._scenarioApplyById = {
  placeFixed: function (state) {
    // P0 has 2 orange properties + $1. P0 also has an existing Orange set with 1 property.
    var setO = PD.newEmptySet();
    PD.setAddPropByDefId(state, setO, "prop_orange", PD.NO_COLOR);
    state.players[0].sets.push(setO);

    state.players[0].hand.push(PD.takeUid(state, "prop_orange"));
    state.players[0].hand.push(PD.takeUid(state, "prop_orange"));
    state.players[0].hand.push(PD.takeUid(state, "money_1"));
  },

  placeWild: function (state) {
    // P0 has Wild(M/O) and $1.
    state.players[0].hand.push(PD.takeUid(state, "wild_mo"));
    state.players[0].hand.push(PD.takeUid(state, "money_1"));

    // Discard demo (depth=3): top card is last.
    state.discard.push(PD.takeUid(state, "money_2"));
    state.discard.push(PD.takeUid(state, "money_1"));
    state.discard.push(PD.takeUid(state, "rent_cb"));
  },

  houseOnComplete: function (state) {
    // P0 has two Houses in hand.
    state.players[0].hand.push(PD.takeUid(state, "house"));
    state.players[0].hand.push(PD.takeUid(state, "house"));

    // One complete Cyan set (2).
    var setC = PD.newEmptySet();
    PD.setAddPropByDefId(state, setC, "prop_cyan", PD.NO_COLOR);
    PD.setAddPropByDefId(state, setC, "prop_cyan", PD.NO_COLOR);
    state.players[0].sets.push(setC);

    // One incomplete Black set (3/4).
    var setB = PD.newEmptySet();
    PD.setAddPropByDefId(state, setB, "prop_black", PD.NO_COLOR);
    PD.setAddPropByDefId(state, setB, "prop_black", PD.NO_COLOR);
    PD.setAddPropByDefId(state, setB, "prop_black", PD.NO_COLOR);
    state.players[0].sets.push(setB);

    // Discard demo (depth=1).
    state.discard.push(PD.takeUid(state, "money_5"));
  },

  winCheck: function (state) {
    // P0 has 3 complete sets: Cyan(2), Magenta(3), Orange(3).
    var setC2 = PD.newEmptySet();
    PD.setAddPropByDefId(state, setC2, "prop_cyan", PD.NO_COLOR);
    PD.setAddPropByDefId(state, setC2, "prop_cyan", PD.NO_COLOR);
    state.players[0].sets.push(setC2);

    var setM3 = PD.newEmptySet();
    PD.setAddPropByDefId(state, setM3, "prop_magenta", PD.NO_COLOR);
    PD.setAddPropByDefId(state, setM3, "prop_magenta", PD.NO_COLOR);
    PD.setAddPropByDefId(state, setM3, "prop_magenta", PD.NO_COLOR);
    state.players[0].sets.push(setM3);

    var setO3 = PD.newEmptySet();
    PD.setAddPropByDefId(state, setO3, "prop_orange", PD.NO_COLOR);
    PD.setAddPropByDefId(state, setO3, "prop_orange", PD.NO_COLOR);
    PD.setAddPropByDefId(state, setO3, "prop_orange", PD.NO_COLOR);
    state.players[0].sets.push(setO3);

    state.playsLeft = 0;
    state.winnerP = PD.evaluateWin(state);
  }
};

// ---- src/10_debug.js ----
PD.debug = PD.debug || {
  scenarioI: 0,
  scenarios: null,
  state: null,
  view: null,
  ctrl: null,
  lastCmd: "",
  lastEvents: []
};

PD.debug.scenarios = ["default"].concat(PD.SCENARIO_IDS);

PD.debugReset = function () {
  var d = PD.debug;
  var seedU32 = PD.computeSeed();
  var scenarioId = d.scenarios[d.scenarioI];
  if (scenarioId === "default") {
    d.state = PD.newGame({ seedU32: seedU32 >>> 0 });
  } else {
    d.state = PD.newGame({ seedU32: seedU32 >>> 0, scenarioId: scenarioId });
  }
  d.view = (PD.ui && typeof PD.ui.newView === "function") ? PD.ui.newView() : null;
  d.ctrl = (PD.controls && typeof PD.controls.newState === "function") ? PD.controls.newState() : null;
  d.lastCmd = "";
  d.lastEvents = [];
};

PD.debugNextScenario = function () {
  var d = PD.debug;
  d.scenarioI = (d.scenarioI + 1) % d.scenarios.length;
  PD.debugReset();
};

PD.debugPickMove = function (moves) {
  var d = PD.debug;
  var state = d.state;
  if (!moves || moves.length === 0) return null;

  // Heuristic for dev stepping: prefer adding properties to existing sets when possible.
  // This keeps the harness closer to typical play without changing actual legality/rules.
  var propToExisting = [];
  var i;
  for (i = 0; i < moves.length; i++) {
    var m = moves[i];
    if (m && m.kind === "playProp" && m.dest && m.dest.setI != null) propToExisting.push(m);
  }
  if (propToExisting.length > 0) {
    var j = PD.rngNextInt(state, propToExisting.length);
    return propToExisting[j];
  }

  var idx = PD.rngNextInt(state, moves.length);
  return moves[idx];
};

PD.debugStep = function () {
  var d = PD.debug;
  if (!d.state) PD.debugReset();
  var state = d.state;
  var moves = PD.legalMoves(state);
  var cmd = PD.debugPickMove(moves);
  if (!cmd) return;

  var res = PD.applyCommand(state, cmd);
  d.lastCmd = cmd.kind;
  d.lastEvents = (res && res.events) ? res.events : [];
};

PD.debugEventsToLine = function (events) {
  if (!events || events.length === 0) return "(none)";
  var parts = [];
  var i;
  for (i = 0; i < events.length; i++) {
    parts.push(events[i].kind);
  }
  return parts.join(",");
};

PD.debugTick = function () {
  var d = PD.debug;
  if (!d.state) PD.debugReset();

  if (typeof btnp === "function") {
    // A: step, B: next scenario, X: reset
    if (btnp(4)) PD.debugStep();
    if (btnp(5)) PD.debugNextScenario();
    if (btnp(6)) PD.debugReset();
  }

  var s = d.state;

  function bankValueTotal(state, p) {
    if (!state || !state.players || !state.players[p]) return 0;
    var bank = state.players[p].bank;
    var sum = 0;
    var i;
    for (i = 0; i < bank.length; i++) {
      var uid = bank[i];
      var def = PD.defByUid(state, uid);
      if (def && def.bankValue) sum += def.bankValue;
    }
    return sum;
  }

  cls(0);
  var x = 6;
  var y = 6;
  var step = 7;

  print("Phase 02 Debug", x, y, 12); y += step;
  print("Scenario: " + d.scenarios[d.scenarioI], x, y, 12); y += step;
  print("Seed: " + (PD.computeSeed() >>> 0), x, y, 12); y += step;

  if (PD.render && PD.render.debug && typeof PD.render.debug.selectedLines === "function") {
    var sel = PD.render.debug.selectedLines(d);
    if (sel && sel.length) {
      print(sel[0] || "", x, y, 12); y += step;
      if (sel[1]) { print(sel[1], x, y, 12); y += step; }
    }
  }

  print("Active: P" + s.activeP + "  Plays: " + s.playsLeft, x, y, 12); y += step;
  var w = s.winnerP;
  if (w !== PD.NO_WINNER) { print("Winner: P" + w, x, y, 11); y += step; }

  print("Deck: " + s.deck.length + "  Discard: " + s.discard.length, x, y, 12); y += step;
  print("Hand P0/P1: " + s.players[0].hand.length + "/" + s.players[1].hand.length, x, y, 12); y += step;
  print(
    "Bank P0/P1: " +
    s.players[0].bank.length + "($" + bankValueTotal(s, 0) + ")/" +
    s.players[1].bank.length + "($" + bankValueTotal(s, 1) + ")",
    x,
    y,
    12
  ); y += step;
  print("Sets P0/P1: " + s.players[0].sets.length + "/" + s.players[1].sets.length, x, y, 12); y += step;

  var moves = PD.legalMoves(s);
  print("Legal moves: " + moves.length, x, y, 12); y += step;
  print("Last cmd: " + (d.lastCmd || "(none)"), x, y, 12); y += step;
  print("Events: " + PD.debugEventsToLine(d.lastEvents), x, y, 12);

  print("A:Step  B:Next  X:Reset  Y:Mode", 6, 128, 13, true, 1, false);
};

PD.mainTick = function () {
  // Modes: 0=DebugText, 1=Render
  if (PD._mainMode == null) PD._mainMode = 0;
  if (typeof btnp === "function" && btnp(7)) PD._mainMode = PD._mainMode ? 0 : 1;

  if (PD._mainMode === 0) {
    PD.debugTick();
    return;
  }

  // Render mode
  if (!PD.debug || !PD.debug.state) PD.debugReset();
  var d = PD.debug;
  if (!d.view && PD.ui && typeof PD.ui.newView === "function") d.view = PD.ui.newView();
  if (!d.ctrl && PD.controls && typeof PD.controls.newState === "function") d.ctrl = PD.controls.newState();

  if (PD.controls && PD.ui && PD.render && typeof PD.render.drawFrame === "function") {
    var raw = PD.controls.pollGlobals();
    var actions = PD.controls.actions(d.ctrl, raw, PD.config.controls);
    var intent = PD.ui.step(d.state, d.view, actions);

    if (intent && intent.kind === "applyCmd" && intent.cmd) {
      try {
        var res = PD.applyCommand(d.state, intent.cmd);
        d.lastCmd = intent.cmd.kind;
        d.lastEvents = (res && res.events) ? res.events : [];
      } catch (err) {
        d.lastCmd = intent.cmd.kind + "(!)";
        d.lastEvents = [];
        var code = (err && err.message) ? String(err.message) : "error";
        // Friendly message is derived from code for now.
        var msg = code;
        if (code === "no_plays_left") msg = "No plays left";
        else if (code === "hand_over_limit") msg = "Hand over limit";
        else if (code === "not_bankable") msg = "Not bankable";
        else if (code === "set_not_complete") msg = "Set not complete";
        else if (code === "set_color_mismatch") msg = "Wrong set color";
        else if (code === "wild_color_illegal") msg = "Wild color illegal";
        else if (code === "no_targets") msg = "No valid destination";
        if (PD.ui && typeof PD.ui.feedbackError === "function") PD.ui.feedbackError(d.view, code, msg);
      }
    } else if (intent && intent.kind === "debug") {
      if (intent.action === "step") PD.debugStep();
      else if (intent.action === "reset") PD.debugReset();
      else if (intent.action === "nextScenario") PD.debugNextScenario();
    }

    var computed = PD.ui.computeRowModels(d.state, d.view);
    PD.ui.updateCameras(d.state, d.view, computed);
    // Recompute after camera updates (selection/cam are orthogonal, but keep it stable).
    computed = PD.ui.computeRowModels(d.state, d.view);

    PD.render.drawFrame({ state: d.state, view: d.view, computed: computed });
  } else {
    cls(0);
    print("Render not loaded", 6, 6, 12);
  }
};

// ---- src/11_render.js ----
PD.render = PD.render || {};

(function initRenderModule() {
  var R = PD.render;

  R.ROW_OP_HAND = 0;
  R.ROW_OP_TABLE = 1;
  R.ROW_CENTER = 2;
  R.ROW_P_TABLE = 3;
  R.ROW_P_HAND = 4;

  var renderCfg = PD.config && PD.config.render;
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

  function faceYForRow(row) {
    if (row === R.ROW_OP_HAND) {
      // Bottom slice visible: cards extend upward off-screen.
      return rowY0(row) + rowH(row) - R.cfg.faceH;
    }
    if (row === R.ROW_OP_TABLE || row === R.ROW_P_TABLE || row === R.ROW_P_HAND) {
      return rowY0(row) + R.cfg.faceInsetY;
    }
    return rowY0(row);
  }

  function isOpponentRow(row) {
    return row === R.ROW_OP_HAND || row === R.ROW_OP_TABLE;
  }

  function playerForRow(row) {
    if (row === R.ROW_OP_HAND || row === R.ROW_OP_TABLE) return 1;
    if (row === R.ROW_P_HAND || row === R.ROW_P_TABLE) return 0;
    return -1;
  }

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

    var i;
    if (!onlySelected) {
      for (i = 0; i < items.length; i++) {
        var it = items[i];
        if (selectedItem && it === selectedItem) continue;
        var xFace = it.x - camX;
        var yFace = it.y;
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
    var def = state ? PD.defByUid(state, uid) : null;
    if (!def) {
      drawCardFaceBase(xFace, yFace, R.cfg.colCardInterior);
      return;
    }

    if (def.kind === PD.CardKind.Property) {
      drawCardFaceBase(xFace, yFace, R.cfg.colCardInterior);
      var payV = def.propertyPayValue != null ? def.propertyPayValue : 0;
      if (PD.isWildDef(def)) {
        // Two halves: top (halfFlip=false), bottom (halfFlip=true). Effective flip is XOR.
        var c0 = def.wildColors[0];
        var c1 = def.wildColors[1];
        var a = (assignedColor == null) ? PD.NO_COLOR : assignedColor;
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

  function bankTotal(state, p) {
    if (!state || !state.players || !state.players[p]) return 0;
    var bank = state.players[p].bank;
    var sum = 0;
    var i;
    for (i = 0; i < bank.length; i++) {
      var uid = bank[i];
      var def = PD.defByUid(state, uid);
      if (def && def.bankValue) sum += def.bankValue;
    }
    return sum;
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
    rectSafe(0, y0, cfg.screenW, y1 - y0 + 1, cfg.colCenterPanel);
    rectbSafe(0, y0, cfg.screenW, y1 - y0 + 1, cfg.colCenterPanelBorder);

    var dbgEnabled = !!(PD.config && PD.config.debug && PD.config.debug.enabled);
    var hlCol = (opts.highlightCol != null) ? opts.highlightCol : cfg.colHighlight;

    // Header: removed (Phase 04). Plays indicator is drawn in screen-space.

    function drawCountDigits(n, xFace, yFace) {
      n = Math.floor(Number(n || 0));
      if (!isFinite(n) || n < 0) n = 0;
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

    function drawDeckAt(xFace, yFace) {
      var n = s.deck.length;
      if (n > 2) {
        drawUnderLayerOutline(xFace, yFace, cfg.pileUnderDx2, cfg.pileUnderDy2);
        drawUnderLayerOutline(xFace, yFace, cfg.pileUnderDx1, cfg.pileUnderDy1);
      } else if (n > 1) {
        drawUnderLayerOutline(xFace, yFace, cfg.pileUnderDx1, cfg.pileUnderDy1);
      }
      drawShadowBar(xFace, yFace);
      drawCardBack(xFace, yFace, false);
      drawCountDigits(n, xFace, yFace);
    }

    function drawDiscardAt(xFace, yFace) {
      var n = s.discard.length;
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

      var topUid = s.discard[n - 1];
      drawShadowBar(xFace, yFace);
      drawMiniCard(s, topUid, xFace, yFace, false);
      drawCountDigits(n, xFace, yFace);
    }

    // Center row items (deck/discard/buttons).
    var rowM = computed.models ? computed.models[row] : null;
    var i;
    if (rowM && rowM.items) {
      for (i = 0; i < rowM.items.length; i++) {
        var it = rowM.items[i];
        if (!it) continue;
        if (it.kind === "deck") drawDeckAt(it.x, it.y);
        else if (it.kind === "discard") drawDiscardAt(it.x, it.y);
        else if (it.kind === "btn") {
          // Flat UI button: dark fill + white text; selected uses highlight fill + black text.
          // Note: debug gating and overlay hiding is handled in PD.ui.computeRowModels.

          var enabled = true;
          if (it.id === "endTurn") {
            enabled = (s.activeP === 0) && (s.players[0].hand.length <= PD.HAND_MAX);
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

    function colorName(c) {
      c = Math.floor(Number(c));
      if (!isFinite(c)) c = 0;
      if (c === PD.Color.Cyan) return "Cyan";
      if (c === PD.Color.Magenta) return "Magenta";
      if (c === PD.Color.Orange) return "Orange";
      if (c === PD.Color.Black) return "Black";
      return "c" + c;
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
            var defT = PD.defByUid(s, topUid);
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
            var defD = PD.defByUid(s, topUid2);
            if (defD && defD.name) discardDesc += "\nTop: " + String(defD.name);
          }
          printExSafe(discardDesc, xDesc, yDesc, cfg.colText, false, 1, true);
          return;
        }
        if (sel.kind === "btn") {
          var title = String(sel.label || sel.id || "");
          printSafe(title, xTitle, yTitle, cfg.colText);
          var help = "";
          if (sel.id === "endTurn") help = "End your turn.\nHand must be <= 7.";
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
      var def = PD.defByUid(s, uid);
      if (!def) return;

      // Opponent hand is hidden unless debug enabled.
      if (!dbgEnabled && sel.row === R.ROW_OP_HAND) {
        printSafe("Opponent card", xTitle, yTitle, cfg.colText);
        printExSafe("(hidden)", xDesc, yDesc, cfg.colText, false, 1, false);
        return;
      }

      function valueForDef(def) {
        if (!def) return null;
        if (def.kind === PD.CardKind.Property) {
          if (def.propertyPayValue != null) return def.propertyPayValue;
          return 0;
        }
        if (def.bankValue != null) return def.bankValue;
        return null;
      }

      function inspectTitleForDef(def) {
        var t = def.name ? String(def.name) : (def.id ? String(def.id) : "");
        return t;
      }

      function inspectDescForDef(def, selColor) {
        var base = def && def.desc ? String(def.desc) : "";
        base = appendRuleNotes(def, base);
        var v = valueForDef(def);
        var vLine = (v != null && v > 0) ? ("Value: $" + String(v)) : "";
        var usedAs = "";
        if (def && PD.isWildDef && typeof PD.isWildDef === "function" && PD.isWildDef(def)) {
          var c = Math.floor(Number(selColor));
          if (isFinite(c) && c !== PD.NO_COLOR && def.wildColors && (c === def.wildColors[0] || c === def.wildColors[1])) {
            usedAs = "Currently used as: " + colorName(c);
          }
        }

        var out = "";
        if (vLine) out = vLine;
        if (usedAs) out = out ? (out + "\n" + usedAs) : usedAs;
        if (base) out = out ? (out + "\n" + base) : base;
        return out;
      }

      function appendRuleNotes(def, baseDesc) {
        baseDesc = baseDesc ? String(baseDesc) : "";
        if (!def || !def.ruleNotes || def.ruleNotes.length === 0) return baseDesc;
        var enabled = (PD.config && PD.config.rules && PD.config.rules.enabledRuleNotes) ? PD.config.rules.enabledRuleNotes : [];
        if (!enabled || enabled.length === 0) return baseDesc;

        var out = baseDesc;
        var i;
        for (i = 0; i < def.ruleNotes.length; i++) {
          var id = def.ruleNotes[i];
          var j;
          var on = false;
          for (j = 0; j < enabled.length; j++) if ((enabled[j] | 0) === (id | 0)) { on = true; break; }
          if (!on) continue;
          var txt = (PD.ruleNoteTextById && PD.ruleNoteTextById[id | 0]) ? String(PD.ruleNoteTextById[id | 0]) : "";
          if (!txt) continue;
          if (out) out += "\n";
          out += txt;
        }
        return out;
      }

      drawMiniCard(s, uid, xPrev, yPrev, false, sel.color);
      printSafe(inspectTitleForDef(def), xTitle, yTitle, cfg.colText);
      var desc = inspectDescForDef(def, sel.color);
      printExSafe(desc, xDesc, yDesc, cfg.colText, false, 1, true);
    }

    function drawMenuOverlay() {
      var src = view.menu && view.menu.src ? view.menu.src : null;
      if (src && src.uid) drawMiniCard(s, src.uid, xPrev, yPrev, false);
      printSafe("Menu", xTitle, yTitle, cfg.colText);
      var items = (view.menu && view.menu.items) ? view.menu.items : [];
      var selI = (view.menu && view.menu.i != null) ? Math.floor(Number(view.menu.i)) : 0;
      if (!isFinite(selI)) selI = 0;
      var j;
      var y = yDesc;
      // Backing box so the menu is unmistakable.
      var boxX = xDesc - 2;
      var boxY = y - 2;
      var boxW = cfg.screenW - boxX - cfg.rowPadX;
      var boxH = (items.length * 7 + 12);
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
      printSafe("A:Select  B:Back", xDesc, y1 - 8, cfg.colText);
    }

    function drawTargetingOverlay() {
      var t = view.targeting;
      if (!t || !t.active) return;
      if (t.card && t.card.uid) drawMiniCard(s, t.card.uid, xPrev, yPrev, false, (t.wildColor !== PD.NO_COLOR) ? t.wildColor : null);

      var title = (t.kind === "build") ? "Build" : ((t.kind === "place") ? "Place" : "Bank");
      printSafe(title, xTitle, yTitle, cfg.colText);

      var cmdI = Math.floor(Number(t.cmdI || 0));
      if (!isFinite(cmdI)) cmdI = 0;
      var cmd = (t.cmds && t.cmds.length) ? t.cmds[cmdI % t.cmds.length] : null;
      var destLine = "";
      if (cmd && cmd.kind === "playProp") {
        if (cmd.dest && cmd.dest.newSet) destLine = "Dest: New set";
        else if (cmd.dest && cmd.dest.setI != null) {
          var setI = Math.floor(Number(cmd.dest.setI));
          var set = isFinite(setI) ? s.players[0].sets[setI] : null;
          var col = set ? PD.getSetColor(set.props) : PD.NO_COLOR;
          destLine = "Dest: " + colorName(col) + " set";
        }
        if (t.card && t.card.def && PD.isWildDef(t.card.def)) destLine += "\nAs: " + colorName(t.wildColor);
      } else if (cmd && cmd.kind === "playHouse") {
        var setI2 = Math.floor(Number(cmd.dest.setI));
        var set2 = isFinite(setI2) ? s.players[0].sets[setI2] : null;
        var col2 = set2 ? PD.getSetColor(set2.props) : PD.NO_COLOR;
        destLine = "Dest: " + colorName(col2) + " set";
      } else if (cmd && cmd.kind === "bank") {
        destLine = "Dest: Bank";
      } else {
        destLine = "(no destination)";
      }
      // Backing box so targeting is unmistakable.
      var boxX = xDesc - 2;
      var boxY = yDesc - 2;
      var boxW = cfg.screenW - boxX - cfg.rowPadX;
      var boxH = 30;
      rectSafe(boxX, boxY, boxW, boxH, PD.Pal.Black);
      rectbSafe(boxX, boxY, boxW, boxH, cfg.colCenterPanelBorder);

      printExSafe(destLine, xDesc, yDesc, cfg.colText, false, 1, false);

      var help = "L/R: Dest";
      if (t.card && t.card.def && PD.isWildDef(t.card.def)) help += "  U/D: Color";
      help += t.hold ? "\nRelease A: Drop  B:Cancel" : "\nA:Confirm  B:Cancel";
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
    if (playsLeft == null) playsLeft = 0;
    playsLeft = Math.floor(Number(playsLeft));
    if (!isFinite(playsLeft)) playsLeft = 0;
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
    var dbgEnabled = !!(PD.config && PD.config.debug && PD.config.debug.enabled);
    if (!dbgEnabled) return;
    if (!view || view.mode !== "browse" || view.inspectActive) return;
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
    printSafe("Phase 04", x, yPhase, cfg.hudLineCol);
    printSafe("Y:Mode", x, y, cfg.hudLineCol);
  }

  function drawToast(view) {
    var cfg = R.cfg;
    if (!view || !view.feedback || !view.feedback.msg || view.feedback.msgFrames <= 0) return;
    var msg = String(view.feedback.msg);
    if (!msg) return;

    // Support 1–2 lines.
    var parts = msg.split("\n");
    if (parts.length > 2) parts = [parts[0], parts[1]];
    var maxLen = 0;
    var i;
    for (i = 0; i < parts.length; i++) if (parts[i].length > maxLen) maxLen = parts[i].length;

    var charW = 6;
    var lineH = 7;
    var padX = 6;
    var padY = 4;
    var iconW = 10; // space for red X
    var boxW = (padX * 2) + iconW + maxLen * charW;
    if (boxW > cfg.screenW - 8) boxW = cfg.screenW - 8;
    var boxH = (padY * 2) + parts.length * lineH;

    var x0 = Math.floor((cfg.screenW - boxW) / 2);
    var y0 = 2;

    rectSafe(x0, y0, boxW, boxH, PD.Pal.Black);
    rectbSafe(x0, y0, boxW, boxH, cfg.colCenterPanelBorder);

    printSafe("X", x0 + 4, y0 + padY, PD.Pal.Red);
    for (i = 0; i < parts.length; i++) {
      printSafe(parts[i], x0 + padX + iconW, y0 + padY + i * lineH, cfg.colText);
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
        lines.push("Total:" + bankTotal(s, 0));
      } else if (k === "bank1") {
        lines.push("Sel:B1");
        lines.push("Total:" + bankTotal(s, 1));
      } else {
        lines.push("Sel:" + String(k || "?"));
        lines.push("");
      }
    } else if (selectedItem && selectedItem.uid) {
      var uid = selectedItem.uid;
      var def = PD.defByUid(s, uid);
      var defId = def ? def.id : "?";
      lines.push("Sel:" + defId + " uid:" + uid);

      var detail = "";
      if (def && def.kind === PD.CardKind.Property) {
        if (PD.isWildDef(def)) {
          detail = "Wild:" + def.wildColors[0] + "/" + def.wildColors[1];
          if (selectedItem && selectedItem.color != null && selectedItem.color !== PD.NO_COLOR) {
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

  function drawRowCards(state, rowModel, row, selected, cam, highlightCol) {
    var cfg = R.cfg;
    if (cam == null) cam = 0;
    if (highlightCol == null) highlightCol = cfg.colHighlight;
    var flipCards = isOpponentRow(row);
    var i;

    if (row === R.ROW_OP_TABLE || row === R.ROW_P_TABLE) {
      // Table rows must be drawn by stack depth (bottom->top), not x-order,
      // otherwise fan-left stacks layer incorrectly.
      var grouped = groupStacksByKey(rowModel.items, cam);
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
    var groupedH = groupStacksByKey(rowModel.items, cam);
    var byKeyH = groupedH.byKey;
    var keysH = groupedH.keys;

    // Draw non-bank hand items in x-order first.
    for (i = 0; i < rowModel.items.length; i++) {
      var it = rowModel.items[i];
      if (!it || it.stackKey) continue;
      if (selected && it === selected) continue;
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
      drawFannedStack(stack0, { state: state, fanDir: fanDirB, flip180: !!flipBank, camX: cam, selectedItem: selInThis, drawSelected: false, highlightCol: highlightCol });
    }

    if (selected) {
      var xs = selected.x - cam;
      var ys = selected.y;
      if (row === R.ROW_OP_HAND) {
        if (selected.stackKey) {
          var sFanO = (selected.fanDir != null) ? selected.fanDir : -1;
          var stackO = byKeyH[String(selected.stackKey)] || [selected];
          drawFannedStack(stackO, { state: state, fanDir: sFanO, flip180: true, camX: cam, selectedItem: selected, onlySelected: true, highlightCol: highlightCol });
        } else {
          drawShadowBar(xs, ys);
          drawCardBack(xs, ys, true);
          drawHighlight(xs, ys, highlightCol);
        }
      } else if (row === R.ROW_P_HAND) {
        if (selected.stackKey) {
          var sFanP = (selected.fanDir != null) ? selected.fanDir : 1;
          var stackP = byKeyH[String(selected.stackKey)] || [selected];
          drawFannedStack(stackP, { state: state, fanDir: sFanP, flip180: false, camX: cam, selectedItem: selected, onlySelected: true, highlightCol: highlightCol });
        } else {
          drawShadowBar(xs, ys);
          drawMiniCard(state, selected.uid, xs, ys, !!flipCards);
          drawHighlight(xs, ys, highlightCol);
        }
      }
    }
  }

  R.debug = R.debug || {};

  // DebugText support: summarize current Render selection without drawing.
  R.debug.selectedLines = function (debug) {
    if (!debug || !debug.state) return ["Sel:(none)", ""];
    var it = null;
    if (debug.view && PD.ui && typeof PD.ui.computeRowModels === "function") {
      var computed = PD.ui.computeRowModels(debug.state, debug.view);
      it = computed ? computed.selected : null;
    }
    if (!it) return ["Sel:(none)", ""];

    function colorName(c) {
      c = Math.floor(Number(c));
      if (!isFinite(c)) c = 0;
      if (c === PD.Color.Cyan) return "Cyan";
      if (c === PD.Color.Magenta) return "Magenta";
      if (c === PD.Color.Orange) return "Orange";
      if (c === PD.Color.Black) return "Black";
      return "c" + c;
    }

    if (it.row === R.ROW_CENTER) {
      if (it.kind === "deck") return ["Sel:Deck", "Cards:" + debug.state.deck.length];
      if (it.kind === "discard") return ["Sel:Discard", "Cards:" + debug.state.discard.length];
      return ["Sel:" + String(it.kind || "?"), ""];
    }

    if (it.uid) {
      var uid = it.uid;
      var def = PD.defByUid(debug.state, uid);
      var defId = def ? def.id : "?";
      var line2 = (def && def.name) ? def.name : "";

      if (def && def.kind === PD.CardKind.Property) {
        if (PD.isWildDef(def)) {
          var c0 = def.wildColors[0];
          var c1 = def.wildColors[1];
          line2 = "Wild:" + colorName(c0) + "/" + colorName(c1);
          if (it.color != null && it.color !== PD.NO_COLOR) {
            line2 += " As:" + colorName(it.color);
          }
        } else {
          line2 = "Prop:" + colorName(def.propertyColor);
        }
      }

      return ["Sel:" + defId + " uid:" + uid, line2];
    }

    return ["Sel:" + String(it.kind || "?"), ""];
  };

  function highlightColFromView(view) {
    var cfg = R.cfg;
    if (!view || !view.feedback) return cfg.colHighlight;
    var fb = view.feedback;
    if (fb.blinkFrames <= 0) return cfg.colHighlight;
    // Blink red on alternating phases.
    if ((fb.blinkPhase % 2) === 0) return PD.Pal.Red;
    return cfg.colHighlight;
  }

  function drawGhostOutlines(ghosts, camX) {
    if (!ghosts || ghosts.length === 0) return;
    var L = R.cfg;
    var col = PD.Pal.Green;
    var shadowCol = PD.Pal.Black;
    var i;
    for (i = 0; i < ghosts.length; i++) {
      var g = ghosts[i];
      if (!g) continue;
      var x = g.x - camX;
      var y = g.y;
      // Shadow outline up-left.
      rectbSafe(x - 1, y - 1, L.faceW, L.faceH, shadowCol);
      rectbSafe(x, y, L.faceW, L.faceH, col);
    }
  }

  function drawPreviewOverlay(state, preview, camX, highlightCol) {
    if (!preview || !preview.uid) return;
    var x = preview.x - camX;
    var y = preview.y;
    drawFannedShadowBar(x, y, 1);
    drawMiniCard(state, preview.uid, x, y, false, preview.color);
    drawHighlight(x, y, highlightCol);
  }

  function selectedFromModels(view, models) {
    if (!view || !view.cursor || !models) return null;
    var row = Math.floor(Number(view.cursor.row || 0));
    if (!isFinite(row)) row = 0;
    if (row < 0) row = 0;
    if (row > 4) row = 4;
    var rm = models[row];
    if (!rm || !rm.items || rm.items.length === 0) return null;
    var i = Math.floor(Number(view.cursor.i || 0));
    if (!isFinite(i)) i = 0;
    if (i < 0) i = 0;
    if (i >= rm.items.length) i = rm.items.length - 1;
    return rm.items[i];
  }

  R.drawFrame = function (args) {
    if (!args) return;
    var state = args.state || (args.debug && args.debug.state) || args.state;
    var view = args.view || (args.debug && args.debug.view) || args.view;
    if (!state || !view) return;

    var computed = args.computed;
    if (!computed && PD.ui && typeof PD.ui.computeRowModels === "function") {
      computed = PD.ui.computeRowModels(state, view);
    }
    if (!computed || !computed.models) return;

    var models = computed.models;
    var sel = selectedFromModels(view, models);

    var cfg = R.cfg;
    var hlCol = highlightColFromView(view);

    // Clear background.
    cls(cfg.colBg);

    // Draw non-center rows.
    var row;
    for (row = 0; row < 5; row++) {
      if (row === R.ROW_CENTER) continue;
      var rm = models[row];
      if (!rm || !rm.items) continue;
      var cam = (view.camX && view.camX[row] != null) ? view.camX[row] : 0;
      var selected = (view.cursor.row === row) ? sel : null;
      drawRowCards(state, rm, row, selected, cam, hlCol);
    }

    // Targeting overlays (ghosts + preview).
    if (view.mode === "targeting") {
      var ghosts = args.ghosts || computed.ghosts || [];
      // Skip the selected destination ghost: preview replaces it.
      if (view.targeting && view.targeting.active) {
        var filtered = [];
        var gi;
        for (gi = 0; gi < ghosts.length; gi++) {
          var g = ghosts[gi];
          if (!g) continue;
          if (g.cmdI === view.targeting.cmdI) continue;
          filtered.push(g);
        }
        ghosts = filtered;
      }

      // Draw ghosts using their row camera (future-proofing).
      var gByRow = [[], [], [], [], []];
      var gi2;
      for (gi2 = 0; gi2 < ghosts.length; gi2++) {
        var gg = ghosts[gi2];
        if (!gg) continue;
        var rr = (gg.row != null) ? gg.row : R.ROW_P_TABLE;
        if (rr < 0 || rr > 4) rr = R.ROW_P_TABLE;
        gByRow[rr].push(gg);
      }
      var rr2;
      for (rr2 = 0; rr2 < 5; rr2++) {
        if (!gByRow[rr2] || gByRow[rr2].length === 0) continue;
        var camG = (view.camX && view.camX[rr2] != null) ? view.camX[rr2] : 0;
        drawGhostOutlines(gByRow[rr2], camG);
      }

      var preview = args.preview || computed.preview;
      if (preview) {
        var prow = (preview.row != null) ? preview.row : R.ROW_P_TABLE;
        if (prow < 0 || prow > 4) prow = R.ROW_P_TABLE;
        var camP = (view.camX && view.camX[prow] != null) ? view.camX[prow] : 0;
        drawPreviewOverlay(state, preview, camP, hlCol);
      }
    }

    // Center panel last (so text overlays are readable).
    drawCenter({ state: state, view: view, computed: computed, selected: sel, highlightCol: hlCol });

    // Highlight center widgets if selected.
    if (view.cursor.row === R.ROW_CENTER && sel) {
      rectbSafe(sel.x - 1, sel.y - 1, sel.w + 2, sel.h + 2, hlCol);
    }

    // HUD / UX chrome (draw last).
    drawPlaysPips(state);
    drawModeHintNearButtons(view, computed);
    drawToast(view);
  };
})();

// ---- src/12_ui.js ----
PD.ui = PD.ui || {};

PD.ui.newView = function () {
  return {
    // View-only state (cursor/camera/menu focus). This is intentionally not part of GameState.
    cursor: { row: 4, i: 0 }, // default to player hand
    camX: [0, 0, 0, 0, 0],

    // browse | menu | targeting
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
      wildColor: PD.NO_COLOR,
      // list of concrete engine commands (subset of PD.legalMoves)
      cmds: [],
      cmdI: 0
    },

    // Inspect (hold X with delay)
    inspectActive: false,

    // Feedback: blink + message, plus attempt counts.
    feedback: {
      blinkFrames: 0,
      blinkPhase: 0,
      msg: "",
      msgFrames: 0,
      attemptsByCode: {}
    },

    // Small UX memory (used for one-shot nudges like snapping to End when out of plays).
    ux: {
      lastActiveP: null,
      lastPlaysLeft: null
    }
  };
};

PD.ui.feedbackError = function (view, code, msg) {
  if (!view || !view.feedback) return;
  code = String(code || "error");
  msg = String(msg || "");

  var fb = view.feedback;
  var attempts = fb.attemptsByCode[code] || 0;
  attempts += 1;
  fb.attemptsByCode[code] = attempts;

  // Always blink; only show message on repeated attempts.
  fb.blinkFrames = 18;
  fb.blinkPhase = 0;

  if (attempts >= 2 && msg) {
    fb.msg = msg;
    fb.msgFrames = 90;
  }
};

PD.ui.feedbackTick = function (view) {
  if (!view || !view.feedback) return;
  var fb = view.feedback;

  var blinkFrames = Number(fb.blinkFrames || 0);
  if (!isFinite(blinkFrames)) blinkFrames = 0;
  if (blinkFrames > 0) {
    blinkFrames = blinkFrames - 1;
    fb.blinkFrames = blinkFrames;
    // 2 blinks: toggle every 3 frames.
    fb.blinkPhase = Math.floor(blinkFrames / 3);
  } else {
    fb.blinkFrames = 0;
    fb.blinkPhase = 0;
  }

  var msgFrames = Number(fb.msgFrames || 0);
  if (!isFinite(msgFrames)) msgFrames = 0;
  if (msgFrames > 0) fb.msgFrames = msgFrames - 1;
  else { fb.msgFrames = 0; fb.msg = ""; }
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

// Pick the first item matching a predicate from the given row order.
// Returns { row, i, item } or null.
PD.ui.findBestCursorTarget = function (models, rowOrder, predicate) {
  if (!models) return null;
  rowOrder = rowOrder || [0, 1, 2, 3, 4];
  predicate = predicate || function () { return true; };

  var ri;
  for (ri = 0; ri < rowOrder.length; ri++) {
    var row = Math.floor(Number(rowOrder[ri]));
    if (!isFinite(row)) continue;
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
  xCenter = Number(xCenter || 0);
  if (!isFinite(xCenter)) xCenter = 0;
  var i;
  for (i = 0; i < items.length; i++) {
    var it = items[i];
    var x = (it && it.x != null) ? Number(it.x) : 0;
    var w = (it && it.w != null) ? Number(it.w) : 0;
    if (!isFinite(x)) x = 0;
    if (!isFinite(w)) w = 0;
    var cx = x + (w / 2);
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
  var cam = (view && view.camX && view.camX[row] != null) ? view.camX[row] : 0;
  var x = (item.x || 0) - (cam || 0);
  var y = item.y || 0;
  var w = item.w || 0;
  var h = item.h || 0;
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

PD.ui.rowY0 = function (row) {
  var i = Math.floor(Number(row || 0));
  if (!isFinite(i)) i = 0;
  return PD.config.render.layout.rowY[i];
};
PD.ui.rowH = function (row) {
  var i = Math.floor(Number(row || 0));
  if (!isFinite(i)) i = 0;
  return PD.config.render.layout.rowH[i];
};

PD.ui.faceYForRow = function (row) {
  var L = PD.config.render.layout;
  row = Math.floor(Number(row || 0));
  if (!isFinite(row)) row = 0;
  if (row === 0) {
    // Opponent hand: bottom slice visible; cards extend upward off-screen.
    return L.rowY[0] + L.rowH[0] - L.faceH;
  }
  if (row === 1 || row === 3 || row === 4) {
    return L.rowY[row] + L.faceInsetY;
  }
  return L.rowY[row];
};

PD.ui.isOpponentRow = function (row) {
  row = Math.floor(Number(row || 0));
  if (!isFinite(row)) row = 0;
  return row === 0 || row === 1;
};

PD.ui.playerForRow = function (row) {
  row = Math.floor(Number(row || 0));
  if (!isFinite(row)) row = 0;
  if (row === 0 || row === 1) return 1;
  if (row === 3 || row === 4) return 0;
  return -1;
};

PD.ui.buildRowItems = function (state, view, row) {
  var L = PD.config.render.layout;
  row = Math.floor(Number(row || 0));
  if (!isFinite(row)) row = 0;

  var out = { items: [], minX: 0, maxX: 0 };
  var isOp = PD.ui.isOpponentRow(row);
  var p = PD.ui.playerForRow(row);
  var yFace = PD.ui.faceYForRow(row);
  var padX = L.rowPadX;

  var i;

  if (row === 4 || row === 0) {
    // Hand row: hand cards + bank stack on opposite side.
    var hand = state.players[p].hand;
    var bank = state.players[p].bank;
    var nHand = hand.length;
    var nBank = bank.length;
    var minX = 999999, maxX = -999999;

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
        loc: (kind === "hand") ? { p: p, zone: "hand", i: depth } : null,
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

    // Hand zone (spaced).
    var xHandStart = isOp ? (L.screenW - padX - L.faceW) : padX;
    var handStep = isOp ? (-L.handStrideX) : L.handStrideX;
    for (i = 0; i < nHand; i++) {
      pushHandRowItem("hand", hand[i], xHandStart + i * handStep, i, 0);
    }

    // Bank zone (overlapped stack), opposite side.
    var stride = L.stackStrideX;
    var gap = L.stackGapX;

    if (!isOp) {
      // Player bank: fan right, anchored on the right.
      var bankRightX = L.screenW - padX - L.faceW;
      var bankLeftX = bankRightX - (nBank > 0 ? ((nBank - 1) * stride) : 0);
      var handMaxX = (nHand > 0) ? (padX + (nHand - 1) * L.handStrideX + L.faceW - 1) : (padX - 1);
      if (nBank > 0 && bankLeftX <= (handMaxX + gap)) bankLeftX = handMaxX + gap + 1;
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

    if (!isOp) {
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
            stackKey: "set:p" + p + ":set" + i,
            x: xFaceP,
            y: yFace,
            w: L.faceW,
            h: L.faceH
          });
          var xLoP = xFaceP;
          var xHiP = xFaceP + L.faceW - 1;
          if (fanDir > 0) xLoP = xFaceP + L.shadowBarDx;
          else xHiP = xFaceP + L.faceW;
          if (xLoP < minX2) minX2 = xLoP;
          if (xHiP > maxX2) maxX2 = xHiP;
        }

        var stackW = L.faceW + (nCards - 1) * stride2;
        cursorX = cursorX + stackW + L.stackGapX;
      }
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
            stackKey: "set:p" + p + ":set" + i,
            x: xFaceO,
            y: yFace,
            w: L.faceW,
            h: L.faceH
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

    var dbgEnabled = !!(PD.config && PD.config.debug && PD.config.debug.enabled);

    // Hide buttons while an overlay is active (menu/targeting).
    // Inspect should keep buttons visible/selectable so they can be inspected too.
    var overlayActive = !!(view && (view.mode === "menu" || view.mode === "targeting"));
    if (!overlayActive) {
      // Right-side vertical strip: 4*10px = 40px tall, fits inside center row.
      var stripW = C.centerBtnStripW;
      var stripH = 10;
      var stripX = C.screenW - C.centerBtnStripPadRight - stripW;
      // Bottom-align within the center row band.
      var stripY0 = (C.rowY[2] + C.rowH[2] - 1 - 40);

      function pushBtn(id, label, y, disabled) {
        out.items.push({ kind: "btn", id: id, label: label, disabled: !!disabled, row: 2, x: stripX, y: y, w: stripW, h: stripH });
      }

      var endDisabled = (state.winnerP !== PD.NO_WINNER) || (state.activeP !== 0) || (state.players[0].hand.length > PD.HAND_MAX);
      pushBtn("endTurn", "End", stripY0, endDisabled);
      if (dbgEnabled) {
        pushBtn("step", "Step", stripY0 + 10, false);
        pushBtn("reset", "Reset", stripY0 + 20, false);
        pushBtn("nextScenario", "Next", stripY0 + 30, false);
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
  var models = [
    PD.ui.buildRowItems(state, view, 0),
    PD.ui.buildRowItems(state, view, 1),
    PD.ui.buildRowItems(state, view, 2),
    PD.ui.buildRowItems(state, view, 3),
    PD.ui.buildRowItems(state, view, 4)
  ];

  // Clamp cursor to existing rows/items.
  if (!view || !view.cursor) return { models: models, selected: null, ghosts: [], preview: null };
  var row = Math.floor(Number(view.cursor.row || 0));
  if (!isFinite(row)) row = 0;
  if (row < 0) row = 0;
  if (row > 4) row = 4;
  view.cursor.row = row;

  var rm = models[row];
  var n = (rm && rm.items) ? rm.items.length : 0;
  var curI = Math.floor(Number(view.cursor.i || 0));
  if (!isFinite(curI)) curI = 0;
  view.cursor.i = PD.ui.clampI(curI, n);

  var sel = (rm && rm.items && rm.items.length) ? rm.items[view.cursor.i] : null;

  // If the cursor is on an empty row (common in scenarios like winCheck where hand is empty),
  // relocate to the first row that has at least 1 selectable item so navigation is never "stuck".
  if (!sel) {
    var pick = PD.ui.findBestCursorTarget(models, [4, 3, 2, 1, 0], function () { return true; });
    if (pick) {
      PD.ui.cursorMoveTo(view, pick);
      rm = models[pick.row];
      sel = pick.item;
    }
  }

  // Targeting overlays: ghosts + preview-in-stack for the selected destination.
  var ghosts = [];
  var preview = null;

  if (view.mode === "targeting" && view.targeting && view.targeting.active) {
    var t = view.targeting;
    var cmds = t.cmds || [];
    var cmdI = PD.ui.clampI(Math.floor(Number(t.cmdI || 0)), cmds.length);
    t.cmdI = cmdI;

    // Build per-set origin positions for P0 table (row 3), and a new-set slot.
    var L = PD.config.render.layout;
    var yFace = PD.ui.faceYForRow(3);
    var stride = L.stackStrideX;
    var cursorX = L.rowPadX;
    var sets = state.players[0].sets;
    var setXs = [];
    var setCardsN = [];
    var si;
    for (si = 0; si < sets.length; si++) {
      var set = sets[si];
      if (!set) { setXs[si] = cursorX; setCardsN[si] = 0; continue; }
      var nCards = (set.props ? set.props.length : 0) + (set.houseUid ? 1 : 0);
      setXs[si] = cursorX;
      setCardsN[si] = nCards;
      if (nCards > 0) cursorX = cursorX + L.faceW + (nCards - 1) * stride + L.stackGapX;
      else cursorX = cursorX + L.faceW + L.stackGapX;
    }
    var newSetX = cursorX;

    // Ghosts for all legal destinations in this targeting mode.
    var j;
    for (j = 0; j < cmds.length; j++) {
      var c = cmds[j];
      if (!c || !c.kind) continue;
      var x = 0;
      if (c.kind === "playProp") {
        if (c.dest && c.dest.newSet) x = newSetX;
        else if (c.dest && c.dest.setI != null) {
          var sI = Math.floor(Number(c.dest.setI));
          if (!isFinite(sI)) continue;
          var baseX = (setXs[sI] != null) ? setXs[sI] : 0;
          var nBase = (setCardsN[sI] != null) ? setCardsN[sI] : 0;
          x = baseX + nBase * stride;
        }
      } else if (c.kind === "playHouse") {
        if (c.dest && c.dest.setI != null) {
          var hsI = Math.floor(Number(c.dest.setI));
          if (!isFinite(hsI)) continue;
          var hBaseX = (setXs[hsI] != null) ? setXs[hsI] : 0;
          var hnBase = (setCardsN[hsI] != null) ? setCardsN[hsI] : 0;
          x = hBaseX + hnBase * stride;
        }
      } else if (c.kind === "bank") {
        // No ghost for banking.
        continue;
      } else {
        continue;
      }

      ghosts.push({ row: 3, x: x, y: yFace, w: L.faceW, h: L.faceH, kind: "ghostDest", cmdI: j });
    }

    // Preview-in-stack for selected destination.
    var cmdSel = cmds[cmdI];
    if (cmdSel && (cmdSel.kind === "playProp" || cmdSel.kind === "playHouse")) {
      var xP = 0;
      if (cmdSel.kind === "playProp") {
        if (cmdSel.dest && cmdSel.dest.newSet) xP = newSetX;
        else if (cmdSel.dest && cmdSel.dest.setI != null) {
          var psI = Math.floor(Number(cmdSel.dest.setI));
          if (isFinite(psI)) {
            xP = ((setXs[psI] != null) ? setXs[psI] : 0) + (((setCardsN[psI] != null) ? setCardsN[psI] : 0) * stride);
          }
        }
      } else if (cmdSel.kind === "playHouse") {
        var bsI = Math.floor(Number(cmdSel.dest.setI));
        if (isFinite(bsI)) {
          xP = ((setXs[bsI] != null) ? setXs[bsI] : 0) + (((setCardsN[bsI] != null) ? setCardsN[bsI] : 0) * stride);
        }
      }
      preview = {
        row: 3,
        kind: "preview",
        uid: (t.card && t.card.uid) ? t.card.uid : 0,
        color: (cmdSel.kind === "playProp" && t.card && t.card.def && PD.isWildDef(t.card.def)) ? t.wildColor : null,
        x: xP,
        y: yFace,
        w: L.faceW,
        h: L.faceH
      };
    } else if (cmdSel && cmdSel.kind === "bank") {
      // Preview into the bank stack destination (player hand row, bank zone).
      // Compute bank drop position using the same layout rules as buildRowItems(row=4),
      // approximating the post-drop layout (hand -1, bank +1).
      var Lh = PD.config.render.layout;
      var yB = PD.ui.faceYForRow(4);
      var padX = Lh.rowPadX;
      var bankRightX = Lh.screenW - padX - Lh.faceW;
      var strideB = Lh.stackStrideX;
      var gapB = Lh.stackGapX;

      var hand0 = state.players[0].hand || [];
      var bank0 = state.players[0].bank || [];
      var nHandAfter = hand0.length - 1;
      if (nHandAfter < 0) nHandAfter = 0;
      var nBankAfter = bank0.length + 1;

      var handMaxX = (nHandAfter > 0) ? (padX + (nHandAfter - 1) * Lh.handStrideX + Lh.faceW - 1) : (padX - 1);
      var bankLeftX = bankRightX - ((nBankAfter > 0) ? ((nBankAfter - 1) * strideB) : 0);
      if (nBankAfter > 0 && bankLeftX <= (handMaxX + gapB)) bankLeftX = handMaxX + gapB + 1;

      var xB = bankLeftX + (nBankAfter - 1) * strideB;
      preview = { row: 4, kind: "preview", uid: (t.card && t.card.uid) ? t.card.uid : 0, color: null, x: xB, y: yB, w: Lh.faceW, h: Lh.faceH };
    }
  }

  return { models: models, selected: sel, ghosts: ghosts, preview: preview };
};

PD.ui.ensureCamForSelection = function (rowModel, row, selItem, camArr) {
  var L = PD.config.render.layout;
  row = Math.floor(Number(row || 0));
  if (!isFinite(row)) row = 0;
  if (!camArr) return;

  var cam = (camArr[row] != null) ? Number(camArr[row]) : 0;
  if (!isFinite(cam)) cam = 0;
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

    // In targeting mode, have the preview destination row camera follow the preview.
    if (view.mode === "targeting" && computed.preview && row === computed.preview.row) selItem = computed.preview;

    PD.ui.ensureCamForSelection(models[row], row, selItem, view.camX);
  }
};

PD.ui.menuOpenForSelection = function (state, view, sel) {
  if (!view || !view.menu) return;
  view.menu.items = [];
  view.menu.i = 0;
  view.menu.src = sel ? { row: sel.row, i: view.cursor.i, uid: sel.uid, loc: sel.loc || null } : null;

  if (!sel || !sel.loc || sel.loc.zone !== "hand") return;
  if (sel.loc.p !== 0) return;

  var uid = sel.uid;
  var def = PD.defByUid(state, uid);
  if (!def) return;

  // Build/Place actions are only meaningful for the currently implemented rules.
  if (def.kind === PD.CardKind.Property) {
    view.menu.items.push({ id: "place", label: "Place" });
  }
  if (def.kind === PD.CardKind.House) {
    // Only offer Build if legal.
    var moves = PD.legalMoves(state);
    var hasBuild = false;
    var m;
    for (m = 0; m < moves.length; m++) {
      var mv = moves[m];
      if (mv && mv.kind === "playHouse" && mv.card && mv.card.uid === uid) { hasBuild = true; break; }
    }
    if (hasBuild) view.menu.items.push({ id: "build", label: "Build" });
  }
  if (PD.isBankableDef(def)) {
    view.menu.items.push({ id: "bank", label: "Bank" });
  }

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

  var def = PD.defByUid(state, uid);
  t.card = { uid: uid, loc: loc || null, def: def || null };

  var moves = PD.legalMoves(state);
  var cmds = [];
  var i;

  if (t.kind === "bank") {
    for (i = 0; i < moves.length; i++) {
      var mb = moves[i];
      if (!mb || mb.kind !== "bank") continue;
      if (!mb.card || mb.card.uid !== uid) continue;
      cmds.push(mb);
    }
    t.cmds = cmds;
    t.cmdI = 0;
    view.mode = "targeting";
    return;
  }

  if (t.kind === "build") {
    for (i = 0; i < moves.length; i++) {
      var mh = moves[i];
      if (!mh || mh.kind !== "playHouse") continue;
      if (!mh.card || mh.card.uid !== uid) continue;
      cmds.push(mh);
    }
    t.cmds = cmds;
    t.cmdI = 0;
    view.mode = "targeting";
    return;
  }

  if (t.kind === "place") {
    if (def && PD.isWildDef(def)) {
      // Default wild color: prefer a color that has an existing-set destination.
      var c0 = def.wildColors[0];
      var c1 = def.wildColors[1];
      var has0 = false, has1 = false;
      for (i = 0; i < moves.length; i++) {
        var mp = moves[i];
        if (!mp || mp.kind !== "playProp") continue;
        if (!mp.card || mp.card.uid !== uid) continue;
        if (mp.color === c0 && mp.dest && mp.dest.setI != null) has0 = true;
        if (mp.color === c1 && mp.dest && mp.dest.setI != null) has1 = true;
      }
      t.wildColor = has0 ? c0 : (has1 ? c1 : c0);
      for (i = 0; i < moves.length; i++) {
        var mw = moves[i];
        if (!mw || mw.kind !== "playProp") continue;
        if (!mw.card || mw.card.uid !== uid) continue;
        if (mw.color !== t.wildColor) continue;
        cmds.push(mw);
      }
    } else {
      t.wildColor = PD.NO_COLOR;
      for (i = 0; i < moves.length; i++) {
        var mf = moves[i];
        if (!mf || mf.kind !== "playProp") continue;
        if (!mf.card || mf.card.uid !== uid) continue;
        cmds.push(mf);
      }
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
    cmds = existing.concat(newSet);
    t.cmds = cmds;
    t.cmdI = 0; // default always-existing if any

    view.mode = "targeting";
    return;
  }

  // Unknown targeting kind.
  t.active = false;
  view.mode = "browse";
};

PD.ui.targetingRetargetWild = function (state, view, dir) {
  if (!view || !view.targeting || !view.targeting.active) return;
  var t = view.targeting;
  if (t.kind !== "place") return;
  if (!t.card || !t.card.def || !PD.isWildDef(t.card.def)) return;

  var def = t.card.def;
  var c0 = def.wildColors[0];
  var c1 = def.wildColors[1];
  var prevColor = t.wildColor;
  var nextColor = (prevColor === c0) ? c1 : c0;
  if (dir < 0) nextColor = (prevColor === c1) ? c0 : c1;

  var prevCmd = (t.cmds && t.cmds.length) ? t.cmds[PD.ui.clampI(t.cmdI, t.cmds.length)] : null;
  var keepNewSet = !!(prevCmd && prevCmd.dest && prevCmd.dest.newSet);
  var keepSetI = (prevCmd && prevCmd.dest && prevCmd.dest.setI != null) ? prevCmd.dest.setI : null;

  var moves = PD.legalMoves(state);
  var uid = t.card.uid;
  var cmds = [];
  var i;
  for (i = 0; i < moves.length; i++) {
    var mw = moves[i];
    if (!mw || mw.kind !== "playProp") continue;
    if (!mw.card || mw.card.uid !== uid) continue;
    if (mw.color !== nextColor) continue;
    cmds.push(mw);
  }

  // Ordering: existing then new.
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
  cmds = existing.concat(newSet);

  t.wildColor = nextColor;
  t.cmds = cmds;

  // Preserve selection if possible.
  var selI = 0;
  if (keepNewSet) {
    for (i = 0; i < cmds.length; i++) if (cmds[i] && cmds[i].dest && cmds[i].dest.newSet) { selI = i; break; }
  } else if (keepSetI != null) {
    for (i = 0; i < cmds.length; i++) if (cmds[i] && cmds[i].dest && cmds[i].dest.setI === keepSetI) { selI = i; break; }
  }
  t.cmdI = selI;
};

PD.ui.step = function (state, view, actions) {
  if (!state || !view) return null;
  actions = actions || {};

  // Tick feedback timers.
  PD.ui.feedbackTick(view);

  // Inspect is only meaningful in browse mode.
  view.inspectActive = !!(view.mode === "browse" && actions.x && actions.x.inspectActive);

  // Compute models for navigation helpers.
  var computed = PD.ui.computeRowModels(state, view);
  PD.ui.updateCameras(state, view, computed);

  // One-shot nudge: when P0 runs out of plays, snap selection to End (browse-only).
  // This makes "A to end turn" frictionless while still allowing players to wander away.
  if (view.mode === "browse" && !view.inspectActive && state.activeP === 0) {
    if (!view.ux) view.ux = { lastActiveP: null, lastPlaysLeft: null };
    var prevP = view.ux.lastActiveP;
    var prevPlays = view.ux.lastPlaysLeft;
    var curPlays = state.playsLeft;
    if (curPlays == null) curPlays = 0;
    curPlays = Math.floor(Number(curPlays));
    if (!isFinite(curPlays)) curPlays = 0;

    if (prevP === 0 && prevPlays != null && prevPlays > 0 && curPlays <= 0) {
      var pickEnd = PD.ui.findBestCursorTarget(computed.models, [2], function (it) {
        return it && it.kind === "btn" && it.id === "endTurn" && !it.disabled;
      });
      if (pickEnd) {
        PD.ui.cursorMoveTo(view, pickEnd);
        computed = PD.ui.computeRowModels(state, view);
        PD.ui.updateCameras(state, view, computed);
      }
    }

    view.ux.lastActiveP = 0;
    view.ux.lastPlaysLeft = curPlays;
  } else if (view.ux) {
    view.ux.lastActiveP = state.activeP;
    view.ux.lastPlaysLeft = state.playsLeft;
  }

  function currentSelection() {
    var row = view.cursor.row;
    var rm = computed.models[row];
    if (!rm || !rm.items || rm.items.length === 0) return null;
    var i = PD.ui.clampI(view.cursor.i, rm.items.length);
    return rm.items[i];
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
      if (!src.loc || src.loc.zone !== "hand" || src.loc.p !== 0) return null;
      var uid = src.uid;

      if (it.id === "bank") {
        var cmd = { kind: "bank", card: { uid: uid, loc: src.loc } };
        return { kind: "applyCmd", cmd: cmd };
      }

      if (it.id === "place") {
        PD.ui.targetingEnter(state, view, "place", false, uid, src.loc);
        return null;
      }

      if (it.id === "build") {
        PD.ui.targetingEnter(state, view, "build", false, uid, src.loc);
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
      PD.ui.feedbackError(view, "no_targets", "No valid destination");
      t.active = false;
      view.mode = "browse";
      return null;
    }

    var cmdI = PD.ui.clampI(t.cmdI, t.cmds.length);
    var cmdSel = t.cmds[cmdI];
    t.active = false;
    view.mode = "browse";

    if (!cmdSel) return null;
    return { kind: "applyCmd", cmd: cmdSel };
  }

  // Browse mode
  view.mode = "browse";

  // Navigation (directional, screen-space).
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

    // Center buttons.
    if (sel.row === 2 && sel.kind === "btn") {
      if (sel.disabled) {
        var msg = "Not available";
        if (sel.id === "endTurn" && state.activeP !== 0) msg = "Opponent turn";
        else if (sel.id === "endTurn" && state.players[0].hand.length > PD.HAND_MAX) msg = "Hand > 7";
        PD.ui.feedbackError(view, "disabled_btn", msg);

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

      if (sel.id === "endTurn") return { kind: "applyCmd", cmd: { kind: "endTurn" } };
      if (sel.id === "step") return { kind: "debug", action: "step" };
      if (sel.id === "reset") return { kind: "debug", action: "reset" };
      if (sel.id === "nextScenario") return { kind: "debug", action: "nextScenario" };
      return null;
    }

    // Hand card menu (P0 only).
    if (sel.loc && sel.loc.zone === "hand" && sel.loc.p === 0) {
      PD.ui.menuOpenForSelection(state, view, sel);
      if (view.menu.items && view.menu.items.length > 0) {
        view.mode = "menu";
      } else {
        PD.ui.feedbackError(view, "no_actions", "No actions");
      }
    }
  }

  // Hold-A grab: enter targeting (Place for properties; otherwise bank-only).
  if (actions.a && actions.a.grabStart) {
    var sel2 = currentSelection();
    if (sel2 && sel2.loc && sel2.loc.zone === "hand" && sel2.loc.p === 0) {
      var uid2 = sel2.uid;
      var def2 = PD.defByUid(state, uid2);
      if (def2 && def2.kind === PD.CardKind.Property) {
        PD.ui.targetingEnter(state, view, "place", true, uid2, sel2.loc);
      } else if (def2 && PD.isBankableDef(def2)) {
        // Prefer bank on holds (esp. House).
        PD.ui.targetingEnter(state, view, "bank", true, uid2, sel2.loc);
      } else {
        PD.ui.feedbackError(view, "hold_noop", "Can't do that");
      }
    }
  }

  // If hold targeting is active and A is no longer held, auto-confirm is handled in targeting mode.

  return null;
};

// ---- src/99_main.js ----
function TIC() {
  PD.mainTick();
}

