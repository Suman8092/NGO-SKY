import { fetchCachedPublishedContent } from "@/lib/server/cms/sanity-cache";
import { isEditorialContentPublished } from "@/lib/content-config";
import { ApiError } from "@/lib/server/errors";
import {
  errorResponse,
  getClientIp,
  getRequestId,
  jsonSuccess,
} from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { contentQuerySchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    if (!isEditorialContentPublished()) {
      throw new ApiError(
        503,
        "CONTENT_UNPUBLISHED",
        "Editorial content is not available until verification is complete.",
        { retryAfter: 300 },
      );
    }
    await enforceRateLimit("content", getClientIp(request), {
      limit: 120,
      windowMs: 60_000,
    });
    const url = new URL(request.url);
    const parsed = contentQuerySchema.safeParse({
      type: url.searchParams.get("type"),
      limit: url.searchParams.get("limit") ?? undefined,
    });
    if (!parsed.success) {
      throw new ApiError(
        400,
        "INVALID_CONTENT_QUERY",
        "Use a supported content type and limit.",
      );
    }
    const result = await fetchCachedPublishedContent(
      parsed.data.type,
      parsed.data.limit,
    );
    return jsonSuccess(result.data, {
      meta: {
        source: result.source,
        type: parsed.data.type,
        count: result.data.length,
      },
    });
  } catch (error) {
    return errorResponse(error, requestId, "content");
  }
}
