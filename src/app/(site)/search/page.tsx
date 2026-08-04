import type { Metadata } from "next";

import { SearchPage } from "@/components/pages/action-pages";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search Ashaaya Foundation programs, campaigns, events, stories, and ways to help.",
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export default async function Page({ searchParams }: Props) {
  const { q } = await searchParams;
  return <SearchPage query={Array.isArray(q) ? q[0] : q} />;
}
