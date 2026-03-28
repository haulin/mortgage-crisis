// PD.fmt: shared text formatting helpers (UI/debug narration).
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
  // Phase 08+
  if (code === "not_sly") return "Not a Sly Deal";
  if (code === "sly_full_set") return "Can't steal from a complete set";
  if (code === "not_jsn") return "Not Just Say No";
  if (code === "no_response_window") return "No response window";
  if (code === "response_too_late") return "Too late to respond";
  if (code === "bad_srcAction") return "Bad source action";
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
  if (PD.rules.isWildDef(def)) {
    var cSel = selColor;
    if (cSel !== PD.state.NO_COLOR && def.wildColors && (cSel === def.wildColors[0] || cSel === def.wildColors[1])) {
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
  var col = set ? PD.rules.getSetColor(set.props) : PD.state.NO_COLOR;
  return PD.fmt.colorName(col) + " Set";
};

PD.fmt.menuLabelForCmds = function (baseLabel, state, cmds) {
  baseLabel = String(baseLabel || "");
  if (!baseLabel) baseLabel = "Action";
  if (!cmds || cmds.length === 0) return baseLabel;
  if (cmds.length !== 1) return baseLabel + "...";
  var dl = PD.fmt.destLabelForCmd(state, cmds[0]);
  return dl ? (baseLabel + " -> " + dl) : baseLabel;
};

PD.fmt.menuLabelForRentMoves = function (state, rentMoves) {
  if (!rentMoves || rentMoves.length === 0) return "";
  if (rentMoves.length !== 1) return "Rent...";
  var onlyR = rentMoves[0];
  var sl = PD.fmt.setLabelForSetI(state, 0, onlyR.setI);
  return sl ? ("Rent -> " + sl) : "Rent";
};

PD.fmt.targetingTitle = function (targeting, cmd) {
  var tKind = targeting && targeting.kind ? String(targeting.kind) : "";

  var prof = PD.cmd.getProfile(tKind);
  if (prof && prof.title) {
    if (typeof prof.title === "function") return String(prof.title(targeting || null, cmd || null));
    return String(prof.title);
  }

  return PD.cmd.titleForCmdKind(cmd);
};

PD.fmt.targetingDestLine = function (state, targeting, cmd) {
  var t = targeting || null;

  var tKind = t && t.kind ? String(t.kind) : "";
  var prof = PD.cmd.getProfile(tKind);
  if (prof && prof.destLine) return prof.destLine(state, t, cmd);
  return PD.cmd.destLineForCmd(state, t, cmd);
};

PD.fmt.targetingHelp = function (targeting) {
  var t = targeting || null;
  var kind = t && t.kind ? String(t.kind) : "";
  var prof = PD.cmd.getProfile(kind);
  var help = (prof && prof.helpLR) ? String(prof.helpLR) : "L/R: Dest";
  if (t && t.card && t.card.def && PD.rules.isWildDef(t.card.def)) help += "  U/D: Color";
  help += (t && t.hold) ? "\nRelease A: Drop  B:Cancel" : "\nA:Confirm  B:Cancel";
  return help;
};

