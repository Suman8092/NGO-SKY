import {
  getServerEnv,
  hasMongoConfig,
  hasRazorpayConfig,
  hasSafePaymentRedirectOrigin,
  isDonationsEnabled,
  isForcedDemoMode,
  isProductionRuntime,
} from "../env";
import { ApiError } from "../errors";
import {
  createRazorpayOrder,
  verifyRazorpayPaymentSignature,
} from "../payments/razorpay";
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

type CheckoutProvider = "razorpay";

function assertSupportedDonation(input: DonationInput): void {
  if (input.currency !== "INR") {
    throw new ApiError(
      422,
      "DONATION_CURRENCY_UNSUPPORTED",
      "Online donations currently support INR only.",
    );
  }
  if (input.frequency !== "one_time") {
    throw new ApiError(
      422,
      "DONATION_FREQUENCY_UNSUPPORTED",
      "Online donations currently support one-time gifts only.",
    );
  }
  if (input.provider === "stripe") {
    throw new ApiError(
      422,
      "STRIPE_CHECKOUT_DISABLED",
      "Stripe checkout is not offered. Use Razorpay for a one-time INR donation.",
    );
  }
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
  if (
    donation.provider !== "razorpay" ||
    donation.currency !== "INR" ||
    donation.frequency !== "one_time"
  ) {
    throw new ApiError(
      409,
      "DONATION_PAYMENT_CONFIGURATION_INVALID",
      "This donation is not eligible for the supported checkout flow.",
    );
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
  assertSupportedDonation(input);
  const provider: CheckoutProvider = "razorpay";
  if (input.provider !== "auto" && input.provider !== provider) {
    throw new ApiError(
      422,
      "PAYMENT_PROVIDER_REQUIRED",
      "One-time INR donations require Razorpay.",
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
  if (expectedProvider === "stripe") {
    throw new ApiError(
      410,
      "STRIPE_CHECKOUT_DISABLED",
      "Stripe checkout is not offered.",
    );
  }
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
