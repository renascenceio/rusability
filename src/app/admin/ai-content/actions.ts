"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  aiAuthors,
  aiRequirements,
  articleCrons,
  articleCronTopics,
  contentSettings,
  articles,
  news,
  newsbotSources,
} from "@/lib/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { requireRole, ADMIN_ROLES } from "@/lib/auth-helpers";
import { runCron, runDueCrons } from "@/lib/ai/cron-engine";
import { runNewsbot, writeQueuedNews } from "@/lib/ai/news-engine";
import { matchesBlockedTerm } from "@/lib/ai/content-filter";
import { addBlockedTerm, removeBlockedTerm } from "@/lib/data/news-blocklist";
import { addGoodExample, addBadExample } from "@/lib/data/news-examples";
import { putSetting } from "@/lib/data/settings";
import { mergeHumanizer, type HumanizerConfig } from "@/lib/ai/humanizer-config";

const rid = () => Math.random().toString(36).slice(2, 10);
const guard = () => requireRole(ADMIN_ROLES);

/* ---------------- AI Requirements ---------------- */

export async function saveRequirement(key: string, title: string, content: string) {
  await guard();
  await db
    .insert(aiRequirements)
    .values({ key, title, content, updatedAt: new Date() })
    .onConflictDoUpdate({ target: aiRequirements.key, set: { title, content, updatedAt: new Date() } });
  revalidatePath("/admin/ai-requirements");
  return { ok: true };
}

/* ---------------- Humanizer (humanizer-ru) ---------------- */

export async function saveHumanizerConfig(config: HumanizerConfig) {
  await guard();
  const clean = mergeHumanizer(config);
  await putSetting("humanizer", clean);
  revalidatePath("/admin/humanizer");
  return { ok: true };
}

/* ---------------- Pace / settings ---------------- */

export async function saveContentSettings(input: {
  minHoursBetween: number;
  maxPerDay: number;
  autoPublish: boolean;
  newsAutoPublish: boolean;
}) {
  await guard();
  await db
    .insert(contentSettings)
    .values({ id: 1, ...input, updatedAt: new Date() })
    .onConflictDoUpdate({ target: contentSettings.id, set: { ...input, updatedAt: new Date() } });
  revalidatePath("/admin/article-crons");
  return { ok: true };
}

/* ---------------- AI authors ---------------- */

export async function toggleAuthorActive(id: string, active: boolean) {
  await guard();
  await db.update(aiAuthors).set({ active }).where(eq(aiAuthors.id, id));
  revalidatePath("/admin/ai-authors");
  return { ok: true };
}

export async function updateAiAuthor(
  id: string,
  patch: Partial<{ tone: string; approach: string; stylePrompt: string; topics: string[]; schedule: string }>,
) {
  await guard();
  await db.update(aiAuthors).set(patch).where(eq(aiAuthors.id, id));
  revalidatePath("/admin/ai-authors");
  return { ok: true };
}

/* ---------------- Article crons ---------------- */

export async function createCron(input: {
  name: string;
  authorId: string | null;
  category: string;
  frequency: string;
  runTime: string;
  minWords: number;
  requiresApproval: boolean;
  keywords: string[];
}) {
  await guard();
  const id = rid();
  await db.insert(articleCrons).values({
    id,
    name: input.name,
    authorId: input.authorId,
    category: input.category,
    frequency: input.frequency,
    runTime: input.runTime,
    minWords: input.minWords,
    requiresApproval: input.requiresApproval,
    keywords: input.keywords,
  });
  revalidatePath("/admin/article-crons");
  return { ok: true, id };
}

export async function updateCron(id: string, patch: Record<string, unknown>) {
  await guard();
  await db.update(articleCrons).set(patch).where(eq(articleCrons.id, id));
  revalidatePath("/admin/article-crons");
  return { ok: true };
}

export async function toggleCronStatus(id: string) {
  await guard();
  const [row] = await db.select({ status: articleCrons.status }).from(articleCrons).where(eq(articleCrons.id, id));
  const next = row?.status === "active" ? "paused" : "active";
  await db.update(articleCrons).set({ status: next }).where(eq(articleCrons.id, id));
  revalidatePath("/admin/article-crons");
  return { ok: true, status: next };
}

export async function deleteCron(id: string) {
  await guard();
  await db.delete(articleCronTopics).where(eq(articleCronTopics.cronId, id));
  await db.delete(articleCrons).where(eq(articleCrons.id, id));
  revalidatePath("/admin/article-crons");
  return { ok: true };
}

export async function addCronTopics(cronId: string, topics: string[]) {
  await guard();
  for (const t of topics.map((x) => x.trim()).filter(Boolean)) {
    await db.insert(articleCronTopics).values({ cronId, topic: t, keywords: [] });
  }
  revalidatePath("/admin/article-crons");
  return { ok: true };
}

export async function runCronNow(id: string) {
  await guard();
  return runCron(id);
}

/* ---------------- Buffer moderation (articles: status='review') ---------------- */

export async function publishBuffered(id: string) {
  await guard();
  await db
    .update(articles)
    .set({ status: "published", bufferReason: null, publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(articles.id, id));
  revalidatePath("/admin/article-crons");
  revalidatePath("/admin/articles");
  return { ok: true };
}

export async function discardBuffered(id: string) {
  await guard();
  await db.delete(articles).where(and(eq(articles.id, id), eq(articles.status, "review")));
  revalidatePath("/admin/article-crons");
  return { ok: true };
}

/* ---------------- News aggregator (news: pipeline='review'|'published') ---------------- */

export async function runNewsNow() {
  await guard();
  const r = await runNewsbot();
  revalidatePath("/admin/news");
  return r;
}

/** Drain the writing queue now (bounded concurrency, publishes instantly). */
export async function runNewsWriteNow() {
  await guard();
  const r = await writeQueuedNews();
  revalidatePath("/admin/news");
  return { ...r, message: r.message, created: r.written };
}

export async function toggleNewsSource(id: string, active: boolean) {
  await guard();
  await db.update(newsbotSources).set({ active }).where(eq(newsbotSources.id, id));
  revalidatePath("/admin/newsbot");
  return { ok: true };
}

export async function addNewsSource(name: string, url: string, category: string) {
  await guard();
  await db.insert(newsbotSources).values({ id: rid(), name, url, category, lang: "ru", active: true });
  revalidatePath("/admin/newsbot");
  return { ok: true };
}

export async function deleteNewsSource(id: string) {
  await guard();
  await db.delete(newsbotSources).where(eq(newsbotSources.id, id));
  revalidatePath("/admin/newsbot");
  return { ok: true };
}

export async function publishNews(id: string) {
  await guard();
  await db
    .update(news)
    .set({ pipeline: "published", publishedAt: new Date() })
    .where(eq(news.id, id));
  revalidatePath("/admin/newsbot");
  revalidatePath("/admin/news");
  return { ok: true };
}

export async function discardNews(id: string) {
  await guard();
  await db.delete(news).where(and(eq(news.id, id), eq(news.pipeline, "review")));
  revalidatePath("/admin/newsbot");
  return { ok: true };
}

/** Remove a single gathered item, whatever pipeline stage it's in. */
export async function removeNewsItem(id: string) {
  await guard();
  await db.delete(news).where(eq(news.id, id));
  revalidatePath("/admin/news");
  return { ok: true };
}

/**
 * "Неверная тема": teach the collector to stop gathering this kind of news.
 * Adds `term` to the admin stop-list, removes the flagged item, and purges any
 * still-queued items matching the term so they never get written.
 */
export async function blockNewsTopic(id: string, term: string) {
  await guard();
  const t = term.trim();
  if (t) await addBlockedTerm(t);

  // Learn from the rejection: record the item's title as a negative example so
  // the classifier drops similar material next time (works even with no term).
  const [item] = await db
    .select({ title: news.title, originalTitle: news.originalTitle })
    .from(news)
    .where(eq(news.id, id))
    .limit(1);
  if (item) await addBadExample(item.originalTitle || item.title);

  // Drop the flagged item regardless of its current pipeline stage.
  await db.delete(news).where(eq(news.id, id));

  // Purge other still-queued items matching the new term (haven't cost AI yet).
  let purged = 0;
  if (t) {
    const queued = await db
      .select({ id: news.id, title: news.title, excerpt: news.excerpt, originalTitle: news.originalTitle })
      .from(news)
      .where(eq(news.pipeline, "queued"));
    const hitIds = queued
      .filter((r) => matchesBlockedTerm(`${r.originalTitle ?? r.title} ${r.excerpt ?? ""}`, [t]))
      .map((r) => r.id);
    if (hitIds.length) {
      await db.delete(news).where(inArray(news.id, hitIds));
      purged = hitIds.length;
    }
  }
  revalidatePath("/admin/news");
  return { ok: true, purged, term: t, message: `Тема «${t}» заблокирована${purged ? `, удалено из очереди: ${purged}` : ""}` };
}

/** Remove a term from the "wrong topic" stop-list. */
export async function unblockNewsTopic(term: string) {
  await guard();
  const terms = await removeBlockedTerm(term);
  revalidatePath("/admin/news");
  return { ok: true, terms, message: `Тема «${term.trim()}» разблокирована` };
}

/**
 * Release a «Спорные» (borderline) item as news. Publishes it and records its
 * title as a POSITIVE example so the classifier treats similar material as news.
 */
export async function releaseDisputedNews(id: string) {
  await guard();
  const [item] = await db
    .select({ title: news.title, originalTitle: news.originalTitle })
    .from(news)
    .where(eq(news.id, id))
    .limit(1);
  if (item) await addGoodExample(item.originalTitle || item.title);
  await db
    .update(news)
    .set({ pipeline: "published", publishedAt: new Date() })
    .where(eq(news.id, id));
  revalidatePath("/admin/news");
  return { ok: true };
}

/**
 * Reject a «Спорные» item. Records its title as a NEGATIVE example (so the
 * classifier learns it wasn't news we want) and removes it.
 */
export async function rejectDisputedNews(id: string) {
  await guard();
  const [item] = await db
    .select({ title: news.title, originalTitle: news.originalTitle })
    .from(news)
    .where(eq(news.id, id))
    .limit(1);
  if (item) await addBadExample(item.originalTitle || item.title);
  await db.update(news).set({ pipeline: "rejected" }).where(eq(news.id, id));
  revalidatePath("/admin/news");
  return { ok: true };
}

/** Add a term to the stop-list directly (manual entry). */
export async function addNewsBlockedTerm(term: string) {
  await guard();
  const terms = await addBlockedTerm(term);
  revalidatePath("/admin/news");
  return { ok: true, terms };
}

/* ---------------- Manual "run all due" ---------------- */

export async function runAllDueCrons() {
  await guard();
  return runDueCrons();
}
