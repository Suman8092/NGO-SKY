import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeIndianRupee,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Download,
  Ellipsis,
  HeartHandshake,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";

import { AccountGreeting } from "@/components/dashboard/account-greeting";

const metrics = [
  { label: "Gross donations", value: "₹42.8L", change: "+18.4%", icon: CircleDollarSign, positive: true },
  { label: "Active donors", value: "3,842", change: "+9.2%", icon: Users, positive: true },
  { label: "Monthly retention", value: "87.6%", change: "+2.1%", icon: TrendingUp, positive: true },
  { label: "Avg. gift", value: "₹2,460", change: "−3.8%", icon: BadgeIndianRupee, positive: false },
];

const campaigns = [
  ["Clean water, powered by sunlight", "Water & health", "₹36.4L", "₹48L", 76, "18 days"],
  ["Learning labs beyond the last mile", "Education", "₹22.8L", "₹32L", 71, "31 days"],
  ["Women growing climate-ready farms", "Livelihoods", "₹18.2L", "₹30L", 61, "44 days"],
] as const;

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-bold text-forest">Wednesday · 5 August 2026</p><h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl"><AccountGreeting role="admin" /></h1><p className="mt-2 text-sm text-ink/45">Here’s what moved across Ashaaya in the last 30 days.</p></div>
        <div className="flex gap-2"><button type="button" className="grid size-11 place-items-center rounded-full border border-ink/10 bg-white dark:bg-white/[0.06]" aria-label="Notifications"><Bell className="size-4" /></button><button type="button" className="button-primary min-h-11"><Plus className="size-4" /> New campaign</button></div>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return <article key={metric.label} className="rounded-3xl border border-ink/8 bg-white p-5 shadow-[0_12px_35px_rgba(15,50,43,.05)] dark:bg-white/[0.055]"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-2xl bg-forest/10 text-forest"><Icon className="size-5" /></span><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.65rem] font-bold ${metric.positive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300"}`}>{metric.positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{metric.change}</span></div><p className="mt-5 font-display text-3xl font-bold tracking-tight">{metric.value}</p><p className="mt-1 text-xs text-ink/45">{metric.label}</p></article>;
        })}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_0.75fr]">
        <article className="rounded-3xl border border-ink/8 bg-white p-5 shadow-[0_12px_35px_rgba(15,50,43,.05)] dark:bg-white/[0.055] sm:p-7">
          <div className="flex items-start justify-between"><div><h2 className="font-display text-xl font-bold">Donation performance</h2><p className="mt-1 text-xs text-ink/40">Net received · 1 Feb–31 Jul 2026</p></div><button type="button" className="button-secondary min-h-9 px-3 py-1.5 text-xs"><Download className="size-3.5" /> Export</button></div>
          <div className="mt-8 flex h-[250px] items-end gap-2 sm:gap-4" aria-label="Monthly donations increased from 4.8 lakh rupees in February to 9.1 lakh rupees in July">
            {[48, 55, 51, 67, 74, 91].map((value, index) => <div key={value} className="flex h-full flex-1 flex-col justify-end"><div className="group relative rounded-t-xl bg-gradient-to-t from-forest to-moss transition hover:brightness-110" style={{ height: `${value}%` }}><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[0.6rem] font-bold opacity-0 transition group-hover:opacity-100">₹{(value / 10).toFixed(1)}L</span></div><span className="mt-3 text-center text-[0.62rem] text-ink/38">{["Feb", "Mar", "Apr", "May", "Jun", "Jul"][index]}</span></div>)}
          </div>
        </article>

        <article className="rounded-3xl bg-[#0b3028] p-6 text-white shadow-lift sm:p-7">
          <div className="flex items-center justify-between"><div><p className="text-[0.62rem] font-bold uppercase tracking-[0.15em] text-[#70d5b3]">Allocation</p><h2 className="mt-2 font-display text-xl font-bold">Every ₹100 spent</h2></div><button type="button" aria-label="More allocation options"><Ellipsis className="size-5 text-white/45" /></button></div>
          <div className="mx-auto mt-8 grid size-40 place-items-center rounded-full bg-[conic-gradient(#63c9a8_0_91%,#f3bd67_91%_96%,#547c70_96%)]"><div className="grid size-28 place-items-center rounded-full bg-[#0b3028] text-center"><span><strong className="font-display text-3xl">₹91</strong><small className="block text-[0.58rem] uppercase tracking-wider text-white/40">to programs</small></span></div></div>
          <div className="mt-8 space-y-3 text-xs"><p className="flex justify-between"><span className="text-white/50">Program delivery</span><strong>91%</strong></p><p className="flex justify-between"><span className="text-white/50">Fundraising</span><strong>5%</strong></p><p className="flex justify-between"><span className="text-white/50">Governance</span><strong>4%</strong></p></div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <article className="overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-[0_12px_35px_rgba(15,50,43,.05)] dark:bg-white/[0.055]">
          <div className="flex items-center justify-between border-b border-ink/8 p-5 sm:px-7"><div><h2 className="font-display text-xl font-bold">Active campaigns</h2><p className="mt-1 text-xs text-ink/40">₹77.4L raised across featured work</p></div><button type="button" className="text-xs font-bold text-forest">Manage all</button></div>
          <div className="divide-y divide-ink/8">
            {campaigns.map(([title, category, raised, goal, progress, time]) => <div key={title} className="grid gap-4 p-5 sm:grid-cols-[1fr_160px_auto] sm:items-center sm:px-7"><div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-[0.65rem] text-ink/38">{category} · {time} left</p></div><div><div className="flex justify-between text-[0.6rem]"><span>{raised}</span><span className="text-ink/35">{goal}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/8"><div className="h-full rounded-full bg-forest" style={{ width: `${progress}%` }} /></div></div><button type="button" aria-label={`Open ${title}`} className="grid size-9 place-items-center rounded-full bg-ink/[0.045]"><ChevronRight className="size-4" /></button></div>)}
          </div>
        </article>

        <article className="rounded-3xl border border-ink/8 bg-white p-5 shadow-[0_12px_35px_rgba(15,50,43,.05)] dark:bg-white/[0.055] sm:p-7">
          <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">Live activity</h2><span className="flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-wider text-forest"><span className="size-1.5 animate-pulse rounded-full bg-forest" /> live</span></div>
          <div className="mt-6 space-y-5">
            {[
              ["₹5,000 donation received", "Clean water campaign · 2m"],
              ["Volunteer application", "Education mentor · 14m"],
              ["Field log verified", "Dhemaji response · 31m"],
              ["₹1,200 monthly gift", "Unrestricted fund · 47m"],
            ].map(([title, detail], index) => <div key={title} className="flex gap-3"><span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${index % 2 ? "bg-amber-50 text-amber-700 dark:bg-amber-400/10" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10"}`}>{index % 2 ? <HeartHandshake className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}</span><span><strong className="block text-xs">{title}</strong><span className="mt-1 block text-[0.62rem] text-ink/38">{detail}</span></span></div>)}
          </div>
        </article>
      </section>
    </div>
  );
}
