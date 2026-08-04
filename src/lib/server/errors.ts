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

export function safeLogError(context: string, error: unknown): void {
  const name = error instanceof Error ? error.name : "UnknownError";
  console.error(`[server:${context}]`, { name });
}
