"use client";

import { ArrowRight, CalendarDays, Clock3, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";

import { EventRsvpModal, type EventItem } from "./event-rsvp-modal";

export function EventCardWithRsvp({
  event,
}: {
  event: EventItem & {
    description: string;
    featured?: boolean;
    format: string;
    type: string;
    href?: string;
  };
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <article
        className={`grid overflow-hidden rounded-[2rem] border transition-all duration-300 hover:shadow-lift ${
          event.featured
            ? "border-teal-800 bg-[#071e33] text-white shadow-2xl lg:grid-cols-[13rem_1fr]"
            : "border-ink/[0.08] bg-white/80 backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.04]"
        }`}
      >
        <div
          className={`${
            event.featured
              ? "flex min-h-48 flex-col justify-between bg-gradient-to-br from-teal-700 to-teal-950 p-7"
              : "p-7 pb-0"
          }`}
        >
          <CalendarDays
            aria-hidden="true"
            className={`h-7 w-7 ${
              event.featured ? "text-amber-300" : "text-forest dark:text-[#91c4ff]"
            }`}
          />
          <div className="mt-8">
            <p
              className={`text-xs font-bold uppercase tracking-[0.16em] ${
                event.featured
                  ? "text-teal-200"
                  : "text-forest dark:text-[#91c4ff]"
              }`}
            >
              {event.type}
            </p>
            <p
              className={`mt-2 text-xl font-bold ${
                event.featured ? "text-white" : "text-ink dark:text-white"
              }`}
            >
              {event.date}
            </p>
          </div>
        </div>

        <div className="flex flex-col p-7">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-forest dark:bg-[#91c4ff]/15 dark:text-[#91c4ff]">
              {event.format}
            </span>
            {event.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-bold text-amber-300">
                <Sparkles className="size-3" /> Featured
              </span>
            )}
          </div>

          <h2
            className={`mt-4 text-2xl font-bold tracking-tight ${
              event.featured ? "text-white" : "text-ink dark:text-white"
            }`}
          >
            {event.title}
          </h2>

          <p
            className={`mt-3 flex-1 leading-7 ${
              event.featured
                ? "text-slate-300"
                : "text-ink/65 dark:text-white/65"
            }`}
          >
            {event.description}
          </p>

          <div
            className={`mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold ${
              event.featured
                ? "text-slate-300"
                : "text-ink/50 dark:text-white/50"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
              {event.time}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
              {event.location}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className={`mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
              event.featured
                ? "bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md"
                : "bg-forest text-white hover:bg-[#00427d] dark:bg-[#91c4ff] dark:text-[#06192d]"
            }`}
          >
            Reserve your place{" "}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </article>

      <EventRsvpModal
        event={event}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

export function QuickEventRsvpButton({
  event,
  label = "View details",
}: {
  event: EventItem;
  label?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-forest hover:underline dark:text-[#91c4ff]"
      >
        {label} <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </button>

      <EventRsvpModal
        event={event}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

