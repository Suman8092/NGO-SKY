import { ArrowRight, Award, CalendarDays, Download, Heart, Leaf, ReceiptText, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AccountGreeting } from "@/components/dashboard/account-greeting";

export default function UserDashboard() {
  return (
    <div className="mx-auto max-w-[1300px]">
      <div className="rounded-4xl bg-[#0b3028] p-6 text-white shadow-lift sm:p-9">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#70d5b3]">Your impact · since March 2024</p><h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl"><AccountGreeting role="user" /></h1><p className="mt-4 max-w-xl text-sm leading-7 text-white/55">Twenty-nine gifts have helped fund learning, clean water, and the work that must move first.</p></div>
          <div className="rounded-3xl border border-white/12 bg-white/[0.06] px-6 py-5"><p className="text-[0.62rem] font-bold uppercase tracking-wider text-white/40">Total given</p><p className="mt-2 font-display text-4xl font-bold text-[#f3bd67]">₹34,800</p><p className="mt-1 text-xs text-white/40">₹1,200 monthly · active</p></div>
        </div>
      </div>

      <section className="mt-5 grid gap-4 sm:grid-cols-3" aria-label="Your impact">
        {[[Sparkles, "193", "learner-days"], [Leaf, "58", "native seedlings"], [Heart, "828", "nutritious meals"]].map(([Icon, value, label]) => <div key={label as string} className="rounded-3xl border border-ink/8 bg-white p-5 dark:bg-white/[0.055]"><Icon className="size-5 text-forest" /><p className="mt-4 font-display text-3xl font-bold">{value as string}</p><p className="text-xs text-ink/40">estimated {label as string}</p></div>)}
      </section>

      <section id="giving" className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-3xl border border-ink/8 bg-white p-5 dark:bg-white/[0.055] sm:p-7">
          <div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-bold">Giving history</h2><p className="mt-1 text-xs text-ink/40">Receipts and certificates are ready anytime.</p></div><button type="button" className="button-secondary min-h-9 px-3 py-2 text-xs"><Download className="size-3.5" /> Statement</button></div>
          <div className="mt-6 divide-y divide-ink/8">
            {[
              ["31 Jul 2026", "Monthly impact fund", "₹1,200", "RCPT-29071"],
              ["30 Jun 2026", "Monthly impact fund", "₹1,200", "RCPT-28642"],
              ["31 May 2026", "Monthly impact fund", "₹1,200", "RCPT-28018"],
              ["18 May 2026", "Assam flood response", "₹5,000", "RCPT-27891"],
            ].map(([date, fund, amount, receipt]) => <div key={receipt} className="grid gap-3 py-4 sm:grid-cols-[105px_1fr_auto_auto] sm:items-center"><span className="text-xs text-ink/42">{date}</span><span className="text-sm font-bold">{fund}</span><span className="font-display text-sm font-bold">{amount}</span><button type="button" className="grid size-8 place-items-center rounded-full bg-ink/[0.045]" aria-label={`Download receipt ${receipt}`}><ReceiptText className="size-3.5" /></button></div>)}
          </div>
        </article>

        <article id="certificates" className="rounded-3xl bg-[#f0c16d] p-6 text-[#17231f] sm:p-7"><Award className="size-7" /><p className="mt-8 text-[0.62rem] font-extrabold uppercase tracking-[0.16em] opacity-45">FY 2025–26</p><h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Your 80G certificate is ready.</h2><p className="mt-4 text-sm leading-6 opacity-60">Includes every eligible gift from 1 April 2025 to 31 March 2026.</p><button type="button" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#102d26] px-5 text-sm font-bold text-white"><Download className="size-4" /> Download PDF</button></article>
      </section>

      <section id="saved" className="mt-5 rounded-3xl border border-ink/8 bg-white p-5 dark:bg-white/[0.055] sm:p-7">
        <div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-bold">Saved campaigns</h2><p className="mt-1 text-xs text-ink/40">Follow updates without making a gift.</p></div><Link href="/campaigns" className="text-xs font-bold text-forest">Browse all</Link></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[["/images/campaign-water.png", "Clean water, powered by sunlight", "76% funded"], ["/images/campaign-farming.png", "Women growing climate-ready farms", "61% funded"]].map(([image, title, progress]) => <Link key={title} href="/campaigns" className="group flex gap-4 rounded-2xl border border-ink/8 p-3"><div className="relative size-20 shrink-0 overflow-hidden rounded-xl"><Image src={image} alt="" fill sizes="80px" className="object-cover" /></div><div className="flex min-w-0 flex-1 flex-col justify-center"><h3 className="font-display text-sm font-bold leading-5">{title}</h3><p className="mt-2 text-[0.65rem] text-forest">{progress}</p></div><ArrowRight className="my-auto size-4 text-ink/25 transition group-hover:translate-x-1 group-hover:text-forest" /></Link>)}
        </div>
      </section>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-forest/15 bg-forest/[0.06] p-4 text-xs text-ink/55"><CalendarDays className="size-4 text-forest" /><p>Your next monthly gift is scheduled for <strong className="text-ink">31 August 2026</strong>. <button type="button" className="ml-1 font-bold text-forest">Manage giving</button></p></div>
    </div>
  );
}
