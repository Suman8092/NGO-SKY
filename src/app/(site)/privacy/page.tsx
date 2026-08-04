import type { Metadata } from "next";

import { PrivacyPage } from "@/components/pages/policy-pages";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Ashaaya Foundation collects, uses, protects, shares, and retains personal information—and the choices available to you.",
};

export default function Page() {
  return <PrivacyPage />;
}
