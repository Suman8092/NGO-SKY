import {
  errorResponse,
  getClientIp,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { acknowledgeRazorpayPayment } from "@/lib/server/services/donations";
import { razorpayVerificationSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    enforceRateLimit("razorpay-verify", getClientIp(request), {
      limit: 20,
      windowMs: 10 * 60_000,
    });
    const input = await parseJsonRequest(request, razorpayVerificationSchema);
    const result = await acknowledgeRazorpayPayment({
      donationId: input.donationId,
      orderId: input.razorpay_order_id,
      paymentId: input.razorpay_payment_id,
      signature: input.razorpay_signature,
    });
    return jsonSuccess(result, {
      status: 202,
      meta: { webhookConfirmationRequired: true },
    });
  } catch (error) {
    return errorResponse(error, requestId, "razorpay-verify");
  }
}
