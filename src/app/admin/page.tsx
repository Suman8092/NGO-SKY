import {
  ArrowRight,
  Database,
  ExternalLink,
  FileCheck2,
  LockKeyhole,
  PanelsTopLeft,
  PlugZap,
} from "lucide-react";
import Link from "next/link";

import { AccountGreeting } from "@/components/dashboard/account-greeting";
import { AccountIdentity } from "@/components/dashboard/account-identity";
import { isClerkConfigured } from "@/lib/auth-config";
import { getOperationsSummary } from "@/lib/server/operations";

export const dynamic = "force-dynamic";

const readinessAreas = [
  {
    title: "Persistent records",
    description:
      "Use a production database for submissions, donations, and operational records.",
    requirement: "MongoDB connection and successful deep health check",
    icon: Database,
  },
  {
    title: "Live payments",
    description:
      "Only confirmed payments and signed webhook events can feed donation reporting.",
    requirement: "Live provider keys, webhook secrets, and reconciliation",
    icon: FileCheck2,
  },
  {
    title: "Published content",
    description:
      "Campaigns, events, stories, and approved media need a single authoritative CMS source.",
    requirement: "Sanity project, dataset, token, and published documents",
    icon: PanelsTopLeft,
  },
  {
    title: "Restricted access",
    description:
      "Operations pages must be limited to explicitly approved authenticated administrators.",
    requirement: "Clerk authentication and an administrator allowlist",
    icon: LockKeyhole,
  },
] as const;

const operationalViews = [
  [
    "Campaign management",
    "/admin/campaigns",
    "Monitor active field campaigns, targets, and progress",
  ],
  [
    "Donation reconciliation",
    "/admin/donations",
    "Track live payment intents and reconciled gateway records",
  ],
  [
    "Authenticated accounts",
    "/admin/users",
    "Read verified supporter accounts and administrator identities",
  ],
  [
    "Volunteer applications",
    "/admin/volunteers",
    "Review incoming volunteer submissions and availability",
  ],
  [
    "Contact & newsletter",
    "/admin/submissions",
    "Review community enquiries and active newsletter subscribers",
  ],
  [
    "Event operations",
    "/admin/events",
    "Monitor scheduled symposiums, workshops, and registrations",
  ],
  [
    "Impact stories & blog",
    "/admin/stories",
    "Review published narratives and participant retrospectives",
  ],
  [
    "Media asset library",
    "/admin/media",
    "Browse high-resolution photographs, dimensions, and usage rights",
  ],
  [
    "Platform analytics",
    "/admin/analytics",
    "Inspect database KPI aggregates and server telemetry",
  ],
  [
    "System configuration",
    "/admin/settings",
    "Inspect cloud infrastructure, payment mode, and compliance",
  ],
] as const;

export default async function AdminDashboard() {
  const clerkEnabled = isClerkConfigured();
  const summary = await getOperationsSummary();
  return (
    <div className="mx-auto max-w-[1400px]">
      <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest">
            Operations workspace
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            <AccountGreeting clerkEnabled={clerkEnabled} role="admin" />
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/52">
            Operational counts below are read directly from the protected
            production database. No placeholder metrics or inferred campaign
            totals are shown.
          </p>
        </div>
        <Link
          href="/api/health?deep=true"
          target="_blank"
          rel="noreferrer"
          className="button-secondary min-h-11"
        >
          Open system health{" "}
          <ExternalLink className="size-4" aria-hidden="true" />
        </Link>
      </header>

      <div className="mt-7">
        <AccountIdentity clerkEnabled={clerkEnabled} role="admin" />
      </div>

      {summary.state === "ready" ? (
        <section className="mt-5" aria-labelledby="record-summary-title">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-forest">
            Durable records
          </p>
          <h2
            id="record-summary-title"
            className="mt-2 font-display text-2xl font-bold"
          >
            Current production record counts
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["Donation intents", summary.data.donations],
              ["Confirmed donations", summary.data.confirmedDonations],
              ["Contact enquiries", summary.data.contactSubmissions],
              ["Volunteer applications", summary.data.volunteerApplications],
              ["Active subscribers", summary.data.activeNewsletterSubscribers],
            ].map(([label, value]) => (
              <article
                key={label}
                className="border-t border-ink/20 py-5"
              >
                <p className="font-display text-3xl font-bold">{value}</p>
                <p className="mt-2 text-xs leading-5 text-ink/48">{label}</p>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section
          className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/[0.07] p-6 sm:p-8"
          aria-labelledby="reporting-status-title"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-500/12 text-amber-700 dark:text-amber-300">
              <PlugZap className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-amber-800 dark:text-amber-300">
                Reporting connection unavailable
              </p>
              <h2
                id="reporting-status-title"
                className="mt-2 font-display text-2xl font-bold"
              >
                No operational totals were returned.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/58">
                The dashboard failed closed because the durable database is not
                configured or could not be reached. No cached or sample totals
                replaced it.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="mt-5" aria-labelledby="production-requirements-title">
        <div>
          <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-forest">
            Production requirements
          </p>
          <h2
            id="production-requirements-title"
            className="mt-2 font-display text-2xl font-bold"
          >
            Verified systems of record
          </h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {readinessAreas.map((area) => {
            const Icon = area.icon;
            return (
              <article
                key={area.title}
                className="border-t border-ink/20 py-5"
              >
                <span className="grid size-10 place-items-center rounded-2xl bg-forest/10 text-forest">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold">
                  {area.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-ink/52">
                  {area.description}
                </p>
                <p className="mt-5 border-t border-ink/8 pt-4 text-xs leading-5 text-ink/42">
                  <strong className="text-ink/65">Required:</strong>{" "}
                  {area.requirement}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="mt-5 overflow-hidden border-y border-ink/15"
        aria-labelledby="operations-views-title"
      >
        <div className="border-b border-ink/8 p-5 sm:px-7 sm:py-6">
          <h2
            id="operations-views-title"
            className="font-display text-xl font-bold"
          >
            Operations views
          </h2>
          <p className="mt-1 text-xs leading-5 text-ink/42">
            Database and identity views read only from their named production
            systems; editorial views remain gated until approved content exists.
          </p>
        </div>
        <div className="divide-y divide-ink/8">
          {operationalViews.map(([title, href, description]) => (
            <Link
              key={title}
              href={href}
              className="group flex items-center gap-4 p-5 transition hover:bg-forest/[0.035] sm:px-7"
            >
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-ink/42">
                  {description}
                </p>
              </div>
              <ArrowRight
                className="size-4 shrink-0 text-ink/30 transition group-hover:translate-x-1 group-hover:text-forest"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
