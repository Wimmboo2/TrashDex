"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function NotFoundView() {
  const { copy: text } = useI18n();

  return (
    <main className="leaderboard-page">
      <div className="empty-state">
        <h1>{text.missing.title}</h1>
        <p>{text.missing.body}</p>
        <Link className="btn btn-primary" href="/">
          {text.missing.back}
        </Link>
      </div>
    </main>
  );
}
