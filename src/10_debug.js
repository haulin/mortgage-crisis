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

