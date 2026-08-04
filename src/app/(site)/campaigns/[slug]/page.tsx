import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CampaignDetailPage,
  campaigns,
} from "@/components/pages/campaigns-pages";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return campaigns.map((campaign) => ({ slug: campaign.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campaign = campaigns.find((item) => item.slug === slug);
  if (!campaign) return { title: "Campaign not found" };
  return {
    title: campaign.title,
    description: campaign.shortDescription,
    openGraph: {
      title: `${campaign.title} | Ashaaya Foundation`,
      description: campaign.shortDescription,
      type: "article",
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const campaign = campaigns.find((item) => item.slug === slug);
  if (!campaign) notFound();
  return <CampaignDetailPage campaign={campaign} />;
}
