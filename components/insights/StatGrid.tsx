import type { Overview } from "@/lib/types";

export function StatGrid({ overview }: { overview: Overview }) {
  const correctness =
    overview.reportedCorrectnessRate === null
      ? "No feedback yet"
      : `${Math.round(overview.reportedCorrectnessRate * 100)}%`;

  const stats = [
    {
      label: "Recorded scans",
      value: overview.totalScans.toLocaleString("en-US"),
      note: "All time on this site.",
    },
    {
      label: "Item types scanned",
      value: overview.uniqueItems.toLocaleString("en-US"),
      note: "Distinct item types people scanned.",
    },
    {
      label: "Feedback responses",
      value: overview.feedbackCount.toLocaleString("en-US"),
      note: "Answers people sent about a result.",
    },
    {
      label: "Reported correctness",
      value: correctness,
      note: "Correct answers out of all feedback, not out of all scans.",
    },
  ];

  return (
    <dl className="stat-grid">
      {stats.map((stat) => (
        <div className="stat" key={stat.label}>
          <dt className="stat-label">{stat.label}</dt>
          <dd className="stat-value">{stat.value}</dd>
          <p className="stat-note">{stat.note}</p>
        </div>
      ))}
    </dl>
  );
}
