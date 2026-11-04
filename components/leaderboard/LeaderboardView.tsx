"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { StableText } from "@/components/i18n/StableText";
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
import type { Locale } from "@/lib/i18n/locale";
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
  const { locale, copy: text, reserve } = useI18n();
  const other: Locale = locale === "en" ? "id" : "en";
  const [view, setView] = useState<LeaderboardViewName>(initialView);
  const isConfusing = view === "confusing";
  const feedbackTotal = overview?.feedbackCount ?? 0;
  const feedbackCount = countLabel(
    locale,
    feedbackTotal,
    text.insights.responseOne,
    text.insights.responseMany,
  );
  const feedbackCountReserve = countLabel(
    other,
    feedbackTotal,
    reserve.insights.responseOne,
    reserve.insights.responseMany,
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
        <p className="kicker">
          <StableText block text={text.leaderboard.kicker} reserve={reserve.leaderboard.kicker} />
        </p>
        <h1>
          <StableText
            block
            text={isConfusing ? text.leaderboard.confusingTitle : text.leaderboard.scannedTitle}
            reserve={
              isConfusing ? reserve.leaderboard.confusingTitle : reserve.leaderboard.scannedTitle
            }
          />
        </h1>
        <p>
          <StableText
            block
            text={isConfusing ? text.leaderboard.confusingIntro : text.leaderboard.scannedIntro}
            reserve={
              isConfusing ? reserve.leaderboard.confusingIntro : reserve.leaderboard.scannedIntro
            }
          />
        </p>
        {updatedAt ? (
          <p className="muted-small">
            <StableText
              block
              text={fill(text.leaderboard.updated, {
                time: formatJakartaTimestamp(updatedAt, locale),
              })}
              reserve={fill(reserve.leaderboard.updated, {
                time: formatJakartaTimestamp(updatedAt, other),
              })}
            />
          </p>
        ) : null}
      </div>

      {!error && overview ? (
        <ImpactSummary
          overview={overview}
          minFeedback={minFeedback}
          detail={text.leaderboard.impactDetail}
          detailReserve={reserve.leaderboard.impactDetail}
        />
      ) : null}

      <LeaderboardTabs view={view} onSelect={selectView} />

      {error ? (
        <div className="empty-state" role="alert">
          <div className="empty-icon">
            <Icon name="alert" size={26} />
          </div>
          <h2>
            <StableText
              block
              text={text.leaderboard.unavailableTitle}
              reserve={reserve.leaderboard.unavailableTitle}
            />
          </h2>
          <p>
            <StableText
              block
              text={
                error === "unconfigured"
                  ? text.leaderboard.unconfigured
                  : text.leaderboard.unavailable
              }
              reserve={
                error === "unconfigured"
                  ? reserve.leaderboard.unconfigured
                  : reserve.leaderboard.unavailable
              }
            />
          </p>
          <Link className="btn btn-secondary" href="/leaderboard">
            <StableText text={text.leaderboard.retry} reserve={reserve.leaderboard.retry} />
          </Link>
        </div>
      ) : isConfusing ? (
        confusing.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="alert" size={26} />
            </div>
            <h2>
              <StableText
                block
                text={text.leaderboard.notEnough}
                reserve={reserve.leaderboard.notEnough}
              />
            </h2>
            <p>
              <StableText
                block
                text={fill(text.leaderboard.notEnoughBody, {
                  min: minFeedback,
                  count: feedbackCount,
                })}
                reserve={fill(reserve.leaderboard.notEnoughBody, {
                  min: minFeedback,
                  count: feedbackCountReserve,
                })}
              />
            </p>
            <Link className="btn btn-primary" href="/">
              <StableText text={text.leaderboard.scan} reserve={reserve.leaderboard.scan} />
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
          <h2>
            <StableText block text={text.leaderboard.noScans} reserve={reserve.leaderboard.noScans} />
          </h2>
          <p>
            <StableText
              block
              text={text.leaderboard.noScansBody}
              reserve={reserve.leaderboard.noScansBody}
            />
          </p>
          <Link className="btn btn-primary" href="/">
            <StableText text={text.leaderboard.scan} reserve={reserve.leaderboard.scan} />
            <Icon name="arrow-right" size={17} />
          </Link>
        </div>
      ) : (
        <LeaderboardList items={scanned} />
      )}

      <div className="leaderboard-footer">
        <Link className="btn btn-secondary" href="/">
          <StableText text={text.leaderboard.back} reserve={reserve.leaderboard.back} />
        </Link>
        <Link className="btn btn-secondary" href="/insights">
          <StableText text={text.leaderboard.insights} reserve={reserve.leaderboard.insights} />
          <Icon name="arrow-right" size={17} />
        </Link>
        <p className="muted-small">
          <StableText
            block
            text={isConfusing ? text.leaderboard.confusingNote : text.leaderboard.scannedNote}
            reserve={
              isConfusing ? reserve.leaderboard.confusingNote : reserve.leaderboard.scannedNote
            }
          />
        </p>
      </div>
    </main>
  );
}
