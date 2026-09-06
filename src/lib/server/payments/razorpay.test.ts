import { describe, expect, it } from "vitest";

import {
  razorpayWebhookEventType,
  razorpayWebhookToDonationUpdate,
} from "./razorpay";

describe("Razorpay webhook normalization", () => {
  it("preserves the amount, currency, order, payment, and donation references", () => {
    const payload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_live_123",
            order_id: "order_live_123",
            amount: 50_000,
            currency: "INR",
            notes: { donationId: "0123456789abcdef01234567" },
          },
        },
      },
    };

    expect(razorpayWebhookEventType(payload)).toBe("payment.captured");
    expect(razorpayWebhookToDonationUpdate(payload)).toEqual({
      provider: "razorpay",
      donationId: "0123456789abcdef01234567",
      externalOrderId: "order_live_123",
      externalPaymentId: "pay_live_123",
      status: "paid",
      amountMinor: 50_000,
      currency: "INR",
    });
  });

  it("normalizes each processed refund as a delta", () => {
    const payload = {
      event: "refund.processed",
      payload: {
        refund: {
          entity: {
            payment_id: "pay_live_123",
            amount: 10_000,
            currency: "INR",
            notes: { donationId: "0123456789abcdef01234567" },
          },
        },
      },
    };

    expect(razorpayWebhookToDonationUpdate(payload)).toMatchObject({
      provider: "razorpay",
      status: "refunded",
      externalPaymentId: "pay_live_123",
      refundAmountMinor: 10_000,
      refundMode: "delta",
    });
  });
});
