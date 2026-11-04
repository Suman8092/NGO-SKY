"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  paymentProviderLabel,
  type PublicPaymentReadiness,
} from "@/lib/payment-readiness";

const amounts = [500, 1200, 2500, 5000];

const impactTiers: Record<number, string> = {
  500: "Provides essential learning kits & classroom supplies for a child.",
  1200: "Supplies solar-pumped clean drinking water for a village family.",
  2500: "Funds one full semester of hands-on STEM lab training.",
  5000: "Supports micro-enterprise seed capital for rural women farmers.",
};

export function DonationCalculator({
  paymentReadiness,
}: {
  paymentReadiness: PublicPaymentReadiness;
}) {
  const [amount, setAmount] = useState(1200);
  const provider = paymentReadiness.oneTimeProvider;
  const currentImpact = impactTiers[amount] ?? "Directly fuels verified community programs across health, water, and education.";

  return (
    <section
      className="section-space relative overflow-hidden bg-gradient-to-b from-[#0a2721] via-[#07201b] to-[#051814] text-white"
      aria-labelledby="giving-title"
    >
      <div
        aria-hidden="true"
        className="absolute -left-32 top-10 size-[32rem] rounded-full bg-[#70d5b3]/10 blur-[130px] pointer-events-none"
      />
      <div className="page-shell relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#70d5b3]/25 bg-[#70d5b3]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#70d5b3]">
            <ShieldCheck className="size-3.5" />
            Transparent Philanthropy
          </span>
          <h2
            id="giving-title"
            className="mt-6 font-display text-5xl font-semibold leading-[0.96] tracking-[-0.055em] text-white sm:text-6xl"
          >
            Choose your contribution.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
            Every contribution directly empowers field-led programs with transparent financial accounting and statutory 80G tax certificates.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-bold text-white/80 backdrop-blur-md">
              <span className="size-2 rounded-full bg-[#70d5b3]" />
              Domestic one-time INR
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/60">
              Tax exemption eligible (80G)
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-2xl sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#70d5b3]">
            Select Giving Tier
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {amounts.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAmount(option)}
                className={`relative rounded-2xl border px-4 py-4 font-display text-xl font-bold transition duration-300 ${
                  amount === option
                    ? "border-[#f3bd67] bg-gradient-to-b from-[#ffd385] to-[#f3bd67] text-[#091f1a] shadow-[0_8px_25px_rgba(243,189,103,0.35)] scale-[1.02]"
                    : "border-white/12 bg-white/[0.05] text-white hover:border-white/30 hover:bg-white/10"
                }`}
              >
                ₹{option.toLocaleString("en-IN")}
                {amount === option ? (
                  <Check
                    className="absolute right-2.5 top-2.5 size-3.5 stroke-[3]"
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-relaxed text-white/80">
            <strong className="block text-[#f3bd67] font-semibold mb-1">Impact Equivalent:</strong>
            {currentImpact}
          </div>

          <label
            htmlFor="custom-amount"
            className="mt-6 block text-xs font-bold uppercase tracking-[0.16em] text-white/50"
          >
            Or specify custom amount (INR)
          </label>
          <div className="mt-2 flex items-center rounded-2xl border border-white/15 bg-black/20 px-4 focus-within:border-[#f3bd67] focus-within:ring-2 focus-within:ring-[#f3bd67]/20 transition">
            <span className="text-xl font-bold text-white/50">₹</span>
            <input
              id="custom-amount"
              type="number"
              min="100"
              max="1000000"
              value={amount}
              onChange={(event) =>
                setAmount(Math.max(0, Number(event.target.value)))
              }
              className="w-full bg-transparent px-3 py-3.5 text-xl font-bold text-white outline-none"
            />
          </div>

          <motion.div
            key={amount}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex items-center gap-2.5 rounded-2xl bg-white/[0.05] px-4 py-3 text-xs text-white/70"
          >
            <span className="size-1.5 rounded-full bg-[#70d5b3] shrink-0" />
            <span>
              {provider
                ? `Verified live gateway: ${paymentProviderLabel(provider)} with encrypted TLS.`
                : "Online checkout is not active; no payment can be submitted."}
            </span>
          </motion.div>
          <Link
            href={
              provider
                ? `/donate?amount=${amount}`
                : "/contact?subject=donation-support"
            }
            className="group mt-6 flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#ffd385] to-[#f3bd67] px-6 text-sm font-extrabold text-[#091f1a] shadow-[0_12px_36px_rgba(243,189,103,0.3)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(243,189,103,0.45)]"
          >
            {provider
              ? `Proceed with ₹${amount.toLocaleString("en-IN")}`
              : "Check contact availability"}{" "}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-[0.68rem] text-white/45">
            <ShieldCheck className="size-3.5 text-[#70d5b3]" aria-hidden="true" /> 256-bit bank-grade encryption · Instant 80G tax receipt
          </p>
        </div>
      </div>
    </section>
  );
}
