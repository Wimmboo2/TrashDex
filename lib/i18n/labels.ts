import {
  getCanonicalItem,
  MATERIAL_GROUP_LABELS,
  WASTE_STREAM_LABELS,
  type MaterialGroup,
  type WasteStream,
} from "@/lib/taxonomy";
import type { Locale } from "@/lib/i18n/locale";

const MATERIAL_ID: Record<MaterialGroup, string> = {
  plastic: "Plastik",
  glass: "Kaca",
  metal: "Logam",
  paper: "Kertas dan kardus",
  organic: "Organik",
  textile: "Tekstil",
  electronic: "Elektronik",
  hazardous: "Limbah B3",
  rubber: "Karet",
  wood: "Kayu",
  ceramic: "Keramik",
  composite: "Campuran",
  other: "Lainnya",
};

const STREAM_ID: Record<WasteStream, string> = {
  recycling: "Daur ulang",
  organic: "Organik",
  hazardous: "Limbah B3",
  electronic: "Limbah elektronik",
  textile: "Tekstil",
  landfill: "Residu",
  special_dropoff: "Pengumpulan khusus",
  unknown: "Periksa setempat",
};

const ITEM_ID: Record<string, string> = {
  "plastic-bottle": "Botol plastik",
  "plastic-bag": "Kantong plastik",
  "plastic-container": "Wadah plastik",
  "plastic-film": "Plastik tipis",
  "plastic-cup": "Gelas plastik",
  "plastic-cutlery": "Alat makan plastik",
  styrofoam: "Styrofoam",
  "plastic-toy": "Mainan plastik",
  "other-plastic": "Plastik lain",
  "glass-bottle": "Botol kaca",
  "glass-jar": "Stoples kaca",
  "glass-scrap": "Pecahan kaca",
  ceramic: "Keramik",
  "aluminum-can": "Kaleng aluminium",
  "steel-can": "Kaleng baja",
  "metal-scrap": "Logam bekas",
  "aerosol-can": "Kaleng aerosol",
  "cardboard-box": "Kardus",
  paper: "Kertas",
  newspaper: "Koran",
  "paper-cup": "Gelas kertas",
  carton: "Karton",
  tissue: "Tisu",
  "food-scraps": "Sisa makanan",
  "garden-waste": "Sampah kebun",
  battery: "Baterai",
  "e-waste": "Limbah elektronik",
  "light-bulb": "Bohlam",
  cable: "Kabel",
  "medical-waste": "Limbah medis",
  clothing: "Pakaian",
  shoes: "Sepatu",
  "textile-scrap": "Kain perca",
  "composite-packaging": "Kemasan campuran",
  wood: "Kayu",
  rubber: "Karet",
  other: "Lainnya",
};

export function materialLabel(locale: Locale, group: MaterialGroup): string {
  return locale === "id" ? MATERIAL_ID[group] : MATERIAL_GROUP_LABELS[group];
}

export function streamLabel(locale: Locale, stream: WasteStream): string {
  return locale === "id" ? STREAM_ID[stream] : WASTE_STREAM_LABELS[stream];
}

export function itemLabel(locale: Locale, slug: string, fallback: string): string {
  if (locale === "id" && ITEM_ID[slug]) return ITEM_ID[slug];
  return getCanonicalItem(slug)?.label ?? fallback;
}
