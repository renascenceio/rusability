"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

/**
 * Yandex Metrika counter for rusability.ru (counter id 15892276).
 *
 * Metrika is the primary analytics for a Russian audience: mc.yandex.ru is a
 * Russian domain, so it is NOT throttled by Roskomnadzor the way Google's
 * analytics domains are, and it captures far more of our real traffic than GA4.
 * The counter id and on/off state come from the admin-editable analytics
 * config (props), and the whole tag is only injected in production so
 * local/preview traffic never pollutes the counter.
 *
 * ★ SPA hit tracking ★
 * Like GA4, the default snippet only registers ONE hit on the initial hard
 * load. rusability is an App Router SPA, so every in-app <Link> navigation is a
 * soft route change that Metrika would otherwise miss. `ym('init', ...)` sends
 * the first hit automatically; the HitTracker below sends `ym('hit', url)` on
 * each SUBSEQUENT client-side navigation (skipping the first run so the initial
 * pageview is not double-counted).
 */
declare global {
  interface Window {
    ym?: (
      id: number,
      action: string,
      ...args: unknown[]
    ) => void;
  }
}

/** Sends a Metrika `hit` on every client-side navigation after the first. */
function HitTracker({ counterId }: { counterId: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstRun = useRef(true);

  useEffect(() => {
    // `init` already logged the initial pageview — don't count it twice.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (typeof window.ym !== "function") return;
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    window.ym(counterId, "hit", window.location.origin + path, {
      title: document.title,
      referer: document.referrer,
    });
  }, [pathname, searchParams, counterId]);

  return null;
}

export function YandexMetrika({
  enabled = true,
  counterId,
}: {
  enabled?: boolean;
  counterId: string;
}) {
  const METRIKA_ID = Number(counterId);
  if (process.env.NODE_ENV !== "production" || !enabled || !METRIKA_ID) {
    return null;
  }

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document,'script','https://mc.yandex.ru/metrika/tag.js', 'ym');

          ym(${METRIKA_ID}, 'init', {
            webvisor: true,
            clickmap: true,
            accurateTrackBounce: true,
            trackLinks: true
          });
        `}
      </Script>
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${METRIKA_ID}`}
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
      <Suspense fallback={null}>
        <HitTracker counterId={METRIKA_ID} />
      </Suspense>
    </>
  );
}
