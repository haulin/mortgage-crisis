// Centralized focus policy (autofocus + selection preservation).
// Note: This file is concatenated after `src/65_ui.js`; callers only invoke it at runtime from PD.ui.step().

PD.ui.focus = {};

PD.ui.focus._screenCenter = function (view, item) {
  var row = item.row;
  var cam = view.camX[row];
  var x = item.x;
  var y = item.y;
  var w = item.w;
  var h = item.h;
  return { cx: (x - cam) + (w / 2), cy: y + (h / 2) };
};

PD.ui.focus.snapshot = function (state, view, computed) {
  var row = view.cursor.row;
  var rm = computed.models[row];
  var items = rm.items;
  var sel = items[PD.ui.clampI(view.cursor.i, items.length)];
  if (!sel) { view.ux.selAnchor = null; return; }

  var c = PD.ui.focus._screenCenter(view, sel);
  view.ux.selAnchor = {
    row: sel.row,
    kind: sel.kind,
    uid: sel.uid,
    loc: sel.loc,
    screenCx: c.cx,
    screenCy: c.cy
  };
};

PD.ui.focus._findItemByUidLoc = function (computed, uid, loc) {
  var models = computed.models;
  var row;
  for (row = 0; row < models.length; row++) {
    var rm = models[row];
    if (!rm || !rm.items) continue;
    var i;
    for (i = 0; i < rm.items.length; i++) {
      var it = rm.items[i];
      if (!it) continue;
      if (it.uid !== uid) continue;
      if (loc) {
        // Match on zone/p and indices when available.
        if (!it.loc) continue;
        if (it.loc.zone !== loc.zone) continue;
        if ((it.loc.p != null) && (loc.p != null) && it.loc.p !== loc.p) continue;
        if ((it.loc.i != null) && (loc.i != null) && it.loc.i !== loc.i) continue;
        if ((it.loc.setI != null) && (loc.setI != null) && it.loc.setI !== loc.setI) continue;
      }
      return { row: row, i: i, item: it };
    }
  }
  return null;
};

PD.ui.focus._nearestByGeometry = function (view, computed, anchor) {
  var models = computed.models;
  var best = null;
  var bestScore = 999999999;
  var ax = anchor.screenCx;
  var ay = anchor.screenCy;

  var row;
  for (row = 0; row < models.length; row++) {
    var rm = models[row];
    if (!rm || !rm.items || rm.items.length === 0) continue;
    var i;
    for (i = 0; i < rm.items.length; i++) {
      var it = rm.items[i];
      if (!it) continue;
      var c = PD.ui.focus._screenCenter(view, it);
      var dx = c.cx - ax;
      var dy = c.cy - ay;
      var d2 = dx * dx + dy * dy;
      // Prefer staying in the same row when distances are similar.
      var rowPenalty = (anchor.row != null && row !== anchor.row) ? 2000 : 0;
      var score = d2 + rowPenalty;
      if (score < bestScore) { bestScore = score; best = { row: row, i: i, item: it }; }
    }
  }
  return best;
};

PD.ui.focus.preserve = function (state, view, computed) {
  var sel = computed.selected;

  // Try anchor restore first; otherwise relocate to any selectable when selection is missing.
  var a = view.ux.selAnchor;
  var pick = null;
  if (a && (a.uid || !sel)) {
    // If the currently-selected item still matches the anchor, keep it.
    if (sel && a.uid && sel.uid === a.uid) {
      // If anchor had a loc, require zone match too.
      if (!a.loc || (sel.loc && sel.loc.zone === a.loc.zone)) {
        return false;
      }
    }

    if (a.uid) pick = PD.ui.focus._findItemByUidLoc(computed, a.uid, a.loc);
    if (!pick) pick = PD.ui.focus._nearestByGeometry(view, computed, a);
  }

  // If we have no anchor-based pick and selection is missing, pick any valid item.
  if (!pick && !sel) {
    pick = PD.ui.findBestCursorTarget(computed.models, [4, 3, 2, 1, 0], function () { return true; });
  }

  if (pick) {
    // Avoid churn if already there.
    if (view.cursor && view.cursor.row === pick.row && view.cursor.i === pick.i) return false;
    PD.ui.cursorMoveTo(view, pick);
    view.ux.lastFocusRuleId = "preserve";
    return true;
  }

  return false;
};

PD.ui.focus._pickCenterBtn = function (computed, id) {
  return PD.ui.findBestCursorTarget(computed.models, [2], function (it) {
    return it && it.kind === "btn" && it.id === id && !it.disabled;
  });
};

PD.ui.focus._pickPayDebtDefault = function (computed) {
  var rmHand = computed.models[PD.render.ROW_P_HAND];
  var rmTable = computed.models[PD.render.ROW_P_TABLE];

  // Prefer bank if any cards exist.
  if (rmHand && rmHand.items) {
    var i;
    for (i = rmHand.items.length - 1; i >= 0; i--) {
      var it = rmHand.items[i];
      if (it && it.loc && it.loc.p === 0 && it.loc.zone === "bank") return { row: PD.render.ROW_P_HAND, i: i, item: it };
    }
  }

  // Then houses (house-pay-first friendly).
  if (rmTable && rmTable.items) {
    var j;
    for (j = 0; j < rmTable.items.length; j++) {
      var itH = rmTable.items[j];
      if (itH && itH.loc && itH.loc.p === 0 && itH.loc.zone === "setHouse") return { row: PD.render.ROW_P_TABLE, i: j, item: itH };
    }
    for (j = 0; j < rmTable.items.length; j++) {
      var itP = rmTable.items[j];
      if (itP && itP.loc && itP.loc.p === 0 && itP.loc.zone === "setProps") return { row: PD.render.ROW_P_TABLE, i: j, item: itP };
    }
  }

  return null;
};

PD.ui.focus._pickHandCard = function (computed) {
  return PD.ui.findBestCursorTarget(computed.models, [PD.render.ROW_P_HAND], function (it) {
    return it && it.kind === "hand" && it.loc && it.loc.p === 0 && it.loc.zone === "hand";
  });
};

PD.ui.focus.rules = [
  {
    id: "PauseAfterDebug",
    enabled: function () { return true; },
    when: function (ctx) { return !!ctx.view.ux.autoFocusPausedByDebug; },
    pick: function () {
      // No pick; this rule acts as a gate in apply().
      return null;
    }
  },
  {
    id: "OnGameOverEntered_Reset",
    enabled: function (ctx) { return !!(PD.config && PD.config.debug && PD.config.debug.enabled); },
    when: function (ctx) { return (ctx.view.ux.lastWinnerP === PD.NO_WINNER && ctx.state.winnerP !== PD.NO_WINNER); },
    pick: function (ctx) {
      return PD.ui.focus._pickCenterBtn(ctx.computed, "reset");
    }
  },
  {
    id: "OnInvalidActionGameOver_Reset",
    enabled: function (ctx) { return !!(PD.config && PD.config.debug && PD.config.debug.enabled); },
    when: function (ctx) {
      if (ctx.state.winnerP === PD.NO_WINNER) return false;
      if (ctx.view.mode !== "browse" || ctx.view.inspectActive) return false;
      return (ctx.view.ux.pendingFocusErrorCode === "game_over");
    },
    pick: function (ctx) {
      ctx.view.ux.pendingFocusErrorCode = "";
      return PD.ui.focus._pickCenterBtn(ctx.computed, "reset");
    }
  },
  {
    id: "OnPlaysExhausted_End",
    enabled: function () { return true; },
    when: function (ctx) {
      if (ctx.state.winnerP !== PD.NO_WINNER) return false;
      if (ctx.state.activeP !== 0) return false;
      if (ctx.view.mode !== "browse" || ctx.view.inspectActive) return false;
      return (ctx.view.ux.lastActiveP === 0 && ctx.view.ux.lastPlaysLeft > 0 && ctx.state.playsLeft <= 0);
    },
    pick: function (ctx) {
      return PD.ui.focus._pickCenterBtn(ctx.computed, "endTurn");
    }
  },
  {
    id: "OnHandBecameEmpty_End",
    enabled: function () { return true; },
    when: function (ctx) {
      if (ctx.state.winnerP !== PD.NO_WINNER) return false;
      if (ctx.state.activeP !== 0) return false;
      if (ctx.view.mode !== "browse" || ctx.view.inspectActive) return false;
      if (ctx.state.prompt) return false;
      if (ctx.view.ux.autoFocusPausedByDebug) return false;
      return (ctx.view.ux.lastHandLenP0 > 0 && ctx.state.players[0].hand.length === 0);
    },
    pick: function (ctx) {
      return PD.ui.focus._pickCenterBtn(ctx.computed, "endTurn");
    }
  },
  {
    id: "OnPlayerTurnStart_FocusHandOrEnd",
    enabled: function () { return true; },
    when: function (ctx) {
      if (ctx.state.winnerP !== PD.NO_WINNER) return false;
      if (ctx.state.activeP !== 0) return false;
      if (ctx.view.mode !== "browse" || ctx.view.inspectActive) return false;
      if (ctx.state.prompt && ctx.state.prompt.p === 0) return false;
      if (ctx.view.ux.autoFocusPausedByDebug) return false;
      // Turn-start transition into P0.
      return (ctx.view.ux.lastActiveP !== 0);
    },
    pick: function (ctx) {
      if (ctx.state.players[0].hand.length > 0) return PD.ui.focus._pickHandCard(ctx.computed);
      if (ctx.state.playsLeft > 0) return PD.ui.focus._pickCenterBtn(ctx.computed, "endTurn");
      return null;
    }
  },
  {
    id: "OnInvalidActionWhileHandEmpty_End",
    enabled: function () { return true; },
    when: function (ctx) {
      if (ctx.state.winnerP !== PD.NO_WINNER) return false;
      if (ctx.state.activeP !== 0) return false;
      if (ctx.view.mode !== "browse" || ctx.view.inspectActive) return false;
      if (ctx.state.prompt) return false;
      if (ctx.view.ux.autoFocusPausedByDebug) return false;
      if (!ctx.view.ux.pendingFocusErrorCode) return false;
      return (ctx.state.players[0].hand.length === 0 && ctx.state.playsLeft > 0);
    },
    pick: function (ctx) {
      ctx.view.ux.pendingFocusErrorCode = "";
      return PD.ui.focus._pickCenterBtn(ctx.computed, "endTurn");
    }
  },
  {
    id: "OnEnterPlaceReceivedPrompt",
    enabled: function () { return true; },
    when: function (ctx) {
      var pr = ctx.state.prompt;
      var cur = !!(pr && pr.kind === "placeReceived" && pr.p === 0);
      return cur && (!ctx.view.ux.lastPromptForP0 || ctx.view.ux.lastPromptKind !== "placeReceived");
    },
    pick: function (ctx) {
      // First recvProps card in hand row.
      return PD.ui.findBestCursorTarget(ctx.computed.models, [PD.render.ROW_P_HAND], function (it) {
        return it && it.kind === "hand" && it.loc && it.loc.zone === "recvProps" && it.loc.p === 0;
      });
    }
  },
  {
    id: "OnExitPlaceReceivedPrompt_End",
    enabled: function () { return true; },
    when: function (ctx) {
      if (ctx.state.winnerP !== PD.NO_WINNER) return false;
      var pr = ctx.state.prompt;
      var cur = !!(pr && pr.kind === "placeReceived" && pr.p === 0);
      var exited = (ctx.view.ux.lastPromptForP0 && ctx.view.ux.lastPromptKind === "placeReceived" && !cur);
      if (!exited) return false;
      if (ctx.state.activeP !== 0) return false;
      // Common case: last play was Rent and playsLeft is now 0.
      return (ctx.state.playsLeft <= 0);
    },
    pick: function (ctx) {
      return PD.ui.focus._pickCenterBtn(ctx.computed, "endTurn");
    }
  },
  {
    id: "OnEnterPayDebtPrompt_DefaultFocus",
    enabled: function () { return true; },
    when: function (ctx) {
      var pr = ctx.state.prompt;
      var cur = !!(pr && pr.kind === "payDebt" && pr.p === 0);
      return cur && (!ctx.view.ux.lastPromptForP0 || ctx.view.ux.lastPromptKind !== "payDebt");
    },
    pick: function (ctx) {
      return PD.ui.focus._pickPayDebtDefault(ctx.computed);
    }
  },
  {
    id: "OnInvalidActionPayDebt_DefaultFocus",
    enabled: function () { return true; },
    when: function (ctx) {
      var pr = ctx.state.prompt;
      if (!(pr && pr.kind === "payDebt" && pr.p === 0)) return false;
      return (ctx.view.ux.pendingFocusErrorCode === "cant_pay");
    },
    pick: function (ctx) {
      var pick = PD.ui.focus._pickPayDebtDefault(ctx.computed);
      if (pick) ctx.view.ux.pendingFocusErrorCode = "";
      return pick;
    }
  }
];

PD.ui.focus.apply = function (state, view, computed, actions) {
  var nav = actions.nav;
  var a = actions.a;
  var hasNav = !!(nav && (nav.up || nav.down || nav.left || nav.right));
  var hasA = !!(a && (a.tap || a.grabStart));

  // Debug-pause latch: suppress all snapping until the player provides a non-debug input.
  if (view.ux.autoFocusPausedByDebug) {
    if (hasNav) { view.ux.autoFocusPausedByDebug = false; return false; }
    if (hasA) {
      var sel = computed.selected;
      var isDebugBtn = !!(sel && sel.kind === "btn" && sel.row === PD.render.ROW_CENTER &&
        (sel.id === "step" || sel.id === "reset" || sel.id === "nextScenario"));
      if (!isDebugBtn) view.ux.autoFocusPausedByDebug = false;
      return false;
    }

    // While latched, allow preservation only when selection disappears.
    if (!computed.selected) return PD.ui.focus.preserve(state, view, computed);
    return false;
  }

  // Never move the cursor out from under the player during the same tick that they
  // are navigating or confirming; preservation/autofocus is for state churn between ticks.
  if (hasNav || hasA) return false;

  // Always preserve selection stability first.
  var changed = false;
  if (PD.ui.focus.preserve(state, view, computed)) changed = true;

  var ctx = { state: state, view: view, computed: computed, actions: actions };

  var ri;
  for (ri = 0; ri < PD.ui.focus.rules.length; ri++) {
    var r = PD.ui.focus.rules[ri];
    if (!r.enabled(ctx)) continue;
    if (!r.when(ctx)) continue;
    var pick = r.pick(ctx);
    if (pick && pick.row != null && pick.i != null) {
      PD.ui.cursorMoveTo(view, pick);
      view.ux.lastFocusRuleId = r.id;
      return true;
    }
  }

  return changed;
};

