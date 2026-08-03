"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

/**
 * Google Analytics 4 (GA4) tag for rusability.ru — stream "Rusability - GA4".
 *
 * The measurement ID is read from NEXT_PUBLIC_GA_MEASUREMENT_ID and falls back
 * to the site's known GA4 ID so tracking works even before the env var is set.
 * We only inject the tag in production so local/preview traffic never pollutes
 * the analytics property.
 *
 * ★ Why this is more than the default snippet ★
 * rusability is a Next.js App Router SPA. The stock `gtag('config')` snippet
 * only fires a `page_view` on the INITIAL hard load — every subsequent in-app
 * <Link> navigation is a soft client-side route change that never reloads the
 * page, so GA never hears about it. On a content site that means a reader who
 * opens 6 articles counts as 1 pageview, badly underreporting traffic and
 * engagement. So we disable the automatic pageview (`send_page_view: false`)
 * and dispatch exactly one `page_view` per route change ourselves below.
 */
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-Q2617VM2JJ";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Sends a `page_view` on the initial load and on every client-side navigation.
 * Reads `useSearchParams`, so it must sit inside a <Suspense> boundary.
 */
function PageviewTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.origin + path,
      page_title: document.title,
      send_to: measurementId,
    });
  }, [pathname, searchParams, measurementId]);

  return null;
}

export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production" || !GA_MEASUREMENT_ID) return null;

  return (
    <>
      {/* First-party paths (rewritten to Google in next.config.ts) so ad
          blockers and RKN throttling of Google domains don't drop the tag. */}
      <Script
        src={`/_rmetric/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          // send_page_view:false — pageviews are dispatched per route change
          // by PageviewTracker so soft navigations are counted too.
          // transport_url routes collect hits through our own origin.
          gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: false,
            transport_url: window.location.origin + '/_rmetric',
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <PageviewTracker measurementId={GA_MEASUREMENT_ID} />
      </Suspense>
    </>
  );
}
