import {
  errorResponse,
  getClientIp,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { submitVolunteerApplication } from "@/lib/server/services/submissions";
import { volunteerSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    const ip = getClientIp(request);
    enforceRateLimit("volunteer", ip, { limit: 3, windowMs: 60 * 60_000 });
    const input = await parseJsonRequest(request, volunteerSchema);
    const result = await submitVolunteerApplication(input, { requestId, ip });
    return jsonSuccess(
      {
        ...result.record,
        message: "Your volunteer application has been received.",
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
    return errorResponse(error, requestId, "volunteer");
  }
}
