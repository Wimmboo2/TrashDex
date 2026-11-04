"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/LanguageProvider";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  const { copy: text } = useI18n();

  return (
    <main className="leaderboard-page">
      <div className="empty-state" role="alert">
        <h1>{text.errorPage.title}</h1>
        <p>{text.errorPage.body}</p>
        <div className="feedback-actions">
          <button type="button" className="btn btn-primary" onClick={reset}>
            {text.errorPage.retry}
          </button>
          <Link className="btn btn-secondary" href="/">
            {text.errorPage.back}
          </Link>
        </div>
      </div>
    </main>
  );
}
