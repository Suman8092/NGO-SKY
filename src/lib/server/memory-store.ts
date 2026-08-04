import { createHash } from "node:crypto";

type DemoRecord = Record<string, unknown> & { id: string; createdAt: string; updatedAt: string };
type DemoCollection = "contacts" | "newsletter" | "volunteers" | "donations";

declare global {
  // eslint-disable-next-line no-var
  var __skiesDemoStore: Map<DemoCollection, Map<string, DemoRecord>> | undefined;
}

const store =
  globalThis.__skiesDemoStore ??
  new Map<DemoCollection, Map<string, DemoRecord>>([
    ["contacts", new Map()],
    ["newsletter", new Map()],
    ["volunteers", new Map()],
    ["donations", new Map()],
  ]);
globalThis.__skiesDemoStore = store;

function stableValue(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableValue).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableValue(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function demoId(collection: DemoCollection, identity: unknown): string {
  return `demo_${createHash("sha256").update(`${collection}:${stableValue(identity)}`).digest("hex").slice(0, 20)}`;
}

export function putDemoRecord<T extends Record<string, unknown>>(
  collection: DemoCollection,
  identity: unknown,
  value: T,
): DemoRecord & T {
  const id = demoId(collection, identity);
  const current = store.get(collection)?.get(id);
  const now = new Date().toISOString();
  const record = {
    ...value,
    id,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  } as DemoRecord & T;
  store.get(collection)?.set(id, record);
  return record;
}

export function getDemoRecord<T extends DemoRecord>(
  collection: DemoCollection,
  id: string,
): T | null {
  return (store.get(collection)?.get(id) as T | undefined) ?? null;
}

export function updateDemoRecord<T extends DemoRecord>(
  collection: DemoCollection,
  id: string,
  patch: Partial<T>,
): T | null {
  const current = store.get(collection)?.get(id) as T | undefined;
  if (!current) return null;
  const record = { ...current, ...patch, id, updatedAt: new Date().toISOString() } as T;
  store.get(collection)?.set(id, record);
  return record;
}

export function getDemoCounts(): Record<DemoCollection, number> {
  return {
    contacts: store.get("contacts")?.size ?? 0,
    newsletter: store.get("newsletter")?.size ?? 0,
    volunteers: store.get("volunteers")?.size ?? 0,
    donations: store.get("donations")?.size ?? 0,
  };
}
