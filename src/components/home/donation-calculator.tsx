"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const amounts = [500, 1200, 2500, 5000];

export function DonationCalculator() {
  const [amount, setAmount] = useState(1200);
  const [monthly, setMonthly] = useState(true);
  const impact = useMemo(() => {
    const factor = monthly ? 12 : 1;
    return {
      learningDays: Math.max(2, Math.round((amount * factor) / 180)),
      meals: Math.round((amount * factor) / 42),
      seedlings: Math.round((amount * factor) / 240),
    };
  }, [amount, monthly]);

  return (
    <section className="section-space bg-[#0b2c25] text-white" aria-labelledby="giving-title">
      <div className="page-shell grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="eyebrow text-[#70d5b3]">See your gift at work</p>
          <h2 id="giving-title" className="mt-6 font-display text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl">Small choices. Long horizons.</h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-white/62">Monthly giving lets field teams plan past the next invoice. Adjust the amount to see an indicative annual impact.</p>
          <div className="mt-8 inline-flex rounded-full border border-white/12 bg-white/[0.06] p-1">
            {[true, false].map((value) => (
              <button key={String(value)} type="button" onClick={() => setMonthly(value)} className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${monthly === value ? "bg-white text-[#0b2c25]" : "text-white/58 hover:text-white"}`}>{value ? "Monthly" : "One time"}</button>
            ))}
          </div>
        </div>

        <div className="rounded-[2.4rem] border border-white/12 bg-white/[0.075] p-5 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {amounts.map((option) => (
              <button key={option} type="button" onClick={() => setAmount(option)} className={`relative rounded-2xl border px-3 py-4 font-display text-xl font-bold transition ${amount === option ? "border-[#f3bd67] bg-[#f3bd67] text-[#13211d]" : "border-white/12 bg-white/[0.045] text-white hover:border-white/25"}`}>
                ₹{option.toLocaleString("en-IN")}
                {amount === option ? <Check className="absolute right-2 top-2 size-3.5" aria-hidden="true" /> : null}
              </button>
            ))}
          </div>
          <label htmlFor="custom-amount" className="mt-5 block text-xs font-bold uppercase tracking-[0.16em] text-white/45">Or enter an amount</label>
          <div className="mt-2 flex items-center rounded-2xl border border-white/12 bg-black/10 px-4"><span className="text-white/45">₹</span><input id="custom-amount" type="number" min="100" max="1000000" value={amount} onChange={(event) => setAmount(Math.max(0, Number(event.target.value)))} className="w-full bg-transparent px-3 py-4 text-lg font-bold outline-none" /></div>

          <p className="mt-7 text-[0.66rem] font-extrabold uppercase tracking-[0.18em] text-[#70d5b3]">Your {monthly ? "annual" : "estimated"} ripple</p>
          <motion.div key={`${amount}-${monthly}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              [impact.learningDays, "learner-days supported"],
              [impact.meals, "nutritious meals"],
              [impact.seedlings, "native seedlings"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-white/[0.06] p-4"><strong className="font-display text-3xl text-[#f3bd67]">{value}</strong><span className="mt-1 block text-xs leading-5 text-white/48">{label}</span></div>
            ))}
          </motion.div>
          <Link href={`/donate?amount=${amount}&frequency=${monthly ? "monthly" : "once"}`} className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#f3bd67] px-6 text-sm font-extrabold text-[#13211d] transition hover:-translate-y-0.5 hover:bg-[#ffd182]">Continue with ₹{amount.toLocaleString("en-IN")} <ArrowRight className="size-4" aria-hidden="true" /></Link>
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-[0.65rem] text-white/38"><HeartHandshake className="size-3.5" aria-hidden="true" /> Secure checkout · receipt and 80G certificate by email</p>
        </div>
      </div>
    </section>
  );
}
