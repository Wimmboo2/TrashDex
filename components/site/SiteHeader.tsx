"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { StableText } from "@/components/i18n/StableText";
import type { Locale } from "@/lib/i18n/locale";

const LINKS = [
  { href: "/", key: "scanner" },
  { href: "/leaderboard", key: "leaderboard" },
  { href: "/insights", key: "insights" },
] as const;

function isCurrent(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const { locale, setLocale, copy: text, reserve } = useI18n();

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label={text.nav.home}>
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" role="presentation" focusable="false">
            <rect width="64" height="64" rx="18" fill="#8c491a" />
            <path
              d="M18 22h28M26 22v-4h12v4M22 22l2 26h16l2-26"
              fill="none"
              stroke="#f5ead8"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>TrashDex</span>
      </Link>
      <nav className="site-nav" aria-label={text.nav.main}>
        <div className="lang-toggle" role="group" aria-label={text.nav.language} data-locale={locale}>
          <span className="lang-toggle-thumb" aria-hidden="true" />
          {(["id", "en"] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={locale === option ? "is-active" : undefined}
              aria-pressed={locale === option}
              aria-label={option === "id" ? text.nav.indonesian : text.nav.english}
              onClick={() => setLocale(option as Locale)}
            >
              {option === "id" ? "ID" : "EN"}
            </button>
          ))}
        </div>
        {LINKS.map((link) => {
          const current = isCurrent(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={current ? "is-active" : undefined}
              aria-current={current ? "page" : undefined}
            >
              <StableText text={text.nav[link.key]} reserve={reserve.nav[link.key]} />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
