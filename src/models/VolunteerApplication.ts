import { type Model, type Types, Schema, model, models } from "mongoose";

export interface VolunteerApplicationDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  areaOfInterest: string;
  skills: string[];
  availability:
    "weekdays" | "weekends" | "evenings" | "flexible" | "event_based";
  motivation: string;
  experience?: string;
  consent: true;
  status: "submitted" | "reviewing" | "approved" | "rejected";
  requestId: string;
  ipHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const volunteerApplicationSchema = new Schema<VolunteerApplicationDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    country: { type: String, required: true, trim: true, maxlength: 100 },
    areaOfInterest: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    skills: { type: [String], default: [] },
    availability: {
      type: String,
      enum: ["weekdays", "weekends", "evenings", "flexible", "event_based"],
      required: true,
    },
    motivation: { type: String, required: true, trim: true, maxlength: 3_000 },
    experience: { type: String, trim: true, maxlength: 2_000 },
    consent: { type: Boolean, required: true },
    status: {
      type: String,
      enum: ["submitted", "reviewing", "approved", "rejected"],
      default: "submitted",
      required: true,
    },
    requestId: { type: String, required: true, maxlength: 100 },
    ipHash: { type: String, maxlength: 64 },
  },
  { timestamps: true, versionKey: false },
);

volunteerApplicationSchema.index({ email: 1, createdAt: -1 });
volunteerApplicationSchema.index({
  status: 1,
  areaOfInterest: 1,
  createdAt: -1,
});

export const VolunteerApplicationModel =
  (models.VolunteerApplication as
    Model<VolunteerApplicationDocument> | undefined) ??
  model<VolunteerApplicationDocument>(
    "VolunteerApplication",
    volunteerApplicationSchema,
  );
