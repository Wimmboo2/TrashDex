"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { localeCookie, type Locale } from "@/lib/i18n/locale";
import { copy, type Copy } from "@/lib/i18n/messages";

type LanguageValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  copy: Copy;
  /** The other language, used to reserve layout space. */
  reserve: Copy;
};

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = localeCookie(next, window.location.protocol === "https:");
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      copy: copy[locale],
      reserve: locale === "en" ? copy.id : copy.en,
    }),
    [locale, setLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return value;
}
