import { type Model, type Types, Schema, model, models } from "mongoose";

export type EventRegistrationStatus = "confirmed" | "attended" | "cancelled";

export interface EventRegistrationDocument {
  _id: Types.ObjectId;
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  eventLocation?: string;
  ticketCode: string;
  name: string;
  email: string;
  phone?: string;
  ticketsCount: number;
  notes?: string;
  accountUserId?: string;
  status: EventRegistrationStatus;
  consent: true;
  requestId: string;
  ipHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventRegistrationSchema = new Schema<EventRegistrationDocument>(
  {
    eventId: { type: String, required: true, trim: true, maxlength: 120 },
    eventTitle: { type: String, required: true, trim: true, maxlength: 200 },
    eventDate: { type: String, trim: true, maxlength: 100 },
    eventLocation: { type: String, trim: true, maxlength: 150 },
    ticketCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 30,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    phone: { type: String, trim: true, maxlength: 25 },
    ticketsCount: { type: Number, required: true, min: 1, max: 10, default: 1 },
    notes: { type: String, trim: true, maxlength: 1_000 },
    accountUserId: { type: String, trim: true, maxlength: 100 },
    status: {
      type: String,
      enum: ["confirmed", "attended", "cancelled"],
      default: "confirmed",
      required: true,
    },
    consent: { type: Boolean, required: true },
    requestId: { type: String, required: true, trim: true, maxlength: 100 },
    ipHash: { type: String, trim: true, maxlength: 64 },
  },
  {
    timestamps: true,
    collection: "event_registrations",
  },
);

eventRegistrationSchema.index({ eventId: 1, createdAt: -1 });
eventRegistrationSchema.index({ email: 1, createdAt: -1 });
eventRegistrationSchema.index({ accountUserId: 1, createdAt: -1 });

export const EventRegistrationModel: Model<EventRegistrationDocument> =
  models.EventRegistration ||
  model<EventRegistrationDocument>("EventRegistration", eventRegistrationSchema);
