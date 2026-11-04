import { FileCheck2, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Content under review",
  robots: { index: false, follow: false },
};

export default function ContentReviewPage() {
  return (
    <main className="min-h-[75vh] bg-[#f5f3ee] px-6 pb-20 pt-36 text-[#171f32] dark:bg-[#0c1425] dark:text-[#eff3ec]">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-ink/10 bg-white p-8 shadow-soft dark:bg-white/[0.055] sm:p-12">
        <span className="grid size-14 place-items-center rounded-2xl bg-forest/10 text-forest">
          <FileCheck2 className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-forest">
          Publication safeguard
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          This content is awaiting verification.
        </h1>
        <p className="mt-5 text-base leading-8 text-ink/58">
          This page is intentionally unavailable in production until its names,
          figures, permissions, and supporting records have been reviewed by the
          organisation.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-ink/8 p-5">
            <ShieldCheck className="size-5 text-forest" aria-hidden="true" />
            <p className="mt-4 text-sm font-bold">No placeholder claims</p>
            <p className="mt-2 text-xs leading-6 text-ink/50">
              Draft metrics and identities are not published as facts.
            </p>
          </div>
          <div className="rounded-2xl border border-ink/8 p-5">
            <MessageCircle className="size-5 text-forest" aria-hidden="true" />
            <p className="mt-4 text-sm font-bold">Need information?</p>
            <p className="mt-2 text-xs leading-6 text-ink/50">
              The contact page reports whether a managed enquiry service is
              currently available before collecting any details.
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/contact" className="button-primary min-h-11">
            Check contact availability
          </Link>
          <Link href="/" className="button-secondary min-h-11">
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
