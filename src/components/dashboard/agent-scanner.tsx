"use client";

import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  QrCode,
  Search,
  Ticket,
  UserCheck,
  XCircle,
} from "lucide-react";

type PassData = {
  ticketCode: string;
  name: string;
  email: string;
  phone?: string;
  eventTitle: string;
  eventDate?: string;
  eventLocation?: string;
  ticketsCount: number;
  notes?: string;
  status: "confirmed" | "attended" | "cancelled";
  registeredAt?: string;
};

export function AgentScanner() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pass, setPass] = useState<PassData | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<string[]>([]);

  async function handleLookup(e: FormEvent) {
    e.preventDefault();
    const code = query.trim().toUpperCase();
    if (!code) return;

    setError(null);
    setLoading(true);
    setPass(null);

    try {
      const res = await fetch(`/api/events/checkin?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error?.message || "Pass not found. Verify code.");
      }
      setPass(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to lookup pass.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn() {
    if (!pass) return;
    setCheckingIn(true);
    setError(null);

    try {
      const res = await fetch("/api/events/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketCode: pass.ticketCode,
          action: "check_in",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error?.message || "Failed to check in pass.");
      }

      setPass((prev) => (prev ? { ...prev, status: "attended" } : null));
      setRecentCheckIns((prev) => [
        `${pass.name} (${pass.ticketCode}) · ${new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })}`,
        ...prev.slice(0, 4),
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not complete check in.");
    } finally {
      setCheckingIn(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Code Entry Card */}
      <div className="rounded-3xl border border-ink/8 bg-white p-6 shadow-sm dark:bg-white/[0.04] sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-forest/10 text-forest dark:bg-[#91c4ff]/15 dark:text-[#91c4ff]">
            <QrCode className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-ink dark:text-white">
              Pass Verification & Desk Check-In
            </h2>
            <p className="text-xs text-ink/50 dark:text-white/50">
              Enter the supporter's 8-character pass code (printed on digital cards or email receipt).
            </p>
          </div>
        </div>

        <form onSubmit={handleLookup} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink/35" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              placeholder="e.g. TKT-343CE01B"
              className="w-full rounded-2xl border border-ink/10 bg-forest/[0.02] py-3.5 pl-11 pr-4 font-mono text-sm uppercase tracking-wider text-ink outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-ink/35 focus:border-forest focus:ring-4 focus:ring-forest/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#91c4ff]"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="button-primary min-h-12 px-6 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Verifying...
              </>
            ) : (
              "Verify Pass"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs font-semibold text-amber-900 dark:text-amber-200">
            <CircleAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Verified Pass Card */}
      {pass && (
        <div className="overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-lift dark:bg-[#071d33]">
          <div className="border-b border-ink/8 bg-forest/[0.04] p-6 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Ticket className="size-6 text-forest dark:text-[#91c4ff]" />
                <div>
                  <div className="font-mono text-xs font-bold tracking-wider text-forest dark:text-[#91c4ff]">
                    {pass.ticketCode}
                  </div>
                  <h3 className="font-display text-xl font-bold text-ink dark:text-white">
                    {pass.name}
                  </h3>
                </div>
              </div>

              <div>
                {pass.status === "confirmed" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="size-3.5" /> Ready for Check-in
                  </span>
                )}
                {pass.status === "attended" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-300">
                    <UserCheck className="size-3.5" /> Checked In
                  </span>
                )}
                {pass.status === "cancelled" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-300">
                    <XCircle className="size-3.5" /> Cancelled
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <div className="space-y-3">
              <div>
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-ink/45 dark:text-white/45">
                  Event
                </span>
                <p className="font-bold text-ink dark:text-white">{pass.eventTitle}</p>
                {pass.eventDate && (
                  <p className="text-xs text-ink/65 dark:text-white/65">{pass.eventDate}</p>
                )}
                {pass.eventLocation && (
                  <p className="text-xs text-ink/50 dark:text-white/50">{pass.eventLocation}</p>
                )}
              </div>

              <div>
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-ink/45 dark:text-white/45">
                  Contact
                </span>
                <p className="text-xs text-ink dark:text-white">{pass.email}</p>
                {pass.phone && (
                  <p className="text-xs text-ink/65 dark:text-white/65">{pass.phone}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-ink/45 dark:text-white/45">
                  Reserved Capacity
                </span>
                <p className="text-2xl font-bold text-forest dark:text-[#91c4ff]">
                  {pass.ticketsCount} <span className="text-sm font-normal text-ink/60 dark:text-white/60">seat{pass.ticketsCount === 1 ? "" : "s"}</span>
                </p>
                {pass.notes && (
                  <p className="mt-1 text-xs italic text-ink/50 dark:text-white/50">
                    Note: "{pass.notes}"
                  </p>
                )}
              </div>

              <div>
                {pass.status === "confirmed" ? (
                  <button
                    type="button"
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                    className="button-primary w-full justify-center bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600"
                  >
                    {checkingIn ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Recording Check-In...
                      </>
                    ) : (
                      <>
                        <UserCheck className="size-4" /> Confirm & Check In Attendee
                      </>
                    )}
                  </button>
                ) : pass.status === "attended" ? (
                  <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3 text-center text-xs font-bold text-sky-800 dark:text-sky-200">
                    ✓ Supporter has already been admitted.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-center text-xs font-bold text-rose-800 dark:text-rose-200">
                    This registration was cancelled.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Check-In Log */}
      {recentCheckIns.length > 0 && (
        <div className="rounded-3xl border border-ink/8 bg-white p-6 dark:bg-white/[0.04]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-white/50">
            Recent Admitted Attendees Today
          </h4>
          <ul className="mt-3 divide-y divide-ink/8 text-xs font-medium text-ink dark:text-white">
            {recentCheckIns.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 py-2">
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

