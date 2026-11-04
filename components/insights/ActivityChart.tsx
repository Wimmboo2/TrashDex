"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { countLabel, fill } from "@/lib/i18n/messages";
import { formatCalendarDate } from "@/lib/format";
import type { DailyScanPoint } from "@/lib/types";

export function ActivityChart({
  points,
  range,
  allTimeTotal,
}: {
  points: DailyScanPoint[];
  range: 7 | 30;
  allTimeTotal: number;
}) {
  const { locale, copy: text } = useI18n();
  const max = Math.max(1, ...points.map((point) => point.scanCount));
  const windowTotal = points.reduce((sum, point) => sum + point.scanCount, 0);
  const busiest = points.reduce(
    (best, point) => (point.scanCount > best.scanCount ? point : best),
    points[0] ?? { date: "", scanCount: 0 },
  );
  const first = formatCalendarDate(points[0]?.date ?? "", true, locale);
  const last = formatCalendarDate(points[points.length - 1]?.date ?? "", true, locale);
  const busiestLabel = formatCalendarDate(busiest.date, true, locale);
  const scans = (count: number) =>
    countLabel(locale, count, text.leaderboard.scanOne, text.leaderboard.scanMany);

  const comparison =
    allTimeTotal === windowTotal
      ? fill(text.insights.matches, { count: scans(allTimeTotal) })
      : fill(text.insights.differs, {
          allTime: scans(allTimeTotal),
          window: scans(windowTotal),
          range,
        });

  return (
    <figure className="chart">
      <figcaption className="chart-caption">
        <span>{fill(text.insights.windowCaption, { count: scans(windowTotal), range })}</span>
        <span>
          {busiest.scanCount > 0
            ? fill(text.insights.busiest, { date: busiestLabel, count: scans(busiest.scanCount) })
            : text.insights.noWindow}
        </span>
      </figcaption>
      <p className="chart-compare">{comparison}</p>

      <div
        className="chart-bars"
        role="img"
        aria-label={fill(text.insights.chartLabel, {
          range,
          window: scans(windowTotal),
          allTime: scans(allTimeTotal),
        })}
      >
        {points.map((point) => {
          const label = formatCalendarDate(point.date, true, locale);
          return (
            <span className="chart-col" key={point.date} title={`${label}: ${point.scanCount}`}>
              <span
                className="chart-bar"
                style={{
                  height: point.scanCount === 0 ? "0%" : `${(point.scanCount / max) * 100}%`,
                  minHeight: point.scanCount > 0 ? 3 : 0,
                }}
              />
            </span>
          );
        })}
      </div>

      <div className="chart-axis">
        <span>{first}</span>
        <span>{last}</span>
      </div>

      <details className="chart-data">
        <summary>{text.insights.viewNumbers}</summary>
        <table className="chart-table">
          <thead>
            <tr>
              <th scope="col">{text.insights.date}</th>
              <th scope="col">{text.insights.scans}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.date}>
                <td>{formatCalendarDate(point.date, true, locale)}</td>
                <td>{point.scanCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
