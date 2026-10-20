import type { CSSProperties } from "react";
import { MATERIAL_GROUP_LABELS } from "@/lib/taxonomy";
import type { ConfusingItem } from "@/lib/types";

export function ConfusingList({
  items,
  minFeedback,
}: {
  items: ConfusingItem[];
  minFeedback: number;
}) {
  return (
    <ol className="leaderboard-list" aria-label="Items with the most reported confusion">
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
              <h2>{item.displayName}</h2>
              <p>
                {MATERIAL_GROUP_LABELS[item.materialGroup]}
                <span className="leaderboard-share-text"> {rate}% reported incorrect</span>
              </p>
              <span className="share-line is-confusion" aria-hidden="true">
                <span style={{ width: `${rate}%` }} />
              </span>
              <p className="muted-small confusion-detail">
                {item.negativeCount} of {item.feedbackCount} feedback responses marked
                incorrect. {item.feedbackCount} responses, minimum {minFeedback}.
              </p>
            </div>
            <div className="leaderboard-count">
              <span>{rate}%</span>
              <small>confusion</small>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
