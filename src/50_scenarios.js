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
  "moveStress",
  // Phase 08+: actions + responses
  "slyJSN"
];

// Optional metadata for debug UI / docs.
PD.scenarios.INFO = {
  placeBasic: { title: "Place (basic)", desc: "Fixed property placement + Rent play-test (opponent has a small bank payable)." },
  wildBasic: { title: "Wild (basic)", desc: "Wild property placement + discard depth demo." },
  houseBasic: { title: "House (basic)", desc: "Build House on complete set only." },
  winCheck: { title: "Win check", desc: "Already-winning board state (game over)." },
  bankScrollShuffle: { title: "Bank+shuffle stress", desc: "Huge bank + reshuffle-on-draw stress case." },
  debtHouseFirst: { title: "Debt: house-first", desc: "Debt prompt where House must be paid before set properties (includes a JSN in hand to test action-sourced payDebt response gating)." },
  placeReceived: { title: "Place received", desc: "Faux-turn placement buffer (includes Wild color choice)." },
  moveStress: { title: "Move stress", desc: "Many partial sets + 9-card hand (props + wilds + rent-any + house) to maximize legalMoves fanout for smoke testing + AI policy tuning." },
  slyJSN: { title: "Sly+JSN", desc: "RespondAction prompt for Sly Deal (Allow vs Just Say No)." },
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
    state.players[0].hand.push(PD.state.takeUid(state, "just_say_no"));

    // Pay a small debt to P1; paying the House overpays and resolves immediately.
    var rentUid = PD.state.takeUid(state, "rent_any");
    state.discard.push(rentUid);
    PD.state.setPrompt(state, { kind: "payDebt", p: 0, toP: 1, rem: 1, buf: [], srcAction: { kind: "rent", fromP: 1, actionUid: rentUid } });
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

    // Opponent has at least one stealable property so Sly Deal has targets.
    // Prefer an Orange-ish pair (incomplete set) so Sly targeting can cycle more than one option.
    // (Orange set requires 3, so 2 cards stays stealable.)
    var setOp = PD.state.newEmptySet();
    PD.scenarios.setAddPropByDefId(state, setOp, "wild_mo", PD.Color.Orange);
    PD.scenarios.setAddPropByDefId(state, setOp, "prop_orange", PD.state.NO_COLOR);
    state.players[1].sets.push(setOp);

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

    // Hand: one of each base property (remaining), one wild, plus rent-any + house + $1 + one action.
    state.players[0].hand.push(PD.state.takeUid(state, "prop_magenta"));
    // Keep Orange out of hand here so we can use it for opponent Sly targets above.
    state.players[0].hand.push(PD.state.takeUid(state, "money_2"));
    state.players[0].hand.push(PD.state.takeUid(state, "prop_black"));
    state.players[0].hand.push(PD.state.takeUid(state, "wild_cb"));

    state.players[0].hand.push(PD.state.takeUid(state, "house"));
    state.players[0].hand.push(PD.state.takeUid(state, "rent_any"));
    state.players[0].hand.push(PD.state.takeUid(state, "money_1"));
    state.players[0].hand.push(PD.state.takeUid(state, "sly_deal"));
  },

  // Phase 08: Sly Deal respondAction prompt (Allow vs JSN).
  slyJSN: function (state) {
    // P0 has a stealable (incomplete) set with a single property.
    var setO = PD.state.newEmptySet();
    var uidT = PD.state.takeUid(state, "prop_orange");
    PD.scenarios.setAddFixedProp(setO, uidT, PD.Color.Orange);
    state.players[0].sets.push(setO);

    // P0 has JSN in hand to respond with.
    state.players[0].hand.push(PD.state.takeUid(state, "just_say_no"));
    state.players[0].hand.push(PD.state.takeUid(state, "money_1"));

    // Opponent played Sly Deal; the action card is already discarded.
    var slyUid = PD.state.takeUid(state, "sly_deal");
    state.discard.push(slyUid);

    PD.state.setPrompt(state, {
      kind: "respondAction",
      p: 0,
      srcAction: { kind: "slyDeal", fromP: 1, actionUid: slyUid },
      target: { uid: uidT, loc: { p: 0, zone: "setProps", setI: 0, i: 0 } }
    });

    state.activeP = 1;
    state.playsLeft = 3;
  },
};

