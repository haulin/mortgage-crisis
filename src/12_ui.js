PD.ui = PD.ui || {};

PD.ui.newView = function () {
  return {
    // View-only state (cursor/camera/menu focus). This is intentionally not part of GameState.
    cursor: { row: 4, i: 0 }, // default to player hand
    camX: [0, 0, 0, 0, 0],

    // browse | menu | targeting | prompt
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

    // Toasts (Phase 05b+): stacked notifications at screen top.
    // Each toast: { id?, kind?, text, frames?, persistent? }
    toasts: [],

    // Animations (Phase 05c+): shuffle + staged dealing. Purely view-owned.
    anim: {
      q: [],
      active: null,
      lock: false,
      // hiddenByP[p][uid] = true means uid is in-hand but not yet revealed.
      hiddenByP: [{}, {}]
    },

    // Feedback: blink + message, plus attempt counts.
    feedback: {
      blinkFrames: 0,
      blinkPhase: 0,
      attemptsByCode: {}
    },

    // Small UX memory (used for one-shot nudges like snapping to End when out of plays).
    ux: {
      lastActiveP: null,
      lastPlaysLeft: null
    }
  };
};

PD.ui.toastPush = function (view, toast) {
  if (!view) return;
  if (!view.toasts) view.toasts = [];
  if (!toast) return;
  var t = {
    id: toast.id != null ? String(toast.id) : null,
    kind: toast.kind != null ? String(toast.kind) : "",
    text: toast.text != null ? String(toast.text) : "",
    frames: toast.frames != null ? Math.floor(Number(toast.frames)) : 0,
    persistent: !!toast.persistent
  };
  if (!isFinite(t.frames)) t.frames = 0;
  if (t.frames < 0) t.frames = 0;
  if (!t.text) return;

  // Replace-by-id if provided.
  if (t.id) {
    var i;
    for (i = 0; i < view.toasts.length; i++) {
      var ex = view.toasts[i];
      if (ex && ex.id === t.id) { view.toasts[i] = t; return; }
    }
  }
  view.toasts.push(t);
};

PD.ui.toastsTick = function (view) {
  if (!view || !view.toasts) return;
  var out = [];
  var i;
  for (i = 0; i < view.toasts.length; i++) {
    var t = view.toasts[i];
    if (!t || !t.text) continue;
    if (t.persistent) { out.push(t); continue; }
    var f = Number(t.frames || 0);
    if (!isFinite(f)) f = 0;
    f = Math.floor(f) - 1;
    if (f > 0) { t.frames = f; out.push(t); }
  }
  view.toasts = out;
};

PD.ui.syncPromptToast = function (state, view) {
  if (!state || !view) return;
  if (!view.toasts) view.toasts = [];
  var pr = state.prompt;
  var has = !!(pr && pr.kind && (pr.p | 0) === 0);
  var i;
  var idx = -1;
  for (i = 0; i < view.toasts.length; i++) {
    var t = view.toasts[i];
    if (t && t.id === "prompt") { idx = i; break; }
  }

  if (!has) {
    if (idx >= 0) view.toasts.splice(idx, 1);
    return;
  }

  var txt = "";
  if (pr.kind === "discardDown") {
    var over = (state.players[0].hand.length | 0) - (PD.HAND_MAX | 0);
    if (over < 0) over = 0;
    txt = "Too many cards. Discard " + over;
  } else if (pr.kind === "payDebt") {
    var rem = Math.floor(Number(pr.rem || 0));
    if (!isFinite(rem)) rem = 0;
    if (rem < 0) rem = 0;
    txt = "Pay debt: $" + rem + " left";
  } else if (pr.kind === "placeReceived") {
    var n = pr.uids ? (pr.uids.length | 0) : 0;
    txt = "Place received properties: " + n;
  } else {
    txt = "Prompt: " + String(pr.kind);
  }

  var toast = { id: "prompt", kind: "prompt", text: txt, persistent: true };
  if (idx >= 0) {
    view.toasts[idx] = toast;
    // Keep prompt toast at the top.
    if (idx !== 0) {
      view.toasts.splice(idx, 1);
      view.toasts.unshift(toast);
    }
  } else {
    view.toasts.unshift(toast);
  }
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

// Pick the first item matching a predicate from the given row order.
// Returns { row, i, item } or null.
PD.ui.findBestCursorTarget = function (models, rowOrder, predicate) {
  if (!models) return null;
  rowOrder = rowOrder || [0, 1, 2, 3, 4];
  predicate = predicate || function () { return true; };

  var ri;
  for (ri = 0; ri < rowOrder.length; ri++) {
    var row = Math.floor(Number(rowOrder[ri]));
    if (!isFinite(row)) continue;
    if (row < 0 || row > 4) continue;

    var rm = models[row];
    if (!rm || !rm.items || rm.items.length === 0) continue;

    var i;
    for (i = 0; i < rm.items.length; i++) {
      var it = rm.items[i];
      if (!it) continue;
      if (!predicate(it)) continue;
      return { row: row, i: i, item: it };
    }
  }
  return null;
};

PD.ui.cursorMoveTo = function (view, pick) {
  if (!view || !view.cursor || !pick) return;
  view.cursor.row = pick.row;
  view.cursor.i = pick.i;
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
        loc: (kind === "hand") ? { p: p, zone: "hand", i: depth } : ((kind === "bank") ? { p: p, zone: "bank", i: depth } : null),
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

    function pushRecvHandItem(uid, xFace, depth) {
      out.items.push({
        kind: "hand",
        row: row,
        p: p,
        uid: uid,
        depth: depth,
        fanDir: 0,
        x: xFace,
        y: yFace,
        w: L.faceW,
        h: L.faceH,
        loc: { p: p, zone: "recvProps", i: depth },
        stackKey: "recvProps:p" + p + ":row" + row
      });
      var xLo = xFace + L.shadowBarDx;
      var xHi = xFace + L.faceW - 1;
      if (xLo < minX) minX = xLo;
      if (xHi > maxX) maxX = xHi;
    }

    // Hand zone (spaced).
    var pr = state.prompt;
    var isRecvPrompt = !!(!isOp && row === 4 && pr && pr.kind === "placeReceived" && (pr.p | 0) === 0 && (p | 0) === 0);
    var recv = isRecvPrompt ? (pr.uids || []) : null;
    var nRecv = recv ? (recv.length | 0) : 0;

    var xHandStart = isOp ? (L.screenW - padX - L.faceW) : padX;
    var handStep = isOp ? (-L.handStrideX) : L.handStrideX;

    if (!isOp && isRecvPrompt && nRecv > 0) {
      for (i = 0; i < nRecv; i++) {
        pushRecvHandItem(recv[i] | 0, padX + i * L.handStrideX, i);
      }
      var recvW = (nRecv > 0) ? ((nRecv - 1) * L.handStrideX + L.faceW) : 0;
      xHandStart = padX + recvW + L.stackGapX + 2;
    }

    for (i = 0; i < nHand; i++) {
      var uidH = hand[i];
      pushHandRowItem("hand", uidH, xHandStart + i * handStep, i, 0);
    }

    // Bank zone (overlapped stack), opposite side.
    var stride = L.stackStrideX;
    var gap = L.stackGapX;

    if (!isOp) {
      // Player bank: fan right, anchored on the right.
      var bankRightX = L.screenW - padX - L.faceW;
      var bankLeftX = bankRightX - (nBank > 0 ? ((nBank - 1) * stride) : 0);
      var handMaxX = (nHand > 0) ? (xHandStart + (nHand - 1) * L.handStrideX + L.faceW - 1) : (padX - 1);
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
            h: L.faceH,
            loc: (cards[depth].kind === "setProp")
              ? { p: p, zone: "setProps", setI: cards[depth].setI, i: cards[depth].depth }
              : { p: p, zone: "setHouse", setI: cards[depth].setI }
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
            h: L.faceH,
            loc: (cardsO[d2].kind === "setProp")
              ? { p: p, zone: "setProps", setI: cardsO[d2].setI, i: cardsO[d2].depth }
              : { p: p, zone: "setHouse", setI: cardsO[d2].setI }
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

    // Hide buttons while an overlay is active (menu/targeting).
    // Inspect should keep buttons visible/selectable so they can be inspected too.
    var overlayActive = !!(view && (view.mode === "menu" || view.mode === "targeting"));
    if (!overlayActive) {
      // Right-side vertical strip: 4*10px = 40px tall, fits inside center row.
      var stripW = C.centerBtnStripW;
      var stripH = 10;
      var stripX = C.screenW - C.centerBtnStripPadRight - stripW;
      // Bottom-align within the center row band.
      var stripY0 = (C.rowY[2] + C.rowH[2] - 43);

      function pushBtn(id, label, y, disabled) {
        out.items.push({ kind: "btn", id: id, label: label, disabled: !!disabled, row: 2, x: stripX, y: y, w: stripW, h: stripH });
      }

      // End is always available on your turn; if hand > HAND_MAX the engine enters a discard-down prompt.
      var endDisabled = (state.winnerP !== PD.NO_WINNER) || (state.activeP !== 0);
      pushBtn("endTurn", "End", stripY0, endDisabled);
      if (dbgEnabled) {
        pushBtn("step", "Step", stripY0 + 11, false);
        pushBtn("reset", "Reset", stripY0 + 22, false);
        pushBtn("nextScenario", "Next", stripY0 + 33, false);
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

  // If the cursor is on an empty row (common in scenarios like winCheck where hand is empty),
  // relocate to the first row that has at least 1 selectable item so navigation is never "stuck".
  if (!sel) {
    var pick = PD.ui.findBestCursorTarget(models, [4, 3, 2, 1, 0], function () { return true; });
    if (pick) {
      PD.ui.cursorMoveTo(view, pick);
      rm = models[pick.row];
      sel = pick.item;
    }
  }

  // Targeting overlays: ghosts + preview-in-stack for the selected destination.
  var ghosts = [];
  var preview = null;

  if (view.mode === "targeting" && view.targeting && view.targeting.active) {
    var t = view.targeting;
    var cmds = t.cmds || [];
    var cmdI = PD.ui.clampI(Math.floor(Number(t.cmdI || 0)), cmds.length);
    t.cmdI = cmdI;

    // Find source slot in models (for hold-targeting Source destination).
    var srcX = null, srcY = null, srcRow = null;
    if (t.card && t.card.loc && (t.card.loc.zone === "hand" || t.card.loc.zone === "recvProps")) {
      var srcLoc = t.card.loc;
      var rowHand = PD.render.ROW_P_HAND;
      var rmHand = models[rowHand];
      if (rmHand && rmHand.items) {
        var hi;
        for (hi = 0; hi < rmHand.items.length; hi++) {
          var itH = rmHand.items[hi];
          if (!itH || itH.kind !== "hand" || !itH.loc) continue;
          if ((itH.loc.p | 0) !== (srcLoc.p | 0)) continue;
          if (String(itH.loc.zone) !== String(srcLoc.zone)) continue;
          if ((itH.loc.i | 0) !== (srcLoc.i | 0)) continue;
          if ((itH.uid | 0) !== ((t.card.uid | 0))) continue;
          srcX = itH.x;
          srcY = itH.y;
          srcRow = rowHand;
          break;
        }
      }
    }

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
    var hasSrcGhost = false;
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
        // Ghost at the bank drop position (hand row).
        var LhG = PD.config.render.layout;
        var yBG = PD.ui.faceYForRow(4);
        var padXG = LhG.rowPadX;
        var bankRightXG = LhG.screenW - padXG - LhG.faceW;
        var strideBG = LhG.stackStrideX;
        var gapBG = LhG.stackGapX;

        var handG = state.players[0].hand || [];
        var bankG = state.players[0].bank || [];
        var nHandAfterG = handG.length - 1;
        if (nHandAfterG < 0) nHandAfterG = 0;
        var nBankAfterG = bankG.length + 1;

        var handMaxXG = (nHandAfterG > 0) ? (padXG + (nHandAfterG - 1) * LhG.handStrideX + LhG.faceW - 1) : (padXG - 1);
        var bankLeftXG = bankRightXG - ((nBankAfterG > 0) ? ((nBankAfterG - 1) * strideBG) : 0);
        if (nBankAfterG > 0 && bankLeftXG <= (handMaxXG + gapBG)) bankLeftXG = handMaxXG + gapBG + 1;
        var xBG = bankLeftXG + (nBankAfterG - 1) * strideBG;

        ghosts.push({ row: 4, x: xBG, y: yBG, w: LhG.faceW, h: LhG.faceH, kind: "ghostDest", cmdI: j });
        continue;
      } else if (c.kind === "playRent") {
        var rI = Math.floor(Number(c.setI));
        if (!isFinite(rI)) continue;
        var rBaseX = (setXs[rI] != null) ? setXs[rI] : 0;
        var rNBase = (setCardsN[rI] != null) ? setCardsN[rI] : 0;
        if (rNBase <= 0) continue;
        // Highlight the top card of the chosen set (house if present, else last property).
        x = rBaseX + (rNBase - 1) * stride;
      } else if (c.kind === "source") {
        // Ghost at the source slot (hand row), if known.
        if (srcX != null && srcY != null && srcRow != null) {
          ghosts.push({ row: srcRow, x: srcX, y: srcY, w: L.faceW, h: L.faceH, kind: "ghostDest", cmdI: j });
          hasSrcGhost = true;
        }
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
    } else if (cmdSel && cmdSel.kind === "playRent") {
      var rsI = Math.floor(Number(cmdSel.setI));
      if (isFinite(rsI)) {
        var setR = sets[rsI];
        var rN = (setCardsN[rsI] != null) ? (setCardsN[rsI] | 0) : 0;
        if (setR && rN > 0) {
          var topUid = setR.houseUid ? (setR.houseUid | 0) : ((setR.props && setR.props.length) ? (setR.props[setR.props.length - 1][0] | 0) : 0);
          var topColor = null;
          if (!setR.houseUid && setR.props && setR.props.length) topColor = setR.props[setR.props.length - 1][1] | 0;
          var xTop = ((setXs[rsI] != null) ? setXs[rsI] : 0) + (rN - 1) * stride;
          // Re-draw the existing top card and use the preview highlight as the selection outline.
          preview = { row: 3, kind: "preview", forCmdKind: "rent", uid: topUid, color: topColor, x: xTop, y: yFace, w: L.faceW, h: L.faceH };
        }
      }
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
      preview = { row: 4, kind: "preview", forCmdKind: "bank", uid: (t.card && t.card.uid) ? t.card.uid : 0, color: null, x: xB, y: yB, w: Lh.faceW, h: Lh.faceH };
    } else if (cmdSel && cmdSel.kind === "source") {
      // Preview at the source slot (hold-targeting cancel-by-dropping-back).
      if (srcX != null && srcY != null && srcRow != null) {
        preview = {
          row: srcRow,
          kind: "preview",
          forCmdKind: "source",
          uid: (t.card && t.card.uid) ? t.card.uid : 0,
          color: (t.kind === "place" && t.card && t.card.def && PD.isWildDef(t.card.def)) ? t.wildColor : null,
          x: srcX,
          y: srcY,
          w: L.faceW,
          h: L.faceH
        };
      }
    }

    // If the selected destination previews the same uid elsewhere, ensure the source slot is still readable.
    // (This keeps menu-targeting and recvProps placement consistent with hold-targeting: source becomes a ghost.)
    if (
      t.card &&
      t.card.uid &&
      srcX != null &&
      srcY != null &&
      srcRow != null &&
      preview &&
      (preview.uid | 0) === (t.card.uid | 0) &&
      !hasSrcGhost
    ) {
      ghosts.push({ row: srcRow, x: srcX, y: srcY, w: L.faceW, h: L.faceH, kind: "ghostSource", cmdI: -1 });
    }
  }

  // Menu-hover destination preview (only when unambiguous).
  if (!preview && view.mode === "menu" && view.menu && view.menu.items && view.menu.items.length > 0 && view.menu.src) {
    var nMenuItems = view.menu.items.length | 0;
    var mi = PD.ui.clampI(Math.floor(Number(view.menu.i || 0)), nMenuItems);
    view.menu.i = mi;
    var itM = view.menu.items[mi];
    var srcM = view.menu.src;
    if (itM && srcM && srcM.uid) {
      var uidM = srcM.uid | 0;
      var defM = PD.defByUid(state, uidM);
      var movesM = PD.legalMoves(state);
      var cmdsM = [];

      if (itM.id === "bank") {
        var ib;
        for (ib = 0; ib < movesM.length; ib++) {
          var mb = movesM[ib];
          if (!mb || mb.kind !== "bank") continue;
          if (!mb.card || (mb.card.uid | 0) !== (uidM | 0)) continue;
          cmdsM.push(mb);
        }
      } else if (itM.id === "place") {
        if (defM && defM.kind === PD.CardKind.Property) {
          var wildColorM = (defM && PD.isWildDef(defM)) ? PD.ui.defaultWildColorForPlace(state, uidM, defM) : PD.NO_COLOR;
          cmdsM = PD.ui.placeCmdsForUid(state, uidM, defM, wildColorM);
        }
      } else if (itM.id === "build") {
        if (defM && defM.kind === PD.CardKind.House) {
          var ih;
          for (ih = 0; ih < movesM.length; ih++) {
            var mh = movesM[ih];
            if (!mh || mh.kind !== "playHouse") continue;
            if (!mh.card || (mh.card.uid | 0) !== (uidM | 0)) continue;
            cmdsM.push(mh);
          }
        }
      }

      if (cmdsM.length === 1) {
        var cm = cmdsM[0];
        if (cm && (cm.kind === "playProp" || cm.kind === "playHouse")) {
          // Same table placement math as targeting.
          var Lm = PD.config.render.layout;
          var yFm = PD.ui.faceYForRow(3);
          var strideM = Lm.stackStrideX;
          var cursorXM = Lm.rowPadX;
          var setsM = state.players[0].sets;
          var setXsM = [];
          var setCardsNM = [];
          var sm;
          for (sm = 0; sm < setsM.length; sm++) {
            var setm = setsM[sm];
            if (!setm) { setXsM[sm] = cursorXM; setCardsNM[sm] = 0; continue; }
            var nCardsM = (setm.props ? setm.props.length : 0) + (setm.houseUid ? 1 : 0);
            setXsM[sm] = cursorXM;
            setCardsNM[sm] = nCardsM;
            if (nCardsM > 0) cursorXM = cursorXM + Lm.faceW + (nCardsM - 1) * strideM + Lm.stackGapX;
            else cursorXM = cursorXM + Lm.faceW + Lm.stackGapX;
          }
          var newSetXM = cursorXM;

          var xPm = 0;
          if (cm.kind === "playProp") {
            if (cm.dest && cm.dest.newSet) xPm = newSetXM;
            else if (cm.dest && cm.dest.setI != null) {
              var psiM = Math.floor(Number(cm.dest.setI));
              if (isFinite(psiM)) {
                xPm = ((setXsM[psiM] != null) ? setXsM[psiM] : 0) + (((setCardsNM[psiM] != null) ? setCardsNM[psiM] : 0) * strideM);
              }
            }
          } else if (cm.kind === "playHouse") {
            var hsiM = Math.floor(Number(cm.dest.setI));
            if (isFinite(hsiM)) {
              xPm = ((setXsM[hsiM] != null) ? setXsM[hsiM] : 0) + (((setCardsNM[hsiM] != null) ? setCardsNM[hsiM] : 0) * strideM);
            }
          }

          preview = {
            row: 3,
            kind: "preview",
            forCmdKind: cm.kind,
            uid: uidM,
            color: (cm.kind === "playProp" && defM && PD.isWildDef(defM)) ? (cm.color | 0) : null,
            x: xPm,
            y: yFm,
            w: Lm.faceW,
            h: Lm.faceH
          };
        } else if (cm && cm.kind === "bank") {
          // Bank preview uses post-drop layout (hand -1, bank +1).
          var Lb = PD.config.render.layout;
          var yBb = PD.ui.faceYForRow(4);
          var padXb = Lb.rowPadX;
          var bankRightXb = Lb.screenW - padXb - Lb.faceW;
          var strideBb = Lb.stackStrideX;
          var gapBb = Lb.stackGapX;

          var handb = state.players[0].hand || [];
          var bankb = state.players[0].bank || [];
          var nHandAfterb = (handb.length | 0) - 1;
          if (nHandAfterb < 0) nHandAfterb = 0;
          var nBankAfterb = (bankb.length | 0) + 1;

          var handMaxXb = (nHandAfterb > 0) ? (padXb + (nHandAfterb - 1) * Lb.handStrideX + Lb.faceW - 1) : (padXb - 1);
          var bankLeftXb = bankRightXb - ((nBankAfterb > 0) ? ((nBankAfterb - 1) * strideBb) : 0);
          if (nBankAfterb > 0 && bankLeftXb <= (handMaxXb + gapBb)) bankLeftXb = handMaxXb + gapBb + 1;

          var xBb = bankLeftXb + (nBankAfterb - 1) * strideBb;
          preview = { row: 4, kind: "preview", forCmdKind: "bank", uid: uidM, color: null, x: xBb, y: yBb, w: Lb.faceW, h: Lb.faceH };
        }
      }

      // When menu hover produces a preview of the same uid, ghost the source slot so it doesn't look duplicated.
      if (preview && (preview.uid | 0) === (uidM | 0) && srcM && srcM.loc) {
        var rowHandM = PD.render.ROW_P_HAND;
        var rmHandM = models[rowHandM];
        if (rmHandM && rmHandM.items) {
          var hiM;
          for (hiM = 0; hiM < rmHandM.items.length; hiM++) {
            var itHM = rmHandM.items[hiM];
            if (!itHM || itHM.kind !== "hand" || !itHM.loc) continue;
            if ((itHM.uid | 0) !== (uidM | 0)) continue;
            if ((itHM.loc.p | 0) !== (srcM.loc.p | 0)) continue;
            if (String(itHM.loc.zone) !== String(srcM.loc.zone)) continue;
            if ((itHM.loc.i | 0) !== (srcM.loc.i | 0)) continue;
            ghosts.push({ row: rowHandM, x: itHM.x, y: itHM.y, w: PD.config.render.layout.faceW, h: PD.config.render.layout.faceH, kind: "ghostMenuSource", cmdI: -1 });
            break;
          }
        }
      }
    }
  }

  var computed = { models: models, selected: sel, ghosts: ghosts, preview: preview };
  computed = PD.anim.present(state, view, computed) || computed;
  return computed;
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

    // In overlay modes, have the preview destination row camera follow the preview.
    if ((view.mode === "targeting" || view.mode === "menu") && computed.preview && row === computed.preview.row) selItem = computed.preview;

    PD.ui.ensureCamForSelection(models[row], row, selItem, view.camX);
  }
};

// Helpers for Place command lists (shared by targeting + menu label tweaks).
PD.ui.defaultWildColorForPlace = function (state, uid, def) {
  if (!def || !PD.isWildDef(def)) return PD.NO_COLOR;
  uid = uid | 0;
  var moves = PD.legalMoves(state);
  var c0 = def.wildColors[0];
  var c1 = def.wildColors[1];
  var has0 = false, has1 = false;
  var i;
  for (i = 0; i < moves.length; i++) {
    var mp = moves[i];
    if (!mp || mp.kind !== "playProp") continue;
    if (!mp.card || (mp.card.uid | 0) !== (uid | 0)) continue;
    if (mp.color === c0 && mp.dest && mp.dest.setI != null) has0 = true;
    if (mp.color === c1 && mp.dest && mp.dest.setI != null) has1 = true;
  }
  return has0 ? c0 : (has1 ? c1 : c0);
};

PD.ui.placeCmdsForUid = function (state, uid, def, wildColor) {
  uid = uid | 0;
  wildColor = wildColor | 0;
  var moves = PD.legalMoves(state);
  var cmds = [];
  var i;
  var isWild = !!(def && PD.isWildDef(def));
  for (i = 0; i < moves.length; i++) {
    var mf = moves[i];
    if (!mf || mf.kind !== "playProp") continue;
    if (!mf.card || (mf.card.uid | 0) !== (uid | 0)) continue;
    if (isWild && (mf.color | 0) !== (wildColor | 0)) continue;
    cmds.push(mf);
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
  return existing.concat(newSet);
};

PD.ui.menuOpenForSelection = function (state, view, sel) {
  if (!view || !view.menu) return;
  view.menu.items = [];
  view.menu.i = 0;
  view.menu.src = sel ? { row: sel.row, i: view.cursor.i, uid: sel.uid, loc: sel.loc || null } : null;

  if (!sel || !sel.loc) return;
  var zSel = String(sel.loc.zone || "");
  if (!(zSel === "hand" || zSel === "recvProps")) return;
  if ((sel.loc.p | 0) !== 0) return;

  var uid = sel.uid;
  var def = PD.defByUid(state, uid);
  if (!def) return;

  function colorName(c) {
    c = Math.floor(Number(c));
    if (!isFinite(c)) c = 0;
    if (c === PD.Color.Cyan) return "Cyan";
    if (c === PD.Color.Magenta) return "Magenta";
    if (c === PD.Color.Orange) return "Orange";
    if (c === PD.Color.Black) return "Black";
    return "c" + c;
  }

  function destLabelForCmd(cmd) {
    if (!cmd) return "";
    if (cmd.kind === "playProp") {
      if (cmd.dest && cmd.dest.newSet) return "New Set";
      if (cmd.dest && cmd.dest.setI != null) {
        var setI = Math.floor(Number(cmd.dest.setI));
        var set = isFinite(setI) ? state.players[0].sets[setI] : null;
        var col = set ? PD.getSetColor(set.props) : PD.NO_COLOR;
        return colorName(col) + " Set";
      }
    } else if (cmd.kind === "playHouse") {
      if (cmd.dest && cmd.dest.setI != null) {
        var setI2 = Math.floor(Number(cmd.dest.setI));
        var set2 = isFinite(setI2) ? state.players[0].sets[setI2] : null;
        var col2 = set2 ? PD.getSetColor(set2.props) : PD.NO_COLOR;
        return colorName(col2) + " Set";
      }
    }
    return "";
  }

  // Build/Place actions are only meaningful for the currently implemented rules.
  if (def.kind === PD.CardKind.Property) {
    var wildColor = (def && PD.isWildDef(def)) ? PD.ui.defaultWildColorForPlace(state, uid, def) : PD.NO_COLOR;
    var placeCmds = PD.ui.placeCmdsForUid(state, uid, def, wildColor);
    var placeLabel = "Place";
    if (placeCmds.length === 1) {
      var dl = destLabelForCmd(placeCmds[0]);
      if (dl) placeLabel = "Place -> " + dl;
    }
    view.menu.items.push({ id: "place", label: placeLabel });
  }
  if (def.kind === PD.CardKind.House) {
    // Only offer Build if legal.
    var moves = PD.legalMoves(state);
    var hasBuild = false;
    var buildMoves = [];
    var m;
    for (m = 0; m < moves.length; m++) {
      var mv = moves[m];
      if (mv && mv.kind === "playHouse" && mv.card && mv.card.uid === uid) {
        hasBuild = true;
        buildMoves.push(mv);
      }
    }
    if (hasBuild) {
      var buildLabel = "Build";
      if (buildMoves.length === 1) {
        var dl2 = destLabelForCmd(buildMoves[0]);
        if (dl2) buildLabel = "Build -> " + dl2;
      }
      view.menu.items.push({ id: "build", label: buildLabel });
    }
  }
  if (def.kind === PD.CardKind.Action && def.actionKind === PD.ActionKind.Rent) {
    // Offer Rent only if there is at least one legal rent target.
    var movesR = PD.legalMoves(state);
    var rentMoves = [];
    var mr;
    for (mr = 0; mr < movesR.length; mr++) {
      var mvR = movesR[mr];
      if (mvR && mvR.kind === "playRent" && mvR.card && mvR.card.uid === uid) rentMoves.push(mvR);
    }
    if (rentMoves.length > 0) {
      var rentLabel = "Rent";
      if (rentMoves.length === 1) {
        // Reuse destination labeling by synthesizing a playProp-like label.
        var onlyR = rentMoves[0];
        var setI3 = Math.floor(Number(onlyR.setI));
        var set3 = isFinite(setI3) ? state.players[0].sets[setI3] : null;
        var col3 = set3 ? PD.getSetColor(set3.props) : PD.NO_COLOR;
        rentLabel = "Rent -> " + colorName(col3) + " Set";
      }
      view.menu.items.push({ id: "rent", label: rentLabel });
    }
  }
  if (PD.isBankableDef(def)) {
    view.menu.items.push({ id: "bank", label: "Bank" });
  }

  // Explicit cancel option so A-confirm can cancel too (in addition to B).
  view.menu.items.push({ id: "source", label: "Cancel" });

  // Always allow cancel/back with B; no explicit menu item needed.
};

PD.ui.locAllowsSource = function (loc) {
  if (!loc || !loc.zone) return false;
  var z = String(loc.zone);
  return (z === "hand") || (z === "recvProps");
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
  var allowSource = PD.ui.locAllowsSource(t.card ? t.card.loc : null);

  if (t.kind === "bank") {
    for (i = 0; i < moves.length; i++) {
      var mb = moves[i];
      if (!mb || mb.kind !== "bank") continue;
      if (!mb.card || mb.card.uid !== uid) continue;
      cmds.push(mb);
    }
    if (allowSource) cmds.push({ kind: "source" });
    t.cmds = cmds;
    t.cmdI = 0;
    view.mode = "targeting";
    return;
  }

  if (t.kind === "rent") {
    for (i = 0; i < moves.length; i++) {
      var mr = moves[i];
      if (!mr || mr.kind !== "playRent") continue;
      if (!mr.card || mr.card.uid !== uid) continue;
      cmds.push(mr);
    }
    // Default selection prefers the highest rent amount, but player can override by cycling.
    cmds.sort(function (a, b) {
      var ai = (a && a.setI != null) ? (a.setI | 0) : -1;
      var bi = (b && b.setI != null) ? (b.setI | 0) : -1;
      var aa = PD.rentAmountForSet ? (PD.rentAmountForSet(state, 0, ai) | 0) : 0;
      var bb = PD.rentAmountForSet ? (PD.rentAmountForSet(state, 0, bi) | 0) : 0;
      var d = bb - aa;
      if (d) return d;
      return ai - bi;
    });
    if (allowSource) cmds.push({ kind: "source" });
    t.cmds = cmds;
    t.cmdI = 0;
    view.mode = "targeting";
    return;
  }

  if (t.kind === "quick") {
    // Quick (hold-A) targeting: cycle a flat list of command options.
    var rentCmds = [];
    var buildCmds = [];
    var bankCmds = [];
    for (i = 0; i < moves.length; i++) {
      var m = moves[i];
      if (!m || !m.kind) continue;
      if (m.card && m.card.uid !== uid) continue;
      if (m.kind === "playRent") rentCmds.push(m);
      else if (m.kind === "playHouse") buildCmds.push(m);
      else if (m.kind === "bank") bankCmds.push(m);
    }

    // Default rent choice: highest amount first (player can override via cycling).
    rentCmds.sort(function (a, b) {
      var ai = (a && a.setI != null) ? (a.setI | 0) : -1;
      var bi = (b && b.setI != null) ? (b.setI | 0) : -1;
      var aa = PD.rentAmountForSet ? (PD.rentAmountForSet(state, 0, ai) | 0) : 0;
      var bb = PD.rentAmountForSet ? (PD.rentAmountForSet(state, 0, bi) | 0) : 0;
      var d = bb - aa;
      if (d) return d;
      return ai - bi;
    });

    cmds = rentCmds.concat(buildCmds).concat(bankCmds);
    if (allowSource) cmds.push({ kind: "source" });
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
    if (allowSource) cmds.push({ kind: "source" });
    t.cmds = cmds;
    t.cmdI = 0;
    view.mode = "targeting";
    return;
  }

  if (t.kind === "place") {
    if (def && PD.isWildDef(def)) {
      t.wildColor = PD.ui.defaultWildColorForPlace(state, uid, def);
      cmds = PD.ui.placeCmdsForUid(state, uid, def, t.wildColor);
    } else {
      t.wildColor = PD.NO_COLOR;
      cmds = PD.ui.placeCmdsForUid(state, uid, def, PD.NO_COLOR);
    }
    if (allowSource) cmds.push({ kind: "source" });
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
  var keepSource = !!(prevCmd && prevCmd.kind === "source");

  var uid = t.card.uid;
  var cmds = PD.ui.placeCmdsForUid(state, uid, def, nextColor);
  if (PD.ui.locAllowsSource(t.card ? t.card.loc : null)) cmds.push({ kind: "source" });

  t.wildColor = nextColor;
  t.cmds = cmds;

  // Preserve selection if possible.
  var selI = 0;
  var i;
  if (keepNewSet) {
    for (i = 0; i < cmds.length; i++) if (cmds[i] && cmds[i].dest && cmds[i].dest.newSet) { selI = i; break; }
  } else if (keepSetI != null) {
    for (i = 0; i < cmds.length; i++) if (cmds[i] && cmds[i].dest && cmds[i].dest.setI === keepSetI) { selI = i; break; }
  } else if (keepSource) {
    for (i = 0; i < cmds.length; i++) if (cmds[i] && cmds[i].kind === "source") { selI = i; break; }
  }
  t.cmdI = selI;
};

PD.ui.step = function (state, view, actions) {
  if (!state || !view) return null;
  actions = actions || {};

  // Tick feedback timers.
  PD.anim.feedbackTick(view);
  PD.ui.toastsTick(view);
  PD.ui.syncPromptToast(state, view);
  PD.anim.tick(state, view);

  // Prompt mode sync (Phase 05b+): prompts are rules-owned, UI adopts a dedicated mode.
  var pr = state.prompt;
  var hasPrompt = !!pr;
  var promptForP0 = !!(hasPrompt && (pr.p | 0) === 0);
  if (promptForP0) {
    var k = pr && pr.kind ? String(pr.kind) : "";
    // Phase 06: allow overlays during recipient placement prompt.
    var allowOverlays = (k === "placeReceived");
    if (!allowOverlays) {
      // Prompts override overlays.
      if (view.mode === "menu") { view.menu.items = []; }
      if (view.targeting) view.targeting.active = false;
      view.mode = "prompt";
    } else {
      // Keep menu/targeting when active; otherwise remain in prompt mode.
      if (!(view.mode === "menu" || view.mode === "targeting")) view.mode = "prompt";
    }
  } else {
    // If a prompt ended while we were in a prompt-only targeting flow, drop it.
    if (view.mode === "targeting" && view.targeting && view.targeting.active && view.targeting.card && view.targeting.card.loc && view.targeting.card.loc.zone === "recvProps") {
      view.targeting.active = false;
      view.mode = "browse";
    }
    if (view.mode === "prompt") view.mode = "browse";
  }

  // Inspect is meaningful in browse + prompt mode.
  view.inspectActive = !!((view.mode === "browse" || view.mode === "prompt") && actions.x && actions.x.inspectActive);

  // Compute models for navigation helpers.
  var computed = PD.ui.computeRowModels(state, view);
  PD.ui.updateCameras(state, view, computed);

  // While animating (shuffle/deal), lock input and just keep the view stable.
  if (view.anim && view.anim.lock) {
    computed = PD.ui.computeRowModels(state, view);
    PD.ui.updateCameras(state, view, computed);
    return null;
  }

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
      var pickEnd = PD.ui.findBestCursorTarget(computed.models, [2], function (it) {
        return it && it.kind === "btn" && it.id === "endTurn" && !it.disabled;
      });
      if (pickEnd) {
        PD.ui.cursorMoveTo(view, pickEnd);
        computed = PD.ui.computeRowModels(state, view);
        PD.ui.updateCameras(state, view, computed);
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

  function promptPickHandItemIndices() {
    var out = [];
    if (!computed || !computed.models) return out;
    var rowHand = PD.render.ROW_P_HAND;
    var rm = computed.models[rowHand];
    if (!rm || !rm.items) return out;
    var i;
    for (i = 0; i < rm.items.length; i++) {
      var it = rm.items[i];
      if (!it || it.kind !== "hand" || !it.loc) continue;
      if (it.loc.zone !== "hand") continue;
      if ((it.loc.p | 0) !== 0) continue;
      out.push(i);
    }
    return out;
  }

  function promptSnapCursorToHand(handItemIs) {
    var rowHand = PD.render.ROW_P_HAND;
    view.cursor.row = rowHand;
    if (!handItemIs || handItemIs.length === 0) { view.cursor.i = 0; return; }
    // If current cursor isn't on a hand card, snap to the first hand card.
    var rm = computed.models[rowHand];
    var cur = rm && rm.items ? rm.items[PD.ui.clampI(view.cursor.i, rm.items.length)] : null;
    if (!cur || cur.kind !== "hand" || !cur.loc || cur.loc.zone !== "hand") {
      view.cursor.i = handItemIs[0];
      return;
    }
    // Otherwise, ensure i is an actual hand-item index.
    var j;
    for (j = 0; j < handItemIs.length; j++) if ((handItemIs[j] | 0) === (view.cursor.i | 0)) return;
    view.cursor.i = handItemIs[0];
  }

  function promptCycleHand(handItemIs, dir) {
    if (!handItemIs || handItemIs.length === 0) return;
    var curI = view.cursor.i | 0;
    var k;
    var curK = 0;
    for (k = 0; k < handItemIs.length; k++) if ((handItemIs[k] | 0) === (curI | 0)) { curK = k; break; }
    var nextK = curK + (dir | 0);
    nextK = PD.ui.wrapI(nextK, handItemIs.length);
    view.cursor.i = handItemIs[nextK];
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
      if (it.id === "source") return null;
      if (!src.loc || (src.loc.p | 0) !== 0) return null;
      var uid = src.uid;
      var srcZone = String(src.loc.zone || "");

      if (it.id === "bank") {
        if (srcZone !== "hand") return null;
        var cmd = { kind: "bank", card: { uid: uid, loc: src.loc } };
        return { kind: "applyCmd", cmd: cmd };
      }

      if (it.id === "rent") {
        if (srcZone !== "hand") return null;
        // If unambiguous, auto-apply. Otherwise enter targeting.
        var movesR = PD.legalMoves(state);
        var rentMoves = [];
        var mr;
        for (mr = 0; mr < movesR.length; mr++) {
          var mvR = movesR[mr];
          if (mvR && mvR.kind === "playRent" && mvR.card && mvR.card.uid === uid) rentMoves.push(mvR);
        }
        if (rentMoves.length === 1) {
          return { kind: "applyCmd", cmd: rentMoves[0] };
        }
        PD.ui.targetingEnter(state, view, "rent", false, uid, src.loc);
        return null;
      }

      if (it.id === "place") {
        if (!(srcZone === "hand" || srcZone === "recvProps")) return null;
        PD.ui.targetingEnter(state, view, "place", false, uid, src.loc);
        if (view.targeting && view.targeting.active && view.targeting.cmds) {
          var real = [];
          var r;
          for (r = 0; r < view.targeting.cmds.length; r++) {
            var c = view.targeting.cmds[r];
            if (!c || !c.kind) continue;
            if (c.kind === "source") continue;
            real.push(c);
          }
          if (real.length === 1) {
            var only = real[0];
          view.targeting.active = false;
          view.mode = "browse";
            if (only && only.kind) return { kind: "applyCmd", cmd: only };
          }
        }
        return null;
      }

      if (it.id === "build") {
        if (srcZone !== "hand") return null;
        PD.ui.targetingEnter(state, view, "build", false, uid, src.loc);
        if (view.targeting && view.targeting.active && view.targeting.cmds) {
          var realB = [];
          var rb;
          for (rb = 0; rb < view.targeting.cmds.length; rb++) {
            var cb = view.targeting.cmds[rb];
            if (!cb || !cb.kind) continue;
            if (cb.kind === "source") continue;
            realB.push(cb);
          }
          if (realB.length === 1) {
            var onlyB = realB[0];
          view.targeting.active = false;
          view.mode = "browse";
            if (onlyB && onlyB.kind) return { kind: "applyCmd", cmd: onlyB };
          }
        }
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
      PD.anim.feedbackError(view, "no_targets", "No valid destination");
      t.active = false;
      view.mode = "browse";
      return null;
    }

    var cmdI = PD.ui.clampI(t.cmdI, t.cmds.length);
    var cmdSel = t.cmds[cmdI];
    t.active = false;
    view.mode = "browse";

    if (!cmdSel) return null;
    if (cmdSel.kind === "source") return null;
    return { kind: "applyCmd", cmd: cmdSel };
  }

  // Browse mode
  if (view.mode !== "prompt") view.mode = "browse";

  // Prompt mode (Phase 05b+): rules-owned prompts.
  if (view.mode === "prompt") {
    var prompt = state.prompt;
    if (!prompt || (prompt.p | 0) !== 0) {
      view.mode = "browse";
      return null;
    }
    if (!view.ux) view.ux = { lastActiveP: null, lastPlaysLeft: null };
    if (prompt.kind !== "placeReceived") view.ux.placeReceivedSnapped = false;

    function applyPromptNav() {
      if (!actions.nav) return;
      var dir = null;
      if (actions.nav.up) dir = "up";
      else if (actions.nav.down) dir = "down";
      else if (actions.nav.left) dir = "left";
      else if (actions.nav.right) dir = "right";
      if (!dir) return;
      var pick = PD.ui.navPickInDirection(view, computed, dir);
      if (pick) {
        view.cursor.row = pick.row;
        view.cursor.i = pick.i;
      }
    }

    function snapCursorToFirstRecv() {
      var pick = PD.ui.findBestCursorTarget(computed.models, [PD.render.ROW_P_HAND], function (it) {
        return it && it.kind === "hand" && it.loc && it.loc.zone === "recvProps" && (it.loc.p | 0) === 0;
      });
      if (pick) PD.ui.cursorMoveTo(view, pick);
    }

    // One-shot autofocus when the placeReceived prompt begins.
    if (prompt.kind === "placeReceived" && !view.ux.placeReceivedSnapped) {
      snapCursorToFirstRecv();
      view.ux.placeReceivedSnapped = true;
      computed = PD.ui.computeRowModels(state, view);
      PD.ui.updateCameras(state, view, computed);
    }

    if (prompt.kind === "discardDown") {
      // Lock cursor to player hand cards only (not bank).
      var handIs = promptPickHandItemIndices();
      promptSnapCursorToHand(handIs);

      // Recompute after snapping cursor.
      computed = PD.ui.computeRowModels(state, view);
      PD.ui.updateCameras(state, view, computed);

      // Left/Right cycle within hand.
      if (actions.nav && actions.nav.left) promptCycleHand(handIs, -1);
      if (actions.nav && actions.nav.right) promptCycleHand(handIs, 1);

      // Cancel: only before any discard has happened in this prompt instance.
      if (actions.b && actions.b.pressed) {
        var nDiscarded = Number(prompt.nDiscarded || 0);
        if (!isFinite(nDiscarded)) nDiscarded = 0;
        if (nDiscarded <= 0) {
          return { kind: "applyCmd", cmd: { kind: "cancelPrompt" } };
        }
        PD.anim.feedbackError(view, "prompt_forced", "Must discard");
        return null;
      }

      // Discard with A tap.
      if (actions.a && actions.a.tap) {
        computed = PD.ui.computeRowModels(state, view);
        PD.ui.updateCameras(state, view, computed);
        var selP = currentSelection();
        if (selP && selP.loc && selP.loc.zone === "hand" && selP.loc.p === 0) {
          return { kind: "applyCmd", cmd: { kind: "discard", card: { uid: selP.uid, loc: selP.loc } } };
        }
      }

      return null;
    }

    // Hold-A grab: enter targeting *before* directional nav so the nudge that triggers
    // grabStart doesn't also move the cursor to a different card in the same frame.
    if (prompt.kind === "placeReceived" && actions.a && actions.a.grabStart) {
      var selGrabP = currentSelection();
      if (!selGrabP || !selGrabP.loc) { PD.anim.feedbackError(view, "no_actions", "No actions"); snapCursorToFirstRecv(); return null; }
      if (selGrabP.loc.zone !== "recvProps") {
        PD.anim.feedbackError(view, "place_recv_only", "Select a received property");
        snapCursorToFirstRecv();
        return null;
      }
      PD.ui.targetingEnter(state, view, "place", true, selGrabP.uid, selGrabP.loc);
      return null;
    }

    // For Phase 06 prompts, allow normal directional navigation (screen-space).
    applyPromptNav();
    computed = PD.ui.computeRowModels(state, view);
    PD.ui.updateCameras(state, view, computed);

    if (prompt.kind === "payDebt") {
      if (actions.b && actions.b.pressed) {
        PD.anim.feedbackError(view, "prompt_forced", "Must pay");
        return null;
      }

      if (actions.a && actions.a.tap) {
        var selD = currentSelection();
        // Allow debug buttons (Step/Reset/Next) during this prompt; End remains disallowed.
        if (selD && selD.kind === "btn") {
          if (selD.id === "step") return { kind: "debug", action: "step" };
          if (selD.id === "reset") return { kind: "debug", action: "reset" };
          if (selD.id === "nextScenario") return { kind: "debug", action: "nextScenario" };
          if (selD.id === "endTurn") { PD.anim.feedbackError(view, "prompt_forced", "Must pay"); return null; }
        }
        if (!selD || !selD.loc) { PD.anim.feedbackError(view, "no_actions", "No actions"); return null; }

        // House-pay-first redirect: selecting a property in a housed set snaps to the House.
        if (selD.loc.zone === "setProps" && selD.loc.setI != null) {
          var setI = selD.loc.setI | 0;
          var set = state.players[0].sets[setI];
          if (set && set.houseUid) {
            var rmT = computed.models[PD.render.ROW_P_TABLE];
            if (rmT && rmT.items) {
              var ii;
              for (ii = 0; ii < rmT.items.length; ii++) {
                var itH = rmT.items[ii];
                if (!itH || itH.kind !== "setHouse" || !itH.loc) continue;
                if ((itH.loc.p | 0) !== 0) continue;
                if ((itH.loc.setI | 0) !== (setI | 0)) continue;
                view.cursor.row = PD.render.ROW_P_TABLE;
                view.cursor.i = ii;
                PD.ui.toastPush(view, { id: "debt:houseFirst", kind: "info", text: "House must be paid first", frames: 45 });
                PD.anim.feedbackError(view, "house_pay_first", "");
                return null;
              }
            }
            PD.anim.feedbackError(view, "house_pay_first", "House must be paid first");
            return null;
          }
        }

        if (selD.loc.zone === "bank" || selD.loc.zone === "setProps" || selD.loc.zone === "setHouse") {
          return { kind: "applyCmd", cmd: { kind: "payDebt", card: { uid: selD.uid, loc: selD.loc } } };
        }

        PD.anim.feedbackError(view, "no_actions", "Can't pay with that");
      }

      return null;
    }

    if (prompt.kind === "placeReceived") {
      if (actions.b && actions.b.pressed) {
        PD.anim.feedbackError(view, "prompt_forced", "Must place");
        snapCursorToFirstRecv();
        return null;
      }

      if (actions.a && actions.a.tap) {
        var selR = currentSelection();
        // Allow debug buttons (Step/Reset/Next) during this prompt; End remains disallowed.
        if (selR && selR.kind === "btn") {
          if (selR.id === "step") return { kind: "debug", action: "step" };
          if (selR.id === "reset") return { kind: "debug", action: "reset" };
          if (selR.id === "nextScenario") return { kind: "debug", action: "nextScenario" };
          if (selR.id === "endTurn") {
            PD.anim.feedbackError(view, "prompt_forced", "Must place");
            snapCursorToFirstRecv();
            return null;
          }
        }
        if (!selR || !selR.loc) { PD.anim.feedbackError(view, "no_actions", "No actions"); snapCursorToFirstRecv(); return null; }
        if (selR.loc.zone !== "recvProps") {
          PD.anim.feedbackError(view, "place_recv_only", "Select a received property");
          snapCursorToFirstRecv();
          return null;
        }
        // Tap-A workflow: go directly to placement targeting (only action in this prompt).
        PD.ui.targetingEnter(state, view, "place", false, selR.uid, selR.loc);
        return null;
      }

      return null;
    }

    // Unknown prompt kind (UI doesn't handle yet).
    view.mode = "browse";
    return null;
  }

  // Navigation (directional, screen-space).
  // Hold-A grab: enter targeting *before* directional nav so the nudge that triggers
  // grabStart doesn't also move the cursor to a different card in the same frame.
  if (actions.a && actions.a.grabStart) {
    var selGrab = currentSelection();
    if (selGrab && selGrab.loc && selGrab.loc.zone === "hand" && selGrab.loc.p === 0) {
      var uidGrab = selGrab.uid;
      var defGrab = PD.defByUid(state, uidGrab);
      if (defGrab && defGrab.kind === PD.CardKind.Property) {
        PD.ui.targetingEnter(state, view, "place", true, uidGrab, selGrab.loc);
        return null;
      } else if (defGrab && (defGrab.kind === PD.CardKind.House || (defGrab.kind === PD.CardKind.Action && defGrab.actionKind === PD.ActionKind.Rent))) {
        PD.ui.targetingEnter(state, view, "quick", true, uidGrab, selGrab.loc);
        return null;
      } else if (defGrab && PD.isBankableDef(defGrab)) {
        PD.ui.targetingEnter(state, view, "bank", true, uidGrab, selGrab.loc);
        return null;
      }
      PD.anim.feedbackError(view, "hold_noop", "Can't do that");
      return null;
    }
  }

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
        PD.anim.feedbackError(view, "disabled_btn", msg);

        // Move selection to next available center button (prefer Step).
        var pickNext =
          PD.ui.findBestCursorTarget(computed.models, [2], function (it) {
            return it && it.kind === "btn" && it.id === "step" && !it.disabled;
          }) ||
          PD.ui.findBestCursorTarget(computed.models, [2], function (it) {
            return it && it.kind === "btn" && !it.disabled && it.id !== "endTurn";
          }) ||
          PD.ui.findBestCursorTarget(computed.models, [2], function (it) {
            return it && (it.kind === "discard" || it.kind === "deck");
          });

        if (pickNext) {
          PD.ui.cursorMoveTo(view, pickNext);
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
        PD.anim.feedbackError(view, "no_actions", "No actions");
      }
    }
  }

  // If hold targeting is active and A is no longer held, auto-confirm is handled in targeting mode.

  return null;
};

