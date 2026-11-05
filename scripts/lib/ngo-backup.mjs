import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rename, rm, open } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { createGzip, createGunzip } from "node:zlib";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createInterface } from "node:readline";
import { BSON } from "mongodb";
const MAGIC = Buffer.from("NGOBACKUP1");
function encryptionKey(value) {
  if (!/^[a-f0-9]{64}$/i.test(value ?? ""))
    throw new Error(
      "BACKUP_ENCRYPTION_KEY must contain 64 hexadecimal characters (32 random bytes).",
    );
  return Buffer.from(value, "hex");
}
export async function backupDatabase(client, database, output, keyValue) {
  const key = encryptionKey(keyValue);
  const destination = resolve(output),
    temporary = `${destination}.${randomBytes(6).toString("hex")}.partial`;
  await mkdir(dirname(destination), { recursive: true });
  const db = client.db(database),
    session = client.startSession();
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(MAGIC);
  const header = Buffer.concat([MAGIC, iv]);
  let documents = 0,
    collections = 0;
  const metadata = await db.listCollections({}, { nameOnly: false }).toArray();
  if (metadata.some((c) => c.type !== "collection"))
    throw new Error(
      "Views or non-collection storage need a managed database backup; this archive only supports ordinary collections.",
    );
  const definitions = await Promise.all(
    metadata.map(async (c) => ({
      name: c.name,
      options: c.options ?? {},
      indexes: await db.collection(c.name).listIndexes().toArray(),
    })),
  );
  async function* records() {
    yield `${BSON.EJSON.stringify({ type: "manifest", version: 1, database, createdAt: new Date(), collections: definitions })}\n`;
    for (const collection of definitions) {
      collections++;
      for await (const document of db
        .collection(collection.name)
        .find({}, { session, batchSize: 100 })) {
        documents++;
        yield `${BSON.EJSON.stringify({ type: "document", collection: collection.name, document }, { relaxed: false })}\n`;
      }
    }
    yield `${BSON.EJSON.stringify({ type: "complete", documents, collections })}\n`;
  }
  try {
    const stream = createWriteStream(temporary, { flags: "wx", mode: 0o600 });
    stream.write(header);
    await session.withTransaction(
      async () => {
        await pipeline(Readable.from(records()), createGzip(), cipher, stream);
      },
      {
        readConcern: { level: "snapshot" },
        readPreference: "primary",
        maxCommitTimeMS: 10000,
      },
    );
    const file = await open(temporary, "a");
    try {
      await file.write(cipher.getAuthTag());
    } finally {
      await file.close();
    }
    await rename(temporary, destination);
    return { documents, collections, output: destination };
  } catch (e) {
    await rm(temporary, { force: true });
    throw e;
  } finally {
    await session.endSession();
  }
}
export async function restoreDatabase(client, input, target, keyValue) {
  const key = encryptionKey(keyValue);
  if (!/^ngo_restore_[a-zA-Z0-9_]{1,40}$/.test(target))
    throw new Error(
      "Restore target must be a new database named ngo_restore_<name>.",
    );
  const db = client.db(target);
  if ((await db.listCollections().toArray()).length)
    throw new Error("Refusing to overwrite a non-empty restore database.");
  const file = await open(resolve(input), "r");
  const stat = await file.stat();
  const header = Buffer.alloc(MAGIC.length + 12),
    tag = Buffer.alloc(16);
  await file.read(header, 0, header.length, 0);
  await file.read(tag, 0, 16, stat.size - 16);
  await file.close();
  if (!header.subarray(0, MAGIC.length).equals(MAGIC))
    throw new Error("Unsupported backup format.");
  // Authenticate the entire encrypted file before any database writes. No plaintext archive is stored.
  const verify = createDecipheriv(
    "aes-256-gcm",
    key,
    header.subarray(MAGIC.length),
  );
  verify.setAAD(MAGIC);
  verify.setAuthTag(tag);
  await pipeline(
    createReadStream(resolve(input), {
      start: header.length,
      end: stat.size - 17,
    }),
    verify,
    async function* (source) {
      for await (const chunk of source) void chunk;
    },
  );
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    header.subarray(MAGIC.length),
  );
  decipher.setAAD(MAGIC);
  decipher.setAuthTag(tag);
  const plain = createReadStream(resolve(input), {
    start: header.length,
    end: stat.size - 17,
  })
    .pipe(decipher)
    .pipe(createGunzip());
  let manifest,
    complete,
    documents = 0;
  const batch = new Map();
  const flush = async (name) => {
    const list = batch.get(name);
    if (list?.length) {
      await db.collection(name).insertMany(list);
      list.length = 0;
    }
  };
  for await (const line of createInterface({
    input: plain,
    crlfDelay: Infinity,
  })) {
    const row = BSON.EJSON.parse(line, { relaxed: false });
    if (row.type === "manifest") {
      if (manifest || Number(row.version) !== 1)
        throw new Error("Invalid backup manifest.");
      manifest = BSON.EJSON.parse(line, { relaxed: true });
      for (const c of manifest.collections) {
        if (typeof c.name !== "string" || c.name.startsWith("system."))
          throw new Error("Unsupported backup collection.");
        await db.createCollection(c.name, c.options);
        batch.set(c.name, []);
      }
    } else if (row.type === "document") {
      if (!manifest || !batch.has(row.collection))
        throw new Error("Document not present in manifest.");
      batch.get(row.collection).push(row.document);
      documents++;
      if (batch.get(row.collection).length >= 100) await flush(row.collection);
    } else if (row.type === "complete") complete = row;
    else throw new Error("Unknown archive entry.");
  }
  if (!manifest || !complete || Number(complete.documents) !== documents)
    throw new Error(
      "Incomplete backup archive. Restore database retained for inspection.",
    );
  for (const c of manifest.collections) {
    await flush(c.name);
    for (const index of c.indexes) {
      if (index.name === "_id_") continue;
      const { key: indexKey, v, ns, ...options } = index;
      void v;
      void ns;
      await db.collection(c.name).createIndex(indexKey, options);
    }
  }
  return {
    database: target,
    documents,
    collections: manifest.collections.length,
  };
}
