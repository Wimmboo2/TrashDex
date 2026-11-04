import { DIVERSION_METHOD } from "@/lib/metrics";
import type { Overview } from "@/lib/types";

export function ImpactSummary({
  overview,
  minFeedback,
  detail = "All time.",
}: {
  overview: Overview;
  minFeedback: number;
  detail?: string;
}) {
  const correctness =
    overview.reportedCorrectnessRate === null
      ? "—"
      : `${Math.round(overview.reportedCorrectnessRate * 100)}%`;

  const correctnessNote =
    overview.reportedCorrectnessRate === null
      ? overview.feedbackCount === 0
        ? `No feedback yet. A rate appears after ${minFeedback} responses.`
        : `${overview.feedbackCount} of ${minFeedback} responses. The rate stays hidden until then.`
      : "Correct marks divided by feedback responses, not by scans.";

  const diversionNote =
    overview.totalScans === 0
      ? "No scans yet, so there is nothing to estimate."
      : `of ${overview.totalScans.toLocaleString("en-US")} scans in a sortable stream.`;

  const stats = [
    {
      label: "Items scanned",
      value: overview.totalScans.toLocaleString("en-US"),
      note: "All stored scans. Not limited to 7 or 30 days.",
    },
    {
      label: "Item types",
      value: overview.uniqueItems.toLocaleString("en-US"),
      note: "Distinct item types among those scans.",
    },
    {
      label: "Reported correctness",
      value: correctness,
      note: correctnessNote,
    },
    {
      label: "Rough diversion",
      value:
        overview.totalScans === 0
          ? "—"
          : overview.divertableScans.toLocaleString("en-US"),
      note: diversionNote,
    },
  ];

  return (
    <section className="impact-summary" aria-labelledby="impact-title">
      <div className="impact-head">
        <h2 id="impact-title">Impact summary</h2>
        <p className="muted-small">{detail}</p>
      </div>
      <dl className="stat-grid">
        {stats.map((stat) => (
          <div className="stat" key={stat.label}>
            <dt className="stat-label">{stat.label}</dt>
            <dd className="stat-value">{stat.value}</dd>
            <p className="stat-note">{stat.note}</p>
          </div>
        ))}
      </dl>
      <p className="impact-method">{DIVERSION_METHOD}</p>
    </section>
  );
}
