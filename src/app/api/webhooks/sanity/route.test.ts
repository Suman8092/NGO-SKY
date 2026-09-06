import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const webhookMocks = vi.hoisted(() => ({
  isValidSignature: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@sanity/webhook", () => ({
  isValidSignature: webhookMocks.isValidSignature,
  SIGNATURE_HEADER_NAME: "sanity-signature",
}));

vi.mock("next/cache", () => ({
  revalidateTag: webhookMocks.revalidateTag,
}));

vi.mock("@/lib/server/cms/sanity-cache", () => ({
  isSupportedSanityDocumentType: (value: string) =>
    ["campaign", "program", "successStory", "post", "event"].includes(value),
}));

beforeEach(() => {
  vi.resetModules();
  webhookMocks.isValidSignature.mockReset();
  webhookMocks.revalidateTag.mockReset();
  webhookMocks.isValidSignature.mockResolvedValue(true);
  vi.stubEnv("SANITY_REVALIDATE_SECRET", "sanity-secret-123456");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function webhookRequest(documentType: string): NextRequest {
  return new Request("https://example.org/api/webhooks/sanity", {
    method: "POST",
    headers: { "sanity-signature": "signed-payload" },
    body: JSON.stringify({ _type: documentType }),
  }) as NextRequest;
}

describe("Sanity revalidation webhook", () => {
  it("invalidates the cache tag attached to supported Sanity reads", async () => {
    const { POST } = await import("./route");
    const response = await POST(webhookRequest("successStory"));

    expect(response.status).toBe(200);
    expect(webhookMocks.revalidateTag).toHaveBeenCalledOnce();
    expect(webhookMocks.revalidateTag).toHaveBeenCalledWith("successStory");
  });

  it("does not invalidate arbitrary tags from a signed payload", async () => {
    const { POST } = await import("./route");
    const response = await POST(webhookRequest("unknownType"));

    expect(response.status).toBe(200);
    expect(webhookMocks.revalidateTag).not.toHaveBeenCalled();
  });
});
