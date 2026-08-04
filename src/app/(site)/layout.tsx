import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div id="main-content" tabIndex={-1}>
        {children}
      </div>
      <SiteFooter />
    </>
  );
}
