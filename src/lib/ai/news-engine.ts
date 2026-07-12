import "server-only";
import Parser from "rss-parser";
import { db } from "@/lib/db";
import { news, newsbotSources, newsbotRuns, contentSettings } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { rewriteNews } from "./generate-news";
import { isBlockedItem } from "./content-filter";
import { slugify } from "@/lib/utils";
import type { NewsCategory } from "@/lib/types";

const parser = new Parser({ timeout: 15000, headers: { "User-Agent": "Mozilla/5.0 (compatible; RusabilityBot/1.0)" } });

const MAX_PER_SOURCE = 3; // cap new items ingested per source per run
const MAX_CREATED_PER_RUN = 24; // global cap so one run stays within time/cost budget
const CATS: NewsCategory[] = ["tech", "marketing", "business", "science"];

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
  let slug = base;
  for (let i = 0; i < 6; i++) {
    const hit = await db.select({ id: news.id }).from(news).where(eq(news.slug, slug)).limit(1);
    if (hit.length === 0) return slug;
    slug = `${base}-${nanoid(4).toLowerCase()}`;
  }
  return `${base}-${nanoid(6).toLowerCase()}`;
}

/**
 * Fetch active sources, pull recent items, skip anything already ingested
 * (dedupe by originalUrl), AI-rewrite into original Russian notes, and queue
 * them for moderation (pipeline='review'). If newsAutoPublish is on, publish.
 */
export async function runNewsbot(): Promise<{
  fetched: number;
  created: number;
  blocked: number;
  rejected: number;
  message: string;
}> {
  const settings = (await db.select().from(contentSettings).where(eq(contentSettings.id, 1)).limit(1))[0];
  const autoPublish = settings?.newsAutoPublish ?? false;

  const sources = await db.select().from(newsbotSources).where(eq(newsbotSources.active, true));
  if (sources.length === 0)
    return { fetched: 0, created: 0, blocked: 0, rejected: 0, message: "нет активных источников" };

  let fetched = 0;
  let created = 0;
  let blocked = 0; // dropped by the editorial safety filter (no AI spend)
  let rejected = 0; // dropped by the AI moderation gate (publishable=false)
  const errors: string[] = [];

  for (const src of sources) {
    if (created >= MAX_CREATED_PER_RUN) break;
    let items: Parser.Item[] = [];
    try {
      const feed = await parser.parseURL(src.url);
      items = feed.items.slice(0, 12);
      fetched += items.length;
    } catch (err) {
      errors.push(`${src.name}: ${err instanceof Error ? err.message : "fetch error"}`);
      continue;
    }

    // Dedupe: which of these URLs already exist?
    const urls = items.map((i) => i.link).filter(Boolean) as string[];
    const existing = urls.length
      ? await db.select({ u: news.originalUrl }).from(news).where(inArray(news.originalUrl, urls))
      : [];
    const seen = new Set(existing.map((e) => e.u));

    let perSource = 0;
    for (const item of items) {
      if (perSource >= MAX_PER_SOURCE || created >= MAX_CREATED_PER_RUN) break;
      const link = item.link;
      if (!link || seen.has(link)) continue;

      const sourceTitle = cleanTitle(item.title ?? "");
      const sourceSummary = stripHtml((item.contentSnippet || item.content || "").slice(0, 1200)).slice(0, 600);

      // Layer 1 — cheap keyword pre-filter. Drop banned topics before AI spend.
      const gate = isBlockedItem({ title: sourceTitle, summary: sourceSummary });
      if (gate.blocked) {
        blocked++;
        seen.add(link);
        continue;
      }

      try {
        const rewritten = await rewriteNews({
          sourceTitle,
          sourceSummary,
          sourceName: src.name,
          category: normCategory(src.category),
        });

        // Layer 2 — AI moderation gate. Skip anything the model flags.
        if (!rewritten.publishable) {
          rejected++;
          seen.add(link);
          continue;
        }

        const now = new Date();
        const publishedAt = item.isoDate ? new Date(item.isoDate) : now;
        await db.insert(news).values({
          id: nanoid(),
          slug: await uniqueSlug(slugify(rewritten.title)),
          title: rewritten.title,
          excerpt: rewritten.excerpt,
          body: rewritten.body,
          category: rewritten.category,
          source: src.name,
          sourceUrl: link,
          tags: rewritten.tags,
          publishedAt,
          timeLabel: "",
          views: 0,
          pipeline: autoPublish ? "published" : "review",
          hot: false,
          originalUrl: link,
          originalTitle: sourceTitle,
          sourceId: src.id,
          fetchedAt: now,
        });
        created++;
        perSource++;
        seen.add(link);
      } catch (err) {
        errors.push(`${src.name} rewrite: ${err instanceof Error ? err.message : "error"}`);
      }
    }

    await db
      .update(newsbotSources)
      .set({ lastFetchedAt: new Date(), itemsIngested: src.itemsIngested + perSource })
      .where(eq(newsbotSources.id, src.id));
  }

  const parts = [`создано ${created}`, `отфильтровано ${blocked}`, `отклонено ИИ ${rejected}`];
  const base = `Готово: ${parts.join(", ")}`;
  const message = errors.length ? `${base}; замечания: ${errors.slice(0, 3).join("; ")}` : base;
  await db.insert(newsbotRuns).values({
    status: errors.length && created === 0 ? "error" : "ok",
    fetched,
    created,
    message,
  });
  return { fetched, created, blocked, rejected, message };
}
