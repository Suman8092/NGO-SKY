"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
type Job = {
  _id: string;
  subject: string;
  status: string;
  attempts: number;
  error?: string;
  createdAt: string;
};
export function DeliveryLog() {
  const [rows, setRows] = useState<Job[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      const r = await fetch("/api/admin/delivery");
      const b = await r.json();
      if (!r.ok) throw new Error(b.error?.message);
      setRows(b.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delivery log unavailable.");
    }
  }
  useEffect(() => {
    void load();
  }, []);
  return (
    <section className="border-t border-ink/15 py-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Email delivery queue</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
            Queued is not delivered. Verify your sender domain in Resend and
            review failures before retrying. Birthdays run daily at 09:00 India
            time when the secured scheduled job is configured.
          </p>
        </div>
        <button
          disabled={busy}
          type="button"
          className="button-secondary min-h-10 px-4 text-xs"
          onClick={async () => {
            setBusy(true);
            try {
              const r = await fetch("/api/admin/delivery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "process" }),
              });
              const b = await r.json();
              if (!r.ok) throw new Error(b.error?.message);
              toast.info(
                b.data.blocked
                  ? "A verified sender is required. Jobs remain queued."
                  : `Processed ${b.data.processed}; ${b.data.pending} remain.`,
              );
              await load();
            } catch (e) {
              toast.error(
                e instanceof Error ? e.message : "Queue processing failed.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Processing…" : "Process queued email"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-4 text-xs text-red-600">
          {error}
        </p>
      )}
      <details className="mt-5">
        <summary className="cursor-pointer text-sm font-medium">
          Latest {rows.length} delivery jobs
        </summary>
        <div className="mt-3 divide-y divide-ink/10">
          {rows.map((r) => (
            <div
              key={r._id}
              className="flex flex-wrap justify-between gap-3 py-3 text-xs"
            >
              <span>{r.subject}</span>
              <span className="text-ink/60">
                {r.status} · {r.attempts} attempts{" "}
                {r.error ? `· ${r.error}` : ""}
              </span>
            </div>
          ))}
          {!rows.length && (
            <p className="py-4 text-xs text-ink/60">
              No email jobs have been queued.
            </p>
          )}
        </div>
      </details>
    </section>
  );
}
