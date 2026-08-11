import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
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
    <div className="min-h-screen bg-[#f2f3ef] text-[#17231f] dark:bg-[#0c1614] dark:text-[#eff3ec]">
      <DashboardSidebar
        clerkEnabled={clerkConfigured}
        editorialContentPublished={editorialContentPublished}
        role="admin"
      />
      <main
        id="main-content"
        className="min-h-screen px-5 pb-12 pt-20 lg:ml-[270px] lg:px-9 lg:pt-8 xl:px-12"
      >
        {children}
      </main>
    </div>
  );
}
