import { PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { newsbotSources, newsbotRuns, news } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { NewsbotWorkspace } from "./NewsbotWorkspace";

export const metadata = { title: "Newsbot — Rusability" };
export const dynamic = "force-dynamic";

export default async function NewsbotPage() {
  const [sources, runs, queue, feed] = await Promise.all([
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
  ]);

  const publishedToday = feed.filter(
    (f) => f.pipeline !== "review" && Date.now() - f.publishedAt.getTime() < 86_400_000,
  ).length;

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Newsbot"
        subtitle="Автоматический сбор новостей из российских источников, ИИ-рерайт на русском и модерация перед публикацией."
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
        publishedToday={publishedToday}
      />
    </div>
  );
}
