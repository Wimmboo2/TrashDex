import { classifyWasteImage } from "@/lib/ai/gemini";
import { config } from "@/lib/config";
import { getDisposalGuidance } from "@/lib/disposal/rules";
import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin, getClientIp, getRequestId } from "@/lib/http";
import { logError, logInfo } from "@/lib/logger";
import { checkRateLimit, hashIp } from "@/lib/rate-limit";
import { saveScan } from "@/lib/scan-store";
import { getCanonicalItem } from "@/lib/taxonomy";
import type { ScanAlternative, ScanResultPayload } from "@/lib/types";
import { readValidatedImage } from "@/lib/validation/image";

export const runtime = "nodejs";
export const maxDuration = 60;

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

    if (!classification.isWasteItem) {
      const payload: ScanResultPayload = {
        scanId: null,
        result: {
          isWasteItem: false,
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

    const disposal = getDisposalGuidance(canonical.slug, classification.materialGroup);

    let scanId: string | null = null;
    try {
      scanId = await saveScan({
        canonicalItem: canonical.slug,
        itemName: classification.itemName,
        material: classification.material,
        materialGroup: classification.materialGroup,
        wasteStream: disposal.wasteStream,
        confidence: classification.confidence,
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
        confidence: classification.confidence,
        uncertaintyReason: classification.uncertaintyReason,
        alternatives,
        disposal,
      },
    };

    logInfo("scan_completed", {
      requestId,
      durationMs: Date.now() - startedAt,
      canonicalItem: canonical.slug,
      confidence: classification.confidence,
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
