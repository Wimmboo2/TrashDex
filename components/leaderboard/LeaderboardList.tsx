"use client";

import type { CSSProperties } from "react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { StableText } from "@/components/i18n/StableText";
import { formatCount } from "@/lib/format";
import { materialLabel, itemLabel } from "@/lib/i18n/labels";
import type { Locale } from "@/lib/i18n/locale";
import type { LeaderboardItem } from "@/lib/types";

export function LeaderboardList({
  items,
  shareLabel,
  shareReserve,
}: {
  items: LeaderboardItem[];
  shareLabel?: string;
  shareReserve?: string;
}) {
  const { locale, copy: text, reserve } = useI18n();
  const other: Locale = locale === "en" ? "id" : "en";
  const shareText = shareLabel ?? text.leaderboard.ofAll;
  const shareHeld = shareReserve ?? reserve.leaderboard.ofAll;

  return (
    <ol className="leaderboard-list" aria-label={text.leaderboard.listLabel}>
      {items.map((item, index) => {
        const share = Math.round(item.share * 100);
        const name = itemLabel(locale, item.canonicalItem, item.displayName);
        const nameHeld = itemLabel(other, item.canonicalItem, item.displayName);
        const meta = `${materialLabel(locale, item.materialGroup)} ${share}% ${shareText}`;
        const metaHeld = `${materialLabel(other, item.materialGroup)} ${share}% ${shareHeld}`;
        const scans =
          item.scanCount === 1 ? text.leaderboard.scanOne : text.leaderboard.scanMany;
        const scansHeld =
          item.scanCount === 1 ? reserve.leaderboard.scanOne : reserve.leaderboard.scanMany;
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
              <h2>
                <StableText block text={name} reserve={nameHeld} />
              </h2>
              <p>
                <StableText block text={meta} reserve={metaHeld} />
              </p>
              <span className="share-line" aria-hidden="true">
                <span style={{ width: `${share}%` }} />
              </span>
            </div>
            <div className="leaderboard-count">
              <span>
                <StableText
                  align="end"
                  text={formatCount(item.scanCount, locale)}
                  reserve={formatCount(item.scanCount, other)}
                />
              </span>
              <small>
                <StableText align="end" text={scans} reserve={scansHeld} />
              </small>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
