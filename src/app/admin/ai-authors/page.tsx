import { PageHeader, Panel } from "@/components/admin/ui";
import { ArticleTabs } from "@/components/admin/ArticleTabs";
import { db } from "@/lib/db";
import { aiAuthors, authors as authorsTable } from "@/lib/db/schema";
import { AiAuthorsGrid } from "./AiAuthorsGrid";

export const metadata = { title: "ИИ-авторы — Rusability" };
export const dynamic = "force-dynamic";

export default async function AiAuthorsPage() {
  const rows = await db.select().from(aiAuthors).orderBy(aiAuthors.name);
  const counts = new Map(
    (await db.select({ id: authorsTable.id, n: authorsTable.articlesCount }).from(authorsTable)).map((a) => [
      a.id,
      a.n,
    ]),
  );

  const authors = rows.map((a) => ({
    id: a.id,
    name: a.name,
    archetype: a.archetype,
    bio: a.bio,
    tone: a.tone,
    approach: a.approach,
    stylePrompt: a.stylePrompt,
    category: a.category,
    topics: a.topics,
    schedule: a.schedule,
    active: a.active,
    published: a.published,
    articlesCount: counts.get(a.id) ?? 0,
    lastRun: a.lastRun ? a.lastRun.toISOString() : null,
  }));

  const active = authors.filter((a) => a.active).length;
  const total = authors.reduce((s, a) => s + a.articlesCount, 0);

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="ИИ-авторы"
        subtitle={`${active} активных · ${total.toLocaleString("ru-RU")} материалов опубликовано`}
      />
      <ArticleTabs />
      {authors.length === 0 ? (
        <Panel>
          <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
            ИИ-авторы ещё не созданы. Откройте раздел «Подключения» и запустите инициализацию данных.
          </p>
        </Panel>
      ) : (
        <AiAuthorsGrid authors={authors} />
      )}

      <Panel title="Как работают ИИ-авторы" className="mt-5">
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          Каждый ИИ-автор — это отдельный архетип со своим голосом, подходом и набором тем. Кроны в разделе «Генерация
          статей» вызывают этих авторов по расписанию. Материалы учитывают ИИ-требования (AEO / SEO / GEO и соответствие
          РКН) и проходят модерацию перед публикацией.
        </p>
      </Panel>
    </div>
  );
}
