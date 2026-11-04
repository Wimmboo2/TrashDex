"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { ImpactSummary } from "@/components/insights/ImpactSummary";
import { ConfusingList } from "@/components/leaderboard/ConfusingList";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import {
  LeaderboardTabs,
  type LeaderboardView as LeaderboardViewName,
} from "@/components/leaderboard/LeaderboardTabs";
import { Icon } from "@/components/ui/Icon";
import { formatJakartaTimestamp } from "@/lib/format";
import { countLabel, fill } from "@/lib/i18n/messages";
import type { ConfusingItem, LeaderboardItem, Overview } from "@/lib/types";

type PageError = "unconfigured" | "unavailable";

type Props = {
  initialView: LeaderboardViewName;
  scanned: LeaderboardItem[];
  confusing: ConfusingItem[];
  overview: Overview | null;
  updatedAt: string | null;
  error: PageError | null;
  minFeedback: number;
};

export function LeaderboardView({
  initialView,
  scanned,
  confusing,
  overview,
  updatedAt,
  error,
  minFeedback,
}: Props) {
  const { locale, copy: text } = useI18n();
  const [view, setView] = useState<LeaderboardViewName>(initialView);
  const isConfusing = view === "confusing";
  const feedbackCount = countLabel(
    locale,
    overview?.feedbackCount ?? 0,
    text.insights.responseOne,
    text.insights.responseMany,
  );

  function selectView(next: LeaderboardViewName) {
    if (next === view) return;
    setView(next);
    window.history.replaceState(
      null,
      "",
      next === "confusing" ? "/leaderboard?view=confusing" : "/leaderboard?view=scanned",
    );
  }

  return (
    <main className="leaderboard-page">
      <div className="leaderboard-head">
        <p className="kicker">{text.leaderboard.kicker}</p>
        <h1>{isConfusing ? text.leaderboard.confusingTitle : text.leaderboard.scannedTitle}</h1>
        <p>{isConfusing ? text.leaderboard.confusingIntro : text.leaderboard.scannedIntro}</p>
        {updatedAt ? (
          <p className="muted-small">
            {fill(text.leaderboard.updated, { time: formatJakartaTimestamp(updatedAt, locale) })}
          </p>
        ) : null}
      </div>

      {!error && overview ? (
        <ImpactSummary
          overview={overview}
          minFeedback={minFeedback}
          detail={text.leaderboard.impactDetail}
        />
      ) : null}

      <LeaderboardTabs view={view} onSelect={selectView} />

      {error ? (
        <div className="empty-state" role="alert">
          <div className="empty-icon">
            <Icon name="alert" size={26} />
          </div>
          <h2>{text.leaderboard.unavailableTitle}</h2>
          <p>
            {error === "unconfigured" ? text.leaderboard.unconfigured : text.leaderboard.unavailable}
          </p>
          <Link className="btn btn-secondary" href="/leaderboard">
            {text.leaderboard.retry}
          </Link>
        </div>
      ) : isConfusing ? (
        confusing.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="alert" size={26} />
            </div>
            <h2>{text.leaderboard.notEnough}</h2>
            <p>
              {fill(text.leaderboard.notEnoughBody, {
                min: minFeedback,
                count: feedbackCount,
              })}
            </p>
            <Link className="btn btn-primary" href="/">
              {text.leaderboard.scan}
              <Icon name="arrow-right" size={17} />
            </Link>
          </div>
        ) : (
          <ConfusingList items={confusing} minFeedback={minFeedback} />
        )
      ) : scanned.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="trash" size={26} />
          </div>
          <h2>{text.leaderboard.noScans}</h2>
          <p>{text.leaderboard.noScansBody}</p>
          <Link className="btn btn-primary" href="/">
            {text.leaderboard.scan}
            <Icon name="arrow-right" size={17} />
          </Link>
        </div>
      ) : (
        <LeaderboardList items={scanned} />
      )}

      <div className="leaderboard-footer">
        <Link className="btn btn-secondary" href="/">
          {text.leaderboard.back}
        </Link>
        <Link className="btn btn-secondary" href="/insights">
          {text.leaderboard.insights}
          <Icon name="arrow-right" size={17} />
        </Link>
        <p className="muted-small">
          {isConfusing ? text.leaderboard.confusingNote : text.leaderboard.scannedNote}
        </p>
      </div>
    </main>
  );
}
