import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/cron-auth";
import { db } from "@/lib/db";
import { news } from "@/lib/db/schema";
import { and, asc, eq, isNull, or, sql } from "drizzle-orm";
import { enrichNewsAeo } from "@/lib/ai/generate-news";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Backfill AEO/GEO/SEO extras (keyPoints, faq, meta, scores) onto
 * already-published news that predate the AEO generation. Enrichment reads
 * each note's existing text and NEVER rewrites the title/body.
 *
 *   POST /api/admin/backfill-news-aeo?limit=24
 *
 * Idempotent + resumable: only rows with an empty `faq` are selected, so it is
 * safe to call repeatedly until `remaining` reaches 0. force=1 re-enriches all.
 */

// Publicly visible news (published pipeline, or legacy rows with null pipeline).
const publicNews = or(eq(news.pipeline, "published"), isNull(news.pipeline));
// A row still needs enrichment while its FAQ is empty.
const needsAeo = sql`coalesce(jsonb_array_length(${news.faq}), 0) = 0`;

/** Run `worker` over `items` with a bounded number of concurrent tasks. */
async function pool<T, R>(items: T[], concurrency: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length) as R[];
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await worker(items[i]);
    }
  });
  await Promise.all(runners);
  return results;
}

export async function POST(req: Request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(60, Math.max(1, parseInt(url.searchParams.get("limit") ?? "24", 10)));
  const concurrency = Math.min(12, Math.max(1, parseInt(url.searchParams.get("concurrency") ?? "8", 10)));
  const force = url.searchParams.get("force") === "1";

  const filter = force ? publicNews : and(publicNews, needsAeo);

  const batch = await db
    .select({
      id: news.id,
      title: news.title,
      excerpt: news.excerpt,
      body: news.body,
      category: news.category,
    })
    .from(news)
    .where(filter)
    .orderBy(asc(news.id))
    .limit(limit);

  const failures: string[] = [];
  const outcomes = await pool(batch, concurrency, async (row) => {
    try {
      const extras = await enrichNewsAeo({
        title: row.title,
        excerpt: row.excerpt,
        body: (row.body as string[]) ?? [],
        category: row.category as never,
      });
      await db
        .update(news)
        .set({
          keyPoints: extras.keyPoints,
          faq: extras.faq,
          metaTitle: extras.metaTitle,
          metaDescription: extras.metaDescription,
          geoScore: extras.geoScore,
          seoScore: extras.seoScore,
          aeoScore: extras.aeoScore,
        })
        .where(eq(news.id, row.id));
      return true;
    } catch (err) {
      failures.push(`${row.id}: ${err instanceof Error ? err.message : "error"}`);
      return false;
    }
  });

  const done = outcomes.filter(Boolean).length;

  const [{ n: remaining }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(news)
    .where(and(publicNews, needsAeo));

  return NextResponse.json({ processed: batch.length, done, remaining, failures, force });
}
