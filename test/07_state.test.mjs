import test from "node:test";
import assert from "node:assert/strict";
import { loadSrcIntoVm } from "./helpers/loadSrcIntoVm.mjs";

function defIdOfUid(ctx, state, uid) {
  const di = state.uidToDefI[uid];
  return ctx.PD.CARD_DEFS[di].id;
}

function collectAllUids(state) {
  const out = [];
  const pushAll = (arr) => {
    for (const v of arr) out.push(v);
  };

  pushAll(state.deck);
  pushAll(state.discard);
  for (const pl of state.players) {
    pushAll(pl.hand);
    pushAll(pl.bank);
    for (const set of pl.sets) {
      for (const [uid] of set.props) out.push(uid);
      if (set.houseUid) out.push(set.houseUid);
    }
  }
  return out;
}

function assertStateInvariants(ctx, state) {
  assert.equal(state.totalUids, 35);

  const all = collectAllUids(state);
  assert.equal(all.length, 35, "every uid should live in exactly one place");

  const seen = new Set();
  for (const uid of all) {
    assert.ok(uid >= 1 && uid <= state.totalUids, `uid out of range: ${uid}`);
    assert.ok(!seen.has(uid), `duplicate uid found: ${uid}`);
    seen.add(uid);
  }

  // Sets must be single-color in practice; derived via first entry.
  for (const pl of state.players) {
    for (const set of pl.sets) {
      if (set.props.length === 0) continue;
      const c = set.props[0][1];
      for (const [, color] of set.props) assert.equal(color, c, "mixed-color set detected");
    }
  }
}

test("newGame expands correct deck composition (defId counts) + invariants", async () => {
  const ctx = await loadSrcIntoVm();
  const state = ctx.PD.newGame({ seedU32: 1001 });

  assertStateInvariants(ctx, state);

  const counts = new Map();
  for (let uid = 1; uid <= state.totalUids; uid++) {
    const id = defIdOfUid(ctx, state, uid);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const expected = {
    money_1: 3,
    money_2: 3,
    money_3: 2,
    money_4: 1,
    money_5: 1,
    prop_cyan: 2,
    prop_magenta: 3,
    prop_orange: 3,
    prop_black: 4,
    wild_mo: 1,
    wild_cb: 1,
    house: 2,
    rent_mo: 2,
    rent_cb: 2,
    rent_any: 1,
    sly_deal: 2,
    just_say_no: 2
  };

  for (const [id, n] of Object.entries(expected)) {
    assert.equal(counts.get(id), n, `count mismatch for ${id}`);
  }
});

test("newGame is deterministic for same seed", async () => {
  const ctx = await loadSrcIntoVm();
  const a = ctx.PD.newGame({ seedU32: 424242 });
  const b = ctx.PD.newGame({ seedU32: 424242 });

  assert.deepEqual(a.deck, b.deck);
  assert.deepEqual(a.players[0].hand, b.players[0].hand);
  assert.deepEqual(a.players[1].hand, b.players[1].hand);
  assert.equal(a.activeP, b.activeP);
  assert.equal(a.playsLeft, b.playsLeft);
});

test("newGame deals 5 each and draws 2 for the starting player", async () => {
  const ctx = await loadSrcIntoVm();
  const s = ctx.PD.newGame({ seedU32: 1 });
  const p = s.activeP;
  const o = p ^ 1;

  assert.equal(s.players[p].hand.length, 7);
  assert.equal(s.players[o].hand.length, 5);
  assert.equal(s.deck.length, 23);
  assert.equal(s.playsLeft, 3);
});

