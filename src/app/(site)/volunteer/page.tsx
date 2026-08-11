import type { Metadata } from "next";

import { VolunteerPage } from "@/components/pages/action-pages";
import { hasManagedSubmissionWorkflow } from "@/lib/server/env";

export const metadata: Metadata = {
  title: "Volunteer With Us",
  description:
    "Explore Ashaaya Foundation volunteer information and check whether managed applications are open.",
};

type Props = { searchParams: Promise<{ interest?: string | string[] }> };

export default async function Page({ searchParams }: Props) {
  const { interest } = await searchParams;
  return (
    <VolunteerPage
      initialInterest={Array.isArray(interest) ? interest[0] : interest}
      submissionsAvailable={hasManagedSubmissionWorkflow()}
    />
  );
}
