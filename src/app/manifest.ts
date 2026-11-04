import type { MetadataRoute } from "next";

import { isEditorialContentPublished } from "@/lib/content-config";

export default function manifest(): MetadataRoute.Manifest {
  const editorialContentPublished = isEditorialContentPublished();
  return {
    name: "Skymeredian Foundation",
    short_name: "Skymeredian",
    description: editorialContentPublished
      ? "Skymeredian Foundation website."
      : "Skymeredian Foundation website publication status.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafd",
    theme_color: "#00549f",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
