import { Schema, model, models, type Model, type Types } from "mongoose";
export interface NgoDocument {
  _id: Types.ObjectId;
  module: string;
  reference: string;
  identityKey?: string;
  status: string;
  ownerId?: string;
  data: Record<string, string | number | boolean>;
  revision: number;
  verifyToken: string;
  downloadToken: string;
  createdBy: string;
  updatedBy: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
const schema = new Schema<NgoDocument>(
  {
    module: { type: String, required: true, index: true },
    reference: { type: String, required: true, unique: true },
    identityKey: { type: String, unique: true, sparse: true },
    status: { type: String, required: true },
    ownerId: { type: String, index: true },
    data: { type: Schema.Types.Mixed, required: true },
    revision: { type: Number, default: 1 },
    verifyToken: { type: String, required: true, unique: true },
    downloadToken: { type: String, required: true, unique: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedAt: Date,
  },
  { timestamps: true, minimize: false },
);
schema.index({ module: 1, deletedAt: 1, createdAt: -1 });
schema.index({ module: 1, ownerId: 1, deletedAt: 1 });
schema.index({ module: 1, "data.accountUserId": 1 }, { sparse: true });
export const NgoRecordModel =
  (models.NgoRecord as Model<NgoDocument> | undefined) ??
  model<NgoDocument>("NgoRecord", schema);
export interface NgoAudit {
  _id: Types.ObjectId;
  actor: string;
  action: string;
  module: string;
  recordId: string;
  reference: string;
  fields: string[];
  createdAt: Date;
}
const audit = new Schema<NgoAudit>({
  actor: String,
  action: String,
  module: String,
  recordId: String,
  reference: String,
  fields: [String],
  createdAt: { type: Date, default: Date.now },
});
audit.index({ createdAt: -1 });
export const NgoAuditModel =
  (models.NgoAudit as Model<NgoAudit> | undefined) ??
  model<NgoAudit>("NgoAudit", audit);
export interface NgoDelivery {
  _id: Types.ObjectId;
  key: string;
  to: string;
  subject: string;
  text: string;
  documentId?: string;
  status: "pending" | "sending" | "sent" | "failed";
  attempts: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}
const delivery = new Schema<NgoDelivery>(
  {
    key: { type: String, unique: true },
    to: String,
    subject: String,
    text: String,
    documentId: String,
    status: { type: String, default: "pending" },
    attempts: { type: Number, default: 0 },
    error: String,
  },
  { timestamps: true },
);
delivery.index({ status: 1, updatedAt: 1 });
export const NgoDeliveryModel =
  (models.NgoDelivery as Model<NgoDelivery> | undefined) ??
  model<NgoDelivery>("NgoDelivery", delivery);
