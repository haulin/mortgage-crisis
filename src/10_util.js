// PD.util: shared tiny utilities (pure helpers; no TIC-80 API usage).

PD.util.bankValueTotal = function (state, p) {
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

