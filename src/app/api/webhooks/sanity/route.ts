import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

import { getServerEnv } from "@/lib/server/env";
import { ApiError } from "@/lib/server/errors";
import { errorResponse, getRequestId, jsonSuccess } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SanityWebhookBody = { _type?: string; slug?: { current?: string } };
const allowedTags = new Set(["campaign", "program", "successStory", "post", "event"]);

export async function POST(request: NextRequest): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    const secret = getServerEnv().SANITY_REVALIDATE_SECRET;
    if (!secret) {
      throw new ApiError(503, "SANITY_WEBHOOK_NOT_CONFIGURED", "Sanity revalidation is not configured.");
    }
    const declaredLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(declaredLength) && declaredLength > 1024 * 1024) {
      throw new ApiError(413, "PAYLOAD_TOO_LARGE", "The request body is too large.");
    }
    const signature = request.headers.get(SIGNATURE_HEADER_NAME) ?? "";
    const rawBody = await request.text();
    if (!(await isValidSignature(rawBody, signature, secret))) {
      throw new ApiError(401, "INVALID_SIGNATURE", "The webhook signature is invalid.");
    }
    let body: SanityWebhookBody;
    try {
      body = JSON.parse(rawBody) as SanityWebhookBody;
    } catch {
      throw new ApiError(400, "INVALID_JSON", "The webhook payload is not valid JSON.");
    }
    if (body?._type && allowedTags.has(body._type)) revalidateTag(body._type);
    return jsonSuccess({
      received: true,
      revalidated: Boolean(body?._type && allowedTags.has(body._type)),
      contentType: body?._type ?? null,
    });
  } catch (error) {
    return errorResponse(error, requestId, "sanity-webhook");
  }
}
