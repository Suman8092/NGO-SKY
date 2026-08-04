import mongoose from "mongoose";

import { getServerEnv, hasMongoConfig } from "./env";
import { ApiError } from "./errors";

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __skiesMongoose: MongooseCache | undefined;
}

const cache: MongooseCache = globalThis.__skiesMongoose ?? {
  connection: null,
  promise: null,
};
globalThis.__skiesMongoose = cache;

export async function connectMongo(): Promise<typeof mongoose | null> {
  if (!hasMongoConfig()) return null;
  if (cache.connection && mongoose.connection.readyState === 1) return cache.connection;

  const env = getServerEnv();
  if (!env.MONGODB_URI) return null;

  cache.promise ??= mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB_NAME,
    bufferCommands: false,
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5_000,
    socketTimeoutMS: 15_000,
  });

  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch (cause) {
    cache.promise = null;
    cache.connection = null;
    throw new ApiError(503, "DATABASE_UNAVAILABLE", "The service is temporarily unavailable.", {
      retryAfter: 30,
      cause,
    });
  }
}

export async function pingMongo(): Promise<"connected" | "demo"> {
  const connection = await connectMongo();
  if (!connection) return "demo";
  await connection.connection.db?.admin().ping();
  return "connected";
}
