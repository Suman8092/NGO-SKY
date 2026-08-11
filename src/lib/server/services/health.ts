import { pingMongo } from "../db";
import {
  getEnvironmentIssues,
  hasManagedSubmissionWorkflow,
  hasMongoConfig,
  hasRazorpayConfig,
  hasResendConfig,
  hasSafePaymentRedirectOrigin,
  hasSanityConfig,
  hasStripeConfig,
  isDonationsEnabled,
  isForcedDemoMode,
  isPublicSubmissionsEnabled,
  isProductionRuntime,
} from "../env";
import { getDemoCounts } from "../memory-store";

export async function getHealthSnapshot(deep = false) {
  let database: "connected" | "configured" | "demo" | "unavailable" =
    hasMongoConfig() ? "configured" : "demo";
  if (deep && hasMongoConfig()) {
    try {
      database = await pingMongo();
    } catch {
      database = "unavailable";
    }
  }

  const productionWithoutDurableStorage =
    isProductionRuntime() && !hasMongoConfig();
  const unhealthy =
    database === "unavailable" || productionWithoutDurableStorage;
  const mode = isForcedDemoMode() || !hasMongoConfig() ? "demo" : "live";
  const configurationIssues = getEnvironmentIssues();
  const degraded = mode === "demo" || configurationIssues.length > 0;
  const donationLaunchReady =
    isDonationsEnabled() &&
    hasMongoConfig() &&
    hasSafePaymentRedirectOrigin();
  return {
    httpStatus: unhealthy ? 503 : 200,
    body: {
      status: unhealthy ? "unhealthy" : degraded ? "degraded" : "ok",
      service: "ashaaya-foundation-api",
      version: process.env.npm_package_version ?? "0.0.0",
      mode,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      integrations: {
        database,
        stripe:
          donationLaunchReady && hasStripeConfig() ? "ready" : "disabled",
        razorpay:
          donationLaunchReady && hasRazorpayConfig() ? "ready" : "disabled",
        resend: hasResendConfig() ? "ready" : "disabled",
        sanity: hasSanityConfig() ? "ready" : "disabled",
        publicSubmissions: hasManagedSubmissionWorkflow()
          ? "ready"
          : "disabled",
        newsletter: isPublicSubmissionsEnabled() ? "ready" : "disabled",
      },
      configuration: {
        valid: configurationIssues.length === 0,
        invalidFields: configurationIssues,
      },
      ...(mode === "demo" ? { demoRecords: getDemoCounts() } : {}),
    },
  } as const;
}
