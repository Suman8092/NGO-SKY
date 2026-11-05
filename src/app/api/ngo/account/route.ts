import { DonationModel } from "@/models/Donation";
import { NgoRecordModel, NgoDeliveryModel } from "@/models/NgoRecord";
import { verifiedAccount, requireNgoDatabase } from "@/lib/server/ngo/access";
import { serializeRecord } from "@/lib/server/ngo/records";
import { errorResponse, getRequestId, jsonSuccess } from "@/lib/server/http";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const { actor, email } = await verifiedAccount();
    await requireNgoDatabase();
    const own = await NgoRecordModel.find({
      $or: [
        { ownerId: actor.id },
        { ownerId: { $in: [null, ""] }, "data.email": email },
      ],
      deletedAt: null,
      module: {
        $in: [
          "members",
          "renewals",
          "registrations",
          "applications",
          "documents",
          "certificates",
          "letters",
          "complaints",
          "membership-payments",
          "enquiry-replies",
        ],
      },
    })
      .sort({ createdAt: -1 })
      .limit(250);
    const member = own.find((d) => d.module === "members");
    const messages =
      member?.status === "approved"
        ? await NgoRecordModel.find({
            module: "messages",
            status: "published",
            deletedAt: null,
            $or: [
              { "data.audience": "all-members" },
              { "data.member": member._id.toString() },
            ],
          })
            .sort({ createdAt: -1 })
            .limit(50)
        : [];
    const news = await NgoRecordModel.find({
      module: "news",
      status: "published",
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .limit(10);
    const referralMembers = member
      ? await NgoRecordModel.countDocuments({
          module: "members",
          "data.referredBy": member._id.toString(),
          deletedAt: null,
        })
      : 0;
    const referrals = member
      ? await NgoRecordModel.aggregate([
          {
            $match: {
              module: "offline-donations",
              "data.referredBy": member._id.toString(),
              status: "confirmed",
              deletedAt: null,
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$data.amount", 100] } },
            },
          },
        ])
      : [];
    const onlineReferrals = member
      ? await DonationModel.aggregate([
          {
            $match: {
              status: "paid",
              currency: "INR",
              referredBy: member._id.toString(),
            },
          },
          {
            $group: {
              _id: null,
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
    const birthday =
      member?.status === "approved" &&
      String(member.data.dateOfBirth ?? "").slice(5) ===
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
          month: "2-digit",
          day: "2-digit",
        })
          .formatToParts(new Date())
          .filter((p) => p.type === "month" || p.type === "day")
          .map((p) => p.value)
          .join("-");
    const delivery = actor.admin
      ? await NgoDeliveryModel.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ])
      : [];
    return jsonSuccess({
      records: own.map(serializeRecord),
      messages: messages.map(serializeRecord),
      news: news.map(serializeRecord),
      coordinator: !!actor.coordinator,
      referralMembers,
      referralDonationMinor:
        Number(referrals[0]?.total ?? 0) +
        Number(onlineReferrals[0]?.total ?? 0),
      birthday,
      delivery,
    });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-account");
  }
}
