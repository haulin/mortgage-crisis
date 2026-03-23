import test from "node:test";
import assert from "node:assert/strict";
import { loadSrcIntoVm } from "./helpers/loadSrcIntoVm.mjs";

test("src bundle loads and exposes PD + TIC", async () => {
  const context = await loadSrcIntoVm();

  assert.equal(typeof context.PD, "object");
  assert.equal(typeof context.PD.mainTick, "function");
  assert.equal(typeof context.TIC, "function");
  assert.equal(typeof context.PD.bootTick, "undefined");

  // Phase 05c+: animation module should always exist (avoid defensive checks in cartridge code).
  assert.equal(typeof context.PD.anim, "object");
  assert.equal(typeof context.PD.anim.present, "function");
  assert.equal(typeof context.PD.anim.tick, "function");
  assert.equal(typeof context.PD.anim.onEvents, "function");
  assert.equal(typeof context.PD.anim.feedbackTick, "function");
  assert.equal(typeof context.PD.anim.feedbackError, "function");

  // Core modules should always exist (avoid PD.* existence checks in cartridge code).
  assert.equal(typeof context.PD.ui, "object");
  assert.equal(typeof context.PD.ui.newView, "function");
  assert.equal(typeof context.PD.ui.computeRowModels, "function");
  assert.equal(typeof context.PD.ui.step, "function");

  assert.equal(typeof context.PD.controls, "object");
  assert.equal(typeof context.PD.controls.newState, "function");
  assert.equal(typeof context.PD.controls.pollGlobals, "function");
  assert.equal(typeof context.PD.controls.actions, "function");

  assert.equal(typeof context.PD.render, "object");
  assert.equal(typeof context.PD.render.drawFrame, "function");
});

