import "server-only";
import { NgoRecordModel } from "@/models/NgoRecord";
import { DonationModel } from "@/models/Donation";
import { requireNgoDatabase } from "./access";
export async function projectAccounting(ids: string[]) {
  await requireNgoDatabase();
  if (!ids.length)
    return {} as Record<
      string,
      {
        incomeMinor: number;
        expenseMinor: number;
        categories: Array<{ category: string; amountMinor: number }>;
      }
    >;
  const [entries, campaigns] = await Promise.all([
    NgoRecordModel.find({
      module: { $in: ["offline-donations", "project-funds", "expenses"] },
      "data.project": { $in: ids },
      deletedAt: null,
      "data._provisional": { $ne: true },
      status: { $in: ["confirmed", "approved"] },
    }).lean(),
    NgoRecordModel.find({
      module: "campaigns",
      "data.project": { $in: ids },
      deletedAt: null,
    })
      .select("data.project")
      .lean(),
  ]);
  const totals = Object.fromEntries(
    ids.map((id) => [
      id,
      {
        incomeMinor: 0,
        expenseMinor: 0,
        categories: [] as Array<{ category: string; amountMinor: number }>,
      },
    ]),
  );
  const categories = new Map<string, Map<string, number>>();
  for (const e of entries) {
    const id = String(e.data.project),
      amount = Math.round(Number(e.data.amount) * 100);
    if (!totals[id]) continue;
    if (e.module === "expenses" && e.status === "approved") {
      totals[id].expenseMinor += amount;
      const group = categories.get(id) ?? new Map<string, number>();
      const category = String(e.data.category || "Other");
      group.set(category, (group.get(category) ?? 0) + amount);
      categories.set(id, group);
    } else if (e.module !== "expenses" && e.status === "confirmed")
      totals[id].incomeMinor += amount;
  }
  if (campaigns.length) {
    const online = await DonationModel.aggregate([
      {
        $match: {
          campaignId: { $in: campaigns.map((c) => c._id.toString()) },
          status: "paid",
          currency: "INR",
        },
      },
      {
        $group: {
          _id: "$campaignId",
          amount: {
            $sum: {
              $subtract: [
                "$amountMinor",
                { $ifNull: ["$refundedAmountMinor", 0] },
              ],
            },
          },
        },
      },
    ]);
    const mapping = new Map(
      campaigns.map((c) => [c._id.toString(), String(c.data.project)]),
    );
    for (const row of online) {
      const id = mapping.get(String(row._id));
      if (id && totals[id]) totals[id].incomeMinor += Number(row.amount);
    }
  }
  for (const [id, groups] of categories)
    totals[id].categories = [...groups].map(([category, amountMinor]) => ({
      category,
      amountMinor,
    }));
  return totals;
}
