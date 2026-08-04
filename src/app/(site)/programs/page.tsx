import type { Metadata } from "next";

import { ProgramsPage } from "@/components/pages/about-programs-pages";

export const metadata: Metadata = {
  title: "Our Programs",
  description:
    "Explore Ashaaya Foundation programs in education, health, livelihoods, food security, climate resilience, protection, and care.",
};

export default function Page() {
  return <ProgramsPage />;
}
