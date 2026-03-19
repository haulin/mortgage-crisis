PD.bootTick = function () {
  cls(0);

  var title = "Property Deal";
  var subtitle = "Build OK";
  var seed = "Seed: " + PD.config.seed;

  print(title, 6, 6, 12, true, 1, false);
  print(subtitle, 6, 16, 12, true, 1, false);
  print(seed, 6, 28, 12, true, 1, false);
};

