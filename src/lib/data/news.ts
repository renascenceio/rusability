import "server-only";
import { db } from "@/lib/db";
import { news } from "@/lib/db/schema";
import { desc, eq, or, isNull } from "drizzle-orm";
import type { NewsItem } from "@/lib/types";
import { memoTTL, LIST_TTL_MS } from "@/lib/data/ttl-cache";

type Row = typeof news.$inferSelect;

function toISO(v: Date | string | null | undefined): string {
  if (!v) return "";
  return typeof v === "string" ? v : v.toISOString();
}

export function mapNews(r: Row): NewsItem {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body ?? [],
    category: r.category as NewsItem["category"],
    source: r.source,
    sourceUrl: r.sourceUrl ?? undefined,
    tags: r.tags ?? [],
    publishedAt: toISO(r.publishedAt),
    // News has no updated_at column (aggregated notes aren't edited post-publish);
    // structured data falls back to publishedAt for dateModified.
    timeLabel: r.timeLabel,
    views: r.views,
    likes: r.likes ?? 0,
    pipeline: (r.pipeline as NewsItem["pipeline"]) ?? undefined,
    hot: r.hot,
    keyPoints: (r.keyPoints as string[]) ?? [],
    faq: (r.faq as NewsItem["faq"]) ?? [],
    metaTitle: r.metaTitle ?? undefined,
    metaDescription: r.metaDescription ?? undefined,
    geoScore: r.geoScore ?? undefined,
    seoScore: r.seoScore ?? undefined,
    aeoScore: r.aeoScore ?? undefined,
  };
}

/**
 * Column set for LIST/CARD views (Лента, homepage, search). Omits the `body`
 * text[] and aggregator-provenance columns that card components never read, so
 * list queries transfer only what's rendered.
 */
const cardCols = {
  id: news.id,
  slug: news.slug,
  title: news.title,
  excerpt: news.excerpt,
  category: news.category,
  source: news.source,
  sourceUrl: news.sourceUrl,
  tags: news.tags,
  publishedAt: news.publishedAt,
  timeLabel: news.timeLabel,
  views: news.views,
  likes: news.likes,
  pipeline: news.pipeline,
  hot: news.hot,
} as const;

type NewsCardRow = { [K in keyof typeof cardCols]: Row[K & keyof Row] };

function mapNewsCard(r: NewsCardRow): NewsItem {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: [],
    category: r.category as NewsItem["category"],
    source: r.source,
    sourceUrl: r.sourceUrl ?? undefined,
    tags: r.tags ?? [],
    publishedAt: toISO(r.publishedAt),
    timeLabel: r.timeLabel,
    views: r.views,
    likes: r.likes ?? 0,
    pipeline: (r.pipeline as NewsItem["pipeline"]) ?? undefined,
    hot: r.hot,
  };
}

export async function allNews(): Promise<NewsItem[]> {
  const rows = await db.select().from(news).orderBy(desc(news.publishedAt));
  return rows.map(mapNews);
}

export async function getNews(slug: string): Promise<NewsItem | undefined> {
  const rows = await db.select().from(news).where(eq(news.slug, slug)).limit(1);
  return rows[0] ? mapNews(rows[0]) : undefined;
}

/**
 * Published news for LIST/CARD surfaces (Лента, homepage, search, sitemap),
 * newest first. Memoized in-process for a few minutes.
 *
 * Uncached this was the #2 compute line (~1,900s) and a large egress source:
 * the full published set is ~7,300 rows / ~8 MB serialized — well over the
 * ~2 MB `unstable_cache` ceiling, so it uses the RAM memo. Every derived list
 * below reuses this one result instead of issuing its own full scan+sort.
 */
export async function publishedNews(): Promise<NewsItem[]> {
  return memoTTL("news:published", LIST_TTL_MS, async () => {
    const rows = await db
      .select(cardCols)
      .from(news)
      .where(or(eq(news.pipeline, "published"), isNull(news.pipeline)))
      .orderBy(desc(news.publishedAt));
    return rows.map(mapNewsCard);
  });
}

/** Published news in a category. Derived from the cached list. */
export async function newsByCategory(category: string): Promise<NewsItem[]> {
  return (await publishedNews()).filter((n) => n.category === category);
}

/** Newest published news (optionally capped). The cached list is already
 *  `publishedAt desc`, so this just slices it — no extra DB read. */
export async function latestNews(limit?: number): Promise<NewsItem[]> {
  const all = await publishedNews();
  return limit ? all.slice(0, limit) : all;
}

/** Most-viewed published news (optionally capped). Derived from the cached
 *  list by re-sorting on views — identical result to the old `order by views`. */
export async function popularNews(limit?: number): Promise<NewsItem[]> {
  const ranked = [...(await publishedNews())].sort((a, b) => b.views - a.views);
  return limit ? ranked.slice(0, limit) : ranked;
}
