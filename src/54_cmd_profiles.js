// Cmd profiles: data-driven behavior by targeting kind, expressed in terms of cmd lists + UI hooks.
// This registry centralizes Source-cancel policy + overlay text + cursor/sort behavior.

MC.cmd.getProfile = function (kind) {
  kind = String(kind || "");
  return MC.cmdProfiles[kind] || null;
};

// Menu-capable cmd kinds (card menu items, ordered).
MC.cmd.menuKinds = ["place", "build", "rent", "sly", "bank"];

// Hold-A (grab) targeting: choose an ordered list of targeting kinds for a card.
// The chain builder filters out segments with no real (non-Source) cmds, so it's safe to
// include candidate kinds that may be illegal in the current state.
MC.cmd.holdChainKindsForDef = function (def) {
  if (!def || def.kind == null) return null;

  if (def.kind === MC.CardKind.Property) return ["place"];
  if (def.kind === MC.CardKind.Money) return ["bank"];
  if (def.kind === MC.CardKind.House) return ["build", "bank"];

  if (def.kind === MC.CardKind.Action) {
    if (def.actionKind === MC.ActionKind.SlyDeal) return ["sly", "bank"];
    if (def.actionKind === MC.ActionKind.Rent) return ["rent", "bank"];
    // Default for action cards that don't have a targeting mode (e.g. JSN): bank only.
    return ["bank"];
  }

  return null;
};

MC.cmd.titleForCmdKind = function (cmd) {
  if (!cmd || !cmd.kind) return "Target";
  var k = String(cmd.kind);
  if (k === "playRent") return "Rent";
  if (k === "playHouse") return "Build";
  if (k === "bank") return "Bank";
  if (k === "playProp") return "Place";
  if (k === "moveWild") return "Place";
  if (k === "playSlyDeal") return "Sly Deal";
  if (k === "source") return "Source";
  return "Target";
};

MC.cmd.destLineForCmd = function (state, targeting, cmd) {
  var t = targeting || null;
  if (!cmd || !cmd.kind) return "(no destination)";
  var k = String(cmd.kind);

  if (k === "playProp" || k === "moveWild") return MC.cmd.destLinePlaceLike(state, t, cmd);

  if (k === "playHouse") {
    var dH = MC.moves.destForCmd(cmd);
    if (!dH || dH.kind !== "setEnd") return "(no destination)";
    var setH = state.players[dH.p].sets[dH.setI];
    var colH = setH ? MC.rules.getSetColor(setH.props) : MC.state.NO_COLOR;
    return "Dest: " + MC.fmt.colorName(colH) + " set";
  }

  if (k === "playRent") {
    var p = cmd.card.loc.p;
    var setR = state.players[p].sets[cmd.setI];
    var colR = setR ? MC.rules.getSetColor(setR.props) : MC.state.NO_COLOR;
    var amt = MC.rules.rentAmountForSet(state, p, cmd.setI);
    return "From: " + MC.fmt.colorName(colR) + " set\nAmt: $" + amt;
  }

  if (k === "playSlyDeal") {
    var tl = (cmd.target && cmd.target.loc) ? cmd.target.loc : null;
    var colT = MC.state.NO_COLOR;
    if (tl && tl.zone === "setProps") {
      var setT = state.players[tl.p].sets[tl.setI];
      if (setT && setT.props) {
        var propT = setT.props[tl.i];
        if (propT) colT = propT[1];
      }
    }
    return "Target: " + MC.fmt.colorName(colT);
  }

  if (k === "bank") return "Dest: Bank";
  if (k === "source") return "Dest: Source";
  return "(no destination)";
};

MC.cmd.destLinePlaceLike = function (state, targeting, cmd) {
  var t = targeting || null;
  if (!cmd || !cmd.kind) return "(no destination)";
  if (cmd.kind === "source") return "Dest: Source";

  var d = MC.moves.destForCmd(cmd);
  var out = "";
  if (d) {
    if (d.kind === "newSet") out = "Dest: New set";
    else if (d.kind === "setEnd") {
      var set = state.players[d.p].sets[d.setI];
      var col = set ? MC.rules.getSetColor(set.props) : MC.state.NO_COLOR;
      out = "Dest: " + MC.fmt.colorName(col) + " set";
    }
  }

  if (t && t.card && t.card.def && MC.rules.isWildDef(t.card.def)) out += "\nAs: " + MC.fmt.colorName(t.wildColor);
  return out || "(no destination)";
};

MC.cmd.previewForCmd = function (state, cmd, card) {
  if (!cmd || !cmd.kind) return null;
  var k = String(cmd.kind);

  var uid = (card && card.uid) ? card.uid : 0;
  var def = (card && card.def) ? card.def : null;
  var wildColor = (card && card.wildColor != null) ? card.wildColor : MC.state.NO_COLOR;

  // Default: preview the source card itself.
  var out = { uid: uid, color: null, focusSrcGhost: false, forCmdKind: k };

  // Special-case: rent previews the top card of the selected set (not the rent action card).
  if (k === "playRent") {
    var pR = cmd.card.loc.p;
    var setR = state.players[pR].sets[cmd.setI];
    var topUid = setR && setR.houseUid ? setR.houseUid : ((setR.props && setR.props.length) ? setR.props[setR.props.length - 1][0] : 0);
    var topColor = null;
    if (setR && !setR.houseUid && setR.props && setR.props.length) topColor = setR.props[setR.props.length - 1][1];
    out.uid = topUid;
    out.color = topColor;
    out.focusSrcGhost = true;
    return out;
  }

  // Wild-color tinting.
  if (def && MC.rules.isWildDef(def)) {
    if (k === "source") out.color = wildColor;
    else if (cmd.color != null) out.color = cmd.color;
    else out.color = wildColor;
  }

  return out;
};

MC.cmd.buildHoldChain = function (state, uid, loc, kinds) {
  var out = { segs: [], wildColor: MC.state.NO_COLOR };
  var chainWildColor = MC.state.NO_COLOR;

  var iK;
  for (iK = 0; iK < kinds.length; iK++) {
    var kind = kinds[iK];
    var r = MC.moves.cmdsForTargeting(state, kind, uid, loc);
    if (chainWildColor === MC.state.NO_COLOR && r.wildColor != null && r.wildColor !== MC.state.NO_COLOR) chainWildColor = r.wildColor;
    var realCmds = MC.moves.cmdsWithoutSource(r.cmds);
    if (!realCmds || realCmds.length === 0) continue;
    out.segs.push({ kind: String(kind), cmds: realCmds, cmdI: 0 });
  }

  // Source/cancel segment (universal).
  if (out.segs.length > 0 && MC.moves.locAllowsSource(loc)) out.segs.push({ kind: "source", cmds: [{ kind: "source" }], cmdI: 0 });

  out.wildColor = chainWildColor;
  return out;
};

MC.cmdProfiles.place = {
  id: "place",
  title: "Place",
  helpLR: "L/R: Dest",
  menuLabel: function (state, cmds) { return MC.fmt.menuLabelForCmds("Place", state, cmds); },
  menuHoverPreview: true,
  includeSource: function (loc) {
    return MC.moves.locAllowsSource(loc);
  },
  defaultWildColor: function (state, uid, def) {
    return MC.moves.defaultWildColorForPlace(state, uid, def);
  },
  cmdsForWildColor: function (state, uid, def, wildColor) {
    return MC.moves.placeCmdsForUid(state, uid, def, wildColor);
  },
  destLine: MC.cmd.destLinePlaceLike,
  ui: { mode: "preview" }
};

MC.cmdProfiles.moveWild = {
  id: "moveWild",
  title: "Place",
  helpLR: "L/R: Dest",
  includeSource: function () {
    // Replace-window moveWild originates from setProps; still allow Source-cancel for consistency.
    return true;
  },
  defaultWildColor: function (state, uid, def, loc) {
    return MC.moves.defaultWildColorForMoveWild(state, uid, def, loc);
  },
  cmdsForWildColor: function (state, uid, def, wildColor) {
    return MC.moves.moveWildCmdsForUid(state, uid, def, wildColor);
  },
  sortRank: function (cmd) {
    if (cmd && cmd.kind === "source") return 2;
    if (cmd && cmd.dest && cmd.dest.newSet) return 1;
    return 0;
  },
  destLine: MC.cmd.destLinePlaceLike,
  ui: {
    mode: "preview",
    screenXForCmd: function (ctx, cmdW) {
      if (!cmdW || !cmdW.kind || cmdW.kind !== "moveWild") return 999999;
      if (cmdW.dest && cmdW.dest.newSet) return 999999;
      var setI = (cmdW.dest && cmdW.dest.setI != null) ? cmdW.dest.setI : null;
      if (setI == null) return 999999;
      var rmT = ctx.computed.models[MC.render.ROW_P_TABLE];
      var st = rmT.stacks["set:p0:set" + setI];
      if (!st) return 999999;
      var x = st.x0 + st.nReal * st.stride * st.fanDir;
      var cam = ctx.view.camX[MC.render.ROW_P_TABLE];
      return x - cam;
    },
    sortRank: function (cmd) {
      return MC.cmdProfiles.moveWild.sortRank(cmd);
    }
  }
};

MC.cmdProfiles.bank = {
  id: "bank",
  title: "Bank",
  helpLR: "L/R: Dest",
  menuLabel: function (state, cmds) { return MC.fmt.menuLabelForCmds("Bank", state, cmds); },
  menuHoverPreview: true,
  includeSource: function (loc) { return MC.moves.locAllowsSource(loc); },
  cmdsForUid: function (state, uid) { return MC.moves.bankCmdsForUid(state, uid); },
  destLine: MC.cmd.destLineForCmd,
  ui: { mode: "preview" }
};

MC.cmdProfiles.build = {
  id: "build",
  title: "Build",
  helpLR: "L/R: Dest",
  menuLabel: function (state, cmds) { return MC.fmt.menuLabelForCmds("Build", state, cmds); },
  menuHoverPreview: true,
  includeSource: function (loc) { return MC.moves.locAllowsSource(loc); },
  cmdsForUid: function (state, uid) { return MC.moves.buildCmdsForUid(state, uid); },
  destLine: MC.cmd.destLineForCmd,
  ui: { mode: "preview" }
};

MC.cmdProfiles.rent = {
  id: "rent",
  title: "Rent",
  helpLR: "L/R: Set",
  menuLabel: function (state, cmds) { return MC.fmt.menuLabelForRentMoves(state, cmds); },
  menuHoverPreview: true,
  includeSource: function (loc) { return MC.moves.locAllowsSource(loc); },
  cmdsForUid: function (state, uid, loc) {
    var cmds = MC.moves.rentMovesForUid(state, uid);
    MC.moves.sortRentMovesByAmount(state, loc ? loc.p : 0, cmds);
    return cmds;
  },
  destLine: MC.cmd.destLineForCmd,
  ui: { mode: "preview" }
};

MC.cmdProfiles.sly = {
  id: "sly",
  title: "Sly Deal",
  helpLR: "L/R: Target",
  menuLabel: function (state, cmds) { return MC.fmt.menuLabelForCmds("Sly Deal", state, cmds); },
  menuHoverPreview: true,
  includeSource: function (loc) { return MC.moves.locAllowsSource(loc); },
  cmdsForUid: function (state, uid, loc) {
    if (!loc || !loc.zone) return [];
    var z = String(loc.zone);
    if (z !== "hand") return [];
    return MC.moves.slyDealMovesForUid(state, uid);
  },
  destLine: MC.cmd.destLineForCmd,
  ui: {
    mode: "cursor",
    findItemForCmd: function (ctx, cmdSly) {
      if (!cmdSly || !cmdSly.kind) return null;
      var t = ctx.view.targeting;
      if (cmdSly.kind === "source") {
        if (!t || !t.card || !t.card.loc) return null;
        return MC.ui.findBestCursorTarget(ctx.computed.models, [MC.render.ROW_P_HAND], function (it) {
          return MC.ui.itemMatchesUidLoc(it, t.card.uid, t.card.loc);
        });
      }
      if (cmdSly.kind === "playSlyDeal" && cmdSly.target && cmdSly.target.loc) {
        var loc = cmdSly.target.loc;
        var uid = cmdSly.target.uid;
        return MC.ui.findBestCursorTarget(ctx.computed.models, [MC.render.ROW_OP_TABLE], function (it) {
          return MC.ui.itemMatchesUidLoc(it, uid, loc);
        });
      }
      return null;
    },
    screenXForCmd: function (ctx, cmdSly) {
      var pick = MC.cmdProfiles.sly.ui.findItemForCmd(ctx, cmdSly);
      if (!pick || !pick.item) return 999999;
      var row = pick.item.row;
      var cam = ctx.view.camX[row];
      return (pick.item.x - cam);
    },
    sortRank: function (cmd) { return (cmd && cmd.kind === "source") ? 1 : 0; },
    tieCmp: function (a, b) {
      var al = (a && a.target && a.target.loc) ? a.target.loc : null;
      var bl = (b && b.target && b.target.loc) ? b.target.loc : null;
      var asi = al && al.setI != null ? al.setI : 9999;
      var bsi = bl && bl.setI != null ? bl.setI : 9999;
      var di = asi - bsi;
      if (di) return di;
      var api = al && al.i != null ? al.i : 9999;
      var bpi = bl && bl.i != null ? bl.i : 9999;
      return api - bpi;
    }
  }
};
