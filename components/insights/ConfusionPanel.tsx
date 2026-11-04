"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { Icon } from "@/components/ui/Icon";
import { fill } from "@/lib/i18n/messages";
import { itemLabel, materialLabel } from "@/lib/i18n/labels";
import type { ConfusingItem } from "@/lib/types";

export function ConfusionPanel({
  items,
  minFeedback,
}: {
  items: ConfusingItem[];
  minFeedback: number;
}) {
  const { locale, copy: text } = useI18n();

  if (items.length === 0) {
    return (
      <div className="panel-note">
        <Icon name="alert" size={18} />
        <p>{fill(text.insights.noItemYet, { min: minFeedback })}</p>
      </div>
    );
  }

  return (
    <ol className="confusion-panel">
      {items.map((item) => (
        <li key={item.canonicalItem}>
          <div>
            <p className="confusion-name">{itemLabel(locale, item.canonicalItem, item.displayName)}</p>
            <p className="muted-small">
              {materialLabel(locale, item.materialGroup)} -{" "}
              {fill(text.leaderboard.confusionShort, {
                negative: item.negativeCount,
                total: item.feedbackCount,
              })}
            </p>
          </div>
          <span className="confusion-rate">{Math.round(item.negativeRate * 100)}%</span>
        </li>
      ))}
    </ol>
  );
}
