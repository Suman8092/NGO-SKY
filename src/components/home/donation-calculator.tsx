"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  type DonationFrequency,
  paymentProviderForFrequency,
  paymentProviderLabel,
  type PublicPaymentReadiness,
} from "@/lib/payment-readiness";

const amounts = [500, 1200, 2500, 5000];

export function DonationCalculator({
  paymentReadiness,
}: {
  paymentReadiness: PublicPaymentReadiness;
}) {
  const [amount, setAmount] = useState(1200);
  const [frequency, setFrequency] = useState<DonationFrequency>(() =>
    paymentReadiness.recurringProvider ? "monthly" : "one_time",
  );
  const provider = paymentProviderForFrequency(paymentReadiness, frequency);

  return (
    <section
      className="section-space bg-[#0b2c25] text-white"
      aria-labelledby="giving-title"
    >
      <div className="page-shell grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="eyebrow text-[#70d5b3]">Online giving</p>
          <h2
            id="giving-title"
            className="mt-6 font-display text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl"
          >
            Choose a gift amount.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-white/62">
            The selected amount is carried to the secure donation form. Payment
            is enabled only when the live provider and durable records are
            verified.
          </p>
          <div className="mt-8 inline-flex rounded-full border border-white/12 bg-white/[0.06] p-1">
            {(
              [
                {
                  value: "monthly",
                  label: "Monthly",
                  available: Boolean(paymentReadiness.recurringProvider),
                },
                {
                  value: "one_time",
                  label: "One time",
                  available: Boolean(paymentReadiness.oneTimeProvider),
                },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={!option.available}
                onClick={() => setFrequency(option.value)}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-35 ${frequency === option.value ? "bg-white text-[#0b2c25]" : "text-white/58 hover:text-white"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2.4rem] border border-white/12 bg-white/[0.075] p-5 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {amounts.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAmount(option)}
                className={`relative rounded-2xl border px-3 py-4 font-display text-xl font-bold transition ${amount === option ? "border-[#f3bd67] bg-[#f3bd67] text-[#13211d]" : "border-white/12 bg-white/[0.045] text-white hover:border-white/25"}`}
              >
                ₹{option.toLocaleString("en-IN")}
                {amount === option ? (
                  <Check
                    className="absolute right-2 top-2 size-3.5"
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            ))}
          </div>
          <label
            htmlFor="custom-amount"
            className="mt-5 block text-xs font-bold uppercase tracking-[0.16em] text-white/45"
          >
            Or enter an amount
          </label>
          <div className="mt-2 flex items-center rounded-2xl border border-white/12 bg-black/10 px-4">
            <span className="text-white/45">₹</span>
            <input
              id="custom-amount"
              type="number"
              min="100"
              max="1000000"
              value={amount}
              onChange={(event) =>
                setAmount(Math.max(0, Number(event.target.value)))
              }
              className="w-full bg-transparent px-3 py-4 text-lg font-bold outline-none"
            />
          </div>

          <motion.div
            key={`${amount}-${frequency}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl bg-white/[0.06] p-4 text-sm text-white/62"
          >
            {provider
              ? `${paymentProviderLabel(provider)} is configured for ${frequency === "one_time" ? "one-time" : "monthly"} checkout in this deployment.`
              : "Online checkout is not active for this frequency; no payment can be submitted."}
          </motion.div>
          <Link
            href={
              provider
                ? `/donate?amount=${amount}&frequency=${frequency}`
                : "/contact?subject=donation-support"
            }
            className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#f3bd67] px-6 text-sm font-extrabold text-[#13211d] transition hover:-translate-y-0.5 hover:bg-[#ffd182]"
          >
            {provider
              ? `Continue with ₹${amount.toLocaleString("en-IN")}`
              : "Check contact availability"}{" "}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-[0.65rem] text-white/38">
            <ShieldCheck className="size-3.5" aria-hidden="true" /> Checkout
            provider availability is checked on the server
          </p>
        </div>
      </div>
    </section>
  );
}
