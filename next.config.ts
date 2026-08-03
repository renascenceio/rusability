import type { NextConfig } from "next";

/**
 * РКН / Roskomnadzor technical compliance — HTTP security headers.
 *
 * These are the application-controllable parts of the June 2026 technical
 * overview (HSTS, forced-HTTPS for subresources, MIME-sniffing and clickjacking
 * protection). The transport-layer items the overview also lists — TLS 1.2/1.3
 * negotiation, disabling SSL 3.0 / TLS 1.0 / TLS 1.1, HTTP/2 (and HTTP/3), the
 * automatic HTTP→HTTPS 308 redirect and the trusted CA certificate — are
 * terminated and enforced by the Vercel edge, not by this code.
 *
 * Gated to VERCEL_ENV === "production" so preview/dev deployments (and the v0
 * preview iframe) are not affected by HSTS or X-Frame-Options.
 */
const isProduction = process.env.VERCEL_ENV === "production";

const securityHeaders = [
  // Force HTTPS for two years, all subdomains, eligible for the browser preload list.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Upgrade any http:// subresource request to https:// (no mixed content).
  { key: "Content-Security-Policy", value: "upgrade-insecure-requests" },
  // Block MIME-type sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only same-origin framing (anti-clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Don't leak full URLs to third parties.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Deny powerful browser features the site does not use.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    if (!isProduction) return [];
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  /**
   * First-party proxy for Google Analytics 4.
   *
   * rusability.ru serves a Russian audience, where GA4's third-party domains
   * (googletagmanager.com / google-analytics.com) are heavily lost to ad-block
   * lists and Roskomnadzor throttling of Google infrastructure — which is why
   * GA4 reads ~10x lower than our first-party server-side beacon. Routing both
   * the gtag script and the collect hits through our OWN origin turns them into
   * same-origin requests that domain-based blockers and Google-domain
   * throttling no longer catch.
   *
   * The GA tag loads its script from `/_rmetric/js` and sets `transport_url`
   * to `/_rmetric`, so GA sends measurement hits to `/_rmetric/g/collect`.
   * These rewrites forward those to the real Google endpoints server-side.
   */
  async rewrites() {
    return [
      {
        source: "/_rmetric/js",
        destination: "https://www.googletagmanager.com/gtag/js",
      },
      {
        source: "/_rmetric/g/:path*",
        destination: "https://www.google-analytics.com/g/:path*",
      },
    ];
  },
};

export default nextConfig;
