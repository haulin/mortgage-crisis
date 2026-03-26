import test from "node:test";
import assert from "node:assert/strict";
import { loadSrcIntoVm } from "./helpers/loadSrcIntoVm.mjs";

test("ui.newView returns canonical view shape (no runtime fallbacks)", async () => {
  const ctx = await loadSrcIntoVm();
  const v = ctx.PD.ui.newView();

  assert.ok(v);
  assert.ok(v.cursor);
  assert.equal(typeof v.cursor.row, "number");
  assert.equal(typeof v.cursor.i, "number");

  assert.ok(Array.isArray(v.camX));
  assert.equal(v.camX.length, 5);
  for (let i = 0; i < 5; i++) assert.equal(v.camX[i], 0);

  assert.ok(v.menu);
  assert.ok(Array.isArray(v.menu.items));
  assert.equal(typeof v.menu.i, "number");

  assert.ok(v.targeting);
  assert.ok(Array.isArray(v.targeting.cmds));
  assert.equal(typeof v.targeting.cmdI, "number");

  assert.ok(v.anim);
  assert.ok(Array.isArray(v.anim.q));
  assert.ok(Object.prototype.toString.call(v.anim.hiddenByP) === "[object Array]");
  assert.equal(v.anim.hiddenByP.length, 2);
  assert.equal(typeof v.anim.hiddenByP[0], "object");
  assert.equal(typeof v.anim.hiddenByP[1], "object");
});

test("ui: toast contract - push replaces by id, tick decrements frames", async () => {
  const ctx = await loadSrcIntoVm();
  const v = ctx.PD.ui.newView();

  ctx.PD.ui.toastPush(v, { id: "t1", kind: "info", text: "Hello", frames: 2, persistent: false });
  assert.equal(v.toasts.length, 1);
  assert.equal(v.toasts[0].id, "t1");
  assert.equal(v.toasts[0].frames, 2);

  // Replace by id.
  ctx.PD.ui.toastPush(v, { id: "t1", kind: "info", text: "Hello2", frames: 3, persistent: false });
  assert.equal(v.toasts.length, 1);
  assert.equal(v.toasts[0].text, "Hello2");
  assert.equal(v.toasts[0].frames, 3);

  // Tick decrements frames and drops at 0.
  ctx.PD.ui.toastsTick(v);
  assert.equal(v.toasts.length, 1);
  assert.equal(v.toasts[0].frames, 2);
  ctx.PD.ui.toastsTick(v);
  assert.equal(v.toasts.length, 1);
  assert.equal(v.toasts[0].frames, 1);
  ctx.PD.ui.toastsTick(v);
  assert.equal(v.toasts.length, 0);
});

test("ui: syncPromptToast inserts/removes persistent prompt toast", async () => {
  const ctx = await loadSrcIntoVm();
  const s = ctx.PD.newGame({ seedU32: 1 });
  const v = ctx.PD.ui.newView();

  // No prompt -> no toast.
  ctx.PD.ui.syncPromptToast(s, v);
  assert.equal(v.toasts.length, 0);

  // Add a prompt and sync -> prompt toast at top.
  ctx.PD.setPrompt(s, { kind: "payDebt", p: 0, toP: 1, rem: 7, buf: [] });
  ctx.PD.ui.syncPromptToast(s, v);
  assert.ok(v.toasts.length >= 1);
  assert.equal(v.toasts[0].id, "prompt");
  assert.equal(v.toasts[0].persistent, true);
  assert.ok(String(v.toasts[0].text).includes("$7"));

  // Clear prompt -> toast removed.
  ctx.PD.clearPrompt(s);
  ctx.PD.ui.syncPromptToast(s, v);
  assert.ok(v.toasts.every((t) => t.id !== "prompt"));
});

test("ui: view numeric invariants stay finite across flows", async () => {
  const ctx = await loadSrcIntoVm();
  const s = ctx.PD.newGame({ seedU32: 1 });
  s.activeP = 0;
  s.playsLeft = 3;
  const v = ctx.PD.ui.newView();

  const assertFiniteInt = (label, n) => {
    assert.equal(typeof n, "number", `${label} should be a number`);
    assert.ok(Number.isFinite(n), `${label} should be finite`);
    assert.ok(Number.isInteger(n), `${label} should be an integer`);
  };

  // Initial view invariants.
  assertFiniteInt("cursor.row", v.cursor.row);
  assertFiniteInt("cursor.i", v.cursor.i);
  assertFiniteInt("menu.i", v.menu.i);
  assertFiniteInt("targeting.cmdI", v.targeting.cmdI);

  // Compute models + camera updates should preserve numeric fields.
  let computed = ctx.PD.ui.computeRowModels(s, v);
  ctx.PD.ui.updateCameras(s, v, computed);
  computed = ctx.PD.ui.computeRowModels(s, v);

  assertFiniteInt("cursor.row(postCompute)", v.cursor.row);
  assertFiniteInt("cursor.i(postCompute)", v.cursor.i);

  // Open a menu on a real hand card (menu requires sel.loc.zone hand/recvProps).
  const rmHand = computed.models[ctx.PD.render.ROW_P_HAND];
  const handSel = rmHand && rmHand.items && rmHand.items.find((it) => it && it.kind === "hand" && it.loc && it.loc.zone === "hand" && it.loc.p === 0);
  assert.ok(handSel, "expected at least 1 hand card in row model");
  ctx.PD.ui.cursorMoveTo(v, { row: handSel.row, i: handSel.depth, item: handSel });
  computed = ctx.PD.ui.computeRowModels(s, v);
  const sel = computed.selected;
  assert.ok(sel && sel.loc && sel.loc.zone === "hand", "expected hand selection");
  ctx.PD.ui.menuOpenForSelection(s, v, sel);
  if (v.menu.items && v.menu.items.length > 0) v.mode = "menu";
  assert.equal(v.mode, "menu");
  assertFiniteInt("menu.i(postMenuOpen)", v.menu.i);
  computed = ctx.PD.ui.computeRowModels(s, v);
  assert.ok(computed && computed.models, "expected computed models");

  // Force targeting via API and check cmdI stays canonical.
  ctx.PD.ui.targetingEnter(s, v, "bank", false, sel.uid, sel.loc);
  assert.equal(v.mode, "targeting");
  assert.ok(v.targeting.active);
  assertFiniteInt("targeting.cmdI(postEnter)", v.targeting.cmdI);
  computed = ctx.PD.ui.computeRowModels(s, v);
  assertFiniteInt("targeting.cmdI(postCompute2)", v.targeting.cmdI);
});

test("focus policy: rules are well-formed (caller preconditions are tested, no runtime fallbacks)", async () => {
  const ctx = await loadSrcIntoVm();
  assert.ok(ctx.PD.ui.focus, "expected PD.ui.focus");
  assert.equal(typeof ctx.PD.ui.focus.apply, "function");
  assert.ok(Array.isArray(ctx.PD.ui.focus.rules));
  assert.ok(ctx.PD.ui.focus.rules.length > 0);

  for (const r of ctx.PD.ui.focus.rules) {
    assert.equal(typeof r.id, "string");
    assert.ok(r.id.length > 0);
    assert.equal(typeof r.enabled, "function");
    assert.equal(typeof r.when, "function");
    assert.equal(typeof r.pick, "function");
  }
});

test("ui.step calls focus.apply with canonical args", async () => {
  const ctx = await loadSrcIntoVm();
  const s = ctx.PD.newGame({ seedU32: 1 });
  const v = ctx.PD.ui.newView();

  let called = false;
  const orig = ctx.PD.ui.focus.apply;
  ctx.PD.ui.focus.apply = (state, view, computed, actions) => {
    called = true;
    assert.ok(state);
    assert.ok(view);
    assert.ok(computed);
    assert.ok(Array.isArray(computed.models));
    assert.equal(computed.models.length, 5);
    assert.ok(actions && typeof actions === "object");
    return orig(state, view, computed, actions);
  };

  ctx.PD.ui.step(s, v, { nav: {}, a: {}, b: {}, x: {} });
  assert.ok(called, "expected focus.apply to be called");
});

