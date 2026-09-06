import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sanityMocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock("@sanity/client", () => ({
  createClient: sanityMocks.createClient,
}));

const sanityEnvironmentVariables = [
  "DEMO_MODE",
  "SANITY_PROJECT_ID",
  "SANITY_STUDIO_API_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "SANITY_DATASET",
  "SANITY_STUDIO_API_DATASET",
  "NEXT_PUBLIC_SANITY_DATASET",
  "SANITY_API_READ_TOKEN",
  "SANITY_API_TOKEN",
  "SANITY_API_WRITE_TOKEN",
] as const;

function stubSanityEnvironment(
  values: Partial<Record<(typeof sanityEnvironmentVariables)[number], string>>,
): void {
  for (const variable of sanityEnvironmentVariables) {
    vi.stubEnv(variable, values[variable] ?? "");
  }
}

beforeEach(() => {
  vi.resetModules();
  sanityMocks.createClient.mockReset();
  sanityMocks.fetch.mockReset();
  sanityMocks.createClient.mockReturnValue({ fetch: sanityMocks.fetch });
  sanityMocks.fetch.mockResolvedValue([{ id: "record-1" }]);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Sanity runtime configuration", () => {
  it("accepts Marketplace aliases and uses only the read token", async () => {
    stubSanityEnvironment({
      DEMO_MODE: "false",
      SANITY_STUDIO_API_PROJECT_ID: "marketplace-project",
      SANITY_STUDIO_API_DATASET: "production",
      SANITY_API_READ_TOKEN: "read-token-123",
      SANITY_API_TOKEN: "legacy-token-123",
      SANITY_API_WRITE_TOKEN: "write-token-123",
    });

    const { fetchPublishedContent } = await import("./sanity");
    const result = await fetchPublishedContent("campaigns", 3);

    expect(result).toEqual({
      data: [{ id: "record-1" }],
      source: "sanity",
    });
    expect(sanityMocks.createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "marketplace-project",
        dataset: "production",
        token: "read-token-123",
        useCdn: false,
        perspective: "published",
      }),
    );
    expect(sanityMocks.createClient.mock.calls[0]?.[0]?.token).not.toBe(
      "write-token-123",
    );
  });

  it("retains legacy server identifiers and read-token fallback", async () => {
    stubSanityEnvironment({
      DEMO_MODE: "false",
      SANITY_PROJECT_ID: "legacy-project",
      SANITY_DATASET: "published",
      SANITY_API_TOKEN: "legacy-read-token",
      SANITY_API_WRITE_TOKEN: "write-token-123",
    });

    const { fetchPublishedContent } = await import("./sanity");
    await fetchPublishedContent("posts", 2);

    expect(sanityMocks.createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "legacy-project",
        dataset: "published",
        token: "legacy-read-token",
        useCdn: false,
      }),
    );
  });
});
