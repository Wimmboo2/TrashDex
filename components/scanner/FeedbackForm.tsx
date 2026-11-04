"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { StableText } from "@/components/i18n/StableText";
import { Icon } from "@/components/ui/Icon";
import { itemLabel, materialLabel, streamLabel } from "@/lib/i18n/labels";
import { CANONICAL_ITEMS, MATERIAL_GROUPS, WASTE_STREAMS } from "@/lib/taxonomy";

type Mode = "idle" | "correction" | "done";

export function FeedbackForm({
  scanId,
  onSubmitted,
}: {
  scanId: string | null;
  onSubmitted?: () => void;
}) {
  const { locale, copy: text, reserve } = useI18n();
  const [mode, setMode] = useState<Mode>("idle");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<"thanks" | "duplicate" | "">("");
  const [error, setError] = useState<"failed" | "offline" | "">("");
  const [itemName, setItemName] = useState("");
  const [canonicalItem, setCanonicalItem] = useState("");
  const [materialGroup, setMaterialGroup] = useState("");
  const [wasteStream, setWasteStream] = useState("");

  if (mode === "done") {
    return (
      <div className="feedback">
        <div className="feedback-recorded" role="status">
          <span className="feedback-recorded-icon">
            <Icon name="check" size={18} />
          </span>
          <p>
            <StableText
              block
              text={message === "duplicate" ? text.feedback.duplicate : text.feedback.thanks}
              reserve={message === "duplicate" ? reserve.feedback.duplicate : reserve.feedback.thanks}
            />
          </p>
        </div>
      </div>
    );
  }

  if (!scanId) {
    return (
      <div className="feedback">
        <p className="muted-small">
          <StableText block text={text.feedback.unavailable} reserve={reserve.feedback.unavailable} />
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
      if (!response.ok) {
        if (response.status === 409) {
          setMode("done");
          setMessage("duplicate");
          onSubmitted?.();
          return;
        }
        setError("failed");
        return;
      }

      setMode("done");
      setMessage("thanks");
      onSubmitted?.();
    } catch {
      setError("offline");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="feedback">
      <div className="feedback-head">
        <h4>
          <StableText text={text.feedback.question} reserve={reserve.feedback.question} />
        </h4>
        <p className="muted-small">
          <StableText block text={text.feedback.stored} reserve={reserve.feedback.stored} />
        </p>
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
            <StableText
              text={isSending ? text.feedback.sending : text.feedback.yes}
              reserve={isSending ? reserve.feedback.sending : reserve.feedback.yes}
            />
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
            <StableText text={text.feedback.no} reserve={reserve.feedback.no} />
          </button>
        </div>
      ) : null}

      {mode === "correction" ? (
        <div className="feedback-form">
          <div className="field">
            <label htmlFor="correction-item">
              <StableText block text={text.feedback.itemLabel} reserve={reserve.feedback.itemLabel} />
            </label>
            <input
              id="correction-item"
              className="input"
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              maxLength={80}
              placeholder={text.feedback.itemPlaceholder}
              disabled={isSending}
            />
          </div>

          <div className="field">
            <label htmlFor="correction-canonical">
              <StableText block text={text.feedback.typeLabel} reserve={reserve.feedback.typeLabel} />
            </label>
            <select
              id="correction-canonical"
              className="input"
              value={canonicalItem}
              onChange={(event) => setCanonicalItem(event.target.value)}
              disabled={isSending}
            >
              <option value="">{text.feedback.keepType}</option>
              {CANONICAL_ITEMS.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {itemLabel(locale, item.slug, item.label)}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="correction-material">
              <StableText block text={text.feedback.materialLabel} reserve={reserve.feedback.materialLabel} />
            </label>
            <select
              id="correction-material"
              className="input"
              value={materialGroup}
              onChange={(event) => setMaterialGroup(event.target.value)}
              disabled={isSending}
            >
              <option value="">{text.feedback.keepMaterial}</option>
              {MATERIAL_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {materialLabel(locale, group)}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="correction-stream">
              <StableText block text={text.feedback.streamLabel} reserve={reserve.feedback.streamLabel} />
            </label>
            <select
              id="correction-stream"
              className="input"
              value={wasteStream}
              onChange={(event) => setWasteStream(event.target.value)}
              disabled={isSending}
            >
              <option value="">{text.feedback.keepStream}</option>
              {WASTE_STREAMS.map((stream) => (
                <option key={stream} value={stream}>
                  {streamLabel(locale, stream)}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <p className="field-error" role="alert">
              <StableText
                block
                text={error === "offline" ? text.feedback.offline : text.feedback.sendFailed}
                reserve={error === "offline" ? reserve.feedback.offline : reserve.feedback.sendFailed}
              />
            </p>
          ) : null}

          <div className="feedback-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void send("incorrect", true)}
              disabled={isSending}
            >
              <StableText
                text={isSending ? text.feedback.sending : text.feedback.send}
                reserve={isSending ? reserve.feedback.sending : reserve.feedback.send}
              />
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
              <StableText text={text.feedback.cancel} reserve={reserve.feedback.cancel} />
            </button>
          </div>
        </div>
      ) : null}

      {mode === "idle" && error ? (
        <p className="field-error" role="alert">
          <StableText
            block
            text={error === "offline" ? text.feedback.offline : text.feedback.sendFailed}
            reserve={error === "offline" ? reserve.feedback.offline : reserve.feedback.sendFailed}
          />
        </p>
      ) : null}
    </div>
  );
}
