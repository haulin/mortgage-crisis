PD.ui = PD.ui || {};

PD.ui.newView = function () {
  return {
    // View-only state (cursor/camera/menu focus). This is intentionally not part of GameState.
    // Phase 03 keeps view state under PD.render.ui; Phase 04 will converge on a single model.
    cursor: { row: 0, i: 0 },
    camX: [0, 0, 0, 0, 0]
  };
};

PD.ui.handleInput = function (_state, _view, _input) {
  // Phase 04 will translate controller input into either:
  // - a rules command to apply (`{ kind: ... }`)
  // - a prompt transition (engine-owned prompt state)
  //
  // Returning null means "no action".
  return null;
};

