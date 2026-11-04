import { NgoRecordModel } from "@/models/NgoRecord";
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
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ module: string }> },
) {
  try {
    const actor = await ngoActor();
    const { module } = await params;
    await requireNgoDatabase();
    const p = new URL(request.url).searchParams;
    const filter = listFilter(module, p, actor);
    const page = Math.min(1000, Math.max(1, Number(p.get("page")) || 1));
    const [rows, total] = await Promise.all([
      NgoRecordModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * 25)
        .limit(25),
      NgoRecordModel.countDocuments(filter),
    ]);
    return jsonSuccess({ rows: rows.map(serializeRecord), total, page });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-field-list");
  }
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ module: string }> },
) {
  try {
    const actor = await ngoActor();
    const { module } = await params;
    const input = await parseJsonRequest(request, mutationEnvelope);
    return jsonSuccess(await saveRecord(module, input, actor), { status: 201 });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-field-write");
  }
}
