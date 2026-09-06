import { after } from "next/server";

import { sendDonationConfirmation } from "@/lib/server/email/resend";
import { ApiError, safeLogError } from "@/lib/server/errors";
import {
  errorResponse,
  getRequestId,
  jsonSuccess,
  readRawBody,
} from "@/lib/server/http";
import {
  processPaymentWebhookEvent,
  recordPaymentWebhookEvent,
} from "@/lib/server/payment-webhook-inbox";
import {
  constructStripeEvent,
  stripeEventToDonationUpdate,
} from "@/lib/server/payments/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    const rawBody = await readRawBody(request);
    const event = constructStripeEvent(
      rawBody,
      request.headers.get("stripe-signature"),
    );
    const update = stripeEventToDonationUpdate(event);
    const receipt = await recordPaymentWebhookEvent({
      provider: "stripe",
      providerEventId: event.id,
      eventType: event.type,
      rawBody,
      update,
    });
    if (!receipt.shouldProcess && receipt.status === "processing") {
      throw new ApiError(
        409,
        "WEBHOOK_PROCESSING_IN_PROGRESS",
        "This webhook event is still being processed.",
        { retryAfter: 30 },
      );
    }
    const processing = receipt.shouldProcess
      ? await processPaymentWebhookEvent(receipt.eventId)
      : null;
    if (processing?.state === "not_claimed") {
      throw new ApiError(
        409,
        "WEBHOOK_PROCESSING_IN_PROGRESS",
        "This webhook event is still being processed.",
        { retryAfter: 30 },
      );
    }
    if (processing?.confirmationDonation) {
      const donation = processing.confirmationDonation;
      after(async () => {
        await sendDonationConfirmation(donation).catch((error: unknown) => {
          safeLogError("donation-confirmation", error);
        });
      });
    }
    return jsonSuccess({
      received: true,
      eventType: event.type,
      duplicate: receipt.duplicate,
      processed:
        processing?.state === "processed" || receipt.status === "processed",
    });
  } catch (error) {
    return errorResponse(error, requestId, "stripe-webhook");
  }
}
