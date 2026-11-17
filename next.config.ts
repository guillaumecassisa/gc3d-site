import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * En-têtes de sécurité appliqués à toutes les réponses.
 * La CSP sera durcie (nonces) lors de l'intégration de Stripe Elements (phase 3).
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  typedRoutes: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: process.env.STORAGE_PUBLIC_BASE_URL
      ? [new URL(`${process.env.STORAGE_PUBLIC_BASE_URL.replace(/\/$/, "")}/**`)]
      : [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
