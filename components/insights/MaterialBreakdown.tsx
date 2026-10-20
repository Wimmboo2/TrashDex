import { MATERIAL_GROUP_LABELS } from "@/lib/taxonomy";
import type { MaterialBreakdownItem } from "@/lib/types";

export function MaterialBreakdown({ items }: { items: MaterialBreakdownItem[] }) {
  if (items.length === 0) {
    return <p className="muted-small">No scans recorded in this range yet.</p>;
  }

  return (
    <ul className="breakdown-list">
      {items.map((item) => {
        const share = Math.round(item.share * 100);
        return (
          <li className="breakdown-row" key={item.materialGroup}>
            <span className="breakdown-name">{MATERIAL_GROUP_LABELS[item.materialGroup]}</span>
            <span className="breakdown-bar" aria-hidden="true">
              <span style={{ width: `${share}%` }} />
            </span>
            <span className="breakdown-count">
              {item.scanCount.toLocaleString("en-US")} <span className="muted-small">{share}%</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
