PD.config = {
  screenW: 240,
  screenH: 136,
  seedBase: 1001
};

// TIC-80 default palette is Sweetie-16.
// These are palette *indices* (0..15), not RGB values.
PD.Pal = {
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

PD.config.render = {
  cfg: {
    screenW: PD.config.screenW,
    screenH: PD.config.screenH,

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
    hudLineCol: PD.Pal.White,

    // Center row widgets (deck/discard/banks)
    centerBoxH: 15,
    centerTopInsetY: 4,
    centerBoxW: 40,
    centerGapX: 6,
    centerDeckX: 6,
    centerBankGapX: 18,

    // Top-left status overlay (5 lines)
    topStatusEnabled: true,
    topStatusX: 0,
    topStatusY: 0,
    topStatusLineStep: 7,

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
    colBg: PD.Pal.Black,
    colText: PD.Pal.White,
    colCardBorder: PD.Pal.White,
    colCardInterior: PD.Pal.White,
    colShadow: PD.Pal.Black,
    colHighlight: PD.Pal.Yellow,
    colCenterPanel: PD.Pal.DarkBlue,
    colCenterPanelBorder: PD.Pal.White,
    colValuePatch: PD.Pal.White,
    colValuePatchBorder: PD.Pal.Black
  },

  // Sprite IDs (NOT locked yet; keep all in one place for easy remap).
  spr: {
    // Reserve 0 as blank (convention).
    digit0: 1, // digit sprite IDs are digit0 + n

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
    PD.Pal.Yellow,     // 1
    PD.Pal.Red,        // 2
    PD.Pal.LightGreen, // 3
    PD.Pal.LightBlue,  // 4
    PD.Pal.Purple      // 5
  ]
};

