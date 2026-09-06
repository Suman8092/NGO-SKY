import { auth } from "@clerk/nextjs/server";

import { isAdminUserId, isClerkConfigured } from "@/lib/auth-config";
import { ApiError } from "@/lib/server/errors";
import { errorResponse, getRequestId } from "@/lib/server/http";
import { getHealthSnapshot } from "@/lib/server/services/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  const deep = new URL(request.url).searchParams.get("deep") === "true";

  if (deep) {
    if (!isClerkConfigured()) {
      return errorResponse(
        new ApiError(404, "NOT_FOUND", "Health diagnostics are unavailable."),
        requestId,
        "health-deep-unavailable",
      );
    }

    const { userId } = await auth();
    if (!isAdminUserId(userId)) {
      return errorResponse(
        new ApiError(
          403,
          "ADMIN_REQUIRED",
          "Administrator access is required.",
        ),
        requestId,
        "health-deep-forbidden",
      );
    }
  }

  const snapshot = await getHealthSnapshot(deep);
  const body = deep
    ? snapshot.body
    : {
        status: snapshot.body.status,
        service: snapshot.body.service,
        timestamp: snapshot.body.timestamp,
      };
  return Response.json(
    {
      ok: snapshot.httpStatus < 400,
      data: body,
    },
    {
      status: snapshot.httpStatus,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "X-Request-Id": requestId,
      },
    },
  );
}
