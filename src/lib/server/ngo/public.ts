import "server-only";
import { projectAccounting } from "./project-accounting";
import { DonationModel } from "@/models/Donation";
import { NgoRecordModel } from "@/models/NgoRecord";
import { getModule } from "@/lib/ngo/catalog";
import { requireNgoDatabase } from "./access";
export async function publishedRecords(module: string) {
  if (!getModule(module)?.public) return [];
  await requireNgoDatabase();
  const docs = await NgoRecordModel.find({
    module,
    status: { $in: ["published", "active", "completed", "open"] },
    deletedAt: null,
    ...(module === "projects" ? { "data.publish": true } : {}),
  })
    .sort({ "data.order": 1, createdAt: -1 })
    .limit(100)
    .lean();
  const donations =
    module === "campaigns"
      ? await NgoRecordModel.aggregate([
          {
            $match: {
              module: "offline-donations",
              status: "confirmed",
              deletedAt: null,
            },
          },
          {
            $group: {
              _id: "$data.campaign",
              total: { $sum: { $multiply: ["$data.amount", 100] } },
            },
          },
        ])
      : [];
  const online =
    module === "campaigns"
      ? await DonationModel.aggregate([
          {
            $match: {
              status: "paid",
              currency: "INR",
              campaignId: { $exists: true },
            },
          },
          {
            $group: {
              _id: "$campaignId",
              total: {
                $sum: {
                  $subtract: [
                    "$amountMinor",
                    { $ifNull: ["$refundedAmountMinor", 0] },
                  ],
                },
              },
            },
          },
        ])
      : [];
  const totals = new Map(
    donations.map((d) => [String(d._id), Number(d.total)]),
  );
  for (const item of online)
    totals.set(
      String(item._id),
      (totals.get(String(item._id)) ?? 0) + Number(item.total),
    );
  const accounting =
    module === "projects"
      ? await projectAccounting(docs.map((d) => d._id.toString()))
      : {};
  return docs.map((d) => ({
    accounting: accounting[d._id.toString()],
    id: d._id.toString(),
    reference: d.reference,
    status: d.status,
    data: Object.fromEntries(
      Object.entries(d.data).filter(([key]) => !key.startsWith("_")),
    ),
    raisedMinor: totals.get(d._id.toString()) ?? 0,
  }));
}
