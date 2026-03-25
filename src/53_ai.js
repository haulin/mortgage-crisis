// Phase 07: simple AI helpers (random legal move + short narration).

PD.ai.actor = function (state) {
  var pr = state.prompt;
  if (pr && pr.p != null) return pr.p;
  return state.activeP;
};

PD.ai.pickRandomLegalMove = function (state) {
  var moves = PD.legalMoves(state);
  if (!moves || moves.length === 0) return null;
  var idx = PD.rngNextInt(state, moves.length);
  return moves[idx];
};

PD.ai.describeCmd = function (state, cmd) {
  var k = String(cmd.kind);
  if (k === "endTurn") return "Opponent: End turn";
  if (k === "bank") return "Opponent: Bank";
  if (k === "playRent") return "Opponent: Rent";
  if (k === "playHouse") return "Opponent: Build";
  if (k === "playProp") {
    var dl = PD.fmt.destLabelForCmd(state, cmd);
    return dl ? ("Opponent: Place -> " + dl) : "Opponent: Place";
  }
  if (k === "payDebt") return "Opponent: Pay";
  if (k === "discard") return "Opponent: Discard";
  if (k === "cancelPrompt") return "Opponent: Cancel";
  return "Opponent: " + k;
};

// Phase 07: simple AI (random legal move) helpers.

PD.ai.actor = function (state) {
  if (!state) return 0;
  var pr = state.prompt;
  if (pr && pr.p != null) return pr.p;
  return state.activeP;
};

PD.ai.pickRandomLegalMove = function (state) {
  var moves = PD.legalMoves(state);
  if (!moves || moves.length === 0) return null;
  var idx = PD.rngNextInt(state, moves.length);
  return moves[idx];
};

PD.ai.describeCmd = function (state, cmd) {
  if (!cmd || !cmd.kind) return "";
  var k = String(cmd.kind);

  if (k === "endTurn") return "Opponent: End turn";
  if (k === "bank") return "Opponent: Bank";
  if (k === "playRent") return "Opponent: Rent";
  if (k === "playHouse") return "Opponent: Build";
  if (k === "playProp") {
    var dl = PD.fmt.destLabelForCmd(state, cmd);
    return dl ? ("Opponent: Place -> " + dl) : "Opponent: Place";
  }
  if (k === "payDebt") return "Opponent: Pay";
  if (k === "discard") return "Opponent: Discard";
  if (k === "cancelPrompt") return "Opponent: Cancel";
  return "Opponent: " + k;
};

