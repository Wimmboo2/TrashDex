import Link from "next/link";
import { ActivityChart } from "@/components/insights/ActivityChart";
import { ConfusionPanel } from "@/components/insights/ConfusionPanel";
import { DataNotes } from "@/components/insights/DataNotes";
import { MaterialBreakdown } from "@/components/insights/MaterialBreakdown";
import { StatGrid } from "@/components/insights/StatGrid";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { Icon } from "@/components/ui/Icon";
import { getInsights, MIN_FEEDBACK_RESPONSES, parseAnalyticsRange } from "@/lib/analytics";
import { isDatabaseConfigured } from "@/lib/db";
import type { InsightsData } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Insights | TrashDex",
  description: "What people scan on TrashDex, and which items they find confusing.",
};

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawRange = Array.isArray(params.range) ? params.range[0] : params.range;
  const range = parseAnalyticsRange(rawRange);

  let data: InsightsData | null = null;
  let error: string | null = null;

  if (!isDatabaseConfigured()) {
    error = "The insights dashboard is not configured yet. Add DATABASE_URL on the server.";
  } else {
    try {
      data = await getInsights(range);
    } catch {
      error = "The insights dashboard is temporarily unavailable. Try again in a moment.";
    }
  }

  const ranges = [
    { days: 7 as const, label: "Last 7 days" },
    { days: 30 as const, label: "Last 30 days" },
  ];

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
        {ranges.map((option) => (
          <Link
            key={option.days}
            href={`/insights?range=${option.days}`}
            className={`view-tab${range === option.days ? " is-active" : ""}`}
            aria-current={range === option.days ? "page" : undefined}
            scroll={false}
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
              Items with the highest share of incorrect feedback. Needs at least{" "}
              {data.minFeedback} responses, so this is reported confusion and not a confirmed error
              rate.
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
          Minimum feedback responses for a confusion ranking: {MIN_FEEDBACK_RESPONSES}.
        </p>
      </div>
    </main>
  );
}
