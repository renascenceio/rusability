import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CookieConsent } from "@/components/site/CookieConsent";
import { AnalyticsBeacon } from "@/components/site/AnalyticsBeacon";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--background)]">
      {/* Site-wide pageview tracking. Content detail routes render their own
          richer beacon, so this one skips them to avoid double counting. */}
      <AnalyticsBeacon skipContentRoutes />
      {/* ГОСТ Р 52872: keyboard skip link to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-[var(--primary-foreground)]"
      >
        Перейти к основному содержимому
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <CookieConsent />
    </div>
  );
}
