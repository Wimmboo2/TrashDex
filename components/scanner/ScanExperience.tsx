"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { Dropzone } from "@/components/scanner/Dropzone";
import { PreviewPanel } from "@/components/scanner/PreviewPanel";
import { ResultCard } from "@/components/scanner/ResultCard";
import { Icon } from "@/components/ui/Icon";
import type { Copy } from "@/lib/i18n/messages";
import type {
  ApiErrorBody,
  DisposalContext,
  NotWasteResult,
  ScanResultPayload,
  WasteResult,
} from "@/lib/types";

type Phase = "idle" | "preview" | "loading" | "cancelled" | "success" | "error";

const SLOW_SCAN_MS = 8_000;

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

function ContextPicker({
  value,
  onChange,
}: {
  value: DisposalContext | null;
  onChange: (value: DisposalContext | null) => void;
}) {
  const { copy: text } = useI18n();
  const options: { value: DisposalContext | null; label: string }[] = [
    { value: null, label: text.scanner.general },
    { value: "school", label: text.scanner.school },
    { value: "neighborhood", label: text.scanner.neighborhood },
  ];

  return (
    <fieldset className="context-picker">
      <legend>{text.scanner.contextLegend}</legend>
      <div className="context-options">
        {options.map((option) => {
          const id = `disposal-context-${option.value ?? "general"}`;
          return (
            <label key={id} htmlFor={id}>
              <input
                id={id}
                type="radio"
                name="disposal-context"
                checked={value === option.value}
                onChange={() => onChange(option.value)}
              />
              {option.label}
            </label>
          );
        })}
      </div>
      <p className="muted-small">{text.scanner.contextHelp}</p>
    </fieldset>
  );
}

function messageForCode(code: string, text: Copy): string {
  if (code === "NETWORK") return text.scanner.network;
  if (code in text.errors) return text.errors[code as keyof Copy["errors"]];
  return text.scanner.fallback;
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
  const { copy: text } = useI18n();
  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<WasteResult | null>(null);
  const [notWaste, setNotWaste] = useState<NotWasteResult | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [fileError, setFileError] = useState<"heic" | "type" | "large" | "unreadable" | null>(null);
  const [disposalContext, setDisposalContext] = useState<DisposalContext | null>(null);
  const [slowScan, setSlowScan] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (phase !== "loading") return;

    const timer = window.setTimeout(() => setSlowScan(true), SLOW_SCAN_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  async function handleFile(selected: File) {
    setFileError(null);

    if (selected.type && !ALLOWED_TYPES.has(selected.type)) {
      setFileError(selected.type === "image/heic" || selected.type === "image/heif" ? "heic" : "type");
      return;
    }

    if (selected.size > MAX_INPUT_BYTES) {
      setFileError("large");
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
      setFileError("unreadable");
    }
  }

  function reset() {
    requestIdRef.current += 1;
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

    const requestId = ++requestIdRef.current;
    setSlowScan(false);
    setPhase("loading");
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = window.setTimeout(() => {
      if (abortRef.current === controller) controller.abort();
    }, 45_000);

    try {
      const body = new FormData();
      body.append("image", file);
      if (disposalContext) body.append("context", disposalContext);

      const response = await fetch("/api/scan", {
        method: "POST",
        body,
        signal: controller.signal,
      });

      if (requestId !== requestIdRef.current) return;

      const data = (await response.json().catch(() => null)) as
        | ScanResultPayload
        | ApiErrorBody
        | null;

      if (requestId !== requestIdRef.current) return;

      if (!response.ok) {
        const code = data && "error" in data && data.error?.code ? data.error.code : "INTERNAL";
        setError({ code, message: messageForCode(code, text) });
        setPhase("error");
        return;
      }

      if (!data || !("result" in data)) {
        setError({ code: "INTERNAL", message: text.scanner.emptyResult });
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
      if (requestId !== requestIdRef.current) return;

      if (controller.signal.reason === "cancelled") {
        setError(null);
        setPhase("cancelled");
        return;
      }

      if (caught instanceof DOMException && caught.name === "AbortError") {
        setError({
          code: "UPSTREAM_TIMEOUT",
          message: text.scanner.timeout,
        });
      } else {
        setError({
          code: "NETWORK",
          message: text.scanner.network,
        });
      }
      setPhase("error");
    } finally {
      window.clearTimeout(timeout);
      if (abortRef.current === controller) abortRef.current = null;
    }
  }

  function cancel() {
    requestIdRef.current += 1;
    const controller = abortRef.current;
    abortRef.current = null;
    controller?.abort("cancelled");
    setError(null);
    setPhase((current) => (current === "loading" ? "cancelled" : current));
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (selected) void handleFile(selected);
  }

  const statusLabel =
    phase === "loading"
      ? text.scanner.analyzing
      : phase === "cancelled"
        ? text.scanner.cancelled
        : phase === "success"
          ? text.scanner.result
          : phase === "error"
            ? text.scanner.tryAgain
            : text.scanner.ready;

  const visibleError = error
    ? { code: error.code, message: messageForCode(error.code, text) }
    : null;
  const fileErrorText =
    fileError === "heic"
      ? text.scanner.heic
      : fileError === "type"
        ? text.scanner.useImage
        : fileError === "large"
          ? text.scanner.tooLarge
          : fileError === "unreadable"
            ? text.scanner.unreadable
            : null;

  return (
    <section className="scanner-card" aria-labelledby="scanner-title" aria-busy={phase === "loading"}>
      <div className="scanner-top">
        <div>
          <h2 id="scanner-title">{text.scanner.title}</h2>
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

      {phase === "idle" || phase === "preview" || phase === "cancelled" ? (
        <ContextPicker value={disposalContext} onChange={setDisposalContext} />
      ) : null}

      {phase === "idle" ? (
        <Dropzone
          onFile={(selected) => void handleFile(selected)}
          onPickCamera={() => cameraInputRef.current?.click()}
          onPickUpload={() => uploadInputRef.current?.click()}
          error={fileErrorText}
        />
      ) : null}

      {(phase === "preview" || phase === "loading" || phase === "cancelled") && previewUrl ? (
        <>
          <PreviewPanel
            previewUrl={previewUrl}
            isLoading={phase === "loading"}
            slow={phase === "loading" && slowScan}
            cancelled={phase === "cancelled"}
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
            <Icon name={notWaste.outcome === "multiple-items" ? "alert" : "image"} size={26} />
          </div>
          <h3>
            {notWaste.outcome === "multiple-items"
              ? text.scanner.multipleTitle
              : text.scanner.notWasteTitle}
          </h3>
          <p>
            {notWaste.outcome === "multiple-items"
              ? text.scanner.multipleBody
              : text.scanner.notWasteBody}
          </p>
          <button type="button" className="btn btn-primary" onClick={reset}>
            <Icon name="refresh" size={17} />
            {text.scanner.tryAnother}
          </button>
        </div>
      ) : null}

      {phase === "error" && visibleError ? (
        <div className="error-panel" role="alert">
          <div className="error-icon">
            <Icon name="alert" size={24} />
          </div>
          <div>
            <h3>{text.scanner.failedTitle}</h3>
            <p>{visibleError.message}</p>
            <p className="error-code">
              {text.scanner.reference}: {visibleError.code}
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={reset}>
            <Icon name="refresh" size={17} />
            {text.scanner.tryAnother}
          </button>
        </div>
      ) : null}
    </section>
  );
}
