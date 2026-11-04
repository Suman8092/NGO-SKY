"use client";

import { Check, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type VolunteerStatus = "submitted" | "reviewing" | "approved" | "rejected";
type ContactStatus = "new" | "read" | "resolved" | "spam";

export function VolunteerStatusSelector({
  id,
  initialStatus,
}: {
  id: string;
  initialStatus: VolunteerStatus;
}) {
  const [status, setStatus] = useState<VolunteerStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function handleChange(newStatus: VolunteerStatus) {
    if (newStatus === status || loading) return;
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch("/api/admin/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_volunteer_status",
          id,
          status: newStatus,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error?.message || "Failed to update status");
      }

      setStatus(newStatus);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {

      toast.error(err instanceof Error ? err.message : "Could not update volunteer application status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label={`Status for ${id}`}
        value={status}
        disabled={loading}
        onChange={(e) => handleChange(e.target.value as VolunteerStatus)}
        className="rounded-lg border border-ink/15 bg-white px-2.5 py-1 text-xs font-semibold capitalize text-ink shadow-sm transition hover:border-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest dark:bg-zinc-900 dark:border-white/15"
      >
        <option value="submitted">Submitted</option>
        <option value="reviewing">Reviewing</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      {loading && (
        <Loader2 className="size-3.5 animate-spin text-forest" aria-hidden="true" />
      )}
      {saved && (
        <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-emerald-600 dark:text-emerald-400">
          <Check className="size-3" /> Saved
        </span>
      )}
    </div>
  );
}

export function ContactStatusSelector({
  id,
  initialStatus,
}: {
  id: string;
  initialStatus: ContactStatus;
}) {
  const [status, setStatus] = useState<ContactStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function handleChange(newStatus: ContactStatus) {
    if (newStatus === status || loading) return;
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch("/api/admin/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_contact_status",
          id,
          status: newStatus,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error?.message || "Failed to update status");
      }

      setStatus(newStatus);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {

      toast.error(err instanceof Error ? err.message : "Could not update enquiry status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label={`Status for ${id}`}
        value={status}
        disabled={loading}
        onChange={(e) => handleChange(e.target.value as ContactStatus)}
        className="rounded-lg border border-ink/15 bg-white px-2.5 py-1 text-xs font-semibold capitalize text-ink shadow-sm transition hover:border-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest dark:bg-zinc-900 dark:border-white/15"
      >
        <option value="new">New</option>
        <option value="read">Read</option>
        <option value="resolved">Resolved</option>
        <option value="spam">Spam</option>
      </select>

      {loading && (
        <Loader2 className="size-3.5 animate-spin text-forest" aria-hidden="true" />
      )}
      {saved && (
        <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-emerald-600 dark:text-emerald-400">
          <Check className="size-3" /> Saved
        </span>
      )}
    </div>
  );
}

export function SanitySyncButton() {
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    time: string;
    totalDocs: number;
  } | null>(null);
  const router = useRouter();

  async function handleSync() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_sanity_content" }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error?.message || "Sync failed");
      }

      const docs = data.data?.publishedDocuments || {};
      const total =
        (docs.campaigns || 0) +
        (docs.events || 0) +
        (docs.programs || 0) +
        (docs.stories || 0) +
        (docs.categories || 0);

      setSyncResult({
        time: new Date().toLocaleTimeString("en-IN"),
        totalDocs: total,
      });

      router.refresh();
    } catch (err: unknown) {

      toast.error(err instanceof Error ? err.message : "Failed to sync Sanity content.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0c2a24] disabled:opacity-50"
      >
        <RefreshCw
          className={`size-3.5 ${loading ? "animate-spin" : ""}`}
          aria-hidden="true"
        />
        {loading ? "Syncing Sanity CMS..." : "Sync Live CMS Content"}
      </button>

      {syncResult && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400">
          ✓ Refreshed {syncResult.totalDocs} published documents at {syncResult.time}
        </p>
      )}
    </div>
  );
}
