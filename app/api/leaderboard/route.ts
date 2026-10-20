import { AppError, errorResponse } from "@/lib/errors";
import { isDatabaseConfigured } from "@/lib/db";
import { getRequestId } from "@/lib/http";
import { logError } from "@/lib/logger";
import { getLeaderboard } from "@/lib/scan-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestId = getRequestId();

  try {
    if (!isDatabaseConfigured()) {
      throw new AppError(
        "DATABASE_UNAVAILABLE",
        503,
        "The leaderboard is not configured yet.",
      );
    }

    const url = new URL(request.url);
    const requestedLimit = Number(url.searchParams.get("limit") || "20");
    const limit =
      Number.isInteger(requestedLimit) && requestedLimit >= 1 && requestedLimit <= 50
        ? requestedLimit
        : 20;

    const items = await getLeaderboard(limit);

    return Response.json(
      { items, generatedAt: new Date().toISOString() },
      {
        headers: {
          "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
          "x-request-id": requestId,
        },
      },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error, requestId);
    }

    logError("leaderboard_failed", {
      requestId,
      message: error instanceof Error ? error.message.slice(0, 120) : "unknown",
    });

    return errorResponse(
      new AppError("DATABASE_UNAVAILABLE", 503, "The leaderboard is temporarily unavailable."),
      requestId,
    );
  }
}
