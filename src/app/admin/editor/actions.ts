"use server";

import { db } from "@/lib/db";
import { articles, authors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireRole, ADMIN_ROLES } from "@/lib/auth-helpers";
import { slugify } from "@/lib/utils";
import { articleScore } from "@/lib/data/articles";
import { generateArticleCover } from "@/lib/ai/generate-image";
import { generateUserArticle } from "@/lib/ai/generate-user-article";
import { generateArticleMeta, fallbackExcerpt } from "@/lib/ai/generate-meta";
import { revalidatePath } from "next/cache";
import type { ArticleBlock, CategorySlug } from "@/lib/types";

/** Draft generation for the admin editor (no per-user credit gate). */
export async function adminGenerateDraft(input: {
  topic: string;
  context: string;
  category: CategorySlug;
  authorName?: string;
}): Promise<{
  ok: boolean;
  error?: string;
  draft?: {
    title: string;
    subtitle: string;
    excerpt: string;
    body: ArticleBlock[];
    tags: string[];
    readingMinutes: number;
    seoScore: number;
    aeoScore: number;
    geoScore: number;
  };
}> {
  await requireRole(ADMIN_ROLES, "/admin/editor");
  if (!input.topic.trim()) return { ok: false, error: "Укажите тему статьи." };
  try {
    const gen = await generateUserArticle({
      topic: input.topic,
      materials: input.context,
      category: input.category,
      authorName: input.authorName || "Редакция Rusability",
      elite: true,
    });
    return {
      ok: true,
      draft: {
        title: gen.title,
        subtitle: gen.subtitle,
        excerpt: gen.excerpt,
        body: gen.body,
        tags: gen.tags,
        readingMinutes: gen.readingMinutes,
        seoScore: gen.seoScore,
        aeoScore: gen.aeoScore,
        geoScore: gen.geoScore,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось сгенерировать." };
  }
}

/** Publish (or draft) an article from the admin editor, attributed to any author. */
export async function adminPublishArticle(input: {
  authorId: string;
  title: string;
  excerpt: string;
  body: ArticleBlock[];
  tags: string[];
  category: CategorySlug;
  readingMinutes: number;
  status?: "published" | "draft";
  seoScore?: number | null;
  aeoScore?: number | null;
  geoScore?: number | null;
}): Promise<{ ok: boolean; error?: string; slug?: string }> {
  await requireRole(ADMIN_ROLES, "/admin/editor");
  if (!input.title.trim()) return { ok: false, error: "Добавьте заголовок." };

  const authorRow = (
    await db.select().from(authors).where(eq(authors.id, input.authorId)).limit(1)
  )[0];
  if (!authorRow) return { ok: false, error: "Выберите автора." };

  const now = new Date();

  // Meta is ALWAYS AI-assigned when missing.
  let excerpt = input.excerpt.trim();
  let seoScore = input.seoScore ?? null;
  let aeoScore = input.aeoScore ?? null;
  let geoScore = input.geoScore ?? null;
  if (!excerpt || seoScore == null || aeoScore == null || geoScore == null) {
    try {
      const meta = await generateArticleMeta({
        title: input.title.trim(),
        body: input.body,
        category: input.category,
      });
      if (!excerpt) excerpt = meta.excerpt;
      if (seoScore == null) seoScore = meta.seoScore;
      if (aeoScore == null) aeoScore = meta.aeoScore;
      if (geoScore == null) geoScore = meta.geoScore;
    } catch {
      if (!excerpt) excerpt = fallbackExcerpt(input.body);
    }
  }

  const id = crypto.randomUUID();
  let slug = slugify(input.title).slice(0, 80) || id.slice(0, 8);
  const existing = await db.select({ id: articles.id }).from(articles).where(eq(articles.slug, slug)).limit(1);
  if (existing[0]) slug = `${slug}-${id.slice(0, 6)}`;

  const status = input.status ?? "published";
  const draft = {
    id,
    slug,
    title: input.title.trim(),
    excerpt,
    body: input.body,
    cover: "",
    category: input.category,
    tags: input.tags,
    authorId: authorRow.id,
    tier: authorRow.elite ? ("elite" as const) : ("standard" as const),
    status,
    readingMinutes: Math.max(1, input.readingMinutes),
    views: 0,
    claps: 0,
    comments: 0,
    publishedAt: now,
    seoScore,
    aeoScore,
    geoScore,
    faq: [],
    featured: false,
    aiGenerated: false,
    createdAt: now,
    updatedAt: now,
  };

  const featured =
    status === "published" &&
    articleScore(
      { ...draft, publishedAt: now.toISOString(), seoScore: undefined, aeoScore: undefined, geoScore: undefined } as never,
      now.getTime(),
    ) > 380;

  await db.insert(articles).values({ ...draft, featured });

  // Best-effort cover generation — never blocks publishing.
  try {
    const cover = await generateArticleCover({
      title: draft.title,
      category: draft.category,
      authorId: authorRow.id,
      fast: true,
    });
    if (cover) await db.update(articles).set({ cover }).where(eq(articles.id, id));
  } catch {
    /* ignore cover failures */
  }

  revalidatePath("/admin/articles");
  revalidatePath("/");
  return { ok: true, slug };
}
