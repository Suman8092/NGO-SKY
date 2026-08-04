import type { Metadata } from "next";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export const metadata: Metadata = { title: "Operations dashboard", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f2f3ef] text-[#17231f] dark:bg-[#0c1614] dark:text-[#eff3ec]">
      <DashboardSidebar role="admin" />
      <main id="main-content" className="min-h-screen px-5 pb-12 pt-20 lg:ml-[270px] lg:px-9 lg:pt-8 xl:px-12">{children}</main>
    </div>
  );
}
