PD.fmt.colorName = function (c) {
  if (c === PD.Color.Cyan) return "Cyan";
  if (c === PD.Color.Magenta) return "Magenta";
  if (c === PD.Color.Orange) return "Orange";
  if (c === PD.Color.Black) return "Black";
  return "c" + String(c);
};

PD.fmt.valueForDef = function (def) {
  if (!def) return null;
  if (def.kind === PD.CardKind.Property) {
    if (def.propertyPayValue != null) return def.propertyPayValue;
    return 0;
  }
  if (def.bankValue != null) return def.bankValue;
  return null;
};

PD.fmt.errorMessage = function (code) {
  code = String(code || "");
  if (code === "no_plays_left") return "No plays left";
  if (code === "hand_over_limit") return "Hand over limit";
  if (code === "not_bankable") return "Not bankable";
  if (code === "set_not_complete") return "Set not complete";
  if (code === "set_color_mismatch") return "Wrong set color";
  if (code === "wild_color_illegal") return "Wild color illegal";
  if (code === "no_targets") return "No valid destination";
  if (code === "house_pay_first") return "House must be paid first";
  return code || "error";
};

PD.fmt.appendRuleNotes = function (def, baseDesc) {
  baseDesc = baseDesc ? String(baseDesc) : "";
  if (!def || !def.ruleNotes || def.ruleNotes.length === 0) return baseDesc;
  var enabled = PD.config.rules.enabledRuleNotes;
  if (enabled.length === 0) return baseDesc;

  var out = baseDesc;
  var i;
  for (i = 0; i < def.ruleNotes.length; i++) {
    var id = def.ruleNotes[i];
    var j;
    var on = false;
    for (j = 0; j < enabled.length; j++) if (enabled[j] === id) { on = true; break; }
    if (!on) continue;
    var txt = PD.ruleNoteTextById[id] ? String(PD.ruleNoteTextById[id]) : "";
    if (!txt) continue;
    if (out) out += "\n";
    out += txt;
  }
  return out;
};

PD.fmt.inspectTitleForDef = function (def) {
  if (!def) return "";
  return def.name ? String(def.name) : (def.id ? String(def.id) : "");
};

PD.fmt.inspectDescForDef = function (def, selColor) {
  if (!def) return "";
  var base = def.desc ? String(def.desc) : "";
  base = PD.fmt.appendRuleNotes(def, base);
  var v = PD.fmt.valueForDef(def);
  var vLine = (v != null && v > 0) ? ("Value: $" + String(v)) : "";
  var usedAs = "";
  if (PD.isWildDef(def)) {
    var cSel = selColor;
    if (cSel !== PD.NO_COLOR && def.wildColors && (cSel === def.wildColors[0] || cSel === def.wildColors[1])) {
      usedAs = "Currently used as: " + PD.fmt.colorName(cSel);
    }
  }

  var out = "";
  if (vLine) out = vLine;
  if (usedAs) out = out ? (out + "\n" + usedAs) : usedAs;
  if (base) out = out ? (out + "\n" + base) : base;
  return out;
};

PD.fmt.destLabelForCmd = function (state, cmd) {
  var d = PD.moves.destForCmd(cmd);
  if (!d) return "";
  if (d.kind === "newSet") return "New Set";
  if (d.kind === "setEnd") return PD.fmt.setLabelForSetI(state, d.p, d.setI);
  return "";
};

PD.fmt.setLabelForSetI = function (state, p, setI) {
  var set = state.players[p].sets[setI];
  var col = set ? PD.getSetColor(set.props) : PD.NO_COLOR;
  return PD.fmt.colorName(col) + " Set";
};

PD.fmt.menuLabelForCmds = function (baseLabel, state, cmds) {
  baseLabel = String(baseLabel || "");
  if (!baseLabel) baseLabel = "Action";
  if (!cmds || cmds.length !== 1) return baseLabel;
  var dl = PD.fmt.destLabelForCmd(state, cmds[0]);
  return dl ? (baseLabel + " -> " + dl) : baseLabel;
};

PD.fmt.menuLabelForRentMoves = function (state, rentMoves) {
  if (!rentMoves || rentMoves.length === 0) return "";
  if (rentMoves.length !== 1) return "Rent";
  var onlyR = rentMoves[0];
  var sl = PD.fmt.setLabelForSetI(state, 0, onlyR.setI);
  return sl ? ("Rent -> " + sl) : "Rent";
};

PD.fmt.targetingTitle = function (targeting, cmd) {
  var tKind = targeting && targeting.kind ? String(targeting.kind) : "";

  function titleForCmd(cmd0) {
    if (!cmd0 || !cmd0.kind) return (tKind === "quick") ? "Action" : "Target";
    if (cmd0.kind === "playRent") return "Rent";
    if (cmd0.kind === "playHouse") return "Build";
    if (cmd0.kind === "bank") return "Bank";
    if (cmd0.kind === "playProp") return "Place";
    if (cmd0.kind === "source") return "Source";
    return "Target";
  }

  if (tKind === "build") return "Build";
  if (tKind === "place") return "Place";
  if (tKind === "rent") return "Rent";
  if (tKind === "quick") return titleForCmd(cmd);
  return "Bank";
};

PD.fmt.targetingDestLine = function (state, targeting, cmd) {
  var t = targeting || null;
  var k = String(cmd.kind);

  if (k === "playProp") {
    var out = "";
    if (cmd.dest && cmd.dest.newSet) out = "Dest: New set";
    else if (cmd.dest && cmd.dest.setI != null) {
      var set = state.players[cmd.dest.p].sets[cmd.dest.setI];
      var col = set ? PD.getSetColor(set.props) : PD.NO_COLOR;
      out = "Dest: " + PD.fmt.colorName(col) + " set";
    }
    if (t && t.card && t.card.def && PD.isWildDef(t.card.def)) out += "\nAs: " + PD.fmt.colorName(t.wildColor);
    return out || "(no destination)";
  }

  if (k === "playHouse") {
    var set2 = state.players[cmd.dest.p].sets[cmd.dest.setI];
    var col2 = set2 ? PD.getSetColor(set2.props) : PD.NO_COLOR;
    return "Dest: " + PD.fmt.colorName(col2) + " set";
  }

  if (k === "playRent") {
    var p = cmd.card.loc.p;
    var setR = state.players[p].sets[cmd.setI];
    var colR = setR ? PD.getSetColor(setR.props) : PD.NO_COLOR;
    var amt = PD.rentAmountForSet(state, p, cmd.setI);
    return "From: " + PD.fmt.colorName(colR) + " set\nAmt: $" + amt;
  }

  if (k === "bank") return "Dest: Bank";
  if (k === "source") return "Dest: Source";
  return "(no destination)";
};

PD.fmt.targetingHelp = function (targeting) {
  var t = targeting || null;
  var kind = t && t.kind ? String(t.kind) : "";
  var help = (kind === "quick") ? "L/R: Option" : ((kind === "rent") ? "L/R: Set" : "L/R: Dest");
  if (t && t.card && t.card.def && PD.isWildDef(t.card.def)) help += "  U/D: Color";
  help += (t && t.hold) ? "\nRelease A: Drop  B:Cancel" : "\nA:Confirm  B:Cancel";
  return help;
};

