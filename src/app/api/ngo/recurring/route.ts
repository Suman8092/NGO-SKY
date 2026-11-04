import { z } from "zod";
import {
  verifiedAccount,
  ngoActor,
  requireNgoDatabase,
} from "@/lib/server/ngo/access";
import { createRecurring, manageRecurring } from "@/lib/server/ngo/payments";
import { NgoRecordModel } from "@/models/NgoRecord";
import { serializeRecord } from "@/lib/server/ngo/records";
import {
  errorResponse,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const actor = await ngoActor();
    await requireNgoDatabase();
    const records = await NgoRecordModel.find({
      module: "recurring-donations",
      ownerId: actor.id,
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .limit(50);
    return jsonSuccess(records.map(serializeRecord));
  } catch (e) {
    return errorResponse(e, getRequestId(request), "recurring-list");
  }
}
export async function POST(request: Request) {
  try {
    const { actor, email, name } = await verifiedAccount();
    await enforceRateLimit("recurring-create", actor.id, {
      limit: 3,
      windowMs: 3600000,
    });
    const { amount } = await parseJsonRequest(
      request,
      z
        .object({
          amount: z.number().int().min(100).max(1000000),
          consent: z.literal(true),
        })
        .strict(),
    );
    return jsonSuccess(await createRecurring(amount, actor, email, name));
  } catch (e) {
    return errorResponse(e, getRequestId(request), "recurring-create");
  }
}
export async function PATCH(request: Request) {
  try {
    const actor = await ngoActor();
    const input = await parseJsonRequest(
      request,
      z
        .object({
          id: z.string().regex(/^[a-f0-9]{24}$/i),
          action: z.enum(["pause", "resume", "cancel"]),
        })
        .strict(),
    );
    return jsonSuccess(await manageRecurring(input.id, input.action, actor));
  } catch (e) {
    return errorResponse(e, getRequestId(request), "recurring-action");
  }
}
