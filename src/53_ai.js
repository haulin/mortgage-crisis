// PD.ai: simple playtest AI (pick among legal moves using deterministic RNG + short narration).

PD.ai.policies = {
  uniform: {
    id: "uniform",
    weight: function () { return 1; }
  },

  biasExistingSet: {
    id: "biasExistingSet",
    weight: function (state, move) {
      // Soft bias: prefer placing properties into existing sets, but still allow anything.
      // Tuning knob lives in config.
      var k = PD.config.ai.biasExistingSetK;
      if (move && move.kind === "playProp" && move.dest && move.dest.setI != null) return k;
      return 1;
    }
  },

  biasPlayRent: {
    id: "biasPlayRent",
    weight: function (state, move) {
      // Soft bias: prefer asking for rent rather than banking the Rent card.
      // Tuning knob lives in config.
      var k = PD.config.ai.biasPlayRentK;
      if (move && move.kind === "playRent") return k;
      return 1;
    }
  }
};

PD.ai.composePolicies = function (id, policyIds) {
  // Compose policies by multiplying their weights.
  // Contract: each component policy weight is a positive number (1 means neutral).
  var parts = [];
  var i;
  for (i = 0; i < policyIds.length; i++) {
    var pid = policyIds[i];
    var p = PD.ai.policies[pid];
    if (!p) throw new Error("ai_unknown_policy:" + String(pid));
    parts.push(p);
  }
  return {
    id: id,
    weight: function (state, move, moves) {
      var w = 1;
      var j;
      for (j = 0; j < parts.length; j++) w *= parts[j].weight(state, move, moves);
      return w;
    }
  };
};

PD.ai.policies.defaultHeuristic = PD.ai.composePolicies("defaultHeuristic", [
  "biasExistingSet",
  "biasPlayRent"
]);

PD.ai.pickMove = function (state, moves, policy) {
  if (!moves || moves.length === 0) return null;

  // Fallback to uniform if policy is missing (should be caught by tests).
  var pol = policy || PD.ai.policies.uniform;

  var weights = [];
  var total = 0;
  var i;
  for (i = 0; i < moves.length; i++) {
    var w = pol.weight(state, moves[i], moves);
    if (!(w > 0)) w = 0;
    else w = Math.floor(w);
    weights[i] = w;
    total += w;
  }

  // Safety: if a policy produces all-zero weights, fall back to uniform.
  if (!(total > 0)) {
    var idxU = PD.rng.nextIntInState(state, moves.length);
    return moves[idxU];
  }

  var r = PD.rng.nextIntInState(state, total);
  var acc = 0;
  for (i = 0; i < moves.length; i++) {
    acc += weights[i];
    if (r < acc) return moves[i];
  }

  // Should be unreachable; keep deterministic behavior.
  return moves[moves.length - 1];
};

PD.ai.policyForP = function (p) {
  return PD.ai.policies[PD.config.ai.policyByP[p]];
};

PD.ai.actor = function (state) {
  var pr = state.prompt;
  if (pr && pr.p != null) return pr.p;
  return state.activeP;
};

PD.ai.pickRandomLegalMove = function (state) {
  var moves = PD.engine.legalMoves(state);
  if (!moves || moves.length === 0) return null;
  var p = PD.ai.actor(state);
  var policy = PD.ai.policyForP(p);
  return PD.ai.pickMove(state, moves, policy);
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

