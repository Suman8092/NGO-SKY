import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  applyDonationPaymentStatus: vi.fn(),
  createRazorpayOrder: vi.fn(),
  createStripeCheckout: vi.fn(),
  findDonation: vi.fn(),
  markDonationPaymentCreated: vi.fn(),
  sendDonationConfirmation: vi.fn(),
  storeDonation: vi.fn(),
  verifyRazorpayPaymentSignature: vi.fn(),
}));

vi.mock("../repository", () => ({
  applyDonationPaymentStatus: mocks.applyDonationPaymentStatus,
  findDonation: mocks.findDonation,
  markDonationPaymentCreated: mocks.markDonationPaymentCreated,
  storeDonation: mocks.storeDonation,
}));
vi.mock("../payments/razorpay", () => ({
  createRazorpayOrder: mocks.createRazorpayOrder,
  verifyRazorpayPaymentSignature: mocks.verifyRazorpayPaymentSignature,
}));
vi.mock("../payments/stripe", () => ({
  createStripeCheckout: mocks.createStripeCheckout,
}));
vi.mock("../email/resend", () => ({
  sendDonationConfirmation: mocks.sendDonationConfirmation,
}));

const metadata = { requestId: "req-donation-test" };
const oneTimeInrDonation = {
  amount: 500,
  currency: "INR" as const,
  frequency: "one_time" as const,
  provider: "auto" as const,
  donor: { name: "Test Donor", email: "donor@example.com" },
  anonymous: false,
  consent: true as const,
  website: "",
};
const storedDonation = {
  id: "0123456789abcdef01234567",
  amountMinor: 50_000,
  currency: "INR" as const,
  frequency: "one_time" as const,
  provider: "razorpay" as const,
  donor: {
    name: "Private Donor",
    email: "private@example.com",
    phone: "+919999999999",
  },
  anonymous: false,
  message: "Private message",
  status: "pending" as const,
  externalOrderId: "order_private_reference",
  createdAt: "2026-08-05T00:00:00.000Z",
  updatedAt: "2026-08-05T00:00:00.000Z",
};

const managedEnvironment = [
  "NODE_ENV",
  "VERCEL_ENV",
  "DEMO_MODE",
  "DONATIONS_ENABLED",
  "MONGODB_URI",
  "NEXT_PUBLIC_SITE_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
] as const;

function stubEnvironment(
  overrides: Partial<Record<(typeof managedEnvironment)[number], string>> = {},
): void {
  const defaults: Record<(typeof managedEnvironment)[number], string> = {
    NODE_ENV: "test",
    VERCEL_ENV: "",
    DEMO_MODE: "false",
    DONATIONS_ENABLED: "true",
    MONGODB_URI: "mongodb://localhost:27017/test",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    STRIPE_SECRET_KEY: "sk_test_1234567890123456",
    STRIPE_WEBHOOK_SECRET: "whsec_1234567890123456",
    RAZORPAY_KEY_ID: "rzp_test_1234567890",
    RAZORPAY_KEY_SECRET: "razorpay-secret",
    RAZORPAY_WEBHOOK_SECRET: "razorpay-webhook",
  };
  for (const variable of managedEnvironment) {
    vi.stubEnv(variable, overrides[variable] ?? defaults[variable]);
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.storeDonation.mockResolvedValue({
    record: storedDonation,
    persistence: "mongodb",
    created: true,
  });
  mocks.findDonation.mockResolvedValue({
    record: storedDonation,
    persistence: "mongodb",
    created: false,
  });
  mocks.createRazorpayOrder.mockResolvedValue({
    provider: "razorpay",
    status: "requires_action",
    orderId: "order_checkout",
    keyId: "rzp_test_1234567890",
    amountMinor: 50_000,
    currency: "INR",
  });
  mocks.markDonationPaymentCreated.mockResolvedValue(storedDonation);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("donation launch readiness", () => {
  it("rejects donations while the explicit launch flag is disabled", async () => {
    stubEnvironment({ DONATIONS_ENABLED: "false" });
    const { createDonationIntent } = await import("./donations");

    await expect(
      createDonationIntent(oneTimeInrDonation, metadata),
    ).rejects.toMatchObject({ status: 503, code: "DONATIONS_DISABLED" });
    expect(mocks.storeDonation).not.toHaveBeenCalled();
  });

  it("rejects an unsafe live-production redirect origin before persistence", async () => {
    stubEnvironment({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      STRIPE_SECRET_KEY: "sk_live_1234567890123456",
      RAZORPAY_KEY_ID: "rzp_live_1234567890",
    });
    const { createDonationIntent } = await import("./donations");

    await expect(
      createDonationIntent(oneTimeInrDonation, metadata),
    ).rejects.toMatchObject({
      status: 503,
      code: "PAYMENT_REDIRECT_ORIGIN_INVALID",
    });
    expect(mocks.storeDonation).not.toHaveBeenCalled();
  });

  it("requires durable MongoDB before persistence", async () => {
    stubEnvironment({ MONGODB_URI: "" });
    const { createDonationIntent } = await import("./donations");

    await expect(
      createDonationIntent(oneTimeInrDonation, metadata),
    ).rejects.toMatchObject({ status: 503, code: "PERSISTENCE_REQUIRED" });
    expect(mocks.storeDonation).not.toHaveBeenCalled();
  });

  it("rejects Stripe checkout before persistence", async () => {
    stubEnvironment();
    const { createDonationIntent } = await import("./donations");

    await expect(
      createDonationIntent(
        { ...oneTimeInrDonation, provider: "stripe" },
        metadata,
      ),
    ).rejects.toMatchObject({
      status: 422,
      code: "STRIPE_CHECKOUT_DISABLED",
    });
    expect(mocks.storeDonation).not.toHaveBeenCalled();
  });

  it("requires the matching provider configuration before persistence", async () => {
    stubEnvironment({
      RAZORPAY_KEY_ID: "",
      RAZORPAY_KEY_SECRET: "",
      RAZORPAY_WEBHOOK_SECRET: "",
    });
    const { createDonationIntent } = await import("./donations");

    await expect(
      createDonationIntent(oneTimeInrDonation, metadata),
    ).rejects.toMatchObject({ status: 503, code: "RAZORPAY_NOT_CONFIGURED" });
    expect(mocks.storeDonation).not.toHaveBeenCalled();
  });

  it("rejects recurring donations instead of routing them through Stripe", async () => {
    stubEnvironment();
    const { createDonationIntent } = await import("./donations");

    await expect(
      createDonationIntent(
        {
          ...oneTimeInrDonation,
          frequency: "monthly",
        },
        metadata,
      ),
    ).rejects.toMatchObject({
      status: 422,
      code: "DONATION_FREQUENCY_UNSUPPORTED",
    });

    expect(mocks.storeDonation).not.toHaveBeenCalled();
    expect(mocks.createRazorpayOrder).not.toHaveBeenCalled();
    expect(mocks.createStripeCheckout).not.toHaveBeenCalled();
  });

  it("rejects foreign-currency donations before persistence", async () => {
    stubEnvironment();
    const { createDonationIntent } = await import("./donations");

    await expect(
      createDonationIntent(
        { ...oneTimeInrDonation, currency: "USD" },
        metadata,
      ),
    ).rejects.toMatchObject({
      status: 422,
      code: "DONATION_CURRENCY_UNSUPPORTED",
    });
    expect(mocks.storeDonation).not.toHaveBeenCalled();
  });
});

describe("legacy checkout retry", () => {
  it("is disabled before donation lookup in live production", async () => {
    stubEnvironment({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://ngo-sky.vercel.app",
      STRIPE_SECRET_KEY: "sk_live_1234567890123456",
      RAZORPAY_KEY_ID: "rzp_live_1234567890",
    });
    const { startDonationCheckout } = await import("./donations");

    await expect(
      startDonationCheckout(storedDonation.id, "razorpay"),
    ).rejects.toMatchObject({ status: 410, code: "CHECKOUT_RETRY_DISABLED" });
    expect(mocks.findDonation).not.toHaveBeenCalled();
  });

  it("returns no donor PII when used in a preview environment", async () => {
    stubEnvironment({ NODE_ENV: "production", VERCEL_ENV: "preview" });
    const { startDonationCheckout } = await import("./donations");

    const result = await startDonationCheckout(storedDonation.id, "razorpay");

    expect(result.donation).toMatchObject({
      id: storedDonation.id,
      amountMinor: storedDonation.amountMinor,
      provider: "razorpay",
    });
    expect(result.donation).not.toHaveProperty("donor");
    expect(result.donation).not.toHaveProperty("message");
    expect(result.donation).not.toHaveProperty("externalOrderId");
  });
});
