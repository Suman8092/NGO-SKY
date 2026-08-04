import type { Metadata } from "next";

import { CampaignsPage } from "@/components/pages/campaigns-pages";

export const metadata: Metadata = {
  title: "Campaigns",
  description:
    "Support transparent, community-led Ashaaya Foundation campaigns and follow progress from contribution to outcome.",
};

type Props = { searchParams: Promise<{ category?: string | string[] }> };

export default async function Page({ searchParams }: Props) {
  const { category } = await searchParams;
  return (
    <CampaignsPage
      category={Array.isArray(category) ? category[0] : category}
    />
  );
}
