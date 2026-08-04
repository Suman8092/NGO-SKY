"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Heart, LogIn, Menu, Search, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const navigation = [
  {
    label: "Who we are",
    href: "/about",
    links: [
      ["Our story", "/about", "Why Ashaaya exists"],
      ["Impact & evidence", "/impact", "What changed, and how we know"],
      ["Stories", "/stories", "Voices from the field"],
    ],
  },
  {
    label: "What we do",
    href: "/programs",
    links: [
      ["Learning", "/programs#learning", "Keep every learner connected"],
      ["Health", "/programs#health", "Care closer to home"],
      ["Livelihoods", "/programs#livelihoods", "Women-led local enterprise"],
      ["Climate", "/programs#climate", "Restore what sustains us"],
    ],
  },
  {
    label: "Take action",
    href: "/volunteer",
    links: [
      ["Volunteer", "/volunteer", "Give time and expertise"],
      ["Campaigns", "/campaigns", "Fund urgent, specific work"],
      ["Events", "/events", "Meet, learn, participate"],
      ["Partner", "/contact?subject=partnership", "Build with us"],
    ],
  },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-all duration-500",
          scrolled || openMenu || mobileOpen
            ? "border-ink/10 bg-paper/88 py-2 shadow-[0_8px_40px_rgba(9,50,42,0.06)] backdrop-blur-2xl"
            : "border-transparent bg-transparent py-3",
        )}
      >
        <div className="page-shell flex h-16 items-center justify-between gap-5">
          <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="Ashaaya Foundation home">
            <BrandMark className="transition-transform duration-500 group-hover:rotate-6" />
            <span className="font-display text-[0.93rem] font-extrabold uppercase leading-[1.05] tracking-[-0.03em]">
              Ashaaya
              <span className="block text-[0.56rem] font-semibold tracking-[0.2em] text-ink/55">Foundation</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {navigation.map((item) => (
              <div
                key={item.label}
                onMouseEnter={() => setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
                className="relative"
              >
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-ink/75 transition hover:bg-ink/[0.045] hover:text-ink"
                  aria-expanded={openMenu === item.label}
                  onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                >
                  {item.label}
                  <ChevronDown className={cn("size-3.5 transition", openMenu === item.label && "rotate-180")} aria-hidden="true" />
                </button>
                <AnimatePresence>
                  {openMenu === item.label ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-1/2 top-full w-[390px] -translate-x-1/2 pt-4"
                    >
                      <div className="glass-card rounded-3xl p-3">
                        {item.links.map(([label, href, description]) => (
                          <Link
                            key={label}
                            href={href}
                            className="group flex items-center justify-between rounded-2xl px-4 py-3 transition hover:bg-forest/[0.07]"
                            onClick={() => setOpenMenu(null)}
                          >
                            <span>
                              <span className="block text-sm font-bold">{label}</span>
                              <span className="mt-0.5 block text-xs text-ink/52">{description}</span>
                            </span>
                            <ArrowUpRight className="size-4 text-forest opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                          </Link>
                        ))}
                        <Link href={item.href} className="mt-2 flex items-center gap-2 rounded-2xl bg-forest px-4 py-3 text-sm font-bold text-white dark:text-[#071813]">
                          <Sparkles className="size-4" aria-hidden="true" /> Explore {item.label.toLowerCase()}
                        </Link>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ))}
            <Link href="/contact" className="rounded-full px-4 py-2.5 text-sm font-semibold text-ink/75 transition hover:bg-ink/[0.045] hover:text-ink">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden size-10 place-items-center rounded-full border border-ink/10 bg-paper/60 transition hover:border-forest/30 sm:grid"
              aria-label="Search Ashaaya"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-[18px]" aria-hidden="true" />
            </button>
            <div className="hidden sm:block"><ThemeToggle /></div>
            <Link href="/volunteer" className="hidden rounded-full px-3 py-2 text-sm font-bold text-ink/70 transition hover:text-forest xl:inline-flex">
              Volunteer
            </Link>
            {clerkEnabled ? (
              <div className="hidden items-center sm:flex">
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/10 bg-paper/60 px-3 text-sm font-bold text-ink/70 transition hover:border-forest/30 hover:text-forest"
                  >
                    <LogIn className="size-4" aria-hidden="true" />
                    <span className="hidden xl:inline">Sign in</span>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <UserButton appearance={{ elements: { avatarBox: "size-10" } }} />
                </SignedIn>
              </div>
            ) : null}
            <Link href="/donate" className="button-primary min-h-10 px-4 py-2 sm:px-5">
              <Heart className="size-4 fill-current" aria-hidden="true" /> <span className="hidden sm:inline">Donate</span>
            </Link>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full border border-ink/10 lg:hidden"
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((value) => !value)}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-ink/10 lg:hidden"
            >
              <nav className="page-shell max-h-[calc(100vh-5rem)] overflow-y-auto py-5" aria-label="Mobile navigation">
                {navigation.map((item) => (
                  <div key={item.label} className="border-b border-ink/10 py-4">
                    <Link href={item.href} className="font-display text-xl font-bold" onClick={() => setMobileOpen(false)}>{item.label}</Link>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {item.links.map(([label, href]) => (
                        <Link key={label} href={href} className="rounded-xl bg-ink/[0.035] px-3 py-2.5 text-sm text-ink/70" onClick={() => setMobileOpen(false)}>{label}</Link>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mt-5 flex items-center justify-between">
                  <button type="button" className="button-secondary" onClick={() => { setMobileOpen(false); setSearchOpen(true); }}><Search className="size-4" /> Search</button>
                  <ThemeToggle />
                </div>
                {clerkEnabled ? (
                  <div className="mt-4 rounded-2xl border border-ink/10 bg-ink/[0.035] p-3">
                    <SignedOut>
                      <Link
                        href="/sign-in"
                        className="flex items-center gap-2 text-sm font-bold text-forest"
                        onClick={() => setMobileOpen(false)}
                      >
                        <LogIn className="size-4" aria-hidden="true" /> Sign in to your account
                      </Link>
                    </SignedOut>
                    <SignedIn>
                      <div className="flex items-center gap-3">
                        <UserButton appearance={{ elements: { avatarBox: "size-9" } }} />
                        <Link href="/dashboard" className="text-sm font-bold text-forest" onClick={() => setMobileOpen(false)}>
                          Open my account
                        </Link>
                      </div>
                    </SignedIn>
                  </div>
                ) : null}
              </nav>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {searchOpen ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-start justify-center bg-[#071c18]/75 px-5 pt-[18vh] backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
          >
            <motion.div initial={{ y: 20, scale: 0.98 }} animate={{ y: 0, scale: 1 }} className="w-full max-w-3xl rounded-4xl bg-paper p-5 shadow-2xl sm:p-8">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Search the work</p>
                <button type="button" className="grid size-10 place-items-center rounded-full bg-ink/5" onClick={() => setSearchOpen(false)} aria-label="Close search"><X className="size-5" /></button>
              </div>
              <form action="/search" className="mt-7 flex gap-3">
                <label htmlFor="site-search" className="sr-only">Search campaigns, programs, and stories</label>
                <input id="site-search" name="q" autoFocus placeholder="Try “clean water” or “Karnataka”…" className="min-w-0 flex-1 rounded-2xl border border-ink/15 bg-transparent px-5 py-4 text-base outline-none placeholder:text-ink/35 focus:border-forest" />
                <button type="submit" className="button-primary px-5"><Search className="size-5" /><span className="hidden sm:inline">Search</span></button>
              </form>
              <p className="mt-4 text-xs text-ink/45">Popular: education · monthly giving · volunteering · annual report</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
