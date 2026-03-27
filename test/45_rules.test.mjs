import test from "node:test";
import assert from "node:assert/strict";
import { loadSrcIntoVm } from "./helpers/loadSrcIntoVm.mjs";

function findUidsInHandByDefId(ctx, state, defId) {
  const p = state.activeP;
  const out = [];
  const hand = state.players[p].hand;
  for (let i = 0; i < hand.length; i++) {
    const uid = hand[i];
    const di = state.uidToDefI[uid];
    const id = ctx.PD.CARD_DEFS[di].id;
    if (id === defId) out.push(uid);
  }
  return out;
}

function cardRefInActiveHand(state, uid) {
  const p = state.activeP;
  const i = state.players[p].hand.indexOf(uid);
  assert.ok(i >= 0, "expected uid in active hand");
  return { uid, loc: { p, zone: "hand", i } };
}

test("placeBasic scenario: can play property to new set and existing set; playsLeft decrements", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.state.newGame({ scenarioId: "placeBasic", seedU32: 1 });
  assert.equal(state.activeP, 0);
  assert.equal(state.players[0].sets.length, 1);

  const [u1, u2] = findUidsInHandByDefId(ctx, state, "prop_orange");
  assert.ok(u1 && u2, "expected 2 orange properties in hand");

  // Play first orange to a new set.
  let res = ctx.PD.engine.applyCommand(state, {
    kind: "playProp",
    card: cardRefInActiveHand(state, u1),
    dest: { newSet: true }
  });
  assert.ok(res.events.some((e) => e.kind === "createSet"));
  assert.equal(state.players[0].sets.length, 2);
  assert.equal(state.playsLeft, 2);

  // Play second orange into the original set (setI=0).
  res = ctx.PD.engine.applyCommand(state, {
    kind: "playProp",
    card: cardRefInActiveHand(state, u2),
    dest: { setI: 0 }
  });
  assert.equal(state.players[0].sets[0].props.length, 2);
  assert.equal(state.playsLeft, 1);
});

test("bank command moves bankable card from hand to bank and decrements playsLeft", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.state.newGame({ scenarioId: "placeBasic", seedU32: 1 });
  const [m1] = findUidsInHandByDefId(ctx, state, "money_1");
  assert.ok(m1, "expected money_1 in hand");

  const beforeHand = state.players[0].hand.length;
  const beforeBank = state.players[0].bank.length;

  ctx.PD.engine.applyCommand(state, { kind: "bank", card: cardRefInActiveHand(state, m1) });

  assert.equal(state.players[0].hand.length, beforeHand - 1);
  assert.equal(state.players[0].bank.length, beforeBank + 1);
  assert.equal(state.playsLeft, 2);
});

test("wildBasic scenario: can play wild with chosen color; illegal color throws", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.state.newGame({ scenarioId: "wildBasic", seedU32: 1 });
  const [w] = findUidsInHandByDefId(ctx, state, "wild_mo");
  assert.ok(w, "expected wild_mo in hand");

  // Legal: choose Orange and start new set.
  ctx.PD.engine.applyCommand(state, {
    kind: "playProp",
    card: cardRefInActiveHand(state, w),
    dest: { newSet: true },
    color: ctx.PD.Color.Orange
  });
  assert.equal(state.players[0].sets.length, 1);
  assert.equal(state.players[0].sets[0].props[0][1], ctx.PD.Color.Orange);

  // Fresh scenario for illegal test.
  const state2 = ctx.PD.state.newGame({ scenarioId: "wildBasic", seedU32: 1 });
  const [w2] = findUidsInHandByDefId(ctx, state2, "wild_mo");
  assert.throws(() => {
    ctx.PD.engine.applyCommand(state2, {
      kind: "playProp",
      card: cardRefInActiveHand(state2, w2),
      dest: { newSet: true },
      color: ctx.PD.Color.Cyan
    });
  });
});

test("houseBasic scenario: house allowed on complete set only; max 1 house per set", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.state.newGame({ scenarioId: "houseBasic", seedU32: 1 });
  const houses = findUidsInHandByDefId(ctx, state, "house");
  assert.equal(houses.length, 2);

  // setI=0 is complete Cyan, setI=1 is incomplete Black.
  ctx.PD.engine.applyCommand(state, {
    kind: "playHouse",
    card: cardRefInActiveHand(state, houses[0]),
    dest: { setI: 0 }
  });
  assert.ok(state.players[0].sets[0].houseUid);

  // Second house onto same set should throw.
  assert.throws(() => {
    ctx.PD.engine.applyCommand(state, {
      kind: "playHouse",
      card: cardRefInActiveHand(state, houses[1]),
      dest: { setI: 0 }
    });
  });

  // New scenario: house onto incomplete set throws.
  const state2 = ctx.PD.state.newGame({ scenarioId: "houseBasic", seedU32: 1 });
  const [h] = findUidsInHandByDefId(ctx, state2, "house");
  assert.throws(() => {
    ctx.PD.engine.applyCommand(state2, {
      kind: "playHouse",
      card: cardRefInActiveHand(state2, h),
      dest: { setI: 1 }
    });
  });
});

test("endTurn swaps active player, draws 2, resets playsLeft", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.state.newGame({ scenarioId: "placeBasic", seedU32: 1 });
  const p0 = state.activeP;
  const p1 = p0 ^ 1;

  const before = state.players[p1].hand.length;
  const res = ctx.PD.engine.applyCommand(state, { kind: "endTurn" });

  assert.equal(state.activeP, p1);
  // In this scenario, the incoming player starts with an empty hand, so they draw 5 instead of 2.
  assert.equal(state.players[p1].hand.length, before + 5);
  assert.equal(state.playsLeft, 3);
  assert.ok(res.events.some((e) => e.kind === "draw"));
});

test("startTurn draws 2 when the incoming player hand is non-empty", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.state.newGame({ scenarioId: "placeBasic", seedU32: 1 });
  const p0 = state.activeP;
  const p1 = p0 ^ 1;

  // Give the incoming player a card so startTurn draws the normal 2.
  const uid = state.deck.pop();
  state.players[p1].hand.push(uid);
  const before = state.players[p1].hand.length;

  ctx.PD.engine.applyCommand(state, { kind: "endTurn" });

  assert.equal(state.activeP, p1);
  assert.equal(state.players[p1].hand.length, before + 2);
  assert.equal(state.playsLeft, 3);
});

test("endTurn enters discardDown prompt when active hand is over 7 (then discarding completes endTurn)", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.state.newGame({ seedU32: 1 });
  const p = state.activeP;
  const o = p ^ 1;

  // Starting player normally has 7 cards; force it to 8 by moving one from deck to hand.
  state.players[p].hand.push(state.deck.pop());
  assert.ok(state.players[p].hand.length > 7, "expected active hand > 7");

  const moves = ctx.PD.engine.legalMoves(state);
  assert.ok(moves.some((m) => m.kind === "endTurn"), "expected endTurn to be legal even when hand > 7");

  const playsBefore = state.playsLeft;
  ctx.PD.engine.applyCommand(state, { kind: "endTurn" });

  // Turn does not pass yet; we enter a forced discard prompt instead.
  assert.equal(state.activeP, p);
  assert.equal(state.playsLeft, playsBefore);
  assert.ok(state.prompt, "expected prompt to be set");
  assert.equal(state.prompt.kind, "discardDown");
  assert.equal(state.prompt.p, p);

  // While prompt is active, only discard moves are returned.
  const m2 = ctx.PD.engine.legalMoves(state);
  assert.ok(m2.length > 0, "expected discard moves during prompt");
  assert.ok(
    m2.every((m) => m.kind === "discard" || m.kind === "cancelPrompt"),
    "expected only discard/cancelPrompt moves during prompt"
  );

  // Discard until prompt clears; this auto-finishes endTurn and starts opponent turn.
  while (state.prompt) {
    const mv = ctx.PD.engine.legalMoves(state).find((m) => m.kind === "discard");
    ctx.PD.engine.applyCommand(state, mv);
  }

  assert.equal(state.activeP, o);
  assert.equal(state.playsLeft, 3);
});

test("cancelPrompt cancels discardDown only before any discard", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.state.newGame({ seedU32: 1 });
  const p = state.activeP;

  // Force prompt via endTurn attempt.
  state.players[p].hand.push(state.deck.pop());
  ctx.PD.engine.applyCommand(state, { kind: "endTurn" });
  assert.ok(state.prompt && state.prompt.kind === "discardDown");

  // Cancel immediately (no discards yet).
  ctx.PD.engine.applyCommand(state, { kind: "cancelPrompt" });
  assert.equal(state.prompt, null);
  assert.equal(state.activeP, p);

  // Re-enter prompt, discard once, then cancel should be rejected.
  ctx.PD.engine.applyCommand(state, { kind: "endTurn" });
  assert.ok(state.prompt && state.prompt.kind === "discardDown");

  const mv = ctx.PD.engine.legalMoves(state).find((m) => m.kind === "discard");
  assert.ok(mv, "expected discard move");
  ctx.PD.engine.applyCommand(state, mv);

  assert.throws(() => ctx.PD.engine.applyCommand(state, { kind: "cancelPrompt" }));
});

test("drawToHand reshuffles discard into deck when needed (continues drawing)", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.state.newGame({ seedU32: 1 });
  const p = state.activeP;

  // Move almost the entire deck into discard so a draw must reshuffle.
  while (state.deck.length > 1) state.discard.push(state.deck.shift());
  assert.equal(state.deck.length, 1);
  assert.ok(state.discard.length > 0);

  const before = state.players[p].hand.length;
  const events = [];
  ctx.PD.state.drawToHand(state, p, 5, events);

  assert.equal(state.players[p].hand.length, before + 5);
  assert.equal(state.discard.length, 0, "expected discard to be consumed into deck during reshuffle");
  assert.ok(events.some((e) => e && e.kind === "reshuffle"), "expected reshuffle event");
});

test("drawToHand draws partially when the deck is short (no throw)", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.state.newGame({ scenarioId: "placeBasic", seedU32: 1 });
  const p0 = state.activeP;
  const p1 = p0 ^ 1;

  // Make the deck very small *and* keep discard empty so the draw is forced to be partial.
  // (Phase 05b reshuffles discard into deck when available.)
  while (state.deck.length > 2) state.players[p0].bank.push(state.deck.shift());
  state.discard = [];

  const before = state.players[p1].hand.length; // 0 in this scenario
  const res = ctx.PD.engine.applyCommand(state, { kind: "endTurn" });

  assert.equal(state.activeP, p1);
  assert.equal(state.players[p1].hand.length, before + 2);

  const drawEv = res.events.find((e) => e.kind === "draw");
  assert.ok(drawEv, "expected draw event");
  assert.equal(drawEv.uids.length, 2);
});

test("winCheck scenario: evaluateWin detects winner", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.state.newGame({ scenarioId: "winCheck", seedU32: 1 });
  assert.equal(ctx.PD.rules.evaluateWin(state), 0);
  assert.equal(state.winnerP, 0);
});

test("legalMoves only returns commands that applyCommand accepts", async () => {
  const ctx = await loadSrcIntoVm();

  function cloneState(s) {
    return JSON.parse(JSON.stringify(s));
  }

  const cases = [
    { label: "default newGame", build: () => ctx.PD.state.newGame({ seedU32: 1 }) },
    { label: "scenario placeBasic", build: () => ctx.PD.state.newGame({ scenarioId: "placeBasic", seedU32: 1 }) },
    { label: "scenario wildBasic", build: () => ctx.PD.state.newGame({ scenarioId: "wildBasic", seedU32: 1 }) },
    { label: "scenario houseBasic", build: () => ctx.PD.state.newGame({ scenarioId: "houseBasic", seedU32: 1 }) },
    { label: "scenario winCheck (game over)", build: () => ctx.PD.state.newGame({ scenarioId: "winCheck", seedU32: 1 }) }
  ];

  for (const tcase of cases) {
    const state = tcase.build();
    const moves = ctx.PD.engine.legalMoves(state);
    assert.ok(Array.isArray(moves), `${tcase.label}: expected legalMoves to return an array`);

    for (const move of moves) {
      const copy = cloneState(state);
      assert.doesNotThrow(
        () => ctx.PD.engine.applyCommand(copy, move),
        `${tcase.label}: expected move kind=${move && move.kind} to be applyable`
      );
    }
  }
});

test("Phase 06: prompt actor is prompt.p (can act even if activeP differs)", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.state.newGame({ scenarioId: "debtHouseFirst", seedU32: 1 });

  // Force mismatch: prompt actor is P0, but active turn is P1.
  assert.ok(state.prompt && state.prompt.kind === "payDebt");
  assert.equal(state.prompt.p, 0);
  state.activeP = 1;

  const moves = ctx.PD.engine.legalMoves(state);
  assert.ok(moves.length > 0, "expected payDebt moves");
  assert.ok(moves.every((m) => m.kind === "payDebt"), "expected only payDebt moves during payDebt prompt");

  // Applying a legal prompt move should succeed even though activeP is different.
  const mv = moves[0];
  assert.doesNotThrow(() => ctx.PD.engine.applyCommand(state, mv));
});

test("Phase 06: house-pay-first enforced (cannot pay property from housed set)", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.state.newGame({ scenarioId: "debtHouseFirst", seedU32: 1 });

  const set0 = state.players[0].sets[0];
  assert.ok(set0.houseUid, "expected housed set");
  const propUid = set0.props[0][0];

  // Engine rejects paying a property from the housed set.
  assert.throws(() => {
    ctx.PD.engine.applyCommand(state, {
      kind: "payDebt",
      card: { uid: propUid, loc: { p: 0, zone: "setProps", setI: 0, i: 0 } }
    });
  }, /house_pay_first/);
});

test("Phase 06: paying house can overpay and resolves debt; house goes to recipient bank", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.state.newGame({ scenarioId: "debtHouseFirst", seedU32: 1 });

  const before = state.players[1].bank.length;
  const houseUid = state.players[0].sets[0].houseUid;
  assert.ok(houseUid, "expected house uid");

  // Pay with the house.
  const res = ctx.PD.engine.applyCommand(state, {
    kind: "payDebt",
    card: { uid: houseUid, loc: { p: 0, zone: "setHouse", setI: 0 } }
  });

  assert.ok(res.events.some((e) => e.kind === "payDebt"), "expected payDebt event");
  assert.equal(state.players[0].sets[0].houseUid, 0, "expected house removed from set");
  assert.equal(state.players[1].bank.length, before + 1, "expected house transferred to bank");
  assert.equal(state.players[1].bank[state.players[1].bank.length - 1], houseUid);
  assert.equal(state.prompt, null, "expected prompt cleared (no properties received)");
});

test("Phase 06: placeReceived allows placing from recvProps without consuming plays", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.state.newGame({ scenarioId: "placeReceived", seedU32: 1 });
  assert.ok(state.prompt && state.prompt.kind === "placeReceived");
  assert.equal(state.prompt.p, 0);

  const playsBefore = state.playsLeft;
  const mv = ctx.PD.engine.legalMoves(state).find((m) => m.kind === "playProp" && m.card && m.card.loc && m.card.loc.zone === "recvProps");
  assert.ok(mv, "expected a playProp move from recvProps");

  ctx.PD.engine.applyCommand(state, mv);
  assert.equal(state.playsLeft, playsBefore, "expected playsLeft unchanged during placement prompt");
});

test("Rent: playRent discards rent card, decrements plays, and creates payDebt prompt for opponent (when payable)", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.state.newGame({ scenarioId: "placeBasic", seedU32: 1 });

  // Find rent card uid in active hand.
  const rents = findUidsInHandByDefId(ctx, state, "rent_mo");
  assert.equal(rents.length, 1);
  const uid = rents[0];

  const moves = ctx.PD.engine.legalMoves(state);
  const mv = moves.find((m) => m.kind === "playRent" && m.card && m.card.uid === uid);
  assert.ok(mv, "expected a playRent move");

  const playsBefore = state.playsLeft;
  const handBefore = state.players[0].hand.length;
  const discBefore = state.discard.length;

  ctx.PD.engine.applyCommand(state, mv);

  assert.equal(state.playsLeft, playsBefore - 1);
  assert.equal(state.players[0].hand.length, handBefore - 1, "expected rent card removed from hand");
  assert.equal(state.discard.length, discBefore + 1, "expected rent card discarded");
  assert.ok(state.prompt && state.prompt.kind === "payDebt", "expected debt prompt to begin");
  assert.equal(state.prompt.p, 1, "expected opponent to be payer");
  assert.equal(state.prompt.toP, 0, "expected active player to be payee");
  assert.equal(typeof state.prompt.rem, "number", "expected numeric remaining rent");
  assert.ok(Number.isFinite(state.prompt.rem), "expected finite remaining rent");
  assert.ok(Number.isInteger(state.prompt.rem), "expected integer remaining rent");
  assert.ok(state.prompt.rem > 0, "expected positive remaining rent");
});

