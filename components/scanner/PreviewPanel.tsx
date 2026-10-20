"use client";

import { Icon } from "@/components/ui/Icon";

export function PreviewPanel({
  previewUrl,
  isLoading,
  onAnalyze,
  onReplace,
  onRemove,
  onCancel,
}: {
  previewUrl: string;
  isLoading: boolean;
  onAnalyze: () => void;
  onReplace: () => void;
  onRemove: () => void;
  onCancel: () => void;
}) {
  return (
    <div>
      <div className={`preview-frame${isLoading ? " is-loading" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt="Selected waste item" />
        {isLoading ? <span className="scan-line" aria-hidden="true" /> : null}
      </div>

      <div className="preview-meta">
        <div>
          <p className="preview-status">
            {isLoading ? "Reading the item..." : "Ready to scan"}
          </p>
          <p className="muted-small">
            {isLoading
              ? "Identifying material and waste stream."
              : "The photo is sent for analysis and is not stored by TrashDex."}
          </p>
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
