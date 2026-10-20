export const MATERIAL_GROUPS = [
  "plastic",
  "glass",
  "metal",
  "paper",
  "organic",
  "textile",
  "electronic",
  "hazardous",
  "rubber",
  "wood",
  "ceramic",
  "composite",
  "other",
] as const;

export type MaterialGroup = (typeof MATERIAL_GROUPS)[number];

export const WASTE_STREAMS = [
  "recycling",
  "organic",
  "hazardous",
  "electronic",
  "textile",
  "landfill",
  "special_dropoff",
  "unknown",
] as const;

export type WasteStream = (typeof WASTE_STREAMS)[number];

export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

export type CanonicalItem = {
  slug: string;
  label: string;
  materialGroup: MaterialGroup;
  defaultWasteStream: WasteStream;
};

export const CANONICAL_ITEMS: CanonicalItem[] = [
  { slug: "plastic-bottle", label: "Plastic bottle", materialGroup: "plastic", defaultWasteStream: "recycling" },
  { slug: "plastic-bag", label: "Plastic bag", materialGroup: "plastic", defaultWasteStream: "special_dropoff" },
  { slug: "plastic-container", label: "Plastic container", materialGroup: "plastic", defaultWasteStream: "recycling" },
  { slug: "plastic-film", label: "Plastic film", materialGroup: "plastic", defaultWasteStream: "special_dropoff" },
  { slug: "plastic-cup", label: "Plastic cup", materialGroup: "plastic", defaultWasteStream: "recycling" },
  { slug: "plastic-cutlery", label: "Plastic cutlery", materialGroup: "plastic", defaultWasteStream: "landfill" },
  { slug: "styrofoam", label: "Styrofoam", materialGroup: "plastic", defaultWasteStream: "landfill" },
  { slug: "plastic-toy", label: "Plastic toy", materialGroup: "plastic", defaultWasteStream: "landfill" },
  { slug: "other-plastic", label: "Other plastic", materialGroup: "plastic", defaultWasteStream: "unknown" },
  { slug: "glass-bottle", label: "Glass bottle", materialGroup: "glass", defaultWasteStream: "recycling" },
  { slug: "glass-jar", label: "Glass jar", materialGroup: "glass", defaultWasteStream: "recycling" },
  { slug: "glass-scrap", label: "Glass scrap", materialGroup: "glass", defaultWasteStream: "special_dropoff" },
  { slug: "ceramic", label: "Ceramic", materialGroup: "ceramic", defaultWasteStream: "landfill" },
  { slug: "aluminum-can", label: "Aluminum can", materialGroup: "metal", defaultWasteStream: "recycling" },
  { slug: "steel-can", label: "Steel can", materialGroup: "metal", defaultWasteStream: "recycling" },
  { slug: "metal-scrap", label: "Metal scrap", materialGroup: "metal", defaultWasteStream: "recycling" },
  { slug: "aerosol-can", label: "Aerosol can", materialGroup: "metal", defaultWasteStream: "hazardous" },
  { slug: "cardboard-box", label: "Cardboard box", materialGroup: "paper", defaultWasteStream: "recycling" },
  { slug: "paper", label: "Paper", materialGroup: "paper", defaultWasteStream: "recycling" },
  { slug: "newspaper", label: "Newspaper", materialGroup: "paper", defaultWasteStream: "recycling" },
  { slug: "paper-cup", label: "Paper cup", materialGroup: "paper", defaultWasteStream: "landfill" },
  { slug: "carton", label: "Carton", materialGroup: "paper", defaultWasteStream: "recycling" },
  { slug: "tissue", label: "Tissue", materialGroup: "paper", defaultWasteStream: "landfill" },
  { slug: "food-scraps", label: "Food scraps", materialGroup: "organic", defaultWasteStream: "organic" },
  { slug: "garden-waste", label: "Garden waste", materialGroup: "organic", defaultWasteStream: "organic" },
  { slug: "battery", label: "Battery", materialGroup: "hazardous", defaultWasteStream: "hazardous" },
  { slug: "e-waste", label: "Electronic waste", materialGroup: "electronic", defaultWasteStream: "electronic" },
  { slug: "light-bulb", label: "Light bulb", materialGroup: "hazardous", defaultWasteStream: "hazardous" },
  { slug: "cable", label: "Cable", materialGroup: "electronic", defaultWasteStream: "electronic" },
  { slug: "medical-waste", label: "Medical waste", materialGroup: "hazardous", defaultWasteStream: "hazardous" },
  { slug: "clothing", label: "Clothing", materialGroup: "textile", defaultWasteStream: "textile" },
  { slug: "shoes", label: "Shoes", materialGroup: "textile", defaultWasteStream: "textile" },
  { slug: "textile-scrap", label: "Textile scrap", materialGroup: "textile", defaultWasteStream: "textile" },
  { slug: "composite-packaging", label: "Composite packaging", materialGroup: "composite", defaultWasteStream: "unknown" },
  { slug: "wood", label: "Wood", materialGroup: "wood", defaultWasteStream: "special_dropoff" },
  { slug: "rubber", label: "Rubber", materialGroup: "rubber", defaultWasteStream: "special_dropoff" },
  { slug: "other", label: "Other", materialGroup: "other", defaultWasteStream: "unknown" },
];

export const CANONICAL_ITEM_SLUGS = CANONICAL_ITEMS.map((item) => item.slug);
export const CANONICAL_ITEM_SLUG_SET = new Set(CANONICAL_ITEM_SLUGS);

const CANONICAL_ITEM_BY_SLUG = new Map(CANONICAL_ITEMS.map((item) => [item.slug, item]));

export function getCanonicalItem(slug: string): CanonicalItem | undefined {
  return CANONICAL_ITEM_BY_SLUG.get(slug);
}

export const MATERIAL_GROUP_LABELS: Record<MaterialGroup, string> = {
  plastic: "Plastic",
  glass: "Glass",
  metal: "Metal",
  paper: "Paper and card",
  organic: "Organic",
  textile: "Textile",
  electronic: "Electronic",
  hazardous: "Hazardous",
  rubber: "Rubber",
  wood: "Wood",
  ceramic: "Ceramic",
  composite: "Composite",
  other: "Other",
};

export const WASTE_STREAM_LABELS: Record<WasteStream, string> = {
  recycling: "Recycling",
  organic: "Organic",
  hazardous: "Hazardous (B3)",
  electronic: "E-waste",
  textile: "Textile",
  landfill: "Residual",
  special_dropoff: "Special drop-off",
  unknown: "Check locally",
};
