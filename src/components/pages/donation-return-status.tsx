"use client";

import {
  BadgeCheck,
  CircleX,
  Clock3,
  RefreshCcw,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type DonationStatus =
  "pending" | "processing" | "paid" | "failed" | "refunded" | "cancelled";

type DonationSummary = {
  id: string;
  amount: number;
  currency: string;
  frequency: "one_time" | "monthly" | "yearly";
  provider: "stripe" | "razorpay";
  status: DonationStatus;
  updatedAt: string;
};

type ViewState =
  | { kind: "checking" }
  | { kind: "ready"; donation: DonationSummary }
  | { kind: "unavailable" };

const finalStatuses = new Set<DonationStatus>([
  "paid",
  "failed",
  "refunded",
  "cancelled",
]);

function statusContent(status: DonationStatus) {
  switch (status) {
    case "paid":
      return {
        Icon: BadgeCheck,
        title: "Payment confirmed",
        description:
          "Your signed payment confirmation has been received. Keep this reference for your records; any applicable receipt will follow by email.",
        tone: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100",
      };
    case "failed":
    case "cancelled":
      return {
        Icon: CircleX,
        title: "Payment was not confirmed",
        description:
          "No confirmed gift is recorded. You can return to the donation form and try again, or contact the giving team if your payment provider shows a charge.",
        tone: "border-red-200 bg-red-50 text-red-950 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-100",
      };
    case "refunded":
      return {
        Icon: RotateCcw,
        title: "This gift was refunded",
        description:
          "The donation record shows a refund. Your bank may take several business days to display the returned funds.",
        tone: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100",
      };
    default:
      return {
        Icon: Clock3,
        title: "Confirmation is in progress",
        description:
          "The secure checkout has returned, but the signed provider notification has not finished updating this gift yet. This page will check again automatically.",
        tone: "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100",
      };
  }
}

function formatAmount(donation: DonationSummary) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: donation.currency,
      maximumFractionDigits: 2,
    }).format(donation.amount);
  } catch {
    return `${donation.currency} ${donation.amount.toLocaleString("en-IN")}`;
  }
}

export function DonationReturnStatus({ donationId }: { donationId?: string }) {
  const [state, setState] = useState<ViewState>(
    donationId ? { kind: "checking" } : { kind: "unavailable" },
  );

  useEffect(() => {
    if (!donationId) return;

    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function refresh(attempt: number) {
      try {
        const response = await fetch(
          `/api/donations/${encodeURIComponent(donationId!)}`,
          { cache: "no-store", headers: { Accept: "application/json" } },
        );
        const result = (await response.json().catch(() => null)) as {
          ok?: boolean;
          data?: DonationSummary;
        } | null;
        if (!response.ok || !result?.ok || !result.data) {
          throw new Error("Donation status is unavailable.");
        }
        if (!active) return;
        setState({ kind: "ready", donation: result.data });
        if (!finalStatuses.has(result.data.status) && attempt < 8) {
          timer = setTimeout(() => void refresh(attempt + 1), 3_000);
        }
      } catch {
        if (!active) return;
        if (attempt < 2) {
          timer = setTimeout(() => void refresh(attempt + 1), 2_000);
        } else {
          setState({ kind: "unavailable" });
        }
      }
    }

    void refresh(0);
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [donationId]);

  if (state.kind === "checking") {
    return (
      <div
        aria-live="polite"
        className="flex items-start gap-4 rounded-[1.75rem] border border-sky-200 bg-sky-50 p-7 text-sky-950 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100 sm:p-8"
        role="status"
      >
        <RefreshCcw
          aria-hidden="true"
          className="mt-0.5 h-6 w-6 shrink-0 animate-spin motion-reduce:animate-none"
        />
        <div>
          <h2 className="text-xl font-bold">Checking your gift</h2>
          <p className="mt-2 leading-7 opacity-75">
            We are reading the server-side donation record. This does not make
            or repeat a payment.
          </p>
        </div>
      </div>
    );
  }

  if (state.kind === "unavailable") {
    return (
      <div
        aria-live="polite"
        className="rounded-[1.75rem] border border-slate-200 bg-white p-7 text-slate-950 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white sm:p-8"
        role="status"
      >
        <Clock3
          aria-hidden="true"
          className="h-7 w-7 text-teal-700 dark:text-teal-300"
        />
        <h2 className="mt-6 text-2xl font-bold">Keep your payment reference</h2>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
          This return link does not include a valid donation reference, so we
          cannot show a status here. A browser redirect alone is never treated
          as proof of payment.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link className="button-primary" href="/donate">
            Return to donations
          </Link>
          <Link
            className="button-secondary"
            href="/contact?subject=donations-receipts"
          >
            Contact the giving team
          </Link>
        </div>
      </div>
    );
  }

  const content = statusContent(state.donation.status);
  const Icon = content.Icon;
  return (
    <div
      aria-live="polite"
      className={`rounded-[1.75rem] border p-7 sm:p-8 ${content.tone}`}
      role="status"
    >
      <Icon aria-hidden="true" className="h-7 w-7" />
      <h2 className="mt-6 text-2xl font-bold">{content.title}</h2>
      <p className="mt-3 max-w-2xl leading-7 opacity-80">
        {content.description}
      </p>
      <dl className="border-current/15 mt-7 grid gap-4 border-t pt-6 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.14em] opacity-60">
            Amount
          </dt>
          <dd className="mt-2 font-bold">{formatAmount(state.donation)}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.14em] opacity-60">
            Frequency
          </dt>
          <dd className="mt-2 font-bold">
            {state.donation.frequency.replaceAll("_", " ")}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.14em] opacity-60">
            Reference
          </dt>
          <dd className="mt-2 break-all font-mono text-xs font-bold">
            {state.donation.id}
          </dd>
        </div>
      </dl>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link className="button-primary" href="/">
          Return home
        </Link>
        <Link
          className="button-secondary"
          href="/contact?subject=donations-receipts"
        >
          Ask about this gift
        </Link>
      </div>
    </div>
  );
}
