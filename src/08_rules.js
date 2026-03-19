PD.evaluateWin = function (state) {
  var p;
  for (p = 0; p < 2; p++) {
    var sets = state.players[p].sets;
    var complete = 0;
    var si;
    for (si = 0; si < (sets.length | 0); si++) {
      var set = sets[si];
      if (!set) continue;
      var color = PD.getSetColor(set.props);
      if (color === PD.NO_COLOR) continue;
      var req = PD.SET_RULES[color].requiredSize | 0;
      if (((set.props.length | 0) >= req) && req > 0) complete++;
    }
    if (complete >= 3) return p | 0;
  }
  return PD.NO_WINNER;
};

PD.assertCanApply = function (state) {
  if ((state.winnerP | 0) !== PD.NO_WINNER) throw new Error("game_over");
  if (state.prompt) throw new Error("prompt_active");
};

PD.locEqZone = function (loc, zone) {
  return !!(loc && loc.zone === zone);
};

PD.removeHandAtLoc = function (state, card) {
  var loc = card.loc;
  var p = loc.p | 0;
  var i = loc.i | 0;
  var uid = card.uid | 0;
  var hand = state.players[p].hand;
  if ((hand[i] | 0) !== uid) throw new Error("bad_loc");
  hand.splice(i, 1);
};

PD.applyCommand = function (state, cmd) {
  PD.assertCanApply(state);
  if (!cmd || !cmd.kind) throw new Error("bad_cmd");

  var events = [];
  var p = state.activeP | 0;

  if (cmd.kind === "endTurn") {
    state.activeP = PD.otherPlayer(state.activeP | 0);
    events.push({ kind: "turn", activeP: state.activeP | 0 });
    PD.startTurn(state, events);
    return { events: events };
  }

  if ((state.playsLeft | 0) <= 0) throw new Error("no_plays_left");

  if (cmd.kind === "bank") {
    var card = cmd.card;
    if (!card || !card.loc) throw new Error("bad_cmd");
    if (!PD.locEqZone(card.loc, "hand")) throw new Error("bad_loc");
    if ((card.loc.p | 0) !== p) throw new Error("not_your_card");

    var def = PD.defByUid(state, card.uid | 0);
    if (!PD.isBankableDef(def)) throw new Error("not_bankable");

    PD.removeHandAtLoc(state, card);
    state.players[p].bank.push(card.uid | 0);

    state.playsLeft = (state.playsLeft - 1) | 0;
    events.push({
      kind: "move",
      uid: card.uid | 0,
      from: card.loc,
      to: { p: p, zone: "bank", i: (state.players[p].bank.length | 0) - 1 }
    });
    events.push({ kind: "plays", p: p, playsLeft: state.playsLeft | 0 });
  } else if (cmd.kind === "playProp") {
    var cardP = cmd.card;
    var dest = cmd.dest;
    if (!cardP || !cardP.loc || !dest) throw new Error("bad_cmd");
    if (!PD.locEqZone(cardP.loc, "hand")) throw new Error("bad_loc");
    if ((cardP.loc.p | 0) !== p) throw new Error("not_your_card");

    var defP = PD.defByUid(state, cardP.uid | 0);
    if (!defP || defP.kind !== PD.CardKind.Property) throw new Error("not_property");

    var placedColor = PD.NO_COLOR;
    if (PD.isWildDef(defP)) {
      placedColor = cmd.color | 0;
      if (!PD.wildAllowsColor(defP, placedColor)) throw new Error("wild_color_illegal");
    } else {
      placedColor = defP.propertyColor | 0;
    }

    var setsP = state.players[p].sets;
    var setI;
    if (dest.newSet) {
      var newSet = PD.newEmptySet();
      setI = setsP.length | 0;
      setsP.push(newSet);
      events.push({ kind: "createSet", p: p, setI: setI, color: placedColor | 0 });
    } else {
      setI = dest.setI | 0;
      if (setI < 0 || setI >= (setsP.length | 0)) throw new Error("bad_set");
      var setExisting = setsP[setI];
      var setColor = PD.getSetColor(setExisting.props);
      if (setColor === PD.NO_COLOR) throw new Error("empty_set");
      if ((setColor | 0) !== (placedColor | 0)) throw new Error("set_color_mismatch");
    }

    PD.removeHandAtLoc(state, cardP);
    var setT = setsP[setI];
    setT.props.push([cardP.uid | 0, placedColor | 0]);

    state.playsLeft = (state.playsLeft - 1) | 0;
    events.push({
      kind: "move",
      uid: cardP.uid | 0,
      from: cardP.loc,
      to: { p: p, zone: "setProps", setI: setI, i: (setT.props.length | 0) - 1 }
    });
    events.push({ kind: "plays", p: p, playsLeft: state.playsLeft | 0 });

    var winner = PD.evaluateWin(state) | 0;
    if (winner !== PD.NO_WINNER) {
      state.winnerP = winner | 0;
      events.push({ kind: "win", winnerP: winner | 0 });
    }
  } else if (cmd.kind === "playHouse") {
    var cardH = cmd.card;
    var destH = cmd.dest;
    if (!cardH || !cardH.loc || !destH) throw new Error("bad_cmd");
    if (!PD.locEqZone(cardH.loc, "hand")) throw new Error("bad_loc");
    if ((cardH.loc.p | 0) !== p) throw new Error("not_your_card");

    var defH = PD.defByUid(state, cardH.uid | 0);
    if (!defH || defH.kind !== PD.CardKind.House) throw new Error("not_house");

    var setsH = state.players[p].sets;
    var siH = destH.setI | 0;
    if (siH < 0 || siH >= (setsH.length | 0)) throw new Error("bad_set");
    var setH = setsH[siH];
    if ((setH.houseUid | 0) !== 0) throw new Error("house_already");

    var colorH = PD.getSetColor(setH.props);
    if (colorH === PD.NO_COLOR) throw new Error("empty_set");
    var reqH = PD.SET_RULES[colorH].requiredSize | 0;
    if ((setH.props.length | 0) < reqH) throw new Error("set_not_complete");

    PD.removeHandAtLoc(state, cardH);
    setH.houseUid = cardH.uid | 0;

    state.playsLeft = (state.playsLeft - 1) | 0;
    events.push({
      kind: "move",
      uid: cardH.uid | 0,
      from: cardH.loc,
      to: { p: p, zone: "setHouse", setI: siH }
    });
    events.push({ kind: "plays", p: p, playsLeft: state.playsLeft | 0 });
  } else {
    throw new Error("unknown_cmd:" + cmd.kind);
  }

  return { events: events };
};

PD.legalMoves = function (state) {
  if ((state.winnerP | 0) !== PD.NO_WINNER) return [];
  if (state.prompt) return [];

  var moves = [];
  var p = state.activeP | 0;

  // End turn is always allowed (\"play up to 3\").
  moves.push({ kind: "endTurn" });

  if ((state.playsLeft | 0) <= 0) return moves;

  var hand = state.players[p].hand;
  var sets = state.players[p].sets;

  var i;
  for (i = 0; i < (hand.length | 0); i++) {
    var uid = hand[i] | 0;
    var def = PD.defByUid(state, uid);
    var cardRef = { uid: uid, loc: { p: p, zone: "hand", i: i } };

    if (PD.isBankableDef(def)) {
      moves.push({ kind: "bank", card: cardRef });
    }

    if (def.kind === PD.CardKind.Property) {
      if (PD.isWildDef(def)) {
        // New set for each allowed color.
        moves.push({ kind: "playProp", card: cardRef, dest: { p: p, newSet: true }, color: def.wildColors[0] | 0 });
        moves.push({ kind: "playProp", card: cardRef, dest: { p: p, newSet: true }, color: def.wildColors[1] | 0 });

        // Existing sets that match allowed colors.
        var si;
        for (si = 0; si < (sets.length | 0); si++) {
          var set = sets[si];
          var setColor = PD.getSetColor(set.props);
          if (setColor === PD.NO_COLOR) continue;
          if (PD.wildAllowsColor(def, setColor)) {
            moves.push({ kind: "playProp", card: cardRef, dest: { p: p, setI: si }, color: setColor | 0 });
          }
        }
      } else {
        var c = def.propertyColor | 0;
        // New set.
        moves.push({ kind: "playProp", card: cardRef, dest: { p: p, newSet: true } });
        // Existing sets of same color.
        var sj;
        for (sj = 0; sj < (sets.length | 0); sj++) {
          var setJ = sets[sj];
          var setColorJ = PD.getSetColor(setJ.props);
          if (setColorJ === PD.NO_COLOR) continue;
          if ((setColorJ | 0) === (c | 0)) {
            moves.push({ kind: "playProp", card: cardRef, dest: { p: p, setI: sj } });
          }
        }
      }
    } else if (def.kind === PD.CardKind.House) {
      var sh;
      for (sh = 0; sh < (sets.length | 0); sh++) {
        var setH = sets[sh];
        if ((setH.houseUid | 0) !== 0) continue;
        var col = PD.getSetColor(setH.props);
        if (col === PD.NO_COLOR) continue;
        var req = PD.SET_RULES[col].requiredSize | 0;
        if ((setH.props.length | 0) >= req) {
          moves.push({ kind: "playHouse", card: cardRef, dest: { p: p, setI: sh } });
        }
      }
    }
  }

  return moves;
};

