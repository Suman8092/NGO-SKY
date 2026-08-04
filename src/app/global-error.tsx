"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#0c1614] p-6 text-[#eff3ec]">
        <main className="max-w-lg text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#5dc3a1]">Ashaaya Foundation</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight">Something unexpected happened.</h1>
          <p className="mt-5 text-lg text-white/65">Please retry. No donation or form submission is repeated automatically.</p>
          <button type="button" onClick={reset} className="mt-8 rounded-full bg-[#f8f7f1] px-6 py-3 font-bold text-[#0c1614]">
            Retry safely
          </button>
        </main>
      </body>
    </html>
  );
}
