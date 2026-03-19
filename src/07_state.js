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

