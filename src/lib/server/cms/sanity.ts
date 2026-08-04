import { createClient, type SanityClient } from "@sanity/client";

import { getServerEnv, hasSanityConfig } from "../env";
import { ApiError } from "../errors";

export type ContentKind = "campaigns" | "programs" | "stories" | "posts" | "events";
export type ContentResult<T> = { data: T[]; source: "sanity" | "demo" };

const queries: Record<ContentKind, string> = {
  campaigns: `*[_type == "campaign" && coalesce(isActive, true) == true] | order(featured desc, _createdAt desc)[0...$limit]{
    "id": _id, title, "slug": slug.current, summary, category, goal, raised, currency, deadline,
    "image": image.asset->url, featured
  }`,
  programs: `*[_type == "program"] | order(order asc, title asc)[0...$limit]{
    "id": _id, title, "slug": slug.current, summary, icon, "image": image.asset->url, impact
  }`,
  stories: `*[_type == "successStory"] | order(publishedAt desc)[0...$limit]{
    "id": _id, title, "slug": slug.current, excerpt, personName, location, publishedAt,
    "image": image.asset->url, "videoUrl": video.asset->url
  }`,
  posts: `*[_type == "post" && defined(publishedAt)] | order(publishedAt desc)[0...$limit]{
    "id": _id, title, "slug": slug.current, excerpt, publishedAt, "image": mainImage.asset->url,
    "author": author->{name, "image": image.asset->url}, "categories": categories[]->title
  }`,
  events: `*[_type == "event"] | order(startAt asc)[0...$limit]{
    "id": _id, title, "slug": slug.current, summary, startAt, endAt, location,
    "image": image.asset->url, registrationUrl
  }`,
};

let sanityClient: SanityClient | undefined;

function client(): SanityClient | null {
  if (!hasSanityConfig()) return null;
  if (sanityClient) return sanityClient;
  const env = getServerEnv();
  const projectId = env.SANITY_PROJECT_ID ?? env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = env.SANITY_DATASET ?? env.NEXT_PUBLIC_SANITY_DATASET;
  if (!projectId || !dataset) return null;
  sanityClient = createClient({
    projectId,
    dataset,
    apiVersion: env.SANITY_API_VERSION,
    token: env.SANITY_API_TOKEN,
    useCdn: !env.SANITY_API_TOKEN,
    perspective: "published",
  });
  return sanityClient;
}

export async function fetchPublishedContent<T extends Record<string, unknown>>(
  kind: ContentKind,
  limit: number,
): Promise<ContentResult<T>> {
  const sanity = client();
  if (!sanity) return { data: [], source: "demo" };
  try {
    const data = await sanity.fetch<T[]>(queries[kind], { limit });
    return { data, source: "sanity" };
  } catch (cause) {
    throw new ApiError(502, "CMS_UNAVAILABLE", "Published content is temporarily unavailable.", { cause });
  }
}
