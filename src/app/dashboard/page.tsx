import { auth, currentUser } from "@clerk/nextjs/server";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Download,
  HeartHandshake,
  Mail,
  MessageSquare,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { AccountGreeting } from "@/components/dashboard/account-greeting";
import { AccountIdentity } from "@/components/dashboard/account-identity";
import { DonorTaxProfileCard } from "@/components/dashboard/donor-tax-profile";
import { Ticket } from "lucide-react";
import { isClerkConfigured } from "@/lib/auth-config";
import { isEditorialContentPublished } from "@/lib/content-config";
import {
  getUserDashboardData,
  type AccountDonationRecord,
  type OperationalRead,
  type UserDashboardData,
} from "@/lib/server/operations";

export const dynamic = "force-dynamic";

type DashboardState =
  | OperationalRead<UserDashboardData>
  | { state: "auth_unavailable" };

function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDonationAmount(record: AccountDonationRecord): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: record.currency,
  }).format(record.amountMinor / 100);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: string }) {
  const isPositive = ["paid", "approved", "resolved"].includes(status);
  const isPending = ["submitted", "reviewing", "pending", "processing", "read"].includes(status);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
        isPositive
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : isPending
            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
            : "bg-ink/10 text-ink/70"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

async function loadUserData(
  clerkEnabled: boolean,
): Promise<DashboardState> {
  if (!clerkEnabled) return { state: "auth_unavailable" };

  try {
    const { userId } = await auth();
    if (!userId) return { state: "auth_unavailable" };

    const user = await currentUser();
    const emails =
      user?.emailAddresses?.filter((e) => e.verification?.status === "verified").map((e) => e.emailAddress.toLowerCase()) ?? [];

    return getUserDashboardData(userId, emails);
  } catch {
    return { state: "auth_unavailable" };
  }
}

export default async function UserDashboard() {
  const clerkEnabled = isClerkConfigured();
  const editorialContentPublished = isEditorialContentPublished();
  const result = await loadUserData(clerkEnabled);

  const data: UserDashboardData =
    result.state === "ready"
      ? result.data
      : {
          donations: [],
          kpis: {
            totalDonatedMinor: 0,
            donationCount: 0,
            taxExemptMinor: 0,
            volunteerStatus: "none",
          },
          volunteers: [],
          contacts: [],
          eventRegistrations: [],
          newsletterSubscribed: false,
        };

  const hasDonations = data.donations.length > 0;
  const hasVolunteers = data.volunteers.length > 0;
  const hasContacts = data.contacts.length > 0;
  const hasEvents = (data.eventRegistrations?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Header Banner */}
      <header className="rounded-4xl bg-[#0b3028] p-6 text-white shadow-lift sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#70d5b3]">
            Supporter Portal & Giving Account
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
            <CheckCircle2 className="size-3.5 text-[#70d5b3]" />
            Supporter account
          </span>
        </div>

        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl">
          <AccountGreeting clerkEnabled={clerkEnabled} role="user" />
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
          View your contributions, download donation receipts, and follow your volunteer applications and event registrations.
        </p>
      </header>

      {/* Account Identity Card */}
      <AccountIdentity clerkEnabled={clerkEnabled} role="user" />

      {/* KPI Cards Grid */}
      <section aria-label="Account Overview Metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* INR contributions */}
        <div className="border-t border-ink/20 py-6 sm:pr-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-forest dark:text-[#70d5b3]">
              INR contributions
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-forest/10 text-forest dark:bg-forest/20 dark:text-[#70d5b3]">
              <ReceiptText className="size-4" />
            </span>
          </div>
          <p className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">
            {formatCurrency(data.kpis.totalDonatedMinor / 100)}
          </p>
          <p className="mt-1 text-xs text-ink/50">
            {data.kpis.donationCount} total recorded gifts
          </p>
        </div>

        {/* 80G Tax Exemption Claimable */}
        <div className="border-t border-ink/20 py-6 sm:pr-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-forest dark:text-[#70d5b3]">
              INR contributions
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-forest/10 text-forest dark:bg-forest/20 dark:text-[#70d5b3]">
              <ShieldCheck className="size-4" />
            </span>
          </div>
          <p className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">
            {formatCurrency(data.kpis.taxExemptMinor / 100)}
          </p>
          <p className="mt-1 text-xs text-ink/50">
            Paid INR gifts; eligibility is confirmed separately
          </p>
        </div>

        {/* Volunteer Engagement */}
        <div className="border-t border-ink/20 py-6 sm:pr-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-forest dark:text-[#70d5b3]">
              Volunteer Status
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-forest/10 text-forest dark:bg-forest/20 dark:text-[#70d5b3]">
              <HeartHandshake className="size-4" />
            </span>
          </div>
          <div className="mt-4">
            {data.kpis.volunteerStatus === "none" ? (
              <span className="text-sm font-semibold text-ink/60">Not applied</span>
            ) : (
              <StatusBadge status={data.kpis.volunteerStatus} />
            )}
          </div>
          <p className="mt-2 text-xs text-ink/50">
            {data.kpis.volunteerStatus === "approved"
              ? "Verified field volunteer"
              : data.kpis.volunteerStatus === "submitted" || data.kpis.volunteerStatus === "reviewing"
                ? "Application under review"
                : "Join on-ground initiatives"}
          </p>
        </div>

        {/* Newsletter & Updates */}
        <div className="border-t border-ink/20 py-6 sm:pr-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-forest dark:text-[#70d5b3]">
              Dispatches
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-forest/10 text-forest dark:bg-forest/20 dark:text-[#70d5b3]">
              <Mail className="size-4" />
            </span>
          </div>
          <p className="mt-4 text-sm font-bold text-ink">
            {data.newsletterSubscribed ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" /> Active subscriber
              </span>
            ) : (
              <span className="text-ink/60">Not subscribed</span>
            )}
          </p>
          <p className="mt-1 text-xs text-ink/50">Monthly field dispatches</p>
        </div>
      </section>

      {/* Section 1: Verified Giving History & Receipts */}
      <section aria-labelledby="giving-records-title">
        <div className="border-t border-ink/15 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-forest">
                Giving Records & Tax Receipts
              </p>
              <h2
                id="giving-records-title"
                className="mt-1 font-display text-2xl font-bold tracking-tight"
              >
                Verified Donation History
              </h2>
            </div>

            <Link href="/donate" className="button-primary min-h-10 text-xs">
              Make a contribution
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {result.state === "unavailable" ? (
            <AccountHistoryEmpty state="unavailable" />
          ) : result.state === "auth_unavailable" ? (
            <AccountHistoryEmpty state="auth_unavailable" />
          ) : hasDonations ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-ink/8">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-forest/[0.06] text-xs uppercase tracking-[0.12em] text-ink/55">
                    <tr>
                      <th className="px-5 py-4 font-bold" scope="col">Date</th>
                      <th className="px-5 py-4 font-bold" scope="col">Amount</th>
                      <th className="px-5 py-4 font-bold" scope="col">Frequency</th>
                      <th className="px-5 py-4 font-bold" scope="col">Provider</th>
                      <th className="px-5 py-4 font-bold" scope="col">Status</th>
                      <th className="px-5 py-4 font-bold" scope="col">Tax Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/8">
                    {data.donations.map((record) => (
                      <tr key={record.id} className="hover:bg-forest/[0.02]">
                        <td className="whitespace-nowrap px-5 py-4 text-ink/58">
                          {formatDate(record.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-bold text-ink">
                          {formatDonationAmount(record)}
                        </td>
                        <td className="px-5 py-4 capitalize text-ink/58">
                          {record.frequency.replace("_", " ")}
                        </td>
                        <td className="px-5 py-4 capitalize text-ink/58">
                          {record.provider}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={record.status} />
                        </td>
                        <td className="px-5 py-4">
                          {record.status === "paid" ? (
                            <a
                              href={`/api/donations/${record.id}/receipt`}
                              download
                              className="inline-flex items-center gap-1.5 rounded-lg border border-forest/20 bg-forest/5 px-2.5 py-1 text-xs font-bold text-forest transition hover:bg-forest hover:text-white"
                            >
                              <Download className="size-3.5" />
                              Donation receipt (PDF)
                            </a>
                          ) : (
                            <span className="text-xs text-ink/40">
                              Receipt pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <AccountHistoryEmpty state="empty" />
          )}

          {editorialContentPublished && (
            <div className="mt-6 flex gap-3">
              <Link href="/campaigns" className="button-secondary min-h-10 text-xs">
                Browse verified campaigns
              </Link>
            </div>
          )}
        </div>
      </section>


      {/* Statutory 80G Tax Profile & PAN Manager */}
      <DonorTaxProfileCard />

      {/* Section 2: Volunteer Applications */}
      <section aria-labelledby="volunteer-records-title">
        <div className="border-t border-ink/15 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-forest">
                Community Engagement
              </p>
              <h2
                id="volunteer-records-title"
                className="mt-1 font-display text-2xl font-bold tracking-tight"
              >
                My Volunteer Applications
              </h2>
            </div>

            <Link href="/volunteer" className="button-secondary min-h-10 text-xs">
              Submit application
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {hasVolunteers ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-ink/8">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-forest/[0.06] text-xs uppercase tracking-[0.12em] text-ink/55">
                    <tr>
                      <th className="px-5 py-4 font-bold" scope="col">Submitted</th>
                      <th className="px-5 py-4 font-bold" scope="col">Focus Area</th>
                      <th className="px-5 py-4 font-bold" scope="col">Location</th>
                      <th className="px-5 py-4 font-bold" scope="col">Availability</th>
                      <th className="px-5 py-4 font-bold" scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/8">
                    {data.volunteers.map((vol) => (
                      <tr key={vol.id}>
                        <td className="whitespace-nowrap px-5 py-4 text-ink/58">
                          {formatDate(vol.createdAt)}
                        </td>
                        <td className="px-5 py-4 font-bold text-ink">
                          {vol.areaOfInterest}
                        </td>
                        <td className="px-5 py-4 text-ink/58">
                          {vol.city}, {vol.country}
                        </td>
                        <td className="px-5 py-4 capitalize text-ink/58">
                          {vol.availability.replace("_", " ")}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={vol.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-ink/15 p-6 text-center sm:p-8">
              <HeartHandshake className="mx-auto size-8 text-forest/60" />
              <h3 className="mt-3 font-display text-base font-bold text-ink">
                No active volunteer applications
              </h3>
              <p className="mt-1 text-xs text-ink/55">
                Join our medical camps, learning centers, or nutrition drives.
              </p>
              <div className="mt-4">
                <Link href="/volunteer" className="button-primary min-h-9 text-xs">
                  Apply to volunteer
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>


      {/* Section 2.5: Event Passes & RSVPs */}
      <section aria-labelledby="event-passes-title">
        <div className="border-t border-ink/15 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-forest dark:text-[#70d5b3]">
                Gatherings & Forums
              </p>
              <h2
                id="event-passes-title"
                className="mt-1 font-display text-2xl font-bold tracking-tight text-ink dark:text-white"
              >
                My Event Passes & RSVPs
              </h2>
            </div>

            <Link href="/events" className="button-secondary min-h-10 text-xs">
              Explore events
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {hasEvents ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-ink/8">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-forest/[0.06] text-xs uppercase tracking-[0.12em] text-ink/55">
                    <tr>
                      <th className="px-5 py-4 font-bold" scope="col">Pass Reference</th>
                      <th className="px-5 py-4 font-bold" scope="col">Event</th>
                      <th className="px-5 py-4 font-bold" scope="col">Date & Time</th>
                      <th className="px-5 py-4 font-bold" scope="col">Location</th>
                      <th className="px-5 py-4 font-bold" scope="col">Seats</th>
                      <th className="px-5 py-4 font-bold" scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/8">
                    {data.eventRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-forest/[0.02]">
                        <td className="whitespace-nowrap px-5 py-4 font-mono font-bold text-forest dark:text-[#70d5b3]">
                          {reg.ticketCode}
                        </td>
                        <td className="px-5 py-4 font-bold text-ink dark:text-white">
                          {reg.eventTitle}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-ink/65 dark:text-white/65">
                          {reg.eventDate || "TBA"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-ink/65 dark:text-white/65">
                          {reg.eventLocation || "Online / Bengaluru"}
                        </td>
                        <td className="px-5 py-4 font-medium text-ink dark:text-white">
                          {reg.ticketsCount}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={reg.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-ink/15 p-6 text-center sm:p-8">
              <Ticket className="mx-auto size-8 text-forest/60" />
              <h3 className="mt-3 font-display text-base font-bold text-ink dark:text-white">
                No active event reservations
              </h3>
              <p className="mt-1 text-xs text-ink/55 dark:text-white/55">
                Join our symposiums, community table discussions, and field workshops.
              </p>
              <div className="mt-4">
                <Link href="/events" className="button-primary min-h-9 text-xs">
                  Browse upcoming events
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Support Inquiries */}
      <section aria-labelledby="inquiry-records-title">
        <div className="border-t border-ink/15 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-forest">
                Help & Correspondence
              </p>
              <h2
                id="inquiry-records-title"
                className="mt-1 font-display text-2xl font-bold tracking-tight"
              >
                My Inquiries & Support Messages
              </h2>
            </div>

            <Link href="/contact" className="button-secondary min-h-10 text-xs">
              New message
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {hasContacts ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-ink/8">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="bg-forest/[0.06] text-xs uppercase tracking-[0.12em] text-ink/55">
                    <tr>
                      <th className="px-5 py-4 font-bold" scope="col">Date</th>
                      <th className="px-5 py-4 font-bold" scope="col">Subject</th>
                      <th className="px-5 py-4 font-bold" scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/8">
                    {data.contacts.map((c) => (
                      <tr key={c.id}>
                        <td className="whitespace-nowrap px-5 py-4 text-ink/58">
                          {formatDate(c.createdAt)}
                        </td>
                        <td className="px-5 py-4 font-semibold text-ink">
                          {c.subject}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={c.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-ink/15 p-6 text-center sm:p-8">
              <MessageSquare className="mx-auto size-8 text-forest/60" />
              <h3 className="mt-3 font-display text-base font-bold text-ink">
                No past enquiries
              </h3>
              <p className="mt-1 text-xs text-ink/55">
                Questions about donations, 80G tax exemptions, or initiatives?
              </p>
              <div className="mt-4">
                <Link href="/contact" className="button-primary min-h-9 text-xs">
                  Contact Foundation Support
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Statutory 80G & Record Integrity Notice */}
      <section className="rounded-3xl border border-forest/15 bg-forest/[0.06] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-6 text-forest" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold text-forest">
            Tax Benefits & Record Integrity
          </h2>
        </div>
        <ul className="mt-5 grid gap-5 text-xs leading-6 text-ink/65 md:grid-cols-3">
          <li className="rounded-2xl border border-ink/6 bg-white/60 p-4 dark:bg-white/5">
            <span className="font-bold text-ink">Section 80G Exemption:</span>{" "}
            Donations made to Skymeredian Foundation are eligible for 50% tax
            deduction under Section 80G of the Income Tax Act, 1961. Retain your
            downloaded receipt for income tax filing.
          </li>
          <li className="rounded-2xl border border-ink/6 bg-white/60 p-4 dark:bg-white/5">
            <span className="font-bold text-ink">Server-Verified Records:</span>{" "}
            Donation and volunteer records are linked via your verified Clerk
            account and authenticated payment gateway webhooks. No estimated or
            synthetic numbers are used.
          </li>
          <li className="rounded-2xl border border-ink/6 bg-white/60 p-4 dark:bg-white/5">
            <span className="font-bold text-ink">Donor Privacy:</span> All
            transaction details, legal PAN references, and personal data remain
            strictly confidential and isolated to your account.
          </li>
        </ul>
      </section>
    </div>
  );
}

function AccountHistoryEmpty({ state }: { state: string }) {
  const message =
    state === "auth_unavailable"
      ? "Account verification is temporarily unavailable. No records were exposed."
      : state === "unavailable"
        ? "The production record system is currently unavailable. Please try again later."
        : "No verified donations are linked to this account yet. When you make a contribution, your transaction and 80G receipt will appear here.";

  return (
    <div className="mt-6 flex gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] p-5">
      <CircleAlert
        className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300"
        aria-hidden="true"
      />
      <p className="text-sm leading-7 text-ink/70">{message}</p>
    </div>
  );
}
