import { UserPlus } from "lucide-react";
import { PageHeader, Panel, Tag, AdminButton, Table, Th, Td, KpiCard } from "@/components/admin/ui";
import { PLATFORM_USERS } from "@/lib/mock";

export const metadata = { title: "Пользователи — Rusability" };

const ROLE_TONE = {
  Читатель: "neutral",
  Автор: "primary",
  Редактор: "gold",
  Админ: "success",
} as const;

export default function AdminUsersPage() {
  const premium = PLATFORM_USERS.filter((u) => u.plan === "Premium").length;
  const authors = PLATFORM_USERS.filter((u) => u.role === "Автор" || u.role === "Редактор").length;

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Пользователи"
        subtitle={`${PLATFORM_USERS.length} аккаунтов · ${premium} Premium`}
        action={<AdminButton variant="primary"><UserPlus className="h-4 w-4" /> Пригласить</AdminButton>}
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Всего аккаунтов" value="12 480" />
        <KpiCard label="Premium-подписчиков" value="4 820" delta="6,2%" deltaUp />
        <KpiCard label="Авторов и редакторов" value={String(authors)} />
        <KpiCard label="Заблокировано" value={String(PLATFORM_USERS.filter((u) => u.status === "banned").length)} />
      </div>

      <Panel>
        <Table>
          <thead>
            <tr>
              <Th>Пользователь</Th>
              <Th>Роль</Th>
              <Th>Тариф</Th>
              <Th>Регистрация</Th>
              <Th className="text-right">Статьи</Th>
            </tr>
          </thead>
          <tbody>
            {PLATFORM_USERS.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-[var(--muted)]">
                <Td>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-sm font-bold text-[var(--primary)]">
                      {u.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="truncate">{u.name}</span>
                        {u.status === "banned" && <Tag tone="danger">Бан</Tag>}
                      </div>
                      <div className="truncate text-xs text-[var(--muted-foreground)]">{u.email}</div>
                    </div>
                  </div>
                </Td>
                <Td><Tag tone={ROLE_TONE[u.role]}>{u.role}</Tag></Td>
                <Td>
                  <Tag tone={u.plan === "Premium" ? "gold" : "neutral"}>{u.plan}</Tag>
                </Td>
                <Td className="whitespace-nowrap text-[var(--muted-foreground)]">{u.joined}</Td>
                <Td className="text-right">{u.articles}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
