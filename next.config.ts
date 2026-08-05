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

/**
 * Legacy WordPress → landing-page redirects.
 *
 * The old rusability.ru (WordPress) exposed thousands of URLs that no longer
 * exist and now only generate Search-Console "not found" noise: /wp-content
 * media, /home?p=… pagination and search, /users & /members author profiles,
 * the old XML sitemaps, WP auth pages, dead section roots, PDF downloads and a
 * legacy REST endpoint. We permanently (308) redirect every one of those
 * families to the landing page so the link equity consolidates on `/` and the
 * stale URLs de-index.
 *
 * These live here (not in the DB-backed `redirects` table) because they are
 * PATTERN redirects (`:path*`) — the edge `matchRedirect` only does exact-path
 * lookups. next.config redirects also run BEFORE the middleware, whose matcher
 * deliberately skips any path ending in a file extension (so /wp-content/*.jpg,
 * *-sitemap.xml, *.pdf would otherwise never be handled at all).
 *
 * Deliberately NOT touched: our own /sitemap.xml and /robots.txt (different
 * names from the old /author-sitemap.xml & /post-sitemap*.xml), and the live
 * /tools and /tools/[slug] pages (only the old /tools/templatemonster/<id>
 * affiliate subtree is redirected, via `:path+` which requires a 3rd segment).
 */
// Whole legacy subtrees: `:path*` also matches the bare root (e.g. /wp-content).
const LEGACY_PREFIXES = [
  "/wp-content",
  "/wp-includes",
  "/wp-admin",
  "/wp-json",
  "/users",
  "/members",
  "/downloads",
  "/api/posts",
  "/internet-marketing",
];
// Exact legacy paths (query strings are ignored by the matcher, so /home also
// catches /home?p=123, /home?s=…, etc.).
const LEGACY_EXACT = [
  "/home",
  "/login",
  "/register",
  "/logout",
  "/lost-password",
  "/404",
  "/contactus",
  "/infographics",
  "/events",
  "/updates",
  "/reklama",
  "/contentmarketing",
  "/interne",
  "/ads.txt",
  "/apple-app-site-association",
  "/author-sitemap.xml",
  // old Cyrillic "услуги/сервисы" section, raw + percent-encoded forms
  "/сервисы",
  "/%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81%D1%8B",
];

const legacyRedirects = [
  ...LEGACY_PREFIXES.map((source) => ({
    source: `${source}/:path*`,
    destination: "/",
    permanent: true,
  })),
  ...LEGACY_EXACT.map((source) => ({
    source,
    destination: "/",
    permanent: true,
  })),
  // Old WP XML sitemaps: /post-sitemap.xml and /post-sitemap1.xml … 7.xml.
  { source: "/post-sitemap:n(\\d*).xml", destination: "/", permanent: true },
  // Old TemplateMonster affiliate widget: /tools/templatemonster/<mongo-id>.
  // `:path+` (one-or-more) keeps the real /tools/templatemonster slug free.
  { source: "/tools/templatemonster/:path+", destination: "/", permanent: true },
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

  async redirects() {
    return legacyRedirects;
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
