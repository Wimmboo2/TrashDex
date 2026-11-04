"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { StableText } from "@/components/i18n/StableText";
import { Icon } from "@/components/ui/Icon";
import { fill } from "@/lib/i18n/messages";
import { itemLabel, materialLabel } from "@/lib/i18n/labels";
import type { Locale } from "@/lib/i18n/locale";
import type { ConfusingItem } from "@/lib/types";

export function ConfusionPanel({
  items,
  minFeedback,
}: {
  items: ConfusingItem[];
  minFeedback: number;
}) {
  const { locale, copy: text, reserve } = useI18n();
  const other: Locale = locale === "en" ? "id" : "en";

  if (items.length === 0) {
    return (
      <div className="panel-note">
        <Icon name="alert" size={18} />
        <p>
          <StableText
            block
            text={fill(text.insights.noItemYet, { min: minFeedback })}
            reserve={fill(reserve.insights.noItemYet, { min: minFeedback })}
          />
        </p>
      </div>
    );
  }

  return (
    <ol className="confusion-panel">
      {items.map((item) => {
        const detail = { negative: item.negativeCount, total: item.feedbackCount };
        return (
          <li key={item.canonicalItem}>
            <div>
              <p className="confusion-name">
                <StableText
                  block
                  text={itemLabel(locale, item.canonicalItem, item.displayName)}
                  reserve={itemLabel(other, item.canonicalItem, item.displayName)}
                />
              </p>
              <p className="muted-small">
                <StableText
                  block
                  text={`${materialLabel(locale, item.materialGroup)} - ${fill(text.leaderboard.confusionShort, detail)}`}
                  reserve={`${materialLabel(other, item.materialGroup)} - ${fill(reserve.leaderboard.confusionShort, detail)}`}
                />
              </p>
            </div>
            <span className="confusion-rate">{Math.round(item.negativeRate * 100)}%</span>
          </li>
        );
      })}
    </ol>
  );
}
