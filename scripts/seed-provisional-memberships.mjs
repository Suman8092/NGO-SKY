import { readFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { parse } from "dotenv";
import { MongoClient } from "mongodb";
const env = { ...parse(await readFile(".env.local", "utf8")), ...process.env };
if (!env.MONGODB_URI) throw new Error("MongoDB configuration required");
const client = new MongoClient(env.MONGODB_URI);
try {
  await client.connect();
  const db = client.db(env.MONGODB_DB_NAME || "skymeredian-foundation");
  const collection = db.collection("ngorecords");
  let added = 0;
  for (const [key, title] of [
    ["general", "General Member"],
    ["volunteer", "Volunteer Member"],
    ["supporter", "Supporter Member"],
  ]) {
    const now = new Date();
    const result = await collection.updateOne(
      { identityKey: `provisional-designation:${key}` },
      {
        $setOnInsert: {
          module: "designations",
          reference: `DES-PROVISIONAL-${key.toUpperCase()}`,
          identityKey: `provisional-designation:${key}`,
          status: "active",
          data: {
            name: `PROVISIONAL - ${title}`,
            description:
              "Testing category only. This is not an official designation. No fee is collected. Edit or deactivate from Admin before launch.",
            fee: 0,
            termMonths: 1,
            provisional: true,
          },
          revision: 1,
          verifyToken: randomBytes(32).toString("hex"),
          downloadToken: randomBytes(32).toString("hex"),
          createdBy: "authorized-provisional-setup",
          updatedBy: "authorized-provisional-setup",
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        },
      },
      { upsert: true },
    );
    added += result.upsertedCount;
  }
  console.log(
    JSON.stringify({
      provisionalCategoriesCreated: added,
      officialIdentityCreated: false,
    }),
  );
} finally {
  await client.close();
}
