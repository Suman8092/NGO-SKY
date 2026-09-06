import type { Metadata } from "next";

import { DonatePage } from "@/components/pages/action-pages";
import { getPublicPaymentReadiness } from "@/lib/server/public-payment-readiness";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Check whether verified online giving is available for Skymeredian Foundation.",
};

type Props = {
  searchParams: Promise<{
    amount?: string | string[];
    status?: string | string[];
  }>;
};

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  const paymentReadiness = getPublicPaymentReadiness();
  const rawAmount = Array.isArray(params.amount)
    ? params.amount[0]
    : params.amount;
  const parsedAmount = Number(rawAmount);
  const amount =
    Number.isFinite(parsedAmount) &&
    parsedAmount >= 100 &&
    parsedAmount <= 1_000_000
      ? parsedAmount
      : undefined;
  const rawStatus = Array.isArray(params.status)
    ? params.status[0]
    : params.status;
  return (
    <DonatePage
      checkoutCancelled={rawStatus === "cancelled"}
      initialAmount={amount}
      paymentReadiness={paymentReadiness}
    />
  );
}
