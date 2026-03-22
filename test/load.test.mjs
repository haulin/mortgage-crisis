import test from "node:test";
import assert from "node:assert/strict";
import { loadSrcIntoVm } from "./helpers/loadSrcIntoVm.mjs";

test("src bundle loads and exposes PD + TIC", async () => {
  const context = await loadSrcIntoVm();

  assert.equal(typeof context.PD, "object");
  assert.equal(typeof context.PD.mainTick, "function");
  assert.equal(typeof context.TIC, "function");
  assert.equal(typeof context.PD.bootTick, "undefined");
});

