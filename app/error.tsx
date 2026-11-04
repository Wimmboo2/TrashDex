"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { StableText } from "@/components/i18n/StableText";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  const { copy: text, reserve } = useI18n();

  return (
    <main className="leaderboard-page">
      <div className="empty-state" role="alert">
        <h1>
          <StableText block text={text.errorPage.title} reserve={reserve.errorPage.title} />
        </h1>
        <p>
          <StableText block text={text.errorPage.body} reserve={reserve.errorPage.body} />
        </p>
        <div className="feedback-actions">
          <button type="button" className="btn btn-primary" onClick={reset}>
            <StableText text={text.errorPage.retry} reserve={reserve.errorPage.retry} />
          </button>
          <Link className="btn btn-secondary" href="/">
            <StableText text={text.errorPage.back} reserve={reserve.errorPage.back} />
          </Link>
        </div>
      </div>
    </main>
  );
}
