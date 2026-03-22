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

  const s = ctx.PD.newGame({ scenarioId: "placeFixed", seedU32: 1 });
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

  const s = ctx.PD.newGame({ scenarioId: "placeFixed", seedU32: 1 });
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

  const s = ctx.PD.newGame({ scenarioId: "placeWild", seedU32: 1 });
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

  const s = ctx.PD.newGame({ scenarioId: "placeFixed", seedU32: 1 });
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

  const s = ctx.PD.newGame({ scenarioId: "placeFixed", seedU32: 1 });
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

