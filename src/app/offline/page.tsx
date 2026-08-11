import { RefreshCw, WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <main
      id="main-content"
      className="page-shell flex min-h-screen items-center py-24"
    >
      <div className="max-w-xl">
        <span className="grid size-14 place-items-center rounded-2xl bg-forest/10 text-forest">
          <WifiOff className="size-6" aria-hidden="true" />
        </span>
        <p className="eyebrow mt-8">You’re offline</p>
        <h1 className="display-title mt-6">A connection is required.</h1>
        <p className="prose-premium mt-6">
          Donation and form submissions are never queued in the background.
          Reconnect before opening reviewed content or using an online service.
        </p>
        <div className="mt-8">
          <Link href="/" className="button-primary">
            <RefreshCw className="size-4" aria-hidden="true" /> Try again
          </Link>
        </div>
      </div>
    </main>
  );
}
