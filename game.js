// script: js
// title: Property Deal
// generated: do not edit by hand (edit src/* instead)
// ---- src/00_prelude.js ----
var PD = PD || {};

// ---- src/01_config.js ----
PD.config = {
  screenW: 240,
  screenH: 136,
  seed: 1001
};

// ---- src/02_boot.js ----
PD.bootTick = function () {
  cls(0);

  var title = "Property Deal";
  var subtitle = "Build OK";
  var seed = "Seed: " + PD.config.seed;

  print(title, 6, 6, 12, true, 1, false);
  print(subtitle, 6, 16, 12, true, 1, false);
  print(seed, 6, 28, 12, true, 1, false);
};

// ---- src/99_main.js ----
function TIC() {
  PD.bootTick();
}

