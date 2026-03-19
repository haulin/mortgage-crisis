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

