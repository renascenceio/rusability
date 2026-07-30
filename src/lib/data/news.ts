import "server-only";
import { db } from "@/lib/db";
import { news } from "@/lib/db/schema";
import { and, desc, eq, or, isNull } from "drizzle-orm";
import type { NewsItem } from "@/lib/types";

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
    timeLabel: r.timeLabel,
    views: r.views,
    likes: r.likes ?? 0,
    pipeline: (r.pipeline as NewsItem["pipeline"]) ?? undefined,
    hot: r.hot,
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

export async function publishedNews(): Promise<NewsItem[]> {
  const rows = await db
    .select(cardCols)
    .from(news)
    .where(or(eq(news.pipeline, "published"), isNull(news.pipeline)))
    .orderBy(desc(news.publishedAt));
  return rows.map(mapNewsCard);
}

export async function newsByCategory(category: string): Promise<NewsItem[]> {
  const rows = await db
    .select(cardCols)
    .from(news)
    .where(
      and(
        or(eq(news.pipeline, "published"), isNull(news.pipeline)),
        eq(news.category, category),
      ),
    )
    .orderBy(desc(news.publishedAt));
  return rows.map(mapNewsCard);
}

export async function latestNews(limit?: number): Promise<NewsItem[]> {
  const q = db
    .select(cardCols)
    .from(news)
    .where(or(eq(news.pipeline, "published"), isNull(news.pipeline)))
    .orderBy(desc(news.publishedAt));
  const rows = limit ? await q.limit(limit) : await q;
  return rows.map(mapNewsCard);
}

export async function popularNews(limit?: number): Promise<NewsItem[]> {
  const q = db
    .select(cardCols)
    .from(news)
    .where(or(eq(news.pipeline, "published"), isNull(news.pipeline)))
    .orderBy(desc(news.views));
  const rows = limit ? await q.limit(limit) : await q;
  return rows.map(mapNewsCard);
}
