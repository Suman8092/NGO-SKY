"use client";

import dynamic from "next/dynamic";

const ImpactGlobe = dynamic(() => import("@/components/home/impact-globe"), {
  ssr: false,
  loading: () => <div className="h-[420px] animate-pulse rounded-full bg-white/[0.035] sm:h-[520px]" aria-hidden="true" />,
});

export function GlobeLazy() {
  return <ImpactGlobe />;
}
