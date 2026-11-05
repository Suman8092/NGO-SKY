import "server-only";

import type { PublicPaymentReadiness } from "@/lib/payment-readiness";

import {
  hasMongoConfig,
  hasRazorpayConfig,
  hasSafePaymentRedirectOrigin,
  isDonationsEnabled,
} from "./env";

export function getPublicPaymentReadiness(): PublicPaymentReadiness {
  const persistenceReady = hasMongoConfig();
  const checkoutEnabled =
    isDonationsEnabled() && persistenceReady && hasSafePaymentRedirectOrigin();
  const razorpayReady = checkoutEnabled && hasRazorpayConfig();

  return {
    persistenceReady,
    oneTimeProvider: razorpayReady ? "razorpay" : null,
    recurringProvider: null,
  };
}

export async function getSelectedPaymentReadiness(): Promise<PublicPaymentReadiness> {
  const readiness = getPublicPaymentReadiness();
  if (
    !isDonationsEnabled() ||
    !hasMongoConfig() ||
    !hasSafePaymentRedirectOrigin()
  )
    return readiness;
  try {
    const { selectedGateway, assertHostedConfigured } =
      await import("./ngo/gateway-config");
    const selected = await selectedGateway();
    if (selected.provider === "razorpay") return readiness;
    if (selected.mode !== "production")
      return { ...readiness, oneTimeProvider: null };
    assertHostedConfigured(selected.provider, selected.mode);
    return { ...readiness, oneTimeProvider: selected.provider };
  } catch {
    return { ...readiness, oneTimeProvider: null };
  }
}
