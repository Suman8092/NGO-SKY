import Link from "next/link";
import { redirect } from "next/navigation";
import { ngoActor } from "@/lib/server/ngo/access";
import { ModuleWorkspace } from "@/components/ngo/module-workspace";
import { getModule } from "@/lib/ngo/catalog";
export const dynamic = "force-dynamic";
export default async function FieldWorkspace({
  searchParams,
}: {
  searchParams: Promise<{ module?: string }>;
}) {
  const actor = await ngoActor();
  if (!actor.admin && !actor.coordinator) redirect("/dashboard");
  const options = [
    "offline-donations",
    "members",
    "in-kind",
    "beneficiaries",
    "assistance",
  ];
  const p = await searchParams;
  const moduleKey = options.includes(p.module ?? "") ? p.module! : options[0];
  return (
    <div className="mx-auto max-w-[1200px]">
      <p className="eyebrow">Field workspace</p>
      <h1 className="mt-4 text-3xl font-semibold">Coordinator operations</h1>
      <p className="mt-4 text-sm leading-7 text-ink/60">
        Only your own and assigned records are available here. Donations are
        submitted for finance review before confirmation and receipting.
      </p>
      <nav
        aria-label="Coordinator modules"
        className="my-6 flex flex-wrap gap-4 border-y border-ink/15 py-4 text-xs font-semibold"
      >
        {options.map((m) => (
          <Link
            key={m}
            href={`/dashboard/coordinator?module=${m}`}
            aria-current={moduleKey === m ? "page" : undefined}
            className={
              moduleKey === m ? "text-forest underline" : "text-ink/60"
            }
          >
            {getModule(m)?.title}
          </Link>
        ))}
      </nav>
      <ModuleWorkspace key={moduleKey} module={moduleKey} field />
    </div>
  );
}
