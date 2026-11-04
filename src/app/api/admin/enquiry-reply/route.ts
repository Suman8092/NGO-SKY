import { z } from "zod";
import { after } from "next/server";
import { ContactSubmissionModel } from "@/models/ContactSubmission";
import { NgoRecordModel, NgoAuditModel } from "@/models/NgoRecord";
import { ngoActor, requireNgoDatabase } from "@/lib/server/ngo/access";
import { queueEmail, recordInput } from "@/lib/server/ngo/records";
import { processNgoOutbox } from "@/lib/server/ngo/jobs";
import {
  errorResponse,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
import { ApiError } from "@/lib/server/errors";
export async function POST(request: Request) {
  try {
    const actor = await ngoActor(true);
    const input = await parseJsonRequest(
      request,
      z
        .object({
          id: z.string().regex(/^[a-f0-9]{24}$/i),
          content: z.string().trim().min(1).max(10000),
        })
        .strict(),
    );
    const db = await requireNgoDatabase(),
      session = await db.startSession();
    let reference = "";
    try {
      await session.withTransaction(async () => {
        const contact = await ContactSubmissionModel.findById(input.id).session(
          session,
        );
        if (!contact)
          throw new ApiError(404, "NOT_FOUND", "Enquiry not found.");
        const [reply] = await NgoRecordModel.create(
          [
            recordInput(
              "enquiry-replies",
              {
                name: contact.subject,
                email: contact.email,
                contact: input.id,
                content: input.content,
              },
              "published",
              actor.id,
            ),
          ],
          { session },
        );
        await queueEmail(
          `enquiry:${reply._id}`,
          contact.email,
          `Re: ${contact.subject}`,
          input.content,
          undefined,
          session,
        );
        if (contact.status === "new") {
          contact.status = "read";
          await contact.save({ session });
        }
        await NgoAuditModel.create(
          [
            {
              actor: actor.id,
              action: "enquiry-reply",
              module: "enquiry-replies",
              recordId: reply._id.toString(),
              reference: reply.reference,
              fields: ["content"],
            },
          ],
          { session },
        );
        reference = reply.reference;
      });
    } finally {
      await session.endSession();
    }
    after(async () => {
      await processNgoOutbox(5).catch(() => undefined);
    });
    return jsonSuccess({ reference, email: "queued" });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "enquiry-reply");
  }
}
