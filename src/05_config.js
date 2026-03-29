// MC.config: central gameplay/UI/render tuning knobs (validated in tests; avoid runtime fallbacks).
MC.config = {
  screenW: 240,
  screenH: 136,
  seedBase: 1005
};

// Meta/version display (Phase 11).
MC.config.meta = {
  version: "v0.11"
};

// Debug/dev knobs (Phase 03b+). Keep these centralized so we can disable later.
MC.config.debug = {
  enabled: true
};

// Controller UX knobs (Phase 04+). All values are in frames (TIC runs at 60fps).
MC.config.controls = {
  // D-pad repeat: start repeating after delay, then pulse every period.
  dpadRepeatDelayFrames: 12,
  dpadRepeatPeriodFrames: 4,

  // Hold-A grab: if you hold A without moving, enter grab after this fallback threshold.
  // (Hold+move enters immediately.)
  aHoldFallbackFrames: 18,

  // Inspect overlay becomes active after holding X this long.
  xInspectDelayFrames: 6
};

// UI/navigation tuning (Phase 04+).
MC.config.ui = {
  // Directional navigation cone penalty multiplier (per-axis):
  // used by MC.ui.navPickInDirection scoring:
  // score = along^2 + (perp^2)*k
  //
  // Bigger k => narrower cone (harder to jump across rows/columns).
  // k must be > 0. Typical values are ~4..30.
  //
  // - Left/Right usually wants a *narrower* cone to avoid jumping to other rows.
  // - Up/Down can stay more permissive.
  navConeKLeftRight: 18,
  navConeKUpDown: 6,

  // Phase 05c+: animation timings (frames at 60fps).
  dealFramesPerCard: 8,
  dealGapFrames: 2,
  // Shuffle: default includes ~1 extra 1→2→3 loop for readability.
  shuffleAnimFrames: 42,
  shuffleToastFrames: 42,

  // Phase 07: AI pacing (frames at 60fps).
  aiStepDelayFrames: 60,
  aiNarrateToastFrames: 60,

  // Phase 08: Sly Deal targeting presentation.
  // If true: show ghost outlines for non-selected Sly targets while targeting.
  slyShowTargetGhosts: false
 
};

// Title screen knobs (Phase 12). Keep numeric/layout values here for easy iteration.
MC.config.title = {
  // Right panel width (menu area).
  menuW: 90,

  // Logo text scale (TIC-80 print scale).
  logoScale: 3,
  logoX: 10,
  logoY: 18,

  // Subtitle (small).
  subtitleText: "Inspired by Monopoly Deal",
  subtitleX: 34,
  subtitleY: 69,

  // Controls panel (bottom-left).
  controlsX: 20,
  controlsW: 117,
  controlsH: 40,
  controlsBottomY: 8,

  // Menu layout (right panel).
  menuY: 50,
  menuDy: 12,
  menuArrowX: 6,
  menuTextX: 12,
  menuItemBoxes: true,
  menuItemGapY: 4,
  menuItemBoxPadX: 6,
  menuItemBoxPadY: 4,

  // Background tiling (optional): sprite id is top-left of a 2x2 block (16x16).
  // Defaults to the card-back TL sprite, which should exist in the cart.
  bgTileEnabled: true,
  bgTileSprId: 34,
  bgTileColorkey: 15,

  // 0 disables blink; otherwise, show/hide on half-period.
  pressAnyBlinkPeriodFrames: 60
};

// AI policy knobs (Phase 07+).
MC.config.ai = {
  // Per-player policy IDs (0=player, 1=opponent by default).
  policyByP: ["defaultHeuristic", "defaultHeuristic"],

  // Weight multiplier for "place property into an existing set" moves.
  // 1 means no bias (equivalent to uniform random).
  biasExistingSetK: 8,

  // Phase 11: soft bias toward paying debts from bank before transferring properties.
  // 1 means no bias (equivalent to uniform random).
  biasPayDebtFromBankK: 8,

  // Phase 11: early-turn discipline.
  // Simple goal: avoid immediately banking valuable actions when options are limited.
  earlyBankBufferTarget: 3,
  earlyEmptyHandKeepActionsMaxHand: 2,
  biasEarlyBankMoneyK: 6,
  biasEarlyEndTurnOverBankActionsK: 6,
  biasEarlyPlayRentIfPayableK: 3,
  biasEarlyPlaceWhenHoldingRentK: 2,

  // Weight multiplier for "play Rent" moves (bias asking for rent over banking Rent).
  // 1 means no bias (equivalent to uniform random).
  biasPlayRentK: 4,

  // Phase 11: weight multiplier for "play Sly Deal" moves (bias stealing over banking Sly).
  // 1 means no bias (equivalent to uniform random).
  biasPlaySlyDealK: 8,

  // Phase 08: weight multiplier for "play Just Say No" response moves.
  // 1 means no bias (equivalent to uniform random).
  biasPlayJustSayNoK: 8,

  // Phase 10: weight multiplier for "moveWild" replace-window moves (AI willingness).
  // 1 means no bias (equivalent to uniform random).
  biasMoveWildK: 8
};

// Rule-note IDs (Phase 05+). These are small display-only annotations in Inspect.
MC.RuleNote = {
  // MVP1 rule constraints.
  SlyDeal_NotFromFullSet: 1,

  // Optional / other-version rules (not enabled in MVP1).
  House_StationsUtilities: 2,
  JSN_Chain: 3
};

// Rules display knobs (Phase 05+).
MC.config.rules = {
  // List of enabled RuleNote IDs to show in Inspect.
  // Note: keep this intentionally small; it's easy to mislead players with future-rule text.
  enabledRuleNotes: [
    MC.RuleNote.SlyDeal_NotFromFullSet
  ]
};

// TIC-80 default palette is Sweetie-16.
// These are palette *indices* (0..15), not RGB values.
MC.Pal = {
  Black: 0,       // #1a1c2c
  Purple: 1,      // #5d275d
  Red: 2,         // #b13e53
  Orange: 3,      // #ef7d57
  Yellow: 4,      // #ffcd75
  LightGreen: 5,  // #a7f070
  Green: 6,       // #38b764
  DarkGreen: 7,   // #257179
  DarkBlue: 8,    // #29366f
  Blue: 9,        // #3b5dc9
  LightBlue: 10,  // #41a6f6
  Cyan: 11,       // #73eff7
  White: 12,      // #f4f4f4
  LightGrey: 13,  // #94b0c2
  Grey: 14,       // #566c86
  DarkGrey: 15,   // #333c57
};

MC.config.render = {
  // Layout knobs: geometry + positions.
  layout: {
    screenW: MC.config.screenW,
    screenH: MC.config.screenH,

    // Row bands (0-based, inclusive bounds are derived).
    rowY: [0, 12, 39, 82, 109],
    rowH: [12, 27, 43, 27, 27],

    faceW: 17,
    faceH: 25,
    highlightPad: 1, // outside face border

    // Row placement rules for rows 2/4/5 (27px tall).
    faceInsetY: 1,

    // Stacks
    stackStrideX: 8, // next face origin
    stackGapX: 2,
    shadowBarDx: -1, // xFace-1

    // Hands
    handStrideX: 18,

    // Camera
    camMarginX: 12,
    rowPadX: 4,

    // Controls line (simple single print)
    hudLineEnabled: true,
    hudLineX: 6,
    hudLineY: 74,

    // Center row (Phase 03b+)
    centerTopInsetY: 4,
    centerDeckX: 6,
    centerPileGapX: 6,
    centerPreviewX: 70,
    centerPreviewGapX: 8,
    centerDescDy: 8,

    // Center row button strip (Phase 04+).
    centerBtnStripW: 39,
    centerBtnStripPadRight: 1,

    // Inspect panel (Phase 05): screen-space panel bounds.
    // These are absolute so we can tune without coupling to centerPreviewX.
    inspectPanelX0: 48,
    inspectPanelY0: 35,
    inspectPanelX1: 198,
    inspectPanelY1: 85,
    // Content anchors derived from the panel.
    inspectPanelPadX: 2,
    inspectPanelPadY: 2,
    inspectTitleGapX: 2,
    inspectDescDy: 8,

    // Pile depth under-layers (visual only)
    pileUnderDx1: 2,
    pileUnderDy1: 2,
    pileUnderDx2: 4,
    pileUnderDy2: 4
  },

  // Style knobs: colors + template anchors + glyph/icon parameters.
  style: {
    // Digit glyph placement is 3x5; sprite tile may include a 1px border.
    digitGlyphW: 3,
    digitGlyphH: 5,
    digitTile: 8,
    glyphInsetX: 1, // inner glyph top-left in the 8x8 tile
    glyphInsetY: 1,
    glyphColorkey: 15,

    // Dual-color property anchors (0-based, card-local).
    propValueX: 1,
    propValueY: 1,
    propBarX: 5,
    propBarY: 1,
    propBarW: 11,
    propBarH: 5,
    propRentX: 1,
    propRentY: 7,
    propRentDx: 4, // 3px glyph + 1px gap

    // Money/Action/House template anchors (card-local).
    valX: 1,
    valY: 1,
    iconX: 4,
    iconY: 9,

    // Colors (Sweetie-16 indices).
    colBg: MC.Pal.Black,
    colText: MC.Pal.White,
    colCardBorder: MC.Pal.White,
    colCardInterior: MC.Pal.White,
    colShadow: MC.Pal.Black,
    colHighlight: MC.Pal.Yellow,
    colCenterPanel: MC.Pal.DarkBlue,
    colCenterPanelBorder: MC.Pal.White,
    colValuePatch: MC.Pal.White,
    colValuePatchBorder: MC.Pal.Black,
    hudLineCol: MC.Pal.White,
    colToastBgAi: MC.Pal.DarkBlue,

    // Center pile depth outlines (Phase 03b polish)
    pileShadowOutlineCol: MC.Pal.Black,
    // Under-layer outline colors (screen-space depth):
    // - under1: the closer (smaller offset) layer
    // - under2: the deeper (larger offset) layer
    // Deeper is intentionally darker.
    pileOutlineUnder1Col: MC.Pal.LightGrey,
    pileOutlineUnder2Col: MC.Pal.Grey,

    // Inspect panel colors (Phase 05).
    inspectPanelFillCol: MC.Pal.DarkGreen,

    // Deck/Discard pile count digit offset (Phase 05).
    pileCountDx: 1,
    pileCountDy: 1
  },

  // Sprite IDs (NOT locked yet; keep all in one place for easy remap).
  spr: {
    // Reserve 0 as blank (convention).
    digit0: 1, // digit sprite IDs are digit0 + n

    // Card back (top-left tile id of a 2x3 sprite = 16x24).
    // Art convention for Phase 03b: last column + last row are color 15 (colorkey),
    // yielding an effective 15x23 interior when drawn at xFace+1,yFace+1.
    cardBackTL: 32,

    // Optional icons (0 = skip). You’ll remap once the atlas is real.
    iconMoney: 16,
    iconRent: 20,
    iconSlyDeal: 18,
    iconJSN: 19,
    iconHouse: 17
  },

  // Money/value palette mapping from docs/session01.md: 1→4, 2→2, 3→5, 4→10, 5→1
  moneyBgByValue: [
    0,
    MC.Pal.Yellow,     // 1
    MC.Pal.Red,        // 2
    MC.Pal.LightGreen, // 3
    MC.Pal.LightBlue,  // 4
    MC.Pal.Purple      // 5
  ]
};

