"use client";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { NgoRecord } from "@/lib/ngo/catalog";
import { loadCheckoutScript } from "./member-hub";
export function RecurringDonations() {
  const [records, setRecords] = useState<NgoRecord[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function load() {
    try {
      const r = await fetch("/api/ngo/recurring", { cache: "no-store" });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error?.message);
      setRecords(b.data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Recurring records unavailable.",
      );
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function action(id: string, action: string) {
    setBusy(true);
    try {
      const r = await fetch("/api/ngo/recurring", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error?.message);
      await load();
      toast.success(`Gateway status: ${b.data.status}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gateway action failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="border-t border-ink/15 pt-6">
      <h2 className="text-xl font-semibold">Monthly Auto Pay donations</h2>
      <p className="mt-3 text-sm leading-7 text-ink/60">
        Set up a gateway-authorized monthly mandate for up to 120 payments.
        Pause, resume, or cancel through the gateway; only captured charges
        count as donations.
      </p>
      {error && (
        <p role="status" className="mt-3 text-sm text-ink/60">
          {error}
        </p>
      )}
      <div className="mt-4 divide-y divide-ink/10">
        {records.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-4 py-4 text-sm"
          >
            <p>
              INR {Number(r.data.amount).toLocaleString("en-IN")} / month ·{" "}
              <strong>{r.status}</strong>
            </p>
            <div className="flex gap-3 text-xs font-semibold text-forest">
              {r.status === "active" && (
                <button
                  disabled={busy}
                  type="button"
                  onClick={() => void action(r.id, "pause")}
                >
                  Pause
                </button>
              )}
              {r.status === "paused" && (
                <button
                  disabled={busy}
                  type="button"
                  onClick={() => void action(r.id, "resume")}
                >
                  Resume
                </button>
              )}
              {!["cancelled", "completed", "setup-failed"].includes(
                r.status,
              ) && (
                <button
                  disabled={busy}
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Cancel this recurring donation mandate at the gateway?",
                      )
                    )
                      void action(r.id, "cancel");
                  }}
                >
                  Stop
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <form
        className="mt-5 max-w-xl space-y-4"
        onSubmit={async (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          setBusy(true);
          const f = new FormData(event.currentTarget);
          try {
            const r = await fetch("/api/ngo/recurring", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: Number(f.get("amount")),
                consent: f.get("consent") === "on",
              }),
            });
            const b = await r.json();
            if (!r.ok) throw new Error(b.error?.message);
            await loadCheckoutScript();
            const Razorpay = (
              window as unknown as {
                Razorpay: new (options: unknown) => { open: () => void };
              }
            ).Razorpay;
            new Razorpay({
              key: b.data.keyId,
              subscription_id: b.data.subscriptionId,
              name: "Skymeredian Foundation",
              description: "Monthly donation mandate",
              handler: () => {
                toast.info(
                  "Mandate submitted. Final status is reconciled from signed gateway events.",
                );
                void load();
              },
            }).open();
            await load();
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : "Auto Pay setup unavailable.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="grid gap-2 text-sm">
          Monthly amount (INR)
          <input
            type="number"
            name="amount"
            min={100}
            max={1000000}
            step={1}
            required
            className="ngo-input"
          />
        </label>
        <label className="flex items-start gap-3 text-xs leading-6 text-ink/65">
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-1 size-4"
          />
          I authorize setup of a recurring monthly donation mandate and
          understand that authorization and cancellation are handled by the
          payment gateway.
        </label>
        <button disabled={busy} className="button-primary min-h-10 text-xs">
          {busy ? "Contacting gateway…" : "Set up monthly donation"}
        </button>
      </form>
    </section>
  );
}
