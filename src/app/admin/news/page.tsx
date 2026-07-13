import { PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { newsbotSources, newsbotRuns, news } from "@/lib/db/schema";
import { desc, eq, and, or, isNull, gt, count } from "drizzle-orm";
import { NewsbotWorkspace } from "@/components/admin/NewsbotWorkspace";

/** Matches the public site's definition of "published" (pipeline published OR null). */
const isPublished = or(eq(news.pipeline, "published"), isNull(news.pipeline));

export const metadata = { title: "Новости — Rusability" };
export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const dayAgo = new Date(Date.now() - 86_400_000);
  const [sources, runs, queue, feed, totalRow, todayRow, queueRow, writeQueueRow] = await Promise.all([
    db.select().from(newsbotSources).orderBy(newsbotSources.name),
    db.select().from(newsbotRuns).orderBy(desc(newsbotRuns.startedAt)).limit(15),
    db
      .select({
        id: news.id,
        title: news.title,
        excerpt: news.excerpt,
        category: news.category,
        source: news.source,
        sourceUrl: news.sourceUrl,
        originalTitle: news.originalTitle,
        publishedAt: news.publishedAt,
      })
      .from(news)
      .where(eq(news.pipeline, "review"))
      .orderBy(desc(news.publishedAt))
      .limit(50),
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
    // Real moderation-queue size (items awaiting review).
    db.select({ n: count() }).from(news).where(eq(news.pipeline, "review")),
    // Real writing-queue size (collected items awaiting AI rewrite).
    db.select({ n: count() }).from(news).where(eq(news.pipeline, "queued")),
  ]);

  const totalPublished = totalRow[0]?.n ?? 0;
  const publishedToday = todayRow[0]?.n ?? 0;
  const queueCount = queueRow[0]?.n ?? 0;
  const writeQueueCount = writeQueueRow[0]?.n ?? 0;

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
        queue={queue.map((q) => ({ ...q, publishedAt: q.publishedAt.toISOString() }))}
        feed={feed.map((f) => ({
          ...f,
          pipeline: f.pipeline ?? "published",
          publishedAt: f.publishedAt.toISOString(),
        }))}
        totalPublished={totalPublished}
        publishedToday={publishedToday}
        queueCount={queueCount}
        writeQueueCount={writeQueueCount}
      />
    </div>
  );
}
