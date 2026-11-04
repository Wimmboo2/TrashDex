import { classifyWasteImage } from "@/lib/ai/gemini";
import { config } from "@/lib/config";
import { getDisposalGuidance } from "@/lib/disposal/rules";
import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin, getClientIp, getRequestId } from "@/lib/http";
import { logError, logInfo } from "@/lib/logger";
import { checkRateLimit, hashIp } from "@/lib/rate-limit";
import { saveScan } from "@/lib/scan-store";
import { getCanonicalItem, type Confidence } from "@/lib/taxonomy";
import type { ScanAlternative, ScanResultPayload } from "@/lib/types";
import { readValidatedImage } from "@/lib/validation/image";

export const runtime = "nodejs";
export const maxDuration = 60;

const MULTIPLE_ITEMS_MESSAGE =
  "Several items are in this photo. Photograph a single item so it fills most of the frame.";

function capConfidence(
  confidence: Confidence,
  uncertaintyReason: string,
  hasCloseAlternative: boolean,
): Confidence {
  if (confidence === "high" && (uncertaintyReason.length > 0 || hasCloseAlternative)) {
    return "medium";
  }
  return confidence;
}

export async function POST(request: Request) {
  const requestId = getRequestId();
  const startedAt = Date.now();

  try {
    assertSameOrigin(request.headers);

    const contentLength = Number(request.headers.get("content-length") || "0");
    if (contentLength > config.maxImageBytes + 1024 * 1024) {
      throw new AppError(
        "FILE_TOO_LARGE",
        413,
        `That image is too large. Use an image under ${Math.round(config.maxImageBytes / 1024 / 1024)} MB.`,
      );
    }

    const ipHash = hashIp(getClientIp(request.headers));
    const [minuteLimit, dayLimit, globalLimit] = await Promise.all([
      checkRateLimit({
        key: `scan:${ipHash}:minute`,
        limit: config.scanPerMinute,
        windowSeconds: 60,
      }),
      checkRateLimit({
        key: `scan:${ipHash}:day`,
        limit: config.scanPerDay,
        windowSeconds: 86_400,
      }),
      checkRateLimit({
        key: "scan:global:day",
        limit: config.globalScanPerDay,
        windowSeconds: 86_400,
      }),
    ]);

    const blocked = [minuteLimit, dayLimit, globalLimit].find((limit) => !limit.allowed);
    if (blocked) {
      throw new AppError(
        "RATE_LIMITED",
        429,
        "Too many scans right now. Try again shortly.",
        blocked.retryAfter,
      );
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      throw new AppError("INVALID_REQUEST", 400, "Send the image as multipart form data.");
    }

    const file = form.get("image");
    if (!(file instanceof File) || file.size === 0) {
      throw new AppError("INVALID_REQUEST", 400, "Choose an image before scanning.");
    }

    const image = await readValidatedImage(file);
    const classification = await classifyWasteImage(image);

    if (classification.multipleItems) {
      const payload: ScanResultPayload = {
        scanId: null,
        result: {
          isWasteItem: false,
          outcome: "multiple-items",
          itemName: classification.itemName,
          message: MULTIPLE_ITEMS_MESSAGE,
        },
      };

      logInfo("scan_multiple_items", {
        requestId,
        durationMs: Date.now() - startedAt,
        itemName: classification.itemName,
      });

      return Response.json(payload, {
        headers: { "cache-control": "no-store", "x-request-id": requestId },
      });
    }

    if (!classification.isWasteItem) {
      const payload: ScanResultPayload = {
        scanId: null,
        result: {
          isWasteItem: false,
          outcome: "not-waste",
          itemName: classification.itemName,
          message:
            "Try a closer photo of one item, with the object filling most of the frame.",
        },
      };

      logInfo("scan_not_waste", {
        requestId,
        durationMs: Date.now() - startedAt,
        itemName: classification.itemName,
      });

      return Response.json(payload, {
        headers: { "cache-control": "no-store", "x-request-id": requestId },
      });
    }

    const canonical = getCanonicalItem(classification.canonicalItem);
    if (!canonical) {
      throw new AppError(
        "INVALID_AI_RESPONSE",
        502,
        "The scanner returned an unknown item type. Try again.",
      );
    }

    const alternatives: ScanAlternative[] = [];
    for (const alternative of classification.alternatives) {
      if (alternatives.length >= 2) break;
      if (alternative.canonicalItem === canonical.slug) continue;
      const alternativeItem = getCanonicalItem(alternative.canonicalItem);
      if (!alternativeItem) continue;
      if (alternatives.some((item) => item.canonicalItem === alternativeItem.slug)) continue;
      alternatives.push({
        itemName: alternative.itemName,
        canonicalItem: alternativeItem.slug,
        canonicalItemLabel: alternativeItem.label,
      });
    }

    const uncertaintyReason = classification.uncertaintyReason.trim();
    const confidence = capConfidence(
      classification.confidence,
      uncertaintyReason,
      alternatives.length > 0,
    );
    const explanation =
      uncertaintyReason ||
      (confidence !== "high"
        ? alternatives.length > 0
          ? "A close alternative is also plausible."
          : "The photo does not show the item clearly enough to be sure."
        : "");

    const disposal = getDisposalGuidance(canonical.slug, classification.materialGroup);

    let scanId: string | null = null;
    try {
      scanId = await saveScan({
        canonicalItem: canonical.slug,
        itemName: classification.itemName,
        material: classification.material,
        materialGroup: classification.materialGroup,
        wasteStream: disposal.wasteStream,
        confidence,
      });
    } catch (error) {
      logError("scan_persistence_failed", {
        requestId,
        message: error instanceof Error ? error.message.slice(0, 120) : "unknown",
      });
    }

    const payload: ScanResultPayload = {
      scanId,
      result: {
        isWasteItem: true,
        itemName: classification.itemName,
        canonicalItem: canonical.slug,
        canonicalItemLabel: canonical.label,
        material: classification.material,
        materialGroup: classification.materialGroup,
        wasteStream: disposal.wasteStream,
        confidence,
        uncertaintyReason: explanation,
        alternatives,
        disposal,
      },
    };

    logInfo("scan_completed", {
      requestId,
      durationMs: Date.now() - startedAt,
      canonicalItem: canonical.slug,
      confidence,
      persisted: Boolean(scanId),
      rateLimitDegraded: minuteLimit.degraded || dayLimit.degraded || globalLimit.degraded,
    });

    return Response.json(payload, {
      headers: { "cache-control": "no-store", "x-request-id": requestId },
    });
  } catch (error) {
    if (error instanceof AppError) {
      logInfo("scan_rejected", {
        requestId,
        code: error.code,
        status: error.status,
        durationMs: Date.now() - startedAt,
      });
      return errorResponse(error, requestId);
    }

    logError("scan_failed", {
      requestId,
      message: error instanceof Error ? error.message.slice(0, 120) : "unknown",
      durationMs: Date.now() - startedAt,
    });

    return errorResponse(
      new AppError("INTERNAL", 500, "Something went wrong. Try again."),
      requestId,
    );
  }
}
