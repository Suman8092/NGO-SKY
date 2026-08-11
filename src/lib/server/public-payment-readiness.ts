import "server-only";

import type { PublicPaymentReadiness } from "@/lib/payment-readiness";

import {
  hasMongoConfig,
  hasRazorpayConfig,
  hasSafePaymentRedirectOrigin,
  hasStripeConfig,
  isDonationsEnabled,
} from "./env";

export function getPublicPaymentReadiness(): PublicPaymentReadiness {
  const persistenceReady = hasMongoConfig();
  const checkoutEnabled =
    isDonationsEnabled() && persistenceReady && hasSafePaymentRedirectOrigin();
  const razorpayReady = checkoutEnabled && hasRazorpayConfig();
  const stripeReady = checkoutEnabled && hasStripeConfig();

  return {
    persistenceReady,
    oneTimeProvider: razorpayReady ? "razorpay" : null,
    recurringProvider: stripeReady ? "stripe" : null,
  };
}
