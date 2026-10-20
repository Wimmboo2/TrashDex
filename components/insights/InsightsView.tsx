"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { ActivityChart } from "@/components/insights/ActivityChart";
import { ConfusionPanel } from "@/components/insights/ConfusionPanel";
import { DataNotes } from "@/components/insights/DataNotes";
import { MaterialBreakdown } from "@/components/insights/MaterialBreakdown";
import { StatGrid } from "@/components/insights/StatGrid";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { Icon } from "@/components/ui/Icon";
import type { InsightsData } from "@/lib/types";

type Range = 7 | 30;

type Props = {
  initialRange: Range;
  datasets: Record<Range, InsightsData> | null;
  error: string | null;
  minFeedback: number;
};

const RANGES: { days: Range; label: string }[] = [
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
];

export function InsightsView({ initialRange, datasets, error, minFeedback }: Props) {
  const [range, setRange] = useState<Range>(initialRange);
  const data = datasets ? datasets[range] : null;

  function handleClick(event: MouseEvent<HTMLAnchorElement>, next: Range) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (next === range) return;
    setRange(next);
    window.history.replaceState(null, "", `/insights?range=${next}`);
  }

  return (
    <main className="insights-page">
      <div className="insights-head">
        <p className="kicker">Insights</p>
        <h1>What the scans say.</h1>
        <p>
          Activity observed on TrashDex, counted from real scans. This is not a measurement of
          real-world waste.
        </p>
      </div>

      <nav className="view-tabs" aria-label="Date range">
        {RANGES.map((option) => (
          <Link
            key={option.days}
            href={`/insights?range=${option.days}`}
            className={`view-tab${range === option.days ? " is-active" : ""}`}
            aria-current={range === option.days ? "page" : undefined}
            scroll={false}
            onClick={(event) => handleClick(event, option.days)}
          >
            {option.label}
          </Link>
        ))}
      </nav>

      {error ? (
        <div className="empty-state" role="alert">
          <div className="empty-icon">
            <Icon name="alert" size={26} />
          </div>
          <h2>Insights unavailable</h2>
          <p>{error}</p>
          <Link className="btn btn-secondary" href="/insights">
            Try again
          </Link>
        </div>
      ) : data && data.overview.totalScans === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="trash" size={26} />
          </div>
          <h2>No scans recorded yet.</h2>
          <p>
            Every number on this page comes from real scans. Scan something and the dashboard fills
            in on its own.
          </p>
          <Link className="btn btn-primary" href="/">
            Scan an item
            <Icon name="arrow-right" size={17} />
          </Link>
        </div>
      ) : data ? (
        <>
          <StatGrid overview={data.overview} />

          <section className="insights-block" aria-labelledby="activity-title">
            <h2 id="activity-title">Scan activity</h2>
            <ActivityChart points={data.dailyScans} range={data.range} />
          </section>

          <div className="insights-columns">
            <section className="insights-block" aria-labelledby="breakdown-title">
              <h2 id="breakdown-title">What people scan</h2>
              <p className="muted-small">
                Share of scans in the last {data.range} days, grouped by material.
              </p>
              <MaterialBreakdown items={data.materialBreakdown} />
            </section>

            <section className="insights-block" aria-labelledby="top-title">
              <h2 id="top-title">Most scanned in this range</h2>
              <p className="muted-small">Top item types from the last {data.range} days.</p>
              {data.topItems.length === 0 ? (
                <p className="muted-small">No scans recorded in this range yet.</p>
              ) : (
                <LeaderboardList items={data.topItems} />
              )}
            </section>
          </div>

          <section className="insights-block" aria-labelledby="confusion-title">
            <h2 id="confusion-title">What people find confusing</h2>
            <p className="muted-small">
              Items with the highest share of incorrect feedback. Needs at least {data.minFeedback}{" "}
              responses, so this is reported confusion and not a confirmed error rate.
            </p>
            <ConfusionPanel items={data.confusingItems} minFeedback={data.minFeedback} />
          </section>

          <DataNotes />
        </>
      ) : null}

      <div className="leaderboard-footer">
        <Link className="btn btn-secondary" href="/leaderboard">
          Back to the leaderboard
        </Link>
        <p className="muted-small">
          Minimum feedback responses for a confusion ranking: {minFeedback}.
        </p>
      </div>
    </main>
  );
}