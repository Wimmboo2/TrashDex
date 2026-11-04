"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { FeedbackForm } from "@/components/scanner/FeedbackForm";
import { Icon, type IconName } from "@/components/ui/Icon";
import { localizeGuidance } from "@/lib/i18n/disposal";
import { itemLabel, materialLabel, streamLabel } from "@/lib/i18n/labels";
import type { WasteStream } from "@/lib/taxonomy";
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
  const { locale, copy: text } = useI18n();
  const disposal = localizeGuidance(locale, result.disposal);
  const confidenceLabel = text.result[result.confidence];
  const scrapLabel = {
    often: text.result.often,
    sometimes: text.result.sometimes,
    rarely: text.result.rarely,
    do_not_sell: text.result.doNotSell,
  }[result.disposal.scrap.buys];
  const explanation =
    result.uncertaintyReason.trim() ||
    (result.confidence === "low"
      ? text.result.lowReason
      : result.confidence === "medium"
        ? text.result.mediumReason
        : "");

  return (
    <article className={`result-card result-${result.confidence}`} aria-live="polite">
      <div className="result-head">
        <div className="result-identity">
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img className="result-thumb" src={imageUrl} alt="" />
          ) : null}
          <div>
            <p className="result-kicker">{text.result.kicker}</p>
            <h3 className="result-title">{result.itemName}</h3>
            <div className="result-tags">
              <span className="tag tag-outline">
                {itemLabel(locale, result.canonicalItem, result.canonicalItemLabel)}
              </span>
              <span className="tag tag-outline">{result.material}</span>
            </div>
          </div>
        </div>
        <span className={`badge badge-${result.confidence}`}>
          {confidenceLabel}
        </span>
      </div>

      <p className="confidence-note">
        {text.result.confidenceNote}
      </p>

      {result.confidence !== "high" && explanation ? (
        <div className={`confidence-callout is-${result.confidence}`} role="status">
          <p className="confidence-callout-kicker">{confidenceLabel}</p>
          <p>{explanation}</p>
        </div>
      ) : null}

      <div className="stream-row">
        <span className={`stream-pill stream-${result.wasteStream}`}>
          <Icon name={STREAM_ICONS[result.wasteStream]} size={16} />
          {streamLabel(locale, result.wasteStream)}
        </span>
        <span className="muted-small">{materialLabel(locale, result.materialGroup)}</span>
      </div>

      {result.alternatives.length > 0 ? (
        <div className="alternatives">
          <p className="mini-label">{text.result.couldAlso}</p>
          <ul>
            {result.alternatives.map((alternative) => (
              <li key={alternative.canonicalItem}>
                <span>{alternative.itemName}</span>
                <span className="muted-small">
                  {itemLabel(locale, alternative.canonicalItem, alternative.canonicalItemLabel)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="disposal">
        <h4>{text.result.dispose}</h4>
        <p className="disposal-headline">{disposal.headline}</p>
        <ol>
          {disposal.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {disposal.localOptions.length > 0 ? (
          <div className="local-options">
            <p className="mini-label">{text.result.places}</p>
            <ul>
              {disposal.localOptions.map((option) => (
                <li key={option.id}>
                  <span className="local-option-title">{option.title}</span>
                  <span>{option.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="scrap-note">
          <p className="mini-label">{text.result.scrap}</p>
          <p className={`scrap-buys is-${disposal.scrap.buys}`}>{scrapLabel}</p>
          <p>{disposal.scrap.note}</p>
        </div>
        {disposal.contextNote ? <p className="context-note">{disposal.contextNote}</p> : null}
        {disposal.warnings.length > 0 ? (
          <div className="warning">
            <Icon name="alert" size={17} />
            <div>
              {disposal.warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          </div>
        ) : null}
        <p className="source-note">{disposal.sourceNote}</p>
      </div>

      <FeedbackForm scanId={scanId} onSubmitted={onFeedbackSubmitted} />

      <div className="result-actions">
        <button type="button" className="btn btn-primary" onClick={onReset}>
          <Icon name="refresh" size={17} />
          {text.result.another}
        </button>
      </div>
    </article>
  );
}
