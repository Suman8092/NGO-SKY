import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import {
  isAdminUserId,
  isClerkConfigured,
  isDemoModeEnabled,
} from "@/lib/auth-config";
import { isEditorialContentPublished } from "@/lib/content-config";
export const metadata: Metadata = {
  title: "My impact",
  robots: { index: false, follow: false },
};
export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkEnabled = isClerkConfigured();
  if (!clerkEnabled && !isDemoModeEnabled())
    redirect("/sign-in?reason=auth-unavailable");
  let adminAccess = false;
  if (clerkEnabled) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");
    adminAccess = isAdminUserId(userId);
  }
  return (
    <div className="min-h-screen bg-paper text-ink">
      <DashboardSidebar
        clerkEnabled={clerkEnabled}
        editorialContentPublished={isEditorialContentPublished()}
        role="user"
        adminAccess={adminAccess}
      />
      <main
        id="main-content"
        className="min-h-screen px-5 pb-12 pt-20 lg:ml-[270px] lg:px-9 lg:pt-8 xl:px-12"
      >
        {adminAccess && (
          <div className="mx-auto mb-6 flex max-w-[1200px] flex-wrap items-center justify-between gap-3 border-b border-ink/15 pb-4 text-sm">
            <p className="text-ink/65">
              Your account has administrator access.
            </p>
            <Link
              href="/admin"
              className="font-semibold text-forest hover:underline"
            >
              Open admin workspace
            </Link>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
