import type { Metadata } from "next";

import { TermsPage } from "@/components/pages/policy-pages";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms for using Ashaaya Foundation digital services, making donations, joining events, and engaging with our content.",
};

export default function Page() {
  return <TermsPage />;
}
