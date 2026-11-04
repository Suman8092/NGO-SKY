import { MailX, ShieldCheck, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { isNewsletterUnsubscribeToken } from "@/lib/server/newsletter-tokens";

import { unsubscribeNewsletterAction } from "./actions";

export const metadata: Metadata = {
  title: "Unsubscribe from email updates",
  description: "Manage an Skymeredian Foundation email subscription.",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{
    token?: string | string[];
    status?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function NewsletterUnsubscribePage({
  searchParams,
}: Props) {
  noStore();
  const params = await searchParams;
  const token = firstValue(params.token);
  const status = firstValue(params.status);
  const canConfirm = !status && isNewsletterUnsubscribeToken(token);
  const unsubscribed = status === "unsubscribed";
  const unavailable = status === "unavailable";

  return (
    <main className="min-h-[75vh] bg-[#f5f3ee] px-6 pb-20 pt-36 text-[#171f32] dark:bg-[#0c1425] dark:text-[#eff3ec]">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-ink/10 bg-white p-8 shadow-soft dark:bg-white/[0.055] sm:p-12">
        <span className="grid size-14 place-items-center rounded-2xl bg-forest/10 text-forest">
          {unavailable ? (
            <TriangleAlert aria-hidden="true" className="size-7" />
          ) : unsubscribed ? (
            <ShieldCheck aria-hidden="true" className="size-7" />
          ) : (
            <MailX aria-hidden="true" className="size-7" />
          )}
        </span>

        {canConfirm ? (
          <>
            <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-forest">
              Email preferences
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Stop email updates?
            </h1>
            <p className="mt-5 text-base leading-8 text-ink/58 dark:text-white/65">
              Confirm below to unsubscribe this address. Opening this page has
              not changed the subscription.
            </p>
            <form action={unsubscribeNewsletterAction} className="mt-8">
              <input name="token" type="hidden" value={token} />
              <button className="button-primary min-h-11" type="submit">
                Unsubscribe from email updates
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-forest">
              Email preferences
            </p>
            <h1
              className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl"
              tabIndex={-1}
            >
              {unsubscribed
                ? "You are unsubscribed."
                : unavailable
                  ? "We could not update this subscription."
                  : "This unsubscribe link is not valid."}
            </h1>
            <p
              className="mt-5 text-base leading-8 text-ink/58 dark:text-white/65"
              role="status"
            >
              {unsubscribed
                ? "This address will no longer receive newsletter email updates."
                : unavailable
                  ? "The subscription service is temporarily unavailable. No change was recorded; please use the link again later."
                  : "The link may have already been used or replaced. No subscription change was made."}
            </p>
          </>
        )}

        <div className="mt-8 border-t border-ink/10 pt-6 dark:border-white/10">
          <Link className="button-secondary min-h-11" href="/">
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
