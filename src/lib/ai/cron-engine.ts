import "server-only";
import { db } from "@/lib/db";
import {
  aiAuthors,
  articles,
  articleCrons,
  articleCronTopics,
  articleCronRuns,
  contentSettings,
  authors as authorsTable,
} from "@/lib/db/schema";
import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { generateArticle } from "./generate-article";
import { generateTopic } from "./generate-topic";
import { slugify } from "@/lib/utils";
import type { CategorySlug } from "@/lib/types";

const MSK_OFFSET_MS = 3 * 60 * 60 * 1000; // Europe/Moscow = UTC+3, no DST

/** Current wall clock in Moscow, read via getUTC* on a shifted Date. */
function mskNow(now = new Date()): Date {
  return new Date(now.getTime() + MSK_OFFSET_MS);
}
function mskDayKey(d: Date): string {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}
const WEEKDAY_TOKENS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/* ------------------------------------------------------------------ */
/* Global pace config                                                  */
/* ------------------------------------------------------------------ */

async function getSettings() {
  const rows = await db.select().from(contentSettings).where(eq(contentSettings.id, 1)).limit(1);
  return (
    rows[0] ?? {
      id: 1,
      minHoursBetween: 6,
      maxPerDay: 8,
      autoPublish: false,
      newsAutoPublish: false,
      updatedAt: new Date(),
    }
  );
}

/** How many more articles may be *published* right now under the pace rules. */
async function paceAllowsPublish(): Promise<boolean> {
  const s = await getSettings();

  // Max per calendar day (Moscow).
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [{ n: publishedToday }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(articles)
    .where(and(eq(articles.status, "published"), gte(articles.publishedAt, since)));
  if (publishedToday >= s.maxPerDay) return false;

  // Min hours between publishes.
  const last = await db
    .select({ publishedAt: articles.publishedAt })
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(1);
  if (last[0]?.publishedAt) {
    const elapsedH = (Date.now() - new Date(last[0].publishedAt).getTime()) / 36e5;
    if (elapsedH < s.minHoursBetween) return false;
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Scheduling                                                          */
/* ------------------------------------------------------------------ */

function cronIsDue(cron: typeof articleCrons.$inferSelect, now = new Date()): boolean {
  if (cron.status !== "active") return false;
  const msk = mskNow(now);

  // Already ran today? (at-most-once-per-day for daily/weekly)
  if (cron.lastRunAt) {
    const lastMsk = mskNow(new Date(cron.lastRunAt));
    if (cron.frequency !== "hourly" && mskDayKey(lastMsk) === mskDayKey(msk)) return false;
    if (cron.frequency === "hourly") {
      const elapsedMin = (now.getTime() - new Date(cron.lastRunAt).getTime()) / 6e4;
      if (elapsedMin < 55) return false;
      return true;
    }
  }

  // Weekly: only on configured weekday tokens.
  if (cron.frequency === "weekly" && cron.days.length > 0) {
    if (!cron.days.includes(WEEKDAY_TOKENS[msk.getUTCDay()])) return false;
  }

  // Daily/weekly: only at/after the configured HH:MM Moscow time.
  const [hh, mm] = (cron.runTime || "09:00").split(":").map((x) => parseInt(x, 10));
  const nowMinutes = msk.getUTCHours() * 60 + msk.getUTCMinutes();
  const targetMinutes = (hh || 0) * 60 + (mm || 0);
  return nowMinutes >= targetMinutes;
}

/* ------------------------------------------------------------------ */
/* Author + topic selection                                            */
/* ------------------------------------------------------------------ */

async function pickAuthor(cron: typeof articleCrons.$inferSelect) {
  if (cron.authorId) {
    const rows = await db.select().from(aiAuthors).where(eq(aiAuthors.id, cron.authorId)).limit(1);
    if (rows[0]) return rows[0];
  }
  // Rotate: least-recently-run active author in this category (fallback: any active).
  const inCat = await db
    .select()
    .from(aiAuthors)
    .where(and(eq(aiAuthors.active, true), eq(aiAuthors.category, cron.category)))
    .orderBy(asc(sql`coalesce(${aiAuthors.lastRun}, '1970-01-01')`))
    .limit(1);
  if (inCat[0]) return inCat[0];
  const any = await db
    .select()
    .from(aiAuthors)
    .where(eq(aiAuthors.active, true))
    .orderBy(asc(sql`coalesce(${aiAuthors.lastRun}, '1970-01-01')`))
    .limit(1);
  return any[0] ?? null;
}

async function pickTopic(
  cron: typeof articleCrons.$inferSelect,
  author: typeof aiAuthors.$inferSelect,
): Promise<{ topic: string; keywords: string[]; topicRowId?: number }> {
  const unused = await db
    .select()
    .from(articleCronTopics)
    .where(and(eq(articleCronTopics.cronId, cron.id), eq(articleCronTopics.used, false)))
    .orderBy(asc(articleCronTopics.id))
    .limit(1);
  if (unused[0]) {
    return { topic: unused[0].topic, keywords: unused[0].keywords, topicRowId: unused[0].id };
  }
  // No queued topics — let the model propose one from the author's beats.
  const gen = await generateTopic({
    author,
    category: cron.category,
    keywords: cron.keywords,
  });
  return { topic: gen.topic, keywords: gen.keywords };
}

/* ------------------------------------------------------------------ */
/* Core run                                                            */
/* ------------------------------------------------------------------ */

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  for (let i = 0; i < 6; i++) {
    const hit = await db.select({ id: articles.id }).from(articles).where(eq(articles.slug, slug)).limit(1);
    if (hit.length === 0) return slug;
    slug = `${base}-${nanoid(4).toLowerCase()}`;
  }
  return `${base}-${nanoid(6).toLowerCase()}`;
}

export async function runCron(cronId: string): Promise<{ created: number; message: string }> {
  const cronRows = await db.select().from(articleCrons).where(eq(articleCrons.id, cronId)).limit(1);
  const cron = cronRows[0];
  if (!cron) return { created: 0, message: "cron not found" };

  try {
    const author = await pickAuthor(cron);
    if (!author) throw new Error("нет активного ИИ-автора");

    const { topic, keywords, topicRowId } = await pickTopic(cron, author);

    const gen = await generateArticle({
      author,
      topic,
      keywords: keywords.length ? keywords : cron.keywords,
      category: cron.category,
      minWords: cron.minWords,
      tone: cron.tone || undefined,
    });

    const settings = await getSettings();
    // Decide status: approval-gate OR pace-gate → buffer as "review".
    let status: "published" | "review" = "review";
    let bufferReason: string | null = "Ожидает модерации";
    if (!cron.requiresApproval && settings.autoPublish) {
      if (await paceAllowsPublish()) {
        status = "published";
        bufferReason = null;
      } else {
        bufferReason = "Отложено лимитом публикаций";
      }
    }

    const slug = await uniqueSlug(slugify(gen.title));
    const id = nanoid();
    const now = new Date();

    await db.insert(articles).values({
      id,
      slug,
      title: gen.title,
      excerpt: gen.excerpt,
      body: gen.body,
      cover: "",
      category: (cron.category as CategorySlug) ?? "business",
      tags: gen.tags,
      authorId: author.id,
      tier: gen.geoScore >= 85 ? "elite" : "standard",
      status,
      readingMinutes: gen.readingMinutes,
      views: 0,
      claps: 0,
      comments: 0,
      publishedAt: now,
      geoScore: gen.geoScore,
      featured: false,
      cronId: cron.id,
      bufferReason,
      aiGenerated: true,
      createdAt: now,
      updatedAt: now,
    });

    // Bookkeeping.
    if (topicRowId) {
      await db
        .update(articleCronTopics)
        .set({ used: true, usedAt: now })
        .where(eq(articleCronTopics.id, topicRowId));
    }
    await db.update(aiAuthors).set({ lastRun: now, published: sql`${aiAuthors.published} + 1` }).where(eq(aiAuthors.id, author.id));
    if (status === "published") {
      await db.update(authorsTable).set({ articlesCount: sql`${authorsTable.articlesCount} + 1` }).where(eq(authorsTable.id, author.id));
    }
    await db.update(articleCrons).set({ lastRunAt: now }).where(eq(articleCrons.id, cron.id));

    const msg = `«${gen.title}» → ${status === "published" ? "опубликовано" : "в буфере"} (автор: ${author.name})`;
    await db.insert(articleCronRuns).values({ cronId: cron.id, status: "ok", articlesCreated: 1, message: msg });
    return { created: 1, message: msg };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.insert(articleCronRuns).values({ cronId: cron.id, status: "error", articlesCreated: 0, message });
    await db.update(articleCrons).set({ lastRunAt: new Date() }).where(eq(articleCrons.id, cron.id));
    return { created: 0, message: `ошибка: ${message}` };
  }
}

/** How many crons to generate in parallel per batch. With ~20 hourly crons
 * each producing a long (2400+ word) article, sequential runs would blow past
 * the 300s function limit, so we fan out in bounded batches. */
const CRON_CONCURRENCY = 4;

/** Run every cron that is due right now, in bounded-concurrency batches. */
export async function runDueCrons(): Promise<{ ran: number; created: number }> {
  const crons = await db.select().from(articleCrons).where(eq(articleCrons.status, "active"));
  const due = crons.filter((cron) => cronIsDue(cron));
  let created = 0;
  for (let i = 0; i < due.length; i += CRON_CONCURRENCY) {
    const batch = due.slice(i, i + CRON_CONCURRENCY);
    const results = await Promise.all(batch.map((cron) => runCron(cron.id)));
    for (const res of results) created += res.created;
  }
  return { ran: due.length, created };
}

/**
 * Promote buffered ("review") AI articles to published while the pace allows.
 * Only auto-promotes articles from crons that don't require approval.
 */
export async function promoteBuffer(): Promise<{ promoted: number }> {
  const settings = await getSettings();
  if (!settings.autoPublish) return { promoted: 0 };

  const buffered = await db
    .select({ id: articles.id, authorId: articles.authorId, cronId: articles.cronId })
    .from(articles)
    .where(and(eq(articles.status, "review"), eq(articles.aiGenerated, true), eq(articles.bufferReason, "Отложено лимитом публикаций")))
    .orderBy(asc(articles.createdAt));

  let promoted = 0;
  for (const a of buffered) {
    if (!(await paceAllowsPublish())) break;
    const now = new Date();
    await db
      .update(articles)
      .set({ status: "published", bufferReason: null, publishedAt: now, updatedAt: now })
      .where(eq(articles.id, a.id));
    if (a.authorId) {
      await db
        .update(authorsTable)
        .set({ articlesCount: sql`${authorsTable.articlesCount} + 1` })
        .where(eq(authorsTable.id, a.authorId));
    }
    promoted++;
  }
  return { promoted };
}
