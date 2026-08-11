import {
  ArrowRight,
  FileCheck2,
  HeartHandshake,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { AccountGreeting } from "@/components/dashboard/account-greeting";
import { AccountIdentity } from "@/components/dashboard/account-identity";
import { isClerkConfigured } from "@/lib/auth-config";
import { isEditorialContentPublished } from "@/lib/content-config";

export default function UserDashboard() {
  const clerkEnabled = isClerkConfigured();
  const editorialContentPublished = isEditorialContentPublished();

  return (
    <div className="mx-auto max-w-[1200px]">
      <header className="rounded-4xl bg-[#0b3028] p-6 text-white shadow-lift sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#70d5b3]">
          Account dashboard
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl">
          <AccountGreeting clerkEnabled={clerkEnabled} role="user" />
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
          This area only displays information confirmed by your account and the
          production record system. Unverified totals, impact estimates,
          receipts, and certificates are never filled with sample data.
        </p>
      </header>

      <div className="mt-5">
        <AccountIdentity clerkEnabled={clerkEnabled} role="user" />
      </div>

      <section
        className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]"
        aria-label="Account record status"
      >
        <article className="rounded-3xl border border-ink/8 bg-white p-6 shadow-[0_12px_35px_rgba(15,50,43,.05)] dark:bg-white/[0.055] sm:p-8">
          <span className="grid size-12 place-items-center rounded-2xl bg-forest/10 text-forest">
            <ReceiptText className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-7 text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-forest">
            Giving records
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">
            No verified donation history is available.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-ink/55">
            Account-level donation records have not been connected to this
            dashboard. When a verified history service is available, confirmed
            gifts and their official documents can appear here.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/contact" className="button-primary min-h-11">
              Contact support{" "}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            {editorialContentPublished ? (
              <Link href="/campaigns" className="button-secondary min-h-11">
                Browse campaigns
              </Link>
            ) : null}
          </div>
        </article>

        <article className="rounded-3xl border border-forest/15 bg-forest/[0.06] p-6 sm:p-8">
          <ShieldCheck className="size-7 text-forest" aria-hidden="true" />
          <h2 className="mt-6 font-display text-2xl font-bold">
            What this dashboard will verify
          </h2>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-ink/58">
            <li className="flex gap-3">
              <FileCheck2
                className="mt-0.5 size-4 shrink-0 text-forest"
                aria-hidden="true"
              />
              Receipts and tax documents issued by the production record system.
            </li>
            <li className="flex gap-3">
              <HeartHandshake
                className="mt-0.5 size-4 shrink-0 text-forest"
                aria-hidden="true"
              />
              Donation status confirmed by a signed payment-provider webhook.
            </li>
            <li className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 size-4 shrink-0 text-forest"
                aria-hidden="true"
              />
              Records matched securely to this signed-in account.
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
}
