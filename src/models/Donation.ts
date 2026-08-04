import { type Model, type Types, Schema, model, models } from "mongoose";

export type DonationStatus = "pending" | "processing" | "paid" | "failed" | "refunded" | "cancelled";
export type PaymentProvider = "stripe" | "razorpay";

export interface DonationDocument {
  _id: Types.ObjectId;
  amountMinor: number;
  currency: "INR" | "USD" | "EUR" | "GBP";
  frequency: "one_time" | "monthly" | "yearly";
  provider: PaymentProvider;
  campaignId?: string;
  donor: {
    name: string;
    email: string;
    phone?: string;
    country?: string;
    taxIdLast4?: string;
  };
  anonymous: boolean;
  message?: string;
  consent: true;
  status: DonationStatus;
  idempotencyKey?: string;
  externalOrderId?: string;
  externalSessionId?: string;
  externalPaymentId?: string;
  failureCode?: string;
  paidAt?: Date;
  requestId: string;
  ipHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const donationSchema = new Schema<DonationDocument>(
  {
    amountMinor: { type: Number, required: true, min: 100, max: 1_000_000_000 },
    currency: { type: String, enum: ["INR", "USD", "EUR", "GBP"], required: true },
    frequency: { type: String, enum: ["one_time", "monthly", "yearly"], required: true },
    provider: { type: String, enum: ["stripe", "razorpay"], required: true },
    campaignId: { type: String, trim: true, maxlength: 100 },
    donor: {
      name: { type: String, required: true, trim: true, maxlength: 120 },
      email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
      phone: { type: String, trim: true, maxlength: 20 },
      country: { type: String, trim: true, maxlength: 100 },
      taxIdLast4: { type: String, maxlength: 4, select: false },
    },
    anonymous: { type: Boolean, required: true, default: false },
    message: { type: String, trim: true, maxlength: 500 },
    consent: { type: Boolean, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "failed", "refunded", "cancelled"],
      default: "pending",
      required: true,
    },
    idempotencyKey: { type: String, trim: true, maxlength: 100 },
    externalOrderId: { type: String, maxlength: 120 },
    externalSessionId: { type: String, maxlength: 120 },
    externalPaymentId: { type: String, maxlength: 120 },
    failureCode: { type: String, maxlength: 100 },
    paidAt: Date,
    requestId: { type: String, required: true, maxlength: 100 },
    ipHash: { type: String, maxlength: 64 },
  },
  { timestamps: true, versionKey: false },
);

donationSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
donationSchema.index({ "donor.email": 1, createdAt: -1 });
donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ externalOrderId: 1 }, { sparse: true });
donationSchema.index({ externalSessionId: 1 }, { sparse: true });
donationSchema.index({ externalPaymentId: 1 }, { sparse: true });

export const DonationModel =
  (models.Donation as Model<DonationDocument> | undefined) ??
  model<DonationDocument>("Donation", donationSchema);
