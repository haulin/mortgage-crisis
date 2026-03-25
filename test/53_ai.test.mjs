import test from "node:test";
import assert from "node:assert/strict";
import { loadSrcIntoVm } from "./helpers/loadSrcIntoVm.mjs";

test("ai: actor uses prompt.p when prompting, else activeP", async () => {
  const ctx = await loadSrcIntoVm();
  const { PD } = ctx;

  assert.equal(PD.ai.actor({ activeP: 1, prompt: null }), 1);
  assert.equal(PD.ai.actor({ activeP: 0, prompt: { p: 1, kind: "payDebt" } }), 1);
});

test("ai: pickRandomLegalMove returns null for no moves", async () => {
  const ctx = await loadSrcIntoVm();
  const { PD } = ctx;

  // A tiny fake state where legalMoves can be stubbed.
  const saved = PD.legalMoves;
  PD.legalMoves = () => [];
  try {
    assert.equal(PD.ai.pickRandomLegalMove({ seed: 1 }), null);
  } finally {
    PD.legalMoves = saved;
  }
});

test("ai: describeCmd is stable for common cmd kinds", async () => {
  const ctx = await loadSrcIntoVm();
  const { PD } = ctx;

  const saved = PD.fmt.destLabelForCmd;
  try {
    PD.fmt.destLabelForCmd = () => "Bank";

    assert.equal(PD.ai.describeCmd({}, { kind: "endTurn" }), "Opponent: End turn");
    assert.equal(PD.ai.describeCmd({}, { kind: "bank" }), "Opponent: Bank");
    assert.equal(PD.ai.describeCmd({}, { kind: "playRent" }), "Opponent: Rent");
    assert.equal(PD.ai.describeCmd({}, { kind: "playHouse" }), "Opponent: Build");
    assert.equal(PD.ai.describeCmd({}, { kind: "payDebt" }), "Opponent: Pay");
    assert.equal(PD.ai.describeCmd({}, { kind: "discard" }), "Opponent: Discard");
    assert.equal(PD.ai.describeCmd({}, { kind: "cancelPrompt" }), "Opponent: Cancel");
    assert.equal(PD.ai.describeCmd({}, { kind: "playProp" }), "Opponent: Place -> Bank");

    PD.fmt.destLabelForCmd = () => "";
    assert.equal(PD.ai.describeCmd({}, { kind: "playProp" }), "Opponent: Place");

    assert.equal(PD.ai.describeCmd({}, { kind: "someFutureCmd" }), "Opponent: someFutureCmd");
  } finally {
    PD.fmt.destLabelForCmd = saved;
  }
});

