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

