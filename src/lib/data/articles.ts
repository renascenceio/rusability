import "server-only";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import type { Article, ArticleBlock } from "@/lib/types";
import { authorsByIds } from "@/lib/data/authors";

type Row = typeof articles.$inferSelect;

function toISO(v: Date | string | null | undefined): string {
  if (!v) return "";
  return typeof v === "string" ? v : v.toISOString();
}

/**
 * Column set for LIST/CARD views. Deliberately omits the heavy `body` and
 * `faq` JSONB — none of the list, browser, search or homepage components read
 * them (only the article detail reader does). Instead we return `bodyLen`
 * (block count) via `jsonb_array_length`, which is all `articleScore` needs.
 * This is the single biggest perceived-speed win: list rows shrink from many
 * KB of article body each to a few hundred bytes.
 */
const cardCols = {
  id: articles.id,
  slug: articles.slug,
  title: articles.title,
  excerpt: articles.excerpt,
  cover: articles.cover,
  category: articles.category,
  tags: articles.tags,
  authorId: articles.authorId,
  tier: articles.tier,
  status: articles.status,
  readingMinutes: articles.readingMinutes,
  views: articles.views,
  claps: articles.claps,
  comments: articles.comments,
  publishedAt: articles.publishedAt,
  geoScore: articles.geoScore,
  seoScore: articles.seoScore,
  aeoScore: articles.aeoScore,
  featured: articles.featured,
  bodyLen: sql<number>`coalesce(jsonb_array_length(${articles.body}), 0)`.as("body_len"),
} as const;

type CardRow = {
  [K in keyof typeof cardCols]: K extends "bodyLen" ? number : Row[K & keyof Row];
};

/** Maps a lightweight card row to an Article with an empty `body`. */
function mapCard(r: CardRow): Article {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: [],
    bodyLen: r.bodyLen,
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
    faq: [],
    featured: r.featured,
  };
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
    updatedAt: r.updatedAt ? toISO(r.updatedAt) : undefined,
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

/**
 * Published articles for LIST/CARD surfaces (homepage, /articles, /search,
 * sitemap). Uses the lightweight `cardCols` projection — no article bodies are
 * transferred, so this is fast even with a large catalogue.
 */
export async function publishedArticles(): Promise<Article[]> {
  const rows = await db
    .select(cardCols)
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt));
  return withAuthors(rows.map(mapCard));
}

export async function articlesByCategory(category: string): Promise<Article[]> {
  const rows = await db
    .select(cardCols)
    .from(articles)
    .where(and(eq(articles.status, "published"), eq(articles.category, category)))
    .orderBy(desc(articles.publishedAt));
  return withAuthors(rows.map(mapCard));
}

export async function articlesByAuthor(authorId: string): Promise<Article[]> {
  const rows = await db
    .select(cardCols)
    .from(articles)
    .where(eq(articles.authorId, authorId))
    .orderBy(desc(articles.publishedAt));
  return withAuthors(rows.map(mapCard));
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
  // Reward substantive work without letting an unusually long article pin the
  // homepage forever. Reading time and structure both have sensible ceilings.
  const blocks = a.bodyLen ?? a.body?.length ?? 0;
  const effort = Math.min(a.readingMinutes, 20) * 8 + Math.min(blocks, 60) * 2;
  const eliteBonus = a.tier === "elite" ? 120 : 0;
  const ageDays = a.publishedAt ? Math.max(0, (now - +new Date(a.publishedAt)) / 86_400_000) : 999;
  // Freshness matters strongly for the lead story, but naturally expires after
  // two weeks so evergreen quality and real engagement can still compete.
  const recency = Math.max(0, 14 - ageDays) * 30;
  return quality + engagement * 0.1 + effort + eliteBonus + recency;
}

/**
 * Top published articles by editorial score. The first position rotates among
 * the four strongest candidates every six hours, while the remaining order
 * stays score-driven. This keeps the homepage current without random results or
 * manual curation, and every visitor in the same time window sees the same hero.
 */
/** Pure hero ranking over an already-fetched list — lets the homepage rank the
 *  hero from the SAME `publishedArticles()` result instead of fetching twice. */
export function rankHero(list: Article[], limit = 5): Article[] {
  const now = Date.now();
  const ranked = [...list].sort((a, b) => articleScore(b, now) - articleScore(a, now));
  const rotationSize = Math.min(4, ranked.length);
  if (rotationSize > 1) {
    const slot = Math.floor(now / (6 * 60 * 60 * 1000)) % rotationSize;
    const [hero] = ranked.splice(slot, 1);
    ranked.unshift(hero);
  }
  return ranked.slice(0, limit);
}

export async function heroArticles(limit = 5): Promise<Article[]> {
  return rankHero(await publishedArticles(), limit);
}

export async function featuredArticles(): Promise<Article[]> {
  const rows = await db
    .select(cardCols)
    .from(articles)
    .where(and(eq(articles.status, "published"), eq(articles.featured, true)))
    .orderBy(desc(articles.publishedAt));
  return withAuthors(rows.map(mapCard));
}

export async function relatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const rows = await db
    .select(cardCols)
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
  return withAuthors(rows.map(mapCard));
}
