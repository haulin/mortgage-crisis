PD.shuffleInPlace = function (arr, rng) {
  return PD.shuffleByNextInt(arr, function (n) { return rng.nextInt(n); });
};

