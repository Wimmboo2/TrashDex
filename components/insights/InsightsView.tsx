"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { ActivityChart } from "@/components/insights/ActivityChart";
import { ConfusionPanel } from "@/components/insights/ConfusionPanel";
import { DataNotes } from "@/components/insights/DataNotes";
import { ImpactSummary } from "@/components/insights/ImpactSummary";
import { MaterialBreakdown } from "@/components/insights/MaterialBreakdown";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { Icon } from "@/components/ui/Icon";
import { formatJakartaTimestamp } from "@/lib/format";
import { countLabel, fill } from "@/lib/i18n/messages";
import type { InsightsData } from "@/lib/types";

type Range = 7 | 30;
type PageError = "unconfigured" | "unavailable";

type Props = {
  initialRange: Range;
  datasets: Record<Range, InsightsData> | null;
  error: PageError | null;
  minFeedback: number;
};

export function InsightsView({ initialRange, datasets, error, minFeedback }: Props) {
  const { locale, copy: text } = useI18n();
  const [range, setRange] = useState<Range>(initialRange);
  const data = datasets ? datasets[range] : null;
  const ranges: { days: Range; label: string }[] = [
    { days: 7, label: text.insights.last7 },
    { days: 30, label: text.insights.last30 },
  ];

  function handleClick(event: MouseEvent<HTMLAnchorElement>, next: Range) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (next === range) return;
    setRange(next);
    window.history.replaceState(null, "", `/insights?range=${next}`);
  }

  const feedbackCount = data
    ? countLabel(
        locale,
        data.overview.feedbackCount,
        text.insights.responseOne,
        text.insights.responseMany,
      )
    : "";

  return (
    <main className="insights-page">
      <div className="insights-head">
        <p className="kicker">{text.insights.kicker}</p>
        <h1>{text.insights.title}</h1>
        <p>{text.insights.intro}</p>
        {data ? (
          <p className="muted-small">
            {fill(text.insights.updated, { time: formatJakartaTimestamp(data.generatedAt, locale) })}
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="empty-state" role="alert">
          <div className="empty-icon">
            <Icon name="alert" size={26} />
          </div>
          <h2>{text.insights.unavailableTitle}</h2>
          <p>{error === "unconfigured" ? text.insights.unconfigured : text.insights.unavailable}</p>
          <Link className="btn btn-secondary" href="/insights">
            {text.insights.retry}
          </Link>
        </div>
      ) : data ? (
        <>
          <ImpactSummary
            overview={data.overview}
            minFeedback={data.minFeedback}
            detail={text.insights.impactDetail}
          />

          <section className="insights-block" aria-labelledby="activity-title">
            <div className="section-heading">
              <h2 id="activity-title">{text.insights.activity}</h2>
              <nav className="view-tabs" aria-label={text.insights.range}>
                {ranges.map((option) => (
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
              <h2 id="breakdown-title">{text.insights.whatPeople}</h2>
              <p className="muted-small">
                {fill(text.insights.materialShare, { range: data.range })}
              </p>
              <MaterialBreakdown items={data.materialBreakdown} />
            </section>

            <section className="insights-block" aria-labelledby="top-title">
              <h2 id="top-title">{text.insights.top}</h2>
              <p className="muted-small">{fill(text.insights.topNote, { range: data.range })}</p>
              {data.topItems.length === 0 ? (
                <p className="muted-small">{text.insights.noneInRange}</p>
              ) : (
                <LeaderboardList items={data.topItems} shareLabel={text.leaderboard.ofWindow} />
              )}
            </section>
          </div>

          <section className="insights-block" aria-labelledby="confusion-title">
            <h2 id="confusion-title">{text.insights.confusing}</h2>
            <p className="muted-small">
              {fill(text.insights.confusingNote, {
                min: data.minFeedback,
                count: feedbackCount,
              })}
            </p>
            <ConfusionPanel items={data.confusingItems} minFeedback={data.minFeedback} />
          </section>

          {data.overview.totalScans === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Icon name="trash" size={26} />
              </div>
              <h2>{text.insights.emptyTitle}</h2>
              <p>{text.insights.emptyBody}</p>
              <Link className="btn btn-primary" href="/">
                {text.insights.scan}
                <Icon name="arrow-right" size={17} />
              </Link>
            </div>
          ) : null}

          <DataNotes minFeedback={data.minFeedback} />
        </>
      ) : null}

      <div className="leaderboard-footer">
        <Link className="btn btn-secondary" href="/leaderboard">
          {text.insights.back}
        </Link>
        <p className="muted-small">{fill(text.insights.minimum, { min: minFeedback })}</p>
      </div>
    </main>
  );
}
