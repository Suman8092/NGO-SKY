import { type Model, type Types, Schema, model, models } from "mongoose";

export interface DonorProfileDocument {
  _id: Types.ObjectId;
  accountUserId: string;
  email: string;
  legalName: string;
  panNumber: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const donorProfileSchema = new Schema<DonorProfileDocument>(
  {
    accountUserId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    legalName: { type: String, required: true, trim: true, maxlength: 120 },
    panNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 10,
    },
    address: { type: String, trim: true, maxlength: 300 },
    city: { type: String, trim: true, maxlength: 100 },
    state: { type: String, trim: true, maxlength: 100 },
    pincode: { type: String, trim: true, maxlength: 10 },
  },
  {
    timestamps: true,
    collection: "donor_profiles",
  },
);

donorProfileSchema.index({ email: 1 });

export const DonorProfileModel: Model<DonorProfileDocument> =
  models.DonorProfile ||
  model<DonorProfileDocument>("DonorProfile", donorProfileSchema);

