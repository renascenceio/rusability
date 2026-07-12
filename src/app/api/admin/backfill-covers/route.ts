import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/cron-auth";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { asc, eq, or, sql } from "drizzle-orm";
import { generateArticleCover } from "@/lib/ai/generate-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Bulk-generate cover images for articles that don't have one yet, using the
 * fast/cheap Imagen model. Bounded per call (default 6) so each invocation
 * stays inside the 300s budget; call repeatedly until `remaining` is 0.
 *
 *   POST /api/admin/backfill-covers?limit=6
 *
 * force=1 regenerates covers for articles that ALREADY have one (used after a
 * prompt/art-direction change). Pass since=<epoch_ms> to only regenerate
 * articles whose cover was last generated before that time, so repeated calls
 * walk through the whole set without redoing freshly-regenerated ones.
 *
 *   POST /api/admin/backfill-covers?force=1&limit=4&since=<updatedAt cutoff ms>
 */
export async function POST(req: Request) {
  if (!(await isAuthorized())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(12, Math.max(1, parseInt(url.searchParams.get("limit") ?? "6", 10)));
  const force = url.searchParams.get("force") === "1";
  const sinceParam = url.searchParams.get("since");

  const coverless = or(sql`${articles.cover} is null`, eq(articles.cover, ""));
  // In force mode, regenerate everything (optionally only rows not updated since
  // the cutoff, so a repeated caller makes forward progress each pass).
  const filter = force
    ? sinceParam
      ? sql`${articles.updatedAt} < ${new Date(Number(sinceParam))}`
      : sql`true`
    : coverless;

  const batch = await db
    .select({ id: articles.id, title: articles.title, category: articles.category, authorId: articles.authorId })
    .from(articles)
    .where(filter)
    .orderBy(asc(articles.createdAt))
    .limit(limit);

  let done = 0;
  const failures: string[] = [];
  for (const a of batch) {
    try {
      const cover = await generateArticleCover({
        authorId: a.authorId,
        title: a.title,
        category: a.category,
        fast: true,
      });
      if (cover) {
        await db.update(articles).set({ cover, updatedAt: new Date() }).where(eq(articles.id, a.id));
        done++;
      } else {
        failures.push(`${a.id}: empty`);
      }
    } catch (err) {
      failures.push(`${a.id}: ${err instanceof Error ? err.message : "error"}`);
    }
  }

  const [{ n: remaining }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(articles)
    .where(filter);

  return NextResponse.json({ processed: batch.length, done, remaining, failures, force });
}
