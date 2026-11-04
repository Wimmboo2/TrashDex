"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { StableText } from "@/components/i18n/StableText";
import { countLabel, fill, type Copy } from "@/lib/i18n/messages";
import { formatCalendarDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n/locale";
import type { DailyScanPoint } from "@/lib/types";

function scans(count: number, locale: Locale, pack: Copy) {
  return countLabel(locale, count, pack.leaderboard.scanOne, pack.leaderboard.scanMany);
}

export function ActivityChart({
  points,
  range,
  allTimeTotal,
}: {
  points: DailyScanPoint[];
  range: 7 | 30;
  allTimeTotal: number;
}) {
  const { locale, copy: text, reserve } = useI18n();
  const other: Locale = locale === "en" ? "id" : "en";
  const max = Math.max(1, ...points.map((point) => point.scanCount));
  const windowTotal = points.reduce((sum, point) => sum + point.scanCount, 0);
  const busiest = points.reduce(
    (best, point) => (point.scanCount > best.scanCount ? point : best),
    points[0] ?? { date: "", scanCount: 0 },
  );
  const first = formatCalendarDate(points[0]?.date ?? "", true, locale);
  const firstHeld = formatCalendarDate(points[0]?.date ?? "", true, other);
  const last = formatCalendarDate(points[points.length - 1]?.date ?? "", true, locale);
  const lastHeld = formatCalendarDate(points[points.length - 1]?.date ?? "", true, other);
  const busiestLabel = formatCalendarDate(busiest.date, true, locale);
  const busiestHeld = formatCalendarDate(busiest.date, true, other);

  const comparison =
    allTimeTotal === windowTotal
      ? fill(text.insights.matches, { count: scans(allTimeTotal, locale, text) })
      : fill(text.insights.differs, {
          allTime: scans(allTimeTotal, locale, text),
          window: scans(windowTotal, locale, text),
          range,
        });
  const comparisonReserve =
    allTimeTotal === windowTotal
      ? fill(reserve.insights.matches, { count: scans(allTimeTotal, other, reserve) })
      : fill(reserve.insights.differs, {
          allTime: scans(allTimeTotal, other, reserve),
          window: scans(windowTotal, other, reserve),
          range,
        });

  const windowCaption = fill(text.insights.windowCaption, {
    count: scans(windowTotal, locale, text),
    range,
  });
  const windowCaptionReserve = fill(reserve.insights.windowCaption, {
    count: scans(windowTotal, other, reserve),
    range,
  });
  const busiestCaption =
    busiest.scanCount > 0
      ? fill(text.insights.busiest, {
          date: busiestLabel,
          count: scans(busiest.scanCount, locale, text),
        })
      : text.insights.noWindow;
  const busiestCaptionReserve =
    busiest.scanCount > 0
      ? fill(reserve.insights.busiest, {
          date: busiestHeld,
          count: scans(busiest.scanCount, other, reserve),
        })
      : reserve.insights.noWindow;

  return (
    <figure className="chart">
      <figcaption className="chart-caption">
        <span>
          <StableText block text={windowCaption} reserve={windowCaptionReserve} />
        </span>
        <span>
          <StableText block text={busiestCaption} reserve={busiestCaptionReserve} />
        </span>
      </figcaption>
      <p className="chart-compare">
        <StableText block text={comparison} reserve={comparisonReserve} />
      </p>

      <div
        className="chart-bars"
        role="img"
        aria-label={fill(text.insights.chartLabel, {
          range,
          window: scans(windowTotal, locale, text),
          allTime: scans(allTimeTotal, locale, text),
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
        <span>
          <StableText align="start" text={first} reserve={firstHeld} />
        </span>
        <span>
          <StableText align="end" text={last} reserve={lastHeld} />
        </span>
      </div>

      <details className="chart-data">
        <summary>
          <StableText text={text.insights.viewNumbers} reserve={reserve.insights.viewNumbers} />
        </summary>
        <table className="chart-table">
          <thead>
            <tr>
              <th scope="col">
                <StableText text={text.insights.date} reserve={reserve.insights.date} />
              </th>
              <th scope="col">
                <StableText text={text.insights.scans} reserve={reserve.insights.scans} />
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.date}>
                <td>
                  <StableText
                    text={formatCalendarDate(point.date, true, locale)}
                    reserve={formatCalendarDate(point.date, true, other)}
                  />
                </td>
                <td>{point.scanCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
