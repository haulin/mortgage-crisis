// MC.seed: seed policy for deterministic runs (dev-friendly, reproducible).
MC.seed.computeSeedU32 = function () {
  return MC.rng.u32NonZero(MC.config.seedBase);
};

