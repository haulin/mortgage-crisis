PD.shuffleInPlace = function (arr, rng) {
  var i;
  for (i = (arr.length | 0) - 1; i > 0; i--) {
    var j = rng.nextInt(i + 1);
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
};

