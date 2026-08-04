import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export default function SignUpPage() {
  const enabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-[#ecf0e9] p-6 dark:bg-[#0c1614]">
      {enabled ? <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" forceRedirectUrl="/dashboard" /> : <div className="max-w-md rounded-3xl border border-ink/10 bg-paper p-8 shadow-soft"><BrandMark /><h1 className="mt-6 font-display text-3xl font-bold">Supporter accounts are ready to connect.</h1><p className="mt-4 text-sm leading-7 text-ink/55">Add the Clerk keys documented in the environment guide, then registration, sessions, and protected dashboards activate automatically.</p><Link href="/" className="button-secondary mt-7">Return home</Link></div>}
    </main>
  );
}
