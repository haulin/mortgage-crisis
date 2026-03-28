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
  const { MC } = ctx;
  assert.equal(typeof MC, "object", "expected MC object");
  assert.equal(typeof MC.config, "object", "expected MC.config");
  assert.equal(typeof MC.config.render, "object", "expected MC.config.render");

  const r = MC.config.render;
  assert.equal(typeof r.layout, "object", "expected MC.config.render.layout");
  assert.equal(typeof r.style, "object", "expected MC.config.render.style");
  assert.equal(typeof r.spr, "object", "expected MC.config.render.spr");
  assert.ok(Array.isArray(r.moneyBgByValue), "expected MC.config.render.moneyBgByValue array");

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
  const { MC } = ctx;

  assert.equal(typeof MC.config.meta, "object", "expected MC.config.meta");
  assert.equal(typeof MC.config.meta.version, "string", "expected MC.config.meta.version string");
  assert.ok(MC.config.meta.version.length > 0, "expected MC.config.meta.version non-empty");

  assert.equal(typeof MC.config.controls, "object", "expected MC.config.controls");
  assert.equal(typeof MC.config.ui, "object", "expected MC.config.ui");
  assert.equal(typeof MC.config.ai, "object", "expected MC.config.ai");

  const requirePosNum = (obj, key) => {
    assert.equal(typeof obj[key], "number", `expected ${key} to be a number`);
    assert.ok(Number.isFinite(obj[key]), `expected ${key} to be finite`);
    assert.ok(obj[key] > 0, `expected ${key} > 0`);
  };

  // Controls (frames).
  requirePosNum(MC.config.controls, "dpadRepeatDelayFrames");
  requirePosNum(MC.config.controls, "dpadRepeatPeriodFrames");
  requirePosNum(MC.config.controls, "aHoldFallbackFrames");
  requirePosNum(MC.config.controls, "xInspectDelayFrames");

  // Directional navigation cone penalties.
  requirePosNum(MC.config.ui, "navConeKLeftRight");
  requirePosNum(MC.config.ui, "navConeKUpDown");

  // Animation timings (frames).
  requirePosNum(MC.config.ui, "dealFramesPerCard");
  requirePosNum(MC.config.ui, "dealGapFrames");
  requirePosNum(MC.config.ui, "shuffleAnimFrames");
  requirePosNum(MC.config.ui, "shuffleToastFrames");
  requirePosNum(MC.config.ui, "aiStepDelayFrames");
  requirePosNum(MC.config.ui, "aiNarrateToastFrames");

  // Phase 08 UI knobs.
  assert.equal(typeof MC.config.ui.slyShowTargetGhosts, "boolean", "expected slyShowTargetGhosts boolean");

  // AI policy knobs.
  assert.ok(Array.isArray(MC.config.ai.policyByP), "expected MC.config.ai.policyByP array");
  assert.equal(MC.config.ai.policyByP.length, 2, "expected MC.config.ai.policyByP length=2");
  assert.equal(typeof MC.config.ai.policyByP[0], "string");
  assert.ok(MC.config.ai.policyByP[0].length > 0);
  assert.equal(typeof MC.config.ai.policyByP[1], "string");
  assert.ok(MC.config.ai.policyByP[1].length > 0);
  requirePosNum(MC.config.ai, "biasExistingSetK");
  requirePosNum(MC.config.ai, "biasPayDebtFromBankK");
  requirePosNum(MC.config.ai, "biasPlayRentK");
  requirePosNum(MC.config.ai, "biasPlayJustSayNoK");
  requirePosNum(MC.config.ai, "biasMoveWildK");
});

test("config sanity: rule notes are configured", async () => {
  const ctx = await loadSrcFilesIntoVm(["00_prelude.js", "05_config.js"]);
  const { MC } = ctx;

  assert.equal(typeof MC.RuleNote, "object", "expected MC.RuleNote");
  assert.equal(typeof MC.config.rules, "object", "expected MC.config.rules");
  assert.ok(Array.isArray(MC.config.rules.enabledRuleNotes), "expected enabledRuleNotes array");
  assert.ok(MC.config.rules.enabledRuleNotes.length > 0, "expected enabledRuleNotes to be non-empty");
});

test("sanity: scenarios are registered after full load", async () => {
  const ctx = await loadSrcIntoVm();
  assert.ok(Array.isArray(ctx.MC.scenarios.IDS), "expected MC.scenarios.IDS to be an array");
  assert.ok(ctx.MC.scenarios.IDS.length > 0, "expected MC.scenarios.IDS to be non-empty");
});

