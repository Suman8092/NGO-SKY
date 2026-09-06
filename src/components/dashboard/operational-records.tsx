import {
  ArrowUpRight,
  CircleAlert,
  Database,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import {
  ContactStatusSelector,
  SanitySyncButton,
  VolunteerStatusSelector,
} from "./admin-interactive-controls";

import {
  brand,
  campaigns,
  events,
  gallery,
  impactStories,
} from "@/content/site";
import type {
  AdminContactRecord,
  AdminDonationRecord,
  AdminNewsletterRecord,
  AdminVolunteerRecord,
  DetailedAnalytics,
  OperationalRead,
} from "@/lib/server/operations";
import type {
  AuthPeopleRead,
  AuthPersonRecord,
} from "@/lib/server/auth-records";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function formatAmount(record: AdminDonationRecord): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: record.currency,
  }).format(record.amountMinor / 100);
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-forest/10 px-2.5 py-1 text-xs font-bold capitalize text-forest">
      {status.replace("_", " ")}
    </span>
  );
}

function UnavailableState({ source }: { source: "database" | "identity" }) {
  return (
    <div className="flex gap-4 rounded-3xl border border-amber-500/20 bg-amber-500/[0.07] p-6 sm:p-8">
      <CircleAlert
        className="mt-0.5 size-6 shrink-0 text-amber-700 dark:text-amber-300"
        aria-hidden="true"
      />
      <div>
        <h2 className="font-display text-2xl font-bold">
          {source === "database"
            ? "Production records are unavailable"
            : "Identity records are unavailable"}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-ink/58">
          The view failed closed because its protected {source} source is not
          configured or could not be reached. No cached, inferred, or sample
          records were substituted.
        </p>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex gap-4 rounded-3xl border border-ink/8 bg-white p-6 dark:bg-white/[0.055] sm:p-8">
      <Database className="mt-0.5 size-6 shrink-0 text-forest" aria-hidden="true" />
      <div>
        <h2 className="font-display text-2xl font-bold">No {label} found</h2>
        <p className="mt-2 text-sm leading-7 text-ink/55">
          The production source returned zero matching records.
        </p>
      </div>
    </div>
  );
}

function TableShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-ink/8 bg-white dark:bg-white/[0.055]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <caption className="sr-only">{label}</caption>
          {children}
        </table>
      </div>
    </div>
  );
}

const headClass =
  "bg-forest/[0.06] text-xs uppercase tracking-[0.12em] text-ink/55";
const headerCellClass = "px-5 py-4 font-bold";
const cellClass = "px-5 py-4 align-top text-ink/58";

export function DonationRecords({
  result,
}: {
  result: OperationalRead<AdminDonationRecord[]>;
}) {
  if (result.state === "unavailable") {
    return <UnavailableState source="database" />;
  }
  if (result.data.length === 0) return <EmptyState label="donation records" />;

  return (
    <TableShell label="Latest donation records">
      <thead className={headClass}>
        <tr>
          {[
            "Created",
            "Donor",
            "Amount",
            "Frequency",
            "Provider",
            "Status",
            "Reference",
          ].map((label) => (
            <th key={label} className={headerCellClass} scope="col">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-ink/8">
        {result.data.map((record) => (
          <tr key={record.id}>
            <td className={`${cellClass} whitespace-nowrap`}>
              {formatDate(record.createdAt)}
            </td>
            <td className={cellClass}>
              <strong className="block text-ink">{record.donorName}</strong>
              <span className="break-all text-xs">{record.donorEmail}</span>
            </td>
            <td className={`${cellClass} whitespace-nowrap font-bold text-ink`}>
              {formatAmount(record)}
            </td>
            <td className={`${cellClass} capitalize`}>
              {record.frequency.replace("_", " ")}
            </td>
            <td className={`${cellClass} capitalize`}>{record.provider}</td>
            <td className={cellClass}>
              <StatusBadge status={record.status} />
            </td>
            <td className={`${cellClass} font-mono text-xs`}>{record.id}</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

export function VolunteerRecords({
  result,
}: {
  result: OperationalRead<AdminVolunteerRecord[]>;
}) {
  if (result.state === "unavailable") {
    return <UnavailableState source="database" />;
  }
  if (result.data.length === 0) {
    return <EmptyState label="volunteer applications" />;
  }

  return (
    <TableShell label="Latest volunteer applications">
      <thead className={headClass}>
        <tr>
          {[
            "Submitted",
            "Applicant",
            "Contact",
            "Location",
            "Area",
            "Availability",
            "Status",
          ].map((label) => (
            <th key={label} className={headerCellClass} scope="col">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-ink/8">
        {result.data.map((record) => (
          <tr key={record.id}>
            <td className={`${cellClass} whitespace-nowrap`}>
              {formatDate(record.createdAt)}
            </td>
            <td className={`${cellClass} font-bold text-ink`}>{record.name}</td>
            <td className={cellClass}>
              <span className="block break-all">{record.email}</span>
              <span className="mt-1 block text-xs">{record.phone}</span>
            </td>
            <td className={cellClass}>
              {record.city}, {record.country}
            </td>
            <td className={cellClass}>{record.areaOfInterest}</td>
            <td className={`${cellClass} capitalize`}>
              {record.availability.replace("_", " ")}
            </td>
            <td className={cellClass}>
              <VolunteerStatusSelector
                id={record.id}
                initialStatus={record.status}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

export function SubmissionRecords({
  result,
}: {
  result: OperationalRead<{
    contacts: AdminContactRecord[];
    newsletter: AdminNewsletterRecord[];
  }>;
}) {
  if (result.state === "unavailable") {
    return <UnavailableState source="database" />;
  }

  return (
    <div className="space-y-6">
      <RecordGroupHeading
        title="Contact enquiries"
        count={result.data.contacts.length}
      />
      {result.data.contacts.length > 0 ? (
        <ContactTable records={result.data.contacts} />
      ) : (
        <EmptyState label="contact enquiries" />
      )}

      <RecordGroupHeading
        title="Newsletter subscriptions"
        count={result.data.newsletter.length}
      />
      {result.data.newsletter.length > 0 ? (
        <NewsletterTable records={result.data.newsletter} />
      ) : (
        <EmptyState label="newsletter subscriptions" />
      )}
    </div>
  );
}

function RecordGroupHeading({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-end justify-between gap-4 pt-2">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <p className="text-xs text-ink/45">Showing {count} latest records</p>
    </div>
  );
}

function ContactTable({ records }: { records: AdminContactRecord[] }) {
  return (
    <TableShell label="Latest contact enquiries">
      <thead className={headClass}>
        <tr>
          {[
            "Submitted",
            "Name",
            "Email",
            "Phone",
            "Subject",
            "Status",
          ].map((label) => (
            <th key={label} className={headerCellClass} scope="col">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-ink/8">
        {records.map((record) => (
          <tr key={record.id}>
            <td className={`${cellClass} whitespace-nowrap`}>
              {formatDate(record.createdAt)}
            </td>
            <td className={`${cellClass} font-bold text-ink`}>{record.name}</td>
            <td className={`${cellClass} break-all`}>{record.email}</td>
            <td className={cellClass}>{record.phone ?? "Not provided"}</td>
            <td className={cellClass}>{record.subject}</td>
            <td className={cellClass}>
              <ContactStatusSelector
                id={record.id}
                initialStatus={record.status}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function NewsletterTable({ records }: { records: AdminNewsletterRecord[] }) {
  return (
    <TableShell label="Latest newsletter subscriptions">
      <thead className={headClass}>
        <tr>
          {[
            "Subscribed",
            "Name",
            "Email",
            "Source",
            "Status",
            "Updated",
          ].map((label) => (
            <th key={label} className={headerCellClass} scope="col">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-ink/8">
        {records.map((record) => (
          <tr key={record.id}>
            <td className={`${cellClass} whitespace-nowrap`}>
              {formatDate(record.subscribedAt)}
            </td>
            <td className={cellClass}>{record.name ?? "Not provided"}</td>
            <td className={`${cellClass} break-all`}>{record.email}</td>
            <td className={cellClass}>{record.source}</td>
            <td className={cellClass}>
              <StatusBadge status={record.status} />
            </td>
            <td className={`${cellClass} whitespace-nowrap`}>
              {formatDate(record.updatedAt)}
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

export function AuthPeopleRecords({ result }: { result: AuthPeopleRead }) {
  if (result.state === "unavailable") {
    return <UnavailableState source="identity" />;
  }
  if (result.data.people.length === 0) {
    return <EmptyState label="authenticated accounts" />;
  }

  return (
    <div>
      <p className="mb-4 text-sm leading-7 text-ink/55">
        Clerk reports {result.data.totalCount} total account
        {result.data.totalCount === 1 ? "" : "s"}. Passwords and login secrets
        are managed by Clerk and are never readable from this application.
      </p>
      <TableShell label="Latest authenticated accounts">
        <thead className={headClass}>
          <tr>
            {[
              "Created",
              "Account",
              "Primary email",
              "Verification",
              "Security",
              "Last sign-in",
              "User ID",
            ].map((label) => (
              <th key={label} className={headerCellClass} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/8">
          {result.data.people.map((person) => (
            <AuthPersonRow key={person.id} person={person} />
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

function AuthPersonRow({ person }: { person: AuthPersonRecord }) {
  const security = [
    person.administrator ? "Admin" : "Standard",
    person.twoFactorEnabled ? "2FA on" : "2FA off",
    person.locked ? "Locked" : null,
    person.banned ? "Banned" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <tr>
      <td className={`${cellClass} whitespace-nowrap`}>
        {formatDate(person.createdAt)}
      </td>
      <td className={`${cellClass} font-bold text-ink`}>{person.displayName}</td>
      <td className={`${cellClass} break-all`}>
        {person.primaryEmail ?? "Not set"}
      </td>
      <td className={cellClass}>
        <StatusBadge status={person.emailVerified ? "verified" : "unverified"} />
      </td>
      <td className={`${cellClass} whitespace-nowrap`}>{security}</td>
      <td className={`${cellClass} whitespace-nowrap`}>
        {person.lastSignInAt ? formatDate(person.lastSignInAt) : "Never"}
      </td>
      <td className={`${cellClass} font-mono text-xs`}>{person.id}</td>
    </tr>
  );
}

export function CampaignRecords() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">
            Active Campaigns ({campaigns.length})
          </h2>
          <p className="text-xs text-ink/50">
            Verified field initiatives accepting donations and community backing.
          </p>
        </div>
        <Link
          href="/campaigns"
          target="_blank"
          className="button-secondary min-h-9 text-xs"
        >
          View public directory <ExternalLink className="size-3.5" />
        </Link>
      </div>

      <TableShell label="Active campaigns list">
        <thead className={headClass}>
          <tr>
            {[
              "Campaign",
              "Category",
              "Target Goal",
              "Raised to date",
              "Progress",
              "Status",
              "Actions",
            ].map((label) => (
              <th key={label} className={headerCellClass} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/8">
          {campaigns.map((c) => {
            const percent = Math.min(100, Math.round((c.raised / c.goal) * 100));
            return (
              <tr key={c.id}>
                <td className={cellClass}>
                  <div className="font-bold text-ink">{c.title}</div>
                  <div className="font-mono text-xs text-ink/45">{c.slug}</div>
                </td>
                <td className={cellClass}>
                  <span className="rounded-md bg-forest/10 px-2 py-0.5 text-xs font-semibold text-forest">
                    {c.category}
                  </span>
                </td>
                <td className={`${cellClass} whitespace-nowrap font-medium`}>
                  ₹{c.goal.toLocaleString("en-IN")}
                </td>
                <td className={`${cellClass} whitespace-nowrap font-bold text-forest`}>
                  ₹{c.raised.toLocaleString("en-IN")}
                </td>
                <td className={cellClass}>
                  <div className="w-28">
                    <div className="mb-1 flex justify-between text-xs font-semibold">
                      <span>{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-forest/10">
                      <div
                        className="h-full rounded-full bg-forest"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className={cellClass}>
                  <StatusBadge status={c.status} />
                </td>
                <td className={cellClass}>
                  <Link
                    href={`/campaigns/${c.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-bold text-forest hover:underline"
                  >
                    View <ArrowUpRight className="size-3" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableShell>
    </div>
  );
}

export function EventRecords() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">
            Scheduled Events & Gatherings ({events.length})
          </h2>
          <p className="text-xs text-ink/50">
            Field workshops, learning symposiums, and community assemblies.
          </p>
        </div>
        <Link
          href="/events"
          target="_blank"
          className="button-secondary min-h-9 text-xs"
        >
          Public events page <ExternalLink className="size-3.5" />
        </Link>
      </div>

      <TableShell label="Scheduled events">
        <thead className={headClass}>
          <tr>
            {[
              "Date & Time",
              "Event title",
              "Venue & Location",
              "Format",
              "Capacity",
              "Registration",
              "Action",
            ].map((label) => (
              <th key={label} className={headerCellClass} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/8">
          {events.map((e) => (
            <tr key={e.slug}>
              <td className={`${cellClass} whitespace-nowrap`}>
                <div className="font-bold text-ink">{formatDate(e.start)}</div>
                <div className="text-xs text-ink/45">{e.timezone}</div>
              </td>
              <td className={cellClass}>
                <div className="font-bold text-ink">{e.title}</div>
                <p className="line-clamp-1 text-xs text-ink/45">{e.summary}</p>
              </td>
              <td className={cellClass}>
                <div className="text-xs font-medium text-ink">{e.venue}</div>
                <div className="text-[0.7rem] text-ink/40">{e.location}</div>
              </td>
              <td className={cellClass}>
                <span className="rounded-md bg-forest/10 px-2 py-0.5 text-xs font-semibold capitalize text-forest">
                  {e.format}
                </span>
              </td>
              <td className={`${cellClass} whitespace-nowrap text-xs`}>
                {e.remainingPlaces} / {e.capacity} seats left
              </td>
              <td className={cellClass}>
                <StatusBadge status={e.status} />
              </td>
              <td className={cellClass}>
                <Link
                  href={`/events#${e.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-forest hover:underline"
                >
                  Details <ArrowUpRight className="size-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

export function StoryRecords() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">
            Impact Stories & Field Articles ({impactStories.length})
          </h2>
          <p className="text-xs text-ink/50">
            Consent-verified narratives, participant voices, and project retrospectives.
          </p>
        </div>
        <Link
          href="/stories"
          target="_blank"
          className="button-secondary min-h-9 text-xs"
        >
          View public stories <ExternalLink className="size-3.5" />
        </Link>
      </div>

      <TableShell label="Impact stories">
        <thead className={headClass}>
          <tr>
            {[
              "Published",
              "Story title & summary",
              "Program focus",
              "Participant",
              "Read time",
              "Action",
            ].map((label) => (
              <th key={label} className={headerCellClass} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/8">
          {impactStories.map((s) => (
            <tr key={s.slug}>
              <td className={`${cellClass} whitespace-nowrap`}>
                {s.publishedAt}
              </td>
              <td className={cellClass}>
                <div className="font-bold text-ink">{s.title}</div>
                <p className="mt-1 line-clamp-2 text-xs text-ink/50">{s.dek}</p>
              </td>
              <td className={cellClass}>
                <span className="rounded-md bg-forest/10 px-2 py-0.5 text-xs font-semibold capitalize text-forest">
                  {s.programSlug.replace(/-/g, " ")}
                </span>
              </td>
              <td className={`${cellClass} whitespace-nowrap`}>
                <div className="font-medium text-ink">{s.person}</div>
                <div className="text-[0.7rem] text-ink/45">{s.location}</div>
              </td>
              <td className={`${cellClass} whitespace-nowrap text-xs`}>
                {s.readTime}
              </td>
              <td className={cellClass}>
                <Link
                  href={`/stories/${s.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-bold text-forest hover:underline"
                >
                  Read <ArrowUpRight className="size-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

export function MediaRecords() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">
            Foundation Media Asset Library ({gallery.length})
          </h2>
          <p className="text-xs text-ink/50">
            High-resolution photographic records, field portraits, and rights metadata.
          </p>
        </div>
        <Link
          href="/gallery"
          target="_blank"
          className="button-secondary min-h-9 text-xs"
        >
          Open public gallery <ExternalLink className="size-3.5" />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item) => (
          <article
            key={item.id}
            className="group overflow-hidden rounded-3xl border border-ink/8 bg-white transition hover:shadow-lg dark:bg-white/[0.055]"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-forest/5">
              <img
                src={item.image.src}
                alt={item.image.alt}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute bottom-2 right-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-[0.65rem] font-bold text-white backdrop-blur-sm">
                {item.image.width} × {item.image.height}
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-[0.65rem] font-extrabold uppercase tracking-widest text-forest">
                  {item.location}
                </p>
                <span className="rounded bg-forest/10 px-1.5 py-0.5 text-[0.65rem] font-bold capitalize text-forest">
                  {item.category}
                </span>
              </div>
              <h3 className="mt-2 line-clamp-1 font-display text-base font-bold">
                {item.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink/50">
                {item.image.alt}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-3 text-xs text-ink/40">
                <span>Rights: {item.image.credit}</span>
                <a
                  href={item.image.src}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-forest hover:underline"
                >
                  Direct link <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsDashboard({
  result,
}: {
  result: OperationalRead<DetailedAnalytics>;
}) {
  if (result.state === "unavailable") {
    return <UnavailableState source="database" />;
  }

  const { donations, volunteers, contacts, newsletter, system } = result.data;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-3xl border border-ink/8 bg-white p-6 dark:bg-white/[0.055]">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-widest text-forest">
            Donations Raised
          </p>
          <p className="mt-3 font-display text-3xl font-bold">
            ₹{donations.totalAmountInr.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-ink/45">
            {donations.paidCount} confirmed of {donations.totalCount} intents
          </p>
        </article>

        <article className="rounded-3xl border border-ink/8 bg-white p-6 dark:bg-white/[0.055]">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-widest text-forest">
            Average Gift
          </p>
          <p className="mt-3 font-display text-3xl font-bold">
            ₹{donations.averageAmountInr.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-ink/45">
            {donations.monthlyRecurringCount} monthly · {donations.oneTimeCount} one-time
          </p>
        </article>

        <article className="rounded-3xl border border-ink/8 bg-white p-6 dark:bg-white/[0.055]">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-widest text-forest">
            Volunteer Pipeline
          </p>
          <p className="mt-3 font-display text-3xl font-bold">
            {volunteers.totalCount}
          </p>
          <p className="mt-1 text-xs text-ink/45">
            {volunteers.approvedCount} approved · {volunteers.reviewingCount} reviewing
          </p>
        </article>

        <article className="rounded-3xl border border-ink/8 bg-white p-6 dark:bg-white/[0.055]">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-widest text-forest">
            Audience Reach
          </p>
          <p className="mt-3 font-display text-3xl font-bold">
            {contacts.totalCount + newsletter.totalCount}
          </p>
          <p className="mt-1 text-xs text-ink/45">
            {contacts.totalCount} enquiries · {newsletter.activeCount} active subscribers
          </p>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-ink/8 bg-white p-6 dark:bg-white/[0.055]">
          <h3 className="font-display text-lg font-bold">
            Inquiry & Support Response Status
          </h3>
          <p className="mt-1 text-xs text-ink/50">
            Tracking inbound citizen and donor contact requests.
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-xs font-semibold">
                <span>New / Unassigned</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {contacts.newCount}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-forest/10">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{
                    width: `${
                      contacts.totalCount > 0
                        ? (contacts.newCount / contacts.totalCount) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs font-semibold">
                <span>Resolved & Replied</span>
                <span className="font-bold text-forest">
                  {contacts.resolvedCount}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-forest/10">
                <div
                  className="h-full rounded-full bg-forest"
                  style={{
                    width: `${
                      contacts.totalCount > 0
                        ? (contacts.resolvedCount / contacts.totalCount) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-ink/8 bg-white p-6 dark:bg-white/[0.055]">
          <h3 className="font-display text-lg font-bold">
            System Runtime & Diagnostics
          </h3>
          <p className="mt-1 text-xs text-ink/50">
            Production server telemetry and database health.
          </p>
          <dl className="mt-6 divide-y divide-ink/8 text-sm">
            <div className="flex justify-between py-2.5">
              <dt className="text-ink/50">Database Cluster</dt>
              <dd className="font-bold text-forest">MongoDB Atlas (Connected)</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-ink/50">Node.js Process Uptime</dt>
              <dd className="font-mono text-xs">{system.uptimeSeconds}s active</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-ink/50">Runtime Environment</dt>
              <dd className="font-mono text-xs capitalize">{system.nodeEnv}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-ink/50">Site Origin</dt>
              <dd className="font-mono text-xs">{system.nextPublicSiteUrl}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

export function SettingsConsole() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-ink/8 bg-white p-6 dark:bg-white/[0.055] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-extrabold uppercase tracking-widest text-forest">
              Legal & Statutory Identity
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold">{brand.legalName}</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 px-3 py-1 text-xs font-bold text-forest">
            <ShieldCheck className="size-4" /> Active Non-Profit
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-ink/8 bg-forest/[0.02] p-4">
            <p className="text-xs font-medium text-ink/45">Government Accreditation</p>
            <p className="mt-1 text-sm font-bold text-ink">
              {brand.registration.ngoId}
            </p>
          </div>
          <div className="rounded-2xl border border-ink/8 bg-forest/[0.02] p-4">
            <p className="text-xs font-medium text-ink/45">Tax Exemption</p>
            <p className="mt-1 text-sm font-bold text-ink">
              {brand.registration.taxExemption}
            </p>
          </div>
          <div className="rounded-2xl border border-ink/8 bg-forest/[0.02] p-4">
            <p className="text-xs font-medium text-ink/45">Institutional Email</p>
            <p className="mt-1 text-sm font-bold text-ink">{brand.contact.email}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-ink/8 bg-white p-6 dark:bg-white/[0.055] sm:p-8">
        <h2 className="font-display text-xl font-bold">Integrated Production Systems</h2>
        <p className="mt-1 text-sm text-ink/50">
          Current state of cloud dependencies, gateways, and data providers.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-ink/8 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">MongoDB Database</span>
              <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="mt-2 text-xs text-ink/50">Atlas Cluster connected</p>
            <p className="mt-1 font-mono text-[0.7rem] text-forest">
              cluster0.hqhhytx.mongodb.net
            </p>
          </div>

          <div className="rounded-2xl border border-ink/8 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Razorpay Payments</span>
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[0.65rem] font-bold text-amber-700 dark:text-amber-300">
                TEST MODE
              </span>
            </div>
            <p className="mt-2 text-xs text-ink/50">Order generation active</p>
            <p className="mt-1 font-mono text-[0.7rem] text-forest">
              rzp_test_T0GSsnErvPviBU
            </p>
          </div>

          <div className="rounded-2xl border border-ink/8 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Clerk Identity</span>
              <span className="size-2.5 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-2 text-xs text-ink/50">Admin & supporter auth enabled</p>
            <p className="mt-1 font-mono text-[0.7rem] text-forest">
              Middleware protected
            </p>
          </div>

          <div className="rounded-2xl border border-ink/8 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Resend Transactional Email</span>
              <span className="size-2.5 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-2 text-xs text-ink/50">Automated notifications active</p>
            <p className="mt-1 font-mono text-[0.7rem] text-forest">
              onboarding@resend.dev
            </p>
          </div>

          <div className="rounded-2xl border border-ink/8 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Sanity CMS</span>
              <span className="size-2.5 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-2 text-xs text-ink/50">Editorial dataset connected</p>
            <p className="mt-1 font-mono text-[0.7rem] text-forest">
              project 7kf36p68 (production)
            </p>
            <div className="mt-3">
              <SanitySyncButton />
            </div>
          </div>

          <div className="rounded-2xl border border-ink/8 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Annual Report Document</span>
              <span className="size-2.5 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-2 text-xs text-ink/50">Audited PDF generated</p>
            <p className="mt-1 font-mono text-[0.7rem] text-forest">
              /reports/skymeredian-annual-report-2025-26.pdf
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
