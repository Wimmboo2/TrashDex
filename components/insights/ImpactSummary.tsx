"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { fill } from "@/lib/i18n/messages";
import { formatCount } from "@/lib/format";
import type { Overview } from "@/lib/types";

export function ImpactSummary({
  overview,
  minFeedback,
  detail,
}: {
  overview: Overview;
  minFeedback: number;
  detail: string;
}) {
  const { locale, copy: text } = useI18n();
  const count = (value: number) => formatCount(value, locale);

  const correctness =
    overview.reportedCorrectnessRate === null
      ? "—"
      : `${Math.round(overview.reportedCorrectnessRate * 100)}%`;

  const correctnessNote =
    overview.reportedCorrectnessRate === null
      ? overview.feedbackCount === 0
        ? fill(text.insights.noFeedback, { min: minFeedback })
        : fill(text.insights.partialFeedback, {
            count: count(overview.feedbackCount),
            min: minFeedback,
          })
      : text.insights.correctnessNote;

  const diversionNote =
    overview.totalScans === 0
      ? text.insights.diversionEmpty
      : fill(text.insights.diversionNote, { count: count(overview.totalScans) });

  const stats = [
    {
      label: text.insights.itemsScanned,
      value: count(overview.totalScans),
      note: text.insights.itemsScannedNote,
    },
    {
      label: text.insights.itemTypes,
      value: count(overview.uniqueItems),
      note: text.insights.itemTypesNote,
    },
    {
      label: text.insights.correctness,
      value: correctness,
      note: correctnessNote,
    },
    {
      label: text.insights.diversion,
      value: overview.totalScans === 0 ? "—" : count(overview.divertableScans),
      note: diversionNote,
    },
  ];

  return (
    <section className="impact-summary" aria-labelledby="impact-title">
      <div className="impact-head">
        <h2 id="impact-title">{text.insights.impactTitle}</h2>
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
      <p className="impact-method">{text.insights.diversionMethod}</p>
    </section>
  );
}
