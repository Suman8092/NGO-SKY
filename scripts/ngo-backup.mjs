import { readFile } from "node:fs/promises";
import { parse } from "dotenv";
import { MongoClient } from "mongodb";
import { backupDatabase, restoreDatabase } from "./lib/ngo-backup.mjs";
let local = {};
try {
  local = parse(await readFile(".env.local", "utf8"));
} catch {}
const env = { ...local, ...process.env };
const [action, file, target] = process.argv.slice(2);
if (!["backup", "restore"].includes(action) || !file)
  throw new Error(
    "Usage: node scripts/ngo-backup.mjs backup <encrypted-file> OR restore <encrypted-file> ngo_restore_<name>",
  );
const client = new MongoClient(env.MONGODB_URI);
try {
  await client.connect();
  const result =
    action === "backup"
      ? await backupDatabase(
          client,
          env.MONGODB_DB_NAME || "skymeredian-foundation",
          file,
          env.BACKUP_ENCRYPTION_KEY,
        )
      : await restoreDatabase(client, file, target, env.BACKUP_ENCRYPTION_KEY);
  console.log(JSON.stringify(result));
} finally {
  await client.close();
}
