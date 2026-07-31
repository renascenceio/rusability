"use server";

import { db } from "@/lib/db";
import { pageViews } from "@/lib/db/schema";

export type TrackKind = "article" | "news" | "author" | "listing" | "other";

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
 * Records a single public pageview. Best-effort and fully non-blocking for the
 * reader: any failure is swallowed so tracking can never break a page.
 */
export async function trackPageView(input: TrackInput): Promise<void> {
  try {
    if (!input?.visitorId || !input?.sessionId || !input?.path) return;

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
    });
  } catch (err) {
    console.log("[v0] trackPageView failed:", (err as Error)?.message);
  }
}
