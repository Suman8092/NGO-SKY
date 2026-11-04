import { ngoActor } from "@/lib/server/ngo/access";
import {
  exportReportPdf,
  exportWorkbook,
  reportRows,
} from "@/lib/server/ngo/reports";
import { errorResponse, getRequestId } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ module: string }> },
) {
  try {
    const actor = await ngoActor(true);
    const { module } = await params;
    const p = new URL(request.url).searchParams;
    const { headers, rows, definition } = await reportRows(module, p, actor);
    const format = p.get("format") === "pdf" ? "pdf" : "xlsx";
    const data =
      format === "pdf"
        ? await exportReportPdf(headers, rows, definition.title)
        : await exportWorkbook(headers, rows, definition.title);
    return new Response(data, {
      headers: {
        "Content-Type":
          format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${module}-${new Date().toISOString().slice(0, 10)}.${format}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-report");
  }
}
