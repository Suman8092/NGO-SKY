"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

const questions = [
  ["How much of my donation reaches programs?", "In FY 2025–26, 91% of total expenditure supported program delivery and field monitoring. The remaining 9% funded fundraising, governance, audit, technology, and essential operations. Our audited statements explain every category."],
  ["Will I receive an 80G tax certificate?", "Yes. Eligible donors in India receive a payment receipt immediately and a consolidated 80G certificate by email after PAN and address details are verified."],
  ["Can I choose where my gift is used?", "You can fund a featured campaign or program. Unrestricted gifts go to the highest verified need, which gives field teams the flexibility to respond quickly and sustain less-visible essentials."],
  ["How do you verify impact figures?", "Field teams log attendance, service delivery, procurement, and participant feedback. Quarterly reconciliations, outcome samples, partner reviews, and annual external audits turn those records into published figures."],
  ["Can my company or team partner with Ashaaya?", "Yes. We design multi-year program partnerships, employee giving, skills-based volunteering, and transparent reporting packages around shared outcomes—not logo placement alone."],
] as const;

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-ink/10">
      {questions.map(([question, answer], index) => {
        const active = open === index;
        return (
          <div key={question}>
            <h3>
              <button type="button" className="flex w-full items-center justify-between gap-5 py-6 text-left font-display text-lg font-bold tracking-tight sm:text-xl" onClick={() => setOpen(active ? -1 : index)} aria-expanded={active}>
                {question}<span className={`grid size-9 shrink-0 place-items-center rounded-full transition ${active ? "bg-forest text-white dark:text-[#071813]" : "bg-ink/5"}`}>{active ? <Minus className="size-4" /> : <Plus className="size-4" />}</span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {active ? <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden"><p className="max-w-3xl pb-6 pr-12 text-sm leading-7 text-ink/62 sm:text-base">{answer}</p></motion.div> : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
