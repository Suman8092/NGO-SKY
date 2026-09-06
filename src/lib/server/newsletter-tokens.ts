import { createHash, randomBytes } from "node:crypto";

const TOKEN_BYTES = 32;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export type NewsletterUnsubscribeToken = {
  token: string;
  hash: string;
};

export function isNewsletterUnsubscribeToken(value: unknown): value is string {
  return typeof value === "string" && TOKEN_PATTERN.test(value);
}

export function hashNewsletterUnsubscribeToken(token: string): string {
  if (!isNewsletterUnsubscribeToken(token)) {
    throw new TypeError("Invalid newsletter unsubscribe token.");
  }

  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function createNewsletterUnsubscribeToken(): NewsletterUnsubscribeToken {
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  return { token, hash: hashNewsletterUnsubscribeToken(token) };
}
