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
PD.SCENARIO_IDS = [
  "placeBasic",
  "wildBasic",
  "houseBasic",
  "winCheck",
  "bankScrollShuffle",
  // Phase 06
  "debtHouseFirst",
  "placeReceived"
];

// Optional metadata for debug UI / docs.
PD.SCENARIO_INFO = {
  placeBasic: { title: "Place (basic)", desc: "Fixed property placement + Rent play-test (opponent has a small bank payable)." },
  wildBasic: { title: "Wild (basic)", desc: "Wild property placement + discard depth demo." },
  houseBasic: { title: "House (basic)", desc: "Build House on complete set only." },
  winCheck: { title: "Win check", desc: "Already-winning board state (game over)." },
  bankScrollShuffle: { title: "Bank+shuffle stress", desc: "Huge bank + reshuffle-on-draw stress case." },
  debtHouseFirst: { title: "Debt: house-first", desc: "Debt prompt where House must be paid before set properties." },
  placeReceived: { title: "Place received", desc: "Faux-turn placement buffer (includes Wild color choice)." },
};

PD._scenarioApplyById = {
  placeBasic: function (state) {
    // P0 has 2 orange properties + $1. P0 also has an existing Orange set with 1 property.
    var setO = PD.newEmptySet();
    PD.setAddPropByDefId(state, setO, "prop_orange", PD.NO_COLOR);
    state.players[0].sets.push(setO);

    state.players[0].hand.push(PD.takeUid(state, "prop_orange"));
    state.players[0].hand.push(PD.takeUid(state, "prop_orange"));
    state.players[0].hand.push(PD.takeUid(state, "money_1"));
    // Add a rent card that matches Orange (Magenta/Orange rent).
    state.players[0].hand.push(PD.takeUid(state, "rent_mo"));

    // Ensure opponent has something payable so Rent triggers payDebt.
    state.players[1].bank.push(PD.takeUid(state, "money_1"));
  },

  wildBasic: function (state) {
    // P0 has Wild(M/O) and $1.
    state.players[0].hand.push(PD.takeUid(state, "wild_mo"));
    state.players[0].hand.push(PD.takeUid(state, "money_1"));

    // Discard demo (depth=3): top card is last.
    state.discard.push(PD.takeUid(state, "money_2"));
    state.discard.push(PD.takeUid(state, "money_1"));
    state.discard.push(PD.takeUid(state, "rent_cb"));
  },

  houseBasic: function (state) {
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
  },

  bankScrollShuffle: function (state) {
    // Dev scenario:
    // - P0 bank contains *all* bankable cards (money/action/house) to stress bank stack/scrolling.
    // - Most remaining cards are in discard (to stress reshuffle).
    // - Leave exactly 1 card in deck so the next draw forces a reshuffle.
    // - Ensure P1 hand is non-empty so endTurn draws 2 (not 5).

    if (!state._pool) PD.cardPoolInit(state);

    // Seed P1 hand with 1 property so startTurn draws 2.
    state.players[1].hand.push(PD.takeUid(state, "prop_cyan"));

    // Drain pool: bankables -> P0 bank; non-bankables -> discard.
    var di;
    for (di = 0; di < PD.CARD_DEFS.length; di++) {
      var def = PD.CARD_DEFS[di];
      if (!def || !def.id) continue;
      var defId = def.id;
      var a = state._pool[defId];
      if (!a || (a.length | 0) === 0) continue;

      // NOTE: scenario pool contains only uids, so we inspect the def kind here.
      var bankable = PD.isBankableDef(def);
      while (a.length > 0) {
        var uid = a.pop() | 0;
        if (bankable) state.players[0].bank.push(uid);
        else state.discard.push(uid);
      }
    }

    // Put back one card into the pool so it becomes the (1-card) deck.
    // Prefer taking from discard so the discard->deck reshuffle still has plenty of cards.
    if (state.discard.length > 0) {
      var keepUid = state.discard.pop() | 0;
      var keepDef = PD.defByUid(state, keepUid);
      var keepId = keepDef && keepDef.id ? String(keepDef.id) : "";
      if (keepId) {
        if (!state._pool[keepId]) state._pool[keepId] = [];
        state._pool[keepId].push(keepUid);
      } else {
        // Fallback: if we can't map it, just return it to discard (deck will be empty).
        state.discard.push(keepUid);
      }
    }

    // Keep hand small and end-turn legal.
    state.players[0].hand = [];
    state.activeP = 0;
    state.playsLeft = 0;
    state.winnerP = PD.NO_WINNER;
  },

  // Phase 06: prompt-driven debt payment where House must be paid first.
  // Goal: exercise prompt actor separation + house-first redirect + overpay allowed.
  debtHouseFirst: function (state) {
    // P0: complete Cyan set with a House.
    var setC = PD.newEmptySet();
    PD.setAddPropByDefId(state, setC, "prop_cyan", PD.NO_COLOR);
    PD.setAddPropByDefId(state, setC, "prop_cyan", PD.NO_COLOR);
    setC.houseUid = PD.takeUid(state, "house");
    state.players[0].sets.push(setC);

    // Keep bank empty so the only payable is the House (forces the rule).
    state.players[0].bank = [];

    // Add a little hand so the UI isn't empty.
    state.players[0].hand.push(PD.takeUid(state, "rent_cb"));

    // Pay a small debt to P1; paying the House overpays and resolves immediately.
    PD.setPrompt(state, { kind: "payDebt", p: 0, toP: 1, rem: 1, buf: [] });
  },

  // Phase 06: recipient faux-turn placement buffer (received properties).
  placeReceived: function (state) {
    // P0 has an existing Orange set to allow placing into existing sets.
    var setO = PD.newEmptySet();
    PD.setAddPropByDefId(state, setO, "prop_orange", PD.NO_COLOR);
    state.players[0].sets.push(setO);

    // Prompt buffer: one fixed property + one Wild to place (wild assignment chosen during placement).
    var recv = [];
    recv.push(PD.takeUid(state, "prop_orange"));
    recv.push(PD.takeUid(state, "wild_mo"));
    PD.setPrompt(state, { kind: "placeReceived", p: 0, uids: recv });

    // Keep normal hand visible for the “faux-hand + real hand” row layout.
    state.players[0].hand.push(PD.takeUid(state, "money_1"));
    state.players[0].hand.push(PD.takeUid(state, "rent_mo"));
  },
};

