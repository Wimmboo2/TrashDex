import { config } from "@/lib/config";
import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin, getClientIp, getRequestId } from "@/lib/http";
import { logError, logInfo } from "@/lib/logger";
import { checkRateLimit, hashIp } from "@/lib/rate-limit";
import { saveFeedback } from "@/lib/scan-store";
import { FeedbackSchema } from "@/lib/validation/feedback";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const requestId = getRequestId();

  try {
    assertSameOrigin(request.headers);

    const ipHash = hashIp(getClientIp(request.headers));
    const [minuteLimit, dayLimit] = await Promise.all([
      checkRateLimit({
        key: `feedback:${ipHash}:minute`,
        limit: config.feedbackPerMinute,
        windowSeconds: 60,
      }),
      checkRateLimit({
        key: `feedback:${ipHash}:day`,
        limit: config.feedbackPerDay,
        windowSeconds: 86_400,
      }),
    ]);

    const blocked = [minuteLimit, dayLimit].find((limit) => !limit.allowed);
    if (blocked) {
      throw new AppError(
        "RATE_LIMITED",
        429,
        "Too many feedback submissions. Try again shortly.",
        blocked.retryAfter,
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new AppError("INVALID_REQUEST", 400, "Send feedback as JSON.");
    }

    const parsed = FeedbackSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError("INVALID_REQUEST", 400, "Check the feedback fields and try again.");
    }

    const { scanId, verdict, correction } = parsed.data;
    const outcome = await saveFeedback({
      scanId,
      verdict,
      correctedItemName: verdict === "incorrect" ? correction?.itemName : undefined,
      correctedCanonicalItem: verdict === "incorrect" ? correction?.canonicalItem : undefined,
      correctedMaterialGroup: verdict === "incorrect" ? correction?.materialGroup : undefined,
      correctedWasteStream: verdict === "incorrect" ? correction?.wasteStream : undefined,
    });

    if (outcome === "missing") {
      throw new AppError("FEEDBACK_NOT_FOUND", 404, "That scan could not be found.");
    }

    if (outcome === "duplicate") {
      throw new AppError(
        "FEEDBACK_DUPLICATE",
        409,
        "Feedback was already recorded for this scan.",
      );
    }

    logInfo("feedback_recorded", { requestId, verdict });

    return Response.json(
      { ok: true },
      { status: 201, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error, requestId);
    }

    logError("feedback_failed", {
      requestId,
      message: error instanceof Error ? error.message.slice(0, 120) : "unknown",
    });

    return errorResponse(
      new AppError("DATABASE_UNAVAILABLE", 503, "Feedback is temporarily unavailable."),
      requestId,
    );
  }
}
