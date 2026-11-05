import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NGO_BUILD_DIR || ".next",
  outputFileTracingIncludes: {
    "/api/**": [
      "./src/assets/fonts/*.ttf",
      "./public/brand/foundation-logo-transparent.png",
    ],
  },
  env: {
    NEXT_PUBLIC_CONTENT_VERIFIED:
      process.env.NEXT_PUBLIC_CONTENT_VERIFIED ?? "true",
    NEXT_PUBLIC_CONTENT_RELEASE_ID:
      process.env.NEXT_PUBLIC_CONTENT_RELEASE_ID ??
      "skymeredian-release-2026-v1",
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@react-three/drei",
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
