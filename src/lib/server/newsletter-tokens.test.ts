import { describe, expect, it } from "vitest";

import {
  createNewsletterUnsubscribeToken,
  hashNewsletterUnsubscribeToken,
  isNewsletterUnsubscribeToken,
} from "./newsletter-tokens";

describe("newsletter unsubscribe tokens", () => {
  it("creates independent 256-bit URL-safe bearer tokens and SHA-256 hashes", () => {
    const first = createNewsletterUnsubscribeToken();
    const second = createNewsletterUnsubscribeToken();

    expect(first.token).toHaveLength(43);
    expect(first.token).not.toBe(second.token);
    expect(isNewsletterUnsubscribeToken(first.token)).toBe(true);
    expect(first.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(first.hash).toBe(hashNewsletterUnsubscribeToken(first.token));
    expect(first.hash).not.toContain(first.token);
  });

  it("rejects malformed or oversized tokens before hashing", () => {
    expect(isNewsletterUnsubscribeToken("short")).toBe(false);
    expect(isNewsletterUnsubscribeToken("a".repeat(44))).toBe(false);
    expect(isNewsletterUnsubscribeToken(`${"a".repeat(42)}+`)).toBe(false);
    expect(() => hashNewsletterUnsubscribeToken("short")).toThrow(TypeError);
  });
});
