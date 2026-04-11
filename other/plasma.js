// title: Plasma + Palette Cycle (Demo)
// author: Mortgage Crisis
// desc: Standalone plasma background with HSV hue-cycling via palette RAM writes.
// saveid: plasma-demo
// script: js

var W = 240;
var H = 136;

var CFG = {
  cellW: 4,
  cellH: 4,
  // Palette ramp (indices 0..15). Hue cycling rotates these indices' RGB values.
  ramp: [0, 0, 0, 0, 6, 6, 8, 8, 9, 9, 10, 7],

  // Sine field parameters (table-index units).
  stepX: 17,
  stepY: 19,
  stepXY: 11,
  speedX: 0.1,
  speedY: -0.1,
  speedXY: -2,
  weightX: 1,
  weightY: 1,
  weightXY: 1,
  axisMode: "diag", // "xy" | "diag"
  oddRowShiftX: 0.5,

  cycle: {
    enabled: true,
    // Hue turns per frame (0.002 ≈ full cycle in ~8.3s @ 60fps).
    hueSpeed: 0.0005,
    satMul: 1,
    valMul: 1,
    // If empty: derive indices from ramp.
    indices: [],
    // Keep black + colorkey stable by default.
    exclude: [0, 15]
  }
};

var T = 0;

var SIN256 = null;
var VRAM_PALETTE = 0x3FC0;
var PAL_BASE = null; // 48 bytes: (r,g,b)*16 captured once
var CYCLE_IDXS = [];

function ensureSin256() {
  if (SIN256) return;
  SIN256 = [];
  var TAU = Math.PI * 2;
  for (var i = 0; i < 256; i++) {
    SIN256[i] = Math.floor(Math.sin((i / 256) * TAU) * 127);
  }
}

function sin256Lerp(a) {
  a = a % 256;
  if (a < 0) a += 256;
  var i0 = Math.floor(a);
  var f = a - i0;
  var i1 = (i0 === 255) ? 0 : (i0 + 1);
  var s0 = SIN256[i0];
  var s1 = SIN256[i1];
  return s0 + (s1 - s0) * f;
}

function clamp01(x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x;
}

function rgbToHsv01(r8, g8, b8) {
  var r = r8 / 255;
  var g = g8 / 255;
  var b = b8 / 255;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var v = max;
  var d = max - min;
  var s = (max === 0) ? 0 : (d / max);
  var h = 0;
  if (d !== 0) {
    if (max === r) h = (g - b) / d;
    else if (max === g) h = 2 + (b - r) / d;
    else h = 4 + (r - g) / d;
    h = h / 6;
    if (h < 0) h += 1;
  }
  return { h: h, s: s, v: v };
}

function hsv01ToRgb8(h, s, v) {
  h = h % 1;
  if (h < 0) h += 1;
  s = clamp01(s);
  v = clamp01(v);
  if (s === 0) {
    var g8 = Math.round(v * 255);
    return { r: g8, g: g8, b: g8 };
  }
  var h6 = h * 6;
  var i = Math.floor(h6);
  var f = h6 - i;
  var p = v * (1 - s);
  var q = v * (1 - s * f);
  var t = v * (1 - s * (1 - f));
  var r1, g1, b1;
  switch (i % 6) {
    case 0: r1 = v; g1 = t; b1 = p; break;
    case 1: r1 = q; g1 = v; b1 = p; break;
    case 2: r1 = p; g1 = v; b1 = t; break;
    case 3: r1 = p; g1 = q; b1 = v; break;
    case 4: r1 = t; g1 = p; b1 = v; break;
    default: r1 = v; g1 = p; b1 = q; break;
  }
  return {
    r: Math.round(clamp01(r1) * 255),
    g: Math.round(clamp01(g1) * 255),
    b: Math.round(clamp01(b1) * 255)
  };
}

function capturePaletteOnce() {
  if (PAL_BASE) return;
  if (typeof peek !== "function") return;
  PAL_BASE = [];
  for (var i = 0; i < 48; i++) PAL_BASE[i] = peek(VRAM_PALETTE + i);
}

function buildCycleIdxsOnce() {
  if (CYCLE_IDXS.length) return;
  var cyc = CFG.cycle;
  var src = (cyc.indices && cyc.indices.length) ? cyc.indices : CFG.ramp;
  var excl = cyc.exclude;
  for (var i = 0; i < src.length; i++) {
    var c = src[i];
    if (c == null) continue;
    c = Math.floor(c);
    if (c < 0 || c > 15) continue;
    var skip = false;
    if (excl && excl.length) {
      for (var j = 0; j < excl.length; j++) {
        if (excl[j] === c) { skip = true; break; }
      }
    }
    if (skip) continue;
    var seen = false;
    for (j = 0; j < CYCLE_IDXS.length; j++) {
      if (CYCLE_IDXS[j] === c) { seen = true; break; }
    }
    if (!seen) CYCLE_IDXS.push(c);
  }
}

function applyPaletteCycle() {
  var cyc = CFG.cycle;
  if (!cyc.enabled) return;
  if (!PAL_BASE) return;
  if (typeof poke !== "function") return;

  var hue = (T * cyc.hueSpeed) % 1;
  if (hue < 0) hue += 1;

  var satMul = cyc.satMul;
  var valMul = cyc.valMul;

  for (var k = 0; k < CYCLE_IDXS.length; k++) {
    var idx = CYCLE_IDXS[k];
    var off = idx * 3;
    var r0 = PAL_BASE[off + 0];
    var g0 = PAL_BASE[off + 1];
    var b0 = PAL_BASE[off + 2];

    var hsv = rgbToHsv01(r0, g0, b0);
    var rgb = hsv01ToRgb8(hsv.h + hue, hsv.s * satMul, hsv.v * valMul);

    poke(VRAM_PALETTE + off + 0, rgb.r);
    poke(VRAM_PALETTE + off + 1, rgb.g);
    poke(VRAM_PALETTE + off + 2, rgb.b);
  }
}

function drawPlasma() {
  ensureSin256();

  var cw = CFG.cellW;
  var ch = CFG.cellH;
  if (!(cw > 0) || !(ch > 0)) return;

  var ramp = CFG.ramp;
  var nRamp = ramp.length;
  if (!(nRamp > 0)) return;

  var stepX = CFG.stepX;
  var stepY = CFG.stepY;
  var stepXY = CFG.stepXY;
  var speedX = CFG.speedX;
  var speedY = CFG.speedY;
  var speedXY = CFG.speedXY;
  var wX = CFG.weightX;
  var wY = CFG.weightY;
  var wXY = CFG.weightXY;

  var range = 127 * (Math.abs(wX) + Math.abs(wY) + Math.abs(wXY));
  if (!(range > 0)) range = 1;
  var inv = 1 / (2 * range);

  var axisMode = String(CFG.axisMode);
  var oddRowShiftX = CFG.oddRowShiftX;

  var iy = 0;
  for (var y = 0; y < H; y += ch) {
    var hh = (y + ch <= H) ? ch : (H - y);
    var ix = 0;
    for (var x = 0; x < W; x += cw) {
      var ww = (x + cw <= W) ? cw : (W - x);

      var xCell = ix;
      var yCell = iy;
      if (oddRowShiftX && ((iy & 1) !== 0)) xCell += oddRowShiftX;

      var ax, ay, axy;
      if (axisMode === "diag") {
        var uCell = xCell + yCell;
        var vCell = xCell - yCell;
        ax = uCell * stepX + T * speedX;
        ay = vCell * stepY + T * speedY;
        axy = uCell * stepXY + T * speedXY;
      } else {
        ax = xCell * stepX + T * speedX;
        ay = yCell * stepY + T * speedY;
        axy = (xCell + yCell) * stepXY + T * speedXY;
      }

      var sum =
        sin256Lerp(ax) * wX +
        sin256Lerp(ay) * wY +
        sin256Lerp(axy) * wXY;

      var u = (sum + range) * inv; // 0..1 (approx)
      var ri = Math.floor(u * nRamp);
      if (ri < 0) ri = 0;
      else if (ri >= nRamp) ri = nRamp - 1;

      rect(x, y, ww, hh, ramp[ri]);
      ix += 1;
    }
    iy += 1;
  }
}

function BOOT() {
  if (typeof vbank === "function") vbank(0);
  capturePaletteOnce();
  buildCycleIdxsOnce();
}

function TIC() {
  if (typeof vbank === "function") vbank(0);
  T += 1;
  applyPaletteCycle();
  drawPlasma();
  print("PLASMA DEMO", 2, 2, 12, true, 1, false);
}

