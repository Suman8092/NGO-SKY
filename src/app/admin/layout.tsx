import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { isAdminUserId, isClerkConfigured } from "@/lib/auth-config";
import { isEditorialContentPublished } from "@/lib/content-config";

export const metadata: Metadata = {
  title: "Operations dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkConfigured = isClerkConfigured();
  if (!clerkConfigured) redirect("/dashboard");

  const { userId } = await auth();
  if (!isAdminUserId(userId)) redirect("/dashboard");
  const editorialContentPublished = isEditorialContentPublished();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <DashboardSidebar
        clerkEnabled={clerkConfigured}
        editorialContentPublished={editorialContentPublished}
        role="admin"
      />
      <main
        id="main-content"
        className="min-h-screen px-5 pb-12 pt-20 lg:ml-[270px] lg:px-9 lg:pt-8 xl:px-12"
      >
        <div className="mx-auto mb-7 flex max-w-[1400px] flex-wrap items-center justify-between gap-3 border-b border-ink/15 pb-4 text-xs">
          <Link
            href="/admin"
            className="font-semibold text-ink/65 hover:text-forest"
          >
            Administration
          </Link>
          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/admin/submissions"
              className="text-ink/65 hover:text-forest"
            >
              Inbox
            </Link>
            <Link href="/admin/settings" className="font-semibold text-forest">
              Settings
            </Link>
            <Link href="/dashboard" className="text-ink/65 hover:text-forest">
              My account
            </Link>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
