import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { asc, eq, or, sql } from "drizzle-orm";
import { generateArticleCover } from "@/lib/ai/generate-image";

/**
 * Fill in cover images for published articles that don't have one yet.
 *
 * Cover generation NEVER blocks publishing, so a transient image-provider
 * outage (e.g. the gateway failing for an hour) leaves a batch of articles
 * with an empty `cover` forever. This helper is the durable self-heal: the
 * articles cron calls it every run, so any gap left by a blip is filled on the
 * next tick instead of needing a manual backfill. Bounded per call to stay
 * inside the cron's time budget.
 */
export async function backfillCoverlessArticles(limit = 4): Promise<{ processed: number; done: number; remaining: number }> {
  const coverless = or(sql`${articles.cover} is null`, eq(articles.cover, ""));

  const batch = await db
    .select({ id: articles.id, title: articles.title, category: articles.category, authorId: articles.authorId })
    .from(articles)
    .where(coverless)
    .orderBy(asc(articles.createdAt))
    .limit(limit);

  let done = 0;
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
      }
    } catch (err) {
      console.log("[v0] backfillCoverlessArticles failed for", a.id, err instanceof Error ? err.message : String(err));
    }
  }

  const [{ n: remaining }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(articles)
    .where(coverless);

  return { processed: batch.length, done, remaining };
}
