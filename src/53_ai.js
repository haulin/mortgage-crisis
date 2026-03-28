// MC.ai: simple playtest AI (pick among legal moves using deterministic RNG + short narration).

MC.ai.policies = {
  uniform: {
    id: "uniform",
    weight: function () { return 1; }
  },

  biasExistingSet: {
    id: "biasExistingSet",
    weight: function (state, move) {
      // Soft bias: prefer placing properties into existing sets, but still allow anything.
      // Tuning knob lives in config.
      var k = MC.config.ai.biasExistingSetK;
      if (move && move.kind === "playProp" && move.dest && move.dest.setI != null) return k;
      return 1;
    }
  },

  biasPayDebtFromBank: {
    id: "biasPayDebtFromBank",
    weight: function (state, move) {
      // Phase 09b: prefer paying debts from bank to reduce surprise property transfers.
      // Tuning knob lives in config.
      var k = MC.config.ai.biasPayDebtFromBankK;
      if (!move || move.kind !== "payDebt") return 1;
      if (!(k > 1)) k = 1;
      var loc = (move.card && move.card.loc) ? move.card.loc : null;
      if (loc && loc.zone === "bank") return k;
      return 1;
    }
  },

  biasPlayRent: {
    id: "biasPlayRent",
    weight: function (state, move) {
      // Soft bias: prefer asking for rent rather than banking the Rent card.
      // Tuning knob lives in config.
      var k = MC.config.ai.biasPlayRentK;
      if (move && move.kind === "playRent") return k;
      return 1;
    }
  },

  biasPlayJustSayNo: {
    id: "biasPlayJustSayNo",
    weight: function (state, move) {
      // Soft bias: prefer canceling negative actions when a response window exists.
      // Tuning knob lives in config.
      var k = MC.config.ai.biasPlayJustSayNoK;
      if (move && move.kind === "playJustSayNo") return k;
      return 1;
    }
  },

  biasMoveWild: {
    id: "biasMoveWild",
    weight: function (state, move) {
      // Phase 09: simple heuristic for replace-window Wild repositioning.
      // Prefer moves that complete a set, then maximize rent delta on existing sets.
      // Tuning knob lives in config.
      var k = MC.config.ai.biasMoveWildK;
      if (!move || move.kind !== "moveWild") return 1;
      if (!(k > 1)) k = 1;

      var dest = move.dest;
      if (!dest) return 1;
      // New set: treat as neutral by default (can be strategically risky vs Sly Deal).
      if (dest.newSet) return 1;
      if (dest.setI == null) return 1;

      var card = move.card;
      var loc = card && card.loc ? card.loc : null;
      var p = (loc && loc.p != null) ? loc.p : state.activeP;
      var setI = dest.setI;
      var sets = state.players[p] ? state.players[p].sets : null;
      if (!sets || setI < 0 || setI >= sets.length) return 1;
      var set = sets[setI];
      if (!set || !set.props || set.props.length <= 0) return 1;

      var color = MC.rules.getSetColor(set.props);
      if (color === MC.state.NO_COLOR) return 1;
      var rules = MC.SET_RULES[color];
      if (!rules || !(rules.requiredSize > 0)) return 1;
      var req = rules.requiredSize;

      var nBefore = set.props.length;
      var nAfterUncapped = nBefore + 1;
      var completes = (nAfterUncapped >= req);

      // Compute rent before/after (rent caps at required size).
      var rentBefore = MC.rules.rentAmountForSet(state, p, setI);
      var rentAfter = MC.rules.rentAmountForColorCount(color, nAfterUncapped, !!set.houseUid);

      var delta = rentAfter - rentBefore;
      if (completes) return k * 20;
      if (delta > 0) return k * (1 + delta);
      return 1;
    }
  }
};

MC.ai.composePolicies = function (id, policyIds) {
  // Compose policies by multiplying their weights.
  // Contract: each component policy weight is a positive number (1 means neutral).
  var parts = [];
  var i;
  for (i = 0; i < policyIds.length; i++) {
    var pid = policyIds[i];
    var p = MC.ai.policies[pid];
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

MC.ai.policies.defaultHeuristic = MC.ai.composePolicies("defaultHeuristic", [
  "biasExistingSet",
  "biasPayDebtFromBank",
  "biasPlayRent",
  "biasPlayJustSayNo",
  "biasMoveWild"
]);

MC.ai.pickMove = function (state, moves, policy) {
  if (!moves || moves.length === 0) return null;

  // Fallback to uniform if policy is missing (should be caught by tests).
  var pol = policy || MC.ai.policies.uniform;

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
    var idxU = MC.rng.nextIntInState(state, moves.length);
    return moves[idxU];
  }

  var r = MC.rng.nextIntInState(state, total);
  var acc = 0;
  for (i = 0; i < moves.length; i++) {
    acc += weights[i];
    if (r < acc) return moves[i];
  }

  // Should be unreachable; keep deterministic behavior.
  return moves[moves.length - 1];
};

MC.ai.policyForP = function (p) {
  return MC.ai.policies[MC.config.ai.policyByP[p]];
};

MC.ai.actor = function (state) {
  var pr = state.prompt;
  if (pr && pr.p != null) return pr.p;
  return state.activeP;
};

MC.ai.pickRandomLegalMove = function (state) {
  var moves = MC.engine.legalMoves(state);
  if (!moves || moves.length === 0) return null;
  var p = MC.ai.actor(state);
  var policy = MC.ai.policyForP(p);
  return MC.ai.pickMove(state, moves, policy);
};

MC.ai.describeCmd = function (state, cmd) {
  if (!cmd || !cmd.kind) return "";
  var k = String(cmd.kind);
  if (k === "endTurn") return "AI: End turn";
  if (k === "bank") return "AI: Bank";
  if (k === "playRent") return "AI: Rent";
  if (k === "playSlyDeal") return "AI: Sly Deal";
  if (k === "respondPass") return "AI: Allow";
  if (k === "playJustSayNo") return "AI: Just Say No";
  if (k === "skipReplaceWindow") return "AI: Skip";
  if (k === "moveWild") return "AI: Move Wild";
  if (k === "playHouse") return "AI: Build";
  if (k === "playProp") {
    var dl = MC.fmt.destLabelForCmd(state, cmd);
    return dl ? ("AI: Place -> " + dl) : "AI: Place";
  }
  if (k === "payDebt") return "AI: Pay";
  if (k === "discard") return "AI: Discard";
  if (k === "cancelPrompt") return "AI: Cancel";
  return "AI: " + k;
};

