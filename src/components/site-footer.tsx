import { ArrowUpRight, Heart } from "lucide-react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa6";

import { BrandMark } from "@/components/brand-mark";
import { NewsletterForm } from "@/components/newsletter-form";

const columns = [
  {
    title: "Explore",
    links: [["About", "/about"], ["Programs", "/programs"], ["Impact", "/impact"], ["Stories", "/stories"]],
  },
  {
    title: "Take action",
    links: [["Donate", "/donate"], ["Volunteer", "/volunteer"], ["Campaigns", "/campaigns"], ["Events", "/events"]],
  },
  {
    title: "Trust",
    links: [["Annual report", "/about#reports"], ["Financials", "/impact#financials"], ["Safeguarding", "/about#safeguarding"], ["Contact", "/contact"]],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#081d19] text-[#edf5ef]">
      <div aria-hidden="true" className="absolute -right-32 -top-32 size-[30rem] rounded-full bg-moss/20 blur-[100px]" />
      <div className="page-shell relative py-16 md:py-24">
        <div className="grid gap-12 border-b border-white/10 pb-16 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#6bd0ae]">One note. Real field progress.</p>
            <h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-tight tracking-[-0.045em] md:text-5xl">Stay close to the change you make possible.</h2>
          </div>
          <div className="self-end">
            <NewsletterForm compact />
            <p className="mt-3 text-xs leading-5 text-white/45">Monthly. No fundraising clutter. Unsubscribe whenever you like.</p>
          </div>
        </div>

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <BrandMark className="text-[#5dc3a1]" />
              <span className="font-display text-lg font-extrabold uppercase tracking-tight">Ashaaya <span className="block text-[0.55rem] tracking-[0.22em] text-white/45">Foundation</span></span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-7 text-white/55">Community-owned progress across learning, health, livelihoods, relief, and a liveable planet.</p>
            <div className="mt-7 flex gap-2">
              {[
                [FaInstagram, "Instagram", "https://instagram.com/ashaayafoundation"],
                [FaLinkedinIn, "LinkedIn", "https://linkedin.com/company/ashaaya-foundation"],
                [FaYoutube, "YouTube", "https://youtube.com/@ashaayafoundation"],
                [FaFacebookF, "Facebook", "https://facebook.com/ashaayafoundation"],
              ].map(([Icon, label, href]) => (
                <a key={label as string} href={href as string} target="_blank" rel="noreferrer" aria-label={label as string} className="grid size-10 place-items-center rounded-full border border-white/12 text-white/65 transition hover:border-[#6bd0ae]/60 hover:text-[#6bd0ae]">
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/38">{column.title}</h3>
              <ul className="mt-5 space-y-3">
                {column.links.map(([label, href]) => (
                  <li key={label}><Link href={href} className="group inline-flex items-center gap-1.5 text-sm text-white/65 transition hover:text-white">{label}<ArrowUpRight className="size-3 opacity-0 transition group-hover:opacity-100" aria-hidden="true" /></Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-5 border-t border-white/10 pt-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Ashaaya Foundation · NGO Darpan KA/2020/0264812</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/accessibility" className="hover:text-white">Accessibility</Link>
            <span className="inline-flex items-center gap-1">Built with <Heart className="size-3 fill-current" aria-hidden="true" /> and accountability</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
