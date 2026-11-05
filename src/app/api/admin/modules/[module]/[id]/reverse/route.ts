import { z } from "zod";
import { ngoActor, requireNgoDatabase } from "@/lib/server/ngo/access";
import { financialModules } from "@/lib/server/ngo/records";
import { NgoRecordModel, NgoAuditModel } from "@/models/NgoRecord";
import {
  errorResponse,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
import { ApiError } from "@/lib/server/errors";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ module: string; id: string }> },
) {
  try {
    const actor = await ngoActor(true);
    const { module, id } = await params;
    if (!financialModules.has(module) || !/^[a-f0-9]{24}$/i.test(id))
      throw new ApiError(422, "INVALID_REVERSAL", "Choose a financial record.");
    const { reason, revision } = await parseJsonRequest(
      request,
      z
        .object({
          reason: z.string().trim().min(10).max(2000),
          revision: z.number().int().positive(),
        })
        .strict(),
    );
    const db = await requireNgoDatabase(),
      session = await db.startSession();
    try {
      await session.withTransaction(async () => {
        const record = await NgoRecordModel.findOne({
          _id: id,
          module,
          deletedAt: null,
          revision,
          status: { $in: ["confirmed", "approved"] },
        }).session(session);
        if (!record)
          throw new ApiError(
            409,
            "STALE_RECORD",
            "Reload the financial record before reversing it.",
          );
        if (
          ["razorpay", "phonepe", "payu"].includes(String(record.data.method))
        )
          throw new ApiError(
            409,
            "PROVIDER_REFUND_REQUIRED",
            "Gateway payments must be refunded and reconciled through the payment provider.",
          );
        record.status = "void";
        record.revision++;
        record.updatedBy = actor.id;
        record.data = {
          ...record.data,
          _reversalReason: reason,
          _reversedAt: new Date().toISOString(),
        };
        await record.save({ session });
        await NgoRecordModel.updateMany(
          { module: "documents", "data.source": id, status: "issued" },
          {
            $set: { status: "revoked", updatedBy: actor.id },
            $inc: { revision: 1 },
          },
          { session },
        );
        if (module === "membership-payments") {
          const source = await NgoRecordModel.findById(
            String(record.data.source),
          ).session(session);
          if (source && source.data._paymentReference === record.reference) {
            source.data = {
              ...source.data,
              _paymentStatus: "unpaid",
              _paymentReference: "",
            };
            if (source.module === "members") source.status = "pending";
            if (source.module === "renewals" && source.status === "approved") {
              const member = await NgoRecordModel.findById(
                String(source.data.member),
              ).session(session);
              if (
                !member ||
                member.data._lastRenewalId !== source._id.toString()
              )
                throw new ApiError(
                  409,
                  "LATER_RENEWAL_EXISTS",
                  "A later membership change exists. Review membership validity before reversing this renewal.",
                );
              member.data = {
                ...member.data,
                _expires: String(source.data._previousExpiry ?? ""),
                _lastRenewalId: "",
              };
              member.status = String(source.data._previousStatus ?? "expired");
              member.revision++;
              member.updatedBy = actor.id;
              await member.save({ session });
              source.status = "pending";
              await NgoRecordModel.updateMany(
                {
                  module: "documents",
                  "data.source": member._id.toString(),
                  status: "issued",
                },
                { $set: { status: "revoked" }, $inc: { revision: 1 } },
                { session },
              );
            }

            source.revision++;
            await source.save({ session });
            await NgoRecordModel.updateMany(
              {
                module: "documents",
                "data.source": source._id.toString(),
                status: "issued",
              },
              { $set: { status: "revoked" }, $inc: { revision: 1 } },
              { session },
            );
          }
        }
        await NgoAuditModel.create(
          [
            {
              actor: actor.id,
              action: "financial-reversal",
              module,
              recordId: id,
              reference: record.reference,
              fields: ["status:confirmed->void", reason],
            },
          ],
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
    return jsonSuccess({ reversed: true });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "financial-reversal");
  }
}
