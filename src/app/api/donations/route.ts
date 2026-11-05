import { selectedGateway } from "@/lib/server/ngo/gateway-config";
import { createHostedDonation } from "@/lib/server/ngo/hosted-donations";
import { auth } from "@clerk/nextjs/server";

import { isClerkConfigured } from "@/lib/auth-config";
import {
  errorResponse,
  getClientIp,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import {
  assertDonationLaunchBasics,
  createDonationIntent,
} from "@/lib/server/services/donations";
import { donationSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function optionalAccountUserId(): Promise<string | undefined> {
  if (!isClerkConfigured()) return undefined;
  const { userId } = await auth();
  return userId ?? undefined;
}

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  try {
    assertDonationLaunchBasics();
    const ip = getClientIp(request);
    await enforceRateLimit("donations", ip, {
      limit: 10,
      windowMs: 10 * 60_000,
    });
    const input = await parseJsonRequest(request, donationSchema);
    const accountUserId = await optionalAccountUserId();
    const gateway = await selectedGateway();
    const metadata = {
      requestId,
      ip,
      userAgent: request.headers.get("user-agent") ?? undefined,
      accountUserId,
    };
    const result =
      gateway.provider === "razorpay"
        ? await createDonationIntent(input, metadata)
        : await createHostedDonation(
            input,
            metadata,
            gateway.provider,
            gateway.mode,
          );
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
