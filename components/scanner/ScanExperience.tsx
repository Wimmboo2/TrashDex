"use client";

import { useEffect, useRef, useState } from "react";
import { Dropzone } from "@/components/scanner/Dropzone";
import { PreviewPanel } from "@/components/scanner/PreviewPanel";
import { ResultCard } from "@/components/scanner/ResultCard";
import { Icon } from "@/components/ui/Icon";
import type { ApiErrorBody, NotWasteResult, ScanResultPayload, WasteResult } from "@/lib/types";

type Phase = "idle" | "preview" | "loading" | "success" | "error";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_INPUT_BYTES = 12 * 1024 * 1024;

async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.82);
  });
  if (!blob) throw new Error("Could not compress image");

  return new File([blob], "trashdex-scan.jpg", { type: "image/jpeg" });
}

function ResultSkeleton() {
  return (
    <div className="result-card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
      <div className="skeleton skeleton-block" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
    </div>
  );
}

export function ScanExperience() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<WasteResult | null>(null);
  const [notWaste, setNotWaste] = useState<NotWasteResult | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function handleFile(selected: File) {
    setFileError(null);

    if (selected.type && !ALLOWED_TYPES.has(selected.type)) {
      setFileError(
        selected.type === "image/heic" || selected.type === "image/heif"
          ? "HEIC images are not supported here. On iPhone, set Camera > Formats > Most Compatible and try again."
          : "Use a JPEG, PNG, or WebP image.",
      );
      return;
    }

    if (selected.size > MAX_INPUT_BYTES) {
      setFileError("That image is too large. Use an image under 12 MB.");
      return;
    }

    try {
      const compressed = await compressImage(selected);
      const url = URL.createObjectURL(compressed);
      setFile(compressed);
      setPreviewUrl(url);
      setResult(null);
      setNotWaste(null);
      setScanId(null);
      setError(null);
      setPhase("preview");
    } catch {
      setFileError("That image could not be read. Try a JPEG or PNG photo.");
    }
  }

  function reset() {
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase("idle");
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setNotWaste(null);
    setScanId(null);
    setError(null);
    setFileError(null);
  }

  async function analyze() {
    if (!file) return;

    setPhase("loading");
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 45_000);

    try {
      const body = new FormData();
      body.append("image", file);

      const response = await fetch("/api/scan", {
        method: "POST",
        body,
        signal: controller.signal,
      });

      const data = (await response.json().catch(() => null)) as
        | ScanResultPayload
        | ApiErrorBody
        | null;

      if (!response.ok) {
        const message =
          data && "error" in data && data.error?.message
            ? data.error.message
            : "That scan did not go through. Try again.";
        const code = data && "error" in data && data.error?.code ? data.error.code : "INTERNAL";
        setError({ code, message });
        setPhase("error");
        return;
      }

      if (!data || !("result" in data)) {
        setError({ code: "INTERNAL", message: "The scanner returned an empty result. Try again." });
        setPhase("error");
        return;
      }

      if (data.result.isWasteItem === false) {
        setNotWaste(data.result);
        setResult(null);
        setScanId(null);
      } else {
        setResult(data.result);
        setNotWaste(null);
        setScanId(data.scanId ?? null);
      }
      setPhase("success");
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        setError({
          code: "UPSTREAM_TIMEOUT",
          message: "The scan took too long. Try a smaller or clearer photo.",
        });
      } else {
        setError({
          code: "NETWORK",
          message: "Could not reach the scanner. Check your connection and try again.",
        });
      }
      setPhase("error");
    } finally {
      window.clearTimeout(timeout);
      abortRef.current = null;
    }
  }

  function cancel() {
    abortRef.current?.abort();
    setPhase("preview");
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (selected) void handleFile(selected);
  }

  const statusLabel =
    phase === "loading"
      ? "Analyzing"
      : phase === "success"
        ? "Result"
        : phase === "error"
          ? "Try again"
          : "Ready";

  return (
    <section className="scanner-card" aria-labelledby="scanner-title" aria-busy={phase === "loading"}>
      <div className="scanner-top">
        <div>
          <p className="scanner-kicker">Specimen intake</p>
          <h2 id="scanner-title">Scan a waste item</h2>
        </div>
        <span className={`status-pill status-${phase}`}>{statusLabel}</span>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleInputChange}
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={handleInputChange}
      />

      {phase === "idle" ? (
        <Dropzone
          onFile={(selected) => void handleFile(selected)}
          onPickCamera={() => cameraInputRef.current?.click()}
          onPickUpload={() => uploadInputRef.current?.click()}
          error={fileError}
        />
      ) : null}

      {(phase === "preview" || phase === "loading") && previewUrl ? (
        <>
          <PreviewPanel
            previewUrl={previewUrl}
            isLoading={phase === "loading"}
            onAnalyze={() => void analyze()}
            onReplace={() => uploadInputRef.current?.click()}
            onRemove={reset}
            onCancel={cancel}
          />
          {phase === "loading" ? <ResultSkeleton /> : null}
        </>
      ) : null}

      {phase === "success" && result ? (
        <ResultCard
          result={result}
          scanId={scanId}
          imageUrl={previewUrl}
          onReset={reset}
        />
      ) : null}

      {phase === "success" && notWaste ? (
        <div className="not-waste" role="status">
          <div className="not-waste-icon">
            <Icon name="image" size={26} />
          </div>
          <h3>No clear waste item found.</h3>
          <p>{notWaste.message}</p>
          <button type="button" className="btn btn-primary" onClick={reset}>
            <Icon name="refresh" size={17} />
            Try another photo
          </button>
        </div>
      ) : null}

      {phase === "error" && error ? (
        <div className="error-panel" role="alert">
          <div className="error-icon">
            <Icon name="alert" size={24} />
          </div>
          <div>
            <h3>That scan did not go through.</h3>
            <p>{error.message}</p>
            <p className="error-code">Reference: {error.code}</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={reset}>
            <Icon name="refresh" size={17} />
            Try another photo
          </button>
        </div>
      ) : null}
    </section>
  );
}
