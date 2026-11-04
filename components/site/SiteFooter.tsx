"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";

export function SiteFooter() {
  const { copy: text } = useI18n();

  return (
    <footer className="site-footer">
      <p>{text.footer.school}</p>
      <p>{text.footer.photos}</p>
      <p>{text.footer.guidance}</p>
    </footer>
  );
}
