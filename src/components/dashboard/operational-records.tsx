import {
  ArrowUpRight,
  CircleAlert,
  Database,
  Download,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { WorkspacePreferences } from "./workspace-preferences";
import { RecordsTable } from "./records-table";
import { getHealthSnapshot } from "@/lib/server/services/health";
import { isClerkConfigured } from "@/lib/auth-config";

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
  AdminEventRegistrationRecord,
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
    <div className="flex gap-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.07] p-6 sm:p-8">
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
    <div className="flex gap-4 border-t border-ink/15 py-8">
      <Database
        className="mt-0.5 size-6 shrink-0 text-forest"
        aria-hidden="true"
      />
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
  return <RecordsTable label={label}>{children}</RecordsTable>;
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <a
          href="/api/admin/export/donations"
          download
          className="inline-flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-sm transition hover:bg-forest/5 dark:bg-white/5 dark:text-white"
        >
          <Download className="size-3.5" />
          Export Donations CSV
        </a>
      </div>
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
              <td
                className={`${cellClass} whitespace-nowrap font-bold text-ink`}
              >
                {formatAmount(record)}
              </td>
              <td className={`${cellClass} capitalize`}>
                {record.frequency.replace("_", " ")}
              </td>
              <td className={`${cellClass} capitalize`}>{record.provider}</td>
              <td className={cellClass}>
                <StatusBadge status={record.status} />
              </td>
              <td className={`${cellClass} font-sans text-xs tabular-nums`}>
                {record.id}
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <a
          href="/api/admin/export/volunteers"
          download
          className="inline-flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-sm transition hover:bg-forest/5 dark:bg-white/5 dark:text-white"
        >
          <Download className="size-3.5" />
          Export Volunteer Roster CSV
        </a>
      </div>
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
              <td className={`${cellClass} font-bold text-ink`}>
                {record.name}
              </td>
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
    </div>
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

function RecordGroupHeading({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
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
          {["Submitted", "Name", "Email", "Phone", "Subject", "Status"].map(
            (label) => (
              <th key={label} className={headerCellClass} scope="col">
                {label}
              </th>
            ),
          )}
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
            <td className={cellClass}>
              <details className="max-w-md">
                <summary className="cursor-pointer font-semibold text-forest">
                  {record.subject}
                </summary>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">
                  {record.message}
                </p>
                <a
                  className="mt-3 inline-flex font-semibold text-forest hover:underline"
                  href={`mailto:${record.email}?subject=${encodeURIComponent(`Re: ${record.subject}`)}`}
                >
                  Reply by email
                </a>
              </details>
            </td>
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
          {["Subscribed", "Name", "Email", "Source", "Status", "Updated"].map(
            (label) => (
              <th key={label} className={headerCellClass} scope="col">
                {label}
              </th>
            ),
          )}
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
      <td className={`${cellClass} font-bold text-ink`}>
        {person.displayName}
      </td>
      <td className={`${cellClass} break-all`}>
        {person.primaryEmail ?? "Not set"}
      </td>
      <td className={cellClass}>
        <StatusBadge
          status={person.emailVerified ? "verified" : "unverified"}
        />
      </td>
      <td className={`${cellClass} whitespace-nowrap`}>{security}</td>
      <td className={`${cellClass} whitespace-nowrap`}>
        {person.lastSignInAt ? formatDate(person.lastSignInAt) : "Never"}
      </td>
      <td className={`${cellClass} font-sans text-xs tabular-nums`}>
        {person.id}
      </td>
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
            Verified field initiatives accepting donations and community
            backing.
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
            const percent = Math.min(
              100,
              Math.round((c.raised / c.goal) * 100),
            );
            return (
              <tr key={c.id}>
                <td className={cellClass}>
                  <div className="font-bold text-ink">{c.title}</div>
                  <div className="font-sans text-xs tabular-nums text-ink/45">
                    {c.slug}
                  </div>
                </td>
                <td className={cellClass}>
                  <span className="rounded-md bg-forest/10 px-2 py-0.5 text-xs font-semibold text-forest">
                    {c.category}
                  </span>
                </td>
                <td className={`${cellClass} whitespace-nowrap font-medium`}>
                  ₹{c.goal.toLocaleString("en-IN")}
                </td>
                <td
                  className={`${cellClass} whitespace-nowrap font-bold text-forest`}
                >
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

export function EventRecords({
  registrationsResult,
}: {
  registrationsResult?: OperationalRead<AdminEventRegistrationRecord[]>;
} = {}) {
  const registrations =
    registrationsResult?.state === "ready" ? registrationsResult.data : [];
  const hasRegistrations = registrations.length > 0;

  return (
    <div className="space-y-10">
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
                  <div className="font-bold text-ink">
                    {formatDate(e.start)}
                  </div>
                  <div className="text-xs text-ink/45">{e.timezone}</div>
                </td>
                <td className={cellClass}>
                  <div className="font-bold text-ink">{e.title}</div>
                  <p className="line-clamp-1 text-xs text-ink/45">
                    {e.summary}
                  </p>
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

      {/* Real attendee roster from MongoDB */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold">
              Attendee Roster & Confirmed RSVPs ({registrations.length})
            </h2>
            <p className="text-xs text-ink/50">
              Live registrations submitted via public RSVP modals and verified
              community passes.
            </p>
          </div>
          {hasRegistrations && (
            <a
              href="/api/admin/export/events"
              download
              className="inline-flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-sm transition hover:bg-forest/5 dark:bg-white/5 dark:text-white"
            >
              <Download className="size-3.5" />
              Export Attendee Roster CSV
            </a>
          )}
        </div>

        {hasRegistrations ? (
          <TableShell label="Attendee roster">
            <thead className={headClass}>
              <tr>
                {[
                  "Pass Code",
                  "Attendee Name",
                  "Contact Details",
                  "Event Name",
                  "Seats",
                  "Notes / Needs",
                  "Status",
                  "Registered At",
                ].map((label) => (
                  <th key={label} className={headerCellClass} scope="col">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {registrations.map((reg) => (
                <tr key={reg.id}>
                  <td
                    className={`${cellClass} font-sans font-bold tabular-nums text-forest dark:text-[#91c4ff]`}
                  >
                    {reg.ticketCode}
                  </td>
                  <td className={`${cellClass} font-bold text-ink`}>
                    {reg.name}
                  </td>
                  <td className={cellClass}>
                    <div className="text-xs font-medium text-ink">
                      {reg.email}
                    </div>
                    {reg.phone && (
                      <div className="text-[0.7rem] text-ink/45">
                        {reg.phone}
                      </div>
                    )}
                  </td>
                  <td className={cellClass}>
                    <div className="text-xs font-bold text-ink">
                      {reg.eventTitle}
                    </div>
                    {reg.eventDate && (
                      <div className="text-[0.7rem] text-ink/45">
                        {reg.eventDate}
                      </div>
                    )}
                  </td>
                  <td className={`${cellClass} font-semibold`}>
                    {reg.ticketsCount}
                  </td>
                  <td
                    className={`${cellClass} max-w-[200px] truncate text-xs text-ink/60`}
                  >
                    {reg.notes || "None"}
                  </td>
                  <td className={cellClass}>
                    <StatusBadge status={reg.status} />
                  </td>
                  <td
                    className={`${cellClass} whitespace-nowrap text-xs text-ink/45`}
                  >
                    {formatDate(reg.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        ) : (
          <div className="rounded-2xl border border-dashed border-ink/15 p-6 text-center">
            <p className="text-sm font-bold text-ink/60">
              No attendees have registered yet.
            </p>
            <p className="mt-1 text-xs text-ink/45">
              Attendee RSVPs submitted on the website will appear here in real
              time.
            </p>
          </div>
        )}
      </div>
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
            Consent-verified narratives, participant voices, and project
            retrospectives.
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
            High-resolution photographic records, field portraits, and rights
            metadata.
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
            className="group overflow-hidden rounded-lg border border-ink/8 bg-white transition hover:shadow-lg dark:bg-white/[0.055]"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-forest/5">
              <Image
                width={item.image.width}
                height={item.image.height}
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
        <article className="border-t border-ink/15 py-6">
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

        <article className="border-t border-ink/15 py-6">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-widest text-forest">
            Average Gift
          </p>
          <p className="mt-3 font-display text-3xl font-bold">
            ₹{donations.averageAmountInr.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-ink/45">
            {donations.monthlyRecurringCount} monthly · {donations.oneTimeCount}{" "}
            one-time
          </p>
        </article>

        <article className="border-t border-ink/15 py-6">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-widest text-forest">
            Volunteer Pipeline
          </p>
          <p className="mt-3 font-display text-3xl font-bold">
            {volunteers.totalCount}
          </p>
          <p className="mt-1 text-xs text-ink/45">
            {volunteers.approvedCount} approved · {volunteers.reviewingCount}{" "}
            reviewing
          </p>
        </article>

        <article className="border-t border-ink/15 py-6">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-widest text-forest">
            Audience Reach
          </p>
          <p className="mt-3 font-display text-3xl font-bold">
            {contacts.totalCount + newsletter.totalCount}
          </p>
          <p className="mt-1 text-xs text-ink/45">
            {contacts.totalCount} enquiries · {newsletter.activeCount} active
            subscribers
          </p>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border-t border-ink/15 py-6">
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

        <section className="border-t border-ink/15 py-6">
          <h3 className="font-display text-lg font-bold">
            System Runtime & Diagnostics
          </h3>
          <p className="mt-1 text-xs text-ink/50">
            Production server telemetry and database health.
          </p>
          <dl className="mt-6 divide-y divide-ink/8 text-sm">
            <div className="flex justify-between py-2.5">
              <dt className="text-ink/50">Database Cluster</dt>
              <dd className="font-bold text-forest">Persistent database</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-ink/50">Node.js Process Uptime</dt>
              <dd className="font-sans text-xs tabular-nums">
                {system.uptimeSeconds}s active
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-ink/50">Runtime Environment</dt>
              <dd className="font-sans text-xs capitalize tabular-nums">
                {system.nodeEnv}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-ink/50">Site Origin</dt>
              <dd className="font-sans text-xs tabular-nums">
                {system.nextPublicSiteUrl}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

export async function SettingsConsole() {
  const { body: health } = await getHealthSnapshot(true);
  const integrations = [
    ["Database", health.integrations.database],
    ["Razorpay payments", health.integrations.razorpay],
    ["Transactional email", health.integrations.resend],
    ["Editorial CMS", health.integrations.sanity],
    ["Public submissions", health.integrations.publicSubmissions],
    ["Newsletter", health.integrations.newsletter],
    ["Account authentication", isClerkConfigured() ? "configured" : "disabled"],
  ];
  return (
    <div className="space-y-8">
      <WorkspacePreferences />
      <section
        aria-labelledby="records-tools-title"
        className="border-t border-ink/15 py-6"
      >
        <h2 id="records-tools-title" className="text-xl font-semibold">
          Records & exports
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          Download current records for reconciliation and operational follow-up.
          These files contain personal data; share them only with authorized
          staff.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {[
            ["donations", "Donations"],
            ["volunteers", "Volunteers"],
            ["contacts", "Enquiries"],
            ["events", "Event roster"],
          ].map(([type, label]) => (
            <a
              key={type}
              href={`/api/admin/export/${type}`}
              className="button-secondary min-h-10 px-4 text-xs"
            >
              <Download className="size-4" aria-hidden="true" />
              {label} CSV
            </a>
          ))}
        </div>
      </section>
      <section className="border-t border-ink/15 py-6">
        <p className="eyebrow">Foundation details</p>
        <h2 className="mt-3 text-2xl font-semibold">{brand.legalName}</h2>
        <dl className="mt-5 divide-y divide-ink/10 text-sm">
          {[
            ["Registration", brand.registration.ngoId],
            ["Tax registration", brand.registration.taxExemption],
            ["Contact", brand.contact.email],
          ].map(([label, value]) => (
            <div key={label} className="grid gap-2 py-4 sm:grid-cols-2">
              <dt className="text-ink/60">{label}</dt>
              <dd className="break-words font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="border-t border-ink/15 py-6">
        <h2 className="text-2xl font-semibold">Integration status</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          Database connectivity is checked when this page loads. Other statuses
          reflect server configuration; provider delivery must be verified
          separately.
        </p>
        <dl className="mt-5 divide-y divide-ink/10">
          {integrations.map(([name, status]) => (
            <div
              key={name}
              className="flex items-center justify-between gap-4 py-4 text-sm"
            >
              <dt>{name}</dt>
              <dd>
                <StatusBadge status={status} />
              </dd>
            </div>
          ))}
        </dl>
        {health.configuration.invalidFields.length > 0 && (
          <p
            role="status"
            className="mt-5 text-sm text-amber-700 dark:text-amber-300"
          >
            Review deployment configuration:{" "}
            {health.configuration.invalidFields.join(", ")}
          </p>
        )}
        <div className="mt-6">
          <SanitySyncButton />
        </div>
        <p className="mt-4 text-xs text-ink/50">
          Credentials are managed in the deployment environment. Last checked:{" "}
          {formatDate(health.timestamp)}.
        </p>
      </section>
    </div>
  );
}
