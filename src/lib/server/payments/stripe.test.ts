import type Stripe from "stripe";
import { describe, expect, it } from "vitest";

import { createStripeCheckout, stripeEventToDonationUpdate } from "./stripe";

describe("disabled Stripe checkout", () => {
  it("cannot create a checkout session", async () => {
    await expect(createStripeCheckout({})).rejects.toMatchObject({
      status: 410,
      code: "STRIPE_CHECKOUT_DISABLED",
    });
  });
});

describe("legacy Stripe webhook normalization", () => {
  it("includes the signed checkout amount, currency, and session reference", () => {
    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_live_123",
          client_reference_id: "0123456789abcdef01234567",
          metadata: { donationId: "0123456789abcdef01234567" },
          payment_intent: "pi_live_123",
          payment_status: "paid",
          amount_total: 50_000,
          currency: "inr",
        },
      },
    } as unknown as Stripe.Event;

    expect(stripeEventToDonationUpdate(event)).toEqual({
      provider: "stripe",
      donationId: "0123456789abcdef01234567",
      externalSessionId: "cs_live_123",
      externalPaymentId: "pi_live_123",
      status: "paid",
      amountMinor: 50_000,
      currency: "INR",
    });
  });

  it("records a cumulative partial refund without calling it a full refund", () => {
    const event = {
      type: "charge.refunded",
      data: {
        object: {
          metadata: { donationId: "0123456789abcdef01234567" },
          payment_intent: "pi_live_123",
          amount: 50_000,
          amount_refunded: 10_000,
          currency: "inr",
        },
      },
    } as unknown as Stripe.Event;

    expect(stripeEventToDonationUpdate(event)).toMatchObject({
      provider: "stripe",
      status: "refunded",
      amountMinor: 50_000,
      refundAmountMinor: 10_000,
      refundMode: "total",
    });
  });
});
