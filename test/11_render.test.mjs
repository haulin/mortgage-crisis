import test from "node:test";
import assert from "node:assert/strict";
import { loadSrcIntoVm } from "./helpers/loadSrcIntoVm.mjs";

function makeRecorder() {
  const calls = [];
  const push = (kind, args) => calls.push({ kind, args: [...args] });
  return {
    calls,
    globals: {
      cls: (...a) => push("cls", a),
      print: (...a) => push("print", a),
      rect: (...a) => push("rect", a),
      rectb: (...a) => push("rectb", a),
      line: (...a) => push("line", a),
      spr: (...a) => push("spr", a),
      btn: () => 0,
      btnp: () => 0
    }
  };
}

test("render: highlight is drawn last for selected card", async () => {
  const rec = makeRecorder();
  const ctx = await loadSrcIntoVm({ extraGlobals: rec.globals });

  const debug = ctx.PD.debug;
  ctx.PD.debugReset();
  debug.state.activeP = 0;

  // Force selection to player hand (row 5) index 0.
  ctx.PD.render.ui.row = ctx.PD.render.ROW_P_HAND;
  ctx.PD.render.ui.i = 0;

  ctx.PD.render.drawFrame(debug);

  assert.ok(rec.calls.length > 0, "expected draw calls");

  const handFaceY = 110; // row5 y=109..135; face inset is +1
  const faceBordersInHandRow = rec.calls
    .map((c, idx) => ({ c, idx }))
    .filter(({ c }) => c.kind === "rect" && c.args[2] === 17 && c.args[3] === 25 && c.args[1] === handFaceY);
  assert.ok(faceBordersInHandRow.length > 0, "expected face border draws in player hand row");

  const highlightCalls = rec.calls
    .map((c, idx) => ({ c, idx }))
    .filter(({ c }) => c.kind === "rectb" && c.args[2] === 19 && c.args[3] === 27);
  assert.ok(highlightCalls.length > 0, "expected highlight rectb call(s) with 19x27");

  const lastHighlightIdx = highlightCalls.at(-1).idx;
  const lastHandFaceIdx = faceBordersInHandRow.at(-1).idx;
  assert.ok(lastHighlightIdx > lastHandFaceIdx, "expected highlight to be drawn after hand cards");
});

test("render: stack uses stride=8 and shadow at xFace-1", async () => {
  const rec = makeRecorder();
  const ctx = await loadSrcIntoVm({ extraGlobals: rec.globals });

  // Create a deterministic table state with at least one stack of 2 cards.
  ctx.PD.debugReset();
  const s = ctx.PD.debug.state;
  // Ensure P0 has a set with 2 props via scenario.
  const s2 = ctx.PD.newGame({ scenarioId: "houseOnComplete", seedU32: 1 });
  ctx.PD.debug.state = s2;

  // Select player table row.
  ctx.PD.render.ui.row = ctx.PD.render.ROW_P_TABLE;
  ctx.PD.render.ui.i = 0;

  ctx.PD.render.drawFrame(ctx.PD.debug);

  // Find two face border rect calls for the table row.
  // Card face base draws a border rect with width=17 and height=25.
  const tableFaceY = 83; // row4 y=82..108; face inset is +1
  const faceBorders = rec.calls.filter((c) => c.kind === "rect" && c.args[2] === 17 && c.args[3] === 25 && c.args[1] === tableFaceY);
  assert.ok(faceBorders.length >= 2, "expected at least 2 face border rect calls");

  // Find two shadow bars (rect w=1, h=25) and ensure they align with xFace-1.
  const shadows = rec.calls.filter((c) => c.kind === "rect" && c.args[2] === 1 && c.args[3] === 25 && c.args[1] === tableFaceY);
  assert.ok(shadows.length >= 2, "expected shadow bar rect calls");

  // Ensure there exists at least one adjacent face pair with stride=8.
  const xs = faceBorders.map((c) => c.args[0]).sort((a, b) => a - b);
  let sawStride = false;
  for (let i = 1; i < xs.length; i++) {
    if (xs[i] - xs[i - 1] === 8) {
      sawStride = true;
      break;
    }
  }
  assert.ok(sawStride, "expected to find at least one 8px stride in table faces");

  // For each face x, there should be a shadow at x-1.
  const shadowXs = new Set(shadows.map((c) => c.args[0]));
  for (const x of xs) assert.ok(shadowXs.has(x - 1), `expected shadow at xFace-1 for face x=${x}`);
});

test("render: rotated digit uses (-4,-2) anchor offsets with rotate=2", async () => {
  const rec = makeRecorder();
  const ctx = await loadSrcIntoVm({ extraGlobals: rec.globals });

  // Put a wild property into opponent table so it's drawn flip180=true.
  const s = ctx.PD.newGame({ scenarioId: "placeWild", seedU32: 1 });
  const wildUid = s.players[0].hand.find((uid) => ctx.PD.defByUid(s, uid).id === "wild_mo");
  assert.ok(wildUid, "expected wild_mo uid");

  const set = ctx.PD.newEmptySet();
  set.props.push([wildUid, ctx.PD.Color.Magenta]);
  s.players[1].sets = [set];
  s.players[1].hand = [];
  s.players[0].hand = [];
  ctx.PD.debug.state = s;

  ctx.PD.render.ui.row = ctx.PD.render.ROW_OP_TABLE;
  ctx.PD.render.ui.i = 0;
  ctx.PD.render.drawFrame(ctx.PD.debug);

  // Opponent table first card xFace is at 240-4-17 = 219, yFace is row2 start (12) + inset (1) = 13.
  // Note: row-local camera may shift xFace; draw uses xFaceScreen = xFace - camX.
  // Wild top-half value digit local is at (1,1) with size 3x5; after flip180, glyph TL is at:
  // x = xFace + (17-(1+3)) = xFace+13; y = yFace + (25-(1+5)) = yFace+19
  // drawDigitGlyph then draws spr at (x-4, y-2) with rotate=2 (inset=1 border in tile).
  const cam = ctx.PD.render.ui.camX[ctx.PD.render.ROW_OP_TABLE] ?? 0;
  const xFace = 219 - cam;
  const yFace = 13;
  const expectedX = xFace + 13 - 4; // 228
  const expectedY = yFace + 19 - 2; // 30

  const sprRot2AtExpected = rec.calls.find(
    (c) => c.kind === "spr" && c.args[6] === 2 && c.args[1] === expectedX && c.args[2] === expectedY
  );
  assert.ok(sprRot2AtExpected, `expected rotate=2 digit spr at (${expectedX},${expectedY})`);
});

test("render: rent card draws 2px color bars at bottom", async () => {
  const rec = makeRecorder();
  const ctx = await loadSrcIntoVm({ extraGlobals: rec.globals });

  // Put a rent(Cyan/Black) card as the only card in player hand.
  const s = ctx.PD.newGame({ scenarioId: "placeFixed", seedU32: 1 });
  const rentUid = s.deck.find((uid) => ctx.PD.defByUid(s, uid).id === "rent_cb");
  assert.ok(rentUid, "expected rent_cb uid in deck");
  s.deck = s.deck.filter((uid) => uid !== rentUid);
  s.players[0].hand = [rentUid];
  s.players[1].hand = [];
  ctx.PD.debug.state = s;

  ctx.PD.render.ui.row = ctx.PD.render.ROW_P_HAND;
  ctx.PD.render.ui.i = 0;
  ctx.PD.render.drawFrame(ctx.PD.debug);

  // Player hand first card: xFace=4, yFace=110 (row5 y=109..135; inset +1).
  // Note: row-local camera may shift xFace; draw uses xFaceScreen = xFace - camX.
  const cam = ctx.PD.render.ui.camX[ctx.PD.render.ROW_P_HAND] ?? 0;
  const xFace = 4 - cam;
  // Bars are inside the 1px border: local x=1, w=15; local y=22 (bottom) then 20.
  const x0 = xFace + 1;
  const y0 = 132; // 110 + 22
  const y1 = 130; // 110 + 20

  const bars = rec.calls.filter(
    (c) => c.kind === "rect" && c.args[0] === x0 && (c.args[1] === y0 || c.args[1] === y1) && c.args[2] === 15 && c.args[3] === 2
  );
  assert.equal(bars.length, 2, "expected exactly two 15x2 rent bar rects at y=132 and y=130");

  const colByY = new Map(bars.map((b) => [b.args[1], b.args[4]]));
  assert.equal(colByY.get(y0), ctx.PD.Pal.Cyan, "expected bottom bar cyan");
  assert.equal(colByY.get(y1), ctx.PD.Pal.Black, "expected top bar black");
});

test("render: opponent table stack shadow is mirrored", async () => {
  const rec = makeRecorder();
  const ctx = await loadSrcIntoVm({ extraGlobals: rec.globals });

  // Build a state with a 2-card opponent set (fan left).
  const s = ctx.PD.newGame({ scenarioId: "placeWild", seedU32: 1 });
  const uidA = s.deck.find((uid) => ctx.PD.defByUid(s, uid).id === "prop_cyan");
  assert.ok(uidA, "expected prop_cyan uid in deck");
  s.deck = s.deck.filter((uid) => uid !== uidA);
  const uidB = s.deck.find((uid) => ctx.PD.defByUid(s, uid).id === "prop_cyan");
  assert.ok(uidB, "expected second prop_cyan uid in deck");
  s.deck = s.deck.filter((uid) => uid !== uidB);

  const set = ctx.PD.newEmptySet();
  set.props.push([uidA, ctx.PD.Color.Cyan]);
  set.props.push([uidB, ctx.PD.Color.Cyan]);
  s.players[1].sets = [set];
  s.players[1].hand = [];
  s.players[0].sets = [];
  s.players[0].hand = [];
  ctx.PD.debug.state = s;

  ctx.PD.render.ui.row = ctx.PD.render.ROW_OP_TABLE;
  ctx.PD.render.ui.i = 0;
  ctx.PD.render.drawFrame(ctx.PD.debug);

  const cfg = ctx.PD.config.render.layout;
  const cam = ctx.PD.render.ui.camX[ctx.PD.render.ROW_OP_TABLE] ?? 0;
  const rightCursor = cfg.screenW - cfg.rowPadX - cfg.faceW; // 240-4-17 = 219
  const xTopFace = (rightCursor - cfg.stackStrideX) - cam; // depth 1
  const yFace = cfg.rowY[ctx.PD.render.ROW_OP_TABLE] + cfg.faceInsetY; // 12 + 1
  const expectedShadowX = xTopFace + cfg.faceW;

  const shadows = rec.calls.filter(
    (c) => c.kind === "rect" && c.args[2] === 1 && c.args[3] === cfg.faceH && c.args[1] === yFace
  );
  assert.ok(shadows.length > 0, "expected shadow bar rect calls in opponent table row");
  assert.ok(
    shadows.some((c) => c.args[0] === expectedShadowX),
    `expected mirrored shadow at xFace+faceW (x=${expectedShadowX}) for opponent stack`
  );
});

test("render: player bank renders as fanned stack in hand row", async () => {
  const rec = makeRecorder();
  const ctx = await loadSrcIntoVm({ extraGlobals: rec.globals });

  const s = ctx.PD.newGame({ scenarioId: "placeFixed", seedU32: 1 });
  const uid1 = s.deck.find((uid) => ctx.PD.defByUid(s, uid).id === "money_2");
  assert.ok(uid1, "expected money_2 uid in deck");
  s.deck = s.deck.filter((uid) => uid !== uid1);
  const uid2 = s.deck.find((uid) => ctx.PD.defByUid(s, uid).id === "sly_deal");
  assert.ok(uid2, "expected sly_deal uid in deck");
  s.deck = s.deck.filter((uid) => uid !== uid2);

  s.players[0].hand = [];
  s.players[0].bank = [uid1, uid2];
  s.players[0].sets = [];
  s.players[1].hand = [];
  s.players[1].bank = [];
  s.players[1].sets = [];
  ctx.PD.debug.state = s;
  ctx.PD.render.ui.lastStateRef = s; // prevent drawFrame from clobbering ui.row/ui.i

  // Select a different row so the bank stack is NOT the selected item.
  ctx.PD.render.ui.row = ctx.PD.render.ROW_CENTER;
  ctx.PD.render.ui.i = 0;
  ctx.PD.render.drawFrame(ctx.PD.debug);

  const cfg = ctx.PD.config.render.layout;
  const yFace = cfg.rowY[ctx.PD.render.ROW_P_HAND] + cfg.faceInsetY; // 109 + 1
  const cam = ctx.PD.render.ui.camX[ctx.PD.render.ROW_P_HAND] ?? 0;
  assert.equal(cam, 0, "expected no scrolling when bank stack fits in player hand row");

  const faces = rec.calls
    .filter((c) => c.kind === "rect" && c.args[2] === cfg.faceW && c.args[3] === cfg.faceH && c.args[1] === yFace)
    .map((c) => c.args[0])
    .sort((a, b) => a - b);
  assert.ok(faces.length >= 2, "expected at least 2 mini-card face rects in player hand row");

  // Bank uses stride=8: expect adjacent faces differ by 8.
  let sawStride = false;
  for (let i = 1; i < faces.length; i++) {
    if (faces[i] - faces[i - 1] === cfg.stackStrideX) {
      sawStride = true;
      break;
    }
  }
  assert.ok(sawStride, "expected to find bank fanning stride in hand row faces");

  // Player bank fanDir=+1 uses shadow on left edge: shadow x should equal xFace-1 for at least one face.
  const shadows = rec.calls
    .map((c, idx) => ({ c, idx }))
    .filter(({ c }) => c.kind === "rect" && c.args[2] === 1 && c.args[3] === cfg.faceH && c.args[1] === yFace);
  assert.ok(shadows.length > 0, "expected shadow bar rect calls in player hand row");
  const shadowXs = new Set(shadows.map(({ c }) => c.args[0]));
  assert.ok(faces.some((x) => shadowXs.has(x - 1)), "expected at least one bank shadow at xFace-1");

  // Shadow that creates the 7px peek must be drawn after the left card,
  // but before drawing the right/top card (since it's emitted just before that card's face).
  const xLeft = faces[0];
  const xRight = faces[1];
  const faceCallIdx = (x) =>
    rec.calls.findIndex((c) => c.kind === "rect" && c.args[0] === x && c.args[1] === yFace && c.args[2] === cfg.faceW && c.args[3] === cfg.faceH);
  const idxLeftFace = faceCallIdx(xLeft);
  const idxRightFace = faceCallIdx(xRight);
  assert.ok(idxLeftFace >= 0, "expected leftmost bank face rect call");
  assert.ok(idxRightFace >= 0, "expected rightmost bank face rect call");
  const idxShadow = shadows.find(({ c }) => c.args[0] === xRight - 1)?.idx ?? -1;
  assert.ok(idxShadow > idxLeftFace, "expected overlap shadow to be drawn after left card face");
  assert.ok(idxShadow < idxRightFace, "expected overlap shadow to be drawn before right card face");
});

test("render: opponent bank renders as mirrored fanned stack in hand row", async () => {
  const rec = makeRecorder();
  const ctx = await loadSrcIntoVm({ extraGlobals: rec.globals });

  const s = ctx.PD.newGame({ scenarioId: "placeFixed", seedU32: 1 });
  const uid1 = s.deck.find((uid) => ctx.PD.defByUid(s, uid).id === "money_2");
  assert.ok(uid1, "expected money_2 uid in deck");
  s.deck = s.deck.filter((uid) => uid !== uid1);
  const uid2 = s.deck.find((uid) => ctx.PD.defByUid(s, uid).id === "sly_deal");
  assert.ok(uid2, "expected sly_deal uid in deck");
  s.deck = s.deck.filter((uid) => uid !== uid2);

  s.players[1].hand = [];
  s.players[1].bank = [uid1, uid2];
  s.players[1].sets = [];
  s.players[0].hand = [];
  s.players[0].bank = [];
  s.players[0].sets = [];
  ctx.PD.debug.state = s;
  ctx.PD.render.ui.lastStateRef = s; // prevent drawFrame from clobbering ui.row/ui.i

  // Select a different row so the bank stack is NOT the selected item.
  ctx.PD.render.ui.row = ctx.PD.render.ROW_CENTER;
  ctx.PD.render.ui.i = 0;
  ctx.PD.render.drawFrame(ctx.PD.debug);

  const cfg = ctx.PD.config.render.layout;
  const yFace = cfg.rowY[ctx.PD.render.ROW_OP_HAND] + cfg.rowH[ctx.PD.render.ROW_OP_HAND] - cfg.faceH;
  const cam = ctx.PD.render.ui.camX[ctx.PD.render.ROW_OP_HAND] ?? 0;
  assert.equal(cam, 0, "expected no scrolling when bank stack fits in opponent hand row");

  const faces = rec.calls
    .filter((c) => c.kind === "rect" && c.args[2] === cfg.faceW && c.args[3] === cfg.faceH && c.args[1] === yFace)
    .map((c) => c.args[0])
    .sort((a, b) => a - b);
  assert.ok(faces.length >= 2, "expected at least 2 mini-card face rects in opponent hand row");

  // Opponent bank fanDir=-1 uses shadow on right edge: shadow x should equal xFace+faceW.
  const shadows = rec.calls
    .map((c, idx) => ({ c, idx }))
    .filter(({ c }) => c.kind === "rect" && c.args[2] === 1 && c.args[3] === cfg.faceH && c.args[1] === yFace);
  assert.ok(shadows.length > 0, "expected shadow bar rect calls in opponent hand row");

  const xLeft = faces[0];
  const xRight = faces[1];
  const faceCallIdx = (x) =>
    rec.calls.findIndex((c) => c.kind === "rect" && c.args[0] === x && c.args[1] === yFace && c.args[2] === cfg.faceW && c.args[3] === cfg.faceH);
  const idxLeftFace = faceCallIdx(xLeft);
  const idxRightFace = faceCallIdx(xRight);
  assert.ok(idxLeftFace >= 0, "expected leftmost opponent bank face rect call");
  assert.ok(idxRightFace >= 0, "expected rightmost opponent bank face rect call");

  const expectedOverlapShadowX = xLeft + cfg.faceW;
  const idxShadow = shadows.find(({ c }) => c.args[0] === expectedOverlapShadowX)?.idx ?? -1;
  assert.ok(idxShadow >= 0, `expected overlap shadow at xFace+faceW (x=${expectedOverlapShadowX})`);
  assert.ok(idxShadow > idxRightFace, "expected overlap shadow to be drawn after right card face");
  assert.ok(idxShadow < idxLeftFace, "expected overlap shadow to be drawn before left card face");
});

test("render: wild in set uses assigned color for visual top", async () => {
  const rec = makeRecorder();
  const ctx = await loadSrcIntoVm({ extraGlobals: rec.globals });

  const s = ctx.PD.newGame({ scenarioId: "placeWild", seedU32: 1 });
  const wildUid = s.deck.find((uid) => ctx.PD.defByUid(s, uid).id === "wild_cb");
  assert.ok(wildUid, "expected wild_cb uid in deck");
  s.deck = s.deck.filter((uid) => uid !== wildUid);

  const set = ctx.PD.newEmptySet();
  set.props.push([wildUid, ctx.PD.Color.Black]); // assign black
  s.players[0].sets = [set];
  s.players[0].hand = [];
  s.players[1].sets = [];
  s.players[1].hand = [];
  ctx.PD.debug.state = s;

  ctx.PD.render.ui.row = ctx.PD.render.ROW_P_TABLE;
  ctx.PD.render.ui.i = 0;
  ctx.PD.render.drawFrame(ctx.PD.debug);

  const L = ctx.PD.config.render.layout;
  const S = ctx.PD.config.render.style;
  const cam = ctx.PD.render.ui.camX[ctx.PD.render.ROW_P_TABLE] ?? 0;
  const xFace = L.rowPadX - cam; // first set starts at padX
  const yFace = L.rowY[ctx.PD.render.ROW_P_TABLE] + L.faceInsetY; // 82 + 1

  // Top-half property bar rect at local (5,1) with size 11x5.
  const xBar = xFace + S.propBarX;
  const yBar = yFace + S.propBarY;
  const bar = rec.calls.find(
    (c) => c.kind === "rect" && c.args[0] === xBar && c.args[1] === yBar && c.args[2] === S.propBarW && c.args[3] === S.propBarH
  );
  assert.ok(bar, "expected to find top-half property color bar rect");
  assert.equal(bar.args[4], ctx.PD.Pal.DarkGrey, "expected assigned black to render as top-half bar color");
});

test("render: no scroll when content fits (opponent hand row)", async () => {
  const rec = makeRecorder();
  const ctx = await loadSrcIntoVm({ extraGlobals: rec.globals });

  const s = ctx.PD.newGame({ scenarioId: "placeFixed", seedU32: 1 });
  const uidBank = s.deck.find((uid) => ctx.PD.defByUid(s, uid).id === "money_1");
  assert.ok(uidBank, "expected money_1 uid in deck");
  s.deck = s.deck.filter((uid) => uid !== uidBank);
  const uidHand = s.deck.find((uid) => ctx.PD.defByUid(s, uid).id === "money_2");
  assert.ok(uidHand, "expected money_2 uid in deck");
  s.deck = s.deck.filter((uid) => uid !== uidHand);

  s.players[1].bank = [uidBank];
  s.players[1].hand = [uidHand];
  s.players[0].bank = [];
  s.players[0].hand = [];
  ctx.PD.debug.state = s;

  // Select a different row so ROW_OP_HAND uses selI=0 camera update.
  ctx.PD.render.ui.row = ctx.PD.render.ROW_P_TABLE;
  ctx.PD.render.ui.i = 0;
  ctx.PD.render.drawFrame(ctx.PD.debug);

  const cam = ctx.PD.render.ui.camX[ctx.PD.render.ROW_OP_HAND] ?? 0;
  assert.equal(cam, 0, "expected no scrolling when opponent hand+bank fit");
});

test("render: opponent hand back sprite origin is aligned for rotate=2", async () => {
  const rec = makeRecorder();
  const ctx = await loadSrcIntoVm({ extraGlobals: rec.globals });

  const s = ctx.PD.newGame({ seedU32: 1 });
  assert.ok(s.players[1].hand.length > 0, "expected opponent to have at least 1 card");
  const uid = s.players[1].hand[0];

  // Make a minimal state: one opponent hand card so we know which back to target.
  s.players[1].hand = [uid];
  s.players[0].hand = [];
  s.players[0].bank = [];
  s.players[1].bank = [];
  s.players[0].sets = [];
  s.players[1].sets = [];
  ctx.PD.debug.state = s;
  ctx.PD.render.ui.lastStateRef = s;

  ctx.PD.render.ui.row = ctx.PD.render.ROW_OP_HAND;
  ctx.PD.render.ui.i = 0;
  ctx.PD.render.drawFrame(ctx.PD.debug);

  const L = ctx.PD.config.render.layout;
  const cam = ctx.PD.render.ui.camX[ctx.PD.render.ROW_OP_HAND] ?? 0;
  const xFace = (L.screenW - L.rowPadX - L.faceW) - cam;
  const yFace = L.rowY[ctx.PD.render.ROW_OP_HAND] + L.rowH[ctx.PD.render.ROW_OP_HAND] - L.faceH;
  const backId = ctx.PD.config.render.spr.cardBackTL;

  const sprCall = rec.calls.find(
    (c) =>
      c.kind === "spr" &&
      c.args[0] === backId &&
      c.args[1] === xFace &&
      c.args[2] === yFace &&
      c.args[6] === 2 &&
      c.args[7] === 2 &&
      c.args[8] === 3
  );
  assert.ok(sprCall, `expected rotate=2 card back spr at (${xFace},${yFace})`);
});

