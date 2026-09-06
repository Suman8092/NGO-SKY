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

  it("never exposes a recurring checkout provider", () => {
    const readiness: PublicPaymentReadiness = {
      persistenceReady: true,
      oneTimeProvider: "razorpay",
      recurringProvider: null,
    };

    expect(paymentProviderForFrequency(readiness, "monthly")).toBeNull();
    expect(paymentProviderForFrequency(readiness, "yearly")).toBeNull();
    expect(paymentProviderLabel(null)).toBe("Unavailable");
  });
});
