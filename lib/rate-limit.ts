import { createHmac } from "node:crypto";
import { query } from "@/lib/db";
import { logError } from "@/lib/logger";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
  degraded: boolean;
};

export function hashIp(ip: string): string {
  const secret = process.env.RATE_LIMIT_SECRET || "trashdex-dev-only-secret";
  return createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}

async function cleanupOldWindows(): Promise<void> {
  try {
    await query("delete from rate_limits where window_start < now() - interval '2 days'");
  } catch {
    // Cleanup is opportunistic and must never break a scan.
  }
}

export async function checkRateLimit(input: {
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  try {
    const rows = await query<{ count: number }>(
      `insert into rate_limits (key, window_start, count)
       values ($1, to_timestamp(floor(extract(epoch from now()) / $2) * $2), 1)
       on conflict (key, window_start)
       do update set count = rate_limits.count + 1
       returning count`,
      [input.key, input.windowSeconds],
    );

    const count = rows[0]?.count ?? 1;
    const retryAfter = input.windowSeconds;

    if (Math.random() < 0.02) {
      void cleanupOldWindows();
    }

    return {
      allowed: count <= input.limit,
      remaining: Math.max(0, input.limit - count),
      retryAfter,
      degraded: false,
    };
  } catch (error) {
    logError("rate_limit_unavailable", {
      message: error instanceof Error ? error.message.slice(0, 120) : "unknown",
    });

    return {
      allowed: true,
      remaining: input.limit,
      retryAfter: 0,
      degraded: true,
    };
  }
}
