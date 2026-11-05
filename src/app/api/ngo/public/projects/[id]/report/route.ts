import { NgoRecordModel } from "@/models/NgoRecord";
import { projectAccounting } from "@/lib/server/ngo/project-accounting";
import { exportReportPdf, exportWorkbook } from "@/lib/server/ngo/reports";
import { requireNgoDatabase } from "@/lib/server/ngo/access";
import { errorResponse, getRequestId } from "@/lib/server/http";
import { ApiError } from "@/lib/server/errors";
import { enforceRateLimit } from "@/lib/server/rate-limit";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!/^[a-f0-9]{24}$/i.test(id))
      throw new ApiError(404, "NOT_FOUND", "Published project not found.");
    await enforceRateLimit("public-project-report", id, {
      limit: 60,
      windowMs: 60000,
    });
    await requireNgoDatabase();
    const project = await NgoRecordModel.findOne({
      _id: id,
      module: "projects",
      deletedAt: null,
      status: { $in: ["active", "completed"] },
      "data.publish": true,
    }).lean();
    if (!project)
      throw new ApiError(404, "NOT_FOUND", "Published project not found.");
    const totals = (await projectAccounting([id]))[id];
    const headers = ["Project", "Category", "Amount (INR)"];
    const rows: unknown[][] = [
      [project.reference, "Confirmed funding", totals.incomeMinor / 100],
      [project.reference, "Approved spending", totals.expenseMinor / 100],
      [
        project.reference,
        "Recorded balance",
        (totals.incomeMinor - totals.expenseMinor) / 100,
      ],
      ...totals.categories.map((c) => [
        project.reference,
        c.category,
        c.amountMinor / 100,
      ]),
    ];
    const excel = new URL(request.url).searchParams.get("format") === "xlsx";
    const body = excel
      ? await exportWorkbook(headers, rows, "Project accountability")
      : await exportReportPdf(
          headers,
          rows,
          `${project.data.name}: accountability`,
        );
    return new Response(body, {
      headers: {
        "Content-Type": excel
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/pdf",
        "Content-Disposition": `attachment; filename="${project.reference}-accountability.${excel ? "xlsx" : "pdf"}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "public-project-report");
  }
}
