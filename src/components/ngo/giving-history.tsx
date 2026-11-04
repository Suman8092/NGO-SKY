"use client";
import { useEffect, useState } from "react";
type Gift = {
  id: string;
  reference: string;
  amountMinor: number;
  currency: string;
  status: string;
  date: string;
  method: string;
  source: string;
};
export function GivingHistory() {
  const [page, setPage] = useState(1),
    [rows, setRows] = useState<Gift[]>([]),
    [total, setTotal] = useState(0),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    fetch(`/api/ngo/giving?page=${page}`, { signal: c.signal })
      .then(async (r) => {
        const b = await r.json();
        if (!r.ok) throw new Error(b.error?.message);
        setRows(b.data.rows);
        setTotal(b.data.total);
        setError("");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [page]);
  return (
    <section className="border-t border-ink/15 pt-6">
      <h2 className="text-xl font-semibold">
        Complete online & offline donation history
      </h2>
      {error ? (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      ) : loading ? (
        <p role="status" className="py-5 text-sm text-ink/60">
          Loading your contributions…
        </p>
      ) : (
        <>
          <div className="mt-4 divide-y divide-ink/10">
            {rows.map((r) => (
              <div
                key={`${r.source}:${r.id}`}
                className="flex flex-wrap items-center justify-between gap-4 py-4 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: r.currency,
                    }).format(r.amountMinor / 100)}{" "}
                    · {r.status}
                  </p>
                  <p className="mt-1 text-xs text-ink/60">
                    {r.reference} · {r.method} ·{" "}
                    {new Date(r.date).toLocaleDateString("en-IN")}
                  </p>
                </div>
                {r.source === "online" && r.status === "paid" && (
                  <a
                    href={`/api/donations/${r.id}/receipt`}
                    className="text-xs font-semibold text-forest"
                  >
                    Receipt PDF
                  </a>
                )}
              </div>
            ))}
            {!rows.length && (
              <p className="py-5 text-sm text-ink/60">
                No recorded donations are linked to your account.
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center justify-end gap-4 text-xs">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="min-h-10 disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              {page} / {Math.max(1, Math.ceil(total / 20))}
            </span>
            <button
              type="button"
              disabled={page * 20 >= total}
              onClick={() => setPage((p) => p + 1)}
              className="min-h-10 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}
