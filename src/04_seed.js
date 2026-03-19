PD.computeSeed = function () {
  var s = (PD.config.seedBase >>> 0) || 1;
  return s >>> 0;
};

PD.newGameRng = function () {
  return new PD.RNG(PD.computeSeed());
};

