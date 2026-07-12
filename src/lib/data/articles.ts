import "server-only";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { and, desc, eq, ne } from "drizzle-orm";
import type { Article, ArticleBlock } from "@/lib/types";
import { authorsByIds } from "@/lib/data/authors";

type Row = typeof articles.$inferSelect;

function toISO(v: Date | string | null | undefined): string {
  if (!v) return "";
  return typeof v === "string" ? v : v.toISOString();
}

/** Embeds each article's author (single batched query — no N+1). */
async function withAuthors(list: Article[]): Promise<Article[]> {
  if (list.length === 0) return list;
  const byId = await authorsByIds([...new Set(list.map((a) => a.authorId))]);
  return list.map((a) => ({ ...a, author: byId.get(a.authorId) }));
}

export function mapArticle(r: Row): Article {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: (r.body as ArticleBlock[]) ?? [],
    cover: r.cover,
    category: r.category as Article["category"],
    tags: r.tags ?? [],
    authorId: r.authorId,
    tier: r.tier as Article["tier"],
    status: r.status as Article["status"],
    readingMinutes: r.readingMinutes,
    views: r.views,
    claps: r.claps,
    comments: r.comments,
    publishedAt: toISO(r.publishedAt),
    geoScore: r.geoScore ?? undefined,
    seoScore: r.seoScore ?? undefined,
    aeoScore: r.aeoScore ?? undefined,
    faq: (r.faq as Article["faq"]) ?? [],
    featured: r.featured,
  };
}

export async function allArticles(): Promise<Article[]> {
  const rows = await db.select().from(articles).orderBy(desc(articles.publishedAt));
  return withAuthors(rows.map(mapArticle));
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  const rows = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  if (!rows[0]) return undefined;
  return (await withAuthors([mapArticle(rows[0])]))[0];
}

export async function publishedArticles(): Promise<Article[]> {
  const rows = await db
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt));
  return withAuthors(rows.map(mapArticle));
}

export async function articlesByCategory(category: string): Promise<Article[]> {
  const rows = await db
    .select()
    .from(articles)
    .where(and(eq(articles.status, "published"), eq(articles.category, category)))
    .orderBy(desc(articles.publishedAt));
  return withAuthors(rows.map(mapArticle));
}

export async function articlesByAuthor(authorId: string): Promise<Article[]> {
  const rows = await db
    .select()
    .from(articles)
    .where(eq(articles.authorId, authorId))
    .orderBy(desc(articles.publishedAt));
  return withAuthors(rows.map(mapArticle));
}

/**
 * Composite "trend + effort" score. Combines reader engagement (views, claps,
 * comments), authoring effort (length + structure), AEO/SEO/GEO quality, an
 * Elite bonus and a recency boost. Used to auto-pick the homepage hero and to
 * decide which pieces get auto-featured — no manual curation required.
 */
export function articleScore(a: Article, now = Date.now()): number {
  const quality = (a.seoScore ?? 0) + (a.aeoScore ?? 0) + (a.geoScore ?? 0); // 0..294
  const engagement = a.views + a.claps * 5 + a.comments * 8;
  const effort = a.readingMinutes * 12 + (a.body?.length ?? 0) * 4;
  const eliteBonus = a.tier === "elite" ? 120 : 0;
  const ageDays = a.publishedAt ? (now - +new Date(a.publishedAt)) / 86_400_000 : 999;
  const recency = Math.max(0, 60 - ageDays) * 3;
  return quality + engagement * 0.1 + effort + eliteBonus + recency;
}

/** Top published articles by trend/effort score — always returns something. */
export async function heroArticles(limit = 5): Promise<Article[]> {
  const list = await publishedArticles();
  const now = Date.now();
  return [...list].sort((a, b) => articleScore(b, now) - articleScore(a, now)).slice(0, limit);
}

export async function featuredArticles(): Promise<Article[]> {
  const rows = await db
    .select()
    .from(articles)
    .where(and(eq(articles.status, "published"), eq(articles.featured, true)))
    .orderBy(desc(articles.publishedAt));
  return withAuthors(rows.map(mapArticle));
}

export async function relatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const rows = await db
    .select()
    .from(articles)
    .where(
      and(
        eq(articles.status, "published"),
        eq(articles.category, article.category),
        ne(articles.id, article.id),
      ),
    )
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
  return withAuthors(rows.map(mapArticle));
}
