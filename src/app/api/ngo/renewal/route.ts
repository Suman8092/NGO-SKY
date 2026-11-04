import { z } from "zod";
import { verifiedAccount, requireNgoDatabase } from "@/lib/server/ngo/access";
import { saveRecord } from "@/lib/server/ngo/records";
import { NgoRecordModel } from "@/models/NgoRecord";
import { ApiError } from "@/lib/server/errors";
import {
  errorResponse,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
export async function POST(request: Request) {
  try {
    const { actor, email } = await verifiedAccount();
    await enforceRateLimit("membership-renewal", actor.id, {
      limit: 5,
      windowMs: 3600000,
    });
    const input = await parseJsonRequest(
      request,
      z.object({ designation: z.string().min(1).max(120) }).strict(),
    );
    await requireNgoDatabase();
    const member = await NgoRecordModel.findOne({
      module: "members",
      deletedAt: null,
      $or: [
        { ownerId: actor.id },
        { ownerId: { $in: [null, ""] }, "data.email": email },
      ],
    });
    if (!member || !["approved", "expired"].includes(member.status))
      throw new ApiError(
        409,
        "MEMBER_NOT_ELIGIBLE",
        "Only an approved or expired membership can be renewed.",
      );
    const designation = await NgoRecordModel.findOne({
      module: "designations",
      status: "active",
      deletedAt: null,
      $or: [
        { reference: input.designation },
        ...(/^[a-f0-9]{24}$/i.test(input.designation)
          ? [{ _id: input.designation }]
          : []),
      ],
    });
    if (!designation)
      throw new ApiError(
        409,
        "DESIGNATION_UNAVAILABLE",
        "Choose an active membership category.",
      );
    const result = await saveRecord(
      "renewals",
      {
        status: "pending",
        data: {
          name: String(member.data.name),
          email,
          member: member._id.toString(),
          designation: designation._id.toString(),
          notes: "Renewal requested by verified member.",
        },
      },
      { id: actor.id, admin: true },
    );
    return jsonSuccess(result, { status: 201 });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "membership-renewal");
  }
}
