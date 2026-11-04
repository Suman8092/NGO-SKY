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
  ["NGO operations", "/admin/manage", HeartHandshake],
  ["Financial reports", "/admin/reports", BarChart3],
  ["Campaigns", "/admin/campaigns", HeartHandshake],
  ["Donations", "/admin/donations", CircleDollarSign],
  ["People", "/admin/users", Users],
  ["Volunteers", "/admin/volunteers", ShieldCheck],
  ["Submissions", "/admin/submissions", Inbox],
  ["Events", "/admin/events", CalendarDays],
  ["Stories", "/admin/stories", BookOpen],
  ["Media", "/admin/media", FileImage],
  ["Analytics", "/admin/analytics", BarChart3],
] as const;

const userLinks = [
  ["Account overview", "/dashboard", LayoutDashboard],
  ["Membership & documents", "/dashboard/membership", ShieldCheck],
  ["Browse campaigns", "/campaigns", HeartHandshake],
  ["Contact support", "/contact", LifeBuoy],
] as const;

export function DashboardSidebar({
  role = "admin",
  clerkEnabled,
  editorialContentPublished,
  adminAccess = false,
}: {
  role?: "admin" | "user";
  adminAccess?: boolean;
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
        className="fixed left-4 top-4 z-50 grid size-11 place-items-center rounded-full bg-[#0c263c] text-white shadow-xl lg:hidden"
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
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-[270px] flex-col border-r border-white/8 bg-[#07182b] p-5 text-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex shrink-0 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Skymeredian Foundation home"
            onClick={() => setOpen(false)}
          >
            <div>
              <BrandMark className="brand-on-dark w-44" priority />
              <span className="mt-3 block text-xs font-semibold tracking-wide text-white/60">
                {role === "admin" ? "Operations" : "My account"}
              </span>
            </div>
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
          className="mt-5 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-1"
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
                  "flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-[#91c4ff] text-[#07182b]"
                    : "text-white/75 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                <Icon className="size-[18px]" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0 border-t border-white/15 pt-3">
          {role === "admin" ? (
            <Link
              href="/admin/settings"
              onClick={() => setOpen(false)}
              aria-current={pathname === "/admin/settings" ? "page" : undefined}
              className={cn(
                "mb-3 flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium",
                pathname === "/admin/settings"
                  ? "bg-[#91c4ff] text-[#07182b]"
                  : "text-white/85 hover:bg-white/10",
              )}
            >
              <Settings className="size-[18px]" aria-hidden="true" /> Settings
            </Link>
          ) : adminAccess ? (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="mb-3 flex min-h-11 items-center gap-3 rounded-md bg-white/10 px-3 text-sm font-medium text-white"
            >
              <ShieldCheck className="size-[18px]" aria-hidden="true" /> Admin
              workspace
            </Link>
          ) : null}
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
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#ff9f1c] font-display text-xs font-extrabold text-[#171f32]">
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
