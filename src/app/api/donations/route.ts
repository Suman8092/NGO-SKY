import {
  errorResponse,
  getClientIp,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { createDonationIntent } from "@/lib/server/services/donations";
import { donationSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    const ip = getClientIp(request);
    enforceRateLimit("donations", ip, { limit: 10, windowMs: 10 * 60_000 });
    const input = await parseJsonRequest(request, donationSchema);
    const result = await createDonationIntent(input, {
      requestId,
      ip,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
    const donation = result.record;
    return jsonSuccess(
      {
        donation: {
          id: donation.id,
          amount: donation.amountMinor / 100,
          amountMinor: donation.amountMinor,
          currency: donation.currency,
          frequency: donation.frequency,
          provider: donation.provider,
          status: donation.status,
          createdAt: donation.createdAt,
        },
        payment: result.payment,
      },
      {
        status: result.created ? 201 : 200,
        meta: {
          mode: result.persistence === "memory" ? "demo" : "live",
          persistence: result.persistence,
          paymentInitiated: result.payment.status === "requires_action",
        },
      },
    );
  } catch (error) {
    return errorResponse(error, requestId, "donations");
  }
}
