// PD.shuffle: deterministic shuffling helpers (seeded RNG / state RNG).
PD.shuffle.byNextInt = function (arr, nextInt) {
  var i;
  for (i = arr.length - 1; i > 0; i--) {
    var j = nextInt(i + 1);
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
};

PD.shuffle.inPlaceWithRng = function (arr, rng) {
  return PD.shuffle.byNextInt(arr, function (n) { return rng.nextInt(n); });
};

PD.shuffle.inPlaceWithStateRng = function (state, arr) {
  return PD.shuffle.byNextInt(arr, function (n) { return PD.rng.nextIntInState(state, n); });
};

