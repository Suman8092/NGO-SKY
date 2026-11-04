import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { SignUp } from "@clerk/nextjs";

import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { isClerkConfigured, isDemoModeEnabled } from "@/lib/auth-config";

export default function SignUpPage() {
  const enabled = isClerkConfigured();
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#ecf0e9] p-6 dark:bg-[#0c1425]"
    >
      <Link href="/" aria-label="Skymeredian Foundation home">
        <BrandMark className="w-64" priority />
      </Link>
      {enabled ? (
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/dashboard"
        />
      ) : (
        <AuthUnavailable action="sign-up" allowPreview={isDemoModeEnabled()} />
      )}
    </main>
  );
}
