import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { BrandMark } from "@/components/brand-mark";
import { isClerkConfigured, isDemoModeEnabled } from "@/lib/auth-config";

export default function SignInPage() {
  const enabled = isClerkConfigured();
  return (
    <main id="main-content" className="grid min-h-screen bg-[#ecf0e9] lg:grid-cols-2 dark:bg-[#0c1614]">
      <div className="hidden bg-[#08241e] p-12 text-white lg:flex lg:flex-col lg:justify-between"><Link href="/" className="flex items-center gap-3"><BrandMark className="text-[#6bd0ae]" /><span className="font-display font-extrabold uppercase">Ashaaya Foundation</span></Link><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6bd0ae]">Your generosity, remembered</p><h1 className="mt-5 max-w-xl font-display text-6xl font-semibold leading-[0.96] tracking-[-0.06em]">One place for every gift and every ripple.</h1><p className="mt-6 max-w-lg text-base leading-8 text-white/55">View receipts, tax certificates, saved campaigns, and the field updates your support makes possible.</p></div><p className="text-xs text-white/30">Secure authentication powered by Clerk</p></div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        {enabled ? (
          <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
        ) : (
          <AuthUnavailable action="sign-in" allowPreview={isDemoModeEnabled()} />
        )}
      </div>
    </main>
  );
}
