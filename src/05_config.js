// MC.config: central gameplay/UI/render tuning knobs (validated in tests; avoid runtime fallbacks).
MC.config = {
  screenW: 240,
  screenH: 136,
  seedBase: 1005
};

// Meta/version display.
MC.config.meta = {
  version: "MVP v0.15"
};

// Debug/dev knobs. Keep these centralized so we can disable later.
MC.config.debug = {
  enabled: true
};

// Controller UX knobs. All values are in frames (TIC runs at 60fps).
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

// UI/navigation tuning.
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

  // Timings are in frames (TIC runs at 60fps).
  // Debug aid: multiply timings for slow-motion debugging (1 = normal speed).
  animSpeedMult: 3,
  dealFramesPerCard: 8,
  dealGapFrames: 2,
  xferFramesPerCard: 8,
  xferGapFrames: 2,
  xferHoldFromFrames: 18,
  xferHoldFrames: 12,
  gameStartToastFrames: 60,
  // Shuffle: default includes ~1 extra 1→2→3 loop for readability.
  shuffleAnimFrames: 42,
  shuffleToastFrames: 42,

  aiStepDelayFrames: 60,
  aiNarrateToastFrames: 60,

  // Toast timings.
  toast: {
    infoFrames: 90,
    errorFrames: 90
  },

  // Sly Deal targeting presentation.
  // If true: show ghost outlines for non-selected Sly targets while targeting.
  slyShowTargetGhosts: false
 
};

// Title screen knobs. Keep numeric/layout values here for easy iteration.
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
  bgTileColorkey: 15
};

// AI policy knobs.
MC.config.ai = {
  // Per-player policy IDs (0=player, 1=opponent by default).
  policyByP: ["defaultHeuristic", "defaultHeuristic"],

  // Policy weight multipliers; 1 means neutral (equivalent to uniform random).
  biasExistingSetK: 8,
  biasPayDebtFromBankK: 8,

  // Early-turn discipline.
  earlyBankBufferTarget: 3,
  earlyEmptyHandKeepActionsMaxHand: 2,
  biasEarlyBankMoneyK: 6,
  biasEarlyEndTurnOverBankActionsK: 6,
  biasEarlyPlayRentIfPayableK: 3,
  biasEarlyPlaceWhenHoldingRentK: 2,

  biasPlayRentK: 4,
  biasPlaySlyDealK: 8,
  biasPlayJustSayNoK: 8,
  biasMoveWildK: 8
};

// Rule-note IDs. These are small display-only annotations in Inspect.
MC.RuleNote = {
  // MVP1 rule constraints.
  SlyDeal_NotFromFullSet: 1,

  // Optional / other-version rules (not enabled in MVP1).
  House_StationsUtilities: 2,
  JSN_Chain: 3
};

// Rules display knobs.
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

// How-to-play screen knobs. Keep layout/typography here for easy tuning.
MC.config.howto = {
  padX: 8,
  padY: 6,

  headerH: 10,
  footerH: 2,

  // Typography: fixed-width for predictable wrapping.
  headingCharW: 6,
  headingLineH: 7,
  bodyCharW: 4,
  bodyLineH: 6,

  // Layout spacing.
  blockGapY: 10,
  demoGapX: 6,
  demoGapY: 3,

  // Scrolling.
  scrollStepPx: 6,

  // Colors (Sweetie-16 indices).
  bgCol: MC.Pal.Black,
  panelCol: MC.Pal.DarkBlue,
  borderCol: MC.Pal.Grey,
  titleCol: MC.Pal.White,
  headingCol: MC.Pal.White,
  textCol: MC.Pal.LightGrey,
  mutedCol: MC.Pal.LightGrey,
  accentCol: MC.Pal.Yellow,
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

    // Center row
    centerTopInsetY: 4,
    centerDeckX: 6,
    centerPileGapX: 6,
    // Payment/transfer buffer anchor (screen-space x).
    // Y uses rowY[ROW_CENTER] + centerTopInsetY to match deck/discard.
    centerPayBufX: 48,
    centerPreviewX: 70,
    centerPreviewGapX: 8,
    centerDescDy: 8,

    // Center row button strip.
    centerBtnStripW: 39,
    centerBtnStripPadRight: 1,

    // Inspect panel: screen-space panel bounds.
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
    hudLineCol: MC.Pal.White,
    colToastBgAi: MC.Pal.DarkBlue,

    // Center pile depth outlines
    pileShadowOutlineCol: MC.Pal.Black,
    pileOutlineUnder1Col: MC.Pal.LightGrey,
    pileOutlineUnder2Col: MC.Pal.Grey,

    // Inspect panel colors.
    inspectPanelFillCol: MC.Pal.DarkGreen,

    // Deck/Discard pile count digit offset.
    pileCountDx: 1,
    pileCountDy: 1
  },

  // Sprite IDs (NOT locked yet; keep all in one place for easy remap).
  spr: {
    // Reserve 0 as blank (convention).
    digit0: 1, // digit sprite IDs are digit0 + n

    // Card back (top-left tile id of a 2x3 sprite = 16x24).
    // Art convention: last column + last row are color 15 (colorkey),
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

