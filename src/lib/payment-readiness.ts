export type DonationFrequency = "one_time" | "monthly" | "yearly";
export type PublicPaymentProvider = "razorpay" | "stripe";

export type PublicPaymentReadiness = {
  persistenceReady: boolean;
  oneTimeProvider: "razorpay" | null;
  recurringProvider: "stripe" | null;
};

export function paymentProviderForFrequency(
  readiness: PublicPaymentReadiness,
  frequency: DonationFrequency,
): PublicPaymentProvider | null {
  return frequency === "one_time"
    ? readiness.oneTimeProvider
    : readiness.recurringProvider;
}

export function paymentProviderLabel(
  provider: PublicPaymentProvider | null,
): string {
  if (provider === "razorpay") return "Razorpay";
  if (provider === "stripe") return "Stripe";
  return "Unavailable";
}
