"use client";

import { FeedbackForm } from "@/components/scanner/FeedbackForm";
import { Icon, type IconName } from "@/components/ui/Icon";
import {
  MATERIAL_GROUP_LABELS,
  WASTE_STREAM_LABELS,
  type WasteStream,
} from "@/lib/taxonomy";
import type { WasteResult } from "@/lib/types";

const STREAM_ICONS: Record<WasteStream, IconName> = {
  recycling: "recycle",
  organic: "leaf",
  hazardous: "alert",
  electronic: "cpu",
  textile: "tag",
  landfill: "trash",
  special_dropoff: "shield",
  unknown: "alert",
};

const CONFIDENCE_LABELS = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
} as const;

export function ResultCard({
  result,
  scanId,
  imageUrl,
  onReset,
  onFeedbackSubmitted,
}: {
  result: WasteResult;
  scanId: string | null;
  imageUrl: string | null;
  onReset: () => void;
  onFeedbackSubmitted?: () => void;
}) {
  const uncertainty =
    result.uncertaintyReason ||
    (result.confidence === "low"
      ? "The model is not fully sure about this item. Check the material before sorting."
      : "");

  return (
    <article className="result-card" aria-live="polite">
      <div className="result-head">
        <div className="result-identity">
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img className="result-thumb" src={imageUrl} alt="" />
          ) : null}
          <div>
            <p className="result-kicker">Scan result</p>
            <h3 className="result-title">{result.itemName}</h3>
            <div className="result-tags">
              <span className="tag tag-outline">{result.canonicalItemLabel}</span>
              <span className="tag tag-outline">{result.material}</span>
            </div>
          </div>
        </div>
        <span className={`badge badge-${result.confidence}`}>
          {CONFIDENCE_LABELS[result.confidence]}
        </span>
      </div>

      <p className="confidence-note">
        AI confidence is a qualitative estimate, not a measured probability.
      </p>

      {uncertainty ? (
        <p className="uncertainty">
          <Icon name="alert" size={17} />
          <span>{uncertainty}</span>
        </p>
      ) : null}

      <div className="stream-row">
        <span className={`stream-pill stream-${result.wasteStream}`}>
          <Icon name={STREAM_ICONS[result.wasteStream]} size={16} />
          {WASTE_STREAM_LABELS[result.wasteStream]}
        </span>
        <span className="muted-small">{MATERIAL_GROUP_LABELS[result.materialGroup]}</span>
      </div>

      {result.alternatives.length > 0 ? (
        <div className="alternatives">
          <p className="mini-label">Could also be</p>
          <ul>
            {result.alternatives.map((alternative) => (
              <li key={alternative.canonicalItem}>
                <span>{alternative.itemName}</span>
                <span className="muted-small">{alternative.canonicalItemLabel}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="disposal">
        <h4>How to dispose</h4>
        <p className="disposal-headline">{result.disposal.headline}</p>
        <ol>
          {result.disposal.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {result.disposal.warnings.length > 0 ? (
          <div className="warning">
            <Icon name="alert" size={17} />
            <div>
              {result.disposal.warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          </div>
        ) : null}
        <p className="source-note">{result.disposal.sourceNote}</p>
      </div>

      <FeedbackForm scanId={scanId} onSubmitted={onFeedbackSubmitted} />

      <div className="result-actions">
        <button type="button" className="btn btn-primary" onClick={onReset}>
          <Icon name="refresh" size={17} />
          Scan another
        </button>
      </div>
    </article>
  );
}
