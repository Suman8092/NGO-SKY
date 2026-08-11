import type { MetadataRoute } from "next";

import { isEditorialContentPublished } from "@/lib/content-config";

export default function robots(): MetadataRoute.Robots {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/+$/, "");
  const unpublishedRoutes = [
    "/about/",
    "/programs/",
    "/campaigns/",
    "/impact/",
    "/stories/",
    "/insights/",
    "/events/",
    "/gallery/",
    "/faq/",
    "/get-involved/",
    "/volunteer/",
    "/search/",
    "/privacy/",
    "/terms/",
    "/accessibility/",
    "/images/",
  ];
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/dashboard/",
        ...(!isEditorialContentPublished() ? unpublishedRoutes : []),
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
