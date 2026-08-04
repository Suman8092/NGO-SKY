import type { Metadata } from "next";

import { EventsPage } from "@/components/pages/impact-stories-events-pages";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Join Ashaaya Foundation gatherings, workshops, fundraising events, volunteer orientations, and community conversations.",
};

export default function Page() {
  return <EventsPage />;
}
