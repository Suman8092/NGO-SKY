import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";

import { AppProviders } from "@/components/app-providers";
import { CustomCursor } from "@/components/custom-cursor";
import { ScrollProgress } from "@/components/scroll-progress";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ashaaya.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ashaaya Foundation — Hope, made practical",
    template: "%s · Ashaaya Foundation",
  },
  description:
    "Back locally led solutions in education, health, livelihoods, relief, and climate resilience—and follow every rupee to its outcome.",
  keywords: [
    "NGO India",
    "donate to charity India",
    "community-led development",
    "education nonprofit",
    "climate resilience",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Ashaaya Foundation",
    title: "Ashaaya Foundation — Hope, made practical",
    description:
      "Practical, community-owned progress. Radically transparent giving.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ashaaya Foundation — Hope, made practical",
    description:
      "Practical, community-owned progress. Radically transparent giving.",
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
  "@type": "NGO",
  name: "Ashaaya Foundation",
  url: siteUrl,
  logo: `${siteUrl}/icon.svg`,
  description:
    "An India-rooted nonprofit backing locally led solutions in learning, health, livelihoods, relief, and climate resilience.",
  email: "hello@ashaaya.org",
  telephone: "+91-80-4718-2020",
  areaServed: ["India", "South Asia"],
  sameAs: [
    "https://instagram.com/ashaayafoundation",
    "https://linkedin.com/company/ashaaya-foundation",
    "https://youtube.com/@ashaayafoundation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
        <AppProviders>
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
