import { z } from "zod";
import { NgoDeliveryModel, NgoRecordModel } from "@/models/NgoRecord";
import { ngoActor, requireNgoDatabase } from "@/lib/server/ngo/access";
import { processNgoOutbox } from "@/lib/server/ngo/jobs";
import { queueEmail } from "@/lib/server/ngo/records";
import {
  errorResponse,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
import { ApiError } from "@/lib/server/errors";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: Request) {
  try {
    await ngoActor(true);
    await requireNgoDatabase();
    const rows = await NgoDeliveryModel.find({})
      .select("subject status attempts error createdAt documentId")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return jsonSuccess(rows.map((r) => ({ ...r, _id: r._id.toString() })));
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-delivery-list");
  }
}
export async function POST(request: Request) {
  try {
    await ngoActor(true);
    const input = await parseJsonRequest(
      request,
      z
        .object({
          action: z.enum(["process", "resend"]),
          id: z
            .string()
            .regex(/^[a-f0-9]{24}$/i)
            .optional(),
        })
        .strict(),
    );
    await requireNgoDatabase();
    if (input.action === "resend") {
      const doc = input.id
        ? await NgoRecordModel.findOne({
            _id: input.id,
            module: { $in: ["documents", "certificates", "letters"] },
            status: "issued",
            deletedAt: null,
          })
        : null;
      if (!doc)
        throw new ApiError(404, "NOT_FOUND", "Issued document not found.");
      await queueEmail(
        `resend:${doc._id}:${Date.now()}`,
        String(doc.data.email),
        `Skymeredian Foundation: ${doc.reference}`,
        "Your requested document is attached.",
        doc._id.toString(),
      );
    }
    return jsonSuccess(await processNgoOutbox(10));
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-delivery");
  }
}
