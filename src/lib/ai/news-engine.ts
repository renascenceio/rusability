import "server-only";
import Parser from "rss-parser";
import { db } from "@/lib/db";
import { news, newsbotSources, newsbotRuns, contentSettings } from "@/lib/db/schema";
import { asc, count, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { rewriteNews } from "./generate-news";
import { isBlockedItem, matchesBlockedTerm } from "./content-filter";
import { getBlockedTerms } from "@/lib/data/news-blocklist";
import { getClassExamples } from "@/lib/data/news-examples";
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

/**
 * Turn a raw thrown error into a short, human-readable Russian note. Provider
 * errors (e.g. AI Gateway "A positive credit balance is required…" with encoded
 * top-up URLs) are long, English, and leak internal links — collapse the common
 * ones into a clean phrase and hard-cap length so the status line stays tidy.
 */
function friendlyError(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : String(err ?? fallback);
  const lower = raw.toLowerCase();
  if (lower.includes("credit balance") || lower.includes("insufficient") || lower.includes("quota")) {
    return "закончились кредиты ИИ";
  }
  if (lower.includes("rate limit") || lower.includes("429")) return "лимит запросов ИИ";
  if (lower.includes("timeout") || lower.includes("timed out") || lower.includes("etimedout")) {
    return "таймаут";
  }
  if (lower.includes("fetch") || lower.includes("network") || lower.includes("enotfound")) {
    return "источник недоступен";
  }
  // Otherwise: strip any URLs and clip to a readable length.
  const cleaned = raw.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim();
  return cleaned.length > 80 ? `${cleaned.slice(0, 80)}…` : cleaned || fallback;
}

/**
 * Collapse per-source error notes into a compact, de-duplicated list. When many
 * sources fail the same way (e.g. all hit "закончились кредиты ИИ"), report the
 * reason once with an occurrence count instead of repeating it per source.
 */
function dedupeNotes(errors: string[]): string[] {
  const byReason = new Map<string, number>();
  for (const e of errors) {
    const reason = e.includes(": ") ? e.slice(e.indexOf(": ") + 2) : e;
    byReason.set(reason, (byReason.get(reason) ?? 0) + 1);
  }
  return Array.from(byReason.entries())
    .slice(0, 3)
    .map(([reason, n]) => (n > 1 ? `${reason} (×${n})` : reason));
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

  // Admin "wrong topic" stop-list — dropped in addition to the static filter.
  const blockedTerms = await getBlockedTerms();

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
      errors.push(`${src.name}: ${friendlyError(err, "ошибка загрузки")}`);
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

      // Admin "wrong topic" stop-list — editorial feedback from the pipeline.
      if (matchesBlockedTerm(`${sourceTitle} ${sourceSummary}`, blockedTerms)) {
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
  const notes = dedupeNotes(errors);
  const message = notes.length ? `${base}. Замечания: ${notes.join("; ")}` : base;
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
  disputed: number;
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
    return { written: 0, published: 0, rejected: 0, disputed: 0, remaining: 0, message: "очередь пуста" };
  }

  // Few-shot guidance from the editor's past decisions (loaded once per batch).
  const examples = await getClassExamples();

  const startedAt = Date.now();
  let published = 0;
  let rejected = 0;
  let written = 0;
  let disputed = 0;
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
        examples,
      });

      // 1) Safety / relevance gate — hard reject.
      if (!rewritten.publishable) {
        await db.update(news).set({ pipeline: "rejected" }).where(eq(news.id, row.id));
        rejected++;
        return;
      }

      // 2) Out of the Russian-speaking segment (confident) — reject.
      if (rewritten.geoScope === "out_of_scope") {
        await db.update(news).set({ pipeline: "rejected" }).where(eq(news.id, row.id));
        rejected++;
        return;
      }

      // 3) Confident evergreen article (not a news event) — reject.
      if (rewritten.format === "article") {
        await db.update(news).set({ pipeline: "rejected" }).where(eq(news.id, row.id));
        rejected++;
        return;
      }

      // Everything below keeps the freshly-written note (so the editor can
      // release borderline items as-is without re-writing).
      const writtenFields = {
        title: rewritten.title,
        excerpt: rewritten.excerpt,
        body: rewritten.body,
        tags: rewritten.tags,
        category: rewritten.category,
        slug: await uniqueSlug(slugify(rewritten.title)),
        publishedAt: new Date(),
      };

      // 4) Borderline format or unclear geo — hold for the editor («Спорные»).
      if (rewritten.format === "borderline" || rewritten.geoScope === "unclear") {
        await db.update(news).set({ ...writtenFields, pipeline: "disputed" }).where(eq(news.id, row.id));
        disputed++;
        return;
      }

      // 5) Confident in-scope news → publish instantly (or review when auto-publish off).
      await db
        .update(news)
        .set({ ...writtenFields, pipeline: autoPublish ? "published" : "review" })
        .where(eq(news.id, row.id));
      written++;
      if (autoPublish) published++;
    } catch (err) {
      errors.push(`${row.source}: ${friendlyError(err, "ошибка записи")}`);
    }
  });

  const [{ n: remaining }] = await db
    .select({ n: count() })
    .from(news)
    .where(eq(news.pipeline, "queued"));

  const verb = autoPublish ? "опубликовано" : "в модерацию";
  const parts = [`написано ${written} (${verb})`, `отклонено ИИ ${rejected}`];
  if (disputed) parts.push(`спорных ${disputed}`);
  if (skippedForTime) parts.push(`перенесено ${skippedForTime}`);
  const base = `Готово: ${parts.join(", ")}`;
  const notes = dedupeNotes(errors);
  const message = notes.length ? `${base}. Замечания: ${notes.join("; ")}` : base;
  await db.insert(newsbotRuns).values({
    status: errors.length && written === 0 ? "error" : "ok",
    fetched: 0,
    created: written,
    message,
  });
  return { written, published, rejected, disputed, remaining, message };
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

  // Build ONE clean summary + a single "Замечания:" section, so the admin
  // status banner can split it cleanly. Strip any per-phase notes first and
  // merge them, deduped, at the end.
  const stripNotes = (m: string) => {
    const i = m.indexOf("Замечания:");
    return (i >= 0 ? m.slice(0, i) : m).replace(/[.\s]+$/, "").trim();
  };
  const extractNotes = (m: string) => {
    const i = m.indexOf("Замечания:");
    return i >= 0
      ? m
          .slice(i + "Замечания:".length)
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  };
  const summary = `${stripNotes(collected.message)}. ${stripNotes(written.message)}. В очереди ещё ${written.remaining}`;
  const notes = dedupeNotes([...extractNotes(collected.message), ...extractNotes(written.message)]);
  const message = notes.length ? `${summary}. Замечания: ${notes.join("; ")}` : summary;
  return {
    fetched: collected.fetched,
    created: written.written,
    blocked: collected.blocked,
    rejected: written.rejected,
    message,
  };
}
