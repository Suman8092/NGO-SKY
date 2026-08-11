import { describe, expect, it } from "vitest";

import { isEditorialContentPublished } from "./content-config";

describe("editorial content publication", () => {
  it("keeps the bundled content available for local review", () => {
    expect(isEditorialContentPublished({ NODE_ENV: "development" })).toBe(true);
    expect(isEditorialContentPublished({ NODE_ENV: "test" })).toBe(true);
  });

  it("fails closed in production until approval is explicit", () => {
    expect(isEditorialContentPublished({ NODE_ENV: "production" })).toBe(false);
    expect(
      isEditorialContentPublished({
        NODE_ENV: "production",
        NEXT_PUBLIC_CONTENT_VERIFIED: "false",
      }),
    ).toBe(false);
    expect(
      isEditorialContentPublished({
        NODE_ENV: "production",
        NEXT_PUBLIC_CONTENT_VERIFIED: "TRUE",
      }),
    ).toBe(true);
  });

  it("keeps public Vercel previews gated until approval is explicit", () => {
    expect(
      isEditorialContentPublished({
        NODE_ENV: "production",
        VERCEL_ENV: "preview",
      }),
    ).toBe(false);
    expect(
      isEditorialContentPublished({
        NODE_ENV: "development",
        VERCEL_ENV: "preview",
      }),
    ).toBe(false);
    expect(
      isEditorialContentPublished({
        NODE_ENV: "development",
        VERCEL_ENV: "preview",
        NEXT_PUBLIC_CONTENT_VERIFIED: "true",
      }),
    ).toBe(true);
  });

  it("fails closed for the Vercel production environment", () => {
    expect(
      isEditorialContentPublished({
        NODE_ENV: "development",
        VERCEL_ENV: "production",
      }),
    ).toBe(false);
    expect(
      isEditorialContentPublished({
        NODE_ENV: "development",
        VERCEL_ENV: "production",
        NEXT_PUBLIC_CONTENT_VERIFIED: "true",
      }),
    ).toBe(true);
  });
});
