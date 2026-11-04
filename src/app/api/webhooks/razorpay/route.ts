import { processNgoOutbox } from "@/lib/server/ngo/jobs";
import { handleNgoWebhook, onlineReceipt } from "@/lib/server/ngo/payments";
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
  razorpayWebhookEventType,
  razorpayWebhookToDonationUpdate,
  verifyRazorpayWebhook,
} from "@/lib/server/payments/razorpay";

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
      throw new ApiError(
        400,
        "INVALID_JSON",
        "The webhook body is not valid JSON.",
      );
    }
    if (await handleNgoWebhook(payload, request.headers.get("x-razorpay-event-id") ?? undefined, rawBody)) { after(async()=>{await processNgoOutbox(5).catch(()=>undefined);}); return jsonSuccess({ received: true, processed: true }); }
    const update = razorpayWebhookToDonationUpdate(payload);
    const receipt = await recordPaymentWebhookEvent({
      provider: "razorpay",
      providerEventId: request.headers.get("x-razorpay-event-id"),
      eventType: razorpayWebhookEventType(payload),
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
        await onlineReceipt(donation.id).catch((error: unknown) => safeLogError("ngo-receipt", error));
        await processNgoOutbox(5).catch(()=>undefined);
        await sendDonationConfirmation(donation).catch((error: unknown) => {
          safeLogError("donation-confirmation", error);
        });
      });
    }
    return jsonSuccess({
      received: true,
      duplicate: receipt.duplicate,
      processed:
        processing?.state === "processed" || receipt.status === "processed",
    });
  } catch (error) {
    return errorResponse(error, requestId, "razorpay-webhook");
  }
}
