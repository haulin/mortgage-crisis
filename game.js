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
    centerHdrDy: -10,

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
    pileOutlineUnder2Col: PD.Pal.Grey
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

// ---- src/02_boot.js ----
PD.bootTick = function () {
  cls(0);

  var title = "Property Deal";
  var subtitle = "Build OK";
  var seed = "SeedBase: " + PD.config.seedBase;

  print(title, 6, 6, 12, true, 1, false);
  print(subtitle, 6, 16, 12, true, 1, false);
  print(seed, 6, 28, 12, true, 1, false);
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
    name: "$1",
    desc: "Money.\nBank: $1",
    kind: PD.CardKind.Money,
    count: 3,
    bankValue: 1,
  },
  {
    id: "money_2",
    name: "$2",
    desc: "Money.\nBank: $2",
    kind: PD.CardKind.Money,
    count: 3,
    bankValue: 2,
  },
  {
    id: "money_3",
    name: "$3",
    desc: "Money.\nBank: $3",
    kind: PD.CardKind.Money,
    count: 2,
    bankValue: 3,
  },
  {
    id: "money_4",
    name: "$4",
    desc: "Money.\nBank: $4",
    kind: PD.CardKind.Money,
    count: 1,
    bankValue: 4,
  },
  {
    id: "money_5",
    name: "$5",
    desc: "Money.\nBank: $5",
    kind: PD.CardKind.Money,
    count: 1,
    bankValue: 5,
  },

  // Properties (12 fixed + 2 wild = 14)
  {
    id: "prop_cyan",
    name: "Property (Cyan)",
    desc: "Property.\nColor: Cyan\nPay: $3",
    kind: PD.CardKind.Property,
    count: 2,
    propertyColor: PD.Color.Cyan,
    propertyPayValue: 3,
  },
  {
    id: "prop_magenta",
    name: "Property (Magenta)",
    desc: "Property.\nColor: Magenta\nPay: $2",
    kind: PD.CardKind.Property,
    count: 3,
    propertyColor: PD.Color.Magenta,
    propertyPayValue: 2,
  },
  {
    id: "prop_orange",
    name: "Property (Orange)",
    desc: "Property.\nColor: Orange\nPay: $2",
    kind: PD.CardKind.Property,
    count: 3,
    propertyColor: PD.Color.Orange,
    propertyPayValue: 2,
  },
  {
    id: "prop_black",
    name: "Property (Black)",
    desc: "Property.\nColor: Black\nPay: $1",
    kind: PD.CardKind.Property,
    count: 4,
    propertyColor: PD.Color.Black,
    propertyPayValue: 1,
  },
  {
    id: "wild_mo",
    name: "Wild (Magenta/Orange)",
    desc: "Wild property.\nColors: Magenta/Orange\nPay: $2",
    kind: PD.CardKind.Property,
    count: 1,
    wildColors: [PD.Color.Magenta, PD.Color.Orange],
    propertyPayValue: 2,
  },
  {
    id: "wild_cb",
    name: "Wild (Cyan/Black)",
    desc: "Wild property.\nColors: Cyan/Black\nPay: $2",
    kind: PD.CardKind.Property,
    count: 1,
    wildColors: [PD.Color.Cyan, PD.Color.Black],
    propertyPayValue: 2,
  },

  // Buildings (2)
  {
    id: "house",
    name: "House",
    desc: "Add to a complete set.\nRent bonus: +3\nBank: $3",
    kind: PD.CardKind.House,
    count: 2,
    bankValue: 3,
  },

  // Actions (9)
  {
    id: "rent_mo",
    name: "Rent (Magenta/Orange)",
    desc: "Charge rent.\nColors: Magenta/Orange\nBank: $1",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.Rent,
    count: 2,
    bankValue: 1,
    rentAllowedColors: [PD.Color.Magenta, PD.Color.Orange],
  },
  {
    id: "rent_cb",
    name: "Rent (Cyan/Black)",
    desc: "Charge rent.\nColors: Cyan/Black\nBank: $1",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.Rent,
    count: 2,
    bankValue: 1,
    rentAllowedColors: [PD.Color.Cyan, PD.Color.Black],
  },
  {
    id: "rent_any",
    name: "Rent (Any)",
    desc: "Charge rent.\nAny color\nBank: $1",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.Rent,
    count: 1,
    bankValue: 1,
    rentAllowedColors: null,
  },
  {
    id: "sly_deal",
    name: "Sly Deal",
    desc: "Steal 1 property\nfrom an incomplete set.\nBank: $3",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.SlyDeal,
    count: 2,
    bankValue: 3,
  },
  {
    id: "just_say_no",
    name: "Just Say No",
    desc: "Cancel an action\nplayed against you.\nBank: $4",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.JustSayNo,
    count: 2,
    bankValue: 4,
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
  if (!state.deck || state.deck.length < n) throw new Error("deck_underflow");

  var uids = [];
  var k;
  for (k = 0; k < n; k++) {
    var uid = state.deck.pop();
    state.players[p].hand.push(uid);
    uids.push(uid);
  }

  if (events) events.push({ kind: "draw", p: p, uids: uids });
};

PD.startTurn = function (state, events) {
  state.playsLeft = 3;
  PD.clearPrompt(state);
  // Draw 2 at start of turn.
  PD.drawToHand(state, state.activeP, 2, events);
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

  // End turn is always allowed (\"play up to 3\").
  moves.push({ kind: "endTurn" });

  if (state.playsLeft <= 0) return moves;

  var hand = state.players[p].hand;
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
  lastCmd: "",
  lastEvents: []
};

PD.debug.scenarios = ["default"].concat(PD.SCENARIO_IDS);

PD.debugReset = function () {
  var d = PD.debug;
  var seedU32 = PD.computeSeed();
  var scenarioId = d.scenarios[d.scenarioI | 0];
  if (scenarioId === "default") {
    d.state = PD.newGame({ seedU32: seedU32 >>> 0 });
  } else {
    d.state = PD.newGame({ seedU32: seedU32 >>> 0, scenarioId: scenarioId });
  }
  d.lastCmd = "";
  d.lastEvents = [];
};

PD.debugNextScenario = function () {
  var d = PD.debug;
  d.scenarioI = ((d.scenarioI | 0) + 1) % (d.scenarios.length | 0);
  PD.debugReset();
};

PD.debugPickMove = function (moves) {
  var d = PD.debug;
  var state = d.state;
  if (!moves || (moves.length | 0) === 0) return null;

  // Prefer doing something other than endTurn when possible.
  var nonEnd = [];
  var i;
  for (i = 0; i < (moves.length | 0); i++) {
    if (moves[i].kind !== "endTurn") nonEnd.push(moves[i]);
  }
  var pickFrom = (nonEnd.length | 0) > 0 ? nonEnd : moves;
  var idx = PD.rngNextInt(state, pickFrom.length | 0) | 0;
  return pickFrom[idx];
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
  if (!events || (events.length | 0) === 0) return "(none)";
  var parts = [];
  var i;
  for (i = 0; i < (events.length | 0); i++) {
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

  cls(0);
  var x = 6;
  var y = 6;
  var step = 7;

  print("Phase 02 Debug", x, y, 12); y += step;
  print("Scenario: " + d.scenarios[d.scenarioI | 0], x, y, 12); y += step;
  print("Seed: " + (PD.computeSeed() >>> 0), x, y, 12); y += step;

  if (PD.render && PD.render.debug && typeof PD.render.debug.selectedLines === "function") {
    var sel = PD.render.debug.selectedLines(d);
    if (sel && sel.length) {
      print(sel[0] || "", x, y, 12); y += step;
      if (sel[1]) { print(sel[1], x, y, 12); y += step; }
    }
  }

  print("Active: P" + (s.activeP | 0) + "  Plays: " + (s.playsLeft | 0), x, y, 12); y += step;
  var w = (s.winnerP | 0);
  if (w !== PD.NO_WINNER) { print("Winner: P" + w, x, y, 11); y += step; }

  print("Deck: " + (s.deck.length | 0) + "  Discard: " + (s.discard.length | 0), x, y, 12); y += step;
  print("Hand P0/P1: " + (s.players[0].hand.length | 0) + "/" + (s.players[1].hand.length | 0), x, y, 12); y += step;
  print("Bank P0/P1: " + (s.players[0].bank.length | 0) + "/" + (s.players[1].bank.length | 0), x, y, 12); y += step;
  print("Sets P0/P1: " + (s.players[0].sets.length | 0) + "/" + (s.players[1].sets.length | 0), x, y, 12); y += step;

  var moves = PD.legalMoves(s);
  print("Legal moves: " + (moves.length | 0), x, y, 12); y += step;
  print("Last cmd: " + (d.lastCmd || "(none)"), x, y, 12); y += step;
  print("Events: " + PD.debugEventsToLine(d.lastEvents), x, y, 12);

  print("A:Step  B:Next  X:Reset  Y:Mode", 6, 128, 13, true, 1, false);
};

PD.mainTick = function () {
  // Modes: 0=DebugText, 1=Render
  if (PD._mainMode == null) PD._mainMode = 0;
  if (typeof btnp === "function" && btnp(7)) PD._mainMode = ((PD._mainMode | 0) ^ 1) | 0;

  if ((PD._mainMode | 0) === 0) {
    PD.debugTick();
    return;
  }

  // Render mode
  if (!PD.debug || !PD.debug.state) PD.debugReset();
  if (PD.render && typeof PD.render.tick === "function") PD.render.tick(PD.debug);
  else {
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
      desc: { x: prevX + cfg.faceW + prevGapX, y: top + cfg.centerDescDy },

      hdr: { x: deckX, y: y0 + cfg.centerHdrDy }
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

  R.ui = R.ui || {
    row: R.ROW_P_HAND,
    i: 0,
    camX: [0, 0, 0, 0, 0],
    lastStateRef: null
  };

  function clampI(i, n) {
    if (n <= 0) return 0;
    if (i < 0) return 0;
    if (i >= n) return n - 1;
    return i;
  }

  function wrapI(i, n) {
    if (n <= 0) return 0;
    // JS % keeps sign; normalize.
    i = i % n;
    if (i < 0) i = i + n;
    return i;
  }

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

      drawHighlight(xs, ys);
    }
  }

  function drawCardFaceBase(xFace, yFace, bgCol) {
    // Border
    rectSafe(xFace, yFace, R.cfg.faceW, R.cfg.faceH, R.cfg.colCardBorder);
    // Interior
    rectSafe(xFace + 1, yFace + 1, R.cfg.faceW - 2, R.cfg.faceH - 2, bgCol);
  }

  function drawHighlight(xFace, yFace) {
    rectbSafe(
      xFace - R.cfg.highlightPad,
      yFace - R.cfg.highlightPad,
      R.cfg.faceW + 2 * R.cfg.highlightPad,
      R.cfg.faceH + 2 * R.cfg.highlightPad,
      R.cfg.colHighlight
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
        var c0 = def.wildColors[0] | 0;
        var c1 = def.wildColors[1] | 0;
        var a = (assignedColor == null) ? PD.NO_COLOR : (assignedColor | 0);
        var colHalfFalse = c0;
        var colHalfTrue = c1;
        if (a === c0 || a === c1) {
          var other = (a === c0) ? c1 : c0;
          // Visual top depends on card flip: when flipped, the local bottom becomes screen top.
          if (!flip180) {
            colHalfFalse = a;
            colHalfTrue = other;
          } else {
            colHalfFalse = other;
            colHalfTrue = a;
          }
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
    var id = (R.spr && R.spr.cardBackTL != null) ? (R.spr.cardBackTL | 0) : 0;

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

  function buildRowItems(debug, row) {
    var cfg = R.cfg;
    var state = debug ? debug.state : null;
    var out = { items: [], minX: 0, maxX: 0 };
    if (!state) return out;

    var yFace = faceYForRow(row);
    var p = playerForRow(row);
    var isOp = isOpponentRow(row);
    var padX = cfg.rowPadX;
    var i;

    if (row === R.ROW_P_HAND || row === R.ROW_OP_HAND) {
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
          stackKey: (kind === "bank") ? ("bank:p" + p + ":row" + row) : null,
          uid: uid,
          depth: depth,
          fanDir: fanDir,
          x: xFace,
          y: yFace,
          w: cfg.faceW,
          h: cfg.faceH
        });
        var xLo = xFace;
        var xHi = xFace + cfg.faceW - 1;
        // Include 1px shadow pixels that can be drawn outside the face.
        if (kind === "hand") {
          // Hand/back separator shadow is on the left (xFace-1).
          xLo = xFace + cfg.shadowBarDx;
        } else if (kind === "bank") {
          // Bank shadow side is a pure function of fan direction.
          if (fanDir < 0) xHi = xFace + cfg.faceW; // xFace+faceW
          else xLo = xFace + cfg.shadowBarDx; // xFace-1
        }
        if (xLo < minX) minX = xLo;
        if (xHi > maxX) maxX = xHi;
      }

      // Hand zone (spaced).
      var xHandStart = isOp ? (cfg.screenW - padX - cfg.faceW) : padX;
      var handStep = isOp ? (-cfg.handStrideX) : cfg.handStrideX;
      for (i = 0; i < nHand; i++) {
        pushHandRowItem("hand", hand[i], xHandStart + i * handStep, i, 0);
      }

      // Bank zone (overlapped stack), placed on the opposite side.
      var stride = cfg.stackStrideX;
      var gap = cfg.stackGapX;

      if (!isOp) {
        // Player bank: fan right (fanDir=+1), but anchored on the right.
        var bankRightX = cfg.screenW - padX - cfg.faceW;
        var bankLeftX = bankRightX - (nBank > 0 ? (nBank - 1) * stride : 0);
        var handMaxX = (nHand > 0) ? (padX + (nHand - 1) * cfg.handStrideX + cfg.faceW - 1) : (padX - 1);
        if (nBank > 0 && bankLeftX <= (handMaxX + gap)) {
          bankLeftX = handMaxX + gap + 1;
        }
        for (i = 0; i < nBank; i++) {
          pushHandRowItem("bank", bank[i], bankLeftX + i * stride, i, 1);
        }
      } else {
        // Opponent bank: fan left (fanDir=-1), anchored on the left.
        var bankLeftX2 = padX;
        var bankRightX2 = bankLeftX2 + (nBank > 0 ? (nBank - 1) * stride : 0);
        var handMinX = (nHand > 0) ? (xHandStart + (nHand - 1) * handStep) : (xHandStart + 1);
        var bankMaxX = bankRightX2 + cfg.faceW - 1;
        if (nBank > 0 && (bankMaxX + gap) >= handMinX) {
          var desiredBankMax = handMinX - gap - 1;
          bankRightX2 = desiredBankMax - (cfg.faceW - 1);
        }
        for (i = 0; i < nBank; i++) {
          pushHandRowItem("bank", bank[i], bankRightX2 - i * stride, i, -1);
        }
      }

      out.minX = (minX === 999999) ? 0 : minX;
      out.maxX = (maxX === -999999) ? 0 : maxX;
      // Ensure left-to-right ordering for cursor behavior.
      out.items.sort(function (a, b) { return a.x - b.x; });
      return out;
    }

    if (row === R.ROW_P_TABLE || row === R.ROW_OP_TABLE) {
      var sets = state.players[p].sets;
      var setCount = sets.length;
      var stride = cfg.stackStrideX;
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
            var xFaceP = cursorX + depth * stride;
            var it = {
              kind: cards[depth].kind,
              row: row,
              p: p,
              stackKey: "set:p" + p + ":set" + i,
              setI: cards[depth].setI,
              depth: cards[depth].depth,
              fanDir: fanDir,
              uid: cards[depth].uid,
              color: cards[depth].color,
              x: xFaceP,
              y: yFace,
              w: cfg.faceW,
              h: cfg.faceH
            };
            out.items.push(it);
            var xLoP = xFaceP;
            var xHiP = xFaceP + cfg.faceW - 1;
            if (fanDir > 0) xLoP = xFaceP + cfg.shadowBarDx;
            else xHiP = xFaceP + cfg.faceW;
            if (xLoP < minX2) minX2 = xLoP;
            if (xHiP > maxX2) maxX2 = xHiP;
          }

          var stackW = cfg.faceW + (nCards - 1) * stride;
          cursorX = cursorX + stackW + cfg.stackGapX;
        }
      } else {
        // Opponent: sets placed right-to-left, and fan direction mirrored (depth shifts left).
        var rightCursor = cfg.screenW - padX - cfg.faceW;
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
            var xFaceO = rightCursor - d2 * stride;
            var itO = {
              kind: cardsO[d2].kind,
              row: row,
              p: p,
              stackKey: "set:p" + p + ":set" + i,
              setI: cardsO[d2].setI,
              depth: cardsO[d2].depth,
              fanDir: fanDir,
              uid: cardsO[d2].uid,
              color: cardsO[d2].color,
              x: xFaceO,
              y: yFace,
              w: cfg.faceW,
              h: cfg.faceH
            };
            out.items.push(itO);
            var xLoO = xFaceO;
            var xHiO = xFaceO + cfg.faceW - 1;
            if (fanDir > 0) xLoO = xFaceO + cfg.shadowBarDx;
            else xHiO = xFaceO + cfg.faceW;
            if (xLoO < minX2) minX2 = xLoO;
            if (xHiO > maxX2) maxX2 = xHiO;
          }

          // Place next stack to the left.
          var leftEdge = rightCursor - (nCardsO - 1) * stride;
          rightCursor = leftEdge - cfg.stackGapX - cfg.faceW;
          // stackWO not used directly; formula above is more stable for right-to-left placement.
        }
      }

      out.minX = (minX2 === 999999) ? 0 : minX2;
      out.maxX = (maxX2 === -999999) ? 0 : maxX2;
      out.items.sort(function (a, b) { return a.x - b.x; });
      return out;
    }

    if (row === R.ROW_CENTER) {
      // Center selectables (Phase 03b): deck + discard only.
      var C = R.center;
      out.items.push({ kind: "deck", row: row, x: C.deck.x, y: C.deck.y, w: cfg.faceW, h: cfg.faceH });
      out.items.push({ kind: "discard", row: row, x: C.discard.x, y: C.discard.y, w: cfg.faceW, h: cfg.faceH });

      out.minX = 0; out.maxX = cfg.screenW - 1;
      out.items.sort(function (a, b) { return a.x - b.x; });
      return out;
    }

    return out;
  }

  function nearestByX(items, xCenter) {
    if (!items || items.length === 0) return 0;
    var bestI = 0;
    var bestD = 999999;
    var i;
    for (i = 0; i < items.length; i++) {
      var it = items[i];
      var cx = it.x + (it.w >> 1);
      var d = cx - xCenter;
      if (d < 0) d = -d;
      if (d < bestD) {
        bestD = d;
        bestI = i;
      }
    }
    return bestI;
  }

  function ensureCamForSelection(rowModel, row, selI) {
    var cfg = R.cfg;
    var cam = R.ui.camX[row];
    var margin = cfg.camMarginX;

    if (!rowModel || !rowModel.items || rowModel.items.length === 0) {
      R.ui.camX[row] = 0;
      return;
    }

    var contentW = (rowModel.maxX - rowModel.minX + 1);
    if (contentW <= cfg.screenW) {
      R.ui.camX[row] = 0;
      return;
    }

    selI = clampI(selI, rowModel.items.length);
    var it = rowModel.items[selI];
    var x0 = it.x;
    var x1 = it.x + it.w - 1;

    // Keep in view with margins.
    if ((x0 - cam) < margin) cam = x0 - margin;
    if ((x1 - cam) > (cfg.screenW - 1 - margin)) cam = x1 - (cfg.screenW - 1 - margin);

    // Clamp camera to content extents (works even if minX is negative).
    var camA = rowModel.minX - margin;
    var camB = rowModel.maxX - (cfg.screenW - 1 - margin);
    var camLo = camA < camB ? camA : camB;
    var camHi = camA < camB ? camB : camA;
    if (cam < camLo) cam = camLo;
    if (cam > camHi) cam = camHi;

    R.ui.camX[row] = cam;
  }

  function rowModelAll(debug) {
    return [
      buildRowItems(debug, R.ROW_OP_HAND),
      buildRowItems(debug, R.ROW_OP_TABLE),
      buildRowItems(debug, R.ROW_CENTER),
      buildRowItems(debug, R.ROW_P_TABLE),
      buildRowItems(debug, R.ROW_P_HAND)
    ];
  }

  function drawCenter(debug, selectedItem, isSelected) {
    var cfg = R.cfg;
    var row = R.ROW_CENTER;
    var y0 = rowY0(row);
    var y1 = rowY1(row);
    rectSafe(0, y0, cfg.screenW, y1 - y0 + 1, cfg.colCenterPanel);
    rectbSafe(0, y0, cfg.screenW, y1 - y0 + 1, cfg.colCenterPanelBorder);

    var s = debug.state;

    // Center header (kept minimal; debug details live in DebugText mode).
    printSafe("Phase 03 Render", R.center.hdr.x, R.center.hdr.y, cfg.colText);

    function drawCountDigits(n, xFace, yFace) {
      n = n | 0;
      if (n < 0) n = 0;
      // 35-card deck; keep it simple and deterministic.
      var sN = String(n);
      if (sN.length > 2) sN = sN.slice(-2);
      var len = sN.length;
      var yTL = cfg.faceH - 1 - cfg.digitGlyphH; // bottom-right inside border
      var xEnd = cfg.faceW - 1 - cfg.digitGlyphW;
      var xStart = xEnd - (len - 1) * cfg.propRentDx; // 4px step
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

      // Shadow outline first, shifted up-left.
      rectbSafe(xFace + dx - 1, yFace + dy - 1, cfg.faceW, cfg.faceH, cfg.pileShadowOutlineCol);
      // Main outline on top (alternating depth colors).
      rectbSafe(xFace + dx, yFace + dy, cfg.faceW, cfg.faceH, colMain);
    }

    function drawDeckAt(xFace, yFace) {
      var n = s.deck.length | 0;
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
      var n = s.discard.length | 0;
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

      var topUid = s.discard[n - 1] | 0;
      drawShadowBar(xFace, yFace);
      drawMiniCard(s, topUid, xFace, yFace, false);
      drawCountDigits(n, xFace, yFace);
    }

    // Center piles (deck/discard).
    var rowM = buildRowItems(debug, row);
    var i;
    for (i = 0; i < rowM.items.length; i++) {
      var it = rowM.items[i];
      if (it.kind === "deck") drawDeckAt(it.x, it.y);
      else if (it.kind === "discard") drawDiscardAt(it.x, it.y);
    }

    // Center preview (Phase 03b): mini-card + title + desc (smallfont).
    var dbgEnabled = !!(PD.config && PD.config.debug && PD.config.debug.enabled);
    var previewUid = 0;
    var previewAssignedColor = null;

    if (selectedItem) {
      if (selectedItem.row === R.ROW_CENTER) {
        if (selectedItem.kind === "deck") {
          if (dbgEnabled && s.deck.length > 0) previewUid = s.deck[(s.deck.length | 0) - 1] | 0;
        } else if (selectedItem.kind === "discard") {
          if (s.discard.length > 0) previewUid = s.discard[(s.discard.length | 0) - 1] | 0;
        }
      } else if (selectedItem.uid) {
        // Debug-first: reveal opponent hand card in preview when enabled.
        if (!dbgEnabled && selectedItem.row === R.ROW_OP_HAND) {
          previewUid = 0;
        } else {
          previewUid = selectedItem.uid | 0;
          if (selectedItem.color != null) previewAssignedColor = selectedItem.color | 0;
        }
      }
    }

    if (previewUid) {
      var C = R.center;
      var xPrev = C.preview.x;
      var yPrev = C.preview.y;
      var xTitle = C.title.x;
      var yTitle = C.title.y;
      var xDesc = C.desc.x;
      var yDesc = C.desc.y;

      drawMiniCard(s, previewUid, xPrev, yPrev, false, previewAssignedColor);

      var def = PD.defByUid(s, previewUid);
      var title = (def && def.name) ? def.name : ((def && def.id) ? def.id : "");
      var desc = (def && def.desc) ? String(def.desc) : "";

      printSafe(title, xTitle, yTitle, cfg.colText);
      // smallfont=true, allow \\n in desc for multi-line rendering.
      printExSafe(desc, xDesc, yDesc, cfg.colText, false, 1, true);
    }
  }

  function drawControlsLine() {
    var cfg = R.cfg;
    if (cfg.hudLineEnabled === false) return;
    printSafe("Y:Mode", cfg.hudLineX, cfg.hudLineY, cfg.hudLineCol);
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
          if (selectedItem && selectedItem.color != null && (selectedItem.color | 0) !== PD.NO_COLOR) {
            detail += " As:c" + (selectedItem.color | 0);
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

  function drawRowCards(debug, rowModel, row, selected) {
    var cfg = R.cfg;
    var cam = R.ui.camX[row];
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
        drawFannedStack(cards, { state: debug.state, fanDir: fanDir, flip180: !!flipCards, camX: cam, selectedItem: selected, drawSelected: false });
      }

      // Selected last + highlight.
      if (selected) {
        var sFan = (selected.fanDir != null) ? selected.fanDir : (flipCards ? -1 : 1);
        var sk = String(selected.stackKey);
        var stack = byKey[sk] || [selected];
        drawFannedStack(stack, { state: debug.state, fanDir: sFan, flip180: !!flipCards, camX: cam, selectedItem: selected, onlySelected: true });
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
        drawMiniCard(debug.state, it.uid, x, y, !!flipCards);
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
      drawFannedStack(stack0, { state: debug.state, fanDir: fanDirB, flip180: !!flipBank, camX: cam, selectedItem: selInThis, drawSelected: false });
    }

    if (selected) {
      var xs = selected.x - cam;
      var ys = selected.y;
      if (row === R.ROW_OP_HAND) {
        if (selected.stackKey) {
          var sFanO = (selected.fanDir != null) ? selected.fanDir : -1;
          var stackO = byKeyH[String(selected.stackKey)] || [selected];
          drawFannedStack(stackO, { state: debug.state, fanDir: sFanO, flip180: true, camX: cam, selectedItem: selected, onlySelected: true });
        } else {
          drawShadowBar(xs, ys);
          drawCardBack(xs, ys, true);
          drawHighlight(xs, ys);
        }
      } else if (row === R.ROW_P_HAND) {
        if (selected.stackKey) {
          var sFanP = (selected.fanDir != null) ? selected.fanDir : 1;
          var stackP = byKeyH[String(selected.stackKey)] || [selected];
          drawFannedStack(stackP, { state: debug.state, fanDir: sFanP, flip180: false, camX: cam, selectedItem: selected, onlySelected: true });
        } else {
          drawShadowBar(xs, ys);
          drawMiniCard(debug.state, selected.uid, xs, ys, !!flipCards);
          drawHighlight(xs, ys);
        }
      }
    }
  }

  function selectedItemFromModels(models) {
    var row = R.ui.row;
    row = clampI(row, 5);
    var m = models[row];
    if (!m || !m.items || m.items.length === 0) return null;
    var si = clampI(R.ui.i, m.items.length);
    R.ui.i = si;
    return m.items[si];
  }

  R.debug = R.debug || {};

  // DebugText support: summarize current Render selection without drawing.
  R.debug.selectedLines = function (debug) {
    if (!debug || !debug.state) return ["Sel:(none)", ""];
    var models = rowModelAll(debug);
    var it = selectedItemFromModels(models);
    if (!it) return ["Sel:(none)", ""];

    if (it.row === R.ROW_CENTER) {
      if (it.kind === "deck") return ["Sel:Deck", "Cards:" + (debug.state.deck.length | 0)];
      if (it.kind === "discard") return ["Sel:Discard", "Cards:" + (debug.state.discard.length | 0)];
      return ["Sel:" + String(it.kind || "?"), ""];
    }

    if (it.uid) {
      var uid = it.uid | 0;
      var def = PD.defByUid(debug.state, uid);
      var defId = def ? def.id : "?";
      var name = (def && def.name) ? def.name : "";
      return ["Sel:" + defId + " uid:" + uid, name];
    }

    return ["Sel:" + String(it.kind || "?"), ""];
  };

  function ensureRowHasSelection(models) {
    // If current row has no items, find the next row with items (wrap).
    var tries = 0;
    while (tries < 5) {
      var row = R.ui.row;
      var m = models[row];
      if (m && m.items && m.items.length > 0) {
        R.ui.i = clampI(R.ui.i, m.items.length);
        return;
      }
      R.ui.row = (R.ui.row + 1) % 5;
      R.ui.i = 0;
      tries = tries + 1;
    }
  }

  function handleNav(models) {
    var cfg = R.cfg;
    var row = R.ui.row;
    var m = models[row];
    var n = (m && m.items) ? m.items.length : 0;

    var up = !!btnp(0);
    var down = !!btnp(1);
    var left = !!btnp(2);
    var right = !!btnp(3);

    // Left/Right within row.
    if (left && n > 0) R.ui.i = wrapI(R.ui.i - 1, n);
    if (right && n > 0) R.ui.i = wrapI(R.ui.i + 1, n);

    // Up/Down between rows using nearest-by-x.
    if (up || down) {
      var dir = up ? -1 : 1;
      var curSel = selectedItemFromModels(models);
      var curX = curSel ? (curSel.x + (curSel.w >> 1)) : 0;

      var nextRow = wrapI(row + dir, 5);
      var tries = 0;
      while (tries < 5) {
        var nm = models[nextRow];
        if (nm && nm.items && nm.items.length > 0) {
          R.ui.row = nextRow;
          R.ui.i = nearestByX(nm.items, curX);
          break;
        }
        nextRow = wrapI(nextRow + dir, 5);
        tries = tries + 1;
      }
    }
  }

  function resetUiForState(stateRef) {
    R.ui.lastStateRef = stateRef;
    R.ui.row = R.ROW_P_HAND;
    R.ui.i = 0;
    R.ui.camX[0] = 0;
    R.ui.camX[1] = 0;
    R.ui.camX[2] = 0;
    R.ui.camX[3] = 0;
    R.ui.camX[4] = 0;
  }

  R.drawFrame = function (debug) {
    if (!debug || !debug.state) return;
    var cfg = R.cfg;
    var s = debug.state;

    if (R.ui.lastStateRef !== s) resetUiForState(s);

    var models = rowModelAll(debug);
    ensureRowHasSelection(models);
    handleNav(models);

    // Update cameras for rows that scroll.
    ensureCamForSelection(models[R.ROW_OP_HAND], R.ROW_OP_HAND, (R.ui.row === R.ROW_OP_HAND) ? R.ui.i : 0);
    ensureCamForSelection(models[R.ROW_OP_TABLE], R.ROW_OP_TABLE, (R.ui.row === R.ROW_OP_TABLE) ? R.ui.i : 0);
    ensureCamForSelection(models[R.ROW_P_TABLE], R.ROW_P_TABLE, (R.ui.row === R.ROW_P_TABLE) ? R.ui.i : 0);
    ensureCamForSelection(models[R.ROW_P_HAND], R.ROW_P_HAND, (R.ui.row === R.ROW_P_HAND) ? R.ui.i : 0);

    // Clamp selection after any camera adjustments.
    var sel = selectedItemFromModels(models);

    // Clear background.
    cls(cfg.colBg);

    // Draw rows: opponent hand, opponent table, center, player table, player hand.
    var row;
    for (row = 0; row < 5; row++) {
      if (row === R.ROW_CENTER) continue;
      var rm = models[row];
      var selected = (R.ui.row === row) ? sel : null;
      if (!rm || !rm.items) continue;
      drawRowCards(debug, rm, row, selected);
    }

    // Center panel last (so text overlays are readable).
    drawCenter(debug, sel, true);

    // Highlight center widgets if selected.
    if (R.ui.row === R.ROW_CENTER) {
      var cM = models[R.ROW_CENTER];
      if (cM && cM.items && cM.items.length > 0) {
        var si = clampI(R.ui.i, cM.items.length);
        var wdg = cM.items[si];
        rectbSafe(wdg.x - 1, wdg.y - 1, wdg.w + 2, wdg.h + 2, cfg.colHighlight);
      }
    }

    // Controls HUD (bottom-right, overlay-only).
    drawControlsLine();
  };

  R.tick = function (debug) {
    if (!debug) return;
    if (!debug.state) {
      PD.debugReset();
    }

    // Keep existing debug controls in render mode.
    if (btnp(4)) PD.debugStep();
    if (btnp(5)) PD.debugNextScenario();
    if (btnp(6)) PD.debugReset();

    R.drawFrame(debug);
  };
})();

// ---- src/12_ui.js ----
PD.ui = PD.ui || {};

PD.ui.newView = function () {
  return {
    // View-only state (cursor/camera/menu focus). This is intentionally not part of GameState.
    // Phase 03 keeps view state under PD.render.ui; Phase 04 will converge on a single model.
    cursor: { row: 0, i: 0 },
    camX: [0, 0, 0, 0, 0]
  };
};

PD.ui.handleInput = function (_state, _view, _input) {
  // Phase 04 will translate controller input into either:
  // - a rules command to apply (`{ kind: ... }`)
  // - a prompt transition (engine-owned prompt state)
  //
  // Returning null means "no action".
  return null;
};

// ---- src/99_main.js ----
function TIC() {
  if (PD.mainTick) PD.mainTick();
  else PD.bootTick();
}

