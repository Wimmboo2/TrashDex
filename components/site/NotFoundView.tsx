"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { StableText } from "@/components/i18n/StableText";

export function NotFoundView() {
  const { copy: text, reserve } = useI18n();

  return (
    <main className="leaderboard-page">
      <div className="empty-state">
        <h1>
          <StableText block text={text.missing.title} reserve={reserve.missing.title} />
        </h1>
        <p>
          <StableText block text={text.missing.body} reserve={reserve.missing.body} />
        </p>
        <Link className="btn btn-primary" href="/">
          <StableText text={text.missing.back} reserve={reserve.missing.back} />
        </Link>
      </div>
    </main>
  );
}
