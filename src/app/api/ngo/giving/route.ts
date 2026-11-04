import { DonationModel } from "@/models/Donation";
import { NgoRecordModel } from "@/models/NgoRecord";
import { verifiedAccount, requireNgoDatabase } from "@/lib/server/ngo/access";
import { errorResponse, getRequestId, jsonSuccess } from "@/lib/server/http";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const { actor, email } = await verifiedAccount();
    await requireNgoDatabase();
    const params = new URL(request.url).searchParams;
    const page = Math.min(10000, Math.max(1, Number(params.get("page")) || 1));
    const pipeline: import("mongoose").PipelineStage[] = [
      {
        $match: {
          $or: [
            { accountUserId: actor.id },
            { accountUserId: { $in: [null, ""] }, "donor.email": email },
          ],
        },
      },
      {
        $project: {
          id: { $toString: "$_id" },
          reference: { $concat: ["DON-", { $toString: "$_id" }] },
          amountMinor: 1,
          currency: 1,
          status: 1,
          date: "$createdAt",
          method: "$provider",
          source: { $literal: "online" },
        },
      },
      {
        $unionWith: {
          coll: NgoRecordModel.collection.name,
          pipeline: [
            {
              $match: {
                module: "offline-donations",
                deletedAt: null,
                $or: [
                  { ownerId: actor.id },
                  { ownerId: { $in: [null, ""] }, "data.email": email },
                ],
              },
            },
            {
              $project: {
                id: { $toString: "$_id" },
                reference: 1,
                amountMinor: {
                  $round: [{ $multiply: ["$data.amount", 100] }, 0],
                },
                currency: { $literal: "INR" },
                status: {
                  $cond: [{ $eq: ["$status", "confirmed"] }, "paid", "$status"],
                },
                date: "$createdAt",
                method: "$data.method",
                source: { $literal: "offline" },
              },
            },
          ],
        },
      },
      { $sort: { date: -1, _id: -1 } },
      {
        $facet: {
          rows: [{ $skip: (page - 1) * 20 }, { $limit: 20 }],
          total: [{ $count: "count" }],
        },
      },
    ];
    const result = await DonationModel.aggregate(pipeline);
    return jsonSuccess({
      rows: result[0]?.rows ?? [],
      total: result[0]?.total[0]?.count ?? 0,
      page,
    });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "giving-history");
  }
}
