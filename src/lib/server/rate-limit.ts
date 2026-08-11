import { createHash } from "node:crypto";

import { connectMongo } from "./db";
import { allowsInMemoryPersistence } from "./env";
import { ApiError } from "./errors";

type Bucket = { count: number; resetAt: number };

type RateLimitDocument = {
  _id: string;
  count: number;
  resetAt: Date;
};

declare global {
  // eslint-disable-next-line no-var
  var __skiesRateLimitBuckets: Map<string, Bucket> | undefined;
  // eslint-disable-next-line no-var
  var __skiesRateLimitIndexPromise: Promise<string> | undefined;
}

const buckets = globalThis.__skiesRateLimitBuckets ?? new Map<string, Bucket>();
globalThis.__skiesRateLimitBuckets = buckets;

function throwRateLimited(resetAt: number, now: number): never {
  const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000));
  throw new ApiError(
    429,
    "RATE_LIMITED",
    "Too many requests. Please try again shortly.",
    { retryAfter },
  );
}

function enforceMemoryRateLimit(
  key: string,
  now: number,
  options: { limit: number; windowMs: number },
): void {
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return;
  }

  if (current.count >= options.limit) {
    throwRateLimited(current.resetAt, now);
  }

  current.count += 1;

  if (buckets.size > 5_000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }
}

function bucketIdentity(namespace: string, identity: string): string {
  return createHash("sha256")
    .update(`${namespace}:${identity}`)
    .digest("hex");
}

function isDuplicateKey(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === 11000,
  );
}

export async function enforceRateLimit(
  namespace: string,
  identity: string,
  options: { limit: number; windowMs: number },
): Promise<void> {
  const now = Date.now();
  const identityHash = bucketIdentity(namespace, identity);
  const connection = await connectMongo();

  if (!connection) {
    if (!allowsInMemoryPersistence()) {
      throw new ApiError(
        503,
        "PERSISTENCE_REQUIRED",
        "Shared abuse protection is required before this request can be accepted.",
        { retryAfter: 30 },
      );
    }
    enforceMemoryRateLimit(identityHash, now, options);
    return;
  }

  const database = connection.connection.db;
  if (!database) {
    throw new ApiError(
      503,
      "DATABASE_UNAVAILABLE",
      "The service is temporarily unavailable.",
      { retryAfter: 30 },
    );
  }

  const collection = database.collection<RateLimitDocument>("rate_limits");
  globalThis.__skiesRateLimitIndexPromise ??= collection.createIndex(
    { resetAt: 1 },
    { expireAfterSeconds: 0, name: "rate_limit_expiry" },
  );
  await globalThis.__skiesRateLimitIndexPromise;

  const windowStart = Math.floor(now / options.windowMs) * options.windowMs;
  const resetAt = windowStart + options.windowMs;
  const bucketId = `${identityHash}:${windowStart}`;
  let bucket: RateLimitDocument | null;
  try {
    bucket = await collection.findOneAndUpdate(
      { _id: bucketId },
      {
        $inc: { count: 1 },
        $setOnInsert: { resetAt: new Date(resetAt) },
      },
      { upsert: true, returnDocument: "after" },
    );
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
    bucket = await collection.findOneAndUpdate(
      { _id: bucketId },
      { $inc: { count: 1 } },
      { returnDocument: "after" },
    );
  }

  if (!bucket || bucket.count > options.limit) {
    throwRateLimited(resetAt, now);
  }
}
