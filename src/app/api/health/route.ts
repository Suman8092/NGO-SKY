import { getRequestId, jsonSuccess } from "@/lib/server/http";
import { getHealthSnapshot } from "@/lib/server/services/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const deep = new URL(request.url).searchParams.get("deep") === "true";
  const snapshot = await getHealthSnapshot(deep);
  return jsonSuccess(snapshot.body, {
    status: snapshot.httpStatus,
    headers: { "X-Request-Id": getRequestId(request) },
  });
}
