"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { StableText } from "@/components/i18n/StableText";
import { ActivityChart } from "@/components/insights/ActivityChart";
import { ConfusionPanel } from "@/components/insights/ConfusionPanel";
import { DataNotes } from "@/components/insights/DataNotes";
import { ImpactSummary } from "@/components/insights/ImpactSummary";
import { MaterialBreakdown } from "@/components/insights/MaterialBreakdown";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { Icon } from "@/components/ui/Icon";
import { formatJakartaTimestamp } from "@/lib/format";
import { countLabel, fill } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
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
  const { locale, copy: text, reserve } = useI18n();
  const other: Locale = locale === "en" ? "id" : "en";
  const [range, setRange] = useState<Range>(initialRange);
  const data = datasets ? datasets[range] : null;
  const ranges: { days: Range; label: string; held: string }[] = [
    { days: 7, label: text.insights.last7, held: reserve.insights.last7 },
    { days: 30, label: text.insights.last30, held: reserve.insights.last30 },
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
  const feedbackCountReserve = data
    ? countLabel(
        other,
        data.overview.feedbackCount,
        reserve.insights.responseOne,
        reserve.insights.responseMany,
      )
    : "";

  return (
    <main className="insights-page">
      <div className="insights-head">
        <p className="kicker">
          <StableText block text={text.insights.kicker} reserve={reserve.insights.kicker} />
        </p>
        <h1>
          <StableText block text={text.insights.title} reserve={reserve.insights.title} />
        </h1>
        <p>
          <StableText block text={text.insights.intro} reserve={reserve.insights.intro} />
        </p>
        {data ? (
          <p className="muted-small">
            <StableText
              block
              text={fill(text.insights.updated, {
                time: formatJakartaTimestamp(data.generatedAt, locale),
              })}
              reserve={fill(reserve.insights.updated, {
                time: formatJakartaTimestamp(data.generatedAt, other),
              })}
            />
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="empty-state" role="alert">
          <div className="empty-icon">
            <Icon name="alert" size={26} />
          </div>
          <h2>
            <StableText
              block
              text={text.insights.unavailableTitle}
              reserve={reserve.insights.unavailableTitle}
            />
          </h2>
          <p>
            <StableText
              block
              text={error === "unconfigured" ? text.insights.unconfigured : text.insights.unavailable}
              reserve={
                error === "unconfigured"
                  ? reserve.insights.unconfigured
                  : reserve.insights.unavailable
              }
            />
          </p>
          <Link className="btn btn-secondary" href="/insights">
            <StableText text={text.insights.retry} reserve={reserve.insights.retry} />
          </Link>
        </div>
      ) : data ? (
        <>
          <ImpactSummary
            overview={data.overview}
            minFeedback={data.minFeedback}
            detail={text.insights.impactDetail}
            detailReserve={reserve.insights.impactDetail}
          />

          <section className="insights-block" aria-labelledby="activity-title">
            <div className="section-heading">
              <h2 id="activity-title">
                <StableText block text={text.insights.activity} reserve={reserve.insights.activity} />
              </h2>
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
                    <StableText text={option.label} reserve={option.held} />
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
              <h2 id="breakdown-title">
                <StableText
                  block
                  text={text.insights.whatPeople}
                  reserve={reserve.insights.whatPeople}
                />
              </h2>
              <p className="muted-small">
                <StableText
                  block
                  text={fill(text.insights.materialShare, { range: data.range })}
                  reserve={fill(reserve.insights.materialShare, { range: data.range })}
                />
              </p>
              <MaterialBreakdown items={data.materialBreakdown} />
            </section>

            <section className="insights-block" aria-labelledby="top-title">
              <h2 id="top-title">
                <StableText block text={text.insights.top} reserve={reserve.insights.top} />
              </h2>
              <p className="muted-small">
                <StableText
                  block
                  text={fill(text.insights.topNote, { range: data.range })}
                  reserve={fill(reserve.insights.topNote, { range: data.range })}
                />
              </p>
              {data.topItems.length === 0 ? (
                <p className="muted-small">
                  <StableText
                    block
                    text={text.insights.noneInRange}
                    reserve={reserve.insights.noneInRange}
                  />
                </p>
              ) : (
                <LeaderboardList
                  items={data.topItems}
                  shareLabel={text.leaderboard.ofWindow}
                  shareReserve={reserve.leaderboard.ofWindow}
                />
              )}
            </section>
          </div>

          <section className="insights-block" aria-labelledby="confusion-title">
            <h2 id="confusion-title">
              <StableText block text={text.insights.confusing} reserve={reserve.insights.confusing} />
            </h2>
            <p className="muted-small">
              <StableText
                block
                text={fill(text.insights.confusingNote, {
                  min: data.minFeedback,
                  count: feedbackCount,
                })}
                reserve={fill(reserve.insights.confusingNote, {
                  min: data.minFeedback,
                  count: feedbackCountReserve,
                })}
              />
            </p>
            <ConfusionPanel items={data.confusingItems} minFeedback={data.minFeedback} />
          </section>

          {data.overview.totalScans === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Icon name="trash" size={26} />
              </div>
              <h2>
                <StableText
                  block
                  text={text.insights.emptyTitle}
                  reserve={reserve.insights.emptyTitle}
                />
              </h2>
              <p>
                <StableText
                  block
                  text={text.insights.emptyBody}
                  reserve={reserve.insights.emptyBody}
                />
              </p>
              <Link className="btn btn-primary" href="/">
                <StableText text={text.insights.scan} reserve={reserve.insights.scan} />
                <Icon name="arrow-right" size={17} />
              </Link>
            </div>
          ) : null}

          <DataNotes minFeedback={data.minFeedback} />
        </>
      ) : null}

      <div className="leaderboard-footer">
        <Link className="btn btn-secondary" href="/leaderboard">
          <StableText text={text.insights.back} reserve={reserve.insights.back} />
        </Link>
        <p className="muted-small">
          <StableText
            block
            text={fill(text.insights.minimum, { min: minFeedback })}
            reserve={fill(reserve.insights.minimum, { min: minFeedback })}
          />
        </p>
      </div>
    </main>
  );
}
