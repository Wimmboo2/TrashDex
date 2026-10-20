import type { DailyScanPoint } from "@/lib/types";

export function ActivityChart({
  points,
  range,
}: {
  points: DailyScanPoint[];
  range: 7 | 30;
}) {
  const max = Math.max(1, ...points.map((point) => point.scanCount));
  const total = points.reduce((sum, point) => sum + point.scanCount, 0);
  const busiest = points.reduce(
    (best, point) => (point.scanCount > best.scanCount ? point : best),
    points[0] ?? { date: "", scanCount: 0 },
  );
  const first = points[0]?.date ?? "";
  const last = points[points.length - 1]?.date ?? "";

  return (
    <figure className="chart">
      <figcaption className="chart-caption">
        <span>
          {total} scan{total === 1 ? "" : "s"} in the last {range} days
        </span>
        <span>
          {busiest.scanCount > 0
            ? `Busiest day ${busiest.date} with ${busiest.scanCount} scan${busiest.scanCount === 1 ? "" : "s"}`
            : "No scans recorded in this range"}
        </span>
      </figcaption>

      <div
        className="chart-bars"
        role="img"
        aria-label={`Scans recorded per day for the last ${range} days. ${total} scans in total.`}
      >
        {points.map((point) => (
          <span className="chart-col" key={point.date} title={`${point.date}: ${point.scanCount}`}>
            <span className="chart-bar" style={{ height: `${(point.scanCount / max) * 100}%` }} />
          </span>
        ))}
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
                <td>{point.date}</td>
                <td>{point.scanCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
