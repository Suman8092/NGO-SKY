import { RefreshCw, WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <main id="main-content" className="page-shell flex min-h-screen items-center py-24">
      <div className="max-w-xl"><span className="grid size-14 place-items-center rounded-2xl bg-forest/10 text-forest"><WifiOff className="size-6" /></span><p className="eyebrow mt-8">You’re offline</p><h1 className="display-title mt-6">The connection paused. Your place didn’t.</h1><p className="prose-premium mt-6">Previously loaded images may remain available. Donation and form submissions require a secure connection and are never queued in the background.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/" className="button-primary"><RefreshCw className="size-4" /> Try again</Link><Link href="/impact" className="button-secondary">View cached impact</Link></div></div>
    </main>
  );
}
