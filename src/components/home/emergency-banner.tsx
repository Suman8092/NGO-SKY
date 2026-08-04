"use client";

import { ArrowRight, Clock3 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const deadline = new Date("2026-08-12T23:59:59+05:30").getTime();

function remaining() {
  const delta = Math.max(0, deadline - Date.now());
  return {
    days: Math.floor(delta / 86_400_000),
    hours: Math.floor((delta / 3_600_000) % 24),
    minutes: Math.floor((delta / 60_000) % 60),
  };
}

export function EmergencyBanner() {
  const [time, setTime] = useState(remaining);
  useEffect(() => {
    const timer = window.setInterval(() => setTime(remaining()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="page-shell py-6" aria-labelledby="emergency-title">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#8e2f25] px-6 py-7 text-white shadow-lift sm:px-8 md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-8 lg:px-10">
        <div aria-hidden="true" className="absolute -right-12 -top-20 size-64 rounded-full bg-[#f29a62]/30 blur-3xl" />
        <div className="relative">
          <p className="flex items-center gap-2 text-[0.66rem] font-extrabold uppercase tracking-[0.2em] text-[#ffd8bf]"><span className="size-2 animate-pulse rounded-full bg-[#ffbf86]" /> Emergency response · Assam floods</p>
          <h2 id="emergency-title" className="mt-3 max-w-2xl font-display text-2xl font-bold tracking-tight sm:text-3xl">Safe water and shelter cannot wait for the rain to stop.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/68">Field teams are supplying 1,800 displaced families. A matching partner doubles every gift until 12 August.</p>
        </div>
        <div className="relative mt-6 flex flex-wrap items-center gap-4 md:mt-0 md:justify-end">
          <div className="flex items-center gap-3 rounded-2xl border border-white/14 bg-black/10 px-4 py-3 backdrop-blur-lg" aria-label={`${time.days} days, ${time.hours} hours, and ${time.minutes} minutes remaining`}>
            <Clock3 className="size-4 text-[#ffd8bf]" aria-hidden="true" />
            {[ [time.days, "days"], [time.hours, "hrs"], [time.minutes, "min"] ].map(([value, label], index) => (
              <span key={label} className="flex items-baseline gap-1"><strong className="font-display text-xl">{String(value).padStart(2, "0")}</strong><span className="text-[0.58rem] uppercase tracking-wider text-white/45">{label}</span>{index < 2 ? <span className="ml-2 text-white/25">:</span> : null}</span>
            ))}
          </div>
          <Link href="/donate?campaign=assam-flood-response" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#70251d] transition hover:-translate-y-0.5">Respond now <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
