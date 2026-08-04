import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ashaaya Foundation",
    short_name: "Ashaaya",
    description: "Hope, made practical.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f7f1",
    theme_color: "#0f766e",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
