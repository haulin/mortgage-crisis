var PD = PD || {};

// Phase 05c+ animation module baseline.
// Keep these definitions early so the rest of the cartridge can call `PD.anim.*`
// without defensive existence checks. Real implementations live in `src/13_anim.js`.
PD.anim = PD.anim || {};
PD.anim.ensure = PD.anim.ensure || function (view) { return view && view.anim ? view.anim : null; };
PD.anim.onEvents = PD.anim.onEvents || function () {};
PD.anim.tick = PD.anim.tick || function () {};
PD.anim.present = PD.anim.present || function (state, view, computed) { return computed; };
PD.anim.feedbackTick = PD.anim.feedbackTick || function () {};
PD.anim.feedbackError = PD.anim.feedbackError || function () {};

