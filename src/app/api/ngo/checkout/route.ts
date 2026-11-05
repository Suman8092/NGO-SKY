import { NgoRecordModel } from "@/models/NgoRecord";
import { selectedGateway } from "@/lib/server/ngo/gateway-config";
import { startHostedPayment } from "@/lib/server/ngo/hosted-payments";
import { z } from "zod";
import { ngoActor } from "@/lib/server/ngo/access";
import { registrationCheckout } from "@/lib/server/ngo/payments";
import {
  errorResponse,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
export async function POST(request: Request) {
  try {
    const actor = await ngoActor();
    await enforceRateLimit("ngo-checkout", actor.id, {
      limit: 5,
      windowMs: 60000,
    });
    const input = await parseJsonRequest(
      request,
      z.object({ source: z.string().regex(/^[a-f0-9]{24}$/i) }).strict(),
    );
    let gateway = await selectedGateway();
    const existing = await NgoRecordModel.findOne({
      identityKey: `checkout:${input.source}`,
      ownerId: actor.id,
      module: "gateway-payments",
    });
    if (existing)
      gateway = {
        provider: (existing.data.provider ?? "razorpay") as
          "razorpay" | "phonepe" | "payu",
        mode: (existing.data.environment ?? "production") as
          "production" | "sandbox",
      };
    return jsonSuccess(
      gateway.provider === "razorpay"
        ? await registrationCheckout(input.source, actor)
        : await startHostedPayment(
            input.source,
            "registration",
            actor,
            gateway.provider,
            gateway.mode,
          ),
    );
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-checkout");
  }
}
