import { ApiError } from "./errors";

type Bucket = { count: number; resetAt: number };

declare global {
  // eslint-disable-next-line no-var
  var __skiesRateLimitBuckets: Map<string, Bucket> | undefined;
}

const buckets = globalThis.__skiesRateLimitBuckets ?? new Map<string, Bucket>();
globalThis.__skiesRateLimitBuckets = buckets;

export function enforceRateLimit(
  namespace: string,
  identity: string,
  options: { limit: number; windowMs: number },
): void {
  const now = Date.now();
  const key = `${namespace}:${identity}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return;
  }

  if (current.count >= options.limit) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    throw new ApiError(429, "RATE_LIMITED", "Too many requests. Please try again shortly.", {
      retryAfter,
    });
  }

  current.count += 1;

  if (buckets.size > 5_000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }
}
