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

test("placeFixed scenario: can play property to new set and existing set; playsLeft decrements", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.newGame({ scenarioId: "placeFixed", seedU32: 1 });
  assert.equal(state.activeP, 0);
  assert.equal(state.players[0].sets.length, 1);

  const [u1, u2] = findUidsInHandByDefId(ctx, state, "prop_orange");
  assert.ok(u1 && u2, "expected 2 orange properties in hand");

  // Play first orange to a new set.
  let res = ctx.PD.applyCommand(state, {
    kind: "playProp",
    card: cardRefInActiveHand(state, u1),
    dest: { newSet: true }
  });
  assert.ok(res.events.some((e) => e.kind === "createSet"));
  assert.equal(state.players[0].sets.length, 2);
  assert.equal(state.playsLeft, 2);

  // Play second orange into the original set (setI=0).
  res = ctx.PD.applyCommand(state, {
    kind: "playProp",
    card: cardRefInActiveHand(state, u2),
    dest: { setI: 0 }
  });
  assert.equal(state.players[0].sets[0].props.length, 2);
  assert.equal(state.playsLeft, 1);
});

test("bank command moves bankable card from hand to bank and decrements playsLeft", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.newGame({ scenarioId: "placeFixed", seedU32: 1 });
  const [m1] = findUidsInHandByDefId(ctx, state, "money_1");
  assert.ok(m1, "expected money_1 in hand");

  const beforeHand = state.players[0].hand.length;
  const beforeBank = state.players[0].bank.length;

  ctx.PD.applyCommand(state, { kind: "bank", card: cardRefInActiveHand(state, m1) });

  assert.equal(state.players[0].hand.length, beforeHand - 1);
  assert.equal(state.players[0].bank.length, beforeBank + 1);
  assert.equal(state.playsLeft, 2);
});

test("placeWild scenario: can play wild with chosen color; illegal color throws", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.newGame({ scenarioId: "placeWild", seedU32: 1 });
  const [w] = findUidsInHandByDefId(ctx, state, "wild_mo");
  assert.ok(w, "expected wild_mo in hand");

  // Legal: choose Orange and start new set.
  ctx.PD.applyCommand(state, {
    kind: "playProp",
    card: cardRefInActiveHand(state, w),
    dest: { newSet: true },
    color: ctx.PD.Color.Orange
  });
  assert.equal(state.players[0].sets.length, 1);
  assert.equal(state.players[0].sets[0].props[0][1], ctx.PD.Color.Orange);

  // Fresh scenario for illegal test.
  const state2 = ctx.PD.newGame({ scenarioId: "placeWild", seedU32: 1 });
  const [w2] = findUidsInHandByDefId(ctx, state2, "wild_mo");
  assert.throws(() => {
    ctx.PD.applyCommand(state2, {
      kind: "playProp",
      card: cardRefInActiveHand(state2, w2),
      dest: { newSet: true },
      color: ctx.PD.Color.Cyan
    });
  });
});

test("houseOnComplete scenario: house allowed on complete set only; max 1 house per set", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.newGame({ scenarioId: "houseOnComplete", seedU32: 1 });
  const houses = findUidsInHandByDefId(ctx, state, "house");
  assert.equal(houses.length, 2);

  // setI=0 is complete Cyan, setI=1 is incomplete Black.
  ctx.PD.applyCommand(state, {
    kind: "playHouse",
    card: cardRefInActiveHand(state, houses[0]),
    dest: { setI: 0 }
  });
  assert.ok(state.players[0].sets[0].houseUid);

  // Second house onto same set should throw.
  assert.throws(() => {
    ctx.PD.applyCommand(state, {
      kind: "playHouse",
      card: cardRefInActiveHand(state, houses[1]),
      dest: { setI: 0 }
    });
  });

  // New scenario: house onto incomplete set throws.
  const state2 = ctx.PD.newGame({ scenarioId: "houseOnComplete", seedU32: 1 });
  const [h] = findUidsInHandByDefId(ctx, state2, "house");
  assert.throws(() => {
    ctx.PD.applyCommand(state2, {
      kind: "playHouse",
      card: cardRefInActiveHand(state2, h),
      dest: { setI: 1 }
    });
  });
});

test("endTurn swaps active player, draws 2, resets playsLeft", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.newGame({ scenarioId: "placeFixed", seedU32: 1 });
  const p0 = state.activeP;
  const p1 = p0 ^ 1;

  const before = state.players[p1].hand.length;
  const res = ctx.PD.applyCommand(state, { kind: "endTurn" });

  assert.equal(state.activeP, p1);
  assert.equal(state.players[p1].hand.length, before + 2);
  assert.equal(state.playsLeft, 3);
  assert.ok(res.events.some((e) => e.kind === "draw"));
});

test("winCheck scenario: evaluateWin detects winner", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.newGame({ scenarioId: "winCheck", seedU32: 1 });
  assert.equal(ctx.PD.evaluateWin(state), 0);
  assert.equal(state.winnerP, 0);
});

