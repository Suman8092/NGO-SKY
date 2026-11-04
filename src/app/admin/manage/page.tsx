import Link from "next/link";
import { moduleEntries } from "@/lib/ngo/catalog";
import { NgoRecordModel } from "@/models/NgoRecord";
import { requireNgoDatabase } from "@/lib/server/ngo/access";
export const dynamic = "force-dynamic";
export default async function ManagementHub() {
  let counts: Record<string, number> | null = null;
  try {
    await requireNgoDatabase();
    const rows = await NgoRecordModel.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: "$module", count: { $sum: 1 } } },
    ]);
    counts = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  } catch {}
  return (
    <div className="mx-auto max-w-[1200px]">
      <p className="eyebrow">NGO operations</p>
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
        One workspace for the foundation.
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/60">
        Manage memberships, field operations, publishing, records, and
        correspondence. Every module uses protected database records and
        administrative audit history.
      </p>
      <div className="my-6 flex flex-wrap gap-4 text-sm font-semibold text-forest">
        <Link href="/admin/reports">Financial reports</Link>
        <Link href="/admin/manage/documents">Receipt register</Link>
        <Link href="/admin/manage/audit">Activity history</Link>
        <Link href="/membership" target="_blank">
          Public registration
        </Link>
      </div>
      {counts === null && (
        <p role="status" className="border-l-2 border-amber-500 p-4 text-sm">
          Record counts are unavailable while the database cannot be reached.
        </p>
      )}
      {[...new Set(moduleEntries.map(([, d]) => d.group))].map((group) => (
        <section key={group} className="mt-8 border-t border-ink/20 pt-5">
          <h2 className="text-lg font-semibold">{group}</h2>
          <div className="mt-3 grid gap-x-8 md:grid-cols-2">
            {moduleEntries
              .filter(([, d]) => d.group === group)
              .map(([key, d]) => (
                <Link
                  key={key}
                  href={`/admin/manage/${key}`}
                  className="flex items-start justify-between gap-5 border-b border-ink/10 py-5 transition hover:text-forest"
                >
                  <div>
                    <h3 className="text-sm font-semibold">{d.title}</h3>
                    <p className="mt-2 max-w-md text-xs leading-6 text-ink/60">
                      {d.description}
                    </p>
                  </div>
                  <span className="text-xs tabular-nums text-ink/50">
                    {counts !== null ? (counts[key] ?? 0) : "—"} →
                  </span>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
