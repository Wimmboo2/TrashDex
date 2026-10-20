"use client";

import { useState, type DragEvent, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/Icon";

export function Dropzone({
  onFile,
  onPickCamera,
  onPickUpload,
  error,
}: {
  onFile: (file: File) => void;
  onPickCamera: () => void;
  onPickUpload: () => void;
  error: string | null;
}) {
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
        aria-label="Upload a photo of a waste item"
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
        <h3>Drop a photo here</h3>
        <p>Or use your camera. JPEG, PNG, or WebP up to 12 MB.</p>
        <div className="dropzone-actions" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="btn btn-primary" onClick={onPickCamera}>
            <Icon name="camera" size={17} />
            Take a photo
          </button>
          <button type="button" className="btn btn-secondary" onClick={onPickUpload}>
            <Icon name="upload" size={17} />
            Choose image
          </button>
        </div>
      </div>
      {error ? (
        <p className="field-error dropzone-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
