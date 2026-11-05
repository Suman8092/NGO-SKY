import "server-only";
import { storeDonation, type RequestMetadata } from "../repository";
import type { DonationInput } from "../validation";
import { startHostedPayment } from "./hosted-payments";
import type { Gateway, GatewayMode } from "./gateway-config";
export async function createHostedDonation(
  input: DonationInput,
  metadata: RequestMetadata,
  provider: Exclude<Gateway, "razorpay">,
  mode: GatewayMode,
) {
  const stored = await storeDonation({ ...input, provider }, metadata);
  const payment = await startHostedPayment(
    stored.record.id,
    "online-donations",
    { id: metadata.accountUserId ?? "guest-checkout", admin: false },
    provider,
    mode,
  );
  return { ...stored, payment };
}
