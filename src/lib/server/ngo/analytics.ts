import "server-only";
import { NgoRecordModel } from "@/models/NgoRecord";
import { DonationModel } from "@/models/Donation";
import { serializeRecord } from "./records";
import { literalSearch } from "./validation";
import { ApiError } from "../errors";
import { requireNgoDatabase } from "./access";
export async function analyticsRows(
  module: string,
  p: URLSearchParams,
  exporting = false,
) {
  await requireNgoDatabase();
  const referrals = module === "member-referrals";
  const filter: Record<string, unknown> = {
    module: referrals ? "members" : "campaigns",
    deletedAt: null,
  };
  if (p.get("q")) {
    const rx = new RegExp(literalSearch(p.get("q")!.slice(0, 160)), "i");
    filter.$or = [{ reference: rx }, { "data.name": rx }];
  }
  if (p.get("status")) filter.status = p.get("status");
  const total = await NgoRecordModel.countDocuments(filter);
  if (exporting && total > 10000)
    throw new ApiError(
      422,
      "REPORT_TOO_LARGE",
      "Narrow this report to 10,000 records.",
    );
  const page = Math.max(1, Math.min(10000, Number(p.get("page")) || 1));
  const docs = await NgoRecordModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(exporting ? 0 : (page - 1) * 25)
    .limit(exporting ? 10000 : 25);
  const ids = docs.map((d) => d._id.toString());
  const date: Record<string, Date> = {};
  for (const [k, op] of [
    ["from", "$gte"],
    ["to", "$lte"],
  ]) {
    const value = p.get(k);
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value))
      date[op] = new Date(
        `${value}T${k === "to" ? "23:59:59.999" : "00:00:00.000"}Z`,
      );
  }
  const within = Object.keys(date).length ? { createdAt: date } : {};
  const field = referrals ? "referredBy" : "campaign";
  const [offline, online, members] = await Promise.all([
    NgoRecordModel.find({
      module: "offline-donations",
      status: "confirmed",
      deletedAt: null,
      [`data.${field}`]: { $in: ids },
      ...within,
    })
      .select("data")
      .lean(),
    DonationModel.find({
      status: "paid",
      currency: "INR",
      [referrals ? "referredBy" : "campaignId"]: { $in: ids },
      ...within,
    })
      .select("amountMinor refundedAmountMinor donor campaignId referredBy")
      .lean(),
    referrals
      ? NgoRecordModel.find({
          module: "members",
          deletedAt: null,
          "data.referredBy": { $in: ids },
          ...within,
        })
          .select("data.referredBy")
          .lean()
      : Promise.resolve([]),
  ]);
  const totals = new Map(
    ids.map((id) => [
      id,
      { amountMinor: 0, members: 0, donors: new Set<string>() },
    ]),
  );
  for (const d of offline) {
    const t = totals.get(String(d.data[field]));
    if (t) {
      t.amountMinor += Math.round(Number(d.data.amount) * 100);
      t.donors.add(String(d.data.email || d.data.phone || d._id).toLowerCase());
    }
  }
  for (const d of online) {
    const t = totals.get(String(referrals ? d.referredBy : d.campaignId));
    if (t) {
      t.amountMinor += Math.max(
        0,
        d.amountMinor - (d.refundedAmountMinor ?? 0),
      );
      t.donors.add(
        String(d.donor.email || d.donor.phone || d._id).toLowerCase(),
      );
    }
  }
  for (const m of members) {
    const t = totals.get(String(m.data.referredBy));
    if (t) t.members++;
  }
  return {
    total,
    page,
    rows: docs.map((d) => {
      const t = totals.get(d._id.toString())!;
      const goal = Number(d.data.goal ?? 0);
      return {
        ...serializeRecord(d),
        module,
        data: {
          name: String(d.data.name),
          amount: t.amountMinor / 100,
          donors: t.donors.size,
          ...(referrals
            ? { members: t.members }
            : {
                goal,
                remaining: Math.max(0, goal - t.amountMinor / 100),
                progress: goal > 0 ? Math.round(t.amountMinor / goal) : 0,
              }),
        },
      };
    }),
  };
}
