import { PageHeader, Panel, KpiCard } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { authors as authorsTable } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { AuthorsEliteGrid } from "./AuthorsEliteGrid";

export const metadata = { title: "Авторы и Elite — Rusability" };
export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage() {
  const [rows, me] = await Promise.all([
    db.select().from(authorsTable).orderBy(asc(authorsTable.name)),
    getCurrentUser(),
  ]);

  const authors = rows.map((a) => ({
    id: a.id,
    name: a.name,
    username: a.username,
    avatar: a.avatar,
    archetype: a.archetype ?? "",
    elite: a.elite,
    articlesCount: a.articlesCount,
    isAi: !a.userId,
  }));

  const eliteCount = authors.filter((a) => a.elite).length;
  const canEdit = me?.role === "superadmin";

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Авторы и Elite"
        subtitle={`${authors.length} авторов · ${eliteCount} Elite`}
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Всего авторов" value={String(authors.length)} />
        <KpiCard label="Elite-авторов" value={String(eliteCount)} />
        <KpiCard label="ИИ-авторов" value={String(authors.filter((a) => a.isAi).length)} />
        <KpiCard label="Живых авторов" value={String(authors.filter((a) => !a.isAi).length)} />
      </div>

      {!canEdit && (
        <Panel className="mb-5">
          <p className="text-sm text-[var(--muted-foreground)]">
            Только супер-администратор может назначать статус Elite. Вы видите список в режиме
            просмотра.
          </p>
        </Panel>
      )}

      <AuthorsEliteGrid authors={authors} canEdit={canEdit} />

      <Panel title="Что даёт статус Elite" className="mt-5">
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          Elite-авторы получают премиальное тёмное оформление карточек с золотым бейджем,
          безлимитные ИИ-кредиты и приоритет в блоках «Выбор редакции». Статьи Elite-авторов
          показывают оценки SEO / AEO / GEO.
        </p>
      </Panel>
    </div>
  );
}
