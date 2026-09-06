import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  connectMongo: vi.fn(),
  donationFind: vi.fn(),
  donationCount: vi.fn(),
  contactCount: vi.fn(),
  volunteerCount: vi.fn(),
  newsletterCount: vi.fn(),
}));

vi.mock("./db", () => ({ connectMongo: mocks.connectMongo }));
vi.mock("server-only", () => ({}));
vi.mock("@/models", () => ({
  DonationModel: {
    find: mocks.donationFind,
    countDocuments: mocks.donationCount,
  },
  ContactSubmissionModel: { countDocuments: mocks.contactCount },
  VolunteerApplicationModel: { countDocuments: mocks.volunteerCount },
  NewsletterSubscriberModel: { countDocuments: mocks.newsletterCount },
}));

function queryResult<T>(records: T[]) {
  const query = {
    select: vi.fn(),
    sort: vi.fn(),
    limit: vi.fn().mockResolvedValue(records),
  };
  query.select.mockReturnValue(query);
  query.sort.mockReturnValue(query);
  return query;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("production operations reads", () => {
  it("fails closed without a configured database", async () => {
    mocks.connectMongo.mockResolvedValue(null);
    const { getAccountDonationHistory, getOperationsSummary } = await import(
      "./operations"
    );

    await expect(
      getAccountDonationHistory("verified@example.com"),
    ).resolves.toEqual({
      state: "unavailable",
      reason: "database_not_configured",
    });
    await expect(getOperationsSummary()).resolves.toEqual({
      state: "unavailable",
      reason: "database_not_configured",
    });
    expect(mocks.donationFind).not.toHaveBeenCalled();
  });

  it("returns only account-safe donation fields for the authenticated account ID", async () => {
    mocks.connectMongo.mockResolvedValue({ connection: {} });
    const createdAt = new Date("2026-08-01T10:00:00.000Z");
    const updatedAt = new Date("2026-08-02T10:00:00.000Z");
    mocks.donationFind.mockReturnValue(
      queryResult([
        {
          _id: { toString: () => "0123456789abcdef01234567" },
          amountMinor: 125_000,
          currency: "INR",
          frequency: "one_time",
          provider: "razorpay",
          status: "paid",
          paidAt: updatedAt,
          createdAt,
          updatedAt,
          donor: { name: "Private", email: "verified@example.com" },
          externalPaymentId: "must-not-leak",
        },
      ]),
    );
    const { getAccountDonationHistory } = await import("./operations");

    const result = await getAccountDonationHistory("  user_verified  ", 1);

    expect(mocks.donationFind).toHaveBeenCalledWith({
      accountUserId: "user_verified",
    });
    expect(result).toEqual({
      state: "ready",
      data: [
        {
          id: "0123456789abcdef01234567",
          amountMinor: 125_000,
          currency: "INR",
          frequency: "one_time",
          provider: "razorpay",
          status: "paid",
          paidAt: updatedAt.toISOString(),
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        },
      ],
    });
  });

  it("reports real record counts from the database in parallel", async () => {
    mocks.connectMongo.mockResolvedValue({ connection: {} });
    mocks.donationCount
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(5);
    mocks.contactCount.mockResolvedValue(3);
    mocks.volunteerCount.mockResolvedValue(2);
    mocks.newsletterCount.mockResolvedValue(7);
    const { getOperationsSummary } = await import("./operations");

    await expect(getOperationsSummary()).resolves.toEqual({
      state: "ready",
      data: {
        donations: 8,
        confirmedDonations: 5,
        contactSubmissions: 3,
        volunteerApplications: 2,
        activeNewsletterSubscribers: 7,
      },
    });
  });

  it("does not expose a database exception to the UI", async () => {
    mocks.connectMongo.mockRejectedValue(new Error("sensitive connection detail"));
    const { getOperationsSummary } = await import("./operations");

    await expect(getOperationsSummary()).resolves.toEqual({
      state: "unavailable",
      reason: "database_unavailable",
    });
  });
});
