"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#f5f3ee] p-6 text-[#171717]">
        <main className="w-full max-w-xl rounded-3xl border border-black/10 bg-white p-8 text-center shadow-xl shadow-black/5 sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#6b5b45]">
            Skymeredian Foundation
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            We could not load this page.
          </h1>
          <p className="mt-5 text-base leading-7 text-black/65 sm:text-lg">
            Please try again, or return to the home page. If the problem
            continues, check the currently available contact options.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-[#202020] px-6 py-3 font-bold text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-full border border-black/20 px-6 py-3 font-bold text-[#202020] transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Return home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
