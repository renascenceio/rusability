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
    .select()
    .from(news)
    .where(or(eq(news.pipeline, "published"), isNull(news.pipeline)))
    .orderBy(desc(news.publishedAt));
  return rows.map(mapNews);
}

export async function newsByCategory(category: string): Promise<NewsItem[]> {
  const rows = await db
    .select()
    .from(news)
    .where(
      and(
        or(eq(news.pipeline, "published"), isNull(news.pipeline)),
        eq(news.category, category),
      ),
    )
    .orderBy(desc(news.publishedAt));
  return rows.map(mapNews);
}

export async function latestNews(limit?: number): Promise<NewsItem[]> {
  const q = db
    .select()
    .from(news)
    .where(or(eq(news.pipeline, "published"), isNull(news.pipeline)))
    .orderBy(desc(news.publishedAt));
  const rows = limit ? await q.limit(limit) : await q;
  return rows.map(mapNews);
}

export async function popularNews(limit?: number): Promise<NewsItem[]> {
  const q = db
    .select()
    .from(news)
    .where(or(eq(news.pipeline, "published"), isNull(news.pipeline)))
    .orderBy(desc(news.views));
  const rows = limit ? await q.limit(limit) : await q;
  return rows.map(mapNews);
}
