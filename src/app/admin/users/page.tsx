import { PageHeader, KpiCard } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { user as userTable, authors as authorsTable, articles } from "@/lib/db/schema";
import { asc, eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { UsersWorkspace } from "./UsersWorkspace";

export const metadata = { title: "Пользователи — Rusability" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [userRows, authorRows, me] = await Promise.all([
    db.select().from(userTable).orderBy(asc(userTable.createdAt)),
    db.select().from(authorsTable).orderBy(asc(authorsTable.name)),
    getCurrentUser(),
  ]);

  // Count published articles per author user, so a "user" who never published
  // stays a plain user (per the rule: a user is a user until the first piece).
  const counts = await db
    .select({ authorId: articles.authorId, n: sql<number>`count(*)::int` })
    .from(articles)
    .where(eq(articles.status, "published"))
    .groupBy(articles.authorId);
  const countByAuthor = new Map(counts.map((c) => [c.authorId, c.n]));

  // Map author rows by their linked userId to know who has authored.
  const authorByUser = new Map(authorRows.filter((a) => a.userId).map((a) => [a.userId as string, a]));

  const users = userRows.map((u) => {
    const author = authorByUser.get(u.id);
    const published = author ? countByAuthor.get(author.id) ?? 0 : 0;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role ?? "reader",
      banned: Boolean(u.banned),
      banReason: u.banReason ?? null,
      rknStrikes: u.rknStrikes ?? 0,
      joined: u.createdAt.toISOString(),
      isAuthor: Boolean(author) && published > 0,
      articles: published,
      avatar: author?.avatar ?? u.image ?? "",
      elite: author?.elite ?? false,
    };
  });

  const authors = authorRows.map((a) => ({
    id: a.id,
    name: a.name,
    username: a.username,
    avatar: a.avatar,
    archetype: a.archetype ?? "",
    elite: a.elite,
    articlesCount: a.articlesCount,
    isAi: !a.userId,
  }));

  const bannedCount = users.filter((u) => u.banned).length;
  const authorCount = users.filter((u) => u.isAuthor).length;
  const canEditRoles = me?.role === "superadmin";
  const canModerate = me?.role === "superadmin" || me?.role === "admin";

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Пользователи"
        subtitle={`${users.length} аккаунтов · ${authorCount} авторов · ${bannedCount} заблокировано`}
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Всего аккаунтов" value={String(users.length)} />
        <KpiCard label="Авторов" value={String(authorCount)} />
        <KpiCard label="ИИ-авторов" value={String(authors.filter((a) => a.isAi).length)} />
        <KpiCard label="Заблокировано" value={String(bannedCount)} />
      </div>

      <UsersWorkspace
        users={users}
        authors={authors}
        canEditRoles={canEditRoles}
        canModerate={canModerate}
      />
    </div>
  );
}
