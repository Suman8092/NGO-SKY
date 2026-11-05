import { timingSafeEqual } from "node:crypto";
import { after } from "next/server";
import { NgoRecordModel } from "@/models/NgoRecord";
import { requireNgoDatabase } from "@/lib/server/ngo/access";
import { reconcileHostedPayment } from "@/lib/server/ngo/hosted-payments";
import { processNgoOutbox } from "@/lib/server/ngo/jobs";
import {
  errorResponse,
  getRequestId,
  jsonSuccess,
  getClientIp,
} from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { ApiError } from "@/lib/server/errors";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await params;
    const secret = process.env.HOSTED_WEBHOOK_SECRET,
      actual = Buffer.from(
        new URL(request.url).searchParams.get("token") ?? "",
      );
    const expected = Buffer.from(secret ?? "");
    if (
      !secret ||
      secret.length < 32 ||
      actual.length !== expected.length ||
      !timingSafeEqual(actual, expected)
    )
      throw new ApiError(
        403,
        "INVALID_WEBHOOK",
        "Invalid webhook credentials.",
      );
    if (!["phonepe", "payu"].includes(provider))
      throw new ApiError(404, "NOT_FOUND", "Provider not found.");
    await enforceRateLimit("hosted-webhook", getClientIp(request), {
      limit: 120,
      windowMs: 60000,
    });
    const raw = await request.text();
    if (raw.length > 65536)
      throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Webhook too large.");
    let order = "";
    if (provider === "payu")
      order = new URLSearchParams(raw).get("txnid") ?? "";
    else {
      let body;
      try {
        body = JSON.parse(raw);
      } catch {
        throw new ApiError(
          400,
          "INVALID_PAYLOAD",
          "Webhook must contain valid JSON.",
        );
      }
      if (!body || typeof body !== "object")
        throw new ApiError(400, "INVALID_PAYLOAD", "Invalid webhook payload.");
      order = body.payload?.merchantOrderId ?? body.merchantOrderId ?? "";
    }
    if (!/^NGO_[a-f0-9]{24}$/i.test(order))
      throw new ApiError(
        400,
        "INVALID_REFERENCE",
        "Unknown merchant order reference.",
      );
    await requireNgoDatabase();
    const item = await NgoRecordModel.findOne({
      _id: order.slice(4),
      module: "gateway-payments",
      "data.provider": provider,
    });
    if (!item) throw new ApiError(404, "NOT_FOUND", "Payment not found.");
    const result = await reconcileHostedPayment(
      item._id.toString(),
      item.downloadToken,
    );
    after(async () => {
      await processNgoOutbox(5).catch(() => undefined);
    });
    return jsonSuccess(result);
  } catch (e) {
    return errorResponse(e, getRequestId(request), "hosted-webhook");
  }
}
