"use server";

import { db } from "@/lib/db";
import { articles, authors } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getCreditState, consumeCredits, type CreditState } from "@/lib/credits";
import { generateUserArticle } from "@/lib/ai/generate-user-article";
import { generateArticleCover } from "@/lib/ai/generate-image";
import { articleScore } from "@/lib/data/articles";
import type { ArticleBlock, CategorySlug } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

/** Serialisable credit info for the client (Infinity → -1). */
export interface CreditInfo {
  unlimited: boolean;
  used: number;
  limit: number;
  remaining: number;
}

function serializeCredits(s: CreditState | null): CreditInfo {
  if (!s) return { unlimited: false, used: 0, limit: 0, remaining: 0 };
  return {
    unlimited: s.unlimited,
    used: s.used,
    limit: s.limit,
    remaining: s.unlimited ? -1 : s.remaining,
  };
}

/** Resolve the author row bound to the signed-in user (creating none). */
async function currentAuthor() {
  const u = await getCurrentUser();
  if (!u) return null;
  const rows = await db.select().from(authors).where(eq(authors.userId, u.id)).limit(1);
  return { user: u, author: rows[0] ?? null };
}

/** Read the current user's credit state for rendering the editor. */
export async function fetchCredits(): Promise<CreditInfo> {
  const ctx = await currentAuthor();
  if (!ctx?.author) return { unlimited: false, used: 0, limit: 10, remaining: 10 };
  return serializeCredits(await getCreditState(ctx.author.id));
}

export interface GenerateResult {
  ok: boolean;
  error?: string;
  credits: CreditInfo;
  draft?: {
    title: string;
    excerpt: string;
    body: ArticleBlock[];
    tags: string[];
    category: CategorySlug;
    readingMinutes: number;
  };
}

/**
 * Generate a full article draft from the user's topic + context/materials.
 * Costs 1 credit (regular users). Does NOT publish — returns the draft for
 * review in the editor.
 */
export async function generateDraft(input: {
  topic: string;
  context: string;
  category: CategorySlug;
}): Promise<GenerateResult> {
  const ctx = await currentAuthor();
  if (!ctx?.author) {
    return { ok: false, error: "Профиль автора не найден.", credits: serializeCredits(null) };
  }

  const pre = await getCreditState(ctx.author.id);
  if (pre && !pre.unlimited && pre.remaining < 1) {
    return {
      ok: false,
      error: "Закончились кредиты ИИ на этот месяц.",
      credits: serializeCredits(pre),
    };
  }

  let gen;
  try {
    gen = await generateUserArticle({
      topic: input.topic,
      materials: input.context,
      category: input.category,
      authorName: ctx.author.name,
      elite: ctx.author.elite,
    });
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Не удалось сгенерировать статью.",
      credits: serializeCredits(pre),
    };
  }

  // Only charge once generation actually succeeded.
  const { state } = await consumeCredits(ctx.author.id, 1);

  return {
    ok: true,
    credits: serializeCredits(state),
    draft: {
      title: gen.title,
      excerpt: gen.excerpt,
      body: gen.body,
      tags: gen.tags,
      category: input.category,
      readingMinutes: gen.readingMinutes,
    },
  };
}

/**
 * Publish an article from the editor. Regular users publish as `standard`;
 * Elite authors keep their Elite tier. Auto-featured when the trend/effort
 * score is high (fully automatic homepage placement).
 */
export async function publishArticle(input: {
  title: string;
  excerpt: string;
  body: ArticleBlock[];
  tags: string[];
  category: CategorySlug;
  readingMinutes: number;
}): Promise<{ ok: boolean; error?: string; slug?: string }> {
  const ctx = await currentAuthor();
  if (!ctx?.author) return { ok: false, error: "Профиль автора не найден." };
  if (!input.title.trim()) return { ok: false, error: "Добавьте заголовок." };

  const now = new Date();
  const id = crypto.randomUUID();
  let slug = slugify(input.title).slice(0, 80) || id.slice(0, 8);
  // Ensure slug uniqueness.
  const existing = await db.select({ id: articles.id }).from(articles).where(eq(articles.slug, slug)).limit(1);
  if (existing[0]) slug = `${slug}-${id.slice(0, 6)}`;

  const tier = ctx.author.elite ? "elite" : "standard";

  const draft = {
    id,
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    body: input.body,
    cover: "",
    category: input.category,
    tags: input.tags,
    authorId: ctx.author.id,
    tier,
    status: "published" as const,
    readingMinutes: Math.max(1, input.readingMinutes),
    views: 0,
    claps: 0,
    comments: 0,
    publishedAt: now,
    seoScore: null,
    aeoScore: null,
    geoScore: null,
    faq: [],
    featured: false,
    aiGenerated: false,
    createdAt: now,
    updatedAt: now,
  };

  // Trend/effort auto-feature: score the fresh piece and promote strong ones.
  const featured =
    articleScore(
      {
        ...draft,
        publishedAt: now.toISOString(),
        seoScore: undefined,
        aeoScore: undefined,
        geoScore: undefined,
      } as never,
      now.getTime(),
    ) > 380;

  await db.insert(articles).values({ ...draft, featured });

  // Best-effort cover generation — never blocks publishing.
  try {
    const cover = await generateArticleCover({
      title: draft.title,
      category: draft.category,
      authorId: ctx.author.id,
      fast: true,
    });
    if (cover) {
      await db.update(articles).set({ cover }).where(eq(articles.id, id));
    }
  } catch {
    /* leave coverless; backfill job will fill it later */
  }

  // Keep the author's article count in sync.
  await db
    .update(authors)
    .set({ articlesCount: (ctx.author.articlesCount ?? 0) + 1 })
    .where(eq(authors.id, ctx.author.id));

  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath(`/articles/${slug}`);
  return { ok: true, slug };
}
