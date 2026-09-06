import { createHash } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  connectMongo: vi.fn(),
  create: vi.fn(),
  findOne: vi.fn(),
}));

vi.mock("@/models", () => ({
  DonationModel: {},
  PaymentWebhookEventModel: {
    create: mocks.create,
    findOne: mocks.findOne,
  },
}));

vi.mock("./db", () => ({ connectMongo: mocks.connectMongo }));

import { recordPaymentWebhookEvent } from "./payment-webhook-inbox";

const rawBody = '{"event":"payment.captured"}';
const payloadHash = createHash("sha256").update(rawBody).digest("hex");
const update = {
  provider: "razorpay" as const,
  externalOrderId: "order_live_123",
  externalPaymentId: "pay_live_123",
  status: "paid" as const,
  amountMinor: 50_000,
  currency: "INR",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.connectMongo.mockResolvedValue({});
});

describe("durable payment webhook receipt", () => {
  it("persists the provider event ID, payload hash, normalized update, and retry state", async () => {
    mocks.create.mockResolvedValue({
      _id: { toString: () => "event-record-id" },
      status: "received",
    });

    await expect(
      recordPaymentWebhookEvent({
        provider: "razorpay",
        providerEventId: "event-provider-123",
        eventType: "payment.captured",
        rawBody,
        update,
      }),
    ).resolves.toEqual({
      eventId: "event-record-id",
      duplicate: false,
      status: "received",
      shouldProcess: true,
    });
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "razorpay",
        providerEventId: "event-provider-123",
        providerEventIdSource: "provider",
        payloadHash,
        status: "received",
        attempts: 0,
        amountMinor: 50_000,
        currency: "INR",
      }),
    );
  });

  it("deduplicates an identical provider event and never reprocesses a completed event", async () => {
    mocks.create.mockRejectedValue({ code: 11000 });
    mocks.findOne.mockReturnValue({
      orFail: vi.fn().mockResolvedValue({
        _id: { toString: () => "event-record-id" },
        payloadHash,
        status: "processed",
      }),
    });

    await expect(
      recordPaymentWebhookEvent({
        provider: "razorpay",
        providerEventId: "event-provider-123",
        eventType: "payment.captured",
        rawBody,
        update,
      }),
    ).resolves.toEqual({
      eventId: "event-record-id",
      duplicate: true,
      status: "processed",
      shouldProcess: false,
    });
  });

  it("rejects provider event ID reuse with a different signed payload", async () => {
    mocks.create.mockRejectedValue({ code: 11000 });
    mocks.findOne.mockReturnValue({
      orFail: vi.fn().mockResolvedValue({
        _id: { toString: () => "event-record-id" },
        payloadHash: "f".repeat(64),
        status: "processed",
      }),
    });

    await expect(
      recordPaymentWebhookEvent({
        provider: "razorpay",
        providerEventId: "event-provider-123",
        eventType: "payment.captured",
        rawBody,
        update,
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: "WEBHOOK_EVENT_PAYLOAD_MISMATCH",
    });
  });
});
