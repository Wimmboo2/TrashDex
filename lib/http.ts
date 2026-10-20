import { isIP } from "node:net";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";

export function getRequestId(): string {
  return crypto.randomUUID();
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const candidate =
    forwarded?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    "unknown";

  return isIP(candidate) ? candidate : "unknown";
}

export function assertSameOrigin(headers: Headers): void {
  const origin = headers.get("origin");
  if (!origin || !config.appOrigin) return;
  if (origin !== config.appOrigin) {
    throw new AppError("FORBIDDEN", 403, "This request origin is not allowed.");
  }
}
