import type { Metadata } from "next";

import { VolunteerPage } from "@/components/pages/action-pages";

export const metadata: Metadata = {
  title: "Volunteer With Us",
  description:
    "Explore supported, meaningful Ashaaya Foundation volunteer roles and register your interest online.",
};

type Props = { searchParams: Promise<{ interest?: string | string[] }> };

export default async function Page({ searchParams }: Props) {
  const { interest } = await searchParams;
  return (
    <VolunteerPage
      initialInterest={Array.isArray(interest) ? interest[0] : interest}
    />
  );
}
