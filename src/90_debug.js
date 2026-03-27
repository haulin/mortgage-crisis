// PD.debug: dev harness (scenario cycling/reset/step) + main tick wiring for playtesting.
PD.debug.scenarioI = 0;
PD.debug.scenarios = ["default"].concat(PD.scenarios.IDS);
PD.debug.state = null;
PD.debug.view = PD.ui.newView();
PD.debug.ctrl = PD.controls.newState();
PD.debug.ai = { wait: 0 };
PD.debug.lastCmd = "";
PD.debug.lastEvents = [];
PD.debug.lastRaw = null;
PD.debug.lastUiActions = null;
PD.debug.lastUiIntentSummary = "";

PD.debug.reset = function (opts) {
  var d = PD.debug;
  var prevPaused = !!d.view.ux.autoFocusPausedByDebug;
  var shouldPause = !!(opts && opts.pauseAutoFocus) || prevPaused;
  var seedU32 = PD.seed.computeSeedU32();
  var scenarioId = d.scenarios[d.scenarioI];
  if (scenarioId === "default") {
    d.state = PD.state.newGame({ seedU32: seedU32 });
  } else {
    d.state = PD.state.newGame({ seedU32: seedU32, scenarioId: scenarioId });
  }
  d.view = PD.ui.newView();
  if (shouldPause) d.view.ux.autoFocusPausedByDebug = true;
  d.ctrl = PD.controls.newState();
  d.ai = { wait: 0 };
  d.lastCmd = "";
  d.lastEvents = [];
  d.lastRaw = null;
  d.lastUiActions = null;
  d.lastUiIntentSummary = "";
};

PD.debug.nextScenario = function () {
  var d = PD.debug;
  d.scenarioI = (d.scenarioI + 1) % d.scenarios.length;
  PD.debug.reset({ pauseAutoFocus: true });
};

PD.debug.step = function () {
  var d = PD.debug;
  var state = d.state;
  var moves = PD.engine.legalMoves(state);
  var p = PD.ai.actor(state);
  var policy = PD.ai.policyForP(p);
  var cmd = PD.ai.pickMove(state, moves, policy);
  if (!cmd) return;

  var res = PD.engine.applyCommand(state, cmd);
  d.lastCmd = cmd.kind;
  d.lastEvents = (res && res.events) ? res.events : [];
};

PD.debug.eventsToLine = function (events) {
  if (!events || events.length === 0) return "(none)";
  var parts = [];
  var i;
  for (i = 0; i < events.length; i++) {
    parts.push(events[i].kind);
  }
  return parts.join(",");
};

PD.debug.tickTextMode = function () {
  var d = PD.debug;

  if (typeof btnp === "function") {
    // A: step, B: next scenario, X: reset
    if (btnp(4)) PD.debug.step();
    if (btnp(5)) PD.debug.nextScenario();
    if (btnp(6)) PD.debug.reset({ pauseAutoFocus: true });
  }

  var s = d.state;

  function printSmall(msg, x, y, col) {
    if (col == null) col = 12;
    // smallfont=true and fixed=true keeps layout predictable.
    print(String(msg || ""), x, y, col, true, 1, true);
  }

  function bool01(v) { return v ? 1 : 0; }

  function promptLine(state) {
    if (!state) return "Prompt:(none)";
    var pr = state.prompt;
    if (!pr || !pr.kind) return "Prompt:(none)";
    var k = String(pr.kind);

    if (k === "payDebt") {
      var rem = pr.rem;
      var bufN = (pr.buf && pr.buf.length) ? pr.buf.length : 0;
      return "Prompt:payDebt rem:$" + rem + " buf:" + bufN;
    }

    if (k === "placeReceived") {
      var uN = (pr.uids && pr.uids.length) ? pr.uids.length : 0;
      return "Prompt:placeRecv n:" + uN;
    }

    if (k === "discardDown") {
      var p = pr.p;
      var hand = (state.players && state.players[p] && state.players[p].hand) ? state.players[p].hand : [];
      var handLen = hand.length;
      var nDiscarded = pr.nDiscarded;
      // Stable target count: initialHand - HAND_MAX.
      var nToDiscard = (handLen + nDiscarded) - PD.state.HAND_MAX;
      if (nToDiscard < 0) nToDiscard = 0;
      var left = handLen - PD.state.HAND_MAX;
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
  var info = (PD.scenarios.INFO && sid) ? PD.scenarios.INFO[String(sid)] : null;
  var title = (info && info.title) ? String(info.title) : String(sid);
  printSmall("Scenario:" + title, x, y, 12); y += step;
  var pendingDesc = (info && info.desc) ? String(info.desc) : "";
  printSmall("Seed:" + PD.seed.computeSeedU32(), x, y, 12); y += step;

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
  if (w !== PD.state.NO_WINNER) { printSmall("Winner:P" + w, x, y, 11); y += step; }

  printSmall("Deck:" + s.deck.length + " Disc:" + s.discard.length, x, y, 12); y += step;
  printSmall("Hand0/1:" + s.players[0].hand.length + "/" + s.players[1].hand.length, x, y, 12); y += step;
  printSmall(
    "Bank0/1:" +
    s.players[0].bank.length + "($" + PD.util.bankValueTotal(s, 0) + ")/" +
    s.players[1].bank.length + "($" + PD.util.bankValueTotal(s, 1) + ")",
    x,
    y,
    12
  ); y += step;
  printSmall("Sets0/1:" + s.players[0].sets.length + "/" + s.players[1].sets.length, x, y, 12); y += step;

  var moves = PD.engine.legalMoves(s);
  printSmall("Legal:" + moves.length, x, y, 12); y += step;
  printSmall("LastCmd:" + (d.lastCmd || "(none)"), x, y, 12); y += step;
  printSmall("Events:" + PD.debug.eventsToLine(d.lastEvents), x, y, 12); y += step;

  // Long focus rule ids don't fit well in the right column; render them full-width here.
  var vFocus = d.view;
  if (vFocus && vFocus.ux && vFocus.ux.lastFocusRuleId) {
    printSmall("FocusRule:" + String(vFocus.ux.lastFocusRuleId), x, y, 12); y += step;
  }

  // Render scenario description after Events so it doesn't overlap the right UI column.
  if (pendingDesc) { printSmall(pendingDesc, x, y, 13); y += step; }

  // Right column: UI snapshot (from last Render-mode tick).
  var v = d.view;
  var yR = 6;
  if (v) {
    var isDragging = !!(v.mode === "targeting" && v.targeting && v.targeting.active && v.targeting.hold);
    printSmall("UI:" + String(v.mode || "?") + " I:" + bool01(v.inspectActive) + " Drag:" + bool01(isDragging), xR, yR, 12); yR += step;
    if (v.cursor) printSmall("Cur:r" + v.cursor.row + " i" + v.cursor.i, xR, yR, 12);
    yR += step;

    if (v.ux) {
      var a = v.ux.selAnchor;
      if (a) {
        var zone = (a.loc && a.loc.zone) ? String(a.loc.zone) : "?";
        printSmall("Anchor:uid" + a.uid + " " + zone, xR, yR, 12); yR += step;
      }
      if (v.ux.pendingFocusErrorCode) {
        printSmall("FocusErr:" + String(v.ux.pendingFocusErrorCode), xR, yR, 12); yR += step;
      }
    }

    if (v.mode === "menu" && v.menu && v.menu.items) {
      var nM = v.menu.items.length;
      var mi = (nM > 0) ? PD.ui.clampI(v.menu.i, nM) : 0;
      var it = (nM > 0) ? v.menu.items[mi] : null;
      var id = it ? String(it.id || "?") : "(none)";
      printSmall("Menu:" + mi + "/" + nM + " " + id, xR, yR, 12); yR += step;
    }

    if (v.mode === "targeting" && v.targeting && v.targeting.active) {
      var t = v.targeting;
      var nC = (t.cmds && t.cmds.length) ? t.cmds.length : 0;
      var ci = (nC > 0) ? PD.ui.clampI(t.cmdI, nC) : 0;
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
    var heldA = held[4];
    var heldX = held[6];
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
  if (typeof btnp === "function" && btnp(7)) PD._mainMode = PD._mainMode ? 0 : 1;

  if (PD._mainMode === 0) {
    if (PD.debug.state == null) PD.debug.reset(null);
    PD.debug.tickTextMode();
    return;
  }

  // Render mode
  var d = PD.debug;
  if (d.state == null) PD.debug.reset(null);

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

    // Phase 07: AI acts for actor=1 (activeP or prompt.p). While AI is acting, suppress player input.
    var actor = PD.ai.actor(d.state);
    if (actor !== 0) actions = {};

    var intent = PD.ui.step(d.state, d.view, actions);
    d.lastUiIntentSummary = summarizeUiIntent(intent);

    if (actor === 0 && intent && intent.kind === "applyCmd" && intent.cmd) {
      try {
        var res = PD.engine.applyCommand(d.state, intent.cmd);
        d.lastCmd = intent.cmd.kind;
        d.lastEvents = (res && res.events) ? res.events : [];
        PD.anim.onEvents(d.state, d.view, d.lastEvents);
      } catch (err) {
        d.lastCmd = intent.cmd.kind + "(!)";
        d.lastEvents = [];
        var code = (err && err.message) ? String(err.message) : "error";
        var msg = PD.fmt.errorMessage(code);
        PD.anim.feedbackError(d.view, code, msg);
      }
    } else if (actor === 0 && intent && intent.kind === "debug") {
      if (intent.action === "step") {
        PD.debug.step();
        PD.anim.onEvents(d.state, d.view, d.lastEvents);
      }
      else if (intent.action === "reset") PD.debug.reset({ pauseAutoFocus: true });
      else if (intent.action === "nextScenario") PD.debug.nextScenario();
    }

    // Phase 07: AI pacing loop (one command per step, with fixed delay).
    if (actor !== 0 && !(d.view && d.view.anim && d.view.anim.lock)) {
      if (d.ai.wait > 0) {
        d.ai.wait -= 1;
      } else {
        var cmdAi = PD.ai.pickRandomLegalMove(d.state);
        if (cmdAi) {
          var txt = PD.ai.describeCmd(d.state, cmdAi);
          if (txt) {
            PD.ui.toastPush(d.view, { id: "ai:narrate", kind: "ai", text: txt, frames: PD.config.ui.aiNarrateToastFrames });
          }
          try {
            var resAi = PD.engine.applyCommand(d.state, cmdAi);
            d.lastCmd = "ai:" + cmdAi.kind;
            d.lastEvents = (resAi && resAi.events) ? resAi.events : [];
            PD.anim.onEvents(d.state, d.view, d.lastEvents);
          } catch (errAi) {
            d.lastCmd = "ai:" + cmdAi.kind + "(!)";
            d.lastEvents = [];
            var codeAi = (errAi && errAi.message) ? String(errAi.message) : "error";
            var msgAi = PD.fmt.errorMessage(codeAi);
            PD.anim.feedbackError(d.view, codeAi, msgAi);
          }
          d.ai.wait = PD.config.ui.aiStepDelayFrames;
        } else {
          d.ai.wait = PD.config.ui.aiStepDelayFrames;
        }
      }
    }

    var computed = PD.ui.computeRowModels(d.state, d.view);
    PD.ui.updateCameras(d.state, d.view, computed);
    // Recompute after camera updates (selection/cam are orthogonal, but keep it stable).
    computed = PD.ui.computeRowModels(d.state, d.view);

    PD.render.drawFrame({ state: d.state, view: d.view, computed: computed });
  }
};

PD._mainMode = 0;

