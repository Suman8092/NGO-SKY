import { SignUp } from "@clerk/nextjs";

import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { isClerkConfigured, isDemoModeEnabled } from "@/lib/auth-config";

export default function SignUpPage() {
  const enabled = isClerkConfigured();
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-[#ecf0e9] p-6 dark:bg-[#0c1614]">
      {enabled ? (
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
      ) : (
        <AuthUnavailable action="sign-up" allowPreview={isDemoModeEnabled()} />
      )}
    </main>
  );
}
