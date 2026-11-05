import { after } from "next/server";
import { reconcileHostedPayment } from "@/lib/server/ngo/hosted-payments";
import { processNgoOutbox } from "@/lib/server/ngo/jobs";
import { getVerifiedSiteOrigin } from "@/lib/server/env";
import { errorResponse, getRequestId, getClientIp } from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { ApiError } from "@/lib/server/errors";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await params;
    const p = new URL(request.url).searchParams,
      id = p.get("payment") ?? "",
      token = p.get("token") ?? "";
    if (
      !["phonepe", "payu"].includes(provider) ||
      !/^[a-f0-9]{24}$/i.test(id) ||
      !/^[a-f0-9]{64}$/.test(token)
    )
      throw new ApiError(
        400,
        "INVALID_REFERENCE",
        "Invalid payment return reference.",
      );
    await enforceRateLimit("hosted-return", getClientIp(request), {
      limit: 30,
      windowMs: 60000,
    });
    const result = await reconcileHostedPayment(id, token);
    after(async () => {
      await processNgoOutbox(5).catch(() => undefined);
    });
    const origin = getVerifiedSiteOrigin();
    if (!origin)
      throw new ApiError(
        503,
        "SITE_ORIGIN_REQUIRED",
        "Website origin is not configured.",
      );
    return Response.redirect(
      `${origin}/payment-status?status=${result.status}`,
      303,
    );
  } catch (e) {
    return errorResponse(e, getRequestId(request), "hosted-return");
  }
}
export const POST = GET;
