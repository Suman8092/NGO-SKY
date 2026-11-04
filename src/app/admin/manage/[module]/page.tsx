import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule } from "@/lib/ngo/catalog";
import { ModuleWorkspace } from "@/components/ngo/module-workspace";
export const dynamic = "force-dynamic";
export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const definition = getModule(module);
  if (!definition) notFound();
  return (
    <div className="mx-auto max-w-[1200px]">
      <Link href="/admin/manage" className="text-xs font-semibold text-forest">
        ← NGO operations
      </Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-ink/50">
        {definition.group}
      </p>
      <h1 className="mb-6 mt-2 text-3xl font-semibold sm:text-4xl">
        {definition.title}
      </h1>
      <ModuleWorkspace module={module} />
    </div>
  );
}
