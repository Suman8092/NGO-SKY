import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isClerkConfigured } from "@/lib/auth-config";
import { isEditorialContentPublished } from "@/lib/content-config";

export default function SiteLayout({ children }: { children: ReactNode }) {
  const clerkEnabled = isClerkConfigured();
  const editorialContentPublished = isEditorialContentPublished();

  return (
    <>
      <SiteHeader
        clerkEnabled={clerkEnabled}
        editorialContentPublished={editorialContentPublished}
      />
      <div id="main-content" tabIndex={-1}>
        {children}
      </div>
      <SiteFooter />
    </>
  );
}
