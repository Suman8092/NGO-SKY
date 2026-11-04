import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdminUserId, isClerkConfigured } from "@/lib/auth-config";
import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Field Agent & Volunteer Desk | Skymeredian",
  description:
    "Mobile-first event pass scanning, attendee check-in, and community relief dispatch.",
};

export default async function AgentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isClerkConfigured()) redirect("/sign-in");
  const { userId } = await auth();
  if (!isAdminUserId(userId)) redirect("/dashboard");
  return (
    <div className="min-h-screen bg-[#faf8f5] text-ink dark:bg-[#061427] dark:text-white">
      <header className="border-b border-ink/8 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-white/10 dark:bg-[#071d33]/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex size-9 items-center justify-center rounded-xl border border-ink/10 text-ink/70 hover:bg-forest/5 dark:border-white/10 dark:text-white"
              title="Back to portal"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <BrandMark className="w-36 sm:w-48" priority />
                <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-forest dark:bg-[#91c4ff]/15 dark:text-[#91c4ff]">
                  Field Desk
                </span>
              </div>
              <p className="text-[0.7rem] text-ink/45 dark:text-white/45">
                Staff & Community Volunteer Terminal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/events"
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink/10 px-3 py-1.5 text-xs font-semibold hover:bg-forest/5 dark:border-white/10"
            >
              <ShieldCheck className="size-3.5 text-forest dark:text-[#91c4ff]" />
              Admin View
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
