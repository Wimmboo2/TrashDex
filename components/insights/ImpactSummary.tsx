"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { StableText } from "@/components/i18n/StableText";
import { fill } from "@/lib/i18n/messages";
import { formatCount } from "@/lib/format";
import type { Locale } from "@/lib/i18n/locale";
import type { Overview } from "@/lib/types";

export function ImpactSummary({
  overview,
  minFeedback,
  detail,
  detailReserve,
}: {
  overview: Overview;
  minFeedback: number;
  detail: string;
  detailReserve: string;
}) {
  const { locale, copy: text, reserve } = useI18n();
  const other: Locale = locale === "en" ? "id" : "en";
  const count = (value: number, loc: Locale) => formatCount(value, loc);

  const correctness =
    overview.reportedCorrectnessRate === null
      ? "—"
      : `${Math.round(overview.reportedCorrectnessRate * 100)}%`;

  const correctnessNote =
    overview.reportedCorrectnessRate === null
      ? overview.feedbackCount === 0
        ? fill(text.insights.noFeedback, { min: minFeedback })
        : fill(text.insights.partialFeedback, {
            count: count(overview.feedbackCount, locale),
            min: minFeedback,
          })
      : text.insights.correctnessNote;

  const correctnessReserve =
    overview.reportedCorrectnessRate === null
      ? overview.feedbackCount === 0
        ? fill(reserve.insights.noFeedback, { min: minFeedback })
        : fill(reserve.insights.partialFeedback, {
            count: count(overview.feedbackCount, other),
            min: minFeedback,
          })
      : reserve.insights.correctnessNote;

  const diversionNote =
    overview.totalScans === 0
      ? text.insights.diversionEmpty
      : fill(text.insights.diversionNote, { count: count(overview.totalScans, locale) });

  const diversionReserve =
    overview.totalScans === 0
      ? reserve.insights.diversionEmpty
      : fill(reserve.insights.diversionNote, { count: count(overview.totalScans, other) });

  const stats = [
    {
      id: "scans",
      label: text.insights.itemsScanned,
      labelReserve: reserve.insights.itemsScanned,
      value: count(overview.totalScans, locale),
      valueReserve: count(overview.totalScans, other),
      note: text.insights.itemsScannedNote,
      noteReserve: reserve.insights.itemsScannedNote,
    },
    {
      id: "types",
      label: text.insights.itemTypes,
      labelReserve: reserve.insights.itemTypes,
      value: count(overview.uniqueItems, locale),
      valueReserve: count(overview.uniqueItems, other),
      note: text.insights.itemTypesNote,
      noteReserve: reserve.insights.itemTypesNote,
    },
    {
      id: "correctness",
      label: text.insights.correctness,
      labelReserve: reserve.insights.correctness,
      value: correctness,
      valueReserve: correctness,
      note: correctnessNote,
      noteReserve: correctnessReserve,
    },
    {
      id: "diversion",
      label: text.insights.diversion,
      labelReserve: reserve.insights.diversion,
      value: overview.totalScans === 0 ? "—" : count(overview.divertableScans, locale),
      valueReserve: overview.totalScans === 0 ? "—" : count(overview.divertableScans, other),
      note: diversionNote,
      noteReserve: diversionReserve,
    },
  ];

  return (
    <section className="impact-summary" aria-labelledby="impact-title">
      <div className="impact-head">
        <h2 id="impact-title">
          <StableText block text={text.insights.impactTitle} reserve={reserve.insights.impactTitle} />
        </h2>
        <p className="muted-small">
          <StableText block text={detail} reserve={detailReserve} />
        </p>
      </div>
      <dl className="stat-grid">
        {stats.map((stat) => (
          <div className="stat" key={stat.id}>
            <dt className="stat-label">
              <StableText block text={stat.label} reserve={stat.labelReserve} />
            </dt>
            <dd className="stat-value">
              <StableText align="start" text={stat.value} reserve={stat.valueReserve} />
            </dd>
            <p className="stat-note">
              <StableText block text={stat.note} reserve={stat.noteReserve} />
            </p>
          </div>
        ))}
      </dl>
      <p className="impact-method">
        <StableText
          block
          text={text.insights.diversionMethod}
          reserve={reserve.insights.diversionMethod}
        />
      </p>
    </section>
  );
}
