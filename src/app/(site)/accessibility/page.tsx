import type { Metadata } from "next";

import { AccessibilityPage } from "@/components/pages/policy-pages";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "Ashaaya Foundation's accessibility commitments, current practices, known limitations, alternative formats, and feedback process.",
};

export default function Page() {
  return <AccessibilityPage />;
}
