import "server-only";
import Parser from "rss-parser";
import { db } from "@/lib/db";
import { news, newsbotSources, newsbotRuns, contentSettings } from "@/lib/db/schema";
import { asc, count, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { rewriteNews } from "./generate-news";
import { isBlockedItem } from "./content-filter";
import { slugify } from "@/lib/utils";
import type { NewsCategory } from "@/lib/types";

const parser = new Parser({ timeout: 15000, headers: { "User-Agent": "Mozilla/5.0 (compatible; RusabilityBot/1.0)" } });

const MAX_PER_SOURCE = 3; // cap new items ingested per source per collection run
const MAX_QUEUED_PER_RUN = 60; // global cap per collection run (queuing is cheap — no AI)

/**
 * Writing concurrency — the number of articles the engine writes SIMULTANEOUSLY.
 * This is the hard ceiling that keeps us within the model/gateway rate limit:
 * we never fire more than this many AI writes at once, no matter how deep the
 * queue is. Tune conservatively — raising it risks 429s from the provider.
 */
const WRITE_CONCURRENCY = 3;
const MAX_WRITE_PER_RUN = 15; // cap writes per invocation to stay within the function time budget
const WRITE_TIME_BUDGET_MS = 250_000; // stop picking up new items past this (maxDuration is 300s)

const CATS: NewsCategory[] = [
  "tech",
  "marketing",
  "business",
  "science",
  "fintech",
  "biotech",
  "ai",
  "startups",
  "ecommerce",
];

function normCategory(c: string | null): NewsCategory {
  return CATS.includes(c as NewsCategory) ? (c as NewsCategory) : "business";
}

/** Strip HTML tags/entities from an RSS snippet (Google News embeds markup). */
function stripHtml(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Google News titles end with " - Publisher"; keep the headline, drop suffix. */
function cleanTitle(t: string): string {
  return t.replace(/\s+-\s+[^-]+$/, "").trim() || t.trim();
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base || "news";
  for (let i = 0; i < 6; i++) {
    const hit = await db.select({ id: news.id }).from(news).where(eq(news.slug, slug)).limit(1);
    if (hit.length === 0) return slug;
    slug = `${base}-${nanoid(4).toLowerCase()}`;
  }
  return `${base}-${nanoid(6).toLowerCase()}`;
}

/**
 * Run async work over `items` with a hard cap of `concurrency` promises
 * in flight at any moment. A fixed pool of workers pulls from a shared cursor,
 * so we never exceed the ceiling regardless of how many items are queued.
 */
async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }
  const size = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(Array.from({ length: size }, () => worker()));
  return results;
}

/* ============================================================================
 * PHASE 1 — COLLECT
 * Fetch active sources, dedupe, keyword pre-filter, and QUEUE items for later
 * writing. No AI is called here, so this stays fast and cheap and can run
 * frequently. Queued rows carry the source title/summary (summary parked in
 * `excerpt`) and are invisible to the public site (pipeline='queued').
 * ==========================================================================*/
export async function collectNews(): Promise<{
  fetched: number;
  queued: number;
  blocked: number;
  message: string;
}> {
  const sources = await db.select().from(newsbotSources).where(eq(newsbotSources.active, true));
  if (sources.length === 0) return { fetched: 0, queued: 0, blocked: 0, message: "нет активных источников" };

  let fetched = 0;
  let queued = 0;
  let blocked = 0;
  const errors: string[] = [];

  for (const src of sources) {
    if (queued >= MAX_QUEUED_PER_RUN) break;
    let items: Parser.Item[] = [];
    try {
      const feed = await parser.parseURL(src.url);
      items = feed.items.slice(0, 12);
      fetched += items.length;
    } catch (err) {
      errors.push(`${src.name}: ${err instanceof Error ? err.message : "fetch error"}`);
      continue;
    }

    // Dedupe against everything already ingested (queued/review/published).
    const urls = items.map((i) => i.link).filter(Boolean) as string[];
    const existing = urls.length
      ? await db.select({ u: news.originalUrl }).from(news).where(inArray(news.originalUrl, urls))
      : [];
    const seen = new Set(existing.map((e) => e.u));

    let perSource = 0;
    for (const item of items) {
      if (perSource >= MAX_PER_SOURCE || queued >= MAX_QUEUED_PER_RUN) break;
      const link = item.link;
      if (!link || seen.has(link)) continue;

      const sourceTitle = cleanTitle(item.title ?? "");
      const sourceSummary = stripHtml((item.contentSnippet || item.content || "").slice(0, 1200)).slice(0, 600);
      if (!sourceTitle) continue;

      // Cheap keyword pre-filter — drop banned/off-topic before it ever costs AI.
      const gate = isBlockedItem({ title: sourceTitle, summary: sourceSummary });
      if (gate.blocked) {
        blocked++;
        seen.add(link);
        continue;
      }

      const now = new Date();
      const publishedAt = item.isoDate ? new Date(item.isoDate) : now;
      await db.insert(news).values({
        id: nanoid(),
        slug: await uniqueSlug(`queued-${nanoid(6).toLowerCase()}`),
        title: sourceTitle, // placeholder — overwritten by the AI title on write
        excerpt: sourceSummary, // parked here so the writer can read it back
        body: [],
        category: normCategory(src.category),
        source: src.name,
        sourceUrl: link,
        tags: [],
        publishedAt,
        timeLabel: "",
        views: 0,
        pipeline: "queued",
        hot: false,
        originalUrl: link,
        originalTitle: sourceTitle,
        sourceId: src.id,
        fetchedAt: now,
      });
      queued++;
      perSource++;
      seen.add(link);
    }

    await db
      .update(newsbotSources)
      .set({ lastFetchedAt: new Date(), itemsIngested: src.itemsIngested + perSource })
      .where(eq(newsbotSources.id, src.id));
  }

  const base = `Собрано в очередь: ${queued}, отфильтровано ${blocked}`;
  const message = errors.length ? `${base}; замечания: ${errors.slice(0, 3).join("; ")}` : base;
  await db.insert(newsbotRuns).values({
    status: errors.length && queued === 0 ? "error" : "ok",
    fetched,
    created: queued,
    message,
  });
  return { fetched, queued, blocked, message };
}

/* ============================================================================
 * PHASE 2 — WRITE (bounded concurrency, publish instantly)
 * Drain queued items, AI-rewrite each into an original Russian note, and the
 * moment a note is written it is published instantly (or sent to review when
 * auto-publish is off). Writing runs through a fixed-size worker pool so we
 * never write more than WRITE_CONCURRENCY items at the same time.
 * ==========================================================================*/
export async function writeQueuedNews(opts?: {
  max?: number;
  concurrency?: number;
}): Promise<{
  written: number;
  published: number;
  rejected: number;
  remaining: number;
  message: string;
}> {
  const max = opts?.max ?? MAX_WRITE_PER_RUN;
  const concurrency = opts?.concurrency ?? WRITE_CONCURRENCY;

  const settings = (await db.select().from(contentSettings).where(eq(contentSettings.id, 1)).limit(1))[0];
  const autoPublish = settings?.newsAutoPublish ?? false;

  // Oldest queued first (FIFO) so nothing starves.
  const batch = await db
    .select()
    .from(news)
    .where(eq(news.pipeline, "queued"))
    .orderBy(asc(news.fetchedAt))
    .limit(max);

  if (batch.length === 0) {
    return { written: 0, published: 0, rejected: 0, remaining: 0, message: "очередь пуста" };
  }

  const startedAt = Date.now();
  let published = 0;
  let rejected = 0;
  let written = 0;
  let skippedForTime = 0;
  const errors: string[] = [];

  await mapPool(batch, concurrency, async (row) => {
    // Respect the time budget: leave leftover items queued for the next run
    // rather than risk a mid-write function timeout.
    if (Date.now() - startedAt > WRITE_TIME_BUDGET_MS) {
      skippedForTime++;
      return;
    }
    try {
      const rewritten = await rewriteNews({
        sourceTitle: row.originalTitle || row.title,
        sourceSummary: row.excerpt || "",
        sourceName: row.source,
        category: normCategory(row.category),
      });

      if (!rewritten.publishable) {
        await db.update(news).set({ pipeline: "rejected" }).where(eq(news.id, row.id));
        rejected++;
        return;
      }

      // Written → publish instantly (or route to review when auto-publish is off).
      await db
        .update(news)
        .set({
          title: rewritten.title,
          excerpt: rewritten.excerpt,
          body: rewritten.body,
          tags: rewritten.tags,
          category: rewritten.category,
          slug: await uniqueSlug(slugify(rewritten.title)),
          pipeline: autoPublish ? "published" : "review",
          publishedAt: new Date(),
        })
        .where(eq(news.id, row.id));
      written++;
      if (autoPublish) published++;
    } catch (err) {
      errors.push(`${row.source}: ${err instanceof Error ? err.message : "write error"}`);
    }
  });

  const [{ n: remaining }] = await db
    .select({ n: count() })
    .from(news)
    .where(eq(news.pipeline, "queued"));

  const verb = autoPublish ? "опубликовано" : "в модерацию";
  const parts = [`написано ${written} (${verb})`, `отклонено ИИ ${rejected}`];
  if (skippedForTime) parts.push(`перенесено ${skippedForTime}`);
  const base = `Готово: ${parts.join(", ")}`;
  const message = errors.length ? `${base}; замечания: ${errors.slice(0, 3).join("; ")}` : base;
  await db.insert(newsbotRuns).values({
    status: errors.length && written === 0 ? "error" : "ok",
    fetched: 0,
    created: written,
    message,
  });
  return { written, published, rejected, remaining, message };
}

/* ============================================================================
 * ORCHESTRATOR — collect, then drain a bounded batch of writes.
 * Kept so the existing cron + the admin "Запустить сбор" button do a full
 * cycle in one call. Return shape stays backward-compatible.
 * ==========================================================================*/
export async function runNewsbot(): Promise<{
  fetched: number;
  created: number;
  blocked: number;
  rejected: number;
  message: string;
}> {
  const collected = await collectNews();
  const written = await writeQueuedNews();
  const message = `${collected.message}. ${written.message} (в очереди ещё ${written.remaining})`;
  return {
    fetched: collected.fetched,
    created: written.written,
    blocked: collected.blocked,
    rejected: written.rejected,
    message,
  };
}
