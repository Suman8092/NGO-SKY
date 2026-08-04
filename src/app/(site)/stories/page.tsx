import type { Metadata } from "next";

import { StoriesPage } from "@/components/pages/impact-stories-events-pages";

export const metadata: Metadata = {
  title: "Stories of Possibility",
  description:
    "Meet people and collectives moving possibility forward through Ashaaya Foundation community-led programs.",
};

export default function Page() {
  return <StoriesPage />;
}
