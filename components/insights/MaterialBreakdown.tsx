"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { formatCount } from "@/lib/format";
import { materialLabel } from "@/lib/i18n/labels";
import type { MaterialBreakdownItem } from "@/lib/types";

export function MaterialBreakdown({ items }: { items: MaterialBreakdownItem[] }) {
  const { locale, copy: text } = useI18n();

  if (items.length === 0) {
    return <p className="muted-small">{text.insights.noneInRange}</p>;
  }

  return (
    <ul className="breakdown-list">
      {items.map((item) => {
        const share = Math.round(item.share * 100);
        return (
          <li className="breakdown-row" key={item.materialGroup}>
            <span className="breakdown-name">{materialLabel(locale, item.materialGroup)}</span>
            <span className="breakdown-bar" aria-hidden="true">
              <span style={{ width: `${share}%` }} />
            </span>
            <span className="breakdown-count">
              {formatCount(item.scanCount, locale)} <span className="muted-small">{share}%</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
