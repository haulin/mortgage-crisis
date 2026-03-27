// PD.rng: deterministic PRNG helpers (bitwise coercion stays localized here).
PD.rng.u32 = function (n) {
  return (n >>> 0);
};

PD.rng.u32NonZero = function (n) {
  var x = (n >>> 0);
  return x ? x : 1;
};

PD.rng.xorshift32Step = function (sU32) {
  var x = sU32 >>> 0;
  if (!x) x = 1;
  x ^= x << 13;
  x >>>= 0;
  x ^= x >>> 17;
  x ^= x << 5;
  x >>>= 0;
  return x >>> 0;
};

PD.rng.RNG = function (seedU32) {
  this.s = PD.rng.u32NonZero(seedU32);
};

// Standalone RNG instances (handy for tests/utilities; separate from RNG-in-state).
PD.rng.RNG.prototype.nextU32 = function () {
  this.s = PD.rng.xorshift32Step(this.s >>> 0);
  return this.s >>> 0;
};

PD.rng.RNG.prototype.nextInt = function (n) {
  n = n | 0;
  if (n <= 0) return 0;
  return (this.nextU32() % n) | 0;
};

// RNG-in-state helpers (store evolving state in `state.rngS`).
PD.rng.nextU32InState = function (state) {
  state.rngS = PD.rng.xorshift32Step(state.rngS >>> 0);
  return state.rngS >>> 0;
};

PD.rng.nextIntInState = function (state, n) {
  n = n | 0;
  if (n <= 0) return 0;
  return (PD.rng.nextU32InState(state) % n) | 0;
};

