import { ngoActor } from "@/lib/server/ngo/access";
import { financialSummary } from "@/lib/server/ngo/reports";
import { errorResponse, getRequestId, jsonSuccess } from "@/lib/server/http";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    await ngoActor(true);
    return jsonSuccess(await financialSummary());
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-summary");
  }
}
