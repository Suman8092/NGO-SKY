import { afterEach, describe, expect, it, vi } from "vitest";

const managedVariables = [
  "NODE_ENV",
  "VERCEL_ENV",
  "DEMO_MODE",
  "DONATIONS_ENABLED",
  "PUBLIC_SUBMISSIONS_ENABLED",
  "NEWSLETTER_ENABLED",
  "MONGODB_URI",
  "NEXT_PUBLIC_SITE_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "CONTACT_NOTIFICATION_EMAIL",
] as const;

function stubEnvironment(
  values: Partial<Record<(typeof managedVariables)[number], string>>,
): void {
  for (const variable of managedVariables) {
    vi.stubEnv(variable, values[variable] ?? "");
  }
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("production integration readiness", () => {
  it("rejects Stripe and Razorpay test keys in production", async () => {
    stubEnvironment({
      NODE_ENV: "production",
      DEMO_MODE: "false",
      MONGODB_URI: "mongodb://localhost:27017/test",
      STRIPE_SECRET_KEY: "sk_test_1234567890123456",
      STRIPE_WEBHOOK_SECRET: "whsec_1234567890123456",
      RAZORPAY_KEY_ID: "rzp_test_1234567890",
      RAZORPAY_KEY_SECRET: "razorpay-secret",
      RAZORPAY_WEBHOOK_SECRET: "razorpay-webhook",
    });

    const { getEnvironmentIssues, hasRazorpayConfig, hasStripeConfig } =
      await import("./env");

    expect(hasStripeConfig()).toBe(false);
    expect(hasRazorpayConfig()).toBe(false);
    expect(getEnvironmentIssues()).toEqual(
      expect.arrayContaining(["STRIPE_SECRET_KEY", "RAZORPAY_KEY_ID"]),
    );
  });

  it("accepts live payment key prefixes in production", async () => {
    stubEnvironment({
      NODE_ENV: "production",
      DEMO_MODE: "false",
      MONGODB_URI: "mongodb://localhost:27017/test",
      STRIPE_SECRET_KEY: "sk_live_1234567890123456",
      STRIPE_WEBHOOK_SECRET: "whsec_1234567890123456",
      RAZORPAY_KEY_ID: "rzp_live_1234567890",
      RAZORPAY_KEY_SECRET: "razorpay-secret",
      RAZORPAY_WEBHOOK_SECRET: "razorpay-webhook",
    });

    const { getEnvironmentIssues, hasRazorpayConfig, hasStripeConfig } =
      await import("./env");

    expect(hasStripeConfig()).toBe(true);
    expect(hasRazorpayConfig()).toBe(true);
    expect(getEnvironmentIssues()).not.toEqual(
      expect.arrayContaining(["STRIPE_SECRET_KEY", "RAZORPAY_KEY_ID"]),
    );
  });

  it("keeps test keys usable outside production", async () => {
    stubEnvironment({
      NODE_ENV: "test",
      DEMO_MODE: "false",
      STRIPE_SECRET_KEY: "sk_test_1234567890123456",
      STRIPE_WEBHOOK_SECRET: "whsec_1234567890123456",
      RAZORPAY_KEY_ID: "rzp_test_1234567890",
      RAZORPAY_KEY_SECRET: "razorpay-secret",
      RAZORPAY_WEBHOOK_SECRET: "razorpay-webhook",
    });

    const { hasRazorpayConfig, hasStripeConfig } = await import("./env");

    expect(hasStripeConfig()).toBe(true);
    expect(hasRazorpayConfig()).toBe(true);
  });

  it("marks production demo mode and missing MongoDB as unsafe", async () => {
    stubEnvironment({ NODE_ENV: "production", DEMO_MODE: "true" });

    const { allowsInMemoryPersistence, getEnvironmentIssues } =
      await import("./env");

    expect(allowsInMemoryPersistence()).toBe(false);
    expect(getEnvironmentIssues()).toEqual(
      expect.arrayContaining(["DEMO_MODE", "MONGODB_URI"]),
    );
  });

  it("does not treat a Vercel preview build as live production", async () => {
    stubEnvironment({
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      DEMO_MODE: "false",
      STRIPE_SECRET_KEY: "sk_test_1234567890123456",
      STRIPE_WEBHOOK_SECRET: "whsec_1234567890123456",
    });

    const { allowsInMemoryPersistence, hasStripeConfig, isProductionRuntime } =
      await import("./env");

    expect(isProductionRuntime()).toBe(false);
    expect(allowsInMemoryPersistence()).toBe(true);
    expect(hasStripeConfig()).toBe(true);
  });

  it("rejects a local HTTP payment redirect origin when donations are enabled in production", async () => {
    stubEnvironment({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      DEMO_MODE: "false",
      DONATIONS_ENABLED: "true",
      MONGODB_URI: "mongodb://localhost:27017/test",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });

    const { getEnvironmentIssues, hasSafePaymentRedirectOrigin } =
      await import("./env");

    expect(hasSafePaymentRedirectOrigin()).toBe(false);
    expect(getEnvironmentIssues()).toContain("NEXT_PUBLIC_SITE_URL");
  });

  it("requires an explicit managed workflow before public forms are enabled", async () => {
    stubEnvironment({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      DEMO_MODE: "false",
      PUBLIC_SUBMISSIONS_ENABLED: "true",
      MONGODB_URI: "mongodb://localhost:27017/test",
    });

    const {
      getEnvironmentIssues,
      hasManagedSubmissionWorkflow,
      isPublicSubmissionsEnabled,
    } = await import("./env");

    expect(isPublicSubmissionsEnabled()).toBe(false);
    expect(hasManagedSubmissionWorkflow()).toBe(false);
    expect(getEnvironmentIssues()).toEqual(
      expect.arrayContaining([
        "RESEND_API_KEY",
        "RESEND_FROM_EMAIL",
        "CONTACT_NOTIFICATION_EMAIL",
      ]),
    );
  });

  it("enables managed public forms only with durable storage and verified email configuration", async () => {
    stubEnvironment({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      DEMO_MODE: "false",
      PUBLIC_SUBMISSIONS_ENABLED: "true",
      MONGODB_URI: "mongodb://localhost:27017/test",
      NEXT_PUBLIC_SITE_URL: "https://example.org",
      RESEND_API_KEY: "re_1234567890",
      RESEND_FROM_EMAIL: "Skymeredian Foundation <noreply@example.org>",
      CONTACT_NOTIFICATION_EMAIL: "team@example.org",
    });

    const { hasManagedSubmissionWorkflow, isPublicSubmissionsEnabled } =
      await import("./env");

    expect(isPublicSubmissionsEnabled()).toBe(true);
    expect(hasManagedSubmissionWorkflow()).toBe(true);
  });

  it("keeps newsletter signup behind its separate launch gate", async () => {
    stubEnvironment({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      DEMO_MODE: "false",
      PUBLIC_SUBMISSIONS_ENABLED: "true",
      MONGODB_URI: "mongodb://localhost:27017/test",
      NEXT_PUBLIC_SITE_URL: "https://example.org",
      RESEND_API_KEY: "re_1234567890",
      RESEND_FROM_EMAIL: "Skymeredian Foundation <noreply@example.org>",
      CONTACT_NOTIFICATION_EMAIL: "team@example.org",
    });
    const { isNewsletterWorkflowEnabled } = await import("./env");

    expect(isNewsletterWorkflowEnabled()).toBe(false);

    vi.resetModules();
    vi.stubEnv("NEWSLETTER_ENABLED", "true");
    const enabledEnv = await import("./env");
    expect(enabledEnv.isNewsletterWorkflowEnabled()).toBe(true);
  });

  it("does not generate localhost email links from a Vercel preview", async () => {
    stubEnvironment({
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      DEMO_MODE: "false",
      PUBLIC_SUBMISSIONS_ENABLED: "true",
      MONGODB_URI: "mongodb://localhost:27017/test",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      RESEND_API_KEY: "re_1234567890",
      RESEND_FROM_EMAIL: "Skymeredian Foundation <noreply@example.org>",
      CONTACT_NOTIFICATION_EMAIL: "team@example.org",
    });

    const { getVerifiedSiteOrigin, isPublicSubmissionsEnabled } =
      await import("./env");

    expect(getVerifiedSiteOrigin()).toBeNull();
    expect(isPublicSubmissionsEnabled()).toBe(false);
  });
});
