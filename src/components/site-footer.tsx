import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { NewsletterForm } from "@/components/newsletter-form";
import { isEditorialContentPublished } from "@/lib/content-config";
import {
  hasManagedSubmissionWorkflow,
  isPublicSubmissionsEnabled,
} from "@/lib/server/env";

const columns = [
  {
    title: "Explore",
    links: [
      ["About", "/about"],
      ["Programs", "/programs"],
      ["Impact", "/impact"],
      ["Stories", "/stories"],
    ],
  },
  {
    title: "Take action",
    links: [
      ["Donate", "/donate"],
      ["Volunteer", "/volunteer"],
      ["Campaigns", "/campaigns"],
      ["Events", "/events"],
    ],
  },
  {
    title: "Trust",
    links: [
      ["Contact", "/contact"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["Accessibility", "/accessibility"],
    ],
  },
] as const;

export function SiteFooter() {
  const editorialContentPublished = isEditorialContentPublished();
  const newsletterAvailable =
    editorialContentPublished && isPublicSubmissionsEnabled();
  const managedContactAvailable = hasManagedSubmissionWorkflow();
  const visibleColumns = editorialContentPublished
    ? columns
    : [
        {
          title: "Available",
          links: [
            ["Contact", "/contact"],
            ["Donate", "/donate"],
          ],
        },
      ];

  return (
    <footer className="relative overflow-hidden bg-[#081d19] text-[#edf5ef]">
      <div
        aria-hidden="true"
        className="absolute -right-32 -top-32 size-[30rem] rounded-full bg-moss/20 blur-[100px]"
      />
      <div className="page-shell relative py-16 md:py-24">
        {newsletterAvailable ? (
          <div className="grid gap-12 border-b border-white/10 pb-16 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#6bd0ae]">
                Website updates
              </p>
              <h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-tight tracking-[-0.045em] md:text-5xl">
                Receive new programme and organisation updates.
              </h2>
            </div>
            <div className="self-end">
              <NewsletterForm compact />
              <p className="mt-3 text-xs leading-5 text-white/45">
                You can unsubscribe whenever you like.
              </p>
            </div>
          </div>
        ) : (
          <div className="border-b border-white/10 pb-12">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#6bd0ae]">
              Publication review
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
              {editorialContentPublished
                ? "Newsletter registration is unavailable until its managed production workflow is enabled."
                : "Newsletter registration and policy links will appear after the organisation approves the supporting content and consent terms."}
            </p>
          </div>
        )}

        <div
          className={`grid gap-12 py-16 sm:grid-cols-2 ${
            editorialContentPublished
              ? "lg:grid-cols-[1.5fr_repeat(3,1fr)]"
              : "lg:grid-cols-[1.5fr_1fr]"
          }`}
        >
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <BrandMark className="text-[#5dc3a1]" />
              <span className="font-display text-lg font-extrabold uppercase tracking-tight">
                Ashaaya{" "}
                <span className="block text-[0.55rem] tracking-[0.22em] text-white/45">
                  Foundation
                </span>
              </span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-7 text-white/55">
              {managedContactAvailable
                ? "Use the managed contact form for programme, partnership, volunteering, or accessibility questions."
                : "Public forms report their availability before collecting any personal details."}
            </p>
          </div>
          {visibleColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/38">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="group inline-flex items-center gap-1.5 text-sm text-white/65 transition hover:text-white"
                    >
                      {label}
                      <ArrowUpRight
                        className="size-3 opacity-0 transition group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-5 border-t border-white/10 pt-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Ashaaya Foundation</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {editorialContentPublished ? (
              <>
                <Link href="/privacy" className="hover:text-white">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-white">
                  Terms
                </Link>
                <Link href="/accessibility" className="hover:text-white">
                  Accessibility
                </Link>
              </>
            ) : null}
            <span>Information is reviewed before publication</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
