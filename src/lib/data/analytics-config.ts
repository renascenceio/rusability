import "server-only";
import { unstable_cache } from "next/cache";
import { getSetting } from "@/lib/data/settings";

/**
 * Admin-editable analytics configuration.
 *
 * Both trackers are also gated to production inside their components, so these
 * flags decide whether an enabled tracker renders at all — the switch the admin
 * flips to turn a counter on/off or swap its id without a code change.
 */
export type AnalyticsProvider = {
  enabled: boolean;
  id: string;
};

export type AnalyticsConfig = {
  ga: AnalyticsProvider;
  metrika: AnalyticsProvider;
};

export const ANALYTICS_SETTINGS_KEY = "analytics";
/** Cache tag busted when the admin saves, so the live site picks up changes at once. */
export const ANALYTICS_CONFIG_TAG = "analytics-config";

/**
 * Defaults when nothing is stored yet.
 * GA4 ships DISABLED: it reads ~10x low for our RU audience (Google-domain
 * throttling/blocking) and the editor asked to switch it off for now. Yandex
 * Metrika is the primary counter and stays on.
 */
export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  ga: {
    enabled: false,
    id: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-Q2617VM2JJ",
  },
  metrika: {
    enabled: true,
    id: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || "15892276",
  },
};

/** Raw read (no cache) — used by the admin form so it always shows the latest saved values. */
export async function readAnalyticsConfig(): Promise<AnalyticsConfig> {
  const stored = await getSetting<AnalyticsConfig>(
    ANALYTICS_SETTINGS_KEY,
    DEFAULT_ANALYTICS_CONFIG,
  );
  // getSetting shallow-merges, so re-normalise the nested providers defensively.
  return {
    ga: { ...DEFAULT_ANALYTICS_CONFIG.ga, ...stored.ga },
    metrika: { ...DEFAULT_ANALYTICS_CONFIG.metrika, ...stored.metrika },
  };
}

/**
 * Cached read for the public site (called from the root layout on every page).
 * Tagged so `revalidateTag(ANALYTICS_CONFIG_TAG)` in the save action flushes it
 * instantly; otherwise refreshed at most every 5 minutes.
 */
export const getAnalyticsConfig = unstable_cache(
  readAnalyticsConfig,
  ["analytics-config"],
  { tags: [ANALYTICS_CONFIG_TAG], revalidate: 300 },
);
