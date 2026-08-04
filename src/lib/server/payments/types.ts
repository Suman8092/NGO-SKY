import type { DonationStatus } from "../../../models";

export type CheckoutResult =
  | {
      provider: "stripe";
      status: "requires_action";
      checkoutUrl: string;
      sessionId: string;
    }
  | {
      provider: "razorpay";
      status: "requires_action";
      orderId: string;
      keyId: string;
      amountMinor: number;
      currency: string;
    }
  | {
      provider: "stripe" | "razorpay";
      status: "unavailable";
      reason: "demo_mode" | "not_configured" | "persistence_required";
    };

export type DonationPaymentUpdate = {
  donationId?: string;
  externalOrderId?: string;
  externalSessionId?: string;
  externalPaymentId?: string;
  status: Extract<
    DonationStatus,
    "processing" | "paid" | "failed" | "refunded"
  >;
  failureCode?: string;
};
