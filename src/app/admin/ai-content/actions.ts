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
import { and, eq, sql } from "drizzle-orm";
import { requireRole, ADMIN_ROLES } from "@/lib/auth-helpers";
import { runCron, runDueCrons } from "@/lib/ai/cron-engine";
import { runNewsbot } from "@/lib/ai/news-engine";

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
  return runNewsbot();
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

/* ---------------- Manual "run all due" ---------------- */

export async function runAllDueCrons() {
  await guard();
  return runDueCrons();
}
