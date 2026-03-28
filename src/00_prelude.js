// Prelude: initialize the global `PD` namespace and module namespaces exactly once.
// Invariant: other modules attach to these objects (no defensive `PD.x = PD.x || {}`).
var PD = PD || {};

// Module namespaces: created once here, never defensively elsewhere.
PD.controls = {};
PD.render = {};
PD.ui = {};
PD.anim = {};
PD.fmt = {};
PD.layout = {};
PD.moves = {};
PD.cmd = {};
PD.cmdProfiles = {};
PD.ai = {};
PD.state = {};
PD.engine = {};
PD.rules = {};
PD.util = {};
PD.shuffle = {};
PD.rng = {};
PD.seed = {};
PD.scenarios = {};
PD.debug = {};

