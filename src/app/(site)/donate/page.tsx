import type { Metadata } from "next";

import { DonatePage } from "@/components/pages/action-pages";
import {
  hasMongoConfig,
  hasRazorpayConfig,
  hasStripeConfig,
} from "@/lib/server/env";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Make a secure one-time, monthly, or annual gift to community-led Ashaaya Foundation programs and campaigns.",
};

type Props = {
  searchParams: Promise<{
    frequency?: string | string[];
    campaign?: string | string[];
    status?: string | string[];
  }>;
};

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  const rawFrequency = Array.isArray(params.frequency)
    ? params.frequency[0]
    : params.frequency;
  const frequency =
    rawFrequency === "monthly" || rawFrequency === "yearly"
      ? rawFrequency
      : "one_time";
  const campaign = Array.isArray(params.campaign)
    ? params.campaign[0]
    : params.campaign;
  const rawStatus = Array.isArray(params.status)
    ? params.status[0]
    : params.status;
  return (
    <DonatePage
      campaignSlug={campaign}
      checkoutCancelled={rawStatus === "cancelled"}
      frequency={frequency}
      paymentsUnavailable={
        !hasMongoConfig() || (!hasStripeConfig() && !hasRazorpayConfig())
      }
    />
  );
}
