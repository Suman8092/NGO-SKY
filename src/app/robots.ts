import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ashaaya.org";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/dashboard/"] },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
