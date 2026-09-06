import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  connectMongo: vi.fn(),
  create: vi.fn(),
  findOne: vi.fn(),
  findOneAndUpdate: vi.fn(),
}));

vi.mock("./db", () => ({ connectMongo: mocks.connectMongo }));
vi.mock("../../models", () => ({
  ContactSubmissionModel: { create: vi.fn() },
  DonationModel: {},
  NewsletterSubscriberModel: {
    create: mocks.create,
    findOne: mocks.findOne,
    findOneAndUpdate: mocks.findOneAndUpdate,
  },
  VolunteerApplicationModel: { create: vi.fn() },
}));

import {
  storeNewsletterSubscription,
  unsubscribeNewsletterSubscription,
} from "./repository";
import { hashNewsletterUnsubscribeToken } from "./newsletter-tokens";

const metadata = { requestId: "req-newsletter-lifecycle", ip: "203.0.113.4" };
const input = {
  email: "reader@example.org",
  name: "Reader",
  source: "website",
  consent: true as const,
  website: "",
};
const subscribedAt = new Date("2026-08-11T10:00:00.000Z");
const document = {
  _id: { toString: () => "64b64b64b64b64b64b64b64b" },
  subscribedAt,
};

function mockExisting(value: Record<string, unknown> | null): void {
  const lean = vi.fn().mockResolvedValue(value);
  const select = vi.fn().mockReturnValue({ lean });
  mocks.findOne.mockReturnValue({ select });
}

beforeEach(() => {
  mocks.connectMongo.mockReset().mockResolvedValue({ connection: {} });
  mocks.create.mockReset();
  mocks.findOne.mockReset();
  mocks.findOneAndUpdate.mockReset();
});

describe("newsletter repository lifecycle", () => {
  it("stores only the hash for a new subscriber and returns the bearer once", async () => {
    mockExisting(null);
    mocks.create.mockResolvedValue(document);

    const result = await storeNewsletterSubscription(input, metadata);
    const createPayload = mocks.create.mock.calls[0]?.[0] as Record<
      string,
      unknown
    >;

    expect(result.created).toBe(true);
    expect(result.unsubscribeToken).toBeDefined();
    expect(createPayload.unsubscribeTokenHash).toBe(
      hashNewsletterUnsubscribeToken(result.unsubscribeToken!),
    );
    expect(JSON.stringify(createPayload)).not.toContain(
      result.unsubscribeToken!,
    );
  });

  it("adds a token to a legacy active row on its next signup", async () => {
    mockExisting({
      _id: "64b64b64b64b64b64b64b64b",
      status: "active",
      subscribedAt,
    });
    mocks.findOneAndUpdate.mockResolvedValue(document);

    const result = await storeNewsletterSubscription(input, metadata);
    const update = mocks.findOneAndUpdate.mock.calls[0]?.[1] as {
      $set: Record<string, unknown>;
    };

    expect(result.created).toBe(false);
    expect(result.unsubscribeToken).toBeDefined();
    expect(update.$set.unsubscribeTokenHash).toBe(
      hashNewsletterUnsubscribeToken(result.unsubscribeToken!),
    );
    expect(JSON.stringify(update)).not.toContain(result.unsubscribeToken!);
  });

  it("reactivates an unsubscribed row with a rotated token", async () => {
    const oldTokenHash = "f".repeat(64);
    mockExisting({
      _id: "64b64b64b64b64b64b64b64b",
      status: "unsubscribed",
      subscribedAt,
      unsubscribeTokenHash: oldTokenHash,
    });
    mocks.findOneAndUpdate.mockResolvedValue(document);

    const result = await storeNewsletterSubscription(input, metadata);
    const [filter, update] = mocks.findOneAndUpdate.mock.calls[0] as [
      Record<string, unknown>,
      { $set: Record<string, unknown>; $unset: Record<string, unknown> },
    ];

    expect(result.created).toBe(true);
    expect(filter.unsubscribeTokenHash).toBe(oldTokenHash);
    expect(update.$set.unsubscribeTokenHash).not.toBe(oldTokenHash);
    expect(update.$unset).toHaveProperty("unsubscribedAt");
  });

  it("atomically consumes a valid token so a replay is invalid", async () => {
    const token = "a".repeat(43);
    mocks.findOneAndUpdate
      .mockResolvedValueOnce(document)
      .mockResolvedValueOnce(null);

    await expect(unsubscribeNewsletterSubscription(token)).resolves.toBe(
      "unsubscribed",
    );
    await expect(unsubscribeNewsletterSubscription(token)).resolves.toBe(
      "invalid",
    );

    const [filter, update] = mocks.findOneAndUpdate.mock.calls[0] as [
      Record<string, unknown>,
      { $unset: Record<string, unknown> },
    ];
    expect(filter.unsubscribeTokenHash).toBe(
      hashNewsletterUnsubscribeToken(token),
    );
    expect(JSON.stringify(filter)).not.toContain(token);
    expect(update.$unset).toEqual(
      expect.objectContaining({
        unsubscribeTokenHash: 1,
        unsubscribeTokenIssuedAt: 1,
      }),
    );
  });

  it("fails closed when MongoDB is unavailable", async () => {
    mocks.connectMongo.mockResolvedValue(null);

    await expect(
      unsubscribeNewsletterSubscription("a".repeat(43)),
    ).rejects.toMatchObject({
      status: 503,
      code: "PERSISTENCE_REQUIRED",
    });
    expect(mocks.findOneAndUpdate).not.toHaveBeenCalled();
  });
});
