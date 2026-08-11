import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  allowsInMemoryPersistence: vi.fn(),
  connectMongo: vi.fn(),
}));

vi.mock("./db", () => ({ connectMongo: mocks.connectMongo }));
vi.mock("./env", () => ({
  allowsInMemoryPersistence: mocks.allowsInMemoryPersistence,
}));

beforeEach(() => {
  mocks.connectMongo.mockReset();
  mocks.allowsInMemoryPersistence.mockReset();
  globalThis.__skiesRateLimitIndexPromise = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("shared rate limiting", () => {
  it("uses the in-memory limiter only when local persistence is allowed", async () => {
    mocks.connectMongo.mockResolvedValue(null);
    mocks.allowsInMemoryPersistence.mockReturnValue(true);
    const { enforceRateLimit } = await import("./rate-limit");
    const identity = `local-${crypto.randomUUID()}`;

    await expect(
      enforceRateLimit("contact", identity, { limit: 1, windowMs: 60_000 }),
    ).resolves.toBeUndefined();
    await expect(
      enforceRateLimit("contact", identity, { limit: 1, windowMs: 60_000 }),
    ).rejects.toMatchObject({ status: 429, code: "RATE_LIMITED" });
  });

  it("fails closed when shared persistence is required but unavailable", async () => {
    mocks.connectMongo.mockResolvedValue(null);
    mocks.allowsInMemoryPersistence.mockReturnValue(false);
    const { enforceRateLimit } = await import("./rate-limit");

    await expect(
      enforceRateLimit("contact", "203.0.113.4", {
        limit: 5,
        windowMs: 60_000,
      }),
    ).rejects.toMatchObject({ status: 503, code: "PERSISTENCE_REQUIRED" });
  });

  it("uses an atomic MongoDB bucket without storing the raw identity", async () => {
    const findOneAndUpdate = vi.fn().mockResolvedValue({ count: 2 });
    const createIndex = vi.fn().mockResolvedValue("rate_limit_expiry");
    const collection = vi.fn().mockReturnValue({
      createIndex,
      findOneAndUpdate,
    });
    mocks.connectMongo.mockResolvedValue({ connection: { db: { collection } } });
    mocks.allowsInMemoryPersistence.mockReturnValue(false);
    const { enforceRateLimit } = await import("./rate-limit");

    await expect(
      enforceRateLimit("donations", "203.0.113.9", {
        limit: 1,
        windowMs: 60_000,
      }),
    ).rejects.toMatchObject({ status: 429, code: "RATE_LIMITED" });

    const filter = findOneAndUpdate.mock.calls[0]?.[0] as { _id: string };
    expect(filter._id).not.toContain("203.0.113.9");
    expect(createIndex).toHaveBeenCalledWith(
      { resetAt: 1 },
      { expireAfterSeconds: 0, name: "rate_limit_expiry" },
    );
  });
});
