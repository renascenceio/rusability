"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { pageViews, recommendationEvents } from "@/lib/db/schema";
import { isBotUserAgent } from "@/lib/analytics/bot-detection";

export type TrackKind = "article" | "news" | "author" | "listing" | "other";
export type RecommendationSurface = "article_related" | "news_related";
export type RecommendationKind = "article" | "news";

export type RecommendationEventInput = {
  eventType: "impression" | "click";
  surface: RecommendationSurface;
  sourceKind: RecommendationKind;
  sourceContentId: number;
  targetKind: RecommendationKind;
  targetContentId: number;
  visitorId: string;
  sessionId: string;
};

export type TrackInput = {
  path: string;
  kind?: TrackKind;
  contentId?: string | null;
  category?: string | null;
  authorId?: string | null;
  visitorId: string;
  sessionId: string;
  referrer?: string | null;
  device?: "desktop" | "mobile" | "tablet";
};

const KNOWN_KINDS: TrackKind[] = ["article", "news", "author", "listing", "other"];

/** Buckets a referrer into a coarse acquisition source for reporting. */
function classifySource(referrer: string | null | undefined, ownHost: string): string {
  if (!referrer) return "direct";
  let host = "";
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "direct";
  }
  if (!host) return "direct";
  if (ownHost && host === ownHost.replace(/^www\./, "")) return "internal";
  const h = host.toLowerCase();
  if (/(google|yandex|bing|duckduckgo|search|baidu|ya\.ru)/.test(h)) return "search";
  if (/(t\.me|telegram|vk\.com|vk\.ru|facebook|fb\.com|instagram|twitter|x\.com|linkedin|youtube|ok\.ru|dzen|zen\.yandex|reddit|pinterest)/.test(h))
    return "social";
  return h;
}

/**
 * Records a deduplicated recommendation impression or click. Best-effort:
 * tracking can never interrupt navigation or break the reader experience.
 */
export async function trackRecommendationEvent(
  input: RecommendationEventInput,
): Promise<void> {
  try {
    if (
      !input?.visitorId ||
      !input?.sessionId ||
      !["impression", "click"].includes(input.eventType) ||
      !["article_related", "news_related"].includes(input.surface) ||
      !["article", "news"].includes(input.sourceKind) ||
      !["article", "news"].includes(input.targetKind) ||
      !Number.isInteger(input.sourceContentId) ||
      !Number.isInteger(input.targetContentId)
    ) return;

    const userAgent = (await headers()).get("user-agent");
    if (isBotUserAgent(userAgent)) return;

    await db
      .insert(recommendationEvents)
      .values({
        eventType: input.eventType,
        surface: input.surface,
        sourceKind: input.sourceKind,
        sourceContentId: input.sourceContentId,
        targetKind: input.targetKind,
        targetContentId: input.targetContentId,
        visitorId: input.visitorId.slice(0, 64),
        sessionId: input.sessionId.slice(0, 64),
      })
      .onConflictDoNothing();
  } catch (err) {
    console.error("Recommendation tracking failed:", (err as Error)?.message);
  }
}

export async function trackPageView(input: TrackInput): Promise<void> {
  try {
    if (!input?.visitorId || !input?.sessionId || !input?.path) return;

    // Drop bots/crawlers/scrapers/monitors so first-party analytics count real
    // humans only (Google Analytics filters these automatically; we now match it).
    const userAgent = (await headers()).get("user-agent");
    if (isBotUserAgent(userAgent)) return;

    const kind: TrackKind = KNOWN_KINDS.includes(input.kind as TrackKind)
      ? (input.kind as TrackKind)
      : "other";

    const ownHost = process.env.NEXT_PUBLIC_SITE_HOST || "rusability.ru";
    const source = classifySource(input.referrer, ownHost);

    await db.insert(pageViews).values({
      path: input.path.slice(0, 512),
      kind,
      contentId: input.contentId ?? null,
      category: input.category ?? null,
      authorId: input.authorId ?? null,
      visitorId: input.visitorId.slice(0, 64),
      sessionId: input.sessionId.slice(0, 64),
      source: source.slice(0, 128),
      referrer: input.referrer ? input.referrer.slice(0, 512) : null,
      device: input.device ?? "desktop",
      userAgent: userAgent ? userAgent.slice(0, 512) : null,
      // Only humans reach this insert (bots are dropped above), so every stored
      // row is a human hit. The column exists mainly for the historical backfill.
      isBot: false,
    });
  } catch (err) {
    console.log("[v0] trackPageView failed:", (err as Error)?.message);
  }
}
