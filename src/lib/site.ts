/**
 * Canonical public URL of the site.
 *
 * All SEO surfaces (metadataBase / canonical tags, sitemap, robots) must point
 * here — never at the *.vercel.app deployment alias — so search engines index
 * and rank the real domain instead of the Vercel preview host.
 *
 * Override with NEXT_PUBLIC_SITE_URL if the canonical domain ever changes.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://rusability.ru"
).replace(/\/$/, "");
