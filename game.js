// script: js
// title: Property Deal
// saveid: PropertyDeal
// generated: do not edit by hand (edit src/* instead)
// ---- src/00_prelude.js ----
var PD = PD || {};

// ---- src/01_config.js ----
PD.config = {
  screenW: 240,
  screenH: 136,
  seedBase: 1001
};

// ---- src/02_boot.js ----
PD.bootTick = function () {
  cls(0);

  var title = "Property Deal";
  var subtitle = "Build OK";
  var seed = "SeedBase: " + PD.config.seedBase;

  print(title, 6, 6, 12, true, 1, false);
  print(subtitle, 6, 16, 12, true, 1, false);
  print(seed, 6, 28, 12, true, 1, false);
};

// ---- src/03_rng.js ----
PD.RNG = function (seedU32) {
  var s = (seedU32 >>> 0) || 1;
  this.s = s >>> 0;
};

PD.RNG.prototype.nextU32 = function () {
  var x = this.s >>> 0;
  x ^= x << 13;
  x >>>= 0;
  x ^= x >>> 17;
  x ^= x << 5;
  x >>>= 0;
  this.s = x >>> 0;
  return this.s;
};

PD.RNG.prototype.nextInt = function (n) {
  n = n | 0;
  if (n <= 0) return 0;
  return (this.nextU32() % n) | 0;
};

// ---- src/04_seed.js ----
PD.computeSeed = function () {
  var s = (PD.config.seedBase >>> 0) || 1;
  return s >>> 0;
};

PD.newGameRng = function () {
  return new PD.RNG(PD.computeSeed());
};

// ---- src/05_shuffle.js ----
PD.shuffleInPlace = function (arr, rng) {
  var i;
  for (i = (arr.length | 0) - 1; i > 0; i--) {
    var j = rng.nextInt(i + 1);
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
};

// ---- src/99_main.js ----
function TIC() {
  PD.bootTick();
}

