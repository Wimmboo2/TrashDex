import type { CSSProperties } from "react";
import { MATERIAL_GROUP_LABELS } from "@/lib/taxonomy";
import type { LeaderboardItem } from "@/lib/types";

export function LeaderboardList({ items }: { items: LeaderboardItem[] }) {
  return (
    <ol className="leaderboard-list" aria-label="Most-scanned item types">
      {items.map((item, index) => (
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
            <h2>{item.displayName}</h2>
            <p>{MATERIAL_GROUP_LABELS[item.materialGroup]}</p>
          </div>
          <div className="leaderboard-count">
            <span>{item.scanCount.toLocaleString("en-US")}</span>
            <small>{item.scanCount === 1 ? "scan" : "scans"}</small>
          </div>
        </li>
      ))}
    </ol>
  );
}
