import Stripe from "stripe";

import { getServerEnv, hasStripeConfig } from "../env";
import { ApiError } from "../errors";
import type { DonationRecord } from "../repository";
import type { CheckoutResult, DonationPaymentUpdate } from "./types";

let stripeClient: Stripe | undefined;

function getStripe(): Stripe {
  const env = getServerEnv();
  if (!hasStripeConfig() || !env.STRIPE_SECRET_KEY) {
    throw new ApiError(
      503,
      "STRIPE_NOT_CONFIGURED",
      "Stripe checkout is not available.",
    );
  }
  stripeClient ??= new Stripe(env.STRIPE_SECRET_KEY, {
    maxNetworkRetries: 2,
    timeout: 12_000,
    typescript: true,
  });
  return stripeClient;
}

export async function createStripeCheckout(
  donation: DonationRecord,
): Promise<CheckoutResult> {
  if (donation.provider !== "stripe") {
    throw new ApiError(
      409,
      "PAYMENT_PROVIDER_MISMATCH",
      "This donation is not assigned to Stripe.",
    );
  }
  if (donation.status === "paid" || donation.status === "refunded") {
    throw new ApiError(
      409,
      "DONATION_ALREADY_SETTLED",
      "This donation has already been settled.",
    );
  }

  const env = getServerEnv();
  const stripe = getStripe();
  const recurring =
    donation.frequency === "monthly"
      ? ({ interval: "month" } as const)
      : donation.frequency === "yearly"
        ? ({ interval: "year" } as const)
        : undefined;
  const metadata = {
    donationId: donation.id,
    campaignId: donation.campaignId ?? "general",
    frequency: donation.frequency,
  };
  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
    quantity: 1,
    price_data: {
      currency: donation.currency.toLowerCase(),
      unit_amount: donation.amountMinor,
      product_data: {
        name: donation.campaignId ? "Campaign donation" : "General donation",
        description: "A charitable contribution to Ashaaya Foundation",
      },
      ...(recurring ? { recurring } : {}),
    },
  };
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: recurring ? "subscription" : "payment",
    line_items: [lineItem],
    client_reference_id: donation.id,
    customer_email: donation.donor.email,
    success_url: `${env.NEXT_PUBLIC_SITE_URL}/donate/success?donation_id=${encodeURIComponent(donation.id)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/donate?status=cancelled`,
    metadata,
    allow_promotion_codes: false,
    billing_address_collection: "auto",
    ...(recurring
      ? { subscription_data: { metadata } }
      : { payment_intent_data: { metadata } }),
  };

  try {
    const session = await stripe.checkout.sessions.create(params, {
      idempotencyKey: `donation-checkout-${donation.id}`,
    });
    if (!session.url) {
      throw new ApiError(
        502,
        "STRIPE_SESSION_INVALID",
        "Stripe did not return a checkout URL.",
      );
    }
    return {
      provider: "stripe",
      status: "requires_action",
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    throw new ApiError(
      502,
      "STRIPE_REQUEST_FAILED",
      "Stripe checkout could not be created.",
      { cause },
    );
  }
}

export function constructStripeEvent(
  rawBody: string,
  signature: string | null,
): Stripe.Event {
  const env = getServerEnv();
  if (!hasStripeConfig() || !env.STRIPE_WEBHOOK_SECRET) {
    throw new ApiError(
      503,
      "STRIPE_WEBHOOK_NOT_CONFIGURED",
      "Stripe webhooks are not configured.",
    );
  }
  if (!signature) {
    throw new ApiError(
      400,
      "MISSING_SIGNATURE",
      "The Stripe signature header is required.",
    );
  }
  try {
    return getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (cause) {
    throw new ApiError(
      400,
      "INVALID_SIGNATURE",
      "The webhook signature is invalid.",
      { cause },
    );
  }
}

export function stripeEventToDonationUpdate(
  event: Stripe.Event,
): DonationPaymentUpdate | null {
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded" ||
    event.type === "checkout.session.async_payment_failed" ||
    event.type === "checkout.session.expired"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    return {
      donationId:
        session.metadata?.donationId ??
        session.client_reference_id ??
        undefined,
      externalSessionId: session.id,
      externalPaymentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : undefined,
      status:
        event.type === "checkout.session.async_payment_failed" ||
        event.type === "checkout.session.expired"
          ? "failed"
          : session.payment_status === "paid" ||
              event.type === "checkout.session.async_payment_succeeded"
            ? "paid"
            : "processing",
    };
  }

  if (
    event.type === "payment_intent.succeeded" ||
    event.type === "payment_intent.payment_failed" ||
    event.type === "payment_intent.canceled"
  ) {
    const intent = event.data.object as Stripe.PaymentIntent;
    return {
      donationId: intent.metadata.donationId,
      externalPaymentId: intent.id,
      status: event.type === "payment_intent.succeeded" ? "paid" : "failed",
      failureCode:
        event.type === "payment_intent.canceled"
          ? "payment_canceled"
          : (intent.last_payment_error?.code ?? undefined),
    };
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    return {
      donationId: charge.metadata.donationId,
      externalPaymentId:
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : undefined,
      status: "refunded",
    };
  }

  return null;
}
