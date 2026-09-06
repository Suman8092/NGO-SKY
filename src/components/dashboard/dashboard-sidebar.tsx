"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  CircleDollarSign,
  FileImage,
  HeartHandshake,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ["Submissions", "/admin/submissions", Inbox],
  ["Events", "/admin/events", CalendarDays],
  ["Stories", "/admin/stories", BookOpen],
  ["Media", "/admin/media", FileImage],
  ["Analytics", "/admin/analytics", BarChart3],
  ["Settings", "/admin/settings", Settings],
] as const;

const userLinks = [
  ["Account overview", "/dashboard", LayoutDashboard],
  ["Browse campaigns", "/campaigns", HeartHandshake],
  ["Contact support", "/contact", LifeBuoy],
] as const;

export function DashboardSidebar({
  role = "admin",
  clerkEnabled,
  editorialContentPublished,
}: {
  role?: "admin" | "user";
  clerkEnabled: boolean;
  editorialContentPublished: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const links =
    role === "admin"
      ? adminLinks
      : editorialContentPublished
        ? userLinks
        : userLinks.filter(([, href]) => href !== "/campaigns");

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 grid size-11 place-items-center rounded-full bg-[#0c2d26] text-white shadow-xl lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open dashboard navigation"
        aria-expanded={open}
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
      {open ? (
        <button
          type="button"
          aria-label="Close dashboard navigation"
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-white/8 bg-[#071c18] p-5 text-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <BrandMark className="text-[#63c9a8]" />
            <span className="font-display text-sm font-extrabold uppercase leading-tight">
              Skymeredian
              <span className="block text-[0.53rem] tracking-[0.2em] text-white/35">
                {role === "admin" ? "Operations" : "My account"}
              </span>
            </span>
          </Link>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full border border-white/10 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <nav
          className="no-scrollbar mt-8 flex-1 space-y-1 overflow-y-auto"
          aria-label="Dashboard navigation"
        >
          {links.map(([label, href, Icon]) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  active
                    ? "bg-[#63c9a8] text-[#071c18]"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                <Icon className="size-[18px]" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 pt-5">
          {clerkEnabled ? <ClerkAccount role={role} /> : <UnavailableAccount />}
          <div className="mt-4 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white"
            >
              <ChevronLeft className="size-3.5" aria-hidden="true" /> Website
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}

function ClerkAccount({ role }: { role: "admin" | "user" }) {
  const { isLoaded, user } = useUser();
  const displayName =
    user?.fullName ??
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress ??
    "Signed-in account";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.045] p-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f3bd67] font-display text-xs font-extrabold text-[#17231f]">
        {isLoaded ? initials || "AC" : "…"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold">
          {isLoaded ? displayName : "Loading account…"}
        </p>
        <p className="truncate text-[0.62rem] text-white/35">
          {role === "admin" ? "Administrator" : "Authenticated account"}
        </p>
      </div>
      {user ? (
        <SignOutButton>
          <button
            type="button"
            className="grid size-8 shrink-0 place-items-center rounded-full text-white/35 transition hover:bg-white/10 hover:text-white"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </SignOutButton>
      ) : null}
    </div>
  );
}

function UnavailableAccount() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.045] p-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 font-display text-xs font-extrabold text-white/55">
        --
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold">Account unavailable</p>
        <p className="truncate text-[0.62rem] text-white/35">
          Authentication is not configured
        </p>
      </div>
    </div>
  );
}
