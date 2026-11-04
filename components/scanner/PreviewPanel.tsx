"use client";

import { Icon } from "@/components/ui/Icon";

export function PreviewPanel({
  previewUrl,
  isLoading,
  slow = false,
  cancelled = false,
  onAnalyze,
  onReplace,
  onRemove,
  onCancel,
}: {
  previewUrl: string;
  isLoading: boolean;
  slow?: boolean;
  cancelled?: boolean;
  onAnalyze: () => void;
  onReplace: () => void;
  onRemove: () => void;
  onCancel: () => void;
}) {
  const status = isLoading ? "Reading the item..." : cancelled ? "Scan cancelled" : "Ready to scan";
  const detail = isLoading
    ? "Identifying material and waste stream."
    : cancelled
      ? "Nothing was saved. You can analyze this photo again."
      : "The photo is sent for analysis and is not stored by TrashDex.";

  return (
    <div>
      <div className={`preview-frame${isLoading ? " is-loading" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt="Selected waste item" />
        {isLoading ? <span className="scan-line" aria-hidden="true" /> : null}
      </div>

      <div className="preview-meta">
        <div>
          <p className="preview-status" role={cancelled ? "status" : undefined}>
            {status}
          </p>
          <p className="muted-small">{detail}</p>
          {isLoading && slow ? (
            <p className="slow-note" role="status">
              Still working…
            </p>
          ) : null}
        </div>
        {isLoading ? (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            <Icon name="x" size={17} />
            Cancel
          </button>
        ) : (
          <div className="preview-actions">
            <button type="button" className="btn btn-ghost" onClick={onRemove}>
              Remove
            </button>
            <button type="button" className="btn btn-secondary" onClick={onReplace}>
              Replace
            </button>
          </div>
        )}
      </div>

      {!isLoading ? (
        <button type="button" className="btn btn-primary btn-block" onClick={onAnalyze}>
          <Icon name="arrow-right" size={17} />
          Analyze item
        </button>
      ) : null}
    </div>
  );
}
