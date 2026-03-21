PD.evaluateWin = function (state) {
  var p;
  for (p = 0; p < 2; p++) {
    var sets = state.players[p].sets;
    var complete = 0;
    var si;
    for (si = 0; si < sets.length; si++) {
      var set = sets[si];
      if (!set) continue;
      var color = PD.getSetColor(set.props);
      if (color === PD.NO_COLOR) continue;
      var req = PD.SET_RULES[color].requiredSize;
      if (set.props.length >= req && req > 0) complete++;
    }
    if (complete >= 3) return p;
  }
  return PD.NO_WINNER;
};

PD.assertCanApply = function (state) {
  if (state.winnerP !== PD.NO_WINNER) throw new Error("game_over");
  if (state.prompt) throw new Error("prompt_active");
};

PD.locEqZone = function (loc, zone) {
  return !!loc && loc.zone === zone;
};

PD.removeHandAtLoc = function (state, card) {
  var loc = card.loc;
  var p = loc.p | 0;
  var i = loc.i | 0;
  var uid = card.uid | 0;
  var hand = state.players[p].hand;
  if (hand[i] !== uid) throw new Error("bad_loc");
  hand.splice(i, 1);
};

PD.applyCommand = function (state, cmd) {
  PD.assertCanApply(state);
  if (!cmd || !cmd.kind) throw new Error("bad_cmd");

  var events = [];
  var p = state.activeP;
  var handP = state.players[p].hand;

  function decPlays() {
    state.playsLeft -= 1;
    events.push({ kind: "plays", p: p, playsLeft: state.playsLeft });
  }

  function applyEndTurn() {
    state.activeP = PD.otherPlayer(state.activeP);
    events.push({ kind: "turn", activeP: state.activeP });
    PD.startTurn(state, events);
  }

  function applyBank(cmdBank) {
    var card = cmdBank.card;
    if (!card || !card.loc) throw new Error("bad_cmd");
    if (!PD.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if ((card.loc.p | 0) !== (p | 0)) throw new Error("not_your_card");

    var uid = card.uid | 0;
    var def = PD.defByUid(state, uid);
    if (!PD.isBankableDef(def)) throw new Error("not_bankable");

    PD.removeHandAtLoc(state, card);
    state.players[p].bank.push(uid);

    events.push({
      kind: "move",
      uid: uid,
      from: card.loc,
      to: { p: p, zone: "bank", i: state.players[p].bank.length - 1 }
    });
    decPlays();
  }

  function applyPlayProp(cmdProp) {
    var card = cmdProp.card;
    var dest = cmdProp.dest;
    if (!card || !card.loc || !dest) throw new Error("bad_cmd");
    if (!PD.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if ((card.loc.p | 0) !== (p | 0)) throw new Error("not_your_card");

    var uid = card.uid | 0;
    var def = PD.defByUid(state, uid);
    if (!def || def.kind !== PD.CardKind.Property) throw new Error("not_property");

    var placedColor = PD.NO_COLOR;
    if (PD.isWildDef(def)) {
      placedColor = cmdProp.color | 0;
      if (!PD.wildAllowsColor(def, placedColor)) throw new Error("wild_color_illegal");
    } else {
      placedColor = def.propertyColor;
    }

    var sets = state.players[p].sets;
    var setI;
    if (dest.newSet) {
      var newSet = PD.newEmptySet();
      setI = sets.length;
      sets.push(newSet);
      events.push({ kind: "createSet", p: p, setI: setI, color: placedColor });
    } else {
      setI = dest.setI | 0;
      if (setI < 0 || setI >= sets.length) throw new Error("bad_set");
      var setExisting = sets[setI];
      var setColor = PD.getSetColor(setExisting.props);
      if (setColor === PD.NO_COLOR) throw new Error("empty_set");
      if (setColor !== placedColor) throw new Error("set_color_mismatch");
    }

    PD.removeHandAtLoc(state, card);
    var setT = sets[setI];
    setT.props.push([uid, placedColor]);

    events.push({
      kind: "move",
      uid: uid,
      from: card.loc,
      to: { p: p, zone: "setProps", setI: setI, i: setT.props.length - 1 }
    });
    decPlays();

    var winner = PD.evaluateWin(state);
    if (winner !== PD.NO_WINNER) {
      state.winnerP = winner;
      events.push({ kind: "win", winnerP: winner });
    }
  }

  function applyPlayHouse(cmdHouse) {
    var card = cmdHouse.card;
    var dest = cmdHouse.dest;
    if (!card || !card.loc || !dest) throw new Error("bad_cmd");
    if (!PD.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if ((card.loc.p | 0) !== (p | 0)) throw new Error("not_your_card");

    var uid = card.uid | 0;
    var def = PD.defByUid(state, uid);
    if (!def || def.kind !== PD.CardKind.House) throw new Error("not_house");

    var sets = state.players[p].sets;
    var setI = dest.setI | 0;
    if (setI < 0 || setI >= sets.length) throw new Error("bad_set");
    var set = sets[setI];
    if (set.houseUid !== 0) throw new Error("house_already");

    var color = PD.getSetColor(set.props);
    if (color === PD.NO_COLOR) throw new Error("empty_set");
    var req = PD.SET_RULES[color].requiredSize;
    if (set.props.length < req) throw new Error("set_not_complete");

    PD.removeHandAtLoc(state, card);
    set.houseUid = uid;

    events.push({
      kind: "move",
      uid: uid,
      from: card.loc,
      to: { p: p, zone: "setHouse", setI: setI }
    });
    decPlays();
  }

  if (cmd.kind === "endTurn") {
    if ((handP.length | 0) > (PD.HAND_MAX | 0)) throw new Error("hand_over_limit");
    applyEndTurn();
    return { events: events };
  }

  if (state.playsLeft <= 0) throw new Error("no_plays_left");

  if (cmd.kind === "bank") applyBank(cmd);
  else if (cmd.kind === "playProp") applyPlayProp(cmd);
  else if (cmd.kind === "playHouse") applyPlayHouse(cmd);
  else throw new Error("unknown_cmd:" + cmd.kind);

  return { events: events };
};

PD.legalMoves = function (state) {
  if (state.winnerP !== PD.NO_WINNER) return [];
  if (state.prompt) return [];

  var moves = [];
  var p = state.activeP;
  var hand = state.players[p].hand;

  if ((hand.length | 0) <= (PD.HAND_MAX | 0)) moves.push({ kind: "endTurn" });

  if (state.playsLeft <= 0) return moves;

  var sets = state.players[p].sets;

  var i;
  for (i = 0; i < hand.length; i++) {
    var uid = hand[i];
    var def = PD.defByUid(state, uid | 0);
    var cardRef = { uid: uid, loc: { p: p, zone: "hand", i: i } };

    if (PD.isBankableDef(def)) {
      moves.push({ kind: "bank", card: cardRef });
    }

    if (def.kind === PD.CardKind.Property) {
      if (PD.isWildDef(def)) {
        // New set for each allowed color.
        moves.push({ kind: "playProp", card: cardRef, dest: { p: p, newSet: true }, color: def.wildColors[0] });
        moves.push({ kind: "playProp", card: cardRef, dest: { p: p, newSet: true }, color: def.wildColors[1] });

        // Existing sets that match allowed colors.
        var si;
        for (si = 0; si < sets.length; si++) {
          var set = sets[si];
          var setColor = PD.getSetColor(set.props);
          if (setColor === PD.NO_COLOR) continue;
          if (PD.wildAllowsColor(def, setColor)) {
            moves.push({ kind: "playProp", card: cardRef, dest: { p: p, setI: si }, color: setColor });
          }
        }
      } else {
        var c = def.propertyColor;
        // New set.
        moves.push({ kind: "playProp", card: cardRef, dest: { p: p, newSet: true } });
        // Existing sets of same color.
        var sj;
        for (sj = 0; sj < sets.length; sj++) {
          var setJ = sets[sj];
          var setColorJ = PD.getSetColor(setJ.props);
          if (setColorJ === PD.NO_COLOR) continue;
          if (setColorJ === c) {
            moves.push({ kind: "playProp", card: cardRef, dest: { p: p, setI: sj } });
          }
        }
      }
    } else if (def.kind === PD.CardKind.House) {
      var sh;
      for (sh = 0; sh < sets.length; sh++) {
        var setH = sets[sh];
        if (setH.houseUid !== 0) continue;
        var col = PD.getSetColor(setH.props);
        if (col === PD.NO_COLOR) continue;
        var req = PD.SET_RULES[col].requiredSize;
        if (setH.props.length >= req) {
          moves.push({ kind: "playHouse", card: cardRef, dest: { p: p, setI: sh } });
        }
      }
    }
  }

  return moves;
};

