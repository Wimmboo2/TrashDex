"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { StableText } from "@/components/i18n/StableText";
import { formatCount } from "@/lib/format";
import { materialLabel } from "@/lib/i18n/labels";
import type { Locale } from "@/lib/i18n/locale";
import type { MaterialBreakdownItem } from "@/lib/types";

export function MaterialBreakdown({ items }: { items: MaterialBreakdownItem[] }) {
  const { locale, copy: text, reserve } = useI18n();
  const other: Locale = locale === "en" ? "id" : "en";

  if (items.length === 0) {
    return (
      <p className="muted-small">
        <StableText block text={text.insights.noneInRange} reserve={reserve.insights.noneInRange} />
      </p>
    );
  }

  return (
    <ul className="breakdown-list">
      {items.map((item) => {
        const share = Math.round(item.share * 100);
        return (
          <li className="breakdown-row" key={item.materialGroup}>
            <span className="breakdown-name">
              <StableText
                block
                text={materialLabel(locale, item.materialGroup)}
                reserve={materialLabel(other, item.materialGroup)}
              />
            </span>
            <span className="breakdown-bar" aria-hidden="true">
              <span style={{ width: `${share}%` }} />
            </span>
            <span className="breakdown-count">
              <StableText
                align="end"
                text={formatCount(item.scanCount, locale)}
                reserve={formatCount(item.scanCount, other)}
              />{" "}
              <span className="muted-small">{share}%</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
