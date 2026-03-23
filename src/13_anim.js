PD.anim = PD.anim || {};

// Phase 05c: animation plumbing extracted from PD.ui.
// This module owns view.anim queue/steps, but still manipulates UI view state
// (mode/menu/targeting) because animations are a UI-owned “watch” moment.

PD.anim.ensure = function (view) {
  if (!view) return null;
  if (!view.anim) {
    view.anim = { q: [], active: null, lock: false, hiddenByP: [{}, {}] };
  }
  if (!view.anim.q) view.anim.q = [];
  if (!view.anim.hiddenByP) view.anim.hiddenByP = [{}, {}];
  if (!view.anim.hiddenByP[0]) view.anim.hiddenByP[0] = {};
  if (!view.anim.hiddenByP[1]) view.anim.hiddenByP[1] = {};
  return view.anim;
};

PD.anim.onEvents = function (state, view, events) {
  if (!state || !view || !events || events.length === 0) return;
  var anim = PD.anim.ensure(view);
  if (!anim) return;

  // Clear overlays: animations are a read-only “watch” moment.
  if (view.mode !== "prompt") view.mode = "browse";
  if (view.menu) view.menu.items = [];
  if (view.targeting) view.targeting.active = false;

  var uiCfg = (PD.config && PD.config.ui) ? PD.config.ui : {};
  var dealFrames = Math.floor(Number(uiCfg.dealFramesPerCard != null ? uiCfg.dealFramesPerCard : 10));
  var dealGap = Math.floor(Number(uiCfg.dealGapFrames != null ? uiCfg.dealGapFrames : 2));
  var shuffleFrames = Math.floor(Number(uiCfg.shuffleAnimFrames != null ? uiCfg.shuffleAnimFrames : 30));
  var shuffleToastFrames = Math.floor(Number(uiCfg.shuffleToastFrames != null ? uiCfg.shuffleToastFrames : 30));
  if (!isFinite(dealFrames) || dealFrames < 1) dealFrames = 1;
  if (!isFinite(dealGap) || dealGap < 0) dealGap = 0;
  if (!isFinite(shuffleFrames) || shuffleFrames < 1) shuffleFrames = 1;
  if (!isFinite(shuffleToastFrames) || shuffleToastFrames < 1) shuffleToastFrames = 1;
  if (shuffleFrames < shuffleToastFrames) shuffleFrames = shuffleToastFrames;

  var i;
  for (i = 0; i < events.length; i++) {
    var ev = events[i];
    if (!ev || !ev.kind) continue;

    if (ev.kind === "reshuffle") {
      // Toast + simple deck animation; input locked until finished.
      PD.ui.toastPush(view, { id: "deck_shuffle", kind: "info", text: "Deck ran out. Shuffling", frames: shuffleToastFrames });
      anim.q.push({
        kind: "shuffle",
        t: 0,
        frames: shuffleFrames,
        // Visual masking: during shuffle, show deck as empty and discard as empty.
        // Conceptually the discard has already been consumed into the deck; we only animate the deck.
        deckNVis: 0,
        discardNVis: 0
      });
      continue;
    }

    if (ev.kind === "draw") {
      var p = Math.floor(Number(ev.p));
      if (!isFinite(p) || p < 0 || p > 1) continue;
      var uids = ev.uids || [];
      if (!uids || uids.length === 0) continue;

      // Find the hand indices for these drawn uids (engine already moved them into hand).
      var hand = (state.players && state.players[p] && state.players[p].hand) ? state.players[p].hand : [];
      var handIs = [];
      var j;
      for (j = 0; j < uids.length; j++) {
        var uid = uids[j] | 0;
        var k;
        var found = -1;
        for (k = 0; k < hand.length; k++) {
          if ((hand[k] | 0) === (uid | 0)) found = k;
        }
        handIs.push(found);
        if (found >= 0) anim.hiddenByP[p][uid] = true;
      }

      anim.q.push({
        kind: "deal",
        p: p,
        uids: uids.slice(),
        handIs: handIs,
        dealFrames: dealFrames,
        gapFrames: dealGap,
        i: 0,
        phase: "move",
        t: 0
      });
    }
  }

  anim.lock = !!(anim.active || (anim.q && anim.q.length));
};

PD.anim.tick = function (state, view) {
  if (!view) return;
  var anim = PD.anim.ensure(view);
  if (!anim) return;

  // Start next step if idle.
  if (!anim.active && anim.q && anim.q.length > 0) {
    anim.active = anim.q.shift();
  }

  var a = anim.active;
  if (!a) {
    anim.lock = false;
    return;
  }

  if (a.kind === "shuffle") {
    a.t = (a.t | 0) + 1;
    if ((a.t | 0) >= (a.frames | 0)) anim.active = null;
    anim.lock = !!(anim.active || (anim.q && anim.q.length));
    return;
  }

  if (a.kind === "deal") {
    var p = a.p | 0;
    var uids = a.uids || [];
    if (!uids || uids.length === 0) { anim.active = null; anim.lock = !!(anim.q && anim.q.length); return; }

    if ((a.i | 0) >= (uids.length | 0)) { anim.active = null; anim.lock = !!(anim.q && anim.q.length); return; }

    a.t = (a.t | 0) + 1;
    if (a.phase === "move") {
      if ((a.t | 0) >= (a.dealFrames | 0)) {
        // Reveal current card.
        var uid = uids[a.i] | 0;
        if (anim.hiddenByP && anim.hiddenByP[p]) delete anim.hiddenByP[p][uid];
        a.i = (a.i | 0) + 1;
        a.t = 0;
        if ((a.i | 0) >= (uids.length | 0)) {
          anim.active = null;
        } else {
          a.phase = "gap";
        }
      }
    } else {
      // gap
      if ((a.t | 0) >= (a.gapFrames | 0)) {
        a.phase = "move";
        a.t = 0;
      }
    }

    anim.lock = !!(anim.active || (anim.q && anim.q.length));
    return;
  }

  // Unknown anim kind: drop it.
  anim.active = null;
  anim.lock = !!(anim.q && anim.q.length);
};

// Phase 05c+: treat cursor-flash feedback as an animation/fx owned here.
PD.anim.feedbackError = function (view, code, msg) {
  if (!view || !view.feedback) return;
  code = String(code || "error");
  msg = String(msg || "");

  var fb = view.feedback;
  var attempts = fb.attemptsByCode[code] || 0;
  attempts += 1;
  fb.attemptsByCode[code] = attempts;

  // Always blink; only show message on repeated attempts.
  fb.blinkFrames = 18;
  fb.blinkPhase = 0;

  if (attempts >= 2 && msg) {
    // Toast UI lives in PD.ui; this just triggers it as part of the feedback FX.
    PD.ui.toastPush(view, { id: "err:" + code, kind: "error", text: msg, frames: 90 });
  }
};

PD.anim.feedbackTick = function (view) {
  if (!view || !view.feedback) return;
  var fb = view.feedback;

  var blinkFrames = Number(fb.blinkFrames || 0);
  if (!isFinite(blinkFrames)) blinkFrames = 0;
  if (blinkFrames > 0) {
    blinkFrames = blinkFrames - 1;
    fb.blinkFrames = blinkFrames;
    // 2 blinks: toggle every 3 frames.
    fb.blinkPhase = Math.floor(blinkFrames / 3);
  } else {
    fb.blinkFrames = 0;
    fb.blinkPhase = 0;
  }
};

// Phase 05c: presentation (render-facing view of state/models).
// Renderer should not depend on `view.anim`; instead, UI calls this after building models.
PD.anim.present = function (state, view, computed) {
  if (!state || !view || !computed || !computed.models) return computed;
  var anim = view.anim;
  var a = anim ? anim.active : null;

  // Reset any prior overlay presentation (computed is rebuilt each call, but be explicit).
  computed.animOverlay = null;

  // Provide highlight color for render (cursor flash on disallowed actions).
  // Default highlight color lives in render config.
  var colDefault = PD.config.render.style.colHighlight;
  var hl = colDefault;
  if (view.feedback && (view.feedback.blinkFrames | 0) > 0) {
    if (((view.feedback.blinkPhase | 0) % 2) === 0) hl = PD.Pal.Red;
  }
  computed.highlightCol = hl;

  // Phase 05c: hide in-flight dealt cards until revealed (presentation-only).
  if (anim && anim.hiddenByP) {
    var rowPH = PD.render.ROW_P_HAND | 0;
    var rowOH = PD.render.ROW_OP_HAND | 0;
    var rows = [rowOH, rowPH];
    var ri;
    for (ri = 0; ri < rows.length; ri++) {
      var row = rows[ri];
      var rm = computed.models[row];
      if (!rm || !rm.items) continue;
      var p = (row === rowPH) ? 0 : 1;
      var hidden = anim.hiddenByP[p];
      if (!hidden) continue;
      var out = [];
      var i;
      for (i = 0; i < rm.items.length; i++) {
        var it0 = rm.items[i];
        if (!it0 || it0.kind !== "hand") { out.push(it0); continue; }
        var uid0 = it0.uid | 0;
        if (hidden[uid0]) continue;
        out.push(it0);
      }
      rm.items = out;
    }
  }

  if (!a || !a.kind) return computed;

  var rowCenter = PD.render.ROW_CENTER | 0;
  var rmC = computed.models[rowCenter];

  if (a.kind === "shuffle") {
    // Drive deck/discard pile presentation via model item hints.
    if (rmC && rmC.items) {
      var i;
      for (i = 0; i < rmC.items.length; i++) {
        var it = rmC.items[i];
        if (!it || !it.kind) continue;
        if (it.kind === "deck") {
          it.nVis = (a.deckNVis != null) ? (a.deckNVis | 0) : null;
          // Cycle 0/1/2 underlayers to suggest shuffling.
          var phase = (a.t | 0) % 12;
          var layers = 0;
          if (phase >= 4 && phase < 8) layers = 1;
          else if (phase >= 8) layers = 2;
          it.pileLayers = layers;
        } else if (it.kind === "discard") {
          // Discard is conceptually consumed at reshuffle time.
          it.nVis = 0;
          it.topUidVis = 0;
        }
      }
    }
    return computed;
  }

  if (a.kind === "deal") {
    if (a.phase !== "move") return computed;
    var p = a.p | 0;
    var uids = a.uids || [];
    var handIs = a.handIs || [];
    var iCard = a.i | 0;
    if (iCard < 0 || iCard >= uids.length) return computed;

    var frames = (a.dealFrames | 0);
    if (frames < 1) frames = 1;
    var t = (a.t | 0);
    if (t < 0) t = 0;
    if (t > frames) t = frames;
    var u = t / frames;

    // Find deck position from computed center-row model.
    var deckX = null, deckY = null;
    if (rmC && rmC.items) {
      var j;
      for (j = 0; j < rmC.items.length; j++) {
        var it2 = rmC.items[j];
        if (it2 && it2.kind === "deck") { deckX = it2.x; deckY = it2.y; break; }
      }
    }
    if (deckX == null || deckY == null) return computed;

    var rowHand = (p === 0) ? (PD.render.ROW_P_HAND | 0) : (PD.render.ROW_OP_HAND | 0);

    var camCenter = (view.camX && view.camX[rowCenter] != null) ? view.camX[rowCenter] : 0;
    var camH = (view.camX && view.camX[rowHand] != null) ? view.camX[rowHand] : 0;

    var L = (PD.config && PD.config.render && PD.config.render.layout) ? PD.config.render.layout : null;
    if (!L) return computed;
    var padX = L.rowPadX;
    var xHandStart = (p === 0) ? padX : (L.screenW - padX - L.faceW);
    var handStep = (p === 0) ? L.handStrideX : (-L.handStrideX);
    var handI = (handIs && handIs[iCard] != null) ? (handIs[iCard] | 0) : -1;
    if (handI < 0) return computed;

    var xToW = xHandStart + handI * handStep;
    var yToW = (L.rowY && L.rowY[rowHand] != null) ? (L.rowY[rowHand] + 1) : 0;

    // Screen-space endpoints (camera-adjusted).
    var xFromS = (deckX - camCenter);
    var yFromS = deckY;
    var xToS = (xToW - camH);
    var yToS = yToW;

    var x = Math.floor(xFromS + (xToS - xFromS) * u);
    var y = Math.floor(yFromS + (yToS - yFromS) * u);

    computed.animOverlay = {
      kind: "dealCard",
      x: x,
      y: y,
      p: p,
      uid: uids[iCard] | 0
    };
    return computed;
  }

  return computed;
};

