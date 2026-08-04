import {
  errorResponse,
  getClientIp,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { submitContact } from "@/lib/server/services/submissions";
import { contactSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    const ip = getClientIp(request);
    enforceRateLimit("contact", ip, { limit: 5, windowMs: 10 * 60_000 });
    const input = await parseJsonRequest(request, contactSchema);
    const result = await submitContact(input, {
      requestId,
      ip,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
    return jsonSuccess(
      {
        ...result.record,
        message: "Thank you. Your message has been received.",
      },
      {
        status: 201,
        meta: {
          mode: result.persistence === "memory" ? "demo" : "live",
          persistence: result.persistence,
          email: result.email.status,
        },
      },
    );
  } catch (error) {
    return errorResponse(error, requestId, "contact");
  }
}
