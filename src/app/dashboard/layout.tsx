import type { Metadata } from "next";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { isClerkConfigured } from "@/lib/auth-config";
import { isEditorialContentPublished } from "@/lib/content-config";

export const metadata: Metadata = {
  title: "My impact",
  robots: { index: false, follow: false },
};

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkEnabled = isClerkConfigured();
  const editorialContentPublished = isEditorialContentPublished();

  return (
    <div className="min-h-screen bg-[#f2f3ef] text-[#17231f] dark:bg-[#0c1614] dark:text-[#eff3ec]">
      <DashboardSidebar
        clerkEnabled={clerkEnabled}
        editorialContentPublished={editorialContentPublished}
        role="user"
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
