import { auth } from "@clerk/nextjs/server";

import { isClerkConfigured } from "@/lib/auth-config";
import {
  errorResponse,
  getClientIp,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import {
  assertSubmissionWorkflow,
  submitEventRegistration,
} from "@/lib/server/services/submissions";
import { eventRegistrationSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function optionalAccountUserId(): Promise<string | undefined> {
  if (!isClerkConfigured()) return undefined;
  try {
    const { userId } = await auth();
    return userId ?? undefined;
  } catch {
    return undefined;
  }
}

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    assertSubmissionWorkflow("event");
    const ip = getClientIp(request);
    await enforceRateLimit("event_registration", ip, {
      limit: 5,
      windowMs: 15 * 60_000,
    });

    const accountUserId = await optionalAccountUserId();
    const input = await parseJsonRequest(request, eventRegistrationSchema);
    const result = await submitEventRegistration(input, {
      requestId,
      ip,
      accountUserId,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return jsonSuccess(
      {
        ...result.record,
        message: `Your registration for ${result.record.eventTitle} is confirmed. Pass Code: ${result.record.ticketCode}`,
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
    return errorResponse(error, requestId, "event-registration");
  }
}
