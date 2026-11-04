"use client";

import { useState, type DragEvent, type KeyboardEvent } from "react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { StableText } from "@/components/i18n/StableText";
import { Icon } from "@/components/ui/Icon";

export function Dropzone({
  onFile,
  onPickCamera,
  onPickUpload,
  error,
  errorReserve = null,
}: {
  onFile: (file: File) => void;
  onPickCamera: () => void;
  onPickUpload: () => void;
  error: string | null;
  errorReserve?: string | null;
}) {
  const { copy: text, reserve } = useI18n();
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPickUpload();
    }
  }

  return (
    <div>
      <div
        className={`dropzone${isDragging ? " is-dragging" : ""}`}
        role="button"
        tabIndex={0}
        aria-label={text.scanner.uploadLabel}
        onClick={onPickUpload}
        onKeyDown={handleKeyDown}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        <div className="dropzone-icon">
          <Icon name="camera" size={28} />
        </div>
        <h3>
          <StableText block text={text.scanner.dropTitle} reserve={reserve.scanner.dropTitle} />
        </h3>
        <p>
          <StableText block text={text.scanner.dropBody} reserve={reserve.scanner.dropBody} />
        </p>
        <div className="dropzone-actions" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="btn btn-primary" onClick={onPickCamera}>
            <Icon name="camera" size={17} />
            <StableText text={text.scanner.takePhoto} reserve={reserve.scanner.takePhoto} />
          </button>
          <button type="button" className="btn btn-secondary" onClick={onPickUpload}>
            <Icon name="upload" size={17} />
            <StableText text={text.scanner.chooseImage} reserve={reserve.scanner.chooseImage} />
          </button>
        </div>
      </div>
      {error ? (
        <p className="field-error dropzone-error" role="alert">
          <StableText block text={error} reserve={errorReserve ?? error} />
        </p>
      ) : null}
    </div>
  );
}
