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
import { generateArticleCover } from "./generate-image";
import { generateTopic, isDuplicateTopic } from "./generate-topic";
import { slugify } from "@/lib/utils";
import { getSetting, putSetting } from "@/lib/data/settings";
import type { CategorySlug } from "@/lib/types";

const MSK_OFFSET_MS = 3 * 60 * 60 * 1000; // Europe/Moscow = UTC+3, no DST

/**
 * Daily publishing window in Moscow time. Publishing begins at START (the agreed
 * 09:00 MSK) and no new publish is started after END. The per-article drip
 * interval is derived from this window / maxPerDay, so raising the daily limit
 * automatically tightens the spacing (and vice-versa) — the drip always spreads
 * the day's quota evenly across the window.
 */
const PUBLISH_START_HOUR_MSK = 9;
const PUBLISH_END_HOUR_MSK = 23;

/**
 * Canonical buffer reason for an AI article held back by the pace gate. Defined
 * once so the writer, the promoter and the generation planner always agree on
 * the exact string (a mismatched/corrupted copy previously meant buffered
 * articles were never promoted).
 */
const BUFFER_REASON_PACE = "Отложено лимитом публикаций";

/** Current wall clock in Moscow, read via getUTC* on a shifted Date. */
function mskNow(now = new Date()): Date {
  return new Date(now.getTime() + MSK_OFFSET_MS);
}
function mskDayKey(d: Date): string {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}
/** Start of the current Moscow calendar day, expressed as a UTC Date. */
function startOfMskDayUtc(now = new Date()): Date {
  const w = mskNow(now);
  return new Date(Date.UTC(w.getUTCFullYear(), w.getUTCMonth(), w.getUTCDate()) - MSK_OFFSET_MS);
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

/** Length of the daily publishing window in hours. */
function windowHours(): number {
  return PUBLISH_END_HOUR_MSK - PUBLISH_START_HOUR_MSK;
}

/**
 * How many articles *should* already be published by this moment today — the
 * daily quota (maxPerDay) spread linearly across the 09:00–23:00 MSK window.
 * Returns 0 before the window opens and maxPerDay once it closes. This single
 * function defines the whole publishing schedule; both the publish gate and the
 * generation planner read from it so they always agree.
 */
function publishTargetByNow(maxPerDay: number, now = new Date()): number {
  const nowMsk = mskNow(now);
  const mskHour = nowMsk.getUTCHours() + nowMsk.getUTCMinutes() / 60;
  const windowH = windowHours();
  const elapsedH = Math.max(0, Math.min(windowH, mskHour - PUBLISH_START_HOUR_MSK));
  return Math.min(maxPerDay, Math.ceil(maxPerDay * (elapsedH / windowH)));
}

/** Number of AI articles currently buffered by the pace gate (ready to drip). */
async function bufferedCount(): Promise<number> {
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(articles)
    .where(
      and(
        eq(articles.status, "review"),
        eq(articles.aiGenerated, true),
        eq(articles.bufferReason, BUFFER_REASON_PACE),
      ),
    );
  return n;
}

/** Count of articles published so far in the current Moscow calendar day. */
async function publishedTodayCount(): Promise<number> {
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(articles)
    .where(and(eq(articles.status, "published"), gte(articles.publishedAt, startOfMskDayUtc())));
  return n;
}

/**
 * How many more articles may be *published* right now under the pace rules.
 *
 * Catch-up aware: we allow publishing while today's published count is behind
 * `publishTargetByNow`, so a run after missed ticks bursts just enough to catch
 * up to schedule, then resumes an even drip. An explicit `minHoursBetween`
 * (admin) still acts as an absolute floor between consecutive publishes.
 */
async function paceAllowsPublish(): Promise<boolean> {
  const s = await getSettings();

  // Only publish inside the daily Moscow window (starts at the agreed hour).
  const nowMsk = mskNow();
  const mskHour = nowMsk.getUTCHours() + nowMsk.getUTCMinutes() / 60;
  if (mskHour < PUBLISH_START_HOUR_MSK || mskHour >= PUBLISH_END_HOUR_MSK) return false;

  const publishedToday = await publishedTodayCount();
  if (publishedToday >= s.maxPerDay) return false; // hard daily ceiling
  if (publishedToday >= publishTargetByNow(s.maxPerDay)) return false; // ahead of schedule

  // Absolute floor between consecutive publishes, only if admin set one (>0).
  if ((s.minHoursBetween ?? 0) > 0) {
    const last = await db
      .select({ publishedAt: articles.publishedAt })
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt))
      .limit(1);
    if (last[0]?.publishedAt) {
      const sinceLastH = (Date.now() - new Date(last[0].publishedAt).getTime()) / 36e5;
      if (sinceLastH < s.minHoursBetween) return false;
    }
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
      // Minimum gap before the SAME author may write again. The planner already
      // rotates least-recently-run first, so this just prevents one author from
      // being picked twice in quick succession while still allowing the fleet
      // to drip every few minutes.
      const elapsedMin = (now.getTime() - new Date(cron.lastRunAt).getTime()) / 6e4;
      if (elapsedMin < 20) return false;
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

/**
 * The author's memory: titles they have already published or have buffered for
 * review. Used to stop the same author repeating a topic. Scoped per author
 * (not per cron) so memory follows the author across categories.
 */
async function authorMemory(authorId: string, limit = 60): Promise<string[]> {
  const rows = await db
    .select({ title: articles.title })
    .from(articles)
    .where(eq(articles.authorId, authorId))
    .orderBy(desc(sql`coalesce(${articles.publishedAt}, ${articles.createdAt})`))
    .limit(limit);
  return rows.map((r) => r.title).filter(Boolean);
}

async function pickTopic(
  cron: typeof articleCrons.$inferSelect,
  author: typeof aiAuthors.$inferSelect,
): Promise<{ topic: string; keywords: string[]; topicRowId?: number }> {
  const memory = await authorMemory(author.id);

  // Curated queue first — but skip any queued topic the author already covered
  // (mark such rows used so they don't keep resurfacing).
  const queued = await db
    .select()
    .from(articleCronTopics)
    .where(and(eq(articleCronTopics.cronId, cron.id), eq(articleCronTopics.used, false)))
    .orderBy(asc(articleCronTopics.id))
    .limit(20);
  for (const row of queued) {
    if (isDuplicateTopic(row.topic, memory)) {
      await db
        .update(articleCronTopics)
        .set({ used: true, usedAt: new Date() })
        .where(eq(articleCronTopics.id, row.id));
      continue;
    }
    return { topic: row.topic, keywords: row.keywords, topicRowId: row.id };
  }

  // No fresh queued topic — let the model propose one, avoiding past topics.
  const gen = await generateTopic({
    author,
    category: cron.category,
    keywords: cron.keywords,
    avoidTitles: memory,
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
      elite: author.elite,
    });

    // Cover image in the author's signature style (WebP, alt = article title).
    // Quality model for fresh articles. Never let an image failure block publish.
    let cover = "";
    try {
      cover =
        (await generateArticleCover({ authorId: author.id, title: gen.title, category: cron.category })) ?? "";
    } catch {
      cover = "";
    }

    const settings = await getSettings();
    // Decide status: approval-gate OR pace-gate → buffer as "review".
    let status: "published" | "review" = "review";
    let bufferReason: string | null = "Ожидает модерации";
    if (!cron.requiresApproval && settings.autoPublish) {
      if (await paceAllowsPublish()) {
        status = "published";
        bufferReason = null;
      } else {
        bufferReason = BUFFER_REASON_PACE;
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
      cover,
      category: (cron.category as CategorySlug) ?? "business",
      tags: gen.tags,
      authorId: author.id,
      tier: author.elite ? "elite" : "standard",
      status,
      readingMinutes: gen.readingMinutes,
      views: 0,
      claps: 0,
      comments: 0,
      publishedAt: now,
      geoScore: gen.geoScore,
      seoScore: gen.seoScore,
      aeoScore: gen.aeoScore,
      faq: gen.faq,
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

/**
 * Hard ceiling on how many articles a single tick may generate, so one
 * invocation can never blow past the 300s function limit (each article is a
 * 2400+ word generation plus a cover image). A tick recovering from an outage
 * bursts up to this many to refill the buffer; a normal frequent tick generates
 * far fewer (usually one), giving the smooth author-A-then-author-B cadence.
 */
const MAX_GEN_PER_TICK = 6;

/** Stop starting new generations once this much wall-clock has elapsed. */
const GEN_TIME_BUDGET_MS = 210_000;

/** Generate at most this many articles at once (kept small for model limits). */
const GEN_CONCURRENCY = 2;

/**
 * How many hours of quota to keep buffered *ahead* of the current publish
 * target. This ready stock lets `promoteBuffer` drip on schedule even if the
 * next tick is delayed, and absorbs generation being slower than publishing.
 */
const BUFFER_LOOKAHEAD_HOURS = 2;

/**
 * Demand-driven generation. Rather than always bursting a fixed number of
 * authors, we compute how much *ready stock* (published today + buffered) we
 * want by now — the publish target plus a couple hours of look-ahead — and
 * generate only the shortfall, capped for time safety. Result:
 *  - steady state: ~1 author per tick → the sequential A→B→C drip you want;
 *  - after an outage: a short catch-up burst to refill, then back to the drip;
 *  - never exceeds the daily quota.
 * Authors are chosen least-recently-run first, so the 24 authors rotate fairly.
 */
export async function runDueCrons(): Promise<{ due: number; ran: number; created: number; planned: number }> {
  const s = await getSettings();
  const crons = await db.select().from(articleCrons).where(eq(articleCrons.status, "active"));
  const dueAll = crons.filter((cron) => cronIsDue(cron));

  // How many to generate this tick.
  let planned: number;
  if (!s.autoPublish) {
    // Approval mode: keep a light trickle flowing into the moderation queue.
    planned = Math.min(2, dueAll.length);
  } else {
    const perHour = s.maxPerDay / windowHours();
    const lookahead = Math.ceil(perHour * BUFFER_LOOKAHEAD_HOURS);
    const desiredStock = Math.min(s.maxPerDay, publishTargetByNow(s.maxPerDay) + lookahead);
    const currentStock = (await publishedTodayCount()) + (await bufferedCount());
    planned = Math.max(0, desiredStock - currentStock);
  }
  planned = Math.min(planned, MAX_GEN_PER_TICK, dueAll.length);

  // Oldest-run first → fair round-robin. Never-run crons (null lastRunAt) sort
  // to the very front so new authors start producing promptly.
  const queue = [...dueAll]
    .sort((a, b) => {
      const ta = a.lastRunAt ? new Date(a.lastRunAt).getTime() : 0;
      const tb = b.lastRunAt ? new Date(b.lastRunAt).getTime() : 0;
      return ta - tb;
    })
    .slice(0, planned);

  const startedAt = Date.now();
  let created = 0;
  let ran = 0;
  for (let i = 0; i < queue.length; i += GEN_CONCURRENCY) {
    if (Date.now() - startedAt > GEN_TIME_BUDGET_MS) break; // leave headroom for promoteBuffer
    const batch = queue.slice(i, i + GEN_CONCURRENCY);
    const results = await Promise.all(batch.map((cron) => runCron(cron.id)));
    ran += batch.length;
    for (const res of results) created += res.created;
  }

  // Record this tick so the admin health panel can show "last fired".
  try {
    await putSetting("articles_cron_tick", {
      at: new Date().toISOString(),
      due: dueAll.length,
      planned,
      ran,
      created,
    });
  } catch {
    /* non-critical */
  }

  return { due: dueAll.length, ran, created, planned };
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
    .where(and(eq(articles.status, "review"), eq(articles.aiGenerated, true), eq(articles.bufferReason, BUFFER_REASON_PACE)))
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

/**
 * A scheduled tick is considered DUE if the last one ran more than this long
 * ago. Kept a little below the Vercel cron interval so a healthy scheduler
 * always wins the race and the heartbeat only kicks in when the platform
 * scheduler has actually stalled.
 */
const TICK_DUE_AFTER_MS = 8 * 60_000;

/** Soft-lock lifetime — long enough to cover a full generation batch. */
const TICK_LOCK_TTL_MS = 280_000;

/**
 * Self-healing tick runner. Safe to call from ANY trigger (Vercel cron, a public
 * heartbeat hit by site traffic, an external uptime pinger, or the admin button)
 * because it is idempotent and guarded:
 *   1. Skips immediately if a tick already ran within TICK_DUE_AFTER_MS (so it's
 *      cheap to call on every page view).
 *   2. Takes a short DB soft-lock so concurrent callers never launch parallel
 *      generation batches.
 * When it does run, it executes the exact same schedule logic as the cron
 * (`runDueCrons` + `promoteBuffer`). This removes Vercel's scheduler as a single
 * point of failure: as long as the site gets any traffic during the day, it
 * keeps publishing on schedule even if the platform cron stops firing.
 */
export async function runTickIfDue(
  source: string,
): Promise<{ ran: boolean; reason?: string; due?: number; ran_count?: number; created?: number; planned?: number; promoted?: number }> {
  const tick = await getSetting<{ at?: string }>("articles_cron_tick", {});
  const lastAt = tick.at ? new Date(tick.at).getTime() : 0;
  if (Date.now() - lastAt < TICK_DUE_AFTER_MS) return { ran: false, reason: "fresh" };

  // Soft lock so concurrent visitors don't launch parallel generation batches.
  const lock = await getSetting<{ until?: string | null }>("articles_cron_lock", {});
  if (lock.until && new Date(lock.until).getTime() > Date.now()) return { ran: false, reason: "locked" };
  await putSetting("articles_cron_lock", {
    until: new Date(Date.now() + TICK_LOCK_TTL_MS).toISOString(),
    source,
  });

  try {
    // Re-check freshness after acquiring the lock (mitigates the acquire race).
    const t2 = await getSetting<{ at?: string }>("articles_cron_tick", {});
    if (t2.at && Date.now() - new Date(t2.at).getTime() < TICK_DUE_AFTER_MS) {
      return { ran: false, reason: "fresh" };
    }
    const due = await runDueCrons(); // updates articles_cron_tick
    const promoted = await promoteBuffer();
    return {
      ran: true,
      due: due.due,
      ran_count: due.ran,
      created: due.created,
      planned: due.planned,
      promoted: promoted.promoted,
    };
  } finally {
    await putSetting("articles_cron_lock", { until: null });
  }
}
