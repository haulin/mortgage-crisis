PD.Color = {
  Cyan: 0,
  Magenta: 1,
  Orange: 2,
  Black: 3
};

PD.CardKind = {
  Money: 0,
  Action: 1,
  Property: 2,
  House: 3
};

PD.ActionKind = {
  Rent: 0,
  SlyDeal: 1,
  JustSayNo: 2
};

PD.SET_RULES = [];
PD.SET_RULES[PD.Color.Cyan] = {
  requiredSize: 2,
  rent: [1, 3]
};
PD.SET_RULES[PD.Color.Magenta] = {
  requiredSize: 3,
  rent: [1, 2, 4]
};
PD.SET_RULES[PD.Color.Orange] = {
  requiredSize: 3,
  rent: [2, 3, 5]
};
PD.SET_RULES[PD.Color.Black] = {
  requiredSize: 4,
  rent: [1, 2, 3, 6]
};

PD.HOUSE_RENT_BONUS = 3;

PD.CARD_DEFS = [
  // Money (10)
  { id: "money_1", name: "$1", kind: PD.CardKind.Money, count: 3, bankValue: 1 },
  { id: "money_2", name: "$2", kind: PD.CardKind.Money, count: 3, bankValue: 2 },
  { id: "money_3", name: "$3", kind: PD.CardKind.Money, count: 2, bankValue: 3 },
  { id: "money_4", name: "$4", kind: PD.CardKind.Money, count: 1, bankValue: 4 },
  { id: "money_5", name: "$5", kind: PD.CardKind.Money, count: 1, bankValue: 5 },

  // Properties (12 fixed + 2 wild = 14)
  {
    id: "prop_cyan",
    name: "Property (Cyan)",
    kind: PD.CardKind.Property,
    count: 2,
    propertyColor: PD.Color.Cyan,
    propertyPayValue: 3
  },
  {
    id: "prop_magenta",
    name: "Property (Magenta)",
    kind: PD.CardKind.Property,
    count: 3,
    propertyColor: PD.Color.Magenta,
    propertyPayValue: 2
  },
  {
    id: "prop_orange",
    name: "Property (Orange)",
    kind: PD.CardKind.Property,
    count: 3,
    propertyColor: PD.Color.Orange,
    propertyPayValue: 2
  },
  {
    id: "prop_black",
    name: "Property (Black)",
    kind: PD.CardKind.Property,
    count: 4,
    propertyColor: PD.Color.Black,
    propertyPayValue: 1
  },
  {
    id: "wild_mo",
    name: "Wild (Magenta/Orange)",
    kind: PD.CardKind.Property,
    count: 1,
    wildColors: [PD.Color.Magenta, PD.Color.Orange],
    propertyPayValue: 2
  },
  {
    id: "wild_cb",
    name: "Wild (Cyan/Black)",
    kind: PD.CardKind.Property,
    count: 1,
    wildColors: [PD.Color.Cyan, PD.Color.Black],
    propertyPayValue: 2
  },

  // Buildings (2)
  { id: "house", name: "House", kind: PD.CardKind.House, count: 2, bankValue: 3 },

  // Actions (9)
  {
    id: "rent_mo",
    name: "Rent (Magenta/Orange)",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.Rent,
    count: 2,
    bankValue: 1,
    rentAllowedColors: [PD.Color.Magenta, PD.Color.Orange]
  },
  {
    id: "rent_cb",
    name: "Rent (Cyan/Black)",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.Rent,
    count: 2,
    bankValue: 1,
    rentAllowedColors: [PD.Color.Cyan, PD.Color.Black]
  },
  {
    id: "rent_any",
    name: "Rent (Any)",
    kind: PD.CardKind.Action,
    actionKind: PD.ActionKind.Rent,
    count: 1,
    bankValue: 1,
    rentAllowedColors: null
  },
  { id: "sly_deal", name: "Sly Deal", kind: PD.CardKind.Action, actionKind: PD.ActionKind.SlyDeal, count: 2, bankValue: 3 },
  { id: "just_say_no", name: "Just Say No", kind: PD.CardKind.Action, actionKind: PD.ActionKind.JustSayNo, count: 2, bankValue: 4 }
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

