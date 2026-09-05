import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Product images served from Medusa's local file provider, backed by a
      // Railway Volume in production (see medusa-config.ts) — same /static
      // path locally and in prod, just a different host.
      { protocol: "http", hostname: "localhost", port: "9000", pathname: "/static/**" },
      { protocol: "https", hostname: "backend-production-eae1.up.railway.app", pathname: "/static/**" },
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
