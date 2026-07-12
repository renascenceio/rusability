import { PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import {
  articleCrons,
  articleCronTopics,
  articleCronRuns,
  contentSettings,
  articles,
  aiAuthors,
  authors as authorsTable,
} from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { CronsWorkspace } from "./CronsWorkspace";

export const metadata = { title: "Генерация статей — Rusability" };
export const dynamic = "force-dynamic";

export default async function ArticleCronsPage() {
  const [crons, topicCounts, runs, settingsRow, buffered, aiAuthorRows] = await Promise.all([
    db.select().from(articleCrons).orderBy(desc(articleCrons.createdAt)),
    db
      .select({
        cronId: articleCronTopics.cronId,
        total: sql<number>`count(*)::int`,
        unused: sql<number>`count(*) filter (where used = false)::int`,
      })
      .from(articleCronTopics)
      .groupBy(articleCronTopics.cronId),
    db.select().from(articleCronRuns).orderBy(desc(articleCronRuns.startedAt)).limit(20),
    db.select().from(contentSettings).where(eq(contentSettings.id, 1)).limit(1),
    db
      .select({
        id: articles.id,
        title: articles.title,
        excerpt: articles.excerpt,
        category: articles.category,
        authorId: articles.authorId,
        bufferReason: articles.bufferReason,
        createdAt: articles.createdAt,
      })
      .from(articles)
      .where(eq(articles.status, "review"))
      .orderBy(desc(articles.createdAt)),
    db.select().from(aiAuthors).orderBy(aiAuthors.name),
  ]);

  const authorNames = new Map(
    (await db.select({ id: authorsTable.id, name: authorsTable.name }).from(authorsTable)).map((a) => [
      a.id,
      a.name,
    ]),
  );

  const settings = settingsRow[0] ?? {
    minHoursBetween: 6,
    maxPerDay: 8,
    autoPublish: false,
    newsAutoPublish: false,
  };

  const topicMap = new Map(topicCounts.map((t) => [t.cronId, t]));

  return (
    <div>
      <PageHeader
        title="Генерация статей"
        subtitle="Автоматические кроны: ИИ-авторы пишут статьи по расписанию с учётом ИИ-требований, темпа публикаций и модерации."
      />
      <CronsWorkspace
        crons={crons.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          lastRunAt: c.lastRunAt ? c.lastRunAt.toISOString() : null,
          topicsTotal: topicMap.get(c.id)?.total ?? 0,
          topicsUnused: topicMap.get(c.id)?.unused ?? 0,
          authorName: c.authorId ? authorNames.get(c.authorId) ?? null : null,
        }))}
        runs={runs.map((r) => ({ ...r, startedAt: r.startedAt.toISOString() }))}
        buffered={buffered.map((b) => ({
          ...b,
          createdAt: b.createdAt.toISOString(),
          authorName: authorNames.get(b.authorId) ?? "—",
        }))}
        settings={{
          minHoursBetween: settings.minHoursBetween,
          maxPerDay: settings.maxPerDay,
          autoPublish: settings.autoPublish,
          newsAutoPublish: settings.newsAutoPublish,
        }}
        authors={aiAuthorRows.map((a) => ({ id: a.id, name: a.name, active: a.active, category: a.category }))}
      />
    </div>
  );
}
