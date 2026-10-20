export type ErrorCode =
  | "INVALID_REQUEST"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_TYPE"
  | "RATE_LIMITED"
  | "UPSTREAM_QUOTA"
  | "UPSTREAM_TIMEOUT"
  | "UPSTREAM_UNAVAILABLE"
  | "INVALID_AI_RESPONSE"
  | "AI_NOT_CONFIGURED"
  | "FEEDBACK_NOT_FOUND"
  | "FEEDBACK_DUPLICATE"
  | "DATABASE_UNAVAILABLE"
  | "FORBIDDEN"
  | "INTERNAL";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly retryAfter?: number;

  constructor(code: ErrorCode, status: number, message: string, retryAfter?: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export function errorResponse(error: AppError, requestId: string): Response {
  const headers = new Headers({
    "content-type": "application/json",
    "cache-control": "no-store",
    "x-request-id": requestId,
  });

  if (error.retryAfter) {
    headers.set("retry-after", String(error.retryAfter));
  }

  return Response.json(
    {
      error: {
        code: error.code,
        message: error.message,
        requestId,
      },
    },
    { status: error.status, headers },
  );
}
