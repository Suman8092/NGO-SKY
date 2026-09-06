import { type Model, type Types, Schema, model, models } from "mongoose";

import type { DonationStatus, PaymentProvider } from "./Donation";

export type PaymentWebhookEventStatus =
  "received" | "processing" | "processed" | "ignored" | "failed";

export interface PaymentWebhookEventDocument {
  _id: Types.ObjectId;
  provider: PaymentProvider;
  providerEventId: string;
  providerEventIdSource: "provider" | "payload_hash";
  eventType: string;
  payloadHash: string;
  status: PaymentWebhookEventStatus;
  attempts: number;
  donationId?: string;
  externalOrderId?: string;
  externalSessionId?: string;
  externalPaymentId?: string;
  targetStatus?: Extract<
    DonationStatus,
    "processing" | "paid" | "failed" | "refunded"
  >;
  amountMinor?: number;
  currency?: string;
  refundAmountMinor?: number;
  refundMode?: "delta" | "total";
  failureCode?: string;
  lockToken?: string;
  lockedUntil?: Date;
  lastAttemptAt?: Date;
  processedAt?: Date;
  lastErrorCode?: string;
  resultCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentWebhookEventSchema = new Schema<PaymentWebhookEventDocument>(
  {
    provider: {
      type: String,
      enum: ["stripe", "razorpay"],
      required: true,
    },
    providerEventId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    providerEventIdSource: {
      type: String,
      enum: ["provider", "payload_hash"],
      required: true,
    },
    eventType: { type: String, required: true, trim: true, maxlength: 160 },
    payloadHash: {
      type: String,
      required: true,
      match: /^[a-f0-9]{64}$/,
    },
    status: {
      type: String,
      enum: ["received", "processing", "processed", "ignored", "failed"],
      required: true,
      default: "received",
    },
    attempts: { type: Number, required: true, min: 0, default: 0 },
    donationId: { type: String, maxlength: 100 },
    externalOrderId: { type: String, maxlength: 120 },
    externalSessionId: { type: String, maxlength: 120 },
    externalPaymentId: { type: String, maxlength: 120 },
    targetStatus: {
      type: String,
      enum: ["processing", "paid", "failed", "refunded"],
    },
    amountMinor: { type: Number, min: 0 },
    currency: { type: String, uppercase: true, maxlength: 3 },
    refundAmountMinor: { type: Number, min: 0 },
    refundMode: { type: String, enum: ["delta", "total"] },
    failureCode: { type: String, maxlength: 100 },
    lockToken: { type: String, maxlength: 100 },
    lockedUntil: Date,
    lastAttemptAt: Date,
    processedAt: Date,
    lastErrorCode: { type: String, maxlength: 100 },
    resultCode: { type: String, maxlength: 100 },
  },
  { timestamps: true, versionKey: false },
);

paymentWebhookEventSchema.index(
  { provider: 1, providerEventId: 1 },
  { unique: true },
);
paymentWebhookEventSchema.index({ status: 1, lockedUntil: 1, createdAt: 1 });

export const PaymentWebhookEventModel =
  (models.PaymentWebhookEvent as
    Model<PaymentWebhookEventDocument> | undefined) ??
  model<PaymentWebhookEventDocument>(
    "PaymentWebhookEvent",
    paymentWebhookEventSchema,
  );
