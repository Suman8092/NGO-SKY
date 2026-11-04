import { NgoRecordModel } from "@/models/NgoRecord";
import {
  ngoActor,
  verifiedAccount,
  requireNgoDatabase,
} from "@/lib/server/ngo/access";
import { renderNgoDocument } from "@/lib/server/ngo/documents";
import { documentModules } from "@/lib/server/ngo/records";
import { ApiError } from "@/lib/server/errors";
import { errorResponse, getRequestId } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!/^[a-f0-9]{24}$/i.test(id))
      throw new ApiError(404, "NOT_FOUND", "Document not found.");
    await requireNgoDatabase();
    const doc = await NgoRecordModel.findOne({ _id: id, deletedAt: null });
    if (!doc || !documentModules.has(doc.module))
      throw new ApiError(404, "NOT_FOUND", "Document not found.");
    const token = new URL(request.url).searchParams.get("token");
    if (
      !token ||
      !/^[a-f0-9]{64}$/.test(token) ||
      token !== doc.downloadToken
    ) {
      const actor = await ngoActor();
      if (
        !actor.admin &&
        (doc.ownerId !== actor.id ||
          (doc.status === "draft" && doc.data._provisional !== true))
      ) {
        const account = await verifiedAccount();
        if (
          doc.ownerId ||
          (doc.status === "draft" && doc.data._provisional !== true) ||
          String(doc.data.email).toLowerCase() !== account.email
        )
          throw new ApiError(403, "FORBIDDEN", "This document is private.");
      }
    }
    return new Response(await renderNgoDocument(doc), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${new URL(request.url).searchParams.has("preview") ? "inline" : "attachment"}; filename="${doc.reference}.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-document");
  }
}
