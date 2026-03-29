import test from "node:test";
import assert from "node:assert/strict";
import { loadSrcIntoVm } from "./helpers/loadSrcIntoVm.mjs";

test("title: draws and any press enters DebugText", async () => {
  const printed = [];

  let anyPressed = false;
  const ctx = await loadSrcIntoVm({
    extraGlobals: {
      // Capture print calls for a basic smoke check.
      print: (s) => {
        printed.push(String(s));
      },
      // Simulate a single pressed pulse when we want it.
      btnp: (i) => {
        if (!anyPressed) return false;
        // Press A (4) for the transition check.
        return i === 4;
      },
      btn: () => 0
    }
  });

  // Boot should start in Title mode.
  assert.equal(ctx.MC._mainMode, 2);

  // First tick: should draw title (at least some expected strings).
  ctx.MC.mainTick();
  assert.ok(printed.some((s) => s.includes("MORTGAGE")), "expected title to print MORTGAGE");
  assert.ok(printed.some((s) => s.includes("New Game")), "expected title to print New Game");

  // Next tick: with a pressed pulse, should switch to DebugText (mode 0).
  anyPressed = true;
  ctx.MC.mainTick();
  assert.equal(ctx.MC._mainMode, 0);
});

