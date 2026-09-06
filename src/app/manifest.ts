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
    background_color: "#f8f7f1",
    theme_color: "#0f766e",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
