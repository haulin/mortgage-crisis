PD.NO_COLOR = -1;
PD.NO_WINNER = -1;
PD.HAND_MAX = 7;

PD.clearPrompt = function (state) {
  state.prompt = null;
};

PD.setPrompt = function (state, prompt) {
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

PD.hasAnyPayables = function (state, p) {
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

PD.beginDebt = function (state, fromP, toP, amount) {
  if (!(amount > 0)) return;
  if (!PD.hasAnyPayables(state, fromP)) return;
  PD.setPrompt(state, { kind: "payDebt", p: fromP, toP: toP, rem: amount, buf: [] });
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
  return def.wildColors[0] === color || def.wildColors[1] === color;
};

PD.shuffleUidsInPlace = function (state, arr) {
  return PD.shuffleByNextInt(arr, function (n) { return PD.rngNextInt(state, n); });
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
  if (n <= 0) return;
  if (!state.deck) state.deck = [];
  if (!state.discard) state.discard = [];

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
      PD.shuffleUidsInPlace(state, state.deck);
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

PD.startTurn = function (state, events) {
  state.playsLeft = 3;
  PD.clearPrompt(state);
  var p = state.activeP;
  var nDraw = 2;
  if (state.players[p].hand.length === 0) nDraw = 5;
  PD.drawToHand(state, p, nDraw, events);
  if (events) events.push({ kind: "plays", p: state.activeP, playsLeft: state.playsLeft });
};

PD.newGame = function (opts) {
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

