import { AgentScanner } from "@/components/dashboard/agent-scanner";
import { events } from "@/content/site";
import { HeartHandshake } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AgentDashboardPage() {
  const activeEvents = events.filter((e) => e.status === "upcoming" || e.status === "sold-out");

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-4xl bg-[#0b3028] p-6 text-white shadow-lift sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#70d5b3]">
              Field Operations & Community Assemblies
            </span>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Event Desk & Attendee Verification
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
              Verify digital pass codes, welcome supporters, admit confirmed seats, and track live attendance without paper friction.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <span className="block font-mono text-2xl font-bold text-[#70d5b3]">
                {activeEvents.length}
              </span>
              <span className="text-[0.7rem] uppercase tracking-wider text-white/60">
                Scheduled Events
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Scanner Tool */}
      <AgentScanner />

      {/* Field Desk Guidance Card */}
      <div className="rounded-3xl border border-ink/8 bg-white p-6 dark:bg-white/[0.04]">
        <h3 className="flex items-center gap-2 font-display text-base font-bold text-ink dark:text-white">
          <HeartHandshake className="size-4 text-forest dark:text-[#70d5b3]" />
          Field Volunteer Protocols
        </h3>
        <div className="mt-4 grid gap-4 text-xs text-ink/70 dark:text-white/70 sm:grid-cols-3">
          <div className="rounded-2xl border border-ink/8 p-4 dark:border-white/5">
            <p className="font-bold text-ink dark:text-white">1. Verify Pass Code</p>
            <p className="mt-1 leading-5">
              Enter the supporter's ticket code or verify against the CSV roster export if internet connectivity is intermittent.
            </p>
          </div>
          <div className="rounded-2xl border border-ink/8 p-4 dark:border-white/5">
            <p className="font-bold text-ink dark:text-white">2. Check In Seats</p>
            <p className="mt-1 leading-5">
              Confirm how many seats are reserved. Hand out attendee badges or tree-planting gear accordingly.
            </p>
          </div>
          <div className="rounded-2xl border border-ink/8 p-4 dark:border-white/5">
            <p className="font-bold text-ink dark:text-white">3. Special Needs</p>
            <p className="mt-1 leading-5">
              Review any special notes (dietary preferences, accessibility requirements, translation needs) on the card.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
