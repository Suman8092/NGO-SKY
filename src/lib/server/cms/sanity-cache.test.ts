import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cacheMocks = vi.hoisted(() => ({
  unstableCache: vi.fn(
    (
      callback: (...args: unknown[]) => Promise<unknown>,
      _keyParts?: string[],
      _options?: { revalidate?: number | false; tags?: string[] },
    ) => {
      void _keyParts;
      void _options;
      return callback;
    },
  ),
  fetchPublishedContent: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: cacheMocks.unstableCache,
}));

vi.mock("./sanity", () => ({
  fetchPublishedContent: cacheMocks.fetchPublishedContent,
}));

beforeEach(() => {
  vi.resetModules();
  cacheMocks.unstableCache.mockClear();
  cacheMocks.fetchPublishedContent.mockReset();
  cacheMocks.fetchPublishedContent.mockResolvedValue({
    data: [{ id: "story-1" }],
    source: "sanity",
  });
  vi.stubEnv("DEMO_MODE", "false");
  vi.stubEnv("SANITY_PROJECT_ID", "");
  vi.stubEnv("SANITY_DATASET", "");
  vi.stubEnv("SANITY_STUDIO_API_PROJECT_ID", "marketplace-project");
  vi.stubEnv("SANITY_STUDIO_API_DATASET", "production");
  vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "");
  vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Sanity Next.js data cache", () => {
  it("attaches per-document tags with a five-minute fallback", async () => {
    const {
      fetchCachedPublishedContent,
      isSupportedSanityDocumentType,
      SANITY_CACHE_REVALIDATE_SECONDS,
    } = await import("./sanity-cache");

    const cacheConfigurations = cacheMocks.unstableCache.mock.calls.map(
      ([, keyParts, options]) => ({ keyParts, options }),
    );

    expect(SANITY_CACHE_REVALIDATE_SECONDS).toBe(300);
    expect(isSupportedSanityDocumentType("successStory")).toBe(true);
    expect(isSupportedSanityDocumentType("unknownType")).toBe(false);
    expect(cacheConfigurations).toEqual([
      {
        keyParts: ["sanity-published-content", "campaigns"],
        options: { revalidate: 300, tags: ["campaign"] },
      },
      {
        keyParts: ["sanity-published-content", "programs"],
        options: { revalidate: 300, tags: ["program"] },
      },
      {
        keyParts: ["sanity-published-content", "stories"],
        options: { revalidate: 300, tags: ["successStory"] },
      },
      {
        keyParts: ["sanity-published-content", "posts"],
        options: { revalidate: 300, tags: ["post"] },
      },
      {
        keyParts: ["sanity-published-content", "events"],
        options: { revalidate: 300, tags: ["event"] },
      },
    ]);

    await expect(fetchCachedPublishedContent("stories", 2)).resolves.toEqual({
      data: [{ id: "story-1" }],
      source: "sanity",
    });
    expect(cacheMocks.fetchPublishedContent).toHaveBeenCalledWith("stories", 2);
  });
});
