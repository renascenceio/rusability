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
