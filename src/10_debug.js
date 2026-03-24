PD.debug = PD.debug || {
  scenarioI: 0,
  scenarios: null,
  state: null,
  view: null,
  ctrl: null,
  lastCmd: "",
  lastEvents: [],
  lastRaw: null,
  lastUiActions: null,
  lastUiIntentSummary: ""
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
  d.view = PD.ui.newView();
  d.ctrl = PD.controls.newState();
  d.lastCmd = "";
  d.lastEvents = [];
  d.lastRaw = null;
  d.lastUiActions = null;
  d.lastUiIntentSummary = "";
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

  function printSmall(msg, x, y, col) {
    if (col == null) col = 12;
    // smallfont=true and fixed=true keeps layout predictable.
    print(String(msg || ""), x, y, col, true, 1, true);
  }

  function bool01(v) { return v ? 1 : 0; }

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

  function promptLine(state) {
    if (!state) return "Prompt:(none)";
    var pr = state.prompt;
    if (!pr || !pr.kind) return "Prompt:(none)";
    var k = String(pr.kind);

    if (k === "payDebt") {
      var rem = Math.floor(Number(pr.rem || 0));
      if (!isFinite(rem)) rem = 0;
      var bufN = (pr.buf && pr.buf.length) ? (pr.buf.length | 0) : 0;
      return "Prompt:payDebt rem:$" + rem + " buf:" + bufN;
    }

    if (k === "placeReceived") {
      var uN = (pr.uids && pr.uids.length) ? (pr.uids.length | 0) : 0;
      return "Prompt:placeRecv n:" + uN;
    }

    if (k === "discardDown") {
      var p = pr.p | 0;
      var hand = (state.players && state.players[p] && state.players[p].hand) ? state.players[p].hand : [];
      var handLen = hand.length | 0;
      var nDiscarded = Math.floor(Number(pr.nDiscarded || 0));
      if (!isFinite(nDiscarded)) nDiscarded = 0;
      if (nDiscarded < 0) nDiscarded = 0;
      // Stable target count: initialHand - HAND_MAX.
      var nToDiscard = (handLen + nDiscarded) - (PD.HAND_MAX | 0);
      if (nToDiscard < 0) nToDiscard = 0;
      var left = handLen - (PD.HAND_MAX | 0);
      if (left < 0) left = 0;
      return "Prompt:discardDown to:" + nToDiscard + " left:" + left;
    }

    return "Prompt:" + k;
  }

  cls(0);
  var x = 6;
  var y = 6;
  var step = 6;
  var xR = 120;

  printSmall("Phase 02 Debug", x, y, 12); y += step;
  var sid = d.scenarios[d.scenarioI];
  var info = (PD.SCENARIO_INFO && sid) ? PD.SCENARIO_INFO[String(sid)] : null;
  var title = (info && info.title) ? String(info.title) : String(sid);
  printSmall("Scenario:" + title, x, y, 12); y += step;
  var pendingDesc = (info && info.desc) ? String(info.desc) : "";
  printSmall("Seed:" + (PD.computeSeed() >>> 0), x, y, 12); y += step;

  if (PD.render && PD.render.debug && typeof PD.render.debug.selectedLines === "function") {
    var sel = PD.render.debug.selectedLines(d);
    if (sel && sel.length) {
      printSmall(sel[0] || "", x, y, 12); y += step;
      if (sel[1]) { printSmall(sel[1], x, y, 12); y += step; }
    }
  }

  printSmall("Active:P" + s.activeP + " Plays:" + s.playsLeft, x, y, 12); y += step;
  printSmall(promptLine(s), x, y, 12); y += step;
  var w = s.winnerP;
  if (w !== PD.NO_WINNER) { printSmall("Winner:P" + w, x, y, 11); y += step; }

  printSmall("Deck:" + s.deck.length + " Disc:" + s.discard.length, x, y, 12); y += step;
  printSmall("Hand0/1:" + s.players[0].hand.length + "/" + s.players[1].hand.length, x, y, 12); y += step;
  printSmall(
    "Bank0/1:" +
    s.players[0].bank.length + "($" + bankValueTotal(s, 0) + ")/" +
    s.players[1].bank.length + "($" + bankValueTotal(s, 1) + ")",
    x,
    y,
    12
  ); y += step;
  printSmall("Sets0/1:" + s.players[0].sets.length + "/" + s.players[1].sets.length, x, y, 12); y += step;

  var moves = PD.legalMoves(s);
  printSmall("Legal:" + moves.length, x, y, 12); y += step;
  printSmall("LastCmd:" + (d.lastCmd || "(none)"), x, y, 12); y += step;
  printSmall("Events:" + PD.debugEventsToLine(d.lastEvents), x, y, 12); y += step;
  // Render scenario description after Events so it doesn't overlap the right UI column.
  if (pendingDesc) { printSmall(pendingDesc, x, y, 13); y += step; }

  // Right column: UI snapshot (from last Render-mode tick).
  var v = d.view;
  var yR = 6;
  if (v) {
    var isDragging = !!(v.mode === "targeting" && v.targeting && v.targeting.active && v.targeting.hold);
    printSmall("UI:" + String(v.mode || "?") + " I:" + bool01(v.inspectActive) + " Drag:" + bool01(isDragging), xR, yR, 12); yR += step;
    if (v.cursor) printSmall("Cur:r" + (v.cursor.row | 0) + " i" + (v.cursor.i | 0), xR, yR, 12);
    yR += step;

    if (v.mode === "menu" && v.menu && v.menu.items) {
      var nM = v.menu.items.length | 0;
      var mi = (nM > 0) ? PD.ui.clampI(Math.floor(Number(v.menu.i || 0)), nM) : 0;
      var it = (nM > 0) ? v.menu.items[mi] : null;
      var id = it ? String(it.id || "?") : "(none)";
      printSmall("Menu:" + mi + "/" + nM + " " + id, xR, yR, 12); yR += step;
    }

    if (v.mode === "targeting" && v.targeting && v.targeting.active) {
      var t = v.targeting;
      var nC = (t.cmds && t.cmds.length) ? (t.cmds.length | 0) : 0;
      var ci = (nC > 0) ? PD.ui.clampI(Math.floor(Number(t.cmdI || 0)), nC) : 0;
      printSmall("Tgt:" + String(t.kind || "?") + " " + ci + "/" + nC + " h:" + bool01(t.hold), xR, yR, 12); yR += step;
    }

    if (v.mode === "prompt" && s.prompt && s.prompt.kind) {
      printSmall("Prompt:" + String(s.prompt.kind), xR, yR, 12); yR += step;
    }
  } else {
    printSmall("UI:(no view)", xR, yR, 12); yR += step;
  }

  // Inputs/state (favor persistent states over one-frame pulses).
  var raw0 = d.lastRaw;
  var down0 = raw0 && raw0.down ? raw0.down : null;
  if (down0) {
    printSmall(
      "Down:U" + bool01(down0[0]) + "D" + bool01(down0[1]) + "L" + bool01(down0[2]) + "R" + bool01(down0[3]) +
      " A" + bool01(down0[4]) + "B" + bool01(down0[5]) + "X" + bool01(down0[6]) + "Y" + bool01(down0[7]),
      xR,
      yR,
      13
    ); yR += step;
  } else {
    printSmall("Down:(no raw yet)", xR, yR, 13); yR += step;
  }

  var st = d.ctrl;
  if (st && st.held) {
    var held = st.held;
    var heldA = (held[4] | 0);
    var heldX = (held[6] | 0);
    printSmall(
      "Held:A" + heldA + " X" + heldX + " Grab:" + bool01(st.aGrabActive) + " XLatch:" + bool01(st.xInspectActive),
      xR,
      yR,
      13
    ); yR += step;
  } else {
    printSmall("Held:(no ctrl yet)", xR, yR, 13); yR += step;
  }

  printSmall("Intent:" + (d.lastUiIntentSummary || "(none)"), xR, yR, 13);

  printSmall("A:Step  B:Next  X:Reset  Y:Mode", 6, 128, 13);
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
  if (!d.view) d.view = PD.ui.newView();
  if (!d.ctrl) d.ctrl = PD.controls.newState();

  {
    function summarizeUiIntent(intent) {
      if (!intent || !intent.kind) return "(none)";
      if (intent.kind === "applyCmd" && intent.cmd && intent.cmd.kind) return "applyCmd:" + String(intent.cmd.kind);
      if (intent.kind === "debug" && intent.action) return "debug:" + String(intent.action);
      return String(intent.kind);
    }

    var raw = PD.controls.pollGlobals();
    d.lastRaw = raw;
    var actions = PD.controls.actions(d.ctrl, raw, PD.config.controls);
    d.lastUiActions = actions;
    var intent = PD.ui.step(d.state, d.view, actions);
    d.lastUiIntentSummary = summarizeUiIntent(intent);

    if (intent && intent.kind === "applyCmd" && intent.cmd) {
      try {
        var res = PD.applyCommand(d.state, intent.cmd);
        d.lastCmd = intent.cmd.kind;
        d.lastEvents = (res && res.events) ? res.events : [];
        PD.anim.onEvents(d.state, d.view, d.lastEvents);

        // Phase 06 (Rent vertical slice): temporarily auto-resolve opponent debt prompts so
        // Rent can be play-tested end-to-end before full AI/hotseat/JSN UX exists.
        // Deterministic: uses the same seeded RNG in GameState.
        var guard = 0;
        while (d.state.prompt && d.state.prompt.kind === "payDebt" && (d.state.prompt.p | 0) === 1) {
          guard++;
          if (guard > 50) break;
          var movesAuto = PD.legalMoves(d.state);
          if (!movesAuto || movesAuto.length === 0) break;
          var idx = PD.rngNextInt(d.state, movesAuto.length);
          var mv = movesAuto[idx];
          if (!mv || mv.kind !== "payDebt") break;
          var res2 = PD.applyCommand(d.state, mv);
          var ev2 = (res2 && res2.events) ? res2.events : [];
          // Merge events for debug display; keep lastCmd the last auto step.
          d.lastCmd = "auto:" + mv.kind;
          d.lastEvents = d.lastEvents.concat(ev2);
          PD.anim.onEvents(d.state, d.view, ev2);
        }
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
        else if (code === "house_pay_first") msg = "House must be paid first";
        PD.anim.feedbackError(d.view, code, msg);
      }
    } else if (intent && intent.kind === "debug") {
      if (intent.action === "step") {
        PD.debugStep();
        PD.anim.onEvents(d.state, d.view, d.lastEvents);
      }
      else if (intent.action === "reset") PD.debugReset();
      else if (intent.action === "nextScenario") PD.debugNextScenario();
    }

    var computed = PD.ui.computeRowModels(d.state, d.view);
    PD.ui.updateCameras(d.state, d.view, computed);
    // Recompute after camera updates (selection/cam are orthogonal, but keep it stable).
    computed = PD.ui.computeRowModels(d.state, d.view);

    PD.render.drawFrame({ state: d.state, view: d.view, computed: computed });
  }
};

