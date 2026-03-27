import test from "node:test";
import assert from "node:assert/strict";
import { loadSrcIntoVm } from "./helpers/loadSrcIntoVm.mjs";

function assertPromptShape(ctx, pr) {
  assert.ok(pr && typeof pr === "object", "expected prompt object");
  assert.equal(typeof pr.kind, "string", "expected prompt.kind string");
  assert.ok(pr.kind.length > 0, "expected prompt.kind non-empty");
  assert.ok(pr.p === 0 || pr.p === 1, "expected prompt.p to be 0 or 1");

  if (pr.kind === "discardDown") {
    assert.equal(typeof pr.nDiscarded, "number");
    assert.ok(Number.isFinite(pr.nDiscarded));
    assert.ok(Number.isInteger(pr.nDiscarded));
    assert.ok(pr.nDiscarded >= 0);
    return;
  }

  if (pr.kind === "payDebt") {
    assert.ok(pr.toP === 0 || pr.toP === 1, "expected prompt.toP to be 0 or 1");
    assert.equal(typeof pr.rem, "number");
    assert.ok(Number.isFinite(pr.rem));
    assert.ok(Number.isInteger(pr.rem));
    assert.ok(Array.isArray(pr.buf), "expected prompt.buf array");
    return;
  }

  if (pr.kind === "placeReceived") {
    assert.ok(Array.isArray(pr.uids), "expected prompt.uids array");
    return;
  }

  assert.fail(`unexpected prompt kind: ${pr.kind}`);
}

test("setPrompt creates canonical prompt shapes and clones arrays", async () => {
  const ctx = await loadSrcIntoVm();
  const s = ctx.PD.state.newGame({ seedU32: 1 });

  // discardDown
  ctx.PD.state.setPrompt(s, { kind: "discardDown", p: 0 });
  assertPromptShape(ctx, s.prompt);
  assert.equal(s.prompt.kind, "discardDown");
  assert.equal(s.prompt.p, 0);
  assert.equal(s.prompt.nDiscarded, 0);

  // payDebt clones buf
  const buf = [1, 2, 3];
  ctx.PD.state.setPrompt(s, { kind: "payDebt", p: 1, toP: 0, rem: 7, buf });
  assertPromptShape(ctx, s.prompt);
  assert.equal(s.prompt.kind, "payDebt");
  assert.notEqual(s.prompt.buf, buf, "expected buf to be cloned");
  assert.deepEqual(s.prompt.buf, buf);
  assert.equal(s.prompt.rem, 7);

  // placeReceived clones uids
  const uids = [10, 11];
  ctx.PD.state.setPrompt(s, { kind: "placeReceived", p: 0, uids });
  assertPromptShape(ctx, s.prompt);
  assert.equal(s.prompt.kind, "placeReceived");
  assert.notEqual(s.prompt.uids, uids, "expected uids to be cloned");
  assert.deepEqual(s.prompt.uids, uids);
});

test("setPrompt throws on unknown prompt kind", async () => {
  const ctx = await loadSrcIntoVm();
  const s = ctx.PD.state.newGame({ seedU32: 1 });
  assert.throws(() => ctx.PD.state.setPrompt(s, { kind: "nope", p: 0 }));
});

test("engine-created prompts always satisfy prompt shape contract", async () => {
  const ctx = await loadSrcIntoVm();

  // discardDown via endTurn attempt when hand > 7
  {
    const s = ctx.PD.state.newGame({ seedU32: 1 });
    const p = s.activeP;
    s.players[p].hand.push(s.deck.pop());
    ctx.PD.engine.applyCommand(s, { kind: "endTurn" });
    assert.ok(s.prompt);
    assertPromptShape(ctx, s.prompt);
    assert.equal(s.prompt.kind, "discardDown");
  }

  // payDebt + placeReceived via scenarios (Phase 06)
  {
    const s = ctx.PD.state.newGame({ scenarioId: "debtHouseFirst", seedU32: 1 });
    assert.ok(s.prompt);
    assertPromptShape(ctx, s.prompt);
    assert.equal(s.prompt.kind, "payDebt");
    assert.equal(s.prompt.buf.length, 0);
  }

  {
    const s = ctx.PD.state.newGame({ scenarioId: "placeReceived", seedU32: 1 });
    assert.ok(s.prompt);
    assertPromptShape(ctx, s.prompt);
    assert.equal(s.prompt.kind, "placeReceived");
    assert.ok(s.prompt.uids.length > 0);
  }
});

