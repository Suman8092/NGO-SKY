import type { Metadata } from "next";

import { AboutPage } from "@/components/pages/about-programs-pages";

export const metadata: Metadata = {
  title: "About Ashaaya Foundation",
  description:
    "Meet Ashaaya Foundation: our mission, values, journey, governance, and community-led approach to lasting change.",
};

export default function Page() {
  return <AboutPage />;
}
