// Shared tiny utilities (pure helpers; no TIC-80 API usage).

PD.shuffleByNextInt = function (arr, nextInt) {
  var i;
  for (i = arr.length - 1; i > 0; i--) {
    var j = nextInt(i + 1);
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
};

PD.bankValueTotal = function (state, p) {
  var bank = state.players[p].bank;
  var sum = 0;
  var i;
  for (i = 0; i < bank.length; i++) {
    var uid = bank[i];
    var di = state.uidToDefI[uid];
    var def = PD.CARD_DEFS[di];
    if (def && def.bankValue) sum += def.bankValue;
  }
  return sum;
};

