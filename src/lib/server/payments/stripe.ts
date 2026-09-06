import Stripe from "stripe";

import { getServerEnv, hasStripeConfig } from "../env";
import { ApiError } from "../errors";
import type { DonationPaymentUpdate } from "./types";

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

export async function createStripeCheckout(donation: unknown): Promise<never> {
  void donation;
  throw new ApiError(
    410,
    "STRIPE_CHECKOUT_DISABLED",
    "Stripe checkout is not offered. Online donations support one-time INR payments through Razorpay only.",
  );
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
      provider: "stripe",
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
      amountMinor: session.amount_total ?? undefined,
      currency: session.currency?.toUpperCase(),
    };
  }

  if (
    event.type === "payment_intent.succeeded" ||
    event.type === "payment_intent.payment_failed" ||
    event.type === "payment_intent.canceled"
  ) {
    const intent = event.data.object as Stripe.PaymentIntent;
    return {
      provider: "stripe",
      donationId: intent.metadata.donationId,
      externalPaymentId: intent.id,
      status: event.type === "payment_intent.succeeded" ? "paid" : "failed",
      amountMinor:
        event.type === "payment_intent.succeeded"
          ? intent.amount_received
          : intent.amount,
      currency: intent.currency.toUpperCase(),
      failureCode:
        event.type === "payment_intent.canceled"
          ? "payment_canceled"
          : (intent.last_payment_error?.code ?? undefined),
    };
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    return {
      provider: "stripe",
      donationId: charge.metadata.donationId,
      externalPaymentId:
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : undefined,
      status: "refunded",
      amountMinor: charge.amount,
      currency: charge.currency.toUpperCase(),
      refundAmountMinor: charge.amount_refunded,
      refundMode: "total",
    };
  }

  return null;
}
