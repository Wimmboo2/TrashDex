export type Locale = "en" | "id";

export const LOCALE_COOKIE = "trashdex-locale";

const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "id";
}

export function parseLocale(value: string | undefined | null): Locale {
  return value === "id" || value === "en" ? value : "en";
}

export function localeCookie(locale: Locale, secure: boolean): string {
  const securePart = secure ? "; Secure" : "";
  return `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_MAX_AGE}; SameSite=Lax${securePart}`;
}
