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
    return jsonSuccess(await registrationCheckout(input.source, actor));
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-checkout");
  }
}
