import test from "node:test";
import assert from "node:assert/strict";
import { loadSrcIntoVm } from "./helpers/loadSrcIntoVm.mjs";

function rawButtons({ downIds = [], pressedIds = [] } = {}) {
  const down = Array(8).fill(false);
  const pressed = Array(8).fill(false);
  for (const id of downIds) down[id] = true;
  for (const id of pressedIds) pressed[id] = true;
  return { down, pressed };
}

test("controls: inspect becomes active after hold delay", async () => {
  const ctx = await loadSrcIntoVm();
  const st = ctx.PD.controls.newState();

  // Hold X (id=6) for 5 frames: still inactive (default delay=6).
  for (let f = 0; f < 5; f++) {
    const raw = rawButtons({ downIds: [6], pressedIds: f === 0 ? [6] : [] });
    const a = ctx.PD.controls.actions(st, raw, ctx.PD.config.controls);
    assert.equal(a.x.inspectActive, false);
  }

  // On frame 6 it becomes active.
  {
    const raw = rawButtons({ downIds: [6] });
    const a = ctx.PD.controls.actions(st, raw, ctx.PD.config.controls);
    assert.equal(a.x.inspectActive, true);
  }
});

test("controls: A tap vs hold+move grab", async () => {
  const ctx = await loadSrcIntoVm();
  const cfg = { ...ctx.PD.config.controls, aHoldFallbackFrames: 18 };

  // Tap A: press then release without movement.
  {
    const st = ctx.PD.controls.newState();
    let a;
    a = ctx.PD.controls.actions(st, rawButtons({ downIds: [4], pressedIds: [4] }), cfg);
    assert.equal(a.a.tap, false);
    a = ctx.PD.controls.actions(st, rawButtons({ downIds: [] }), cfg);
    assert.equal(a.a.tap, true);
  }

  // Hold+move: press A, then while held press Left -> grabStart fires once, tap never fires.
  {
    const st = ctx.PD.controls.newState();
    let a;
    a = ctx.PD.controls.actions(st, rawButtons({ downIds: [4], pressedIds: [4] }), cfg);
    assert.equal(a.a.grabStart, false);

    a = ctx.PD.controls.actions(st, rawButtons({ downIds: [2, 4], pressedIds: [2] }), cfg);
    assert.equal(a.a.grabStart, true);

    a = ctx.PD.controls.actions(st, rawButtons({ downIds: [2, 4] }), cfg);
    assert.equal(a.a.grabStart, false);

    a = ctx.PD.controls.actions(st, rawButtons({ downIds: [] }), cfg);
    assert.equal(a.a.tap, false);
  }
});

test("ui: early hold-A grab does not move cursor selection", async () => {
  const ctx = await loadSrcIntoVm();

  // Build a deterministic hand with 2 known properties so we can detect drift.
  const s = ctx.PD.newGame({ scenarioId: "placeBasic", seedU32: 1 });
  s.activeP = 0;
  s.playsLeft = 3;

  function takeFromDeckByDefId(defId) {
    const uid = s.deck.find((u) => ctx.PD.defByUid(s, u).id === defId);
    assert.ok(uid, `expected ${defId} uid in deck`);
    s.deck = s.deck.filter((u) => u !== uid);
    return uid;
  }

  // Use money cards (always bankable) so grabStart reliably enters targeting.
  const uidA = takeFromDeckByDefId("money_1");
  const uidB = takeFromDeckByDefId("money_2");
  s.players[0].hand = [uidA, uidB];
  s.players[0].bank = [];
  s.players[0].sets = [];
  s.players[1].hand = [];
  s.players[1].bank = [];
  s.players[1].sets = [];

  const view = ctx.PD.ui.newView();
  view.cursor.row = ctx.PD.render.ROW_P_HAND;
  view.cursor.i = 0;

  const st = ctx.PD.controls.newState();
  const cfg = ctx.PD.config.controls;

  // Frame 1: press A (start holding).
  const a1 = ctx.PD.controls.actions(st, rawButtons({ downIds: [4], pressedIds: [4] }), cfg);
  ctx.PD.ui.step(s, view, a1);

  // Frame 2: while holding A, press Right. This should trigger grabStart,
  // but must NOT move the cursor to the right-hand card before entering targeting.
  const a2 = ctx.PD.controls.actions(st, rawButtons({ downIds: [3, 4], pressedIds: [3] }), cfg);
  ctx.PD.ui.step(s, view, a2);

  assert.equal(view.mode, "targeting");
  assert.ok(view.targeting && view.targeting.active, "expected targeting to be active");
  assert.equal(view.targeting.card.uid, uidA, "expected grabbed uid to remain the original selection");
  assert.equal(view.cursor.i, 0, "expected cursor index to remain unchanged on early-grab frame");
});

test("controls: d-pad repeat pulses after delay", async () => {
  const ctx = await loadSrcIntoVm();
  const st = ctx.PD.controls.newState();
  const cfg = { dpadRepeatDelayFrames: 3, dpadRepeatPeriodFrames: 2, aHoldFallbackFrames: 999, xInspectDelayFrames: 999 };

  // Hold Right (id=3) for 6 frames.
  const pulses = [];
  for (let f = 0; f < 6; f++) {
    const raw = rawButtons({ downIds: [3], pressedIds: f === 0 ? [3] : [] });
    const a = ctx.PD.controls.actions(st, raw, cfg);
    pulses.push(!!a.nav.right);
  }

  // Frame-by-frame expectation:
  // f0: pressed -> true
  // f1,f2: false (count < delay)
  // f3: true (first repeat)
  // f4: false
  // f5: true
  assert.deepEqual(pulses, [true, false, false, true, false, true]);
});

test("ui: findBestCursorTarget picks first match in preferred row order", async () => {
  const ctx = await loadSrcIntoVm();

  const models = [
    { items: [{ kind: "a" }] },          // row 0
    { items: [{ kind: "b" }] },          // row 1
    { items: [{ kind: "c" }, { kind: "x" }] }, // row 2
    { items: [] },                       // row 3
    { items: [{ kind: "x" }] },          // row 4
  ];

  const pick = ctx.PD.ui.findBestCursorTarget(models, [4, 2, 1], (it) => it.kind === "x");
  assert.ok(pick);
  assert.equal(pick.row, 4);
  assert.equal(pick.i, 0);
  assert.equal(pick.item.kind, "x");
});

test("ui: findBestCursorTarget returns null when no match", async () => {
  const ctx = await loadSrcIntoVm();

  const models = [
    { items: [{ kind: "a" }] },
    { items: [] },
    { items: [{ kind: "b" }] },
    { items: [] },
    { items: [] },
  ];

  const pick = ctx.PD.ui.findBestCursorTarget(models, [2, 0], (it) => it.kind === "nope");
  assert.equal(pick, null);
});

test("ui: center buttons remain visible during Inspect", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ scenarioId: "placeBasic", seedU32: 1 });
  const view = ctx.PD.ui.newView();
  view.mode = "browse";
  view.inspectActive = true;

  const c = ctx.PD.ui.computeRowModels(s, view);
  const center = c.models[ctx.PD.render.ROW_CENTER];
  assert.ok(center && center.items && center.items.length > 0, "expected center items");
  assert.ok(center.items.some((it) => it && it.kind === "btn" && it.id === "endTurn"), "expected End button during Inspect");
});

test("ui: targeting defaults to existing set when available (Place)", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ scenarioId: "placeBasic", seedU32: 1 });
  const view = ctx.PD.ui.newView();
  view.cursor.row = ctx.PD.render.ROW_P_HAND;
  view.cursor.i = 0;

  // Enter targeting via hold-A grab.
  ctx.PD.ui.step(s, view, { nav: {}, a: { grabStart: true } });

  assert.equal(view.mode, "targeting");
  assert.equal(view.targeting.kind, "place");
  assert.ok(view.targeting.cmds.length >= 2, "expected existing + newSet options");
  assert.ok(view.targeting.cmds[0].dest && view.targeting.cmds[0].dest.setI != null, "expected first option to be existing set");
});

test("ui: wild color toggles and updates cmd list", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ scenarioId: "wildBasic", seedU32: 1 });
  const view = ctx.PD.ui.newView();
  view.cursor.row = ctx.PD.render.ROW_P_HAND;
  view.cursor.i = 0;

  // Enter targeting.
  ctx.PD.ui.step(s, view, { nav: {}, a: { grabStart: true } });
  assert.equal(view.mode, "targeting");
  assert.equal(view.targeting.kind, "place");

  const def = ctx.PD.defByUid(s, view.targeting.card.uid);
  assert.ok(ctx.PD.isWildDef(def), "expected wild card");
  const c0 = def.wildColors[0];
  const c1 = def.wildColors[1];

  // Default is first color when no existing set exists.
  assert.equal(view.targeting.wildColor, c0);

  // Toggle color via Down.
  ctx.PD.ui.step(s, view, { nav: { down: true }, a: {}, b: {}, x: {} });
  assert.equal(view.targeting.wildColor, c1);
  assert.ok(view.targeting.cmds.length >= 1, "expected at least newSet option for wild");
});

test("ui: browse directional nav - Up from End picks opponent table if present", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ seedU32: 1 });
  // Give opponent a single table property; clear opponent hand so table is the only Up candidate.
  const uid = s.deck.find((u) => ctx.PD.defByUid(s, u).id === "prop_cyan");
  assert.ok(uid, "expected prop_cyan uid in deck");
  s.deck = s.deck.filter((u) => u !== uid);

  const set = ctx.PD.newEmptySet();
  set.props.push([uid, ctx.PD.Color.Cyan]);
  s.players[1].sets = [set];
  s.players[1].hand = [];
  s.players[1].bank = [];

  const view = ctx.PD.ui.newView();
  // Select center-row End button: items are [deck, discard, End, ...].
  view.cursor.row = ctx.PD.render.ROW_CENTER;
  view.cursor.i = 2;

  // Ensure cameras are initialized for directional screen-space.
  const c0 = ctx.PD.ui.computeRowModels(s, view);
  ctx.PD.ui.updateCameras(s, view, c0);

  ctx.PD.ui.step(s, view, { nav: { up: true }, a: {}, b: {}, x: {} });
  const c1 = ctx.PD.ui.computeRowModels(s, view);
  assert.equal(c1.selected.row, ctx.PD.render.ROW_OP_TABLE);
});

test("ui: browse directional nav - Up from End picks opponent hand if no table", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ seedU32: 1 });
  s.players[1].sets = [];
  // Keep exactly 1 opponent hand card to avoid ambiguity.
  const keep = s.players[1].hand[0];
  s.players[1].hand = keep ? [keep] : [];

  const view = ctx.PD.ui.newView();
  view.cursor.row = ctx.PD.render.ROW_CENTER;
  view.cursor.i = 2;

  const c0 = ctx.PD.ui.computeRowModels(s, view);
  ctx.PD.ui.updateCameras(s, view, c0);

  ctx.PD.ui.step(s, view, { nav: { up: true }, a: {}, b: {}, x: {} });
  const c1 = ctx.PD.ui.computeRowModels(s, view);
  assert.equal(c1.selected.row, ctx.PD.render.ROW_OP_HAND);
});

test("ui: browse directional nav - Left from End prefers center piles (not opponent hand)", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ seedU32: 1 });
  // Default start: opponent has 5 hand cards, no table sets.
  s.players[1].sets = [];

  const view = ctx.PD.ui.newView();
  // Select center-row End button: items are [deck, discard, End, ...].
  view.cursor.row = ctx.PD.render.ROW_CENTER;
  view.cursor.i = 2;

  const c0 = ctx.PD.ui.computeRowModels(s, view);
  ctx.PD.ui.updateCameras(s, view, c0);

  ctx.PD.ui.step(s, view, { nav: { left: true }, a: {}, b: {}, x: {} });
  const c1 = ctx.PD.ui.computeRowModels(s, view);
  assert.equal(c1.selected.row, ctx.PD.render.ROW_CENTER);
  assert.ok(c1.selected.kind === "discard" || c1.selected.kind === "deck");
});

test("ui: browse directional nav - global axis-wrap fallback triggers when no Up candidates", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ scenarioId: "placeBasic", seedU32: 1 });
  // Remove all opponent items so nothing exists above the center row.
  s.players[1].hand = [];
  s.players[1].bank = [];
  s.players[1].sets = [];

  const view = ctx.PD.ui.newView();
  view.cursor.row = ctx.PD.render.ROW_CENTER;
  view.cursor.i = 2; // End

  const c0 = ctx.PD.ui.computeRowModels(s, view);
  ctx.PD.ui.updateCameras(s, view, c0);

  ctx.PD.ui.step(s, view, { nav: { up: true }, a: {}, b: {}, x: {} });
  const c1 = ctx.PD.ui.computeRowModels(s, view);
  // Wrap should go to the bottom-most row (player hand).
  assert.equal(c1.selected.row, ctx.PD.render.ROW_P_HAND);
});

test("ui: out of plays snaps to End button (one-shot)", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ scenarioId: "placeBasic", seedU32: 1 });
  s.activeP = 0;

  const view = ctx.PD.ui.newView();
  // Start somewhere else.
  view.cursor.row = ctx.PD.render.ROW_P_HAND;
  view.cursor.i = 0;

  // Prime ux memory at playsLeft=1.
  s.playsLeft = 1;
  ctx.PD.ui.step(s, view, { nav: {}, a: {}, b: {}, x: {} });

  // Transition to 0 plays (no input): should snap to End.
  s.playsLeft = 0;
  ctx.PD.ui.step(s, view, { nav: {}, a: {}, b: {}, x: {} });

  const c = ctx.PD.ui.computeRowModels(s, view);
  assert.equal(c.selected.row, ctx.PD.render.ROW_CENTER);
  assert.equal(c.selected.kind, "btn");
  assert.equal(c.selected.id, "endTurn");
});

test("ui: discardDown prompt locks to hand and A discards a hand card", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ seedU32: 1 });
  s.activeP = 0;
  // Force discard prompt.
  ctx.PD.setPrompt(s, { kind: "discardDown", p: 0 });

  const view = ctx.PD.ui.newView();
  // Start somewhere else to prove prompt forces us into hand.
  view.cursor.row = ctx.PD.render.ROW_CENTER;
  view.cursor.i = 2;

  // First step: mode sync + cursor lock.
  const intent0 = ctx.PD.ui.step(s, view, { nav: {}, a: {}, b: {}, x: {} });
  assert.equal(intent0, null);
  assert.equal(view.mode, "prompt");

  const c0 = ctx.PD.ui.computeRowModels(s, view);
  assert.ok(c0.selected, "expected selected item in prompt mode");
  assert.equal(c0.selected.row, ctx.PD.render.ROW_P_HAND);
  assert.equal(c0.selected.kind, "hand");

  // Tap A: discard highlighted hand card.
  const intent = ctx.PD.ui.step(s, view, { nav: {}, a: { tap: true }, b: {}, x: {} });
  assert.ok(intent && intent.kind === "applyCmd", "expected applyCmd intent");
  assert.equal(intent.cmd.kind, "discard");
  assert.equal(intent.cmd.card.loc.zone, "hand");
  assert.equal(intent.cmd.card.loc.p, 0);
});

test("ui: discardDown prompt allows B to cancel before any discard", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ seedU32: 1 });
  s.activeP = 0;
  ctx.PD.setPrompt(s, { kind: "discardDown", p: 0 });

  const view = ctx.PD.ui.newView();
  // Enter prompt mode.
  ctx.PD.ui.step(s, view, { nav: {}, a: {}, b: {}, x: {} });
  assert.equal(view.mode, "prompt");

  const intent = ctx.PD.ui.step(s, view, { nav: {}, a: {}, b: { pressed: true }, x: {} });
  assert.ok(intent && intent.kind === "applyCmd");
  assert.equal(intent.cmd.kind, "cancelPrompt");
});

test("ui: discardDown prompt B after discarding gives negative feedback (no cancel)", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ seedU32: 1 });
  s.activeP = 0;
  ctx.PD.setPrompt(s, { kind: "discardDown", p: 0 });
  // Simulate a discard having already happened.
  if (s.prompt) s.prompt.nDiscarded = 1;

  const view = ctx.PD.ui.newView();
  ctx.PD.ui.step(s, view, { nav: {}, a: {}, b: {}, x: {} });
  assert.equal(view.mode, "prompt");

  const intent = ctx.PD.ui.step(s, view, { nav: {}, a: {}, b: { pressed: true }, x: {} });
  assert.equal(intent, null);
  assert.ok(view.feedback && view.feedback.blinkFrames > 0, "expected negative feedback blink");
});

test("ui: menu Place auto-applies when only one destination exists", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ scenarioId: "placeBasic", seedU32: 1 });
  s.activeP = 0;
  s.playsLeft = 3;

  // Add a property color that does not match any existing set => only New set is legal.
  const uid = s.deck.find((u) => ctx.PD.defByUid(s, u).id === "prop_cyan");
  assert.ok(uid, "expected prop_cyan uid in deck");
  s.deck = s.deck.filter((u) => u !== uid);
  s.players[0].hand.push(uid);

  const view = ctx.PD.ui.newView();
  view.cursor.row = ctx.PD.render.ROW_P_HAND;
  view.cursor.i = s.players[0].hand.length - 1;

  // Tap A to open menu, then tap A again to choose Place (only menu item).
  ctx.PD.ui.step(s, view, { nav: {}, a: { tap: true }, b: {}, x: {} });
  assert.equal(view.mode, "menu");
  assert.equal(view.menu.items.length, 2);
  assert.equal(view.menu.items[0].id, "place");
  assert.equal(view.menu.items[0].label, "Place -> New Set");
  assert.equal(view.menu.items[1].id, "source");

  const intent = ctx.PD.ui.step(s, view, { nav: {}, a: { tap: true }, b: {}, x: {} });
  assert.ok(intent && intent.kind === "applyCmd", "expected applyCmd intent");
  assert.equal(intent.cmd.kind, "playProp");
  assert.equal(view.mode, "browse");
});

test("ui: hold-A targeting includes a Source destination (release-A cancels)", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ scenarioId: "placeBasic", seedU32: 1 });
  s.activeP = 0;
  s.playsLeft = 3;

  const view = ctx.PD.ui.newView();
  view.cursor.row = ctx.PD.render.ROW_P_HAND;
  view.cursor.i = 0;

  // Enter targeting via hold-A grab.
  ctx.PD.ui.step(s, view, { nav: {}, a: { grabStart: true }, b: {}, x: {} });
  assert.equal(view.mode, "targeting");
  assert.equal(view.targeting.hold, true);
  assert.ok(view.targeting.cmds.length >= 2, "expected at least one dest + source");
  assert.equal(view.targeting.cmds.at(-1).kind, "source", "expected source as last destination");

  // Select source and release A.
  view.targeting.cmdI = view.targeting.cmds.length - 1;
  const intent = ctx.PD.ui.step(s, view, { nav: {}, a: { released: true }, b: {}, x: {} });
  assert.equal(intent, null);
  assert.equal(view.mode, "browse");
});

test("ui: menu targeting includes a Source destination (tap-A cancels)", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ scenarioId: "placeBasic", seedU32: 1 });
  s.activeP = 0;
  s.playsLeft = 3;

  const view = ctx.PD.ui.newView();
  view.cursor.row = ctx.PD.render.ROW_P_HAND;
  view.cursor.i = 0;

  // Open menu on a property.
  ctx.PD.ui.step(s, view, { nav: {}, a: { tap: true }, b: {}, x: {} });
  assert.equal(view.mode, "menu");
  assert.ok(view.menu.items.some((it) => it && it.id === "place"), "expected Place in menu");

  // Pick Place (index 0 in our current menu composition for properties).
  view.menu.i = 0;
  ctx.PD.ui.step(s, view, { nav: {}, a: { tap: true }, b: {}, x: {} });
  assert.equal(view.mode, "targeting");
  assert.equal(view.targeting.hold, false);
  assert.equal(view.targeting.kind, "place");
  assert.equal(view.targeting.cmds.at(-1).kind, "source", "expected Source destination");

  // Select source and tap A to cancel.
  view.targeting.cmdI = view.targeting.cmds.length - 1;
  const intent = ctx.PD.ui.step(s, view, { nav: {}, a: { tap: true }, b: {}, x: {} });
  assert.equal(intent, null);
  assert.equal(view.mode, "browse");
});

test("ui: winCheck scenario is navigable (cursor relocates off empty hand)", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ scenarioId: "winCheck", seedU32: 1 });
  const view = ctx.PD.ui.newView();
  // Default view cursor is player hand, which is empty in winCheck.
  assert.equal(view.cursor.row, ctx.PD.render.ROW_P_HAND);

  const c = ctx.PD.ui.computeRowModels(s, view);
  assert.ok(c.selected, "expected a selected item even when the current row is empty");
  // winCheck gives P0 multiple table stacks; selection should relocate to something selectable.
  assert.notEqual(c.selected.row, ctx.PD.render.ROW_P_HAND);
});

test("ui: pressing disabled End (opponent turn) gives feedback + moves to Step", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ seedU32: 1 });
  s.activeP = 1;
  s.playsLeft = 3;
  // Keep P0 hand under limit so "disabled" is strictly opponent-turn.
  s.players[0].hand = (s.players[0].hand || []).slice(0, ctx.PD.HAND_MAX);

  const view = ctx.PD.ui.newView();
  view.cursor.row = ctx.PD.render.ROW_CENTER;
  view.cursor.i = 2; // End

  const intent = ctx.PD.ui.step(s, view, { nav: {}, a: { tap: true }, b: {}, x: {} });
  assert.equal(intent, null);
  assert.ok(view.feedback && view.feedback.blinkFrames > 0, "expected negative feedback blink");

  const c = ctx.PD.ui.computeRowModels(s, view);
  assert.equal(c.selected.row, ctx.PD.render.ROW_CENTER);
  assert.equal(c.selected.kind, "btn");
  assert.equal(c.selected.id, "step");
});

test("ui: bank targeting produces a preview in the bank stack row", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ seedU32: 1 });
  // Force a simple state: one money card in hand, empty bank/sets.
  const moneyUid = ctx.PD.takeUid(s, "money_1");
  assert.ok(moneyUid, "expected money_1 uid");
  // Remove uid from any zone it might already be in.
  s.deck = s.deck.filter((u) => u !== moneyUid);
  s.discard = s.discard.filter((u) => u !== moneyUid);
  for (let p = 0; p < 2; p++) {
    s.players[p].hand = s.players[p].hand.filter((u) => u !== moneyUid);
    s.players[p].bank = s.players[p].bank.filter((u) => u !== moneyUid);
    for (const set of (s.players[p].sets || [])) {
      if (!set) continue;
      if (set.props) set.props = set.props.filter(([u]) => u !== moneyUid);
      if (set.houseUid === moneyUid) set.houseUid = 0;
    }
  }
  s.players[0].hand = [moneyUid];
  s.players[0].bank = [];
  s.players[0].sets = [];
  s.activeP = 0;
  s.playsLeft = 3;

  const view = ctx.PD.ui.newView();
  view.cursor.row = ctx.PD.render.ROW_P_HAND;
  view.cursor.i = 0;

  ctx.PD.ui.step(s, view, { nav: {}, a: { grabStart: true }, b: {}, x: {} });
  assert.equal(view.mode, "targeting");
  assert.equal(view.targeting.kind, "bank");

  const c = ctx.PD.ui.computeRowModels(s, view);
  assert.ok(c.preview, "expected preview for bank targeting");
  assert.equal(c.preview.row, ctx.PD.render.ROW_P_HAND);
});

test("ui: menu hover Bank produces a preview when unambiguous", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ seedU32: 1 });
  const moneyUid = ctx.PD.takeUid(s, "money_1");
  assert.ok(moneyUid, "expected money_1 uid");
  // Force a simple state: one money card in hand, empty bank/sets.
  s.deck = s.deck.filter((u) => u !== moneyUid);
  s.discard = s.discard.filter((u) => u !== moneyUid);
  for (let p = 0; p < 2; p++) {
    s.players[p].hand = s.players[p].hand.filter((u) => u !== moneyUid);
    s.players[p].bank = s.players[p].bank.filter((u) => u !== moneyUid);
    for (const set of (s.players[p].sets || [])) {
      if (!set) continue;
      if (set.props) set.props = set.props.filter(([u]) => u !== moneyUid);
      if (set.houseUid === moneyUid) set.houseUid = 0;
    }
  }
  s.players[0].hand = [moneyUid];
  s.players[0].bank = [];
  s.players[0].sets = [];
  s.activeP = 0;
  s.playsLeft = 3;

  const view = ctx.PD.ui.newView();
  view.cursor.row = ctx.PD.render.ROW_P_HAND;
  view.cursor.i = 0;

  // Open menu on the money card.
  ctx.PD.ui.step(s, view, { nav: {}, a: { tap: true }, b: {}, x: {} });
  assert.equal(view.mode, "menu");
  assert.equal(view.menu.items.length, 2);
  assert.equal(view.menu.items[0].id, "bank");
  assert.equal(view.menu.items[1].id, "source");

  const c = ctx.PD.ui.computeRowModels(s, view);
  assert.ok(c.preview, "expected preview while hovering Bank in menu mode");
  assert.equal(c.preview.row, ctx.PD.render.ROW_P_HAND);
  assert.equal(c.preview.forCmdKind, "bank");
});

test("ui: onEvents stages dealing and hides drawn cards until revealed", async () => {
  const ctx = await loadSrcIntoVm();

  const s = ctx.PD.newGame({ seedU32: 1 });
  const p = 0;
  const view = ctx.PD.ui.newView();

  // Force a known draw and capture events.
  const events = [];
  const beforeHand = s.players[p].hand.slice();
  ctx.PD.drawToHand(s, p, 2, events);
  const drawEv = events.find((e) => e && e.kind === "draw" && e.p === p);
  assert.ok(drawEv, "expected draw event");
  assert.equal(drawEv.uids.length, 2);

  // Feed events to UI: should hide the newly drawn cards and lock input while animating.
  ctx.PD.anim.onEvents(s, view, events);
  assert.ok(view.anim && view.anim.lock, "expected anim lock after draw events");

  const uid0 = drawEv.uids[0];
  const uid1 = drawEv.uids[1];
  assert.ok(view.anim.hiddenByP[p][uid0], "expected first drawn uid hidden initially");
  assert.ok(view.anim.hiddenByP[p][uid1], "expected second drawn uid hidden initially");

  // Before revealing, computeRowModels should not include hidden uids in the hand row.
  let c = ctx.PD.ui.computeRowModels(s, view);
  const handItems0 = c.models[ctx.PD.render.ROW_P_HAND].items.filter((it) => it && it.kind === "hand");
  const visibleUids0 = handItems0.map((it) => it.uid);
  assert.ok(!visibleUids0.includes(uid0), "expected uid0 hidden from hand row models");
  assert.ok(!visibleUids0.includes(uid1), "expected uid1 hidden from hand row models");

  // Tick until first card is revealed.
  const frames = ctx.PD.config.ui.dealFramesPerCard;
  for (let f = 0; f < frames; f++) ctx.PD.anim.tick(s, view);
  assert.ok(!view.anim.hiddenByP[p][uid0], "expected uid0 revealed after dealFramesPerCard");
  assert.ok(view.anim.hiddenByP[p][uid1], "expected uid1 still hidden");

  // Tick through gap + second reveal.
  for (let f = 0; f < ctx.PD.config.ui.dealGapFrames; f++) ctx.PD.anim.tick(s, view);
  for (let f = 0; f < frames; f++) ctx.PD.anim.tick(s, view);
  assert.ok(!view.anim.hiddenByP[p][uid1], "expected uid1 revealed after second deal");

  // Once done, lock should clear.
  ctx.PD.anim.tick(s, view);
  assert.equal(!!view.anim.lock, false, "expected anim lock cleared after dealing completes");

  // Ensure original hand cards are still present (sanity).
  for (const u of beforeHand) assert.ok(s.players[p].hand.includes(u), "expected original hand uid to remain");
});

test("ui: placeReceived prompt - A on real hand snaps back to faux-hand", async () => {
  const ctx = await loadSrcIntoVm();
  const s = ctx.PD.newGame({ scenarioId: "placeReceived", seedU32: 1 });
  const view = ctx.PD.ui.newView();

  // Enter prompt mode (sync happens inside step).
  ctx.PD.ui.step(s, view, { nav: {}, a: {}, b: {}, x: {} });
  assert.equal(view.mode, "prompt");
  assert.ok(s.prompt && s.prompt.kind === "placeReceived");

  const computed = ctx.PD.ui.computeRowModels(s, view);
  const rm = computed.models[ctx.PD.render.ROW_P_HAND];
  const realHandI = rm.items.findIndex((it) => it && it.loc && it.loc.zone === "hand");
  assert.ok(realHandI >= 0, "expected a real hand card item");

  view.cursor.row = ctx.PD.render.ROW_P_HAND;
  view.cursor.i = realHandI;

  ctx.PD.ui.step(s, view, { nav: {}, a: { tap: true }, b: {}, x: {} });

  assert.equal(view.cursor.row, ctx.PD.render.ROW_P_HAND);
  assert.equal(view.cursor.i, 0);
});

test("ui: placeReceived prompt - A on faux-hand enters targeting", async () => {
  const ctx = await loadSrcIntoVm();
  const s = ctx.PD.newGame({ scenarioId: "placeReceived", seedU32: 1 });
  const view = ctx.PD.ui.newView();

  ctx.PD.ui.step(s, view, { nav: {}, a: {}, b: {}, x: {} });
  assert.equal(view.mode, "prompt");

  view.cursor.row = ctx.PD.render.ROW_P_HAND;
  view.cursor.i = 0; // first faux-hand card

  ctx.PD.ui.step(s, view, { nav: {}, a: { tap: true }, b: {}, x: {} });
  assert.equal(view.mode, "targeting");
  assert.ok(view.targeting && view.targeting.active);
  assert.equal(view.targeting.kind, "place");
});

test("ui: placeReceived prompt - auto-focus snaps to a received property", async () => {
  const ctx = await loadSrcIntoVm();
  const s = ctx.PD.newGame({ scenarioId: "placeReceived", seedU32: 1 });
  const view = ctx.PD.ui.newView();

  // Start somewhere else (center row) then enter prompt.
  view.cursor.row = 2;
  view.cursor.i = 0;

  ctx.PD.ui.step(s, view, { nav: {}, a: {}, b: {}, x: {} });
  assert.equal(view.mode, "prompt");

  const c = ctx.PD.ui.computeRowModels(s, view);
  const rm = c.models[ctx.PD.render.ROW_P_HAND];
  const sel = rm.items[ctx.PD.ui.clampI(view.cursor.i, rm.items.length)];
  assert.ok(sel && sel.loc && sel.loc.zone === "recvProps", "expected cursor snapped onto recvProps");
});

test("ui: placeReceived prompt - hold-A grabStart on received prop enters place targeting (hold=true)", async () => {
  const ctx = await loadSrcIntoVm();
  const s = ctx.PD.newGame({ scenarioId: "placeReceived", seedU32: 1 });
  const view = ctx.PD.ui.newView();

  ctx.PD.ui.step(s, view, { nav: {}, a: {}, b: {}, x: {} });
  assert.equal(view.mode, "prompt");

  view.cursor.row = ctx.PD.render.ROW_P_HAND;
  view.cursor.i = 0;

  ctx.PD.ui.step(s, view, { nav: {}, a: { grabStart: true }, b: {}, x: {} });
  assert.equal(view.mode, "targeting");
  assert.ok(view.targeting && view.targeting.active);
  assert.equal(view.targeting.kind, "place");
  assert.equal(view.targeting.hold, true);
  assert.ok(view.targeting.card && view.targeting.card.loc && view.targeting.card.loc.zone === "recvProps");
  assert.ok(view.targeting.cmds.some((c) => c && c.kind === "source"), "expected Source option for recvProps targeting");
});

test("ui: placeReceived prompt - A on End is disallowed and snaps back to received properties", async () => {
  const ctx = await loadSrcIntoVm();
  const s = ctx.PD.newGame({ scenarioId: "placeReceived", seedU32: 1 });
  const view = ctx.PD.ui.newView();

  ctx.PD.ui.step(s, view, { nav: {}, a: {}, b: {}, x: {} });
  assert.equal(view.mode, "prompt");

  // Move cursor to End button.
  const c = ctx.PD.ui.computeRowModels(s, view);
  const rmC = c.models[2];
  const endI = rmC.items.findIndex((it) => it && it.kind === "btn" && it.id === "endTurn");
  assert.ok(endI >= 0, "expected endTurn button");
  view.cursor.row = 2;
  view.cursor.i = endI;

  const intent = ctx.PD.ui.step(s, view, { nav: {}, a: { tap: true }, b: {}, x: {} });
  assert.equal(intent, null);

  const c2 = ctx.PD.ui.computeRowModels(s, view);
  const rmH = c2.models[ctx.PD.render.ROW_P_HAND];
  const sel = rmH.items[ctx.PD.ui.clampI(view.cursor.i, rmH.items.length)];
  assert.ok(sel && sel.loc && sel.loc.zone === "recvProps", "expected snap back to recvProps");
});

test("ui: placeReceived prompt - A on Step is allowed (debug action)", async () => {
  const ctx = await loadSrcIntoVm();
  ctx.PD.config.debug.enabled = true;
  const s = ctx.PD.newGame({ scenarioId: "placeReceived", seedU32: 1 });
  const view = ctx.PD.ui.newView();

  ctx.PD.ui.step(s, view, { nav: {}, a: {}, b: {}, x: {} });
  assert.equal(view.mode, "prompt");

  const c = ctx.PD.ui.computeRowModels(s, view);
  const rmC = c.models[2];
  const stepI = rmC.items.findIndex((it) => it && it.kind === "btn" && it.id === "step");
  assert.ok(stepI >= 0, "expected Step button");
  view.cursor.row = 2;
  view.cursor.i = stepI;

  const intent = ctx.PD.ui.step(s, view, { nav: {}, a: { tap: true }, b: {}, x: {} });
  assert.ok(intent && intent.kind === "debug");
  assert.equal(intent.action, "step");
});

test("ui: payDebt prompt - A on housed setProp redirects to setHouse; second A emits payDebt", async () => {
  const ctx = await loadSrcIntoVm();
  const s = ctx.PD.newGame({ scenarioId: "debtHouseFirst", seedU32: 1 });
  const view = ctx.PD.ui.newView();

  // Enter prompt mode.
  ctx.PD.ui.step(s, view, { nav: {}, a: {}, b: {}, x: {} });
  assert.equal(view.mode, "prompt");
  assert.ok(s.prompt && s.prompt.kind === "payDebt");

  // Select a property in the housed set.
  let c = ctx.PD.ui.computeRowModels(s, view);
  const rmT = c.models[ctx.PD.render.ROW_P_TABLE];
  const propI = rmT.items.findIndex((it) => it && it.kind === "setProp" && it.loc && it.loc.zone === "setProps");
  assert.ok(propI >= 0, "expected a setProp item");

  view.cursor.row = ctx.PD.render.ROW_P_TABLE;
  view.cursor.i = propI;

  // First A: should redirect selection to the House, no intent.
  const intent1 = ctx.PD.ui.step(s, view, { nav: {}, a: { tap: true }, b: {}, x: {} });
  assert.equal(intent1, null);

  c = ctx.PD.ui.computeRowModels(s, view);
  assert.equal(c.selected.row, ctx.PD.render.ROW_P_TABLE);
  assert.equal(c.selected.kind, "setHouse");

  // Second A: should emit a payDebt command for the House.
  const intent2 = ctx.PD.ui.step(s, view, { nav: {}, a: { tap: true }, b: {}, x: {} });
  assert.ok(intent2 && intent2.kind === "applyCmd");
  assert.equal(intent2.cmd.kind, "payDebt");
  assert.equal(intent2.cmd.card.loc.zone, "setHouse");
});

test("ui: payDebt prompt - Step button returns debug intent and debugStep pays debt", async () => {
  const ctx = await loadSrcIntoVm();
  ctx.PD.config.debug.enabled = true;
  const s = ctx.PD.newGame({ scenarioId: "debtHouseFirst", seedU32: 1 });
  const view = ctx.PD.ui.newView();

  // Enter prompt mode.
  ctx.PD.ui.step(s, view, { nav: {}, a: {}, b: {}, x: {} });
  assert.equal(view.mode, "prompt");
  assert.ok(s.prompt && s.prompt.kind === "payDebt");

  // Move cursor to Step button.
  const c = ctx.PD.ui.computeRowModels(s, view);
  const rmC = c.models[2];
  const stepI = rmC.items.findIndex((it) => it && it.kind === "btn" && it.id === "step");
  assert.ok(stepI >= 0, "expected Step button");
  view.cursor.row = 2;
  view.cursor.i = stepI;

  const intent = ctx.PD.ui.step(s, view, { nav: {}, a: { tap: true }, b: {}, x: {} });
  assert.ok(intent && intent.kind === "debug");
  assert.equal(intent.action, "step");

  // Simulate Render-mode debug handling: debugStep applies a legal move.
  ctx.PD.debug = ctx.PD.debug || {};
  ctx.PD.debug.state = s;
  ctx.PD.debugStep();
  assert.ok(!s.prompt || s.prompt.kind !== "payDebt", "expected debt prompt to progress/resolve after step");
});

test("ui: rent card menu shows Rent (not just Bank) when a matching set exists", async () => {
  const ctx = await loadSrcIntoVm();
  const s = ctx.PD.newGame({ scenarioId: "placeBasic", seedU32: 1 });
  s.activeP = 0;
  s.playsLeft = 3;

  // Find rent_mo in hand and set cursor to it.
  const uid = s.players[0].hand.find((u) => ctx.PD.defByUid(s, u).id === "rent_mo");
  assert.ok(uid, "expected rent_mo in hand");
  const i = s.players[0].hand.indexOf(uid);
  assert.ok(i >= 0);

  const view = ctx.PD.ui.newView();
  view.cursor.row = ctx.PD.render.ROW_P_HAND;
  view.cursor.i = i;

  ctx.PD.ui.step(s, view, { nav: {}, a: { tap: true }, b: {}, x: {} });
  assert.equal(view.mode, "menu");
  assert.ok(view.menu.items.some((it) => it && it.id === "rent"), "expected Rent menu item");
  assert.ok(view.menu.items.some((it) => it && it.id === "bank"), "expected Bank menu item");
  assert.ok(view.menu.items.some((it) => it && it.id === "source"), "expected Cancel/Source menu item");
});

test("ui: hold-A on rent card enters quick targeting and defaults to playRent", async () => {
  const ctx = await loadSrcIntoVm();
  const s = ctx.PD.newGame({ scenarioId: "placeBasic", seedU32: 1 });
  s.activeP = 0;
  s.playsLeft = 3;

  const uid = s.players[0].hand.find((u) => ctx.PD.defByUid(s, u).id === "rent_mo");
  assert.ok(uid, "expected rent_mo in hand");
  const i = s.players[0].hand.indexOf(uid);
  assert.ok(i >= 0);

  const view = ctx.PD.ui.newView();
  view.cursor.row = ctx.PD.render.ROW_P_HAND;
  view.cursor.i = i;

  ctx.PD.ui.step(s, view, { nav: {}, a: { grabStart: true }, b: {}, x: {} });

  assert.equal(view.mode, "targeting");
  assert.ok(view.targeting && view.targeting.active);
  assert.equal(view.targeting.kind, "quick");
  assert.ok(view.targeting.cmds && view.targeting.cmds.length > 0);
  assert.equal(view.targeting.cmds[0].kind, "playRent");
});

test("ui: hold-A quick targeting on rent card can cycle to bank option", async () => {
  const ctx = await loadSrcIntoVm();
  const s = ctx.PD.newGame({ scenarioId: "placeBasic", seedU32: 1 });
  s.activeP = 0;
  s.playsLeft = 3;

  const uid = s.players[0].hand.find((u) => ctx.PD.defByUid(s, u).id === "rent_mo");
  assert.ok(uid);
  const i = s.players[0].hand.indexOf(uid);

  const view = ctx.PD.ui.newView();
  view.cursor.row = ctx.PD.render.ROW_P_HAND;
  view.cursor.i = i;

  ctx.PD.ui.step(s, view, { nav: {}, a: { grabStart: true }, b: {}, x: {} });
  assert.equal(view.mode, "targeting");
  assert.equal(view.targeting.kind, "quick");

  const bankI = view.targeting.cmds.findIndex((c) => c && c.kind === "bank");
  assert.ok(bankI >= 0, "expected bank option in quick cmds");

  // Cycle right until we reach bank.
  for (let step = 0; step < bankI; step++) {
    ctx.PD.ui.step(s, view, { nav: { right: true }, a: {}, b: {}, x: {} });
  }

  const sel = view.targeting.cmds[view.targeting.cmdI];
  assert.ok(sel);
  assert.equal(sel.kind, "bank");
});

test("ui: hold-A on House enters quick targeting and defaults to playHouse when Build is legal", async () => {
  const ctx = await loadSrcIntoVm();
  const s = ctx.PD.newGame({ scenarioId: "houseBasic", seedU32: 1 });
  s.activeP = 0;
  s.playsLeft = 3;

  const uid = s.players[0].hand.find((u) => ctx.PD.defByUid(s, u).id === "house");
  assert.ok(uid, "expected house in hand");
  const i = s.players[0].hand.indexOf(uid);
  assert.ok(i >= 0);

  const view = ctx.PD.ui.newView();
  view.cursor.row = ctx.PD.render.ROW_P_HAND;
  view.cursor.i = i;

  ctx.PD.ui.step(s, view, { nav: {}, a: { grabStart: true }, b: {}, x: {} });
  assert.equal(view.mode, "targeting");
  assert.equal(view.targeting.kind, "quick");
  assert.ok(view.targeting.cmds && view.targeting.cmds.length > 0);
  assert.equal(view.targeting.cmds[0].kind, "playHouse");
});

test("ui: menu includes Cancel/Source as last item", async () => {
  const ctx = await loadSrcIntoVm();
  const s = ctx.PD.newGame({ scenarioId: "placeBasic", seedU32: 1 });
  s.activeP = 0;
  s.playsLeft = 3;

  const uid = s.players[0].hand[0];
  assert.ok(uid, "expected at least 1 hand card");

  const view = ctx.PD.ui.newView();
  view.cursor.row = ctx.PD.render.ROW_P_HAND;
  view.cursor.i = 0;

  ctx.PD.ui.step(s, view, { nav: {}, a: { tap: true }, b: {}, x: {} });
  assert.equal(view.mode, "menu");
  assert.ok(view.menu.items.length > 0);
  assert.equal(view.menu.items[view.menu.items.length - 1].id, "source");
});

