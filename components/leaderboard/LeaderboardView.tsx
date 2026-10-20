"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfusingList } from "@/components/leaderboard/ConfusingList";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import {
  LeaderboardTabs,
  type LeaderboardView as LeaderboardViewName,
} from "@/components/leaderboard/LeaderboardTabs";
import { Icon } from "@/components/ui/Icon";
import type { ConfusingItem, LeaderboardItem } from "@/lib/types";

type Props = {
  initialView: LeaderboardViewName;
  scanned: LeaderboardItem[];
  confusing: ConfusingItem[];
  feedbackCount: number;
  error: string | null;
  minFeedback: number;
};

export function LeaderboardView({
  initialView,
  scanned,
  confusing,
  feedbackCount,
  error,
  minFeedback,
}: Props) {
  const [view, setView] = useState<LeaderboardViewName>(initialView);
  const isConfusing = view === "confusing";

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
        <p className="kicker">Public leaderboard</p>
        <h1>{isConfusing ? "Most confusing items." : "Most-scanned items."}</h1>
        <p>
          {isConfusing
            ? "Items where people reported the result was wrong. This is reported confusion, not a confirmed model error."
            : "Counts come from real TrashDex scans. No accounts, no seeded numbers, no fake rankings."}
        </p>
      </div>

      <LeaderboardTabs view={view} onSelect={selectView} />

      {error ? (
        <div className="empty-state" role="alert">
          <div className="empty-icon">
            <Icon name="alert" size={26} />
          </div>
          <h2>Leaderboard unavailable</h2>
          <p>{error}</p>
          <Link className="btn btn-secondary" href="/leaderboard">
            Try again
          </Link>
        </div>
      ) : isConfusing ? (
        confusing.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="alert" size={26} />
            </div>
            <h2>Not enough feedback yet.</h2>
            <p>
              An item needs at least {minFeedback} feedback responses before it can be ranked.{" "}
              {feedbackCount} feedback response{feedbackCount === 1 ? "" : "s"} recorded so far.
            </p>
            <Link className="btn btn-primary" href="/">
              Scan an item
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
          <h2>No scans yet.</h2>
          <p>Be the first to scan an item. The leaderboard fills up from real results only.</p>
          <Link className="btn btn-primary" href="/">
            Scan an item
            <Icon name="arrow-right" size={17} />
          </Link>
        </div>
      ) : (
        <LeaderboardList items={scanned} />
      )}

      <div className="leaderboard-footer">
        <Link className="btn btn-secondary" href="/">
          Back to the scanner
        </Link>
        <Link className="btn btn-secondary" href="/insights">
          Open the insights dashboard
          <Icon name="arrow-right" size={17} />
        </Link>
        <p className="muted-small">
          {isConfusing
            ? "Rankings use the share of feedback responses marked incorrect. Corrections are stored as unverified feedback and are not treated as confirmed errors."
            : "Rankings count the item type the model predicted. Corrections are stored as unverified feedback and do not rewrite scan history."}
        </p>
      </div>
    </main>
  );
}