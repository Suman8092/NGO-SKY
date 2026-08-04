import { fetchPublishedContent } from "@/lib/server/cms/sanity";
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
    enforceRateLimit("content", getClientIp(request), {
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
    const result = await fetchPublishedContent(
      parsed.data.type,
      parsed.data.limit,
    );
    return jsonSuccess(result.data, {
      meta: {
        source: result.source,
        type: parsed.data.type,
        count: result.data.length,
      },
      headers: {
        "Cache-Control":
          result.source === "sanity"
            ? "public, s-maxage=300, stale-while-revalidate=3600"
            : "no-store",
      },
    });
  } catch (error) {
    return errorResponse(error, requestId, "content");
  }
}
