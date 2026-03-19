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
  Black: 3
};

PD.CardKind = {
  Money: 0,
  Action: 1,
  Property: 2,
  House: 3
};

PD.ActionKind = {
  Rent: 0,
  SlyDeal: 1,
  JustSayNo: 2
};

PD.SET_RULES = [];
PD.SET_RULES[PD.Color.Cyan] = {
  requiredSize: 2,
  rent: [1, 3]
};
PD.SET_RULES[PD.Color.Magenta] = {
  requiredSize: 3,
  rent: [1, 2, 4]
};
PD.SET_RULES[PD.Color.Orange] = {
  requiredSize: 3,
  rent: [2, 3, 5]
};
PD.SET_RULES[PD.Color.Black] = {
  requiredSize: 4,
  rent: [1, 2, 3, 6]
};

PD.HOUSE_RENT_BONUS = 3;

PD.CARD_DEFS = [
  // Money (10)
  { id: "money_1", name: "$1", kind: PD.CardKind.Money, count: 3, bankValue: 1 },
  { id: "money_2", name: "$2", kind: PD.CardKind.Money, count: 3, bankValue: 2 },
  { id: "money_3", name: "$3", kind: PD.CardKind.Money, count: 2, bankValue: 3 },
  { id: "money_4", name: "$4", kind: PD.CardKind.Money, count: 1, bankValue: 4 },
  { id: "money_5", name: "$5", kind: PD.CardKind.Money, count: 1, bankValue: 5 },

  // Properties (12 fixed + 2 wild = 14)
  {
    id: "prop_cyan",
    name: "Property (Cyan)",
    kind: PD.CardKind.Property,
    count: 2,
    propertyColor: PD.Color.Cyan,
    propertyPayValue: 3
  },
  {
    id: "prop_magenta",
    name: "Property (Magenta)",
    kind: PD.CardKind.Property,
    count: 3,
    propertyColor: PD.Color.Magenta,
    propertyPayValue: 2
  },
  {
    id: "prop_orange",
    name: "Property (Orange)",
    kind: PD.CardKind.Property,
    count: 3,
    propertyColor: PD.Color.Orange,
    propertyPayValue: 2
  },
  {
    id: "prop_black",
    name: "Property (Black)",
    kind: PD.CardKind.Property,
    count: 4,
    propertyColor: PD.Color.Black,
    propertyPayValue: 1
  },
  {
    id: "wild_mo",
    name: "Wild (Magenta/Orange)",
    kind: PD.CardKind.Property,
    count: 1,
    wildColors: [PD.Color.Magenta, PD.Color.Orange],
    propertyPayValue: 2
  },
  {
    id: "wild_cb",
    name: "Wild (Cyan/Black)",
    kind: PD.CardKind.Property,
    count: 1,
    wildColors: [PD.Color.Cyan, PD.Color.Black],
    propertyPayValue: 2
  },

  // Buildings (2)
  { id: "house", name: "House", kind: PD.CardKind.House, count: 2, bankValue: 3 },

  // Actions (9)
  {
    id: "rent_mo",
    name: "Rent (Magenta/Orange)",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.Rent,
    count: 2,
    bankValue: 1,
    rentAllowedColors: [PD.Color.Magenta, PD.Color.Orange]
  },
  {
    id: "rent_cb",
    name: "Rent (Cyan/Black)",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.Rent,
    count: 2,
    bankValue: 1,
    rentAllowedColors: [PD.Color.Cyan, PD.Color.Black]
  },
  {
    id: "rent_any",
    name: "Rent (Any)",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.Rent,
    count: 1,
    bankValue: 1,
    rentAllowedColors: null
  },
  { id: "sly_deal", name: "Sly Deal", kind: PD.CardKind.Action, actionKind: PD.ActionKind.SlyDeal, count: 2, bankValue: 3 },
  { id: "just_say_no", name: "Just Say No", kind: PD.CardKind.Action, actionKind: PD.ActionKind.JustSayNo, count: 2, bankValue: 4 }
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

PD.otherPlayer = function (p) {
  return (p ^ 1) & 1;
};

PD.getSetColor = function (props) {
  if (!props || (props.length | 0) === 0) return PD.NO_COLOR;
  return props[0][1] | 0;
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
  return (def.wildColors[0] | 0) === color || (def.wildColors[1] | 0) === color;
};

PD.shuffleUidsInPlace = function (state, arr) {
  var i;
  for (i = (arr.length | 0) - 1; i > 0; i--) {
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
    var c = def.count | 0;
    var k;
    for (k = 0; k < c; k++) {
      uidToDefI[uid] = di;
      uid++;
    }
  }
  state.uidToDefI = uidToDefI;
  state.totalUids = (uidToDefI.length | 0) - 1;
};

PD.defByUid = function (state, uid) {
  uid = uid | 0;
  var di = state.uidToDefI[uid] | 0;
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
  if (!state.deck || (state.deck.length | 0) < n) throw new Error("deck_underflow");

  var uids = [];
  while ((n | 0) > 0) {
    var uid = state.deck.pop() | 0;
    state.players[p].hand.push(uid);
    uids.push(uid);
    n = (n - 1) | 0;
  }

  if (events) events.push({ kind: "draw", p: p, uids: uids });
};

PD.startTurn = function (state, events) {
  state.playsLeft = 3;
  state.prompt = null;
  // Draw 2 at start of turn.
  PD.drawToHand(state, state.activeP | 0, 2, events);
  if (events) events.push({ kind: "plays", p: state.activeP | 0, playsLeft: state.playsLeft | 0 });
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
  for (uid = 1; uid <= (state.totalUids | 0); uid++) state.deck.push(uid | 0);
  PD.shuffleUidsInPlace(state, state.deck);

  PD.drawToHand(state, 0, 5, null);
  PD.drawToHand(state, 1, 5, null);

  state.activeP = PD.rngNextInt(state, 2) | 0;
  var events = [];
  events.push({ kind: "turn", activeP: state.activeP | 0 });
  PD.startTurn(state, events);
  // Default newGame doesn't expose events, but tests may call startTurn/endTurn directly.

  return state;
};

// Scenario/test helpers (defId-first).
PD.cardPoolInit = function (state) {
  var pool = {};
  var uid;
  for (uid = 1; uid <= (state.totalUids | 0); uid++) {
    var di = state.uidToDefI[uid] | 0;
    var defId = PD.CARD_DEFS[di].id;
    var a = pool[defId];
    if (!a) {
      a = [];
      pool[defId] = a;
    }
    a.push(uid | 0);
  }
  state._pool = pool;
  return pool;
};

PD.takeUid = function (state, defId) {
  if (!state._pool) PD.cardPoolInit(state);
  var a = state._pool[defId];
  if (!a || (a.length | 0) === 0) throw new Error("pool_exhausted:" + defId);
  return a.pop() | 0;
};

// ---- src/08_rules.js ----
PD.evaluateWin = function (state) {
  var p;
  for (p = 0; p < 2; p++) {
    var sets = state.players[p].sets;
    var complete = 0;
    var si;
    for (si = 0; si < (sets.length | 0); si++) {
      var set = sets[si];
      if (!set) continue;
      var color = PD.getSetColor(set.props);
      if (color === PD.NO_COLOR) continue;
      var req = PD.SET_RULES[color].requiredSize | 0;
      if (((set.props.length | 0) >= req) && req > 0) complete++;
    }
    if (complete >= 3) return p | 0;
  }
  return PD.NO_WINNER;
};

PD.assertCanApply = function (state) {
  if ((state.winnerP | 0) !== PD.NO_WINNER) throw new Error("game_over");
  if (state.prompt) throw new Error("prompt_active");
};

PD.locEqZone = function (loc, zone) {
  return !!(loc && loc.zone === zone);
};

PD.removeHandAtLoc = function (state, card) {
  var loc = card.loc;
  var p = loc.p | 0;
  var i = loc.i | 0;
  var uid = card.uid | 0;
  var hand = state.players[p].hand;
  if ((hand[i] | 0) !== uid) throw new Error("bad_loc");
  hand.splice(i, 1);
};

PD.applyCommand = function (state, cmd) {
  PD.assertCanApply(state);
  if (!cmd || !cmd.kind) throw new Error("bad_cmd");

  var events = [];
  var p = state.activeP | 0;

  if (cmd.kind === "endTurn") {
    state.activeP = PD.otherPlayer(state.activeP | 0);
    events.push({ kind: "turn", activeP: state.activeP | 0 });
    PD.startTurn(state, events);
    return { events: events };
  }

  if ((state.playsLeft | 0) <= 0) throw new Error("no_plays_left");

  if (cmd.kind === "bank") {
    var card = cmd.card;
    if (!card || !card.loc) throw new Error("bad_cmd");
    if (!PD.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if ((card.loc.p | 0) !== p) throw new Error("not_your_card");

    var def = PD.defByUid(state, card.uid | 0);
    if (!PD.isBankableDef(def)) throw new Error("not_bankable");

    PD.removeHandAtLoc(state, card);
    state.players[p].bank.push(card.uid | 0);

    state.playsLeft = (state.playsLeft - 1) | 0;
    events.push({
      kind: "move",
      uid: card.uid | 0,
      from: card.loc,
      to: { p: p, zone: "bank", i: (state.players[p].bank.length | 0) - 1 }
    });
    events.push({ kind: "plays", p: p, playsLeft: state.playsLeft | 0 });
  } else if (cmd.kind === "playProp") {
    var cardP = cmd.card;
    var dest = cmd.dest;
    if (!cardP || !cardP.loc || !dest) throw new Error("bad_cmd");
    if (!PD.locEqZone(cardP.loc, "hand")) throw new Error("bad_loc");
    if ((cardP.loc.p | 0) !== p) throw new Error("not_your_card");

    var defP = PD.defByUid(state, cardP.uid | 0);
    if (!defP || defP.kind !== PD.CardKind.Property) throw new Error("not_property");

    var placedColor = PD.NO_COLOR;
    if (PD.isWildDef(defP)) {
      placedColor = cmd.color | 0;
      if (!PD.wildAllowsColor(defP, placedColor)) throw new Error("wild_color_illegal");
    } else {
      placedColor = defP.propertyColor | 0;
    }

    var setsP = state.players[p].sets;
    var setI;
    if (dest.newSet) {
      var newSet = PD.newEmptySet();
      setI = setsP.length | 0;
      setsP.push(newSet);
      events.push({ kind: "createSet", p: p, setI: setI, color: placedColor | 0 });
    } else {
      setI = dest.setI | 0;
      if (setI < 0 || setI >= (setsP.length | 0)) throw new Error("bad_set");
      var setExisting = setsP[setI];
      var setColor = PD.getSetColor(setExisting.props);
      if (setColor === PD.NO_COLOR) throw new Error("empty_set");
      if ((setColor | 0) !== (placedColor | 0)) throw new Error("set_color_mismatch");
    }

    PD.removeHandAtLoc(state, cardP);
    var setT = setsP[setI];
    setT.props.push([cardP.uid | 0, placedColor | 0]);

    state.playsLeft = (state.playsLeft - 1) | 0;
    events.push({
      kind: "move",
      uid: cardP.uid | 0,
      from: cardP.loc,
      to: { p: p, zone: "setProps", setI: setI, i: (setT.props.length | 0) - 1 }
    });
    events.push({ kind: "plays", p: p, playsLeft: state.playsLeft | 0 });

    var winner = PD.evaluateWin(state) | 0;
    if (winner !== PD.NO_WINNER) {
      state.winnerP = winner | 0;
      events.push({ kind: "win", winnerP: winner | 0 });
    }
  } else if (cmd.kind === "playHouse") {
    var cardH = cmd.card;
    var destH = cmd.dest;
    if (!cardH || !cardH.loc || !destH) throw new Error("bad_cmd");
    if (!PD.locEqZone(cardH.loc, "hand")) throw new Error("bad_loc");
    if ((cardH.loc.p | 0) !== p) throw new Error("not_your_card");

    var defH = PD.defByUid(state, cardH.uid | 0);
    if (!defH || defH.kind !== PD.CardKind.House) throw new Error("not_house");

    var setsH = state.players[p].sets;
    var siH = destH.setI | 0;
    if (siH < 0 || siH >= (setsH.length | 0)) throw new Error("bad_set");
    var setH = setsH[siH];
    if ((setH.houseUid | 0) !== 0) throw new Error("house_already");

    var colorH = PD.getSetColor(setH.props);
    if (colorH === PD.NO_COLOR) throw new Error("empty_set");
    var reqH = PD.SET_RULES[colorH].requiredSize | 0;
    if ((setH.props.length | 0) < reqH) throw new Error("set_not_complete");

    PD.removeHandAtLoc(state, cardH);
    setH.houseUid = cardH.uid | 0;

    state.playsLeft = (state.playsLeft - 1) | 0;
    events.push({
      kind: "move",
      uid: cardH.uid | 0,
      from: cardH.loc,
      to: { p: p, zone: "setHouse", setI: siH }
    });
    events.push({ kind: "plays", p: p, playsLeft: state.playsLeft | 0 });
  } else {
    throw new Error("unknown_cmd:" + cmd.kind);
  }

  return { events: events };
};

PD.legalMoves = function (state) {
  if ((state.winnerP | 0) !== PD.NO_WINNER) return [];
  if (state.prompt) return [];

  var moves = [];
  var p = state.activeP | 0;

  // End turn is always allowed (\"play up to 3\").
  moves.push({ kind: "endTurn" });

  if ((state.playsLeft | 0) <= 0) return moves;

  var hand = state.players[p].hand;
  var sets = state.players[p].sets;

  var i;
  for (i = 0; i < (hand.length | 0); i++) {
    var uid = hand[i] | 0;
    var def = PD.defByUid(state, uid);
    var cardRef = { uid: uid, loc: { p: p, zone: "hand", i: i } };

    if (PD.isBankableDef(def)) {
      moves.push({ kind: "bank", card: cardRef });
    }

    if (def.kind === PD.CardKind.Property) {
      if (PD.isWildDef(def)) {
        // New set for each allowed color.
        moves.push({ kind: "playProp", card: cardRef, dest: { p: p, newSet: true }, color: def.wildColors[0] | 0 });
        moves.push({ kind: "playProp", card: cardRef, dest: { p: p, newSet: true }, color: def.wildColors[1] | 0 });

        // Existing sets that match allowed colors.
        var si;
        for (si = 0; si < (sets.length | 0); si++) {
          var set = sets[si];
          var setColor = PD.getSetColor(set.props);
          if (setColor === PD.NO_COLOR) continue;
          if (PD.wildAllowsColor(def, setColor)) {
            moves.push({ kind: "playProp", card: cardRef, dest: { p: p, setI: si }, color: setColor | 0 });
          }
        }
      } else {
        var c = def.propertyColor | 0;
        // New set.
        moves.push({ kind: "playProp", card: cardRef, dest: { p: p, newSet: true } });
        // Existing sets of same color.
        var sj;
        for (sj = 0; sj < (sets.length | 0); sj++) {
          var setJ = sets[sj];
          var setColorJ = PD.getSetColor(setJ.props);
          if (setColorJ === PD.NO_COLOR) continue;
          if ((setColorJ | 0) === (c | 0)) {
            moves.push({ kind: "playProp", card: cardRef, dest: { p: p, setI: sj } });
          }
        }
      }
    } else if (def.kind === PD.CardKind.House) {
      var sh;
      for (sh = 0; sh < (sets.length | 0); sh++) {
        var setH = sets[sh];
        if ((setH.houseUid | 0) !== 0) continue;
        var col = PD.getSetColor(setH.props);
        if (col === PD.NO_COLOR) continue;
        var req = PD.SET_RULES[col].requiredSize | 0;
        if ((setH.props.length | 0) >= req) {
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
  state.prompt = null;
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

  if (scenarioId === "placeFixed") {
    // P0 has 2 orange properties + $1. P0 also has an existing Orange set with 1 property.
    var setO = PD.newEmptySet();
    PD.setAddPropByDefId(state, setO, "prop_orange", PD.NO_COLOR);
    state.players[0].sets.push(setO);

    state.players[0].hand.push(PD.takeUid(state, "prop_orange"));
    state.players[0].hand.push(PD.takeUid(state, "prop_orange"));
    state.players[0].hand.push(PD.takeUid(state, "money_1"));
  } else if (scenarioId === "placeWild") {
    // P0 has Wild(M/O) and $1.
    state.players[0].hand.push(PD.takeUid(state, "wild_mo"));
    state.players[0].hand.push(PD.takeUid(state, "money_1"));
  } else if (scenarioId === "houseOnComplete") {
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
  } else if (scenarioId === "winCheck") {
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
    state.winnerP = PD.evaluateWin(state) | 0;
  } else {
    throw new Error("unknown_scenario:" + scenarioId);
  }

  PD.fillDeckFromPool(state);
  // Keep deck deterministic for scenarios; callers can shuffle if desired.
  return state;
};

// ---- src/10_debug.js ----
PD.debug = PD.debug || {
  seedU32: 1001,
  scenarioI: 0,
  scenarios: ["default", "placeFixed", "placeWild", "houseOnComplete", "winCheck"],
  state: null,
  lastCmd: "",
  lastEvents: []
};

PD.debugReset = function () {
  var d = PD.debug;
  var scenarioId = d.scenarios[d.scenarioI | 0];
  if (scenarioId === "default") {
    d.state = PD.newGame({ seedU32: d.seedU32 >>> 0 });
  } else {
    d.state = PD.newGame({ seedU32: d.seedU32 >>> 0, scenarioId: scenarioId });
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
  print("Phase 02 Debug", 6, 6, 12);
  print("Scenario: " + d.scenarios[d.scenarioI | 0], 6, 16, 12);
  print("Seed: " + (d.seedU32 >>> 0), 6, 26, 12);

  print("Active: P" + (s.activeP | 0) + "  Plays: " + (s.playsLeft | 0), 6, 38, 12);
  var w = (s.winnerP | 0);
  if (w !== PD.NO_WINNER) print("Winner: P" + w, 6, 48, 11);

  print("Deck: " + (s.deck.length | 0) + "  Discard: " + (s.discard.length | 0), 6, 60, 12);
  print(
    "Hand P0/P1: " + (s.players[0].hand.length | 0) + "/" + (s.players[1].hand.length | 0),
    6,
    70,
    12
  );
  print(
    "Bank P0/P1: " + (s.players[0].bank.length | 0) + "/" + (s.players[1].bank.length | 0),
    6,
    80,
    12
  );
  print(
    "Sets P0/P1: " + (s.players[0].sets.length | 0) + "/" + (s.players[1].sets.length | 0),
    6,
    90,
    12
  );

  var moves = PD.legalMoves(s);
  print("Legal moves: " + (moves.length | 0), 6, 102, 12);
  print("Last cmd: " + (d.lastCmd || "(none)"), 6, 112, 12);
  print("Events: " + PD.debugEventsToLine(d.lastEvents), 6, 120, 12);

  print("A:Step  B:Next  X:Reset  Y:Boot", 6, 128, 13, true, 1, false);
};

PD.mainTick = function () {
  // Default: debug screen (so Phase 02 is visible).
  if (PD._mainMode == null) PD._mainMode = 1;
  if (typeof btnp === "function" && btnp(7)) PD._mainMode = PD._mainMode ? 0 : 1;

  if (PD._mainMode) {
    PD.debugTick();
  } else {
    PD.bootTick();
    print("Press Y for Phase 02 Debug", 6, 40, 12);
  }
};

// ---- src/99_main.js ----
function TIC() {
  if (PD.mainTick) PD.mainTick();
  else PD.bootTick();
}

