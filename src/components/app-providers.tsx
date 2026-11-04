"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { SmoothScroll } from "@/components/smooth-scroll";
import { PwaRegister } from "@/components/pwa-register";
export function AppProviders({
  children,
  clerkEnabled,
}: {
  children: React.ReactNode;
  clerkEnabled: boolean;
}) {
  const content = (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SmoothScroll>{children}</SmoothScroll>
      <PwaRegister />
      <Toaster position="bottom-right" richColors closeButton />
    </ThemeProvider>
  );

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return publishableKey && clerkEnabled ? (
    <ClerkProvider
      appearance={{
        variables: { fontFamily: "var(--font-poppins), sans-serif" },
        elements: {
          logoImage: {
            width: "220px",
            height: "auto",
            maxHeight: "80px",
            objectFit: "contain",
          },
        },
        layout: {
          logoImageUrl: "/brand/foundation-logo-transparent.png",
          logoPlacement: "inside",
        },
      }}
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      {content}
    </ClerkProvider>
  ) : (
    content
  );
}
