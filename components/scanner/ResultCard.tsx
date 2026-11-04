"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { StableText } from "@/components/i18n/StableText";
import { FeedbackForm } from "@/components/scanner/FeedbackForm";
import { Icon, type IconName } from "@/components/ui/Icon";
import { localizeGuidance } from "@/lib/i18n/disposal";
import { itemLabel, materialLabel, streamLabel } from "@/lib/i18n/labels";
import type { Locale } from "@/lib/i18n/locale";
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
  const { locale, copy: text, reserve } = useI18n();
  const otherLocale: Locale = locale === "en" ? "id" : "en";
  const disposal = localizeGuidance(locale, result.disposal);
  const disposalReserve = localizeGuidance(otherLocale, result.disposal);
  const confidenceLabel = text.result[result.confidence];
  const confidenceReserve = reserve.result[result.confidence];
  const scrapLabel = {
    often: text.result.often,
    sometimes: text.result.sometimes,
    rarely: text.result.rarely,
    do_not_sell: text.result.doNotSell,
  }[result.disposal.scrap.buys];
  const scrapReserve = {
    often: reserve.result.often,
    sometimes: reserve.result.sometimes,
    rarely: reserve.result.rarely,
    do_not_sell: reserve.result.doNotSell,
  }[result.disposal.scrap.buys];
  const modelNote = result.uncertaintyReason.trim();
  const explanation = modelNote || (result.confidence === "low" ? text.result.lowReason : result.confidence === "medium" ? text.result.mediumReason : "");
  const explanationReserve = modelNote || (result.confidence === "low" ? reserve.result.lowReason : result.confidence === "medium" ? reserve.result.mediumReason : "");

  return (
    <article className={`result-card result-${result.confidence}`} aria-live="polite">
      <div className="result-head">
        <div className="result-identity">
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img className="result-thumb" src={imageUrl} alt="" />
          ) : null}
          <div>
            <p className="result-kicker">
              <StableText text={text.result.kicker} reserve={reserve.result.kicker} />
            </p>
            <h3 className="result-title">{result.itemName}</h3>
            <div className="result-tags">
              <span className="tag tag-outline">
                <StableText
                  text={itemLabel(locale, result.canonicalItem, result.canonicalItemLabel)}
                  reserve={itemLabel(otherLocale, result.canonicalItem, result.canonicalItemLabel)}
                />
              </span>
              <span className="tag tag-outline">{result.material}</span>
            </div>
          </div>
        </div>
        <span className={`badge badge-${result.confidence}`}>
          <StableText text={confidenceLabel} reserve={confidenceReserve} />
        </span>
      </div>

      <p className="confidence-note">
        <StableText block text={text.result.confidenceNote} reserve={reserve.result.confidenceNote} />
      </p>

      {result.confidence !== "high" && explanation ? (
        <div className={`confidence-callout is-${result.confidence}`} role="status">
          <p className="confidence-callout-kicker">
            <StableText text={confidenceLabel} reserve={confidenceReserve} />
          </p>
          <p>
            <StableText block text={explanation} reserve={explanationReserve} />
          </p>
        </div>
      ) : null}

      <div className="stream-row">
        <span className={`stream-pill stream-${result.wasteStream}`}>
          <Icon name={STREAM_ICONS[result.wasteStream]} size={16} />
          <StableText
            text={streamLabel(locale, result.wasteStream)}
            reserve={streamLabel(otherLocale, result.wasteStream)}
          />
        </span>
        <span className="muted-small">
          <StableText
            text={materialLabel(locale, result.materialGroup)}
            reserve={materialLabel(otherLocale, result.materialGroup)}
          />
        </span>
      </div>

      {result.alternatives.length > 0 ? (
        <div className="alternatives">
          <p className="mini-label">
            <StableText text={text.result.couldAlso} reserve={reserve.result.couldAlso} />
          </p>
          <ul>
            {result.alternatives.map((alternative) => (
              <li key={alternative.canonicalItem}>
                <span>{alternative.itemName}</span>
                <span className="muted-small">
                  <StableText
                    text={itemLabel(locale, alternative.canonicalItem, alternative.canonicalItemLabel)}
                    reserve={itemLabel(otherLocale, alternative.canonicalItem, alternative.canonicalItemLabel)}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="disposal">
        <h4>
          <StableText text={text.result.dispose} reserve={reserve.result.dispose} />
        </h4>
        <p className="disposal-headline">
          <StableText block text={disposal.headline} reserve={disposalReserve.headline} />
        </p>
        <ol>
          {disposal.steps.map((step, index) => (
            <li key={disposalReserve.steps[index] ?? step}>
              <StableText block text={step} reserve={disposalReserve.steps[index] ?? step} />
            </li>
          ))}
        </ol>
        {disposal.localOptions.length > 0 ? (
          <div className="local-options">
            <p className="mini-label">
              <StableText text={text.result.places} reserve={reserve.result.places} />
            </p>
            <ul>
              {disposal.localOptions.map((option) => {
                const held = disposalReserve.localOptions.find((item) => item.id === option.id);
                return (
                  <li key={option.id}>
                    <span className="local-option-title">
                      <StableText text={option.title} reserve={held?.title ?? option.title} />
                    </span>
                    <span>
                      <StableText block text={option.detail} reserve={held?.detail ?? option.detail} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        <div className="scrap-note">
          <p className="mini-label">
            <StableText text={text.result.scrap} reserve={reserve.result.scrap} />
          </p>
          <p className={`scrap-buys is-${disposal.scrap.buys}`}>
            <StableText text={scrapLabel} reserve={scrapReserve} />
          </p>
          <p>
            <StableText block text={disposal.scrap.note} reserve={disposalReserve.scrap.note} />
          </p>
        </div>
        {disposal.contextNote ? (
          <p className="context-note">
            <StableText
              block
              text={disposal.contextNote}
              reserve={disposalReserve.contextNote ?? disposal.contextNote}
            />
          </p>
        ) : null}
        {disposal.warnings.length > 0 ? (
          <div className="warning">
            <Icon name="alert" size={17} />
            <div>
              {disposal.warnings.map((warning, index) => (
                <p key={disposalReserve.warnings[index] ?? warning}>
                  <StableText
                    block
                    text={warning}
                    reserve={disposalReserve.warnings[index] ?? warning}
                  />
                </p>
              ))}
            </div>
          </div>
        ) : null}
        <p className="source-note">
          <StableText block text={disposal.sourceNote} reserve={disposalReserve.sourceNote} />
        </p>
      </div>

      <FeedbackForm scanId={scanId} onSubmitted={onFeedbackSubmitted} />

      <div className="result-actions">
        <button type="button" className="btn btn-primary" onClick={onReset}>
          <Icon name="refresh" size={17} />
          <StableText text={text.result.another} reserve={reserve.result.another} />
        </button>
      </div>
    </article>
  );
}
