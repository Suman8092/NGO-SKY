import { publishedRecords } from "@/lib/server/ngo/public";
import { getModule } from "@/lib/ngo/catalog";
import { ApiError } from "@/lib/server/errors";
import { errorResponse, getRequestId, jsonSuccess } from "@/lib/server/http";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ module: string }> },
) {
  try {
    const { module } = await params;
    if (!getModule(module)?.public)
      throw new ApiError(404, "NOT_FOUND", "Public collection not found.");
    return jsonSuccess(await publishedRecords(module));
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-public");
  }
}
