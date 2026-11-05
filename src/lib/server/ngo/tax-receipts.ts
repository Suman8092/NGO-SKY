import "server-only";
import { NgoRecordModel } from "@/models/NgoRecord";
import type { ClientSession } from "mongoose";
export function taxReceiptEligibility(
  approval: {
    status: string;
    data: Record<string, string | number | boolean>;
  } | null,
  date: string,
  amountMinor: number,
  method: string,
): Record<string, string> {
  if (
    !approval ||
    approval.status !== "active" ||
    approval.data.verified !== true ||
    String(approval.data.startDate) > date ||
    String(approval.data.endDate) < date ||
    (method === "cash" && amountMinor > 200000)
  )
    return {};
  return {
    _taxPan: String(approval.data.pan),
    _taxApproval: String(approval.data.approvalNumber),
    _taxValidUntil: String(approval.data.endDate),
  };
}
export async function taxReceiptSnapshot(
  date: string,
  amountMinor: number,
  method: string,
  session?: ClientSession,
) {
  const org = await NgoRecordModel.findOne({
    module: "organization",
    status: "active",
    deletedAt: null,
  })
    .select("data.address data.signatory")
    .session(session ?? null)
    .lean();
  if (!org?.data.address || !org.data.signatory) return {};
  const approval = await NgoRecordModel.findOne({
    module: "tax-approvals",
    status: "active",
    deletedAt: null,
    "data.startDate": { $lte: date },
    "data.endDate": { $gte: date },
  })
    .session(session ?? null)
    .lean();
  return taxReceiptEligibility(approval, date, amountMinor, method);
}
