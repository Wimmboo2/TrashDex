"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { copy, type Copy } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";

type LanguageValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  copy: Copy;
  /** The other language, used to reserve layout space. */
  reserve: Copy;
};

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      copy: copy[locale],
      reserve: locale === "en" ? copy.id : copy.en,
    }),
    [locale],
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
