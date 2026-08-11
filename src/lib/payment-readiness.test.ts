import { describe, expect, it } from "vitest";

import {
  paymentProviderForFrequency,
  paymentProviderLabel,
  type PublicPaymentReadiness,
} from "./payment-readiness";

describe("public payment readiness", () => {
  it("uses Razorpay only for one-time gifts", () => {
    const readiness: PublicPaymentReadiness = {
      persistenceReady: true,
      oneTimeProvider: "razorpay",
      recurringProvider: null,
    };

    expect(paymentProviderForFrequency(readiness, "one_time")).toBe("razorpay");
    expect(paymentProviderForFrequency(readiness, "monthly")).toBeNull();
    expect(paymentProviderForFrequency(readiness, "yearly")).toBeNull();
  });

  it("uses Stripe for supported recurring gifts only", () => {
    const readiness: PublicPaymentReadiness = {
      persistenceReady: true,
      oneTimeProvider: null,
      recurringProvider: "stripe",
    };

    expect(paymentProviderForFrequency(readiness, "one_time")).toBeNull();
    expect(paymentProviderForFrequency(readiness, "monthly")).toBe("stripe");
    expect(paymentProviderLabel("stripe")).toBe("Stripe");
    expect(paymentProviderLabel(null)).toBe("Unavailable");
  });
});
