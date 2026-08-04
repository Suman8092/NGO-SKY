import { type Model, type Types, Schema, model, models } from "mongoose";

export interface ContactSubmissionDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  consent: true;
  status: "new" | "read" | "resolved" | "spam";
  requestId: string;
  ipHash?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactSubmissionSchema = new Schema<ContactSubmissionDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    phone: { type: String, trim: true, maxlength: 20 },
    subject: { type: String, required: true, trim: true, maxlength: 140 },
    message: { type: String, required: true, trim: true, maxlength: 5_000 },
    consent: { type: Boolean, required: true },
    status: {
      type: String,
      enum: ["new", "read", "resolved", "spam"],
      default: "new",
      required: true,
    },
    requestId: { type: String, required: true, maxlength: 100 },
    ipHash: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 300 },
  },
  { timestamps: true, versionKey: false },
);

contactSubmissionSchema.index({ email: 1, createdAt: -1 });
contactSubmissionSchema.index({ status: 1, createdAt: -1 });

export const ContactSubmissionModel =
  (models.ContactSubmission as Model<ContactSubmissionDocument> | undefined) ??
  model<ContactSubmissionDocument>(
    "ContactSubmission",
    contactSubmissionSchema,
  );
