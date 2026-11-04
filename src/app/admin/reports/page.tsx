import Link from "next/link";
import { financialSummary } from "@/lib/server/ngo/reports";
import { moduleEntries } from "@/lib/ngo/catalog";
export const dynamic = "force-dynamic";
const money = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    n / 100,
  );
export default async function ReportPage() {
  let summary;
  try {
    summary = await financialSummary();
  } catch {
    return (
      <div>
        <h1 className="text-3xl font-semibold">Financial reports</h1>
        <p role="status" className="mt-5">
          The database is unavailable. No estimated balances are shown.
        </p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-[1200px]">
      <p className="eyebrow">Reconciled operations</p>
      <h1 className="mt-4 text-3xl font-semibold">Reports & accountability</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/60">
        Cash balances include paid INR online gifts, confirmed offline
        donations, registration fees, and project income, less approved
        expenses. Estimated item values and custom acknowledgements are excluded
        from cash balances.
      </p>
      <dl className="mt-8 grid gap-6 border-y border-ink/20 py-6 sm:grid-cols-3">
        {[
          ["Confirmed income", money(summary.incomeMinor)],
          ["Approved expenditure", money(summary.expenseMinor)],
          ["Net recorded balance", money(summary.balanceMinor)],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-ink/60">{k}</dt>
            <dd className="mt-2 text-2xl font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold">Monthly operations ledger</h2>
          <table className="mt-4 w-full text-left text-xs">
            <thead>
              <tr>
                <th className="py-3">Month</th>
                <th>Income</th>
                <th>Expenses</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary.periods)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([period, v]) => (
                  <tr key={period} className="border-t border-ink/10">
                    <td className="py-3">{period}</td>
                    <td>{money(v.income)}</td>
                    <td>{money(v.expenses)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
        <section>
          <h2 className="text-xl font-semibold">People & service</h2>
          <dl className="mt-4 divide-y divide-ink/10">
            {[
              ["Approved members", summary.approvedMembers],
              ["All membership applications", summary.members],
              ["Beneficiaries", summary.beneficiaries],
              ["Open complaints", summary.openComplaints],
              ["Estimated item donations", money(summary.inKindEstimatedMinor)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-3 text-sm">
                <dt>{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <section className="mt-10 border-t border-ink/15 pt-6">
        <h2 className="text-xl font-semibold">Coordinator performance</h2>
        <div className="mt-4 divide-y divide-ink/10">
          {Object.entries(summary.coordinators).map(([id, v]) => (
            <div key={id} className="grid gap-2 py-4 text-sm sm:grid-cols-2">
              <p className="font-medium">{summary.labels[id] ?? id}</p>
              <p className="text-ink/65">
                {money(v.donations)} · {v.donors} recorded gifts · {v.members}{" "}
                members
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-10 border-t border-ink/15 pt-6">
        <h2 className="text-xl font-semibold">Project income & expenses</h2>
        <div className="mt-4 divide-y divide-ink/10">
          {Object.entries(summary.projects).map(([id, v]) => (
            <div key={id} className="grid gap-2 py-4 text-sm sm:grid-cols-2">
              <p className="font-medium">{summary.labels[id] ?? id}</p>
              <p className="text-ink/65">
                Income {money(v.income)} · expenses {money(v.expenses)} ·
                balance {money(v.income - v.expenses)}
              </p>
            </div>
          ))}
        </div>
      </section>
      <h2 className="mt-10 text-xl font-semibold">Download filtered reports</h2>
      <p className="mt-2 text-sm text-ink/60">
        Each module supports date ranges, status, and search before exporting
        PDF or Excel.
      </p>
      <div className="mt-5 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {moduleEntries
          .filter(([k]) => k !== "audit")
          .map(([key, d]) => (
            <Link
              key={key}
              href={`/admin/manage/${key}`}
              className="border-t border-ink/15 py-4 text-sm font-medium text-forest"
            >
              {d.title} →
            </Link>
          ))}
      </div>
    </div>
  );
}
