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

