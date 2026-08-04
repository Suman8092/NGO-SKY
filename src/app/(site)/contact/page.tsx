import type { Metadata } from "next";

import { ContactPage } from "@/components/pages/action-pages";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Ashaaya Foundation about programs, partnerships, donations, volunteering, events, accessibility, or safeguarding.",
};

type Props = {
  searchParams: Promise<{
    subject?: string | string[];
    interest?: string | string[];
    event?: string | string[];
  }>;
};

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  const value =
    params.subject ?? params.interest ?? (params.event ? "events" : undefined);
  return <ContactPage subject={Array.isArray(value) ? value[0] : value} />;
}
