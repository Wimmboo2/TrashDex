"use client";

import type { CSSProperties } from "react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { fill } from "@/lib/i18n/messages";
import { itemLabel, materialLabel } from "@/lib/i18n/labels";
import type { ConfusingItem } from "@/lib/types";

export function ConfusingList({
  items,
  minFeedback,
}: {
  items: ConfusingItem[];
  minFeedback: number;
}) {
  const { locale, copy: text } = useI18n();

  return (
    <ol className="leaderboard-list" aria-label={text.leaderboard.confusingListLabel}>
      {items.map((item, index) => {
        const rate = Math.round(item.negativeRate * 100);
        return (
          <li
            key={item.canonicalItem}
            className="leaderboard-row confusion-row"
            data-rank={item.rank}
            style={{ "--i": index } as CSSProperties}
          >
            <span className="rank" aria-hidden="true">
              {String(item.rank).padStart(2, "0")}
            </span>
            <div className="leaderboard-item">
              <h2>{itemLabel(locale, item.canonicalItem, item.displayName)}</h2>
              <p>
                {materialLabel(locale, item.materialGroup)}
                <span className="leaderboard-share-text">
                  {" "}
                  {rate}% {text.leaderboard.reportedIncorrect}
                </span>
              </p>
              <span className="share-line is-confusion" aria-hidden="true">
                <span style={{ width: `${rate}%` }} />
              </span>
              <p className="muted-small confusion-detail">
                {fill(text.leaderboard.confusionDetail, {
                  negative: item.negativeCount,
                  total: item.feedbackCount,
                  min: minFeedback,
                })}
              </p>
            </div>
            <div className="leaderboard-count">
              <span>{rate}%</span>
              <small>{text.leaderboard.confusion}</small>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
