import { pingMongo } from "../db";
import {
  getEnvironmentIssues,
  hasMongoConfig,
  hasRazorpayConfig,
  hasResendConfig,
  hasSanityConfig,
  hasStripeConfig,
  isForcedDemoMode,
} from "../env";
import { getDemoCounts } from "../memory-store";

export async function getHealthSnapshot(deep = false) {
  let database: "connected" | "configured" | "demo" | "unavailable" = hasMongoConfig()
    ? "configured"
    : "demo";
  if (deep && hasMongoConfig()) {
    try {
      database = await pingMongo();
    } catch {
      database = "unavailable";
    }
  }

  const unhealthy = database === "unavailable";
  const mode = isForcedDemoMode() || !hasMongoConfig() ? "demo" : "live";
  return {
    httpStatus: unhealthy ? 503 : 200,
    body: {
      status: unhealthy ? "unhealthy" : mode === "demo" ? "degraded" : "ok",
      service: "ashaaya-foundation-api",
      version: process.env.npm_package_version ?? "0.0.0",
      mode,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      integrations: {
        database,
        stripe: hasStripeConfig() && hasMongoConfig() ? "ready" : "disabled",
        razorpay: hasRazorpayConfig() && hasMongoConfig() ? "ready" : "disabled",
        resend: hasResendConfig() ? "ready" : "disabled",
        sanity: hasSanityConfig() ? "ready" : "disabled",
      },
      configuration: {
        valid: getEnvironmentIssues().length === 0,
        invalidFields: getEnvironmentIssues(),
      },
      ...(mode === "demo" ? { demoRecords: getDemoCounts() } : {}),
    },
  } as const;
}
