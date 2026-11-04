import { after } from "next/server";
import { processNgoOutbox } from "@/lib/server/ngo/jobs";
import { listOnline } from "@/lib/server/ngo/online-records";
import { getModule } from "@/lib/ngo/catalog";
import { NgoAuditModel, NgoRecordModel } from "@/models/NgoRecord";
import { ngoActor, requireNgoDatabase } from "@/lib/server/ngo/access";
import {
  listFilter,
  saveRecord,
  serializeRecord,
} from "@/lib/server/ngo/records";
import { mutationEnvelope } from "@/lib/server/ngo/validation";
import {
  errorResponse,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
import { ApiError } from "@/lib/server/errors";
import { enforceRateLimit } from "@/lib/server/rate-limit";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ module: string }> },
) {
  try {
    const actor = await ngoActor(true);
    const { module } = await params;
    if (!getModule(module))
      throw new ApiError(404, "NOT_FOUND", "Module not found.");
    await requireNgoDatabase();
    const p = new URL(request.url).searchParams;
    const page = Math.min(10000, Math.max(1, Number(p.get("page")) || 1));
    if (module === "online-donations") return jsonSuccess(await listOnline(p));
    if (module === "audit") {
      const [rows, total] = await Promise.all([
        NgoAuditModel.find({})
          .sort({ createdAt: -1 })
          .skip((page - 1) * 25)
          .limit(25)
          .lean(),
        NgoAuditModel.countDocuments({}),
      ]);
      return jsonSuccess({
        rows: rows.map((r) => ({
          id: r._id.toString(),
          module: "audit",
          reference: r.reference,
          status: "recorded",
          revision: 1,
          data: {
            name: r.action,
            actor: r.actor,
            module: r.module,
            record: r.recordId,
            fields: r.fields.join(", "),
          },
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.createdAt.toISOString(),
        })),
        total,
        page,
      });
    }
    const filter = listFilter(module, p, actor);
    const [rows, total] = await Promise.all([
      NgoRecordModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * 25)
        .limit(25),
      NgoRecordModel.countDocuments(filter),
    ]);
    return jsonSuccess({ rows: rows.map(serializeRecord), total, page });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-module-list");
  }
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ module: string }> },
) {
  try {
    const actor = await ngoActor(true);
    const { module } = await params;
    await enforceRateLimit("ngo-admin-write", actor.id, {
      limit: 120,
      windowMs: 60000,
    });
    const input = await parseJsonRequest(request, mutationEnvelope);
    const saved = await saveRecord(module, input, actor);
    after(async () => {
      await processNgoOutbox(5).catch(() => undefined);
    });
    return jsonSuccess(saved, { status: 201 });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-module-create");
  }
}
