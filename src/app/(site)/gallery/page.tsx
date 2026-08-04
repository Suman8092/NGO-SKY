import type { Metadata } from "next";

import { GalleryPage } from "@/components/pages/gallery-page";

export const metadata: Metadata = { title: "Field gallery", description: "A consent-aware visual record of Ashaaya Foundation's community-led work." };

export default function Page() {
  return <GalleryPage />;
}
