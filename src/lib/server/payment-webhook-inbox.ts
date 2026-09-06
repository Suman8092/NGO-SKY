import { createHash, randomUUID } from "node:crypto";

import type { ClientSession } from "mongoose";

import {
  DonationModel,
  PaymentWebhookEventModel,
  type DonationDocument,
  type PaymentProvider,
  type PaymentWebhookEventDocument,
  type PaymentWebhookEventStatus,
} from "@/models";

import { connectMongo } from "./db";
import { ApiError, safeLogError } from "./errors";
import type { DonationPaymentUpdate } from "./payments/types";
import type { DonationRecord } from "./repository";

const PROCESSING_LEASE_MS = 2 * 60_000;
const objectIdPattern = /^[a-f0-9]{24}$/i;
const providerEventIdPattern = /^[\x21-\x7e]{1,200}$/;

export type PaymentWebhookReceipt = {
  eventId: string;
  duplicate: boolean;
  status: PaymentWebhookEventStatus;
  shouldProcess: boolean;
};

type DonationSnapshot = {
  id: string;
  amountMinor: number;
  currency: string;
  provider: PaymentProvider;
  status: DonationDocument["status"];
  externalOrderId?: string;
  externalSessionId?: string;
  externalPaymentId?: string;
  refundedAmountMinor: number;
};

type ReconciliationDecision =
  | { kind: "ignore"; code: string }
  | { kind: "retry"; code: string }
  | {
      kind: "apply";
      code: string;
      status: DonationDocument["status"];
      externalPaymentId?: string;
      refundedAmountMinor?: number;
      failureCode?: string;
      clearFailureCode?: boolean;
      transitionedToPaid: boolean;
    };

function isDuplicateKey(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === 11000,
  );
}

function donationSnapshot(document: DonationDocument): DonationSnapshot {
  return {
    id: document._id.toString(),
    amountMinor: document.amountMinor,
    currency: document.currency,
    provider: document.provider,
    status: document.status,
    externalOrderId: document.externalOrderId,
    externalSessionId: document.externalSessionId,
    externalPaymentId: document.externalPaymentId,
    refundedAmountMinor: document.refundedAmountMinor ?? 0,
  };
}

function donationRecord(document: DonationDocument): DonationRecord {
  return {
    id: document._id.toString(),
    amountMinor: document.amountMinor,
    currency: document.currency,
    frequency: document.frequency,
    provider: document.provider,
    donor: {
      name: document.donor.name,
      email: document.donor.email,
      phone: document.donor.phone,
      country: document.donor.country,
    },
    anonymous: document.anonymous,
    message: document.message,
    status: document.status,
    externalOrderId: document.externalOrderId,
    externalSessionId: document.externalSessionId,
    externalPaymentId: document.externalPaymentId,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

function eventUpdate(
  event: PaymentWebhookEventDocument,
): DonationPaymentUpdate | null {
  if (!event.targetStatus) return null;
  return {
    provider: event.provider,
    donationId: event.donationId,
    externalOrderId: event.externalOrderId,
    externalSessionId: event.externalSessionId,
    externalPaymentId: event.externalPaymentId,
    status: event.targetStatus,
    amountMinor: event.amountMinor,
    currency: event.currency,
    refundAmountMinor: event.refundAmountMinor,
    refundMode: event.refundMode,
    failureCode: event.failureCode,
  };
}

function paymentReferenceMatches(
  donation: DonationSnapshot,
  event: DonationPaymentUpdate,
): boolean {
  const storedReference =
    donation.provider === "razorpay"
      ? donation.externalOrderId
      : donation.externalSessionId;
  const eventReference =
    event.provider === "razorpay"
      ? event.externalOrderId
      : event.externalSessionId;

  if (
    !storedReference ||
    !eventReference ||
    storedReference !== eventReference
  ) {
    return false;
  }
  return !(
    donation.externalPaymentId &&
    event.externalPaymentId &&
    donation.externalPaymentId !== event.externalPaymentId
  );
}

function paymentAmountMatches(
  donation: DonationSnapshot,
  event: DonationPaymentUpdate,
): boolean {
  return (
    Number.isSafeInteger(event.amountMinor) &&
    event.amountMinor === donation.amountMinor &&
    event.currency?.toUpperCase() === donation.currency
  );
}

export function reconcilePaymentWebhook(
  donation: DonationSnapshot,
  event: DonationPaymentUpdate,
): ReconciliationDecision {
  if (donation.provider !== event.provider) {
    return { kind: "ignore", code: "provider_mismatch" };
  }
  if (event.donationId && event.donationId !== donation.id) {
    return { kind: "ignore", code: "donation_reference_mismatch" };
  }

  if (event.status === "refunded") {
    if (donation.status !== "paid" && donation.status !== "refunded") {
      return { kind: "retry", code: "refund_before_payment" };
    }
    if (
      !event.externalPaymentId ||
      !donation.externalPaymentId ||
      event.externalPaymentId !== donation.externalPaymentId
    ) {
      return { kind: "ignore", code: "refund_payment_reference_mismatch" };
    }
    if (
      (event.externalOrderId &&
        event.externalOrderId !== donation.externalOrderId) ||
      (event.externalSessionId &&
        event.externalSessionId !== donation.externalSessionId)
    ) {
      return { kind: "ignore", code: "refund_checkout_reference_mismatch" };
    }
    if (event.currency?.toUpperCase() !== donation.currency) {
      return { kind: "ignore", code: "refund_currency_mismatch" };
    }
    if (
      event.amountMinor !== undefined &&
      event.amountMinor !== donation.amountMinor
    ) {
      return { kind: "ignore", code: "refund_original_amount_mismatch" };
    }
    if (
      !Number.isSafeInteger(event.refundAmountMinor) ||
      !event.refundAmountMinor ||
      event.refundAmountMinor < 1 ||
      !event.refundMode
    ) {
      return { kind: "ignore", code: "refund_amount_missing" };
    }

    const refundedAmountMinor =
      event.refundMode === "delta"
        ? donation.refundedAmountMinor + event.refundAmountMinor
        : event.refundAmountMinor;
    if (
      refundedAmountMinor < donation.refundedAmountMinor ||
      refundedAmountMinor > donation.amountMinor
    ) {
      return { kind: "ignore", code: "refund_amount_invalid" };
    }

    const fullyRefunded = refundedAmountMinor === donation.amountMinor;
    return {
      kind: "apply",
      code: fullyRefunded ? "full_refund_applied" : "partial_refund_recorded",
      status: fullyRefunded ? "refunded" : "paid",
      refundedAmountMinor,
      transitionedToPaid: false,
    };
  }

  if (!paymentReferenceMatches(donation, event)) {
    return { kind: "ignore", code: "checkout_reference_mismatch" };
  }
  if (!paymentAmountMatches(donation, event)) {
    return { kind: "ignore", code: "payment_amount_or_currency_mismatch" };
  }
  if (event.provider === "razorpay" && !event.externalPaymentId) {
    return { kind: "ignore", code: "payment_reference_missing" };
  }

  if (event.status === "processing") {
    if (donation.status !== "pending" && donation.status !== "processing") {
      return { kind: "ignore", code: "stale_processing_event" };
    }
    return {
      kind: "apply",
      code: "processing_applied",
      status: "processing",
      externalPaymentId: event.externalPaymentId,
      transitionedToPaid: false,
    };
  }

  if (event.status === "failed") {
    if (
      donation.status !== "pending" &&
      donation.status !== "processing" &&
      donation.status !== "failed"
    ) {
      return { kind: "ignore", code: "stale_failed_event" };
    }
    return {
      kind: "apply",
      code: "failure_applied",
      status: "failed",
      externalPaymentId: event.externalPaymentId,
      failureCode: event.failureCode?.slice(0, 100),
      transitionedToPaid: false,
    };
  }

  if (donation.status === "refunded") {
    return { kind: "ignore", code: "payment_already_refunded" };
  }
  return {
    kind: "apply",
    code:
      donation.status === "paid" ? "payment_already_paid" : "payment_applied",
    status: "paid",
    externalPaymentId: event.externalPaymentId,
    clearFailureCode: true,
    transitionedToPaid: donation.status !== "paid",
  };
}

function shouldProcessStatus(
  status: PaymentWebhookEventStatus,
  lockedUntil?: Date,
): boolean {
  return (
    status === "received" ||
    status === "failed" ||
    (status === "processing" &&
      Boolean(lockedUntil && lockedUntil.getTime() <= Date.now()))
  );
}

export async function recordPaymentWebhookEvent(input: {
  provider: PaymentProvider;
  providerEventId?: string | null;
  eventType: string;
  rawBody: string;
  update: DonationPaymentUpdate | null;
}): Promise<PaymentWebhookReceipt> {
  const connection = await connectMongo();
  if (!connection) {
    throw new ApiError(
      503,
      "PERSISTENCE_REQUIRED",
      "Webhook processing requires durable database storage.",
      { retryAfter: 30 },
    );
  }
  if (input.update && input.update.provider !== input.provider) {
    throw new ApiError(
      400,
      "WEBHOOK_PROVIDER_MISMATCH",
      "The webhook payload provider is invalid.",
    );
  }

  const payloadHash = createHash("sha256")
    .update(input.rawBody, "utf8")
    .digest("hex");
  const suppliedEventId = input.providerEventId?.trim();
  if (suppliedEventId && !providerEventIdPattern.test(suppliedEventId)) {
    throw new ApiError(
      400,
      "WEBHOOK_EVENT_ID_INVALID",
      "The provider event identifier is invalid.",
    );
  }
  const providerEventId = suppliedEventId ?? `payload_${payloadHash}`;
  const normalized = input.update;

  try {
    const event = await PaymentWebhookEventModel.create({
      provider: input.provider,
      providerEventId,
      providerEventIdSource: suppliedEventId ? "provider" : "payload_hash",
      eventType: input.eventType.slice(0, 160) || "unknown",
      payloadHash,
      status: "received",
      attempts: 0,
      donationId: normalized?.donationId,
      externalOrderId: normalized?.externalOrderId,
      externalSessionId: normalized?.externalSessionId,
      externalPaymentId: normalized?.externalPaymentId,
      targetStatus: normalized?.status,
      amountMinor: normalized?.amountMinor,
      currency: normalized?.currency?.toUpperCase(),
      refundAmountMinor: normalized?.refundAmountMinor,
      refundMode: normalized?.refundMode,
      failureCode: normalized?.failureCode?.slice(0, 100),
    });
    return {
      eventId: event._id.toString(),
      duplicate: false,
      status: event.status,
      shouldProcess: true,
    };
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
  }

  const existing = await PaymentWebhookEventModel.findOne({
    provider: input.provider,
    providerEventId,
  }).orFail();
  if (existing.payloadHash !== payloadHash) {
    throw new ApiError(
      409,
      "WEBHOOK_EVENT_PAYLOAD_MISMATCH",
      "The provider event identifier was reused with a different payload.",
    );
  }
  return {
    eventId: existing._id.toString(),
    duplicate: true,
    status: existing.status,
    shouldProcess: shouldProcessStatus(existing.status, existing.lockedUntil),
  };
}

async function findDonationForEvent(
  event: PaymentWebhookEventDocument,
  session: ClientSession,
) {
  if (event.donationId) {
    if (!objectIdPattern.test(event.donationId)) return null;
    return DonationModel.findById(event.donationId).session(session);
  }
  if (event.provider === "razorpay" && event.externalOrderId) {
    return DonationModel.findOne({
      provider: "razorpay",
      externalOrderId: event.externalOrderId,
    }).session(session);
  }
  if (event.provider === "stripe" && event.externalSessionId) {
    return DonationModel.findOne({
      provider: "stripe",
      externalSessionId: event.externalSessionId,
    }).session(session);
  }
  if (event.externalPaymentId) {
    return DonationModel.findOne({
      provider: event.provider,
      externalPaymentId: event.externalPaymentId,
    }).session(session);
  }
  return null;
}

async function finishEvent(
  eventId: string,
  lockToken: string,
  status: "processed" | "ignored",
  resultCode: string,
  session: ClientSession,
): Promise<void> {
  const result = await PaymentWebhookEventModel.updateOne(
    { _id: eventId, status: "processing", lockToken },
    {
      $set: { status, resultCode, processedAt: new Date() },
      $unset: {
        lockToken: 1,
        lockedUntil: 1,
        lastErrorCode: 1,
      },
    },
    { session },
  );
  if (result.matchedCount !== 1) {
    throw new ApiError(
      409,
      "WEBHOOK_LEASE_LOST",
      "The webhook processing lease is no longer valid.",
    );
  }
}

export async function processPaymentWebhookEvent(eventId: string): Promise<{
  state: "processed" | "ignored" | "not_claimed";
  resultCode?: string;
  confirmationDonation?: DonationRecord;
}> {
  const connection = await connectMongo();
  if (!connection) {
    throw new ApiError(
      503,
      "PERSISTENCE_REQUIRED",
      "Webhook processing requires durable database storage.",
      { retryAfter: 30 },
    );
  }

  const now = new Date();
  const lockToken = randomUUID();
  const claimed = await PaymentWebhookEventModel.findOneAndUpdate(
    {
      _id: eventId,
      $or: [
        { status: { $in: ["received", "failed"] } },
        { status: "processing", lockedUntil: { $lte: now } },
      ],
    },
    {
      $set: {
        status: "processing",
        lockToken,
        lockedUntil: new Date(now.getTime() + PROCESSING_LEASE_MS),
        lastAttemptAt: now,
      },
      $inc: { attempts: 1 },
      $unset: { lastErrorCode: 1, resultCode: 1, processedAt: 1 },
    },
    { new: true },
  );
  if (!claimed) return { state: "not_claimed" };

  const session = await connection.startSession();
  let outcome: {
    state: "processed" | "ignored";
    resultCode: string;
  } = { state: "ignored", resultCode: "processing_not_completed" };
  let paidDonation: DonationRecord | undefined;

  try {
    await session.withTransaction(async () => {
      paidDonation = undefined;
      const event = await PaymentWebhookEventModel.findOne({
        _id: eventId,
        status: "processing",
        lockToken,
      }).session(session);
      if (!event) {
        throw new ApiError(
          409,
          "WEBHOOK_LEASE_LOST",
          "The webhook processing lease is no longer valid.",
        );
      }

      const update = eventUpdate(event);
      if (!update) {
        outcome = { state: "ignored", resultCode: "event_not_actionable" };
        await finishEvent(
          eventId,
          lockToken,
          "ignored",
          outcome.resultCode,
          session,
        );
        return;
      }

      const donation = await findDonationForEvent(event, session);
      if (!donation) {
        outcome = { state: "ignored", resultCode: "donation_not_found" };
        await finishEvent(
          eventId,
          lockToken,
          "ignored",
          outcome.resultCode,
          session,
        );
        return;
      }

      const decision = reconcilePaymentWebhook(
        donationSnapshot(donation),
        update,
      );
      if (decision.kind === "retry") {
        throw new ApiError(
          409,
          "WEBHOOK_EVENT_NOT_READY",
          "The referenced payment state is not ready for this webhook event.",
        );
      }
      if (decision.kind === "ignore") {
        outcome = { state: "ignored", resultCode: decision.code };
        await finishEvent(
          eventId,
          lockToken,
          "ignored",
          decision.code,
          session,
        );
        return;
      }

      const updatedDonation = await DonationModel.findByIdAndUpdate(
        donation._id,
        {
          $set: {
            status: decision.status,
            ...(decision.externalPaymentId
              ? { externalPaymentId: decision.externalPaymentId }
              : {}),
            ...(decision.refundedAmountMinor !== undefined
              ? { refundedAmountMinor: decision.refundedAmountMinor }
              : {}),
            ...(decision.failureCode
              ? { failureCode: decision.failureCode }
              : {}),
            ...(decision.transitionedToPaid ? { paidAt: new Date() } : {}),
          },
          ...(decision.clearFailureCode ? { $unset: { failureCode: 1 } } : {}),
        },
        { new: true, session },
      ).orFail();

      if (decision.transitionedToPaid) {
        paidDonation = donationRecord(updatedDonation);
      }
      outcome = { state: "processed", resultCode: decision.code };
      await finishEvent(
        eventId,
        lockToken,
        "processed",
        decision.code,
        session,
      );
    });
  } catch (error) {
    const errorCode =
      error instanceof ApiError ? error.code : "WEBHOOK_PROCESSING_FAILED";
    await PaymentWebhookEventModel.updateOne(
      { _id: eventId, status: "processing", lockToken },
      {
        $set: {
          status: "failed",
          lastErrorCode: errorCode.slice(0, 100),
        },
        $unset: { lockToken: 1, lockedUntil: 1 },
      },
    ).catch((updateError: unknown) => {
      safeLogError("payment-webhook-failure-state", updateError);
    });
    throw error;
  } finally {
    await session.endSession();
  }

  return {
    ...outcome,
    ...(paidDonation ? { confirmationDonation: paidDonation } : {}),
  };
}
