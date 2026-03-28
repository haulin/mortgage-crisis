import test from "node:test";
import assert from "node:assert/strict";
import { loadSrcIntoVm } from "./helpers/loadSrcIntoVm.mjs";

test("ai: actor uses prompt.p when prompting, else activeP", async () => {
  const ctx = await loadSrcIntoVm();
  const { MC } = ctx;

  assert.equal(MC.ai.actor({ activeP: 1, prompt: null }), 1);
  assert.equal(MC.ai.actor({ activeP: 0, prompt: { p: 1, kind: "payDebt" } }), 1);
});

test("ai: configured policy ids exist in registry", async () => {
  const ctx = await loadSrcIntoVm();
  const { MC } = ctx;

  const ids = MC.config.ai.policyByP;
  assert.ok(Array.isArray(ids));
  assert.equal(ids.length, 2);
  assert.ok(MC.ai.policies && typeof MC.ai.policies === "object");
  assert.ok(MC.ai.policies.uniform, "expected uniform policy");

  assert.ok(MC.ai.policies[ids[0]], `expected policyByP[0]=${ids[0]} to exist`);
  assert.ok(MC.ai.policies[ids[1]], `expected policyByP[1]=${ids[1]} to exist`);
});

test("ai: pickRandomLegalMove returns null for no moves", async () => {
  const ctx = await loadSrcIntoVm();
  const { MC } = ctx;

  // A tiny fake state where legalMoves can be stubbed.
  const saved = MC.engine.legalMoves;
  MC.engine.legalMoves = () => [];
  try {
    assert.equal(MC.ai.pickRandomLegalMove({ seed: 1 }), null);
  } finally {
    MC.engine.legalMoves = saved;
  }
});

test("ai: describeCmd is stable for common cmd kinds", async () => {
  const ctx = await loadSrcIntoVm();
  const { MC } = ctx;

  const saved = MC.fmt.destLabelForCmd;
  try {
    MC.fmt.destLabelForCmd = () => "Bank";

    assert.equal(MC.ai.describeCmd({}, { kind: "endTurn" }), "AI: End turn");
    assert.equal(MC.ai.describeCmd({}, { kind: "bank" }), "AI: Bank");
    assert.equal(MC.ai.describeCmd({}, { kind: "playRent" }), "AI: Rent");
    assert.equal(MC.ai.describeCmd({}, { kind: "playHouse" }), "AI: Build");
    assert.equal(MC.ai.describeCmd({}, { kind: "payDebt" }), "AI: Pay");
    assert.equal(MC.ai.describeCmd({}, { kind: "discard" }), "AI: Discard");
    assert.equal(MC.ai.describeCmd({}, { kind: "cancelPrompt" }), "AI: Cancel");
    assert.equal(MC.ai.describeCmd({}, { kind: "playProp" }), "AI: Place -> Bank");

    MC.fmt.destLabelForCmd = () => "";
    assert.equal(MC.ai.describeCmd({}, { kind: "playProp" }), "AI: Place");

    assert.equal(MC.ai.describeCmd({}, { kind: "someFutureCmd" }), "AI: someFutureCmd");
  } finally {
    MC.fmt.destLabelForCmd = saved;
  }
});

