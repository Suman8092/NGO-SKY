import { getServerEnv, hasRazorpayConfig, hasStripeConfig, isForcedDemoMode } from "../env";
import { sendDonationConfirmation } from "../email/resend";
import { ApiError } from "../errors";
import { createRazorpayOrder, verifyRazorpayPaymentSignature } from "../payments/razorpay";
import { createStripeCheckout } from "../payments/stripe";
import type { CheckoutResult } from "../payments/types";
import {
  applyDonationPaymentStatus,
  findDonation,
  markDonationPaymentCreated,
  storeDonation,
  type DonationRecord,
  type RequestMetadata,
} from "../repository";
import type { DonationInput } from "../validation";
import type { DonationPaymentUpdate } from "../payments/types";

function unavailablePayment(donation: DonationRecord, persistence: "mongodb" | "memory"): CheckoutResult {
  const configured = donation.provider === "stripe" ? hasStripeConfig() : hasRazorpayConfig();
  return {
    provider: donation.provider,
    status: "unavailable",
    reason: isForcedDemoMode()
      ? "demo_mode"
      : persistence === "memory"
        ? "persistence_required"
        : configured
          ? "persistence_required"
          : "not_configured",
  };
}

async function startCheckout(donation: DonationRecord): Promise<CheckoutResult> {
  if (donation.provider === "stripe") {
    const checkout = await createStripeCheckout(donation);
    if (checkout.status === "requires_action" && checkout.provider === "stripe") {
      await markDonationPaymentCreated(donation.id, { externalSessionId: checkout.sessionId });
    }
    return checkout;
  }

  if (donation.externalOrderId) {
    const keyId = getServerEnv().RAZORPAY_KEY_ID;
    if (!keyId) throw new ApiError(503, "RAZORPAY_NOT_CONFIGURED", "Razorpay checkout is not available.");
    return {
      provider: "razorpay",
      status: "requires_action",
      orderId: donation.externalOrderId,
      keyId,
      amountMinor: donation.amountMinor,
      currency: donation.currency,
    };
  }

  const checkout = await createRazorpayOrder(donation);
  if (checkout.status === "requires_action" && checkout.provider === "razorpay") {
    await markDonationPaymentCreated(donation.id, { externalOrderId: checkout.orderId });
  }
  return checkout;
}

export async function createDonationIntent(input: DonationInput, metadata: RequestMetadata) {
  const stored = await storeDonation(input, metadata);
  const providerReady = stored.record.provider === "stripe" ? hasStripeConfig() : hasRazorpayConfig();
  if (stored.persistence !== "mongodb" || !providerReady) {
    return { ...stored, payment: unavailablePayment(stored.record, stored.persistence) };
  }
  try {
    const payment = await startCheckout(stored.record);
    return {
      ...stored,
      record: payment.status === "requires_action" ? { ...stored.record, status: "processing" as const } : stored.record,
      payment,
    };
  } catch (cause) {
    if (cause instanceof ApiError) {
      throw new ApiError(cause.status, cause.code, cause.message, {
        cause,
        retryAfter: cause.retryAfter,
        details: { donationId: stored.record.id, provider: stored.record.provider },
      });
    }
    throw new ApiError(502, "PAYMENT_INITIALIZATION_FAILED", "Payment checkout could not be created.", {
      cause,
      details: { donationId: stored.record.id, provider: stored.record.provider },
    });
  }
}

export async function startDonationCheckout(donationId: string, expectedProvider: "stripe" | "razorpay") {
  const stored = await findDonation(donationId);
  if (!stored) throw new ApiError(404, "DONATION_NOT_FOUND", "Donation record not found.");
  if (stored.persistence !== "mongodb") {
    throw new ApiError(
      503,
      "PERSISTENCE_REQUIRED",
      "Live checkout requires a configured database. No payment was initiated.",
    );
  }
  if (stored.record.provider !== expectedProvider) {
    throw new ApiError(409, "PAYMENT_PROVIDER_MISMATCH", `This donation uses ${stored.record.provider}.`);
  }
  if (expectedProvider === "stripe" && !hasStripeConfig()) {
    throw new ApiError(503, "STRIPE_NOT_CONFIGURED", "Stripe checkout is not available.");
  }
  if (expectedProvider === "razorpay" && !hasRazorpayConfig()) {
    throw new ApiError(503, "RAZORPAY_NOT_CONFIGURED", "Razorpay checkout is not available.");
  }
  return { donation: stored.record, payment: await startCheckout(stored.record) };
}

export async function acknowledgeRazorpayPayment(input: {
  donationId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const stored = await findDonation(input.donationId);
  if (!stored || stored.persistence !== "mongodb") {
    throw new ApiError(404, "DONATION_NOT_FOUND", "Donation record not found.");
  }
  if (stored.record.provider !== "razorpay" || stored.record.externalOrderId !== input.orderId) {
    throw new ApiError(409, "PAYMENT_REFERENCE_MISMATCH", "Payment details do not match this donation.");
  }
  const valid = verifyRazorpayPaymentSignature({
    orderId: input.orderId,
    paymentId: input.paymentId,
    signature: input.signature,
  });
  if (!valid) throw new ApiError(400, "INVALID_SIGNATURE", "The payment signature is invalid.");

  const donation = await applyDonationPaymentStatus({
    donationId: input.donationId,
    externalOrderId: input.orderId,
    externalPaymentId: input.paymentId,
    status: "processing",
  });
  return {
    donationId: donation?.id ?? stored.record.id,
    status: donation?.status ?? stored.record.status,
    message: "Payment received for verification. Final status is confirmed by the signed webhook.",
  };
}

export async function processDonationPaymentUpdate(update: DonationPaymentUpdate) {
  const donation = await applyDonationPaymentStatus(update);
  const email =
    donation?.status === "paid"
      ? await sendDonationConfirmation(donation)
      : { status: "skipped" as const, delivered: 0, attempted: 0 };
  return { donation, email };
}
