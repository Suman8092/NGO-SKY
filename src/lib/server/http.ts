import { randomUUID } from "node:crypto";
import { z } from "zod";

import { ApiError, safeLogError } from "./errors";

const DEFAULT_MAX_BODY_BYTES = 64 * 1024;

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  requestId: string;
};

function responseHeaders(requestId?: string): HeadersInit {
  return {
    "Cache-Control": "no-store, max-age=0",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    ...(requestId ? { "X-Request-Id": requestId } : {}),
  };
}

export function jsonSuccess<T>(
  data: T,
  init: { status?: number; meta?: Record<string, unknown>; headers?: HeadersInit } = {},
): Response {
  const body: ApiSuccess<T> = { ok: true, data, ...(init.meta ? { meta: init.meta } : {}) };
  const headers = new Headers(responseHeaders());
  if (init.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  return Response.json(body, { status: init.status ?? 200, headers });
}

export function getRequestId(request: Request): string {
  const incoming = request.headers.get("x-request-id")?.trim();
  return incoming && /^[a-zA-Z0-9._:-]{8,100}$/.test(incoming) ? incoming : randomUUID();
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function parseJsonRequest<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
  maxBytes = DEFAULT_MAX_BODY_BYTES,
): Promise<z.output<TSchema>> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.");
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "The request body is too large.");
  }

  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > maxBytes) {
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "The request body is too large.");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new ApiError(400, "INVALID_JSON", "The request body is not valid JSON.");
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    throw new ApiError(422, "VALIDATION_ERROR", "Please check the submitted fields.", {
      details: {
        fieldErrors: flattened.fieldErrors,
        formErrors: flattened.formErrors,
      },
    });
  }

  return parsed.data as z.output<TSchema>;
}

export async function readRawBody(request: Request, maxBytes = 1024 * 1024): Promise<string> {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "The request body is too large.");
  }
  const body = await request.text();
  if (Buffer.byteLength(body, "utf8") > maxBytes) {
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "The request body is too large.");
  }
  return body;
}

export function errorResponse(error: unknown, requestId: string, context: string): Response {
  const apiError =
    error instanceof ApiError
      ? error
      : new ApiError(500, "INTERNAL_ERROR", "The request could not be completed.", { cause: error });

  if (apiError.status >= 500) safeLogError(context, error);

  const body: ApiFailure = {
    ok: false,
    error: {
      code: apiError.code,
      message: apiError.message,
      ...(apiError.details ? { details: apiError.details } : {}),
    },
    requestId,
  };
  const headers = new Headers(responseHeaders(requestId));
  if (apiError.retryAfter) headers.set("Retry-After", String(apiError.retryAfter));
  return Response.json(body, { status: apiError.status, headers });
}
