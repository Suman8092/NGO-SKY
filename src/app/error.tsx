"use client";

import { RotateCcw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" className="page-shell flex min-h-screen items-center py-24">
      <div className="max-w-xl">
        <p className="eyebrow">A temporary interruption</p>
        <h1 className="display-title mt-7">We couldn’t finish that request.</h1>
        <p className="prose-premium mt-6">
          Your information is safe. Try once more, or return to the homepage if the issue continues.
        </p>
        <button type="button" onClick={reset} className="button-primary mt-8">
          <RotateCcw className="size-4" aria-hidden="true" /> Try again
        </button>
      </div>
    </main>
  );
}
