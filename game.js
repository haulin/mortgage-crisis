// script: js
// title: Property Deal (layout draft)

var SCREEN_W = 240;
var SCREEN_H = 136;

var BORDER = 1;
var CARD_INNER_W = 17;
var CARD_INNER_H = 25;
var CARD_W = CARD_INNER_W + BORDER * 2;
var CARD_H = CARD_INNER_H + BORDER * 2;
var STACK_PEEK_INNER_W = 7;
var STACK_PEEK_W = STACK_PEEK_INNER_W + BORDER * 2;
var STRIPE_W = 5;

// Spacing uses overlap so shared borders read as a 1px gap.
var HAND_GAP = -1; // step = CARD_W + HAND_GAP
var STACK_STEP = STACK_PEEK_W - 1; // 1px shared border inside stacks
var STACK_GAP = 0; // extra pixels between stacks (borders already add width)
var ROW_GAP = 0;

var COLOR_BLACK = 0;
var COLOR_WHITE = 12;
var COLOR_HIGHLIGHT = 4;
var FONT_W = 6;
var FONT_H = 6;
var LABEL_PAD = 1;
var EDGE_TRIM = 0;

var handCards = [
  { label: "1", color: 4 },
  { label: "2", color: 2 },
  { label: "3", color: 5 },
  { label: "4", color: 10 },
  { label: "5", color: 1 },
  { label: "10", color: 3 }
];

var tableStacks = [
  [
    { label: "A", color: 1 },
    { label: "B", color: 2 },
    { label: "C", color: 3 }
  ],
  [
    { label: "D", color: 4 },
    { label: "E", color: 5 },
    { label: "F", color: 9 }
  ]
];

var selectionRow = 1; // 0 = table, 1 = hand
var selectionIndex = 0;

function clamp(value, minValue, maxValue) {
  if (value < minValue) return minValue;
  if (value > maxValue) return maxValue;
  return value;
}

function tableSlotCount() {
  var total = 0;
  var i;
  for (i = 0; i < tableStacks.length; i++) {
    total += tableStacks[i].length;
  }
  return total;
}

function rowCount(row) {
  return row === 0 ? tableSlotCount() : handCards.length;
}

function updateInput() {
  if (btnp(0)) {
    selectionRow = clamp(selectionRow - 1, 0, 1);
    selectionIndex = clamp(selectionIndex, 0, rowCount(selectionRow) - 1);
  }
  if (btnp(1)) {
    selectionRow = clamp(selectionRow + 1, 0, 1);
    selectionIndex = clamp(selectionIndex, 0, rowCount(selectionRow) - 1);
  }
  if (btnp(2)) {
    selectionIndex = clamp(selectionIndex - 1, 0, rowCount(selectionRow) - 1);
  }
  if (btnp(3)) {
    selectionIndex = clamp(selectionIndex + 1, 0, rowCount(selectionRow) - 1);
  }
}

function drawLabel(x, y, w, h, label, labelColor, flip) {
  if (!label) return;
  var text = "" + label;
  var textWidth = text.length * FONT_W;
  var pad = flip ? Math.max(0, LABEL_PAD - 1) : LABEL_PAD;
  var labelX = flip ? x + w - textWidth - pad : x + pad;
  var labelY = flip ? y + h - FONT_H - pad : y + pad;
  print(text, labelX, labelY, labelColor, true, 1, false);
}

function drawCard(
  x,
  y,
  w,
  h,
  fillColor,
  borderColor,
  stripeColor,
  label,
  labelColor,
  flip
) {
  rect(x + BORDER, y + BORDER, CARD_INNER_W, CARD_INNER_H, fillColor);
  if (stripeColor !== null && stripeColor !== undefined) {
    rect(x + BORDER, y + BORDER, STRIPE_W, CARD_INNER_H, stripeColor);
  }
  rectb(x, y, CARD_W, CARD_H, borderColor);
  drawLabel(
    x + BORDER,
    y + BORDER,
    CARD_INNER_W,
    CARD_INNER_H,
    label,
    labelColor,
    flip
  );
}

function drawPeekCard(x, y, label, labelColor, borderColor, flip, peekRight) {
  var peekX = peekRight ? x + (CARD_W - STACK_PEEK_W) : x;
  rect(
    peekX + BORDER,
    y + BORDER,
    STACK_PEEK_INNER_W,
    CARD_INNER_H,
    COLOR_WHITE
  );
  rectb(peekX, y, STACK_PEEK_W, CARD_H, borderColor);
  drawLabel(
    peekX + BORDER,
    y + BORDER,
    STACK_PEEK_INNER_W,
    CARD_INNER_H,
    label,
    labelColor,
    flip
  );
}

function rowStartX(totalWidth, align) {
  if (align === "right") return SCREEN_W - totalWidth;
  if (align === "center") return Math.floor((SCREEN_W - totalWidth) / 2);
  return 0;
}

function stackWidth(stack) {
  return (stack.length - 1) * STACK_STEP + CARD_W;
}

function stackOffsetIndex(stackLength, cardIndex, reverse) {
  return reverse ? stackLength - 1 - cardIndex : cardIndex;
}

function drawStack(x, y, stack, selectedCardIndex, flip, reverse) {
  var i;
  var topIndex = stack.length - 1;
  var deferredTop = null;
  for (i = 0; i < stack.length; i++) {
    var cardIndex = stackOffsetIndex(stack.length, i, reverse);
    var card = stack[cardIndex];
    var cardX = x + i * STACK_STEP;
    var isTop = cardIndex === topIndex;
    if (reverse && isTop) {
      deferredTop = { card: card, x: cardX };
      continue;
    }
    if (selectedCardIndex === cardIndex && !isTop) continue;
    if (isTop) {
      drawCard(
        cardX,
        y,
        CARD_W,
        CARD_H,
        COLOR_WHITE,
        COLOR_BLACK,
        null,
        card.label,
        card.color,
        flip
      );
    } else {
      drawPeekCard(
        cardX,
        y,
        card.label,
        card.color,
        COLOR_BLACK,
        flip,
        reverse
      );
    }
  }
  if (reverse && deferredTop) {
    drawCard(
      deferredTop.x,
      y,
      CARD_W,
      CARD_H,
      COLOR_WHITE,
      COLOR_BLACK,
      null,
      deferredTop.card.label,
      deferredTop.card.color,
      flip
    );
  }
  if (selectedCardIndex >= 0 && selectedCardIndex < stack.length - 1) {
    var selectedCard = stack[selectedCardIndex];
    var selectedOffset = stackOffsetIndex(
      stack.length,
      selectedCardIndex,
      reverse
    );
    var selectedX = x + selectedOffset * STACK_STEP;
    drawCard(
      selectedX,
      y,
      CARD_W,
      CARD_H,
      COLOR_WHITE,
      COLOR_BLACK,
      null,
      selectedCard.label,
      selectedCard.color,
      flip
    );
  }
}

function drawHandRow(cards, y, flip, selectable, rowId, align, reverse) {
  var step = CARD_W + HAND_GAP;
  var totalWidth = CARD_W + (cards.length - 1) * step;
  var startX = rowStartX(totalWidth, align);
  var highlight = null;
  var i;
  for (i = 0; i < cards.length; i++) {
    var cardIndex = reverse ? cards.length - 1 - i : i;
    var card = cards[cardIndex];
    var x = startX + i * step;
    drawCard(
      x,
      y,
      CARD_W,
      CARD_H,
      COLOR_WHITE,
      COLOR_BLACK,
      null,
      card.label,
      card.color,
      flip
    );
    if (selectable && selectionRow === rowId && selectionIndex === cardIndex) {
      highlight = { x: x, y: y, w: CARD_W, h: CARD_H };
    }
  }
  return highlight;
}

function resolveTableSlot(stacks, index) {
  var remaining = index;
  var i;
  for (i = 0; i < stacks.length; i++) {
    if (remaining < stacks[i].length) {
      return { stackIndex: i, cardIndex: remaining };
    }
    remaining -= stacks[i].length;
  }
  return { stackIndex: 0, cardIndex: 0 };
}

function drawTableRow(stacks, y, flip, selectable, rowId, align, reverse) {
  var i;
  var totalWidth = 0;
  for (i = 0; i < stacks.length; i++) {
    totalWidth += stackWidth(stacks[i]);
    if (i < stacks.length - 1) totalWidth += STACK_GAP;
  }
  var startX = rowStartX(totalWidth, align);
  var x = startX;
  var selectedStackIndex = -1;
  var selectedCardIndex = -1;
  if (selectable && selectionRow === rowId) {
    var slot = resolveTableSlot(stacks, selectionIndex);
    selectedStackIndex = slot.stackIndex;
    selectedCardIndex = slot.cardIndex;
  }
  var highlight = null;
  for (i = 0; i < stacks.length; i++) {
    var stackIndex = reverse ? stacks.length - 1 - i : i;
    var cardSelection =
      stackIndex === selectedStackIndex ? selectedCardIndex : -1;
    drawStack(x, y, stacks[stackIndex], cardSelection, flip, reverse);
    if (stackIndex === selectedStackIndex) {
      var highlightOffset = stackOffsetIndex(
        stacks[stackIndex].length,
        selectedCardIndex,
        reverse
      );
      var highlightX = x + highlightOffset * STACK_STEP;
      highlight = { x: highlightX, y: y, w: CARD_W, h: CARD_H };
    }
    x += stackWidth(stacks[stackIndex]) + STACK_GAP;
  }
  return highlight;
}

function drawHighlight(rect) {
  if (!rect) return;
  rectb(rect.x, rect.y, rect.w, rect.h, COLOR_HIGHLIGHT);
}

function TIC() {
  updateInput();

  cls(COLOR_BLACK);

  var opponentHandY = -EDGE_TRIM;
  var opponentTableY = opponentHandY + CARD_H + ROW_GAP;
  var playerHandY = SCREEN_H - CARD_H + EDGE_TRIM;
  var playerTableY = playerHandY - CARD_H - ROW_GAP;

  drawHandRow(handCards, opponentHandY, true, false, -1, "center", true);
  drawTableRow(tableStacks, opponentTableY, true, false, -1, "center", true);

  var tableHighlight = drawTableRow(
    tableStacks,
    playerTableY,
    false,
    true,
    0,
    "center",
    false
  );
  var handHighlight = drawHandRow(
    handCards,
    playerHandY,
    false,
    true,
    1,
    "center",
    false
  );
  drawHighlight(selectionRow === 0 ? tableHighlight : handHighlight);
}
