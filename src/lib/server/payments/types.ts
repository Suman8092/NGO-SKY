import type { DonationStatus } from "../../../models";

export type CheckoutResult =
  | {
      provider: "razorpay";
      status: "requires_action";
      orderId: string;
      keyId: string;
      amountMinor: number;
      currency: string;
    }
  | {
      provider: "razorpay";
      status: "unavailable";
      reason: "demo_mode" | "not_configured" | "persistence_required";
    };

export type DonationPaymentUpdate = {
  provider: "stripe" | "razorpay" | "phonepe" | "payu";
  donationId?: string;
  externalOrderId?: string;
  externalSessionId?: string;
  externalPaymentId?: string;
  status: Extract<
    DonationStatus,
    "processing" | "paid" | "failed" | "refunded"
  >;
  amountMinor?: number;
  currency?: string;
  refundAmountMinor?: number;
  refundMode?: "delta" | "total";
  failureCode?: string;
};
