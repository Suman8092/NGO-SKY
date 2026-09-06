import { unstable_cache } from "next/cache";

import { getServerEnv, hasSanityConfig } from "../env";
import {
  fetchPublishedContent,
  type ContentKind,
  type ContentResult,
} from "./sanity";

export const SANITY_CACHE_REVALIDATE_SECONDS = 5 * 60;

export const sanityDocumentTypeByContentKind = {
  campaigns: "campaign",
  programs: "program",
  stories: "successStory",
  posts: "post",
  events: "event",
} as const satisfies Record<ContentKind, string>;

const supportedDocumentTypes = new Set<string>(
  Object.values(sanityDocumentTypeByContentKind),
);

type CachedContentFetcher = (
  cacheScope: string,
  limit: number,
) => Promise<ContentResult<Record<string, unknown>>>;

function createCachedContentFetcher(kind: ContentKind): CachedContentFetcher {
  return unstable_cache(
    async (_cacheScope: string, limit: number) =>
      fetchPublishedContent<Record<string, unknown>>(kind, limit),
    ["sanity-published-content", kind],
    {
      revalidate: SANITY_CACHE_REVALIDATE_SECONDS,
      tags: [sanityDocumentTypeByContentKind[kind]],
    },
  );
}

const cachedContentFetchers: Record<ContentKind, CachedContentFetcher> = {
  campaigns: createCachedContentFetcher("campaigns"),
  programs: createCachedContentFetcher("programs"),
  stories: createCachedContentFetcher("stories"),
  posts: createCachedContentFetcher("posts"),
  events: createCachedContentFetcher("events"),
};

function getSanityCacheScope(): string | null {
  if (!hasSanityConfig()) return null;

  const env = getServerEnv();
  const projectId =
    env.SANITY_PROJECT_ID ??
    env.SANITY_STUDIO_API_PROJECT_ID ??
    env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset =
    env.SANITY_DATASET ??
    env.SANITY_STUDIO_API_DATASET ??
    env.NEXT_PUBLIC_SANITY_DATASET;

  return projectId && dataset ? `${projectId}:${dataset}` : null;
}

export function isSupportedSanityDocumentType(value: string): boolean {
  return supportedDocumentTypes.has(value);
}

export async function fetchCachedPublishedContent<
  T extends Record<string, unknown>,
>(kind: ContentKind, limit: number): Promise<ContentResult<T>> {
  const cacheScope = getSanityCacheScope();
  if (!cacheScope) return fetchPublishedContent<T>(kind, limit);

  return cachedContentFetchers[kind](cacheScope, limit) as Promise<
    ContentResult<T>
  >;
}
