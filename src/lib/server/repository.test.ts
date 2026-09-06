import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  connectMongo: vi.fn().mockResolvedValue(null),
}));

const metadata = { requestId: "req-production-test" };
const contact = {
  name: "Test User",
  email: "test@example.com",
  subject: "Production storage",
  message: "This submission must use durable storage.",
  consent: true as const,
  website: "",
};
const newsletter = {
  email: "test@example.com",
  source: "test",
  consent: true as const,
  website: "",
};
const volunteer = {
  name: "Test User",
  email: "test@example.com",
  phone: "+919999999999",
  city: "Delhi",
  country: "India",
  areaOfInterest: "Education",
  skills: [],
  availability: "weekends" as const,
  motivation: "I would like to support this programme responsibly.",
  consent: true as const,
  website: "",
};
const donation = {
  amount: 500,
  currency: "INR" as const,
  frequency: "one_time" as const,
  provider: "razorpay" as const,
  donor: { name: "Test User", email: "test@example.com" },
  anonymous: false,
  consent: true as const,
  website: "",
};

function stubRuntime(
  nodeEnv: "development" | "production",
  demoMode = false,
): void {
  vi.stubEnv("NODE_ENV", nodeEnv);
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("DEMO_MODE", demoMode ? "true" : "false");
  vi.stubEnv("MONGODB_URI", "");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("repository persistence guard", () => {
  it("rejects every submission write when production has no MongoDB", async () => {
    stubRuntime("production");
    const repository = await import("./repository");
    const writes = [
      () => repository.storeContact(contact, metadata),
      () => repository.storeNewsletterSubscription(newsletter, metadata),
      () => repository.storeVolunteerApplication(volunteer, metadata),
      () => repository.storeDonation(donation, metadata),
      () =>
        repository.markDonationPaymentCreated("demo_donation", {
          externalOrderId: "order",
        }),
      () =>
        repository.applyDonationPaymentStatus({
          donationId: "0123456789abcdef01234567",
          status: "paid",
        }),
    ];

    for (const write of writes) {
      await expect(write()).rejects.toMatchObject({
        status: 503,
        code: "PERSISTENCE_REQUIRED",
      });
    }
  }, 15_000);

  it("still rejects production writes when DEMO_MODE is explicitly enabled", async () => {
    stubRuntime("production", true);
    const { storeContact, storeDonation } = await import("./repository");

    await expect(storeContact(contact, metadata)).rejects.toMatchObject({
      status: 503,
      code: "PERSISTENCE_REQUIRED",
    });
    await expect(storeDonation(donation, metadata)).rejects.toMatchObject({
      status: 503,
      code: "PERSISTENCE_REQUIRED",
    });
  });

  it("retains in-memory persistence for local development", async () => {
    stubRuntime("development");
    const { storeContact, storeDonation } = await import("./repository");

    await expect(storeContact(contact, metadata)).resolves.toMatchObject({
      persistence: "memory",
      created: true,
    });
    await expect(storeDonation(donation, metadata)).rejects.toMatchObject({
      status: 503,
      code: "PERSISTENCE_REQUIRED",
    });
  });
});
