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

