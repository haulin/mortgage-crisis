// Cmd profiles: data-driven behavior by targeting kind, expressed in terms of cmd lists + UI hooks.
// This registry centralizes Source-cancel policy + overlay text + cursor/sort behavior.

PD.cmd.getProfile = function (kind) {
  kind = String(kind || "");
  return PD.cmdProfiles[kind] || null;
};

// Menu-capable cmd kinds (card menu items, ordered).
PD.cmd.menuKinds = ["place", "build", "rent", "sly", "bank"];

PD.cmd.titleForCmdKind = function (cmd) {
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

PD.cmd.destLineForCmd = function (state, targeting, cmd) {
  var t = targeting || null;
  if (!cmd || !cmd.kind) return "(no destination)";
  var k = String(cmd.kind);

  if (k === "playProp" || k === "moveWild") return PD.cmd.destLinePlaceLike(state, t, cmd);

  if (k === "playHouse") {
    var dH = PD.moves.destForCmd(cmd);
    if (!dH || dH.kind !== "setEnd") return "(no destination)";
    var setH = state.players[dH.p].sets[dH.setI];
    var colH = setH ? PD.rules.getSetColor(setH.props) : PD.state.NO_COLOR;
    return "Dest: " + PD.fmt.colorName(colH) + " set";
  }

  if (k === "playRent") {
    var p = cmd.card.loc.p;
    var setR = state.players[p].sets[cmd.setI];
    var colR = setR ? PD.rules.getSetColor(setR.props) : PD.state.NO_COLOR;
    var amt = PD.rules.rentAmountForSet(state, p, cmd.setI);
    return "From: " + PD.fmt.colorName(colR) + " set\nAmt: $" + amt;
  }

  if (k === "playSlyDeal") {
    var tl = (cmd.target && cmd.target.loc) ? cmd.target.loc : null;
    var colT = PD.state.NO_COLOR;
    if (tl && tl.zone === "setProps") {
      var setT = state.players[tl.p].sets[tl.setI];
      if (setT && setT.props) {
        var propT = setT.props[tl.i];
        if (propT) colT = propT[1];
      }
    }
    return "Target: " + PD.fmt.colorName(colT);
  }

  if (k === "bank") return "Dest: Bank";
  if (k === "source") return "Dest: Source";
  return "(no destination)";
};

PD.cmd.destLinePlaceLike = function (state, targeting, cmd) {
  var t = targeting || null;
  if (!cmd || !cmd.kind) return "(no destination)";
  if (cmd.kind === "source") return "Dest: Source";

  var d = PD.moves.destForCmd(cmd);
  var out = "";
  if (d) {
    if (d.kind === "newSet") out = "Dest: New set";
    else if (d.kind === "setEnd") {
      var set = state.players[d.p].sets[d.setI];
      var col = set ? PD.rules.getSetColor(set.props) : PD.state.NO_COLOR;
      out = "Dest: " + PD.fmt.colorName(col) + " set";
    }
  }

  if (t && t.card && t.card.def && PD.rules.isWildDef(t.card.def)) out += "\nAs: " + PD.fmt.colorName(t.wildColor);
  return out || "(no destination)";
};

PD.cmdProfiles.place = {
  id: "place",
  title: "Place",
  helpLR: "L/R: Dest",
  includeSource: function (loc) {
    return PD.moves.locAllowsSource(loc);
  },
  defaultWildColor: function (state, uid, def) {
    return PD.moves.defaultWildColorForPlace(state, uid, def);
  },
  cmdsForWildColor: function (state, uid, def, wildColor) {
    return PD.moves.placeCmdsForUid(state, uid, def, wildColor);
  },
  destLine: PD.cmd.destLinePlaceLike
};

PD.cmdProfiles.moveWild = {
  id: "moveWild",
  title: "Place",
  helpLR: "L/R: Dest",
  includeSource: function () {
    // Replace-window moveWild originates from setProps; still allow Source-cancel for consistency.
    return true;
  },
  defaultWildColor: function (state, uid, def, loc) {
    return PD.moves.defaultWildColorForMoveWild(state, uid, def, loc);
  },
  cmdsForWildColor: function (state, uid, def, wildColor) {
    return PD.moves.moveWildCmdsForUid(state, uid, def, wildColor);
  },
  sortRank: function (cmd) {
    if (cmd && cmd.kind === "source") return 2;
    if (cmd && cmd.dest && cmd.dest.newSet) return 1;
    return 0;
  },
  destLine: PD.cmd.destLinePlaceLike,
  ui: {
    mode: "preview",
    screenXForCmd: function (ctx, cmdW) {
      if (!cmdW || !cmdW.kind || cmdW.kind !== "moveWild") return 999999;
      if (cmdW.dest && cmdW.dest.newSet) return 999999;
      var setI = (cmdW.dest && cmdW.dest.setI != null) ? cmdW.dest.setI : null;
      if (setI == null) return 999999;
      var rmT = ctx.computed.models[PD.render.ROW_P_TABLE];
      var st = rmT.stacks["set:p0:set" + setI];
      if (!st) return 999999;
      var x = st.x0 + st.nReal * st.stride * st.fanDir;
      var cam = ctx.view.camX[PD.render.ROW_P_TABLE];
      return x - cam;
    },
    sortRank: function (cmd) {
      return PD.cmdProfiles.moveWild.sortRank(cmd);
    }
  }
};

PD.cmdProfiles.bank = {
  id: "bank",
  title: "Bank",
  helpLR: "L/R: Dest",
  includeSource: function (loc) { return PD.moves.locAllowsSource(loc); },
  cmdsForUid: function (state, uid) { return PD.moves.bankCmdsForUid(state, uid); },
  destLine: PD.cmd.destLineForCmd
};

PD.cmdProfiles.build = {
  id: "build",
  title: "Build",
  helpLR: "L/R: Dest",
  includeSource: function (loc) { return PD.moves.locAllowsSource(loc); },
  cmdsForUid: function (state, uid) { return PD.moves.buildCmdsForUid(state, uid); },
  destLine: PD.cmd.destLineForCmd
};

PD.cmdProfiles.rent = {
  id: "rent",
  title: "Rent",
  helpLR: "L/R: Set",
  includeSource: function (loc) { return PD.moves.locAllowsSource(loc); },
  cmdsForUid: function (state, uid, loc) {
    var cmds = PD.moves.rentMovesForUid(state, uid);
    PD.moves.sortRentMovesByAmount(state, loc ? loc.p : 0, cmds);
    return cmds;
  },
  destLine: PD.cmd.destLineForCmd
};

PD.cmdProfiles.sly = {
  id: "sly",
  title: "Sly Deal",
  helpLR: "L/R: Target",
  includeSource: function (loc) { return PD.moves.locAllowsSource(loc); },
  cmdsForUid: function (state, uid) { return PD.moves.slyDealMovesForUid(state, uid); },
  destLine: PD.cmd.destLineForCmd,
  ui: {
    mode: "cursor",
    findItemForCmd: function (ctx, cmdSly) {
      if (!cmdSly || !cmdSly.kind) return null;
      var t = ctx.view.targeting;
      if (cmdSly.kind === "source") {
        if (!t || !t.card || !t.card.loc) return null;
        return PD.ui.findBestCursorTarget(ctx.computed.models, [PD.render.ROW_P_HAND], function (it) {
          return PD.ui.itemMatchesUidLoc(it, t.card.uid, t.card.loc);
        });
      }
      if (cmdSly.kind === "playSlyDeal" && cmdSly.target && cmdSly.target.loc) {
        var loc = cmdSly.target.loc;
        var uid = cmdSly.target.uid;
        return PD.ui.findBestCursorTarget(ctx.computed.models, [PD.render.ROW_OP_TABLE], function (it) {
          return PD.ui.itemMatchesUidLoc(it, uid, loc);
        });
      }
      return null;
    },
    screenXForCmd: function (ctx, cmdSly) {
      var pick = PD.cmdProfiles.sly.ui.findItemForCmd(ctx, cmdSly);
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

PD.cmdProfiles.quick = {
  id: "quick",
  title: function (targeting, cmdSel) {
    if (!cmdSel || !cmdSel.kind) return "Action";
    return PD.cmd.titleForCmdKind(cmdSel);
  },
  helpLR: "L/R: Option",
  includeSource: function (loc) { return PD.moves.locAllowsSource(loc); },
  cmdsForUid: function (state, uid, loc) {
    var rentCmds = PD.moves.rentMovesForUid(state, uid);
    PD.moves.sortRentMovesByAmount(state, loc ? loc.p : 0, rentCmds);
    var buildCmds = PD.moves.buildCmdsForUid(state, uid);
    var bankCmds = PD.moves.bankCmdsForUid(state, uid);
    return rentCmds.concat(buildCmds).concat(bankCmds);
  },
  destLine: PD.cmd.destLineForCmd
};

