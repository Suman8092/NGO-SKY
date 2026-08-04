"use client";

import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  CircleDollarSign,
  FileImage,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const adminLinks = [
  ["Overview", "/admin", LayoutDashboard],
  ["Campaigns", "/admin/campaigns", HeartHandshake],
  ["Donations", "/admin/donations", CircleDollarSign],
  ["People", "/admin/users", Users],
  ["Volunteers", "/admin/volunteers", ShieldCheck],
  ["Events", "/admin/events", CalendarDays],
  ["Stories", "/admin/stories", BookOpen],
  ["Media", "/admin/media", FileImage],
  ["Analytics", "/admin/analytics", BarChart3],
  ["Settings", "/admin/settings", Settings],
] as const;

export function DashboardSidebar({ role = "admin" }: { role?: "admin" | "user" }) {
  const [open, setOpen] = useState(false);
  const userLinks = [
    ["Overview", "/dashboard", LayoutDashboard],
    ["Giving history", "/dashboard#giving", CircleDollarSign],
    ["Saved campaigns", "/dashboard#saved", HeartHandshake],
    ["Certificates", "/dashboard#certificates", ShieldCheck],
    ["Notifications", "/dashboard#notifications", Bell],
    ["Settings", "/dashboard#settings", Settings],
  ] as const;
  const links = role === "admin" ? adminLinks : userLinks;

  return (
    <>
      <button type="button" className="fixed left-4 top-4 z-50 grid size-11 place-items-center rounded-full bg-[#0c2d26] text-white shadow-xl lg:hidden" onClick={() => setOpen(true)} aria-label="Open dashboard navigation"><Menu className="size-5" /></button>
      {open ? <button type="button" aria-label="Close dashboard navigation" className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} /> : null}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-white/8 bg-[#071c18] p-5 text-white transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3"><BrandMark className="text-[#63c9a8]" /><span className="font-display text-sm font-extrabold uppercase leading-tight">Ashaaya<span className="block text-[0.53rem] tracking-[0.2em] text-white/35">{role === "admin" ? "Operations" : "My giving"}</span></span></Link>
          <button type="button" className="grid size-9 place-items-center rounded-full border border-white/10 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="size-4" /></button>
        </div>
        <div className="mt-8 flex items-center gap-2 rounded-2xl border border-white/9 bg-white/[0.055] px-3 py-2.5"><Search className="size-4 text-white/35" /><input placeholder="Search" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-white/30" /></div>
        <nav className="no-scrollbar mt-6 flex-1 space-y-1 overflow-y-auto" aria-label="Dashboard navigation">
          {links.map(([label, href, Icon], index) => (
            <Link key={label} href={href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition", index === 0 ? "bg-[#63c9a8] text-[#071c18]" : "text-white/55 hover:bg-white/[0.06] hover:text-white")}><Icon className="size-[18px]" />{label}</Link>
          ))}
        </nav>
        <div className="border-t border-white/10 pt-5">
          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.045] p-3"><div className="grid size-9 place-items-center rounded-full bg-[#f3bd67] font-display text-xs font-extrabold text-[#17231f]">AK</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">Ananya Kapoor</p><p className="truncate text-[0.62rem] text-white/35">{role === "admin" ? "Program administrator" : "Monthly supporter"}</p></div><LogOut className="size-4 text-white/35" /></div>
          <div className="mt-4 flex items-center justify-between"><Link href="/" className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white"><ChevronLeft className="size-3.5" /> Website</Link><ThemeToggle /></div>
        </div>
      </aside>
    </>
  );
}
