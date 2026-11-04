import "server-only";
import { Types } from "mongoose";
import { DonationModel, type DonationDocument } from "@/models/Donation";
import { NgoRecordModel } from "@/models/NgoRecord";
import { literalSearch } from "./validation";
import type { NgoRecord } from "@/lib/ngo/catalog";
export async function onlineFilter(params: URLSearchParams) {
  const filter: Record<string, unknown> = {};
  const q = params.get("q")?.trim().slice(0, 160);
  if (q) {
    const rx = new RegExp(literalSearch(q), "i");
    const receipt = await NgoRecordModel.findOne({
      module: "documents",
      reference: q,
      "data.sourceModule": "online-donations",
    })
      .select("data.source")
      .lean();
    filter.$or = [
      { "donor.name": rx },
      { "donor.email": rx },
      { "donor.phone": rx },
      { externalPaymentId: rx },
      ...(Types.ObjectId.isValid(q) ? [{ _id: new Types.ObjectId(q) }] : []),
      ...(receipt && Types.ObjectId.isValid(String(receipt.data.source))
        ? [{ _id: new Types.ObjectId(String(receipt.data.source)) }]
        : []),
    ];
  }
  const status = params.get("status");
  if (
    status &&
    [
      "pending",
      "processing",
      "paid",
      "failed",
      "refunded",
      "cancelled",
    ].includes(status)
  )
    filter.status = status;
  const date: Record<string, Date> = {};
  const from = params.get("from"),
    to = params.get("to");
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) date.$gte = new Date(from);
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to))
    date.$lte = new Date(`${to}T23:59:59.999Z`);
  if (Object.keys(date).length) filter.createdAt = date;
  return filter;
}
export function onlineRecord(d: DonationDocument): NgoRecord {
  return {
    id: d._id.toString(),
    module: "online-donations",
    reference: `DON-${d._id}`,
    status: d.status,
    ownerId: d.accountUserId,
    revision: 1,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    data: {
      name: d.donor.name,
      email: d.donor.email,
      phone: d.donor.phone ?? "",
      amount: d.amountMinor / 100,
      currency: d.currency,
      provider: d.provider,
      transaction: d.externalPaymentId ?? d.externalOrderId ?? "",
      frequency: d.frequency,
      date: d.createdAt.toISOString().slice(0, 10),
      campaign: d.campaignId ?? "",
      referredBy: d.referredBy ?? "",
    },
  };
}
export async function listOnline(params: URLSearchParams) {
  const filter = await onlineFilter(params);
  const page = Math.min(10000, Math.max(1, Number(params.get("page")) || 1));
  const [docs, total] = await Promise.all([
    DonationModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * 25)
      .limit(25),
    DonationModel.countDocuments(filter),
  ]);
  return { rows: docs.map(onlineRecord), total, page };
}
