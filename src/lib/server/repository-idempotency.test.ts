import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  connectMongo: vi.fn(),
  donationCreate: vi.fn(),
  donationFindOne: vi.fn(),
}));

vi.mock("./db", () => ({ connectMongo: mocks.connectMongo }));
vi.mock("../../models", () => ({
  ContactSubmissionModel: {},
  DonationModel: {
    create: mocks.donationCreate,
    findOne: mocks.donationFindOne,
  },
  NewsletterSubscriberModel: {},
  VolunteerApplicationModel: {},
}));

import { storeDonation } from "./repository";

const input = {
  amount: 500,
  currency: "INR" as const,
  frequency: "one_time" as const,
  provider: "razorpay" as const,
  donor: { name: "Test Donor", email: "donor@example.com" },
  anonymous: false,
  consent: true as const,
  idempotencyKey: "request-key-123",
  website: "",
};

function existingDonation(overrides: Record<string, unknown> = {}) {
  return {
    _id: { toString: () => "0123456789abcdef01234567" },
    amountMinor: 50_000,
    currency: "INR",
    frequency: "one_time",
    provider: "razorpay",
    donor: { name: "Test Donor", email: "donor@example.com" },
    anonymous: false,
    status: "processing",
    idempotencyKey: "request-key-123",
    externalOrderId: "order_live_123",
    accountUserId: "user_123",
    createdAt: new Date("2026-08-11T00:00:00.000Z"),
    updatedAt: new Date("2026-08-11T00:01:00.000Z"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.connectMongo.mockResolvedValue({});
});

describe("donation idempotency ownership", () => {
  it("returns the existing donation only for the same payment tuple and account", async () => {
    mocks.donationFindOne.mockResolvedValue(existingDonation());

    await expect(
      storeDonation(input, {
        requestId: "request-id-123",
        accountUserId: "user_123",
      }),
    ).resolves.toMatchObject({ created: false, persistence: "mongodb" });
    expect(mocks.donationCreate).not.toHaveBeenCalled();
  });

  it("rejects a reused key for a different donor or signed-in account", async () => {
    mocks.donationFindOne.mockResolvedValue(existingDonation());

    await expect(
      storeDonation(
        { ...input, donor: { ...input.donor, email: "other@example.com" } },
        { requestId: "request-id-123", accountUserId: "user_123" },
      ),
    ).rejects.toMatchObject({ status: 409, code: "IDEMPOTENCY_CONFLICT" });

    await expect(
      storeDonation(input, {
        requestId: "request-id-123",
        accountUserId: "user_other",
      }),
    ).rejects.toMatchObject({ status: 409, code: "IDEMPOTENCY_CONFLICT" });
  });

  it("applies the same ownership check during duplicate-key race recovery", async () => {
    mocks.donationFindOne.mockResolvedValueOnce(null).mockReturnValueOnce({
      orFail: vi
        .fn()
        .mockResolvedValue(existingDonation({ accountUserId: "user_other" })),
    });
    mocks.donationCreate.mockRejectedValue({ code: 11000 });

    await expect(
      storeDonation(input, {
        requestId: "request-id-123",
        accountUserId: "user_123",
      }),
    ).rejects.toMatchObject({ status: 409, code: "IDEMPOTENCY_CONFLICT" });
  });
});
