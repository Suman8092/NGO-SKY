import { ApiError } from "@/lib/server/errors";
import { errorResponse, getRequestId } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request);
  return errorResponse(
    new ApiError(
      410,
      "STRIPE_CHECKOUT_DISABLED",
      "Stripe checkout is not offered. Online donations support one-time INR payments through Razorpay only.",
    ),
    requestId,
    "stripe-checkout",
  );
}
