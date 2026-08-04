import type { MetadataRoute } from "next";

import { articles, impactStories } from "@/content/site";

const campaignSlugs = [
  "classrooms-without-limits",
  "mobile-health-near-home",
  "community-kitchens-of-care",
  "water-for-resilient-villages",
  "green-livelihoods-for-women",
];

const routes = [
  "",
  "/about",
  "/about/team",
  "/about/governance",
  "/programs",
  "/campaigns",
  "/impact",
  "/stories",
  "/gallery",
  "/insights",
  "/events",
  "/volunteer",
  "/contact",
  "/donate",
  "/privacy",
  "/terms",
  "/accessibility",
  "/faq",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ashaaya.org";
  const staticRoutes: MetadataRoute.Sitemap = routes.map((route, index) => ({
    url: `${base}${route}`,
    lastModified: new Date("2026-08-01"),
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : route === "/donate" ? 0.9 : 0.7,
  }));
  const campaignRoutes: MetadataRoute.Sitemap = campaignSlugs.map((slug) => ({
    url: `${base}/campaigns/${slug}`,
    lastModified: new Date("2026-08-01"),
    changeFrequency: "weekly",
    priority: slug === "community-kitchens-of-care" ? 0.9 : 0.75,
  }));
  const storyRoutes: MetadataRoute.Sitemap = impactStories.map((story) => ({
    url: `${base}/stories/${story.slug}`,
    lastModified: new Date(story.publishedAt),
    changeFrequency: "yearly",
    priority: 0.65,
  }));
  const insightRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${base}/insights/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: "yearly",
    priority: article.featured ? 0.7 : 0.6,
  }));

  return [...staticRoutes, ...campaignRoutes, ...storyRoutes, ...insightRoutes];
}
