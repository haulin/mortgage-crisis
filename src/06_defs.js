PD.Color = {
  Cyan: 0,
  Magenta: 1,
  Orange: 2,
  Black: 3,
};

PD.CardKind = {
  Money: 0,
  Action: 1,
  Property: 2,
  House: 3,
};

PD.ActionKind = {
  Rent: 0,
  SlyDeal: 1,
  JustSayNo: 2,
};

PD.SET_RULES = [];
PD.SET_RULES[PD.Color.Cyan] = {
  requiredSize: 2,
  rent: [1, 3],
};
PD.SET_RULES[PD.Color.Magenta] = {
  requiredSize: 3,
  rent: [1, 2, 4],
};
PD.SET_RULES[PD.Color.Orange] = {
  requiredSize: 3,
  rent: [2, 3, 5],
};
PD.SET_RULES[PD.Color.Black] = {
  requiredSize: 4,
  rent: [1, 2, 3, 6],
};

PD.HOUSE_RENT_BONUS = 3;

PD.CARD_DEFS = [
  // Money (10)
  {
    id: "money_1",
    name: "$1",
    desc: "Money.\nBank: $1",
    kind: PD.CardKind.Money,
    count: 3,
    bankValue: 1,
  },
  {
    id: "money_2",
    name: "$2",
    desc: "Money.\nBank: $2",
    kind: PD.CardKind.Money,
    count: 3,
    bankValue: 2,
  },
  {
    id: "money_3",
    name: "$3",
    desc: "Money.\nBank: $3",
    kind: PD.CardKind.Money,
    count: 2,
    bankValue: 3,
  },
  {
    id: "money_4",
    name: "$4",
    desc: "Money.\nBank: $4",
    kind: PD.CardKind.Money,
    count: 1,
    bankValue: 4,
  },
  {
    id: "money_5",
    name: "$5",
    desc: "Money.\nBank: $5",
    kind: PD.CardKind.Money,
    count: 1,
    bankValue: 5,
  },

  // Properties (12 fixed + 2 wild = 14)
  {
    id: "prop_cyan",
    name: "Property (Cyan)",
    desc: "Property.\nColor: Cyan\nPay: $3",
    kind: PD.CardKind.Property,
    count: 2,
    propertyColor: PD.Color.Cyan,
    propertyPayValue: 3,
  },
  {
    id: "prop_magenta",
    name: "Property (Magenta)",
    desc: "Property.\nColor: Magenta\nPay: $2",
    kind: PD.CardKind.Property,
    count: 3,
    propertyColor: PD.Color.Magenta,
    propertyPayValue: 2,
  },
  {
    id: "prop_orange",
    name: "Property (Orange)",
    desc: "Property.\nColor: Orange\nPay: $2",
    kind: PD.CardKind.Property,
    count: 3,
    propertyColor: PD.Color.Orange,
    propertyPayValue: 2,
  },
  {
    id: "prop_black",
    name: "Property (Black)",
    desc: "Property.\nColor: Black\nPay: $1",
    kind: PD.CardKind.Property,
    count: 4,
    propertyColor: PD.Color.Black,
    propertyPayValue: 1,
  },
  {
    id: "wild_mo",
    name: "Wild (Magenta/Orange)",
    desc: "Wild property.\nColors: Magenta/Orange\nPay: $2",
    kind: PD.CardKind.Property,
    count: 1,
    wildColors: [PD.Color.Magenta, PD.Color.Orange],
    propertyPayValue: 2,
  },
  {
    id: "wild_cb",
    name: "Wild (Cyan/Black)",
    desc: "Wild property.\nColors: Cyan/Black\nPay: $2",
    kind: PD.CardKind.Property,
    count: 1,
    wildColors: [PD.Color.Cyan, PD.Color.Black],
    propertyPayValue: 2,
  },

  // Buildings (2)
  {
    id: "house",
    name: "House",
    desc: "Add to a complete set.\nRent bonus: +3\nBank: $3",
    kind: PD.CardKind.House,
    count: 2,
    bankValue: 3,
  },

  // Actions (9)
  {
    id: "rent_mo",
    name: "Rent (Magenta/Orange)",
    desc: "Charge rent.\nColors: Magenta/Orange\nBank: $1",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.Rent,
    count: 2,
    bankValue: 1,
    rentAllowedColors: [PD.Color.Magenta, PD.Color.Orange],
  },
  {
    id: "rent_cb",
    name: "Rent (Cyan/Black)",
    desc: "Charge rent.\nColors: Cyan/Black\nBank: $1",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.Rent,
    count: 2,
    bankValue: 1,
    rentAllowedColors: [PD.Color.Cyan, PD.Color.Black],
  },
  {
    id: "rent_any",
    name: "Rent (Any)",
    desc: "Charge rent.\nAny color\nBank: $1",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.Rent,
    count: 1,
    bankValue: 1,
    rentAllowedColors: null,
  },
  {
    id: "sly_deal",
    name: "Sly Deal",
    desc: "Steal 1 property\nfrom an incomplete set.\nBank: $3",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.SlyDeal,
    count: 2,
    bankValue: 3,
  },
  {
    id: "just_say_no",
    name: "Just Say No",
    desc: "Cancel an action\nplayed against you.\nBank: $4",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.JustSayNo,
    count: 2,
    bankValue: 4,
  },
];

PD.DEF_INDEX_BY_ID = {};
(function initDefIndexById() {
  var i;
  for (i = 0; i < PD.CARD_DEFS.length; i++) {
    var id = PD.CARD_DEFS[i].id;
    if (PD.DEF_INDEX_BY_ID[id] != null) {
      throw new Error("duplicate card def id: " + id);
    }
    PD.DEF_INDEX_BY_ID[id] = i;
  }
})();
