"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { ActivityChart } from "@/components/insights/ActivityChart";
import { ConfusionPanel } from "@/components/insights/ConfusionPanel";
import { DataNotes } from "@/components/insights/DataNotes";
import { ImpactSummary } from "@/components/insights/ImpactSummary";
import { MaterialBreakdown } from "@/components/insights/MaterialBreakdown";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { Icon } from "@/components/ui/Icon";
import { formatJakartaTimestamp } from "@/lib/format";
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
          Counts come from scans stored on TrashDex. The summary is all time. The chart below is
          only the selected window, so the two numbers can differ.
        </p>
        {data ? (
          <p className="muted-small">Updated {formatJakartaTimestamp(data.generatedAt)}.</p>
        ) : null}
      </div>

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
      ) : data ? (
        <>
          <ImpactSummary
            overview={data.overview}
            minFeedback={data.minFeedback}
            detail="All time. These cards do not follow the 7-day or 30-day chart."
          />

          <section className="insights-block" aria-labelledby="activity-title">
            <div className="section-heading">
              <h2 id="activity-title">Scan activity</h2>
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
            </div>
            <ActivityChart
              points={data.dailyScans}
              range={data.range}
              allTimeTotal={data.overview.totalScans}
            />
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
                <LeaderboardList items={data.topItems} shareLabel="of this window" />
              )}
            </section>
          </div>

          <section className="insights-block" aria-labelledby="confusion-title">
            <h2 id="confusion-title">What people find confusing</h2>
            <p className="muted-small">
              Highest share of incorrect feedback, from all stored responses. An item needs at
              least {data.minFeedback} responses of its own. {data.overview.feedbackCount} response
              {data.overview.feedbackCount === 1 ? "" : "s"} recorded in total. This is reported
              confusion, not a confirmed error rate.
            </p>
            <ConfusionPanel items={data.confusingItems} minFeedback={data.minFeedback} />
          </section>

          {data.overview.totalScans === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Icon name="trash" size={26} />
              </div>
              <h2>No scans recorded yet.</h2>
              <p>
                The chart and cards stay visible so the page has a shape. They fill in from real
                scans only.
              </p>
              <Link className="btn btn-primary" href="/">
                Scan an item
                <Icon name="arrow-right" size={17} />
              </Link>
            </div>
          ) : null}

          <DataNotes minFeedback={data.minFeedback} />
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