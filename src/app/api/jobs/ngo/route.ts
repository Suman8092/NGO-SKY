import { timingSafeEqual } from "node:crypto";
import { runNgoDailyJobs } from "@/lib/server/ngo/jobs";
import { errorResponse, getRequestId, jsonSuccess } from "@/lib/server/http";
import { ApiError } from "@/lib/server/errors";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret || secret.length < 32)
      throw new ApiError(
        503,
        "JOB_UNCONFIGURED",
        "Scheduled operations are not configured.",
      );
    const actual = Buffer.from(request.headers.get("authorization") ?? "");
    const expected = Buffer.from(`Bearer ${secret}`);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      throw new ApiError(403, "FORBIDDEN", "Job authentication required.");
    return jsonSuccess(await runNgoDailyJobs());
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-job");
  }
}
