import type { Metadata } from "next";

import { ImpactPage } from "@/components/pages/impact-stories-events-pages";

export const metadata: Metadata = {
  title: "Our Impact",
  description:
    "Explore Ashaaya Foundation results, outcome evidence, measurement principles, and what we are learning with communities.",
};

export default function Page() {
  return <ImpactPage />;
}
