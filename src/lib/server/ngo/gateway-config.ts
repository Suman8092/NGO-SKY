import "server-only";
import { NgoRecordModel } from "@/models/NgoRecord";
import { requireNgoDatabase } from "./access";
import { ApiError } from "../errors";
export type Gateway = "razorpay" | "phonepe" | "payu";
export type GatewayMode = "production" | "sandbox";
export function hostedCredentials(provider: Gateway, mode: GatewayMode) {
  const prefix = mode === "sandbox" ? "TEST_" : "";
  const read = (key: string) => process.env[`${prefix}${key}`]?.trim();
  return provider === "phonepe"
    ? {
        key: read("PHONEPE_CLIENT_ID"),
        secret: read("PHONEPE_CLIENT_SECRET"),
        version: read("PHONEPE_CLIENT_VERSION"),
      }
    : provider === "payu"
      ? { key: read("PAYU_KEY"), secret: read("PAYU_SALT"), version: undefined }
      : {
          key: read("RAZORPAY_KEY_ID"),
          secret: read("RAZORPAY_KEY_SECRET"),
          version: undefined,
        };
}
export function assertHostedConfigured(provider: Gateway, mode: GatewayMode) {
  const c = hostedCredentials(provider, mode);
  if (!c.key || !c.secret || (provider === "phonepe" && !c.version))
    throw new ApiError(
      503,
      "GATEWAY_CREDENTIALS_REQUIRED",
      `Configure ${mode} ${provider} server credentials before activation.`,
    );
  return c as { key: string; secret: string; version?: string };
}
export async function selectedGateway() {
  await requireNgoDatabase();
  const doc = await NgoRecordModel.findOne({
    module: "gateways",
    status: "active",
    deletedAt: null,
  }).lean();
  return {
    provider: (doc?.data.provider ?? "razorpay") as Gateway,
    mode: (doc?.data.environment ?? "production") as GatewayMode,
  };
}
