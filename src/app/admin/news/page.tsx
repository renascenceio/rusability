import { PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { newsbotSources, newsbotRuns, news } from "@/lib/db/schema";
import { desc, eq, and, or, isNull, gt, count, sql } from "drizzle-orm";
import { NewsbotWorkspace } from "@/components/admin/NewsbotWorkspace";
import { getBlockedTerms } from "@/lib/data/news-blocklist";

/** Matches the public site's definition of "published" (pipeline published OR null). */
const isPublished = or(eq(news.pipeline, "published"), isNull(news.pipeline));

export const metadata = { title: "Новости — Rusability" };
export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const dayAgo = new Date(Date.now() - 86_400_000);
  // Most-recently-touched first (queued items carry fetchedAt; fall back to publishedAt).
  const recency = sql`coalesce(${news.fetchedAt}, ${news.publishedAt})`;
  const [sources, runs, pipeline, feed, totalRow, todayRow, reviewRow, writeQueueRow, rejectedRow, blockedTerms] =
    await Promise.all([
      db.select().from(newsbotSources).orderBy(newsbotSources.name),
      db.select().from(newsbotRuns).orderBy(desc(newsbotRuns.startedAt)).limit(15),
      // Full pipeline monitor — items across every stage (queued/review/published/rejected).
      db
        .select({
          id: news.id,
          slug: news.slug,
          title: news.title,
          excerpt: news.excerpt,
          category: news.category,
          source: news.source,
          sourceUrl: news.sourceUrl,
          originalTitle: news.originalTitle,
          pipeline: news.pipeline,
          fetchedAt: news.fetchedAt,
          publishedAt: news.publishedAt,
        })
        .from(news)
        .orderBy(desc(recency))
        .limit(80),
      db
        .select({
          id: news.id,
          slug: news.slug,
          title: news.title,
          category: news.category,
          source: news.source,
          pipeline: news.pipeline,
          publishedAt: news.publishedAt,
        })
        .from(news)
        .orderBy(desc(news.publishedAt))
        .limit(24),
      // Real all-time published total (matches the public site), independent of the display feed cap.
      db.select({ n: count() }).from(news).where(isPublished),
      // Real count published in the last 24h.
      db
        .select({ n: count() })
        .from(news)
        .where(and(isPublished, gt(news.publishedAt, dayAgo))),
      // Items written but awaiting moderation (auto-publish off).
      db.select({ n: count() }).from(news).where(eq(news.pipeline, "review")),
      // Writing-queue size (collected items awaiting AI rewrite).
      db.select({ n: count() }).from(news).where(eq(news.pipeline, "queued")),
      // Items the AI rejected as unpublishable / off-topic.
      db.select({ n: count() }).from(news).where(eq(news.pipeline, "rejected")),
      getBlockedTerms(),
    ]);

  const totalPublished = totalRow[0]?.n ?? 0;
  const publishedToday = todayRow[0]?.n ?? 0;
  const reviewCount = reviewRow[0]?.n ?? 0;
  const writeQueueCount = writeQueueRow[0]?.n ?? 0;
  const rejectedCount = rejectedRow[0]?.n ?? 0;

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Новости"
        subtitle="Лента материалов, ИИ-сбор из российских источников (Newsbot), рерайт на русском и модерация перед публикацией."
      />
      <NewsbotWorkspace
        sources={sources.map((s) => ({
          id: s.id,
          name: s.name,
          url: s.url,
          category: s.category ?? "",
          active: s.active,
          itemsIngested: s.itemsIngested,
          lastFetchedAt: s.lastFetchedAt ? s.lastFetchedAt.toISOString() : null,
        }))}
        runs={runs.map((r) => ({ ...r, startedAt: r.startedAt.toISOString() }))}
        pipeline={pipeline.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          category: p.category,
          source: p.source,
          sourceUrl: p.sourceUrl,
          originalTitle: p.originalTitle,
          pipeline: p.pipeline ?? "published",
          at: (p.fetchedAt ?? p.publishedAt).toISOString(),
        }))}
        feed={feed.map((f) => ({
          ...f,
          pipeline: f.pipeline ?? "published",
          publishedAt: f.publishedAt.toISOString(),
        }))}
        blockedTerms={blockedTerms}
        totalPublished={totalPublished}
        publishedToday={publishedToday}
        reviewCount={reviewCount}
        writeQueueCount={writeQueueCount}
        rejectedCount={rejectedCount}
      />
    </div>
  );
}
