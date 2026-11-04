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
  const max = Math.max(1, ...points.map((point) => point.scanCount));
  const windowTotal = points.reduce((sum, point) => sum + point.scanCount, 0);
  const busiest = points.reduce(
    (best, point) => (point.scanCount > best.scanCount ? point : best),
    points[0] ?? { date: "", scanCount: 0 },
  );
  const first = formatCalendarDate(points[0]?.date ?? "");
  const last = formatCalendarDate(points[points.length - 1]?.date ?? "");
  const busiestLabel = formatCalendarDate(busiest.date);

  const comparison =
    allTimeTotal === windowTotal
      ? `This window matches the all-time total of ${allTimeTotal.toLocaleString("en-US")} scan${allTimeTotal === 1 ? "" : "s"}.`
      : `All-time total is ${allTimeTotal.toLocaleString("en-US")} scan${allTimeTotal === 1 ? "" : "s"}. This chart totals ${windowTotal.toLocaleString("en-US")} because it only includes the last ${range} days in Asia/Jakarta. Older scans stay in the all-time number.`;

  return (
    <figure className="chart">
      <figcaption className="chart-caption">
        <span>
          {windowTotal.toLocaleString("en-US")} scan{windowTotal === 1 ? "" : "s"} in the last{" "}
          {range} days, Asia/Jakarta
        </span>
        <span>
          {busiest.scanCount > 0
            ? `Busiest day ${busiestLabel}, ${busiest.scanCount} scan${busiest.scanCount === 1 ? "" : "s"}`
            : "No scans recorded in this window"}
        </span>
      </figcaption>
      <p className="chart-compare">{comparison}</p>

      <div
        className="chart-bars"
        role="img"
        aria-label={`Scans recorded per day for the last ${range} days in Asia/Jakarta. ${windowTotal} scans in this window. ${allTimeTotal} scans all time.`}
      >
        {points.map((point) => {
          const label = formatCalendarDate(point.date);
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
        <summary>View the daily numbers</summary>
        <table className="chart-table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Scans</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.date}>
                <td>{formatCalendarDate(point.date)}</td>
                <td>{point.scanCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
