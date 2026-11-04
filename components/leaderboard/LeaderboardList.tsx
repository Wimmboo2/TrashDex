"use client";

import type { CSSProperties } from "react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { formatCount } from "@/lib/format";
import { materialLabel, itemLabel } from "@/lib/i18n/labels";
import type { LeaderboardItem } from "@/lib/types";

export function LeaderboardList({
  items,
  shareLabel,
}: {
  items: LeaderboardItem[];
  shareLabel?: string;
}) {
  const { locale, copy: text } = useI18n();
  const shareText = shareLabel ?? text.leaderboard.ofAll;

  return (
    <ol className="leaderboard-list" aria-label={text.leaderboard.listLabel}>
      {items.map((item, index) => {
        const share = Math.round(item.share * 100);
        return (
          <li
            key={item.canonicalItem}
            className="leaderboard-row"
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
                  {share}% {shareText}
                </span>
              </p>
              <span className="share-line" aria-hidden="true">
                <span style={{ width: `${share}%` }} />
              </span>
            </div>
            <div className="leaderboard-count">
              <span>{formatCount(item.scanCount, locale)}</span>
              <small>
                {item.scanCount === 1 ? text.leaderboard.scanOne : text.leaderboard.scanMany}
              </small>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
