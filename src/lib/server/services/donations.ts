import {
  getServerEnv,
  hasMongoConfig,
  hasRazorpayConfig,
  hasSafePaymentRedirectOrigin,
  hasStripeConfig,
  isDonationsEnabled,
  isForcedDemoMode,
  isProductionRuntime,
} from "../env";
import { sendDonationConfirmation } from "../email/resend";
import { ApiError } from "../errors";
import {
  createRazorpayOrder,
  verifyRazorpayPaymentSignature,
} from "../payments/razorpay";
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

type CheckoutProvider = "stripe" | "razorpay";

function requiredProvider(input: DonationInput): CheckoutProvider {
  return input.frequency === "one_time" && input.currency === "INR"
    ? "razorpay"
    : "stripe";
}

export function assertDonationLaunchBasics(): void {
  if (!isDonationsEnabled()) {
    throw new ApiError(
      503,
      "DONATIONS_DISABLED",
      "Online donations are not currently available.",
    );
  }
  if (isForcedDemoMode()) {
    throw new ApiError(
      503,
      "DONATIONS_DEMO_MODE",
      "Online donations are disabled in demo mode.",
    );
  }
  if (!hasMongoConfig()) {
    throw new ApiError(
      503,
      "PERSISTENCE_REQUIRED",
      "Online donations require durable database storage.",
      { retryAfter: 30 },
    );
  }
  if (!hasSafePaymentRedirectOrigin()) {
    throw new ApiError(
      503,
      "PAYMENT_REDIRECT_ORIGIN_INVALID",
      "Online donations require a verified HTTPS site URL.",
    );
  }
}

function assertProviderReady(provider: CheckoutProvider): void {
  if (provider === "stripe" && !hasStripeConfig()) {
    throw new ApiError(
      503,
      "STRIPE_NOT_CONFIGURED",
      "Stripe checkout is not available.",
    );
  }
  if (provider === "razorpay" && !hasRazorpayConfig()) {
    throw new ApiError(
      503,
      "RAZORPAY_NOT_CONFIGURED",
      "Razorpay checkout is not available.",
    );
  }
}

function publicDonationSummary(donation: DonationRecord) {
  return {
    id: donation.id,
    amountMinor: donation.amountMinor,
    currency: donation.currency,
    frequency: donation.frequency,
    provider: donation.provider,
    status: donation.status,
    createdAt: donation.createdAt,
    updatedAt: donation.updatedAt,
  };
}

async function startCheckout(
  donation: DonationRecord,
): Promise<CheckoutResult> {
  if (donation.provider === "stripe") {
    const checkout = await createStripeCheckout(donation);
    if (
      checkout.status === "requires_action" &&
      checkout.provider === "stripe"
    ) {
      await markDonationPaymentCreated(donation.id, {
        externalSessionId: checkout.sessionId,
      });
    }
    return checkout;
  }

  if (donation.externalOrderId) {
    const keyId = getServerEnv().RAZORPAY_KEY_ID;
    if (!keyId)
      throw new ApiError(
        503,
        "RAZORPAY_NOT_CONFIGURED",
        "Razorpay checkout is not available.",
      );
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
  if (
    checkout.status === "requires_action" &&
    checkout.provider === "razorpay"
  ) {
    await markDonationPaymentCreated(donation.id, {
      externalOrderId: checkout.orderId,
    });
  }
  return checkout;
}

export async function createDonationIntent(
  input: DonationInput,
  metadata: RequestMetadata,
) {
  assertDonationLaunchBasics();
  const provider = requiredProvider(input);
  if (input.provider !== "auto" && input.provider !== provider) {
    throw new ApiError(
      422,
      "PAYMENT_PROVIDER_REQUIRED",
      provider === "razorpay"
        ? "One-time INR donations require Razorpay."
        : "This donation requires Stripe.",
      { details: { requiredProvider: provider } },
    );
  }
  assertProviderReady(provider);

  const stored = await storeDonation(input, metadata);
  if (stored.persistence !== "mongodb") {
    throw new ApiError(
      503,
      "PERSISTENCE_REQUIRED",
      "Online donations require durable database storage.",
      { retryAfter: 30 },
    );
  }
  if (stored.record.provider !== provider) {
    throw new ApiError(
      409,
      "PAYMENT_PROVIDER_MISMATCH",
      "The stored donation has an invalid payment provider.",
    );
  }
  try {
    const payment = await startCheckout(stored.record);
    return {
      ...stored,
      record:
        payment.status === "requires_action"
          ? { ...stored.record, status: "processing" as const }
          : stored.record,
      payment,
    };
  } catch (cause) {
    if (cause instanceof ApiError) {
      throw new ApiError(cause.status, cause.code, cause.message, {
        cause,
        retryAfter: cause.retryAfter,
        details: {
          donationId: stored.record.id,
          provider: stored.record.provider,
        },
      });
    }
    throw new ApiError(
      502,
      "PAYMENT_INITIALIZATION_FAILED",
      "Payment checkout could not be created.",
      {
        cause,
        details: {
          donationId: stored.record.id,
          provider: stored.record.provider,
        },
      },
    );
  }
}

export async function startDonationCheckout(
  donationId: string,
  expectedProvider: "stripe" | "razorpay",
) {
  assertDonationCheckoutRetryAllowed();
  assertDonationLaunchBasics();
  assertProviderReady(expectedProvider);

  const stored = await findDonation(donationId);
  if (!stored)
    throw new ApiError(404, "DONATION_NOT_FOUND", "Donation record not found.");
  if (stored.persistence !== "mongodb") {
    throw new ApiError(
      503,
      "PERSISTENCE_REQUIRED",
      "Live checkout requires a configured database. No payment was initiated.",
    );
  }
  if (stored.record.provider !== expectedProvider) {
    throw new ApiError(
      409,
      "PAYMENT_PROVIDER_MISMATCH",
      `This donation uses ${stored.record.provider}.`,
    );
  }
  return {
    donation: publicDonationSummary(stored.record),
    payment: await startCheckout(stored.record),
  };
}

export function assertDonationCheckoutRetryAllowed(): void {
  if (!isProductionRuntime()) return;
  throw new ApiError(
    410,
    "CHECKOUT_RETRY_DISABLED",
    "This checkout retry endpoint is not available in production. Start a new donation checkout instead.",
  );
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
  if (
    stored.record.provider !== "razorpay" ||
    stored.record.externalOrderId !== input.orderId
  ) {
    throw new ApiError(
      409,
      "PAYMENT_REFERENCE_MISMATCH",
      "Payment details do not match this donation.",
    );
  }
  const valid = verifyRazorpayPaymentSignature({
    orderId: input.orderId,
    paymentId: input.paymentId,
    signature: input.signature,
  });
  if (!valid)
    throw new ApiError(
      400,
      "INVALID_SIGNATURE",
      "The payment signature is invalid.",
    );

  const donation = await applyDonationPaymentStatus({
    donationId: input.donationId,
    externalOrderId: input.orderId,
    externalPaymentId: input.paymentId,
    status: "processing",
  });
  return {
    donationId: donation?.id ?? stored.record.id,
    status: donation?.status ?? stored.record.status,
    message:
      "Payment received for verification. Final status is confirmed by the signed webhook.",
  };
}

export async function processDonationPaymentUpdate(
  update: DonationPaymentUpdate,
) {
  const donation = await applyDonationPaymentStatus(update);
  const email =
    donation?.status === "paid"
      ? await sendDonationConfirmation(donation)
      : { status: "skipped" as const, delivered: 0, attempted: 0 };
  return { donation, email };
}
