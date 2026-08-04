import {
  errorResponse,
  getClientIp,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { startDonationCheckout } from "@/lib/server/services/donations";
import { donationReferenceSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    enforceRateLimit("stripe-checkout", getClientIp(request), {
      limit: 10,
      windowMs: 10 * 60_000,
    });
    const { donationId } = await parseJsonRequest(
      request,
      donationReferenceSchema,
    );
    const result = await startDonationCheckout(donationId, "stripe");
    return jsonSuccess(result, {
      status: 201,
      meta: { paymentInitiated: true },
    });
  } catch (error) {
    return errorResponse(error, requestId, "stripe-checkout");
  }
}
