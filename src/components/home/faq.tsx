"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

const questions = [
  ["How much of my donation reaches programs?", "In FY 2025–26, 91% of total expenditure supported program delivery and field monitoring. The remaining 9% funded fundraising, governance, audit, technology, and essential operations. Our audited statements explain every category."],
  ["Are receipts or tax documents available?", "This website does not promise a receipt or tax document. Ask through a verified contact channel about current documentation before donating; the online form does not collect PAN details."],
  ["Can I choose where my gift is used?", "You can fund a featured campaign or program. Unrestricted gifts go to the highest verified need, which gives field teams the flexibility to respond quickly and sustain less-visible essentials."],
  ["How do you verify impact figures?", "Field teams log attendance, service delivery, procurement, and participant feedback. Quarterly reconciliations, outcome samples, partner reviews, and annual external audits turn those records into published figures."],
  ["Can my company or team partner with Skymeredian?", "Yes. We design multi-year program partnerships, employee giving, skills-based volunteering, and transparent reporting packages around shared outcomes—not logo placement alone."],
] as const;

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-3.5">
      {questions.map(([question, answer], index) => {
        const active = open === index;
        return (
          <div
            key={question}
            className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
              active
                ? "border-forest/25 bg-white/80 shadow-[0_8px_30px_-15px_rgba(12,53,45,0.06)] dark:border-forest/35 dark:bg-white/[0.04]"
                : "border-ink/[0.06] bg-white/40 hover:border-forest/20 hover:bg-white/60 dark:border-white/[0.06] dark:bg-white/[0.02]"
            }`}
          >
            <h3>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-5 p-6 text-left font-display text-lg font-bold tracking-tight text-ink transition sm:text-xl"
                onClick={() => setOpen(active ? -1 : index)}
                aria-expanded={active}
              >
                <span>{question}</span>
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
                    active
                      ? "bg-forest text-white dark:text-[#071327]"
                      : "bg-ink/[0.06] text-ink/70 dark:bg-white/10 dark:text-white/80"
                  }`}
                >
                  {active ? <Minus className="size-4" /> : <Plus className="size-4" />}
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {active ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="max-w-3xl px-6 pb-6 text-sm leading-relaxed text-ink/70 sm:text-base">
                    {answer}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
