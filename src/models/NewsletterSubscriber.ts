import { type Model, type Types, Schema, model, models } from "mongoose";

export interface NewsletterSubscriberDocument {
  _id: Types.ObjectId;
  email: string;
  name?: string;
  source: string;
  consent: true;
  status: "active" | "unsubscribed" | "bounced" | "complained";
  subscribedAt: Date;
  unsubscribedAt?: Date;
  requestId: string;
  ipHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSubscriberSchema = new Schema<NewsletterSubscriberDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    name: { type: String, trim: true, maxlength: 100 },
    source: { type: String, trim: true, maxlength: 80, default: "website" },
    consent: { type: Boolean, required: true },
    status: {
      type: String,
      enum: ["active", "unsubscribed", "bounced", "complained"],
      default: "active",
      required: true,
    },
    subscribedAt: { type: Date, required: true, default: Date.now },
    unsubscribedAt: Date,
    requestId: { type: String, required: true, maxlength: 100 },
    ipHash: { type: String, maxlength: 64 },
  },
  { timestamps: true, versionKey: false },
);

newsletterSubscriberSchema.index({ status: 1, subscribedAt: -1 });

export const NewsletterSubscriberModel =
  (models.NewsletterSubscriber as
    Model<NewsletterSubscriberDocument> | undefined) ??
  model<NewsletterSubscriberDocument>(
    "NewsletterSubscriber",
    newsletterSubscriberSchema,
  );
