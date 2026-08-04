import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

import { getServerEnv, hasRazorpayConfig } from "../env";
import { ApiError } from "../errors";
import type { DonationRecord } from "../repository";
import type { CheckoutResult, DonationPaymentUpdate } from "./types";

const razorpayOrderSchema = z.object({
  id: z.string().min(1),
  amount: z.number().int().positive(),
  currency: z.string().min(3).max(3),
  status: z.string(),
});

function signaturesMatch(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function createRazorpayOrder(donation: DonationRecord): Promise<CheckoutResult> {
  const env = getServerEnv();
  if (!hasRazorpayConfig() || !env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(503, "RAZORPAY_NOT_CONFIGURED", "Razorpay checkout is not available.");
  }
  if (donation.provider !== "razorpay") {
    throw new ApiError(409, "PAYMENT_PROVIDER_MISMATCH", "This donation is not assigned to Razorpay.");
  }
  if (donation.currency !== "INR" || donation.frequency !== "one_time") {
    throw new ApiError(422, "RAZORPAY_DONATION_UNSUPPORTED", "Razorpay supports one-time INR donations here.");
  }
  if (donation.status === "paid" || donation.status === "refunded") {
    throw new ApiError(409, "DONATION_ALREADY_SETTLED", "This donation has already been settled.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: donation.amountMinor,
        currency: donation.currency,
        receipt: `don_${donation.id}`.slice(0, 40),
        notes: { donationId: donation.id, campaignId: donation.campaignId ?? "general" },
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new ApiError(502, "RAZORPAY_REQUEST_FAILED", "Razorpay order creation failed.");
    }
    const parsed = razorpayOrderSchema.safeParse(await response.json());
    if (
      !parsed.success ||
      parsed.data.amount !== donation.amountMinor ||
      parsed.data.currency !== donation.currency
    ) {
      throw new ApiError(502, "RAZORPAY_RESPONSE_INVALID", "Razorpay returned an invalid order.");
    }
    return {
      provider: "razorpay",
      status: "requires_action",
      orderId: parsed.data.id,
      keyId: env.RAZORPAY_KEY_ID,
      amountMinor: parsed.data.amount,
      currency: parsed.data.currency,
    };
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    throw new ApiError(502, "RAZORPAY_REQUEST_FAILED", "Razorpay order creation failed.", { cause });
  } finally {
    clearTimeout(timeout);
  }
}

export function verifyRazorpayPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const env = getServerEnv();
  if (!hasRazorpayConfig() || !env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(503, "RAZORPAY_NOT_CONFIGURED", "Razorpay verification is not available.");
  }
  const expected = createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");
  return signaturesMatch(expected, input.signature);
}

export function verifyRazorpayWebhook(rawBody: string, signature: string | null): void {
  const secret = getServerEnv().RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new ApiError(503, "RAZORPAY_WEBHOOK_NOT_CONFIGURED", "Razorpay webhooks are not configured.");
  }
  if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) {
    throw new ApiError(400, "MISSING_SIGNATURE", "A valid Razorpay signature header is required.");
  }
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  if (!signaturesMatch(expected, signature)) {
    throw new ApiError(400, "INVALID_SIGNATURE", "The webhook signature is invalid.");
  }
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function razorpayWebhookToDonationUpdate(payload: unknown): DonationPaymentUpdate | null {
  const root = objectValue(payload);
  const event = stringValue(root?.event);
  const eventPayload = objectValue(root?.payload);
  const payment = objectValue(objectValue(eventPayload?.payment)?.entity);
  const order = objectValue(objectValue(eventPayload?.order)?.entity);
  const refund = objectValue(objectValue(eventPayload?.refund)?.entity);
  const entity = payment ?? order ?? refund;
  const notes = objectValue(entity?.notes);
  const donationId = stringValue(notes?.donationId);
  const orderId = stringValue(payment?.order_id) ?? stringValue(order?.id) ?? stringValue(refund?.order_id);
  const paymentId = stringValue(payment?.id) ?? stringValue(refund?.payment_id);

  if (event === "payment.captured" || event === "order.paid") {
    return { donationId, externalOrderId: orderId, externalPaymentId: paymentId, status: "paid" };
  }
  if (event === "payment.authorized") {
    return { donationId, externalOrderId: orderId, externalPaymentId: paymentId, status: "processing" };
  }
  if (event === "payment.failed") {
    return {
      donationId,
      externalOrderId: orderId,
      externalPaymentId: paymentId,
      status: "failed",
      failureCode: stringValue(payment?.error_code),
    };
  }
  if (event === "refund.processed") {
    return { donationId, externalOrderId: orderId, externalPaymentId: paymentId, status: "refunded" };
  }
  return null;
}
