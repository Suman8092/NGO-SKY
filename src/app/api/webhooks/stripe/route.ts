import { errorResponse, getRequestId, jsonSuccess, readRawBody } from "@/lib/server/http";
import { constructStripeEvent, stripeEventToDonationUpdate } from "@/lib/server/payments/stripe";
import { processDonationPaymentUpdate } from "@/lib/server/services/donations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    const rawBody = await readRawBody(request);
    const event = constructStripeEvent(rawBody, request.headers.get("stripe-signature"));
    const update = stripeEventToDonationUpdate(event);
    const processed = update ? await processDonationPaymentUpdate(update) : null;
    return jsonSuccess({
      received: true,
      eventType: event.type,
      processed: Boolean(processed?.donation),
    });
  } catch (error) {
    return errorResponse(error, requestId, "stripe-webhook");
  }
}
