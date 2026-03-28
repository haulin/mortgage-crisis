// MC.shuffle: deterministic shuffling helpers (seeded RNG / state RNG).
MC.shuffle.byNextInt = function (arr, nextInt) {
  var i;
  for (i = arr.length - 1; i > 0; i--) {
    var j = nextInt(i + 1);
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
};

MC.shuffle.inPlaceWithRng = function (arr, rng) {
  return MC.shuffle.byNextInt(arr, function (n) { return rng.nextInt(n); });
};

MC.shuffle.inPlaceWithStateRng = function (state, arr) {
  return MC.shuffle.byNextInt(arr, function (n) { return MC.rng.nextIntInState(state, n); });
};

