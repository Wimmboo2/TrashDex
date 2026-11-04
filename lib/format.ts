import type { Locale } from "@/lib/i18n/locale";

const MONTHS: Record<Locale, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  id: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
};

export function formatCount(value: number, locale: Locale = "en"): string {
  return value.toLocaleString(locale === "id" ? "id-ID" : "en-US");
}

/** Format a reporting calendar date (YYYY-MM-DD) without shifting it through a time zone. */
export function formatCalendarDate(isoDate: string, withYear = true, locale: Locale = "en"): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;
  const month = MONTHS[locale][Number(match[2]) - 1];
  const day = Number(match[3]);
  if (!month || day < 1 || day > 31) return isoDate;
  return withYear ? `${day} ${month} ${match[1]}` : `${day} ${month}`;
}

/** Format an instant in Asia/Jakarta. The label says WIB so the zone is explicit. */
export function formatJakartaTimestamp(iso: string, locale: Locale = "en"): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const formatted = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
  return `${formatted} WIB`;
}
