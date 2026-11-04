"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
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
  const { copy: text } = useI18n();
  const status = isLoading
    ? text.scanner.reading
    : cancelled
      ? text.scanner.scanCancelled
      : text.scanner.readyToScan;
  const detail = isLoading
    ? text.scanner.identifying
    : cancelled
      ? text.scanner.nothingSaved
      : text.scanner.photoNote;

  return (
    <div>
      <div className={`preview-frame${isLoading ? " is-loading" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt={text.scanner.previewAlt} />
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
              {text.scanner.stillWorking}
            </p>
          ) : null}
        </div>
        {isLoading ? (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            <Icon name="x" size={17} />
            {text.scanner.cancel}
          </button>
        ) : (
          <div className="preview-actions">
            <button type="button" className="btn btn-ghost" onClick={onRemove}>
              {text.scanner.remove}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onReplace}>
              {text.scanner.replace}
            </button>
          </div>
        )}
      </div>

      {!isLoading ? (
        <button type="button" className="btn btn-primary btn-block" onClick={onAnalyze}>
          <Icon name="arrow-right" size={17} />
          {text.scanner.analyze}
        </button>
      ) : null}
    </div>
  );
}
