export type ApiErrorDetails = Record<string, unknown>;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiErrorDetails;
  readonly retryAfter?: number;

  constructor(
    status: number,
    code: string,
    message: string,
    options: { details?: ApiErrorDetails; retryAfter?: number; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = options.details;
    this.retryAfter = options.retryAfter;
  }
}

function sanitizeErrorMessage(msg: string): string {
  return msg.replace(/(:\/\/[\w.-]+:)([^@]+)(@)/g, "$1***$3");
}

export function safeLogError(context: string, error: unknown): void {
  const name = error instanceof Error ? error.name : "UnknownError";
  const code = error instanceof ApiError ? error.code : undefined;
  const message = error instanceof Error ? sanitizeErrorMessage(error.message) : String(error);
  const cause =
    error instanceof Error && error.cause instanceof Error
      ? sanitizeErrorMessage(error.cause.message)
      : undefined;
  console.error(`[server:${context}]`, { name, code, message, cause });
}
