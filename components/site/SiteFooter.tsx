"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { StableText } from "@/components/i18n/StableText";

export function SiteFooter() {
  const { copy: text, reserve } = useI18n();

  return (
    <footer className="site-footer">
      <p>
        <StableText block text={text.footer.school} reserve={reserve.footer.school} />
      </p>
      <p>
        <StableText block text={text.footer.photos} reserve={reserve.footer.photos} />
      </p>
      <p>
        <StableText block text={text.footer.guidance} reserve={reserve.footer.guidance} />
      </p>
    </footer>
  );
}
