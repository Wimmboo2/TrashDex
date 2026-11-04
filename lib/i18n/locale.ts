export type Locale = "en" | "id";

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "id";
}
