import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { loadSrcIntoVm } from "./helpers/loadSrcIntoVm.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(REPO_ROOT, "src");

async function loadSrcFilesIntoVm(fileNames) {
  const context = vm.createContext({
    cls: () => {},
    print: () => {},
    rect: () => {},
    rectb: () => {},
    line: () => {},
    spr: () => {},
    btn: () => 0,
    btnp: () => 0,
    console
  });

  for (const fileName of fileNames) {
    const source = await fs.readFile(path.join(SRC_DIR, fileName), "utf8");
    new vm.Script(source, { filename: `src/${fileName}` }).runInContext(context);
  }

  return context;
}

test("config sanity: render.layout/style/spr/moneyBgByValue shape", async () => {
  // Load only prelude+config so this test can't be masked by later modules.
  const ctx = await loadSrcFilesIntoVm(["00_prelude.js", "05_config.js"]);
  const { PD } = ctx;
  assert.equal(typeof PD, "object", "expected PD object");
  assert.equal(typeof PD.config, "object", "expected PD.config");
  assert.equal(typeof PD.config.render, "object", "expected PD.config.render");

  const r = PD.config.render;
  assert.equal(typeof r.layout, "object", "expected PD.config.render.layout");
  assert.equal(typeof r.style, "object", "expected PD.config.render.style");
  assert.equal(typeof r.spr, "object", "expected PD.config.render.spr");
  assert.ok(Array.isArray(r.moneyBgByValue), "expected PD.config.render.moneyBgByValue array");

  const L = r.layout;
  const S = r.style;

  const requireNum = (obj, key) =>
    assert.equal(typeof obj[key], "number", `expected ${key} to be a number`);

  assert.ok(Array.isArray(L.rowY) && L.rowY.length === 5, "expected layout.rowY[5]");
  assert.ok(Array.isArray(L.rowH) && L.rowH.length === 5, "expected layout.rowH[5]");

  [
    "screenW",
    "screenH",
    "faceW",
    "faceH",
    "highlightPad",
    "faceInsetY",
    "stackStrideX",
    "stackGapX",
    "shadowBarDx",
    "handStrideX",
    "camMarginX",
    "rowPadX",
    "hudLineX",
    "hudLineY",
    "centerTopInsetY",
    "centerDeckX",
    "centerPileGapX",
    "centerPreviewX",
    "centerPreviewGapX",
    "centerDescDy",
    "centerBtnStripW",
    "centerBtnStripPadRight",
    "inspectPanelX0",
    "inspectPanelY0",
    "inspectPanelX1",
    "inspectPanelY1",
    "inspectPanelPadX",
    "inspectPanelPadY",
    "inspectTitleGapX",
    "inspectDescDy",
    "pileUnderDx1",
    "pileUnderDy1",
    "pileUnderDx2",
    "pileUnderDy2"
  ].forEach((k) => requireNum(L, k));

  [
    "digitGlyphW",
    "digitGlyphH",
    "digitTile",
    "glyphInsetX",
    "glyphInsetY",
    "glyphColorkey",
    "propValueX",
    "propValueY",
    "propBarX",
    "propBarY",
    "propBarW",
    "propBarH",
    "propRentX",
    "propRentY",
    "propRentDx",
    "valX",
    "valY",
    "iconX",
    "iconY",
    "colBg",
    "colText",
    "colCardBorder",
    "colCardInterior",
    "colShadow",
    "colHighlight",
    "colCenterPanel",
    "colCenterPanelBorder",
    "colValuePatch",
    "colValuePatchBorder",
    "hudLineCol",
    "colToastBgAi",
    "pileShadowOutlineCol",
    "pileOutlineUnder1Col",
    "pileOutlineUnder2Col",
    "inspectPanelFillCol",
    "pileCountDx",
    "pileCountDy"
  ].forEach((k) => requireNum(S, k));

  requireNum(r.spr, "digit0");
  requireNum(r.spr, "cardBackTL");
});

test("config sanity: controls + ui knobs exist (avoid runtime fallbacks)", async () => {
  // Load only prelude+config so we validate what ships in the cartridge.
  const ctx = await loadSrcFilesIntoVm(["00_prelude.js", "05_config.js"]);
  const { PD } = ctx;

  assert.equal(typeof PD.config.controls, "object", "expected PD.config.controls");
  assert.equal(typeof PD.config.ui, "object", "expected PD.config.ui");
  assert.equal(typeof PD.config.ai, "object", "expected PD.config.ai");

  const requirePosNum = (obj, key) => {
    assert.equal(typeof obj[key], "number", `expected ${key} to be a number`);
    assert.ok(Number.isFinite(obj[key]), `expected ${key} to be finite`);
    assert.ok(obj[key] > 0, `expected ${key} > 0`);
  };

  // Controls (frames).
  requirePosNum(PD.config.controls, "dpadRepeatDelayFrames");
  requirePosNum(PD.config.controls, "dpadRepeatPeriodFrames");
  requirePosNum(PD.config.controls, "aHoldFallbackFrames");
  requirePosNum(PD.config.controls, "xInspectDelayFrames");

  // Directional navigation cone penalties.
  requirePosNum(PD.config.ui, "navConeKLeftRight");
  requirePosNum(PD.config.ui, "navConeKUpDown");

  // Animation timings (frames).
  requirePosNum(PD.config.ui, "dealFramesPerCard");
  requirePosNum(PD.config.ui, "dealGapFrames");
  requirePosNum(PD.config.ui, "shuffleAnimFrames");
  requirePosNum(PD.config.ui, "shuffleToastFrames");
  requirePosNum(PD.config.ui, "aiStepDelayFrames");
  requirePosNum(PD.config.ui, "aiNarrateToastFrames");

  // AI policy knobs.
  assert.ok(Array.isArray(PD.config.ai.policyByP), "expected PD.config.ai.policyByP array");
  assert.equal(PD.config.ai.policyByP.length, 2, "expected PD.config.ai.policyByP length=2");
  assert.equal(typeof PD.config.ai.policyByP[0], "string");
  assert.ok(PD.config.ai.policyByP[0].length > 0);
  assert.equal(typeof PD.config.ai.policyByP[1], "string");
  assert.ok(PD.config.ai.policyByP[1].length > 0);
  requirePosNum(PD.config.ai, "biasExistingSetK");
  requirePosNum(PD.config.ai, "biasPlayRentK");
});

test("config sanity: rule notes are configured", async () => {
  const ctx = await loadSrcFilesIntoVm(["00_prelude.js", "05_config.js"]);
  const { PD } = ctx;

  assert.equal(typeof PD.RuleNote, "object", "expected PD.RuleNote");
  assert.equal(typeof PD.config.rules, "object", "expected PD.config.rules");
  assert.ok(Array.isArray(PD.config.rules.enabledRuleNotes), "expected enabledRuleNotes array");
  assert.ok(PD.config.rules.enabledRuleNotes.length > 0, "expected enabledRuleNotes to be non-empty");
});

test("sanity: scenarios are registered after full load", async () => {
  const ctx = await loadSrcIntoVm();
  assert.ok(Array.isArray(ctx.PD.scenarios.IDS), "expected PD.scenarios.IDS to be an array");
  assert.ok(ctx.PD.scenarios.IDS.length > 0, "expected PD.scenarios.IDS to be non-empty");
});

