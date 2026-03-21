PD.controls = PD.controls || {};

PD.controls.newState = function () {
  return {
    frame: 0,

    // Previous raw button-down state (0..7).
    prevDown: [false, false, false, false, false, false, false, false],

    // Per-button consecutive held frames.
    held: [0, 0, 0, 0, 0, 0, 0, 0],

    // A-hold grab tracking.
    aGrabActive: false,
    aGrabEnteredThisPress: false,

    // X inspect delay tracking.
    xInspectActive: false,

    // D-pad repeat counters (per direction button id 0..3).
    dpadRepeat: [0, 0, 0, 0],
  };
};

PD.controls.pollGlobals = function () {
  var down = [false, false, false, false, false, false, false, false];
  var pressed = [false, false, false, false, false, false, false, false];

  var hasBtn = (typeof btn === "function");
  var hasBtnp = (typeof btnp === "function");
  var i;
  for (i = 0; i < 8; i++) {
    down[i] = hasBtn ? !!btn(i) : false;
    pressed[i] = hasBtnp ? !!btnp(i) : false;
  }

  return { down: down, pressed: pressed };
};

PD.controls.actions = function (st, raw, cfg) {
  if (!st) st = PD.controls.newState();
  raw = raw || { down: [], pressed: [] };
  cfg = cfg || {};

  var down = raw.down || [];
  var pressed = raw.pressed || [];

  var repeatDelay = (cfg.dpadRepeatDelayFrames != null) ? (cfg.dpadRepeatDelayFrames | 0) : 12;
  var repeatPeriod = (cfg.dpadRepeatPeriodFrames != null) ? (cfg.dpadRepeatPeriodFrames | 0) : 4;
  if (repeatDelay < 0) repeatDelay = 0;
  if (repeatPeriod < 1) repeatPeriod = 1;

  var grabFallback = (cfg.aHoldFallbackFrames != null) ? (cfg.aHoldFallbackFrames | 0) : 18;
  if (grabFallback < 0) grabFallback = 0;

  var inspectDelay = (cfg.xInspectDelayFrames != null) ? (cfg.xInspectDelayFrames | 0) : 6;
  if (inspectDelay < 0) inspectDelay = 0;

  st.frame = (st.frame | 0) + 1;

  var i;
  for (i = 0; i < 8; i++) {
    var isDown = !!down[i];
    st.held[i] = isDown ? ((st.held[i] | 0) + 1) : 0;
  }

  // Edge detection from down states (used in case caller doesn't provide pressed[]).
  function fell(iBtn) { return !!st.prevDown[iBtn] && !down[iBtn]; }
  function rose(iBtn) { return !st.prevDown[iBtn] && !!down[iBtn]; }

  // D-pad repeat: synthesize nav pulses.
  function navPulse(btnId) {
    btnId = btnId | 0;
    if (!down[btnId]) { st.dpadRepeat[btnId] = 0; return false; }

    // Prefer provided pressed[] as the initial pulse.
    if (pressed[btnId] || rose(btnId)) { st.dpadRepeat[btnId] = 0; return true; }

    st.dpadRepeat[btnId] = (st.dpadRepeat[btnId] | 0) + 1;
    if ((st.dpadRepeat[btnId] | 0) < (repeatDelay | 0)) return false;

    var t = (st.dpadRepeat[btnId] | 0) - (repeatDelay | 0);
    return ((t % repeatPeriod) | 0) === 0;
  }

  var up = navPulse(0);
  var downNav = navPulse(1);
  var left = navPulse(2);
  var right = navPulse(3);

  var aDown = !!down[4];
  var aPressed = !!pressed[4] || rose(4);
  var aReleased = fell(4);

  var bPressed = !!pressed[5] || rose(5);

  var xDown = !!down[6];
  var xPressed = !!pressed[6] || rose(6);
  var xReleased = fell(6);

  // A grab mode: enter on hold+move (any nav pulse while A held),
  // or on fallback hold threshold.
  if (aPressed) {
    st.aGrabActive = false;
    st.aGrabEnteredThisPress = false;
  }

  var navAny = !!(up || downNav || left || right);
  var aHeldFrames = st.held[4] | 0;
  var aGrabStartNow = false;

  if (aDown && !st.aGrabActive) {
    var shouldEnter = false;
    if (navAny && aHeldFrames > 0) shouldEnter = true;
    else if (aHeldFrames >= (grabFallback | 0) && (grabFallback | 0) > 0) shouldEnter = true;
    if (shouldEnter) {
      st.aGrabActive = true;
      st.aGrabEnteredThisPress = true;
      aGrabStartNow = true;
    }
  }

  if (aReleased) {
    st.aGrabActive = false;
  }

  // Tap A is only when it was a press->release without entering grab.
  var aTap = false;
  if (aReleased) {
    aTap = !st.aGrabEnteredThisPress;
    st.aGrabEnteredThisPress = false;
  }

  // Inspect: active only after delay while X held.
  if (xPressed) st.xInspectActive = false;
  if (!xDown) st.xInspectActive = false;
  if (xDown && !st.xInspectActive) {
    if ((st.held[6] | 0) >= (inspectDelay | 0) && (inspectDelay | 0) > 0) st.xInspectActive = true;
    if ((inspectDelay | 0) === 0) st.xInspectActive = true;
  }
  if (xReleased) st.xInspectActive = false;

  // Persist prevDown.
  for (i = 0; i < 8; i++) st.prevDown[i] = !!down[i];

  return {
    nav: { up: up, down: downNav, left: left, right: right },

    a: {
      down: aDown,
      pressed: aPressed,
      released: aReleased,
      tap: aTap,
      grabActive: !!st.aGrabActive,
      grabStart: !!aGrabStartNow,
    },

    b: { pressed: !!bPressed },

    x: {
      down: xDown,
      pressed: xPressed,
      released: xReleased,
      inspectActive: !!st.xInspectActive,
    }
  };
};

