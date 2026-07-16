import Script from "next/script";

/**
 * Google Analytics 4 (GA4) tag for rusability.ru — stream "Rusability - GA4".
 *
 * The measurement ID is read from NEXT_PUBLIC_GA_MEASUREMENT_ID and falls back
 * to the site's known GA4 ID so tracking works even before the env var is set.
 * We only inject the tag in production so local/preview traffic never pollutes
 * the analytics property.
 */
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-Q2617VM2JJ";

export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production" || !GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
