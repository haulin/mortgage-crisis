// PD.seed: seed policy for deterministic runs (dev-friendly, reproducible).
PD.seed.computeSeedU32 = function () {
  return PD.rng.u32NonZero(PD.config.seedBase);
};

