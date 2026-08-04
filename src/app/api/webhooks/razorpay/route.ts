import { ApiError } from "@/lib/server/errors";
import { errorResponse, getRequestId, jsonSuccess, readRawBody } from "@/lib/server/http";
import { razorpayWebhookToDonationUpdate, verifyRazorpayWebhook } from "@/lib/server/payments/razorpay";
import { processDonationPaymentUpdate } from "@/lib/server/services/donations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    const rawBody = await readRawBody(request);
    verifyRazorpayWebhook(rawBody, request.headers.get("x-razorpay-signature"));
    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new ApiError(400, "INVALID_JSON", "The webhook body is not valid JSON.");
    }
    const update = razorpayWebhookToDonationUpdate(payload);
    const processed = update ? await processDonationPaymentUpdate(update) : null;
    return jsonSuccess({ received: true, processed: Boolean(processed?.donation) });
  } catch (error) {
    return errorResponse(error, requestId, "razorpay-webhook");
  }
}
