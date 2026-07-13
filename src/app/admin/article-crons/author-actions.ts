"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, articleCrons, articleCronTopics } from "@/lib/db/schema";
import { requireRole, ADMIN_ROLES } from "@/lib/auth-helpers";

const guard = () => requireRole(ADMIN_ROLES);

export type AuthorArticle = {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
  publishedAt: string | null;
};

export type AuthorTopic = {
  id: number;
  topic: string;
  used: boolean;
};

/** Articles written by a given AI author (newest first). */
export async function listAuthorArticles(authorId: string): Promise<AuthorArticle[]> {
  await guard();
  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      status: articles.status,
      createdAt: articles.createdAt,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(eq(articles.authorId, authorId))
    .orderBy(desc(articles.createdAt));
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
  }));
}

/** Planned + used topics across all crons belonging to this author. */
export async function listAuthorTopics(authorId: string): Promise<AuthorTopic[]> {
  await guard();
  const crons = await db
    .select({ id: articleCrons.id })
    .from(articleCrons)
    .where(eq(articleCrons.authorId, authorId));
  if (crons.length === 0) return [];
  const cronIds = crons.map((c) => c.id);
  const rows = await db.select().from(articleCronTopics);
  return rows
    .filter((t) => cronIds.includes(t.cronId))
    .map((t) => ({ id: t.id, topic: t.topic, used: t.used }));
}

/** Change an article's publication status (publish / send to review / draft). */
export async function setArticleStatus(id: string, status: "published" | "review" | "draft") {
  await guard();
  // publishedAt is NOT NULL; only bump it when (re)publishing, otherwise leave as-is.
  await db
    .update(articles)
    .set(status === "published" ? { status, publishedAt: new Date() } : { status })
    .where(eq(articles.id, id));
  revalidatePath("/admin/article-crons");
  return { ok: true as const, status };
}

export async function deleteArticle(id: string) {
  await guard();
  await db.delete(articles).where(eq(articles.id, id));
  revalidatePath("/admin/article-crons");
  return { ok: true as const };
}

/** Add a planned topic to the author's primary cron. */
export async function addAuthorTopic(authorId: string, topic: string) {
  await guard();
  const trimmed = topic.trim();
  if (!trimmed) return { ok: false as const, error: "Пустая тема" };
  const cron = (
    await db
      .select({ id: articleCrons.id })
      .from(articleCrons)
      .where(eq(articleCrons.authorId, authorId))
      .limit(1)
  )[0];
  if (!cron) return { ok: false as const, error: "У автора нет крона для тем" };
  await db.insert(articleCronTopics).values({ cronId: cron.id, topic: trimmed });
  revalidatePath("/admin/article-crons");
  return { ok: true as const };
}

export async function removeAuthorTopic(id: number) {
  await guard();
  // Only allow removing topics that haven't been used yet.
  await db
    .delete(articleCronTopics)
    .where(and(eq(articleCronTopics.id, id), eq(articleCronTopics.used, false)));
  revalidatePath("/admin/article-crons");
  return { ok: true as const };
}
