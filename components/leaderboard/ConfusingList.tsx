"use client";

import type { CSSProperties } from "react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { StableText } from "@/components/i18n/StableText";
import { fill } from "@/lib/i18n/messages";
import { itemLabel, materialLabel } from "@/lib/i18n/labels";
import type { Locale } from "@/lib/i18n/locale";
import type { ConfusingItem } from "@/lib/types";

export function ConfusingList({
  items,
  minFeedback,
}: {
  items: ConfusingItem[];
  minFeedback: number;
}) {
  const { locale, copy: text, reserve } = useI18n();
  const other: Locale = locale === "en" ? "id" : "en";

  return (
    <ol className="leaderboard-list" aria-label={text.leaderboard.confusingListLabel}>
      {items.map((item, index) => {
        const rate = Math.round(item.negativeRate * 100);
        const detail = {
          negative: item.negativeCount,
          total: item.feedbackCount,
          min: minFeedback,
        };
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
              <h2>
                <StableText
                  block
                  text={itemLabel(locale, item.canonicalItem, item.displayName)}
                  reserve={itemLabel(other, item.canonicalItem, item.displayName)}
                />
              </h2>
              <p>
                <StableText
                  block
                  text={`${materialLabel(locale, item.materialGroup)} ${rate}% ${text.leaderboard.reportedIncorrect}`}
                  reserve={`${materialLabel(other, item.materialGroup)} ${rate}% ${reserve.leaderboard.reportedIncorrect}`}
                />
              </p>
              <span className="share-line is-confusion" aria-hidden="true">
                <span style={{ width: `${rate}%` }} />
              </span>
              <p className="muted-small confusion-detail">
                <StableText
                  block
                  text={fill(text.leaderboard.confusionDetail, detail)}
                  reserve={fill(reserve.leaderboard.confusionDetail, detail)}
                />
              </p>
            </div>
            <div className="leaderboard-count">
              <span>{rate}%</span>
              <small>
                <StableText
                  align="end"
                  text={text.leaderboard.confusion}
                  reserve={reserve.leaderboard.confusion}
                />
              </small>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
