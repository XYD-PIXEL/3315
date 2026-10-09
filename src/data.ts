export type Category = "recycling" | "general" | "organics";
export type Scenario = "confident" | "ambiguous" | "unknown";
export type Screen =
  | "scanner"
  | "matching"
  | "candidates"
  | "unknown"
  | "search"
  | "result"
  | "complete"
  | "station-error";
export type Item = {
  id: string;
  name: string;
  description: string;
  category: Category;
  note: string;
  aliases: string[];
  art: "bottle" | "cup" | "container" | "packet" | "banana" | "can" | "paper";
  returnable?: boolean;
};

// Study fixtures only. Part I did not verify campus rules, bin colours or locations.
export const categories: Record<
  Category,
  {
    name: string;
    short: string;
    color: string;
    background: string;
    icon: "recycle" | "trash" | "leaf";
  }
> = {
  recycling: {
    name: "Recycling",
    short: "Recycling",
    color: "#7c5c05",
    background: "#f4d45a",
    icon: "recycle",
  },
  general: {
    name: "General waste",
    short: "General waste",
    color: "#973e37",
    background: "#f0b6aa",
    icon: "trash",
  },
  organics: {
    name: "Food organics",
    short: "Food organics",
    color: "#315940",
    background: "#bcd5a9",
    icon: "leaf",
  },
};
export const items: Item[] = [
  {
    id: "bottle",
    name: "Plastic drink bottle",
    description: "An empty, rigid plastic bottle",
    category: "recycling",
    note: "Empty any liquid first.",
    aliases: ["water", "drink", "plastic", "bottle", "pet"],
    art: "bottle",
    returnable: true,
  },
  {
    id: "coffee-cup",
    name: "Takeaway coffee cup",
    description: "Paper cup with a plastic lining",
    category: "general",
    note: "Empty leftover coffee first.",
    aliases: ["coffee", "cup", "paper", "takeaway"],
    art: "cup",
  },
  {
    id: "container",
    name: "Plastic food container",
    description: "A rigid takeaway container",
    category: "recycling",
    note: "Empty food scraps first.",
    aliases: ["container", "takeaway", "food", "plastic", "lunch"],
    art: "container",
  },
  {
    id: "compostable-cup",
    name: "Compostable cup",
    description: "A cup labelled “compostable”",
    category: "general",
    note: "Demo organics rules exclude packaging.",
    aliases: ["cup", "compostable", "biodegradable"],
    art: "cup",
  },
  {
    id: "packet",
    name: "Chip packet",
    description: "Soft, foil-lined packaging",
    category: "general",
    note: "Keep it out of the recycling bin.",
    aliases: [
      "chips",
      "chip",
      "packet",
      "crisp",
      "wrapper",
      "foil",
      "soft plastic",
    ],
    art: "packet",
  },
  {
    id: "banana",
    name: "Banana peel",
    description: "Food scraps without packaging",
    category: "organics",
    note: "Remove any stickers first.",
    aliases: ["banana", "peel", "food", "fruit", "scraps"],
    art: "banana",
  },
  {
    id: "can",
    name: "Aluminium drink can",
    description: "An empty metal drink can",
    category: "recycling",
    note: "Empty any liquid first.",
    aliases: ["can", "tin", "drink", "metal", "aluminium", "aluminum"],
    art: "can",
    returnable: true,
  },
  {
    id: "paper",
    name: "Clean paper",
    description: "Dry paper without food or grease",
    category: "recycling",
    note: "Keep wet or greasy paper out.",
    aliases: ["paper", "newspaper", "sheet", "cardboard"],
    art: "paper",
  },
];
export const stations = {
  "library-03": {
    name: "Demo Library",
    number: "03",
    bins: ["recycling", "general"] as Category[],
  },
  "food-court-01": {
    name: "Demo Food Court",
    number: "01",
    bins: ["recycling", "general", "organics"] as Category[],
  },
};
export function searchItems(query: string) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return items;
  return items.filter((item) =>
    words.every((word) =>
      [item.name, item.description, ...item.aliases]
        .join(" ")
        .toLowerCase()
        .includes(word),
    ),
  );
}
