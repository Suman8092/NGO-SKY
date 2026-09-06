import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  CircleDollarSign,
  Database,
  ExternalLink,
  FileImage,
  HeartHandshake,
  Inbox,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AnalyticsDashboard,
  AuthPeopleRecords,
  CampaignRecords,
  DonationRecords,
  EventRecords,
  MediaRecords,
  SettingsConsole,
  StoryRecords,
  SubmissionRecords,
  VolunteerRecords,
} from "@/components/dashboard/operational-records";
import { isEditorialContentPublished } from "@/lib/content-config";
import { getAdminAuthPeople } from "@/lib/server/auth-records";
import {
  getAdminDonationRecords,
  getAdminSubmissionRecords,
  getAdminVolunteerRecords,
  getDetailedAnalytics,
} from "@/lib/server/operations";

export const dynamic = "force-dynamic";

type SectionDefinition = {
  title: string;
  description: string;
  icon: LucideIcon;
  source: string;
  requirements: readonly string[];
  publicHref?: string;
};

const sections: Record<string, SectionDefinition> = {
  campaigns: {
    title: "Campaigns",
    description:
      "Publish and manage campaign work from approved content records.",
    icon: HeartHandshake,
    source: "Published campaign documents in the configured Sanity dataset",
    requirements: [
      "Approved campaign copy and media",
      "Stable campaign identifiers",
      "Published goals and totals from verified records",
    ],
    publicHref: "/campaigns",
  },
  donations: {
    title: "Donations",
    description:
      "Review persisted donation intents and provider-confirmed payment states.",
    icon: CircleDollarSign,
    source:
      "Persistent donation records updated by signed payment-provider webhooks",
    requirements: [
      "Production database connection",
      "Live payment credentials",
      "Verified webhook processing and reconciliation",
    ],
  },
  users: {
    title: "People",
    description:
      "Manage authenticated supporters and consent-aware profile records.",
    icon: Users,
    source:
      "Clerk user identities joined only to authorised first-party profile data",
    requirements: [
      "Restricted administrator access",
      "Documented consent purpose",
      "Audited profile read permissions",
    ],
  },
  volunteers: {
    title: "Volunteers",
    description:
      "Review applications only after they are stored in a durable protected system.",
    icon: ShieldCheck,
    source: "Persistent volunteer application records",
    requirements: [
      "Production database connection",
      "Role-based access",
      "Safeguarding and retention workflow",
    ],
    publicHref: "/volunteer",
  },
  submissions: {
    title: "Submissions",
    description:
      "Review protected contact enquiries and newsletter consent records.",
    icon: Inbox,
    source: "Persistent contact and newsletter subscription records",
    requirements: [
      "Production database connection",
      "Restricted administrator access",
      "Approved retention, response, and deletion workflow",
    ],
  },
  events: {
    title: "Events",
    description:
      "Publish event details and connect real registration and attendance records.",
    icon: CalendarDays,
    source: "Published event content plus a durable registration system",
    requirements: [
      "Approved event documents",
      "Registration storage",
      "Attendance and consent handling",
    ],
    publicHref: "/events",
  },
  stories: {
    title: "Stories & blog",
    description:
      "Publish consent-approved stories through the configured content system.",
    icon: BookOpen,
    source: "Published story documents in the configured Sanity dataset",
    requirements: [
      "Editorial review",
      "Documented subject consent",
      "Approved images and attribution",
    ],
    publicHref: "/stories",
  },
  media: {
    title: "Media library",
    description:
      "Use approved assets with traceable usage rights and attribution.",
    icon: FileImage,
    source: "Sanity assets with rights, consent, and attribution metadata",
    requirements: [
      "Rights metadata",
      "Consent records where required",
      "Accessible captions and alt text",
    ],
    publicHref: "/gallery",
  },
  analytics: {
    title: "Analytics",
    description:
      "Report only measurements produced by a configured analytics source.",
    icon: BarChart3,
    source:
      "A consent-compliant analytics provider joined to verified operational records",
    requirements: [
      "Documented metric definitions",
      "Consent-compliant collection",
      "Production event validation",
    ],
  },
  settings: {
    title: "Settings",
    description:
      "Review production configuration in the provider dashboards and deployment environment.",
    icon: Settings,
    source:
      "Vercel environment variables and the Clerk, database, payment, email, and Sanity dashboards",
    requirements: [
      "Separate production credentials",
      "Secret rotation ownership",
      "Health checks and webhook monitoring",
    ],
  },
};

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const data = sections[section];
  const editorialContentPublished = isEditorialContentPublished();

  if (!data) {
    notFound();
  }

  const Icon = data.icon;
  const operationalView =
    section === "donations" ? (
      <DonationRecords result={await getAdminDonationRecords()} />
    ) : section === "volunteers" ? (
      <VolunteerRecords result={await getAdminVolunteerRecords()} />
    ) : section === "submissions" ? (
      <SubmissionRecords result={await getAdminSubmissionRecords()} />
    ) : section === "users" ? (
      <AuthPeopleRecords result={await getAdminAuthPeople()} />
    ) : section === "campaigns" ? (
      <CampaignRecords />
    ) : section === "events" ? (
      <EventRecords />
    ) : section === "stories" ? (
      <StoryRecords />
    ) : section === "media" ? (
      <MediaRecords />
    ) : section === "analytics" ? (
      <AnalyticsDashboard result={await getDetailedAnalytics()} />
    ) : section === "settings" ? (
      <SettingsConsole />
    ) : null;

  return (
    <div className="mx-auto max-w-[1200px]">
      <header>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-bold text-ink/48 transition hover:text-forest"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Operations
          overview
        </Link>
        <span className="mt-6 grid size-12 place-items-center rounded-2xl bg-forest/10 text-forest">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-5 text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-forest">
          Verified records only
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {data.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/52">
          {data.description}
        </p>
      </header>

      {operationalView ? (
        <section className="mt-8" aria-label={`${data.title} records`}>
          {operationalView}
        </section>
      ) : (
        <section
          className="mt-8 rounded-3xl border border-ink/8 bg-white p-6 shadow-[0_12px_35px_rgba(15,50,43,.05)] dark:bg-white/[0.055] sm:p-8"
          aria-labelledby="empty-state-title"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
              <Database className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-amber-800 dark:text-amber-300">
                Data connection required
              </p>
              <h2
                id="empty-state-title"
                className="mt-2 font-display text-2xl font-bold sm:text-3xl"
              >
                No verified records are connected to this view.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/55">
                This page remains empty by design. It will not display sample
                records, invented people, placeholder totals, or inferred
                statuses while an approved production source is unavailable.
              </p>
            </div>
          </div>
        </section>
      )}

      <section
        className="mt-5 grid gap-5 lg:grid-cols-2"
        aria-label={`${data.title} connection requirements`}
      >
        <article className="rounded-3xl border border-ink/8 bg-white p-6 dark:bg-white/[0.055] sm:p-7">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-forest">
            System of record
          </p>
          <h2 className="mt-3 font-display text-xl font-bold">
            Required source
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink/55">{data.source}</p>
        </article>

        <article className="rounded-3xl border border-ink/8 bg-white p-6 dark:bg-white/[0.055] sm:p-7">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-forest">
            Before enabling
          </p>
          <h2 className="mt-3 font-display text-xl font-bold">
            Connection checklist
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-ink/55">
            {data.requirements.map((requirement) => (
              <li key={requirement} className="flex gap-3">
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0 text-forest"
                  aria-hidden="true"
                />
                {requirement}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/api/health?deep=true"
          target="_blank"
          rel="noreferrer"
          className="button-primary min-h-11"
        >
          Open system health{" "}
          <ExternalLink className="size-4" aria-hidden="true" />
        </Link>
        {editorialContentPublished && data.publicHref ? (
          <Link href={data.publicHref} className="button-secondary min-h-11">
            View public page
          </Link>
        ) : null}
      </div>
    </div>
  );
}
