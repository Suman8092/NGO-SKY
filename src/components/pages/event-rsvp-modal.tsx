"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Ticket,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";

export type EventItem = {
  title: string;
  date: string;
  time: string;
  location: string;
  format?: string;
  type?: string;
};

export function EventRsvpModal({
  event,
  open,
  onClose,
}: {
  event: EventItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    ticketCode: string;
    ticketsCount: number;
    message: string;
  } | null>(null);

  if (!open || !event) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!event) return;
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      eventId: event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      eventTitle: event.title,
      eventDate: `${event.date} · ${event.time}`,
      eventLocation: event.location,
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim() || undefined,
      ticketsCount: Number(formData.get("ticketsCount") ?? 1),
      notes: String(formData.get("notes") ?? "").trim() || undefined,
      consent: formData.get("consent") === "on",
    };

    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(
          data.error?.message ||
            "Unable to complete registration. Please check your details.",
        );
      }

      setSuccessData({
        ticketCode: data.data.ticketCode,
        ticketsCount: data.data.ticketsCount,
        message: data.data.message,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setError(null);
    setSuccessData(null);
    onClose();
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rsvp-modal-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-ink/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0c1a2e] sm:p-8"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-ink/60 transition hover:bg-ink/5 hover:text-ink dark:text-white/60 dark:hover:bg-white/10"
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>

          {successData ? (
            /* Success confirmation card */
            <div className="py-4 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-8" />
              </div>
              <h2
                id="rsvp-modal-title"
                className="mt-4 font-display text-2xl font-bold tracking-tight text-ink dark:text-white"
              >
                Registration Confirmed!
              </h2>
              <p className="mt-2 text-sm text-ink/60 dark:text-white/60">
                A confirmation with full event details has been sent to your email.
              </p>

              {/* Ticket pass display */}
              <div className="mt-6 rounded-2xl border border-dashed border-forest/30 bg-forest/[0.04] p-5 text-left dark:border-[#91c4ff]/30 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between border-b border-ink/10 pb-3 dark:border-white/10">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest dark:text-[#91c4ff]">
                    <Ticket className="size-4" /> Entry Pass
                  </span>
                  <span className="rounded-full bg-forest/10 px-2.5 py-0.5 font-mono text-xs font-extrabold text-forest dark:bg-[#91c4ff]/20 dark:text-[#91c4ff]">
                    {successData.ticketCode}
                  </span>
                </div>
                <h3 className="mt-3 font-bold text-ink dark:text-white">
                  {event.title}
                </h3>
                <div className="mt-2 space-y-1 text-xs text-ink/60 dark:text-white/60">
                  <p className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" /> {event.date} · {event.time}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" /> {event.location}
                  </p>
                  <p className="mt-2 font-medium text-ink dark:text-white">
                    Reserved Seats: {successData.ticketsCount}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="button-primary mt-6 w-full"
              >
                Done
              </button>
            </div>
          ) : (
            /* RSVP Registration Form */
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-forest dark:text-[#91c4ff]">
                Event RSVP
              </p>
              <h2
                id="rsvp-modal-title"
                className="mt-1 font-display text-2xl font-bold tracking-tight text-ink dark:text-white"
              >
                Reserve your place
              </h2>

              {/* Event mini banner */}
              <div className="mt-4 rounded-xl bg-forest/5 p-3.5 dark:bg-white/5">
                <p className="text-sm font-bold text-ink dark:text-white">
                  {event.title}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/60 dark:text-white/60">
                  <span className="flex items-center gap-1">
                    <Clock3 className="size-3" /> {event.date} · {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> {event.location}
                  </span>
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink dark:text-white/90">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Your legal or preferred name"
                    className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10 dark:border-white/15 dark:bg-white/5 dark:text-white"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-ink dark:text-white/90">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10 dark:border-white/15 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink dark:text-white/90">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10 dark:border-white/15 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink dark:text-white/90">
                    Number of Attendees
                  </label>
                  <select
                    name="ticketsCount"
                    defaultValue="1"
                    className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10 dark:border-white/15 dark:bg-white/5 dark:text-white"
                  >
                    <option value="1">1 Person (Just me)</option>
                    <option value="2">2 Persons</option>
                    <option value="3">3 Persons</option>
                    <option value="4">4 Persons</option>
                    <option value="5">5 Persons</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink dark:text-white/90">
                    Accessibility or Dietary Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Wheelchair access, dietary restrictions, interpretation, etc."
                    className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-sm text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10 dark:border-white/15 dark:bg-white/5 dark:text-white"
                  />
                </div>

                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="event-consent"
                    name="consent"
                    required
                    className="mt-1 size-4 rounded border-ink/20 text-forest focus:ring-forest"
                  />
                  <label
                    htmlFor="event-consent"
                    className="text-xs leading-5 text-ink/70 dark:text-white/70"
                  >
                    I agree to receive event communications and logistics updates for this gathering.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="button-primary mt-2 w-full justify-center disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Reserving...
                    </>
                  ) : (
                    "Confirm Reservation"
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
