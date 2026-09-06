import { describe, expect, it } from "vitest";

import { reconcilePaymentWebhook } from "./payment-webhook-inbox";

const pendingDonation = {
  id: "0123456789abcdef01234567",
  amountMinor: 50_000,
  currency: "INR",
  provider: "razorpay" as const,
  status: "processing" as const,
  externalOrderId: "order_live_123",
  externalPaymentId: undefined,
  refundedAmountMinor: 0,
};

const paidEvent = {
  provider: "razorpay" as const,
  donationId: pendingDonation.id,
  externalOrderId: "order_live_123",
  externalPaymentId: "pay_live_123",
  status: "paid" as const,
  amountMinor: 50_000,
  currency: "INR",
};

describe("payment webhook reconciliation", () => {
  it("marks a payment paid only when provider, amount, currency, and order match", () => {
    expect(reconcilePaymentWebhook(pendingDonation, paidEvent)).toMatchObject({
      kind: "apply",
      status: "paid",
      transitionedToPaid: true,
    });

    expect(
      reconcilePaymentWebhook(pendingDonation, {
        ...paidEvent,
        amountMinor: 49_999,
      }),
    ).toEqual({
      kind: "ignore",
      code: "payment_amount_or_currency_mismatch",
    });
    expect(
      reconcilePaymentWebhook(pendingDonation, {
        ...paidEvent,
        currency: "USD",
      }),
    ).toEqual({
      kind: "ignore",
      code: "payment_amount_or_currency_mismatch",
    });
    expect(
      reconcilePaymentWebhook(pendingDonation, {
        ...paidEvent,
        externalOrderId: "order_other",
      }),
    ).toEqual({ kind: "ignore", code: "checkout_reference_mismatch" });
    expect(
      reconcilePaymentWebhook(pendingDonation, {
        ...paidEvent,
        provider: "stripe",
      }),
    ).toEqual({ kind: "ignore", code: "provider_mismatch" });
  });

  it("does not accept a legacy Stripe payment without the stored checkout session", () => {
    const stripeDonation = {
      ...pendingDonation,
      provider: "stripe" as const,
      externalOrderId: undefined,
      externalSessionId: "cs_live_123",
    };

    expect(
      reconcilePaymentWebhook(stripeDonation, {
        provider: "stripe",
        donationId: stripeDonation.id,
        externalPaymentId: "pi_live_123",
        status: "paid",
        amountMinor: 50_000,
        currency: "INR",
      }),
    ).toEqual({ kind: "ignore", code: "checkout_reference_mismatch" });
  });

  it("records partial refunds while keeping paid status and closes only at the full amount", () => {
    const paidDonation = {
      ...pendingDonation,
      status: "paid" as const,
      externalPaymentId: "pay_live_123",
    };
    const partial = reconcilePaymentWebhook(paidDonation, {
      provider: "razorpay",
      donationId: paidDonation.id,
      externalOrderId: paidDonation.externalOrderId,
      externalPaymentId: paidDonation.externalPaymentId,
      status: "refunded",
      currency: "INR",
      refundAmountMinor: 10_000,
      refundMode: "delta",
    });
    expect(partial).toMatchObject({
      kind: "apply",
      status: "paid",
      refundedAmountMinor: 10_000,
      code: "partial_refund_recorded",
    });

    expect(
      reconcilePaymentWebhook(
        { ...paidDonation, refundedAmountMinor: 10_000 },
        {
          provider: "razorpay",
          donationId: paidDonation.id,
          externalOrderId: paidDonation.externalOrderId,
          externalPaymentId: paidDonation.externalPaymentId,
          status: "refunded",
          currency: "INR",
          refundAmountMinor: 40_000,
          refundMode: "delta",
        },
      ),
    ).toMatchObject({
      kind: "apply",
      status: "refunded",
      refundedAmountMinor: 50_000,
      code: "full_refund_applied",
    });
  });

  it("keeps an out-of-order refund retriable until the payment is confirmed", () => {
    expect(
      reconcilePaymentWebhook(
        { ...pendingDonation, externalPaymentId: "pay_live_123" },
        {
          provider: "razorpay",
          donationId: pendingDonation.id,
          externalOrderId: pendingDonation.externalOrderId,
          externalPaymentId: "pay_live_123",
          status: "refunded",
          currency: "INR",
          refundAmountMinor: 10_000,
          refundMode: "delta",
        },
      ),
    ).toEqual({ kind: "retry", code: "refund_before_payment" });
  });

  it("rejects refunds with a different payment reference or an over-refund", () => {
    const paidDonation = {
      ...pendingDonation,
      status: "paid" as const,
      externalPaymentId: "pay_live_123",
    };
    expect(
      reconcilePaymentWebhook(paidDonation, {
        provider: "razorpay",
        status: "refunded",
        externalPaymentId: "pay_other",
        currency: "INR",
        refundAmountMinor: 1_000,
        refundMode: "delta",
      }),
    ).toEqual({
      kind: "ignore",
      code: "refund_payment_reference_mismatch",
    });
    expect(
      reconcilePaymentWebhook(paidDonation, {
        provider: "razorpay",
        status: "refunded",
        externalPaymentId: "pay_live_123",
        currency: "INR",
        refundAmountMinor: 50_001,
        refundMode: "delta",
      }),
    ).toEqual({ kind: "ignore", code: "refund_amount_invalid" });
  });
});
