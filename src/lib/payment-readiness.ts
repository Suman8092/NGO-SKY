export type DonationFrequency = "one_time" | "monthly" | "yearly";
export type PublicPaymentProvider = "razorpay";

export type PublicPaymentReadiness = {
  persistenceReady: boolean;
  oneTimeProvider: "razorpay" | null;
  recurringProvider: null;
};

export function paymentProviderForFrequency(
  readiness: PublicPaymentReadiness,
  frequency: DonationFrequency,
): PublicPaymentProvider | null {
  return frequency === "one_time" ? readiness.oneTimeProvider : null;
}

export function paymentProviderLabel(
  provider: PublicPaymentProvider | null,
): string {
  if (provider === "razorpay") return "Razorpay";
  return "Unavailable";
}
