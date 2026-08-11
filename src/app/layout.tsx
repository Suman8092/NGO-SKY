import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";

import { AppProviders } from "@/components/app-providers";
import { CustomCursor } from "@/components/custom-cursor";
import { ScrollProgress } from "@/components/scroll-progress";
import { isClerkConfigured } from "@/lib/auth-config";
import { isEditorialContentPublished } from "@/lib/content-config";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const siteUrl = configuredSiteUrl || "http://localhost:3000";
const editorialContentPublished = isEditorialContentPublished();
const defaultTitle = editorialContentPublished
  ? "Ashaaya Foundation — Hope, made practical"
  : "Ashaaya Foundation — Publication status";
const metadataDescription = editorialContentPublished
  ? "Ashaaya Foundation website, with reviewed organisation information and available services."
  : "Publication and online-service availability for the Ashaaya Foundation website.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s · Ashaaya Foundation",
  },
  description: metadataDescription,
  keywords: editorialContentPublished
    ? [
        "NGO India",
        "donate to charity India",
        "community-led development",
        "education nonprofit",
        "climate resilience",
      ]
    : ["Ashaaya Foundation", "website publication status"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Ashaaya Foundation",
    title: defaultTitle,
    description: metadataDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: metadataDescription,
  },
  category: "nonprofit",
  creator: "Ashaaya Foundation",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1614" },
  ],
  colorScheme: "light dark",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Ashaaya Foundation",
  url: siteUrl,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const clerkEnabled = isClerkConfigured();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jakarta.variable}`}
    >
      <body>
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[1000] -translate-y-24 rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper transition focus:translate-y-0"
        >
          Skip to main content
        </a>
        <AppProviders clerkEnabled={clerkEnabled}>
          <ScrollProgress />
          <CustomCursor />
          {children}
        </AppProviders>
        <Script
          id="ashaaya-organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
