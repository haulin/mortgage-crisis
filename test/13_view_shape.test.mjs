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

