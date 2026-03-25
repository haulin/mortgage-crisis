PD.xorshift32Step = function (sU32) {
  var x = sU32 >>> 0;
  if (!x) x = 1;
  x ^= x << 13;
  x >>>= 0;
  x ^= x >>> 17;
  x ^= x << 5;
  x >>>= 0;
  return x >>> 0;
};

PD.RNG = function (seedU32) {
  var s = (seedU32 >>> 0) || 1;
  this.s = s >>> 0;
};

// Standalone RNG instances (handy for tests/utilities; separate from RNG-in-state).
PD.RNG.prototype.nextU32 = function () {
  this.s = PD.xorshift32Step(this.s >>> 0);
  return this.s >>> 0;
};

PD.RNG.prototype.nextInt = function (n) {
  n = n | 0;
  if (n <= 0) return 0;
  return (this.nextU32() % n) | 0;
};

// RNG-in-state helpers (store evolving state in `state.rngS`).
PD.rngNextU32 = function (state) {
  state.rngS = PD.xorshift32Step(state.rngS >>> 0);
  return state.rngS >>> 0;
};

PD.rngNextInt = function (state, n) {
  n = n | 0;
  if (n <= 0) return 0;
  return (PD.rngNextU32(state) % n) | 0;
};

