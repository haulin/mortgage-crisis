// Shared move helpers (rules + UI). Pure-ish: reads state and move lists, no view mutations.

// Helpers for Place command lists (shared by targeting + menu label tweaks).
PD.moves.defaultWildColorForPlace = function (state, uid, def) {
  if (!def || !PD.isWildDef(def)) return PD.NO_COLOR;
  var moves = PD.legalMoves(state);
  var c0 = def.wildColors[0];
  var c1 = def.wildColors[1];
  var has0 = false, has1 = false;
  var i;
  for (i = 0; i < moves.length; i++) {
    var mp = moves[i];
    if (!mp || mp.kind !== "playProp") continue;
    if (!mp.card || mp.card.uid !== uid) continue;
    if (mp.color === c0 && mp.dest && mp.dest.setI != null) has0 = true;
    if (mp.color === c1 && mp.dest && mp.dest.setI != null) has1 = true;
  }
  return has0 ? c0 : (has1 ? c1 : c0);
};

PD.moves.placeCmdsForUid = function (state, uid, def, wildColor) {
  var moves = PD.legalMoves(state);
  var cmds = [];
  var i;
  var isWild = !!(def && PD.isWildDef(def));
  for (i = 0; i < moves.length; i++) {
    var mf = moves[i];
    if (!mf || mf.kind !== "playProp") continue;
    if (!mf.card || mf.card.uid !== uid) continue;
    if (isWild && mf.color !== wildColor) continue;
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

PD.moves.buildCmdsForUid = function (state, uid) {
  var moves = PD.legalMoves(state);
  var buildMoves = [];
  var i;
  for (i = 0; i < moves.length; i++) {
    var mv = moves[i];
    if (mv && mv.kind === "playHouse" && mv.card && mv.card.uid === uid) buildMoves.push(mv);
  }
  return buildMoves;
};

PD.moves.rentMovesForUid = function (state, uid) {
  var moves = PD.legalMoves(state);
  var rentMoves = [];
  var i;
  for (i = 0; i < moves.length; i++) {
    var mv = moves[i];
    if (mv && mv.kind === "playRent" && mv.card && mv.card.uid === uid) rentMoves.push(mv);
  }
  return rentMoves;
};

PD.moves.sortRentMovesByAmount = function (state, p, rentMoves) {
  if (!rentMoves || rentMoves.length <= 1) return rentMoves;
  rentMoves.sort(function (a, b) {
    var ai = (a && a.setI != null) ? a.setI : -1;
    var bi = (b && b.setI != null) ? b.setI : -1;
    var aa = PD.rentAmountForSet(state, p, ai);
    var bb = PD.rentAmountForSet(state, p, bi);
    var d = bb - aa;
    if (d) return d;
    return ai - bi;
  });
  return rentMoves;
};

PD.moves.locAllowsSource = function (loc) {
  if (!loc || !loc.zone) return false;
  var z = String(loc.zone);
  return (z === "hand") || (z === "recvProps");
};

// Build the list of cmds for a targeting mode.
// Returns { cmds, wildColor } or null (unknown kind).
PD.moves.cmdsForTargeting = function (state, kind, uid, loc) {
  kind = String(kind || "");
  var allowSource = PD.moves.locAllowsSource(loc);
  var out = { cmds: [], wildColor: PD.NO_COLOR };

  if (kind === "bank") {
    out.cmds = PD.moves.bankCmdsForUid(state, uid);
    if (allowSource) out.cmds.push({ kind: "source" });
    return out;
  }

  if (kind === "rent") {
    out.cmds = PD.moves.rentMovesForUid(state, uid);
    PD.moves.sortRentMovesByAmount(state, loc ? loc.p : 0, out.cmds);
    if (allowSource) out.cmds.push({ kind: "source" });
    return out;
  }

  if (kind === "quick") {
    var rentCmds = PD.moves.rentMovesForUid(state, uid);
    PD.moves.sortRentMovesByAmount(state, loc ? loc.p : 0, rentCmds);
    var buildCmds = PD.moves.buildCmdsForUid(state, uid);
    var bankCmds = PD.moves.bankCmdsForUid(state, uid);
    out.cmds = rentCmds.concat(buildCmds).concat(bankCmds);
    if (allowSource) out.cmds.push({ kind: "source" });
    return out;
  }

  if (kind === "build") {
    out.cmds = PD.moves.buildCmdsForUid(state, uid);
    if (allowSource) out.cmds.push({ kind: "source" });
    return out;
  }

  if (kind === "place") {
    var def = PD.defByUid(state, uid);
    if (def && PD.isWildDef(def)) {
      out.wildColor = PD.moves.defaultWildColorForPlace(state, uid, def);
      out.cmds = PD.moves.placeCmdsForUid(state, uid, def, out.wildColor);
    } else {
      out.wildColor = PD.NO_COLOR;
      out.cmds = PD.moves.placeCmdsForUid(state, uid, def, PD.NO_COLOR);
    }
    if (allowSource) out.cmds.push({ kind: "source" });
    return out;
  }

  return null;
};

// Command semantics: interpret a cmd's destination in board-space terms.
// Returns one of:
// - {kind:"newSet", p}
// - {kind:"setEnd", p, setI}
// - {kind:"setTop", p, setI}
// - {kind:"bankEnd", p}
// - {kind:"source"}
// - null
PD.moves.destForCmd = function (cmd) {
  if (!cmd || !cmd.kind) return null;
  if (cmd.kind === "playProp") {
    if (cmd.dest && cmd.dest.newSet) return { kind: "newSet", p: cmd.dest.p };
    if (cmd.dest && cmd.dest.setI != null) return { kind: "setEnd", p: cmd.dest.p, setI: cmd.dest.setI };
    return null;
  }
  if (cmd.kind === "playHouse") {
    if (cmd.dest && cmd.dest.setI != null) return { kind: "setEnd", p: cmd.dest.p, setI: cmd.dest.setI };
    return null;
  }
  if (cmd.kind === "bank") return { kind: "bankEnd", p: cmd.card && cmd.card.loc ? cmd.card.loc.p : 0 };
  if (cmd.kind === "playRent") return { kind: "setTop", p: cmd.card && cmd.card.loc ? cmd.card.loc.p : 0, setI: cmd.setI };
  if (cmd.kind === "source") return { kind: "source" };
  return null;
};

PD.moves.bankCmdsForUid = function (state, uid) {
  var moves = PD.legalMoves(state);
  var cmds = [];
  var i;
  for (i = 0; i < moves.length; i++) {
    var mv = moves[i];
    if (!mv || mv.kind !== "bank") continue;
    if (!mv.card || mv.card.uid !== uid) continue;
    cmds.push(mv);
  }
  return cmds;
};

