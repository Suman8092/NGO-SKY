import { z } from "zod";
import { NgoRecordModel } from "@/models/NgoRecord";
import { ngoActor, requireNgoDatabase } from "@/lib/server/ngo/access";
import {
  recordInput,
  serializeRecord,
  queueEmail,
} from "@/lib/server/ngo/records";
import {
  errorResponse,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
import { ApiError } from "@/lib/server/errors";
export const dynamic = "force-dynamic";
async function context(id: string) {
  if (!/^[a-f0-9]{24}$/i.test(id))
    throw new ApiError(404, "NOT_FOUND", "Case not found.");
  const actor = await ngoActor();
  await requireNgoDatabase();
  const record = await NgoRecordModel.findOne({
    _id: id,
    module: "complaints",
    deletedAt: null,
  });
  if (!record || (!actor.admin && record.ownerId !== actor.id))
    throw new ApiError(403, "FORBIDDEN", "This case is private.");
  return { actor, record };
}
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await context(id);
    const replies = await NgoRecordModel.find({
      module: "case-replies",
      "data.case": id,
      deletedAt: null,
    })
      .sort({ createdAt: 1 })
      .limit(100);
    return jsonSuccess(replies.map(serializeRecord));
  } catch (e) {
    return errorResponse(e, getRequestId(request), "case-read");
  }
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { actor, record } = await context(id);
    const { content } = await parseJsonRequest(
      request,
      z.object({ content: z.string().trim().min(1).max(10000) }).strict(),
    );
    const doc = await NgoRecordModel.create(
      recordInput(
        "case-replies",
        {
          case: id,
          content,
          author: actor.admin ? "Foundation team" : "Applicant",
        },
        "published",
        actor.id,
        record.ownerId,
      ),
    );
    if (actor.admin)
      await queueEmail(
        `reply:${doc._id}`,
        String(record.data.email),
        `Reply to ${record.reference}`,
        content,
      );
    return jsonSuccess(serializeRecord(doc), { status: 201 });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "case-reply");
  }
}
