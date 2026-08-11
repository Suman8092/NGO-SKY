import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="page-shell flex min-h-screen items-center py-24"
    >
      <div className="max-w-2xl">
        <p className="eyebrow">404 · Path not found</p>
        <h1 className="display-title mt-7">This page is not available.</h1>
        <p className="prose-premium mt-7 max-w-xl">
          The address may be incorrect, the page may have moved, or its content
          may still be awaiting publication review.
        </p>
        <Link href="/" className="button-primary mt-9">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back home
        </Link>
      </div>
    </main>
  );
}
