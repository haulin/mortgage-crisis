PD.ui = PD.ui || {};

PD.ui.newView = function () {
  return {
    // View-only state (cursor/camera/menu focus). This is intentionally not part of GameState.
    cursor: { row: 4, i: 0 }, // default to player hand
    camX: [0, 0, 0, 0, 0],

    // browse | menu | targeting
    mode: "browse",

    // Menu (center panel)
    menu: {
      items: [],
      i: 0,
      // Source selection snapshot when menu opened.
      src: null
    },

    // Targeting (Place/Build via hold or via menu)
    targeting: {
      active: false,
      // kind: "place" | "build" | "bank"
      kind: "",
      // true if entered from A-hold (confirm on A release)
      hold: false,
      // source: { uid, loc }
      card: null,
      // for wilds
      wildColor: PD.NO_COLOR,
      // list of concrete engine commands (subset of PD.legalMoves)
      cmds: [],
      cmdI: 0
    },

    // Inspect (hold X with delay)
    inspectActive: false,

    // Feedback: blink + message, plus attempt counts.
    feedback: {
      blinkFrames: 0,
      blinkPhase: 0,
      msg: "",
      msgFrames: 0,
      attemptsByCode: {}
    },

    // Small UX memory (used for one-shot nudges like snapping to End when out of plays).
    ux: {
      lastActiveP: null,
      lastPlaysLeft: null
    }
  };
};

PD.ui.feedbackError = function (view, code, msg) {
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
    fb.msg = msg;
    fb.msgFrames = 90;
  }
};

PD.ui.feedbackTick = function (view) {
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

  var msgFrames = Number(fb.msgFrames || 0);
  if (!isFinite(msgFrames)) msgFrames = 0;
  if (msgFrames > 0) fb.msgFrames = msgFrames - 1;
  else { fb.msgFrames = 0; fb.msg = ""; }
};

PD.ui.clampI = function (i, n) {
  if (n <= 0) return 0;
  if (i < 0) return 0;
  if (i >= n) return n - 1;
  return i;
};

PD.ui.wrapI = function (i, n) {
  if (n <= 0) return 0;
  i = i % n;
  if (i < 0) i = i + n;
  return i;
};

PD.ui.nearestByX = function (items, xCenter) {
  if (!items || items.length === 0) return 0;
  var bestI = 0;
  var bestD = 999999;
  xCenter = Number(xCenter || 0);
  if (!isFinite(xCenter)) xCenter = 0;
  var i;
  for (i = 0; i < items.length; i++) {
    var it = items[i];
    var x = (it && it.x != null) ? Number(it.x) : 0;
    var w = (it && it.w != null) ? Number(it.w) : 0;
    if (!isFinite(x)) x = 0;
    if (!isFinite(w)) w = 0;
    var cx = x + (w / 2);
    var d = cx - xCenter;
    if (d < 0) d = -d;
    if (d < bestD) { bestD = d; bestI = i; }
  }
  return bestI;
};

// Directional navigation (Phase 04 polish): pick closest selectable in a direction,
// based on screen-space geometry (includes row camera offsets).

PD.ui.itemScreenCenter = function (view, item) {
  if (!item) return { cx: 0, cy: 0 };
  var row = item.row;
  var cam = (view && view.camX && view.camX[row] != null) ? view.camX[row] : 0;
  var x = (item.x || 0) - (cam || 0);
  var y = item.y || 0;
  var w = item.w || 0;
  var h = item.h || 0;
  return { cx: x + (w / 2), cy: y + (h / 2) };
};

PD.ui.navPickInDirection = function (view, computed, dir) {
  if (!view || !computed || !computed.models) return null;
  if (!computed.selected) return null;

  dir = String(dir || "");
  var cur = computed.selected;
  var curC = PD.ui.itemScreenCenter(view, cur);
  var curCx = curC.cx;
  var curCy = curC.cy;

  var models = computed.models;
  var cand = [];
  var row;
  for (row = 0; row < 5; row++) {
    var rm = models[row];
    if (!rm || !rm.items) continue;
    var i;
    for (i = 0; i < rm.items.length; i++) {
      var it = rm.items[i];
      if (!it) continue;
      if (it === cur) continue;
      var c = PD.ui.itemScreenCenter(view, it);
      cand.push({ row: row, i: i, it: it, cx: c.cx, cy: c.cy });
    }
  }
  if (cand.length === 0) return null;

  function inDir(c) {
    if (dir === "left") return c.cx < curCx;
    if (dir === "right") return c.cx > curCx;
    if (dir === "up") return c.cy < curCy;
    if (dir === "down") return c.cy > curCy;
    return false;
  }

  function scoreCone(c) {
    var dx = c.cx - curCx;
    var dy = c.cy - curCy;
    var along = (dir === "left" || dir === "right") ? Math.abs(dx) : Math.abs(dy);
    var perp = (dir === "left" || dir === "right") ? Math.abs(dy) : Math.abs(dx);
    // Config is validated in tests (avoid runtime fallbacks in the cartridge).
    var uiCfg = PD.config.ui;
    var k = (dir === "left" || dir === "right") ? uiCfg.navConeKLeftRight : uiCfg.navConeKUpDown;
    return (along * along) + (perp * perp) * k;
  }

  // Primary: closest candidate in the pressed direction.
  // For Left/Right, if the current row has any candidates in that direction,
  // prefer staying in-row (prevents surprising jumps to other rows when the
  // center row contains valid left/right targets like deck/discard).
  var preferSameRow = ((dir === "left" || dir === "right") && (cur && cur.row != null));
  var hasSameRowCandidate = false;
  if (preferSameRow) {
    for (j = 0; j < cand.length; j++) {
      var cs = cand[j];
      if (!inDir(cs)) continue;
      if (cs.it && cs.it.row === cur.row) { hasSameRowCandidate = true; break; }
    }
  }

  var best = null;
  var bestScore = 999999999;
  var j;
  for (j = 0; j < cand.length; j++) {
    var c = cand[j];
    if (!inDir(c)) continue;
    if (hasSameRowCandidate && (!c.it || c.it.row !== cur.row)) continue;
    var s = scoreCone(c);
    if (s < bestScore) { bestScore = s; best = c; }
  }
  if (best) return { row: best.row, i: best.i };

  // Fallback: global axis-wrap (pick farthest extreme on the opposite side).
  var extreme = null;
  if (dir === "up") extreme = -Infinity;
  else if (dir === "down") extreme = Infinity;
  else if (dir === "left") extreme = -Infinity;
  else if (dir === "right") extreme = Infinity;

  // Determine extreme along the axis.
  for (j = 0; j < cand.length; j++) {
    var cc = cand[j];
    if (dir === "up") { if (cc.cy > extreme) extreme = cc.cy; }
    else if (dir === "down") { if (cc.cy < extreme) extreme = cc.cy; }
    else if (dir === "left") { if (cc.cx > extreme) extreme = cc.cx; }
    else if (dir === "right") { if (cc.cx < extreme) extreme = cc.cx; }
  }

  best = null;
  bestScore = 999999999;
  for (j = 0; j < cand.length; j++) {
    var cw = cand[j];
    var atExtreme = false;
    if (dir === "up" || dir === "down") atExtreme = (cw.cy === extreme);
    else atExtreme = (cw.cx === extreme);
    if (!atExtreme) continue;
    // Use the same cone scoring to pick the most aligned extreme target.
    var sw = scoreCone(cw);
    if (sw < bestScore) { bestScore = sw; best = cw; }
  }
  if (best) return { row: best.row, i: best.i };

  return null;
};

PD.ui.rowY0 = function (row) {
  var i = Math.floor(Number(row || 0));
  if (!isFinite(i)) i = 0;
  return PD.config.render.layout.rowY[i];
};
PD.ui.rowH = function (row) {
  var i = Math.floor(Number(row || 0));
  if (!isFinite(i)) i = 0;
  return PD.config.render.layout.rowH[i];
};

PD.ui.faceYForRow = function (row) {
  var L = PD.config.render.layout;
  row = Math.floor(Number(row || 0));
  if (!isFinite(row)) row = 0;
  if (row === 0) {
    // Opponent hand: bottom slice visible; cards extend upward off-screen.
    return L.rowY[0] + L.rowH[0] - L.faceH;
  }
  if (row === 1 || row === 3 || row === 4) {
    return L.rowY[row] + L.faceInsetY;
  }
  return L.rowY[row];
};

PD.ui.isOpponentRow = function (row) {
  row = Math.floor(Number(row || 0));
  if (!isFinite(row)) row = 0;
  return row === 0 || row === 1;
};

PD.ui.playerForRow = function (row) {
  row = Math.floor(Number(row || 0));
  if (!isFinite(row)) row = 0;
  if (row === 0 || row === 1) return 1;
  if (row === 3 || row === 4) return 0;
  return -1;
};

PD.ui.buildRowItems = function (state, view, row) {
  var L = PD.config.render.layout;
  row = Math.floor(Number(row || 0));
  if (!isFinite(row)) row = 0;

  var out = { items: [], minX: 0, maxX: 0 };
  var isOp = PD.ui.isOpponentRow(row);
  var p = PD.ui.playerForRow(row);
  var yFace = PD.ui.faceYForRow(row);
  var padX = L.rowPadX;

  var i;

  if (row === 4 || row === 0) {
    // Hand row: hand cards + bank stack on opposite side.
    var hand = state.players[p].hand;
    var bank = state.players[p].bank;
    var nHand = hand.length;
    var nBank = bank.length;
    var minX = 999999, maxX = -999999;

    function pushHandRowItem(kind, uid, xFace, depth, fanDir) {
      out.items.push({
        kind: kind,
        row: row,
        p: p,
        uid: uid,
        depth: depth,
        fanDir: fanDir,
        x: xFace,
        y: yFace,
        w: L.faceW,
        h: L.faceH,
        loc: (kind === "hand") ? { p: p, zone: "hand", i: depth } : null,
        stackKey: (kind === "bank") ? ("bank:p" + p + ":row" + row) : null
      });
      var xLo = xFace;
      var xHi = xFace + L.faceW - 1;
      // Include 1px shadow pixels that can be drawn outside the face.
      if (kind === "hand") {
        xLo = xFace + L.shadowBarDx;
      } else if (kind === "bank") {
        if (fanDir < 0) xHi = xFace + L.faceW;
        else xLo = xFace + L.shadowBarDx;
      }
      if (xLo < minX) minX = xLo;
      if (xHi > maxX) maxX = xHi;
    }

    // Hand zone (spaced).
    var xHandStart = isOp ? (L.screenW - padX - L.faceW) : padX;
    var handStep = isOp ? (-L.handStrideX) : L.handStrideX;
    for (i = 0; i < nHand; i++) {
      pushHandRowItem("hand", hand[i], xHandStart + i * handStep, i, 0);
    }

    // Bank zone (overlapped stack), opposite side.
    var stride = L.stackStrideX;
    var gap = L.stackGapX;

    if (!isOp) {
      // Player bank: fan right, anchored on the right.
      var bankRightX = L.screenW - padX - L.faceW;
      var bankLeftX = bankRightX - (nBank > 0 ? ((nBank - 1) * stride) : 0);
      var handMaxX = (nHand > 0) ? (padX + (nHand - 1) * L.handStrideX + L.faceW - 1) : (padX - 1);
      if (nBank > 0 && bankLeftX <= (handMaxX + gap)) bankLeftX = handMaxX + gap + 1;
      for (i = 0; i < nBank; i++) {
        pushHandRowItem("bank", bank[i], bankLeftX + i * stride, i, 1);
      }
    } else {
      // Opponent bank: fan left, anchored on the left.
      var bankLeftX2 = padX;
      var bankRightX2 = bankLeftX2 + (nBank > 0 ? ((nBank - 1) * stride) : 0);
      var handMinX = (nHand > 0) ? (xHandStart + (nHand - 1) * handStep) : (xHandStart + 1);
      var bankMaxX = bankRightX2 + L.faceW - 1;
      if (nBank > 0 && (bankMaxX + gap) >= handMinX) {
        var desiredBankMax = handMinX - gap - 1;
        bankRightX2 = desiredBankMax - (L.faceW - 1);
      }
      for (i = 0; i < nBank; i++) {
        pushHandRowItem("bank", bank[i], bankRightX2 - i * stride, i, -1);
      }
    }

    out.minX = (minX === 999999) ? 0 : minX;
    out.maxX = (maxX === -999999) ? 0 : maxX;
    out.items.sort(function (a, b) {
      var ax = (a && a.x != null) ? a.x : 0;
      var bx = (b && b.x != null) ? b.x : 0;
      var dx = ax - bx;
      if (dx) return dx;
      var ay = (a && a.y != null) ? a.y : 0;
      var by = (b && b.y != null) ? b.y : 0;
      return ay - by;
    });
    return out;
  }

  if (row === 3 || row === 1) {
    // Table row: property sets (with house as last card in stack).
    var sets = state.players[p].sets;
    var setCount = sets.length;
    var stride2 = L.stackStrideX;
    var minX2 = 999999, maxX2 = -999999;
    var fanDir = isOp ? -1 : 1;

    if (!isOp) {
      var cursorX = padX;
      for (i = 0; i < setCount; i++) {
        var set = sets[i];
        if (!set) continue;
        var cards = [];
        var k;
        for (k = 0; k < set.props.length; k++) cards.push({ kind: "setProp", setI: i, depth: k, uid: set.props[k][0], color: set.props[k][1] });
        if (set.houseUid) cards.push({ kind: "setHouse", setI: i, depth: cards.length, uid: set.houseUid });

        var nCards = cards.length;
        if (nCards <= 0) continue;

        var depth;
        for (depth = 0; depth < nCards; depth++) {
          var xFaceP = cursorX + depth * stride2;
          out.items.push({
            kind: cards[depth].kind,
            row: row,
            p: p,
            uid: cards[depth].uid,
            color: cards[depth].color,
            setI: cards[depth].setI,
            depth: cards[depth].depth,
            fanDir: fanDir,
            stackKey: "set:p" + p + ":set" + i,
            x: xFaceP,
            y: yFace,
            w: L.faceW,
            h: L.faceH
          });
          var xLoP = xFaceP;
          var xHiP = xFaceP + L.faceW - 1;
          if (fanDir > 0) xLoP = xFaceP + L.shadowBarDx;
          else xHiP = xFaceP + L.faceW;
          if (xLoP < minX2) minX2 = xLoP;
          if (xHiP > maxX2) maxX2 = xHiP;
        }

        var stackW = L.faceW + (nCards - 1) * stride2;
        cursorX = cursorX + stackW + L.stackGapX;
      }
    } else {
      var rightCursor = L.screenW - padX - L.faceW;
      for (i = 0; i < setCount; i++) {
        var setO = sets[i];
        if (!setO) continue;
        var cardsO = [];
        var kk;
        for (kk = 0; kk < setO.props.length; kk++) cardsO.push({ kind: "setProp", setI: i, depth: kk, uid: setO.props[kk][0], color: setO.props[kk][1] });
        if (setO.houseUid) cardsO.push({ kind: "setHouse", setI: i, depth: cardsO.length, uid: setO.houseUid });

        var nCardsO = cardsO.length;
        if (nCardsO <= 0) continue;

        var d2;
        for (d2 = 0; d2 < nCardsO; d2++) {
          var xFaceO = rightCursor - d2 * stride2;
          out.items.push({
            kind: cardsO[d2].kind,
            row: row,
            p: p,
            uid: cardsO[d2].uid,
            color: cardsO[d2].color,
            setI: cardsO[d2].setI,
            depth: cardsO[d2].depth,
            fanDir: fanDir,
            stackKey: "set:p" + p + ":set" + i,
            x: xFaceO,
            y: yFace,
            w: L.faceW,
            h: L.faceH
          });
          var xLoO = xFaceO;
          var xHiO = xFaceO + L.faceW - 1;
          if (fanDir > 0) xLoO = xFaceO + L.shadowBarDx;
          else xHiO = xFaceO + L.faceW;
          if (xLoO < minX2) minX2 = xLoO;
          if (xHiO > maxX2) maxX2 = xHiO;
        }

        var leftEdge = rightCursor - (nCardsO - 1) * stride2;
        rightCursor = leftEdge - L.stackGapX - L.faceW;
      }
    }

    out.minX = (minX2 === 999999) ? 0 : minX2;
    out.maxX = (maxX2 === -999999) ? 0 : maxX2;
    out.items.sort(function (a, b) {
      var ax = (a && a.x != null) ? a.x : 0;
      var bx = (b && b.x != null) ? b.x : 0;
      var dx = ax - bx;
      if (dx) return dx;
      var ay = (a && a.y != null) ? a.y : 0;
      var by = (b && b.y != null) ? b.y : 0;
      return ay - by;
    });
    return out;
  }

  if (row === 2) {
    // Center row: deck, discard, and UI buttons.
    var C = PD.config.render.layout;
    var top = C.rowY[2] + C.centerTopInsetY;
    var deckX = C.centerDeckX;
    var gapX = C.centerPileGapX;
    var x0 = deckX;
    out.items.push({ kind: "deck", row: 2, x: x0, y: top, w: C.faceW, h: C.faceH });
    out.items.push({ kind: "discard", row: 2, x: x0 + C.faceW + gapX, y: top, w: C.faceW, h: C.faceH });

    var dbgEnabled = !!(PD.config && PD.config.debug && PD.config.debug.enabled);

    // Hide buttons while an overlay is active (menu/targeting/inspect).
    var overlayActive = !!(view && (view.mode === "menu" || view.mode === "targeting" || view.inspectActive));
    if (!overlayActive) {
      // Right-side vertical strip: 4*10px = 40px tall, fits inside center row.
      var stripW = 54;
      var stripH = 10;
      var stripX = C.screenW - C.rowPadX - stripW;
      // Bottom-align within the center row band.
      var stripY0 = (C.rowY[2] + C.rowH[2] - 1 - 40);

      function pushBtn(id, label, y, disabled) {
        out.items.push({ kind: "btn", id: id, label: label, disabled: !!disabled, row: 2, x: stripX, y: y, w: stripW, h: stripH });
      }

      var endDisabled = (state.activeP !== 0) || (state.players[0].hand.length > PD.HAND_MAX);
      pushBtn("endTurn", "End", stripY0, endDisabled);
      if (dbgEnabled) {
        pushBtn("step", "Step", stripY0 + 10, false);
        pushBtn("reset", "Reset", stripY0 + 20, false);
        pushBtn("nextScenario", "Next", stripY0 + 30, false);
      }
    }

    out.minX = 0;
    out.maxX = C.screenW - 1;
    out.items.sort(function (a, b) {
      var ax = (a && a.x != null) ? a.x : 0;
      var bx = (b && b.x != null) ? b.x : 0;
      var dx = ax - bx;
      if (dx) return dx;
      var ay = (a && a.y != null) ? a.y : 0;
      var by = (b && b.y != null) ? b.y : 0;
      return ay - by;
    });
    return out;
  }

  return out;
};

PD.ui.computeRowModels = function (state, view) {
  var models = [
    PD.ui.buildRowItems(state, view, 0),
    PD.ui.buildRowItems(state, view, 1),
    PD.ui.buildRowItems(state, view, 2),
    PD.ui.buildRowItems(state, view, 3),
    PD.ui.buildRowItems(state, view, 4)
  ];

  // Clamp cursor to existing rows/items.
  if (!view || !view.cursor) return { models: models, selected: null, ghosts: [], preview: null };
  var row = Math.floor(Number(view.cursor.row || 0));
  if (!isFinite(row)) row = 0;
  if (row < 0) row = 0;
  if (row > 4) row = 4;
  view.cursor.row = row;

  var rm = models[row];
  var n = (rm && rm.items) ? rm.items.length : 0;
  var curI = Math.floor(Number(view.cursor.i || 0));
  if (!isFinite(curI)) curI = 0;
  view.cursor.i = PD.ui.clampI(curI, n);

  var sel = (rm && rm.items && rm.items.length) ? rm.items[view.cursor.i] : null;

  // Targeting overlays: ghosts + preview-in-stack for the selected destination.
  var ghosts = [];
  var preview = null;

  if (view.mode === "targeting" && view.targeting && view.targeting.active) {
    var t = view.targeting;
    var cmds = t.cmds || [];
    var cmdI = PD.ui.clampI(Math.floor(Number(t.cmdI || 0)), cmds.length);
    t.cmdI = cmdI;

    // Build per-set origin positions for P0 table (row 3), and a new-set slot.
    var L = PD.config.render.layout;
    var yFace = PD.ui.faceYForRow(3);
    var stride = L.stackStrideX;
    var cursorX = L.rowPadX;
    var sets = state.players[0].sets;
    var setXs = [];
    var setCardsN = [];
    var si;
    for (si = 0; si < sets.length; si++) {
      var set = sets[si];
      if (!set) { setXs[si] = cursorX; setCardsN[si] = 0; continue; }
      var nCards = (set.props ? set.props.length : 0) + (set.houseUid ? 1 : 0);
      setXs[si] = cursorX;
      setCardsN[si] = nCards;
      if (nCards > 0) cursorX = cursorX + L.faceW + (nCards - 1) * stride + L.stackGapX;
      else cursorX = cursorX + L.faceW + L.stackGapX;
    }
    var newSetX = cursorX;

    // Ghosts for all legal destinations in this targeting mode.
    var j;
    for (j = 0; j < cmds.length; j++) {
      var c = cmds[j];
      if (!c || !c.kind) continue;
      var x = 0;
      if (c.kind === "playProp") {
        if (c.dest && c.dest.newSet) x = newSetX;
        else if (c.dest && c.dest.setI != null) {
          var sI = Math.floor(Number(c.dest.setI));
          if (!isFinite(sI)) continue;
          var baseX = (setXs[sI] != null) ? setXs[sI] : 0;
          var nBase = (setCardsN[sI] != null) ? setCardsN[sI] : 0;
          x = baseX + nBase * stride;
        }
      } else if (c.kind === "playHouse") {
        if (c.dest && c.dest.setI != null) {
          var hsI = Math.floor(Number(c.dest.setI));
          if (!isFinite(hsI)) continue;
          var hBaseX = (setXs[hsI] != null) ? setXs[hsI] : 0;
          var hnBase = (setCardsN[hsI] != null) ? setCardsN[hsI] : 0;
          x = hBaseX + hnBase * stride;
        }
      } else if (c.kind === "bank") {
        // No ghost for banking.
        continue;
      } else {
        continue;
      }

      ghosts.push({ row: 3, x: x, y: yFace, w: L.faceW, h: L.faceH, kind: "ghostDest", cmdI: j });
    }

    // Preview-in-stack for selected destination.
    var cmdSel = cmds[cmdI];
    if (cmdSel && (cmdSel.kind === "playProp" || cmdSel.kind === "playHouse")) {
      var xP = 0;
      if (cmdSel.kind === "playProp") {
        if (cmdSel.dest && cmdSel.dest.newSet) xP = newSetX;
        else if (cmdSel.dest && cmdSel.dest.setI != null) {
          var psI = Math.floor(Number(cmdSel.dest.setI));
          if (isFinite(psI)) {
            xP = ((setXs[psI] != null) ? setXs[psI] : 0) + (((setCardsN[psI] != null) ? setCardsN[psI] : 0) * stride);
          }
        }
      } else if (cmdSel.kind === "playHouse") {
        var bsI = Math.floor(Number(cmdSel.dest.setI));
        if (isFinite(bsI)) {
          xP = ((setXs[bsI] != null) ? setXs[bsI] : 0) + (((setCardsN[bsI] != null) ? setCardsN[bsI] : 0) * stride);
        }
      }
      preview = {
        row: 3,
        kind: "preview",
        uid: (t.card && t.card.uid) ? t.card.uid : 0,
        color: (cmdSel.kind === "playProp" && t.card && t.card.def && PD.isWildDef(t.card.def)) ? t.wildColor : null,
        x: xP,
        y: yFace,
        w: L.faceW,
        h: L.faceH
      };
    } else if (cmdSel && cmdSel.kind === "bank") {
      // Preview into the bank stack destination (player hand row, bank zone).
      // Compute bank drop position using the same layout rules as buildRowItems(row=4),
      // approximating the post-drop layout (hand -1, bank +1).
      var Lh = PD.config.render.layout;
      var yB = PD.ui.faceYForRow(4);
      var padX = Lh.rowPadX;
      var bankRightX = Lh.screenW - padX - Lh.faceW;
      var strideB = Lh.stackStrideX;
      var gapB = Lh.stackGapX;

      var hand0 = state.players[0].hand || [];
      var bank0 = state.players[0].bank || [];
      var nHandAfter = hand0.length - 1;
      if (nHandAfter < 0) nHandAfter = 0;
      var nBankAfter = bank0.length + 1;

      var handMaxX = (nHandAfter > 0) ? (padX + (nHandAfter - 1) * Lh.handStrideX + Lh.faceW - 1) : (padX - 1);
      var bankLeftX = bankRightX - ((nBankAfter > 0) ? ((nBankAfter - 1) * strideB) : 0);
      if (nBankAfter > 0 && bankLeftX <= (handMaxX + gapB)) bankLeftX = handMaxX + gapB + 1;

      var xB = bankLeftX + (nBankAfter - 1) * strideB;
      preview = { row: 4, kind: "preview", uid: (t.card && t.card.uid) ? t.card.uid : 0, color: null, x: xB, y: yB, w: Lh.faceW, h: Lh.faceH };
    }
  }

  return { models: models, selected: sel, ghosts: ghosts, preview: preview };
};

PD.ui.ensureCamForSelection = function (rowModel, row, selItem, camArr) {
  var L = PD.config.render.layout;
  row = Math.floor(Number(row || 0));
  if (!isFinite(row)) row = 0;
  if (!camArr) return;

  var cam = (camArr[row] != null) ? Number(camArr[row]) : 0;
  if (!isFinite(cam)) cam = 0;
  var margin = L.camMarginX;

  if (!rowModel || !rowModel.items || rowModel.items.length === 0 || !selItem) {
    camArr[row] = 0;
    return;
  }

  var contentW = (rowModel.maxX - rowModel.minX + 1);
  if (contentW <= L.screenW) { camArr[row] = 0; return; }

  var x0 = selItem.x;
  var x1 = selItem.x + selItem.w - 1;
  var maxVisibleX = (L.screenW - 1 - margin);

  if ((x0 - cam) < margin) cam = (x0 - margin);
  if ((x1 - cam) > maxVisibleX) cam = (x1 - maxVisibleX);

  var camA = (rowModel.minX - margin);
  var camB = (rowModel.maxX - maxVisibleX);
  var camLo = camA < camB ? camA : camB;
  var camHi = camA < camB ? camB : camA;
  if (cam < camLo) cam = camLo;
  if (cam > camHi) cam = camHi;

  camArr[row] = Math.floor(cam);
};

PD.ui.updateCameras = function (state, view, computed) {
  if (!view || !view.camX) return;
  if (!computed || !computed.models) return;

  var models = computed.models;
  var row;
  for (row = 0; row < 5; row++) {
    if (!(row === 0 || row === 1 || row === 3 || row === 4)) continue;

    // Default selection is the cursor selection when in that row.
    var selItem = null;
    if (view.cursor.row === row) {
      var rm = models[row];
      if (rm && rm.items && rm.items.length) {
        var i = PD.ui.clampI(view.cursor.i, rm.items.length);
        selItem = rm.items[i];
      }
    } else {
      // For non-active rows, use first item to keep cam stable.
      var rm2 = models[row];
      if (rm2 && rm2.items && rm2.items.length) selItem = rm2.items[0];
    }

    // In targeting mode, have the preview destination row camera follow the preview.
    if (view.mode === "targeting" && computed.preview && row === computed.preview.row) selItem = computed.preview;

    PD.ui.ensureCamForSelection(models[row], row, selItem, view.camX);
  }
};

PD.ui.menuOpenForSelection = function (state, view, sel) {
  if (!view || !view.menu) return;
  view.menu.items = [];
  view.menu.i = 0;
  view.menu.src = sel ? { row: sel.row, i: view.cursor.i, uid: sel.uid, loc: sel.loc || null } : null;

  if (!sel || !sel.loc || sel.loc.zone !== "hand") return;
  if (sel.loc.p !== 0) return;

  var uid = sel.uid;
  var def = PD.defByUid(state, uid);
  if (!def) return;

  // Build/Place actions are only meaningful for the currently implemented rules.
  if (def.kind === PD.CardKind.Property) {
    view.menu.items.push({ id: "place", label: "Place" });
  }
  if (def.kind === PD.CardKind.House) {
    // Only offer Build if legal.
    var moves = PD.legalMoves(state);
    var hasBuild = false;
    var m;
    for (m = 0; m < moves.length; m++) {
      var mv = moves[m];
      if (mv && mv.kind === "playHouse" && mv.card && mv.card.uid === uid) { hasBuild = true; break; }
    }
    if (hasBuild) view.menu.items.push({ id: "build", label: "Build" });
  }
  if (PD.isBankableDef(def)) {
    view.menu.items.push({ id: "bank", label: "Bank" });
  }

  // Always allow cancel/back with B; no explicit menu item needed.
};

PD.ui.targetingEnter = function (state, view, kind, hold, uid, loc) {
  if (!view || !view.targeting) return;
  var t = view.targeting;
  t.active = true;
  t.kind = String(kind || "");
  t.hold = !!hold;
  t.cmds = [];
  t.cmdI = 0;

  var def = PD.defByUid(state, uid);
  t.card = { uid: uid, loc: loc || null, def: def || null };

  var moves = PD.legalMoves(state);
  var cmds = [];
  var i;

  if (t.kind === "bank") {
    for (i = 0; i < moves.length; i++) {
      var mb = moves[i];
      if (!mb || mb.kind !== "bank") continue;
      if (!mb.card || mb.card.uid !== uid) continue;
      cmds.push(mb);
    }
    t.cmds = cmds;
    t.cmdI = 0;
    view.mode = "targeting";
    return;
  }

  if (t.kind === "build") {
    for (i = 0; i < moves.length; i++) {
      var mh = moves[i];
      if (!mh || mh.kind !== "playHouse") continue;
      if (!mh.card || mh.card.uid !== uid) continue;
      cmds.push(mh);
    }
    t.cmds = cmds;
    t.cmdI = 0;
    view.mode = "targeting";
    return;
  }

  if (t.kind === "place") {
    if (def && PD.isWildDef(def)) {
      // Default wild color: prefer a color that has an existing-set destination.
      var c0 = def.wildColors[0];
      var c1 = def.wildColors[1];
      var has0 = false, has1 = false;
      for (i = 0; i < moves.length; i++) {
        var mp = moves[i];
        if (!mp || mp.kind !== "playProp") continue;
        if (!mp.card || mp.card.uid !== uid) continue;
        if (mp.color === c0 && mp.dest && mp.dest.setI != null) has0 = true;
        if (mp.color === c1 && mp.dest && mp.dest.setI != null) has1 = true;
      }
      t.wildColor = has0 ? c0 : (has1 ? c1 : c0);
      for (i = 0; i < moves.length; i++) {
        var mw = moves[i];
        if (!mw || mw.kind !== "playProp") continue;
        if (!mw.card || mw.card.uid !== uid) continue;
        if (mw.color !== t.wildColor) continue;
        cmds.push(mw);
      }
    } else {
      t.wildColor = PD.NO_COLOR;
      for (i = 0; i < moves.length; i++) {
        var mf = moves[i];
        if (!mf || mf.kind !== "playProp") continue;
        if (!mf.card || mf.card.uid !== uid) continue;
        cmds.push(mf);
      }
    }

    // Ordering: existing sets first (by setI), then newSet.
    var existing = [];
    var newSet = [];
    for (i = 0; i < cmds.length; i++) {
      var c = cmds[i];
      if (c && c.dest && c.dest.newSet) newSet.push(c);
      else existing.push(c);
    }
    existing.sort(function (a, b) {
      var ai = (a.dest && a.dest.setI != null) ? a.dest.setI : 9999;
      var bi = (b.dest && b.dest.setI != null) ? b.dest.setI : 9999;
      return ai - bi;
    });
    cmds = existing.concat(newSet);
    t.cmds = cmds;
    t.cmdI = 0; // default always-existing if any

    view.mode = "targeting";
    return;
  }

  // Unknown targeting kind.
  t.active = false;
  view.mode = "browse";
};

PD.ui.targetingRetargetWild = function (state, view, dir) {
  if (!view || !view.targeting || !view.targeting.active) return;
  var t = view.targeting;
  if (t.kind !== "place") return;
  if (!t.card || !t.card.def || !PD.isWildDef(t.card.def)) return;

  var def = t.card.def;
  var c0 = def.wildColors[0];
  var c1 = def.wildColors[1];
  var prevColor = t.wildColor;
  var nextColor = (prevColor === c0) ? c1 : c0;
  if (dir < 0) nextColor = (prevColor === c1) ? c0 : c1;

  var prevCmd = (t.cmds && t.cmds.length) ? t.cmds[PD.ui.clampI(t.cmdI, t.cmds.length)] : null;
  var keepNewSet = !!(prevCmd && prevCmd.dest && prevCmd.dest.newSet);
  var keepSetI = (prevCmd && prevCmd.dest && prevCmd.dest.setI != null) ? prevCmd.dest.setI : null;

  var moves = PD.legalMoves(state);
  var uid = t.card.uid;
  var cmds = [];
  var i;
  for (i = 0; i < moves.length; i++) {
    var mw = moves[i];
    if (!mw || mw.kind !== "playProp") continue;
    if (!mw.card || mw.card.uid !== uid) continue;
    if (mw.color !== nextColor) continue;
    cmds.push(mw);
  }

  // Ordering: existing then new.
  var existing = [];
  var newSet = [];
  for (i = 0; i < cmds.length; i++) {
    var c = cmds[i];
    if (c && c.dest && c.dest.newSet) newSet.push(c);
    else existing.push(c);
  }
  existing.sort(function (a, b) {
    var ai = (a.dest && a.dest.setI != null) ? a.dest.setI : 9999;
    var bi = (b.dest && b.dest.setI != null) ? b.dest.setI : 9999;
    return ai - bi;
  });
  cmds = existing.concat(newSet);

  t.wildColor = nextColor;
  t.cmds = cmds;

  // Preserve selection if possible.
  var selI = 0;
  if (keepNewSet) {
    for (i = 0; i < cmds.length; i++) if (cmds[i] && cmds[i].dest && cmds[i].dest.newSet) { selI = i; break; }
  } else if (keepSetI != null) {
    for (i = 0; i < cmds.length; i++) if (cmds[i] && cmds[i].dest && cmds[i].dest.setI === keepSetI) { selI = i; break; }
  }
  t.cmdI = selI;
};

PD.ui.step = function (state, view, actions) {
  if (!state || !view) return null;
  actions = actions || {};

  // Tick feedback timers.
  PD.ui.feedbackTick(view);

  // Inspect is only meaningful in browse mode.
  view.inspectActive = !!(view.mode === "browse" && actions.x && actions.x.inspectActive);

  // Compute models for navigation helpers.
  var computed = PD.ui.computeRowModels(state, view);
  PD.ui.updateCameras(state, view, computed);

  // One-shot nudge: when P0 runs out of plays, snap selection to End (browse-only).
  // This makes "A to end turn" frictionless while still allowing players to wander away.
  if (view.mode === "browse" && !view.inspectActive && state.activeP === 0) {
    if (!view.ux) view.ux = { lastActiveP: null, lastPlaysLeft: null };
    var prevP = view.ux.lastActiveP;
    var prevPlays = view.ux.lastPlaysLeft;
    var curPlays = state.playsLeft;
    if (curPlays == null) curPlays = 0;
    curPlays = Math.floor(Number(curPlays));
    if (!isFinite(curPlays)) curPlays = 0;

    if (prevP === 0 && prevPlays != null && prevPlays > 0 && curPlays <= 0) {
      var center = computed.models ? computed.models[2] : null;
      if (center && center.items) {
        var bi;
        for (bi = 0; bi < center.items.length; bi++) {
          var it = center.items[bi];
          if (it && it.kind === "btn" && it.id === "endTurn" && !it.disabled) {
            view.cursor.row = 2;
            view.cursor.i = bi;
            computed = PD.ui.computeRowModels(state, view);
            PD.ui.updateCameras(state, view, computed);
            break;
          }
        }
      }
    }

    view.ux.lastActiveP = 0;
    view.ux.lastPlaysLeft = curPlays;
  } else if (view.ux) {
    view.ux.lastActiveP = state.activeP;
    view.ux.lastPlaysLeft = state.playsLeft;
  }

  function currentSelection() {
    var row = view.cursor.row;
    var rm = computed.models[row];
    if (!rm || !rm.items || rm.items.length === 0) return null;
    var i = PD.ui.clampI(view.cursor.i, rm.items.length);
    return rm.items[i];
  }

  // Menu mode
  if (view.mode === "menu") {
    if (actions.b && actions.b.pressed) {
      view.mode = "browse";
      view.menu.items = [];
      return null;
    }

    var nItems = view.menu.items ? view.menu.items.length : 0;
    if (nItems > 0) {
      if (actions.nav && actions.nav.up) view.menu.i = PD.ui.wrapI(view.menu.i - 1, nItems);
      if (actions.nav && actions.nav.down) view.menu.i = PD.ui.wrapI(view.menu.i + 1, nItems);
    }

    if (actions.a && actions.a.tap) {
      if (!view.menu.items || view.menu.items.length === 0) {
        view.mode = "browse";
        return null;
      }
      var mi = PD.ui.clampI(view.menu.i, view.menu.items.length);
      var it = view.menu.items[mi];
      var src = view.menu.src;
      view.mode = "browse";
      view.menu.items = [];

      if (!it || !src) return null;
      if (!src.loc || src.loc.zone !== "hand" || src.loc.p !== 0) return null;
      var uid = src.uid;

      if (it.id === "bank") {
        var cmd = { kind: "bank", card: { uid: uid, loc: src.loc } };
        return { kind: "applyCmd", cmd: cmd };
      }

      if (it.id === "place") {
        PD.ui.targetingEnter(state, view, "place", false, uid, src.loc);
        return null;
      }

      if (it.id === "build") {
        PD.ui.targetingEnter(state, view, "build", false, uid, src.loc);
        return null;
      }
    }

    return null;
  }

  // Targeting mode
  if (view.mode === "targeting" && view.targeting && view.targeting.active) {
    var t = view.targeting;

    // Cancel
    if (actions.b && actions.b.pressed) {
      t.active = false;
      view.mode = "browse";
      return null;
    }

    // Cycle destinations
    var nCmds = t.cmds ? t.cmds.length : 0;
    if (nCmds > 0) {
      if (actions.nav && actions.nav.left) t.cmdI = PD.ui.wrapI(t.cmdI - 1, nCmds);
      if (actions.nav && actions.nav.right) t.cmdI = PD.ui.wrapI(t.cmdI + 1, nCmds);
    }

    // Wild color toggle (Up/Down)
    if (actions.nav && (actions.nav.up || actions.nav.down)) {
      var dir = actions.nav.down ? 1 : -1;
      PD.ui.targetingRetargetWild(state, view, dir);
    }

    // Confirm: tap-A (menu targeting) OR release-A (hold targeting).
    var shouldConfirm = false;
    if (!t.hold && actions.a && actions.a.tap) shouldConfirm = true;
    if (t.hold && actions.a && actions.a.released) shouldConfirm = true;
    if (!shouldConfirm) {
      // Update cameras to follow destination preview.
      computed = PD.ui.computeRowModels(state, view);
      PD.ui.updateCameras(state, view, computed);
      return null;
    }

    if (!t.cmds || t.cmds.length === 0) {
      PD.ui.feedbackError(view, "no_targets", "No valid destination");
      t.active = false;
      view.mode = "browse";
      return null;
    }

    var cmdI = PD.ui.clampI(t.cmdI, t.cmds.length);
    var cmdSel = t.cmds[cmdI];
    t.active = false;
    view.mode = "browse";

    if (!cmdSel) return null;
    return { kind: "applyCmd", cmd: cmdSel };
  }

  // Browse mode
  view.mode = "browse";

  // Navigation (directional, screen-space).
  if (actions.nav) {
    var dir = null;
    if (actions.nav.up) dir = "up";
    else if (actions.nav.down) dir = "down";
    else if (actions.nav.left) dir = "left";
    else if (actions.nav.right) dir = "right";

    if (dir) {
      var pick = PD.ui.navPickInDirection(view, computed, dir);
      if (pick) {
        view.cursor.row = pick.row;
        view.cursor.i = pick.i;
      }
    }
  }

  // Recompute after nav, then update cameras.
  computed = PD.ui.computeRowModels(state, view);
  PD.ui.updateCameras(state, view, computed);

  // Context actions on tap A.
  if (actions.a && actions.a.tap) {
    var sel = currentSelection();
    if (!sel) return null;

    // Center buttons.
    if (sel.row === 2 && sel.kind === "btn") {
      if (sel.disabled) {
        var msg = "Not available";
        if (sel.id === "endTurn" && state.activeP !== 0) msg = "Opponent turn";
        else if (sel.id === "endTurn" && state.players[0].hand.length > PD.HAND_MAX) msg = "Hand > 7";
        PD.ui.feedbackError(view, "disabled_btn", msg);

        // Move selection to next available center button (prefer Step).
        var center = computed.models ? computed.models[2] : null;
        var nextI = null;
        if (center && center.items) {
          var ii;
          for (ii = 0; ii < center.items.length; ii++) {
            var it = center.items[ii];
            if (it && it.kind === "btn" && it.id === "step" && !it.disabled) { nextI = ii; break; }
          }
          if (nextI == null) {
            for (ii = 0; ii < center.items.length; ii++) {
              var it2 = center.items[ii];
              if (it2 && it2.kind === "btn" && !it2.disabled && it2.id !== "endTurn") { nextI = ii; break; }
            }
          }
          if (nextI == null) {
            for (ii = 0; ii < center.items.length; ii++) {
              var it3 = center.items[ii];
              if (it3 && (it3.kind === "discard" || it3.kind === "deck")) { nextI = ii; break; }
            }
          }
        }
        if (nextI != null) {
          view.cursor.row = 2;
          view.cursor.i = nextI;
          computed = PD.ui.computeRowModels(state, view);
          PD.ui.updateCameras(state, view, computed);
        }

        return null;
      }

      if (sel.id === "endTurn") return { kind: "applyCmd", cmd: { kind: "endTurn" } };
      if (sel.id === "step") return { kind: "debug", action: "step" };
      if (sel.id === "reset") return { kind: "debug", action: "reset" };
      if (sel.id === "nextScenario") return { kind: "debug", action: "nextScenario" };
      return null;
    }

    // Hand card menu (P0 only).
    if (sel.loc && sel.loc.zone === "hand" && sel.loc.p === 0) {
      PD.ui.menuOpenForSelection(state, view, sel);
      if (view.menu.items && view.menu.items.length > 0) {
        view.mode = "menu";
      } else {
        PD.ui.feedbackError(view, "no_actions", "No actions");
      }
    }
  }

  // Hold-A grab: enter targeting (Place for properties; otherwise bank-only).
  if (actions.a && actions.a.grabStart) {
    var sel2 = currentSelection();
    if (sel2 && sel2.loc && sel2.loc.zone === "hand" && sel2.loc.p === 0) {
      var uid2 = sel2.uid;
      var def2 = PD.defByUid(state, uid2);
      if (def2 && def2.kind === PD.CardKind.Property) {
        PD.ui.targetingEnter(state, view, "place", true, uid2, sel2.loc);
      } else if (def2 && PD.isBankableDef(def2)) {
        // Prefer bank on holds (esp. House).
        PD.ui.targetingEnter(state, view, "bank", true, uid2, sel2.loc);
      } else {
        PD.ui.feedbackError(view, "hold_noop", "Can't do that");
      }
    }
  }

  // If hold targeting is active and A is no longer held, auto-confirm is handled in targeting mode.

  return null;
};

