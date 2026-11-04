import { after } from "next/server";
import { processNgoOutbox } from "@/lib/server/ngo/jobs";
import { z } from "zod";
import { ngoActor } from "@/lib/server/ngo/access";
import { archiveRecord, saveRecord } from "@/lib/server/ngo/records";
import { mutationEnvelope, recordId } from "@/lib/server/ngo/validation";
import {
  errorResponse,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
export const dynamic = "force-dynamic";
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ module: string; id: string }> },
) {
  try {
    const actor = await ngoActor(true);
    const { module, id } = await params;
    recordId.parse(id);
    const input = await parseJsonRequest(request, mutationEnvelope);
    const saved = await saveRecord(module, input, actor, id);
    after(async () => {
      await processNgoOutbox(5).catch(() => undefined);
    });
    return jsonSuccess(saved);
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-module-update");
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ module: string; id: string }> },
) {
  try {
    const actor = await ngoActor(true);
    const { module, id } = await params;
    recordId.parse(id);
    const { revision } = await parseJsonRequest(
      request,
      z.object({ revision: z.number().int().positive() }).strict(),
    );
    await archiveRecord(module, id, revision, actor);
    return jsonSuccess({ archived: true });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-module-archive");
  }
}
