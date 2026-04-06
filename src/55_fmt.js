// MC.fmt: shared text formatting helpers (UI/debug narration).
MC.fmt.colorName = function (c) {
  if (c === MC.Color.Cyan) return "Cyan";
  if (c === MC.Color.Magenta) return "Magenta";
  if (c === MC.Color.Orange) return "Orange";
  if (c === MC.Color.Black) return "Black";
  return "c" + String(c);
};

MC.fmt.valueForDef = function (def) {
  if (!def) return null;
  if (def.kind === MC.CardKind.Property) {
    if (def.propertyPayValue != null) return def.propertyPayValue;
    return 0;
  }
  if (def.bankValue != null) return def.bankValue;
  return null;
};

MC.fmt.errorMessage = function (code) {
  code = String(code || "");
  if (code === "no_plays_left") return "No plays left";
  if (code === "hand_over_limit") return "Hand over limit";
  if (code === "not_bankable") return "Not bankable";
  if (code === "set_not_complete") return "Set not complete";
  if (code === "set_color_mismatch") return "Wrong set color";
  if (code === "wild_color_illegal") return "Wild color illegal";
  if (code === "no_targets") return "No valid destination";
  if (code === "house_pay_first") return "House must be paid first";
  if (code === "not_sly") return "Not a Sly Deal";
  if (code === "sly_full_set") return "Can't steal from a complete set";
  if (code === "not_jsn") return "Not Just Say No";
  if (code === "no_response_window") return "No response window";
  if (code === "response_too_late") return "Too late to respond";
  if (code === "bad_srcAction") return "Bad source action";
  return code || "error";
};

MC.fmt.appendRuleNotes = function (def, baseDesc) {
  baseDesc = baseDesc ? String(baseDesc) : "";
  if (!def || !def.ruleNotes || def.ruleNotes.length === 0) return baseDesc;
  var enabled = MC.config.rules.enabledRuleNotes;
  if (enabled.length === 0) return baseDesc;

  var out = baseDesc;
  var i;
  for (i = 0; i < def.ruleNotes.length; i++) {
    var id = def.ruleNotes[i];
    var j;
    var on = false;
    for (j = 0; j < enabled.length; j++) if (enabled[j] === id) { on = true; break; }
    if (!on) continue;
    var txt = MC.ruleNoteTextById[id] ? String(MC.ruleNoteTextById[id]) : "";
    if (!txt) continue;
    if (out) out += "\n";
    out += txt;
  }
  return out;
};

MC.fmt.inspectTitleForDef = function (def) {
  if (!def) return "";
  return def.name ? String(def.name) : (def.id ? String(def.id) : "");
};

MC.fmt.inspectDescForDef = function (def, selColor) {
  if (!def) return "";
  var base = def.desc ? String(def.desc) : "";
  base = MC.fmt.appendRuleNotes(def, base);
  var v = MC.fmt.valueForDef(def);
  var vLine = (v != null && v > 0) ? ("Value: $" + String(v)) : "";
  var usedAs = "";
  if (MC.rules.isWildDef(def)) {
    var cSel = selColor;
    if (cSel !== MC.state.NO_COLOR && def.wildColors && (cSel === def.wildColors[0] || cSel === def.wildColors[1])) {
      usedAs = "Currently used as: " + MC.fmt.colorName(cSel);
    }
  }

  var out = "";
  if (vLine) out = vLine;
  if (usedAs) out = out ? (out + "\n" + usedAs) : usedAs;
  if (base) out = out ? (out + "\n" + base) : base;
  return out;
};

MC.fmt.destLabelForCmd = function (state, cmd) {
  if (cmd && cmd.kind === "playSlyDeal" && cmd.target && cmd.target.loc) {
    var tl = cmd.target.loc;
    var colT = MC.state.NO_COLOR;
    if (tl && tl.zone === "setProps") {
      var setT = state.players[tl.p].sets[tl.setI];
      if (setT && setT.props) {
        var propT = setT.props[tl.i];
        if (propT) colT = propT[1];
      }
    }
    return (colT !== MC.state.NO_COLOR) ? MC.fmt.colorName(colT) : "";
  }
  var d = MC.moves.destForCmd(cmd);
  if (!d) return "";
  if (d.kind === "newSet") return "New Set";
  if (d.kind === "setEnd") return MC.fmt.setLabelForSetI(state, d.p, d.setI);
  return "";
};

MC.fmt.setLabelForSetI = function (state, p, setI) {
  var set = state.players[p].sets[setI];
  var col = set ? MC.rules.getSetColor(set.props) : MC.state.NO_COLOR;
  return MC.fmt.colorName(col) + " Set";
};

MC.fmt.menuLabelForCmds = function (baseLabel, state, cmds) {
  baseLabel = String(baseLabel || "");
  if (!baseLabel) baseLabel = "Action";
  if (!cmds || cmds.length === 0) return baseLabel;
  if (cmds.length !== 1) return baseLabel + "...";
  var dl = MC.fmt.destLabelForCmd(state, cmds[0]);
  return dl ? (baseLabel + " -> " + dl) : baseLabel;
};

MC.fmt.menuLabelForRentMoves = function (state, rentMoves) {
  if (!rentMoves || rentMoves.length === 0) return "";
  if (rentMoves.length !== 1) return "Rent...";
  var onlyR = rentMoves[0];
  var sl = MC.fmt.setLabelForSetI(state, 0, onlyR.setI);
  return sl ? ("Rent -> " + sl) : "Rent";
};

MC.fmt.targetingTitle = function (targeting, cmd) {
  var tKind = targeting && targeting.kind ? String(targeting.kind) : "";

  var prof = MC.cmd.getProfile(tKind);
  if (prof && prof.title) {
    if (typeof prof.title === "function") return String(prof.title(targeting || null, cmd || null));
    return String(prof.title);
  }

  return MC.cmd.titleForCmdKind(cmd);
};

MC.fmt.targetingDestLine = function (state, targeting, cmd) {
  var t = targeting || null;
  if (t && t.mouse && t.mouse.dragMode && t.mouse.dragging && !t.mouse.snapped) {
    return "Hover dest\nto snap";
  }

  var tKind = t && t.kind ? String(t.kind) : "";
  var prof = MC.cmd.getProfile(tKind);
  if (prof && prof.destLine) return prof.destLine(state, t, cmd);
  return MC.cmd.destLineForCmd(state, t, cmd);
};

MC.fmt.targetingHelp = function (targeting) {
  var t = targeting || null;
  if (t && t.mouse && t.mouse.dragMode && t.mouse.dragging && !t.mouse.snapped) {
    var help = "Hover:Snap";
    if (t.card && t.card.def && MC.rules.isWildDef(t.card.def)) help += "  U/D:Color";
    help += "\nRelease:Cancel  Right:Cancel";
    return help;
  }
  var kind = t && t.kind ? String(t.kind) : "";
  var prof = MC.cmd.getProfile(kind);
  var help = (prof && prof.helpLR) ? String(prof.helpLR) : "L/R: Dest";
  if (t && t.card && t.card.def && MC.rules.isWildDef(t.card.def)) help += "  U/D: Color";
  help += (t && t.hold) ? "\nRelease A: Drop  B:Cancel" : "\nA:Confirm  B:Cancel";
  return help;
};

