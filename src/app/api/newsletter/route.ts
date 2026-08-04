import {
  errorResponse,
  getClientIp,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { subscribeToNewsletter } from "@/lib/server/services/submissions";
import { newsletterSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    const ip = getClientIp(request);
    enforceRateLimit("newsletter", ip, { limit: 10, windowMs: 60 * 60_000 });
    const input = await parseJsonRequest(request, newsletterSchema);
    const result = await subscribeToNewsletter(input, { requestId, ip });
    return jsonSuccess(
      {
        ...result.record,
        subscribed: true,
        message: result.created
          ? "You are subscribed."
          : "Your subscription is already active.",
      },
      {
        status: result.created ? 201 : 200,
        meta: {
          mode: result.persistence === "memory" ? "demo" : "live",
          persistence: result.persistence,
          email: result.email.status,
        },
      },
    );
  } catch (error) {
    return errorResponse(error, requestId, "newsletter");
  }
}
