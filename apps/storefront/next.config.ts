import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Product images uploaded to Medusa's local file storage (dev only —
      // see apps/backend/src/scripts/seed-haydengoseek.ts and medusa-config.ts's
      // conditional S3 provider, which replaces this in production).
      { protocol: "http", hostname: "localhost", port: "9000", pathname: "/static/**" },
      // Legacy fallback for any product without a local image folder yet.
      { protocol: "https", hostname: "haydengoseek.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
    // Next 16's image optimizer refuses to proxy any host that resolves to a
    // private/loopback IP by default (SSRF hardening). localhost:9000 above
    // is our own backend, not attacker-controlled, so this is safe — and only
    // matters locally anyway, since production points at S3 instead.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
