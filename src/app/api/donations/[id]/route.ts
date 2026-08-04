import { ApiError } from "@/lib/server/errors";
import {
  errorResponse,
  getClientIp,
  getRequestId,
  jsonSuccess,
} from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { findDonation } from "@/lib/server/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    enforceRateLimit("donation-status", getClientIp(request), {
      limit: 30,
      windowMs: 60_000,
    });
    const { id } = await params;
    if (!/^(?:[a-f0-9]{24}|demo_[a-f0-9]{20})$/i.test(id)) {
      throw new ApiError(
        400,
        "INVALID_DONATION_ID",
        "Donation reference is invalid.",
      );
    }
    const result = await findDonation(id);
    if (!result)
      throw new ApiError(
        404,
        "DONATION_NOT_FOUND",
        "Donation record not found.",
      );
    const donation = result.record;
    return jsonSuccess(
      {
        id: donation.id,
        amount: donation.amountMinor / 100,
        currency: donation.currency,
        frequency: donation.frequency,
        provider: donation.provider,
        status: donation.status,
        updatedAt: donation.updatedAt,
      },
      { meta: { mode: result.persistence === "memory" ? "demo" : "live" } },
    );
  } catch (error) {
    return errorResponse(error, requestId, "donation-status");
  }
}
