import { Icon } from "@/components/ui/Icon";
import { MATERIAL_GROUP_LABELS } from "@/lib/taxonomy";
import type { ConfusingItem } from "@/lib/types";

export function ConfusionPanel({
  items,
  minFeedback,
}: {
  items: ConfusingItem[];
  minFeedback: number;
}) {
  if (items.length === 0) {
    return (
      <div className="panel-note">
        <Icon name="alert" size={18} />
        <p>
          No item has reached {minFeedback} feedback responses yet, so nothing is ranked here.
        </p>
      </div>
    );
  }

  return (
    <ol className="confusion-panel">
      {items.map((item) => (
        <li key={item.canonicalItem}>
          <div>
            <p className="confusion-name">{item.displayName}</p>
            <p className="muted-small">
              {MATERIAL_GROUP_LABELS[item.materialGroup]} - {item.negativeCount} of{" "}
              {item.feedbackCount} responses marked incorrect
            </p>
          </div>
          <span className="confusion-rate">{Math.round(item.negativeRate * 100)}%</span>
        </li>
      ))}
    </ol>
  );
}
