"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { SmoothScroll } from "@/components/smooth-scroll";
import { PwaRegister } from "@/components/pwa-register";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const content = (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SmoothScroll>{children}</SmoothScroll>
      <PwaRegister />
      <Toaster position="bottom-right" richColors closeButton />
    </ThemeProvider>
  );

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return publishableKey ? (
    <ClerkProvider publishableKey={publishableKey}>{content}</ClerkProvider>
  ) : (
    content
  );
}
