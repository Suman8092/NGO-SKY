import { createHash } from "node:crypto";
import { getModule } from "@/lib/ngo/catalog";
import { NgoRecordModel, NgoAuditModel } from "@/models/NgoRecord";
import { ngoActor, requireNgoDatabase } from "@/lib/server/ngo/access";
import { listFilter } from "@/lib/server/ngo/records";
import { errorResponse, getRequestId } from "@/lib/server/http";
import { ApiError } from "@/lib/server/errors";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const actor = await ngoActor(true);
    await requireNgoDatabase();
    const p = new URL(request.url).searchParams,
      moduleKey = p.get("module") ?? "";
    if (
      !getModule(moduleKey) ||
      ["audit", "online-donations"].includes(moduleKey)
    )
      throw new ApiError(
        422,
        "MODULE_REQUIRED",
        "Choose an operational module for this backup export.",
      );
    const filter = listFilter(moduleKey, p, actor);
    const count = await NgoRecordModel.countDocuments(filter);
    if (count > 5000)
      throw new ApiError(
        422,
        "BACKUP_TOO_LARGE",
        "Narrow the date range to at most 5,000 records.",
      );
    const records = await NgoRecordModel.find(filter).lean();
    const payload = JSON.stringify(
      {
        format: "skymeredian-module-backup-v1",
        module: moduleKey,
        exportedAt: new Date().toISOString(),
        includes:
          "Operational records and verification metadata; uploaded file binaries are not included.",
        records,
      },
      null,
      2,
    );
    if (Buffer.byteLength(payload) > 4000000)
      throw new ApiError(
        422,
        "BACKUP_TOO_LARGE",
        "Narrow the date range to keep this export below 4 MB.",
      );
    await NgoAuditModel.create({
      actor: actor.id,
      action: "backup-export",
      module: moduleKey,
      recordId: "backup",
      reference: `${moduleKey}:${records.length}`,
      fields: [],
    });
    return new Response(payload, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${moduleKey}-backup-${new Date().toISOString().slice(0, 10)}.json"`,
        "Cache-Control": "private, no-store",
        "X-Content-SHA256": createHash("sha256").update(payload).digest("hex"),
      },
    });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-backup");
  }
}
