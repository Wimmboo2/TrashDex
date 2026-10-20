import { getInsights, parseAnalyticsRange } from "@/lib/analytics";
import { isDatabaseConfigured } from "@/lib/db";
import { AppError, errorResponse } from "@/lib/errors";
import { getRequestId } from "@/lib/http";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestId = getRequestId();

  try {
    if (!isDatabaseConfigured()) {
      throw new AppError(
        "DATABASE_UNAVAILABLE",
        503,
        "The insights dashboard is not configured yet.",
      );
    }

    const url = new URL(request.url);
    const range = parseAnalyticsRange(url.searchParams.get("range"));
    const insights = await getInsights(range);

    return Response.json(insights, {
      headers: {
        "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
        "x-request-id": requestId,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error, requestId);
    }

    logError("insights_failed", {
      requestId,
      message: error instanceof Error ? error.message.slice(0, 120) : "unknown",
    });

    return errorResponse(
      new AppError("DATABASE_UNAVAILABLE", 503, "The insights dashboard is temporarily unavailable."),
      requestId,
    );
  }
}
