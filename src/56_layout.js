// Shared layout/geometry helpers (UI + renderer). Pure; reads PD.config.

PD.layout.rowY0 = function (row) {
  return PD.config.render.layout.rowY[row];
};

PD.layout.rowH = function (row) {
  return PD.config.render.layout.rowH[row];
};

PD.layout.faceYForRow = function (row) {
  var L = PD.config.render.layout;
  if (row === 0) {
    // Opponent hand: bottom slice visible; cards extend upward off-screen.
    return L.rowY[0] + L.rowH[0] - L.faceH;
  }
  if (row === 1 || row === 3 || row === 4) {
    return L.rowY[row] + L.faceInsetY;
  }
  return L.rowY[row];
};

PD.layout.isOpponentRow = function (row) {
  return row === 0 || row === 1;
};

PD.layout.playerForRow = function (row) {
  if (row === 0 || row === 1) return 1;
  if (row === 3 || row === 4) return 0;
  return -1;
};

