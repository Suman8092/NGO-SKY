import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../db", () => ({
  pingMongo: vi.fn().mockResolvedValue("connected"),
}));

function stubRuntime(
  nodeEnv: "test" | "production",
  mongoUri = "",
  demoMode = false,
): void {
  vi.stubEnv("NODE_ENV", nodeEnv);
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("DEMO_MODE", demoMode ? "true" : "false");
  vi.stubEnv("DONATIONS_ENABLED", "false");
  vi.stubEnv("PUBLIC_SUBMISSIONS_ENABLED", "false");
  vi.stubEnv("NEWSLETTER_ENABLED", "false");
  vi.stubEnv("MONGODB_URI", mongoUri);
  vi.stubEnv("STRIPE_SECRET_KEY", "");
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
  vi.stubEnv("RAZORPAY_KEY_ID", "");
  vi.stubEnv("RAZORPAY_KEY_SECRET", "");
  vi.stubEnv("RAZORPAY_WEBHOOK_SECRET", "");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("production health", () => {
  it("returns unhealthy when production has no durable database", async () => {
    stubRuntime("production");
    const { getHealthSnapshot } = await import("./health");

    const snapshot = await getHealthSnapshot();

    expect(snapshot.httpStatus).toBe(503);
    expect(snapshot.body.status).toBe("unhealthy");
    expect(snapshot.body.mode).toBe("demo");
    expect(snapshot.body.configuration).toMatchObject({ valid: false });
    expect(snapshot.body.configuration.invalidFields).toContain("MONGODB_URI");
  });

  it("does not report explicit demo mode as production-ready", async () => {
    stubRuntime("production", "mongodb://localhost:27017/test", true);
    const { getHealthSnapshot } = await import("./health");

    const snapshot = await getHealthSnapshot();

    expect(snapshot.httpStatus).toBe(503);
    expect(snapshot.body.status).toBe("unhealthy");
    expect(snapshot.body.configuration.invalidFields).toContain("DEMO_MODE");
  });

  it("keeps no-database mode available during tests", async () => {
    stubRuntime("test");
    const { getHealthSnapshot } = await import("./health");

    const snapshot = await getHealthSnapshot();

    expect(snapshot.httpStatus).toBe(200);
    expect(snapshot.body.status).toBe("degraded");
  });

  it("reports unsafe optional production credentials as degraded", async () => {
    stubRuntime("production", "mongodb://localhost:27017/test");
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_example");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "test-secret");
    vi.stubEnv("RAZORPAY_WEBHOOK_SECRET", "test-webhook-secret");
    const { getHealthSnapshot } = await import("./health");

    const snapshot = await getHealthSnapshot();

    expect(snapshot.httpStatus).toBe(200);
    expect(snapshot.body.status).toBe("degraded");
    expect(snapshot.body.integrations.razorpay).toBe("disabled");
    expect(snapshot.body.configuration.invalidFields).toContain(
      "RAZORPAY_KEY_ID",
    );
  });

  it("never reports the disabled Stripe checkout path as ready", async () => {
    stubRuntime("test", "mongodb://localhost:27017/test");
    vi.stubEnv("DONATIONS_ENABLED", "true");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_1234567890123456");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_1234567890123456");
    const { getHealthSnapshot } = await import("./health");

    const snapshot = await getHealthSnapshot();

    expect(snapshot.body.integrations.stripe).toBe("disabled");
  });
});
