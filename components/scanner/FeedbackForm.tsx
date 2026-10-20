"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  CANONICAL_ITEMS,
  MATERIAL_GROUPS,
  MATERIAL_GROUP_LABELS,
  WASTE_STREAMS,
  WASTE_STREAM_LABELS,
} from "@/lib/taxonomy";

type Mode = "idle" | "correction" | "done";

export function FeedbackForm({
  scanId,
  onSubmitted,
}: {
  scanId: string | null;
  onSubmitted?: () => void;
}) {
  const [mode, setMode] = useState<Mode>("idle");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [itemName, setItemName] = useState("");
  const [canonicalItem, setCanonicalItem] = useState("");
  const [materialGroup, setMaterialGroup] = useState("");
  const [wasteStream, setWasteStream] = useState("");

  if (!scanId) {
    return (
      <div className="feedback">
        <p className="muted-small">
          Feedback is unavailable for this scan. The result was not saved.
        </p>
      </div>
    );
  }

  const activeScanId = scanId;

  async function send(verdict: "correct" | "incorrect", includeCorrection: boolean) {
    setIsSending(true);
    setError("");

    const correction = includeCorrection
      ? {
          ...(itemName.trim() ? { itemName: itemName.trim() } : {}),
          ...(canonicalItem ? { canonicalItem } : {}),
          ...(materialGroup ? { materialGroup } : {}),
          ...(wasteStream ? { wasteStream } : {}),
        }
      : undefined;

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scanId: activeScanId,
          verdict,
          ...(correction ? { correction } : {}),
        }),
      });
      const data = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      if (!response.ok) {
        if (response.status === 409) {
          setMode("done");
          setMessage("Feedback was already recorded for this scan.");
          onSubmitted?.();
          return;
        }
        setError(data?.error?.message || "Could not send feedback. Try again.");
        return;
      }

      setMode("done");
      setMessage("Thanks. Your feedback was recorded.");
      onSubmitted?.();
    } catch {
      setError("Could not send feedback. Check your connection and try again.");
    } finally {
      setIsSending(false);
    }
  }

  if (mode === "done") {
    return (
      <div className="feedback">
        <p className="feedback-done" role="status">
          <Icon name="check" size={17} />
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="feedback">
      <div className="feedback-head">
        <h4>Was this result right?</h4>
        <p className="muted-small">Your answer is stored as unverified feedback.</p>
      </div>

      {mode === "idle" ? (
        <div className="feedback-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void send("correct", false)}
            disabled={isSending}
          >
            <Icon name="check" size={17} />
            Yes, it is right
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setError("");
              setMode("correction");
            }}
            disabled={isSending}
          >
            <Icon name="x" size={17} />
            No, something is off
          </button>
        </div>
      ) : null}

      {mode === "correction" ? (
        <div className="feedback-form">
          <div className="field">
            <label htmlFor="correction-item">Correct item name (optional)</label>
            <input
              id="correction-item"
              className="input"
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              maxLength={80}
              placeholder="For example, glass jar"
              disabled={isSending}
            />
          </div>

          <div className="field">
            <label htmlFor="correction-canonical">Closest item type</label>
            <select
              id="correction-canonical"
              className="input"
              value={canonicalItem}
              onChange={(event) => setCanonicalItem(event.target.value)}
              disabled={isSending}
            >
              <option value="">Keep the current item type</option>
              {CANONICAL_ITEMS.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="correction-material">Material</label>
            <select
              id="correction-material"
              className="input"
              value={materialGroup}
              onChange={(event) => setMaterialGroup(event.target.value)}
              disabled={isSending}
            >
              <option value="">Keep the current material</option>
              {MATERIAL_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {MATERIAL_GROUP_LABELS[group]}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="correction-stream">Waste stream</label>
            <select
              id="correction-stream"
              className="input"
              value={wasteStream}
              onChange={(event) => setWasteStream(event.target.value)}
              disabled={isSending}
            >
              <option value="">Keep the current stream</option>
              {WASTE_STREAMS.map((stream) => (
                <option key={stream} value={stream}>
                  {WASTE_STREAM_LABELS[stream]}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <p className="field-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="feedback-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void send("incorrect", true)}
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send correction"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setError("");
                setMode("idle");
              }}
              disabled={isSending}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {mode === "idle" && error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
