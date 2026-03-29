// MC.title: boot title screen (Phase 12).
(function initTitleModule() {
  var T = MC.title;

  // Local state (kept minimal for now).
  T.st = { frame: 0 };

  function anyPressed(raw) {
    if (!raw || !raw.pressed) return false;
    var p = raw.pressed;
    var i;
    for (i = 0; i < 8; i++) if (p[i]) return true;
    return false;
  }

  T.anyPressed = anyPressed;

  function printShadow(txt, x, y, col, opts) {
    txt = String(txt);
    if (opts == null) opts = {};
    var scale = (opts.scale == null) ? 1 : opts.scale;
    var small = !!opts.small;
    var shadowCol = (opts.shadowCol == null) ? MC.Pal.Black : opts.shadowCol;
    var dx = (opts.dx == null) ? 1 : opts.dx;
    var dy = (opts.dy == null) ? 1 : opts.dy;
    // fixed=false => proportional font (better kerning than fixed-width).
    print(txt, x + dx, y + dy, shadowCol, false, scale, small);
    return print(txt, x, y, col, false, scale, small);
  }

  function drawTiledBg(tc, W, H) {
    if (!tc || !tc.bgTileEnabled) return;
    if (typeof spr !== "function") return;
    var tid = tc.bgTileSprId;
    var ck = tc.bgTileColorkey;
    var xT, yT;
    for (yT = 0; yT < H; yT += 16) {
      for (xT = 0; xT < W; xT += 16) {
        spr(tid, xT, yT, ck, 1, 0, 0, 2, 2);
      }
    }
  }

  function drawControlsTable(tc, Pal, cx, cy, cw) {
    // Table-style layout (no borders):
    // header: Controls | Controller | Keyboard
    // rows: Move/Confirm/Cancel/Inspect
    var x0 = cx + 2;
    var x1 = cx + Math.floor(cw * 0.34);
    var x2 = cx + Math.floor(cw * 0.73);
    var y = cy + 1;
    var dy = 8;

    printShadow("Controls", x0, y, Pal.White, { small: true, shadowCol: Pal.Black });
    printShadow("Controller", x1, y, Pal.LightGrey, { small: true, shadowCol: Pal.Black });
    printShadow("Keyboard", x2, y, Pal.LightGrey, { small: true, shadowCol: Pal.Black });
    y += dy;

    function row(label, ctrl, kb) {
      printShadow(label, x0, y, Pal.LightGrey, { small: true, shadowCol: Pal.Black });
      printShadow(ctrl, x1, y, Pal.Yellow, { small: true, shadowCol: Pal.Black });
      printShadow(kb, x2, y, Pal.Cyan, { small: true, shadowCol: Pal.Black });
      y += dy;
    }

    row("Move", "D-pad", "Arrows");
    row("Confirm", "A", "Z");
    row("Cancel", "B", "X");
    row("Inspect", "X", "A");
  }

  T.tick = function () {
    var cfg = MC.config;
    var tc = cfg.title;
    var Pal = MC.Pal;

    var W = cfg.screenW;
    var H = cfg.screenH;
    var menuW = tc.menuW;
    var leftW = W - menuW;

    // Background.
    if (typeof vbank === "function") vbank(0);
    cls(Pal.DarkBlue);
    drawTiledBg(tc, W, H);

    // Right panel separator/border (panel fill removed; items are boxed).
    rectb(leftW, 0, menuW, H, Pal.White);
    rect(leftW - 1, 0, 1, H, Pal.Grey);


    // Logo (placeholder text).
    var logoScale = tc.logoScale;
    var logoX = tc.logoX;
    var logoY = tc.logoY;
    printShadow("MORTGAGE", logoX, logoY, Pal.White, { scale: logoScale, dx: 2, dy: 2 });
    printShadow("CRISIS", logoX + 20, logoY + 20, Pal.Yellow, { scale: logoScale, dx: 2, dy: 2 });

    // Subtitle.
    if (tc.subtitleText) {
      rect(tc.subtitleX - 1, tc.subtitleY - 1, 12*8-1, 8, Pal.DarkBlue);
      printShadow(String(tc.subtitleText), tc.subtitleX, tc.subtitleY, Pal.LightGrey, { small: true, shadowCol: Pal.Black });
    }

    // Controls legend (bottom-left).
    var cx = tc.controlsX;
    var ch = tc.controlsH;
    var cy = H - tc.controlsBottomY - ch;
    var cw = tc.controlsW;
    if (cw > leftW - cx - 6) cw = leftW - cx - 6;
    if (cw < 60) cw = 60;
    rect(cx - 2, cy - 2, cw + 4, ch + 4, Pal.Black);
    rectb(cx - 2, cy - 2, cw + 4, ch + 4, Pal.Grey);
    drawControlsTable(tc, Pal, cx, cy, cw);

    // Static menu list (right).
    var mxA = leftW + tc.menuArrowX;
    var mxT = leftW + tc.menuTextX;
    var my0 = tc.menuY;
    var dy = tc.menuDy;
    var gap = tc.menuItemGapY;
    if (gap == null) gap = 0;

    function drawMenuItem(i, text, selected) {
      var y0 = my0 + i * (dy + gap);
      var padY = tc.menuItemBoxPadY;
      var xBox = leftW + 2;
      var wBox = menuW - 8;
      var hBox = dy - 2;
      var colB = selected ? Pal.White : Pal.Grey;
      if (tc.menuItemBoxes) {
        rect(xBox, y0 - padY, wBox, hBox + padY, Pal.Black);
        rectb(xBox, y0 - padY, wBox, hBox + padY, colB);
      }
      if (selected) printShadow(">", mxA, y0, Pal.White, { shadowCol: Pal.Black });
      printShadow(text, mxT, y0, selected ? Pal.White : Pal.LightGrey, { shadowCol: Pal.Black });
    }

    drawMenuItem(0, "New Game", true);
    drawMenuItem(1, "Continue", false);
    drawMenuItem(2, "How to Play", false);

    // "Press any" hint (bottom-right).
    var blinkP = tc.pressAnyBlinkPeriodFrames;
    var show = true;
    if (blinkP && blinkP > 0) {
      show = (T.st.frame % blinkP) < (blinkP / 2);
    }
    if (show) {
      printShadow("Press any button", leftW + 5, H - 15, Pal.White, { small: true, shadowCol: Pal.Black });
    }

    T.st.frame += 1;
  };
})();

