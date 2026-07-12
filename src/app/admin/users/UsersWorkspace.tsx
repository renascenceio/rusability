"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ShieldCheck, Crown, Bot } from "lucide-react";
import { Panel, Table, Th, Td, Tag, AdminButton } from "@/components/admin/ui";
import { glyphAvatar } from "@/lib/avatar";
import { AuthorsEliteGrid } from "../authors/AuthorsEliteGrid";
import { banUser, unbanUser, setUserRole } from "./actions";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  banReason: string | null;
  rknStrikes: number;
  joined: string;
  isAuthor: boolean;
  articles: number;
  avatar: string;
  elite: boolean;
};
type AuthorRow = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  archetype: string;
  elite: boolean;
  articlesCount: number;
  isAi: boolean;
};

type TabKey = "all" | "authors" | "banned";

const ROLES: { value: string; label: string }[] = [
  { value: "reader", label: "Читатель" },
  { value: "author", label: "Автор" },
  { value: "editor", label: "Редактор" },
  { value: "admin", label: "Админ" },
  { value: "superadmin", label: "Супер-админ" },
];

function roleLabel(role: string) {
  return ROLES.find((r) => r.value === role)?.label ?? "Читатель";
}
function roleTone(role: string): "neutral" | "primary" | "gold" | "success" {
  if (role === "admin" || role === "superadmin") return "success";
  if (role === "editor") return "gold";
  if (role === "author") return "primary";
  return "neutral";
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

export function UsersWorkspace({
  users,
  authors,
  canEditRoles,
  canModerate,
}: {
  users: UserRow[];
  authors: AuthorRow[];
  canEditRoles: boolean;
  canModerate: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("all");
  const [pending, start] = useTransition();
  const [query, setQuery] = useState("");

  const banned = users.filter((u) => u.banned);
  const tabs: { key: TabKey; label: string; badge?: number }[] = [
    { key: "all", label: "Все пользователи" },
    { key: "authors", label: "Авторы", badge: authors.length },
    { key: "banned", label: "Заблокированные", badge: banned.length },
  ];

  function act(fn: () => Promise<unknown>) {
    start(async () => {
      await fn();
      router.refresh();
    });
  }

  const visible = (tab === "banned" ? banned : users).filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--border)]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative -mb-px flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "border-b-2 border-[var(--primary)] text-[var(--foreground)]"
                : "border-b-2 border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {t.label}
            {typeof t.badge === "number" && t.badge > 0 && (
              <span className="rounded-full bg-[var(--surface-3)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)]">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "authors" ? (
        <AuthorsEliteGrid authors={authors} canEdit={canEditRoles} />
      ) : (
        <Panel>
          <div className="mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по имени или email…"
              className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
            />
          </div>

          {tab === "banned" && banned.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--muted-foreground)]">
              Заблокированных пользователей нет. Блокировка наступает автоматически при 3 нарушениях
              по запрещённым в РФ темам или вручную администратором.
            </p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Пользователь</Th>
                  <Th>Роль</Th>
                  <Th>Регистрация</Th>
                  <Th className="text-right">Статьи</Th>
                  <Th className="text-right">РКН</Th>
                  <Th className="text-right">Действия</Th>
                </tr>
              </thead>
              <tbody>
                {visible.map((u) => {
                  const avatar = u.avatar?.trim() ? u.avatar : glyphAvatar(u.name, { elite: u.elite });
                  return (
                    <tr key={u.id} className="transition-colors hover:bg-[var(--muted)]">
                      <Td>
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={avatar} alt={u.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 font-medium">
                              <span className="truncate">{u.name}</span>
                              {u.elite && <Crown className="h-3.5 w-3.5 shrink-0 text-[var(--gold)]" />}
                              {u.banned && <Tag tone="danger">Бан</Tag>}
                            </div>
                            <div className="truncate text-xs text-[var(--muted-foreground)]">{u.email}</div>
                            {u.banned && u.banReason && (
                              <div className="truncate text-xs text-[var(--danger)]">{u.banReason}</div>
                            )}
                          </div>
                        </div>
                      </Td>
                      <Td>
                        {canEditRoles ? (
                          <select
                            value={u.role}
                            disabled={pending}
                            onChange={(e) => act(() => setUserRole(u.id, e.target.value))}
                            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs"
                          >
                            {ROLES.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Tag tone={roleTone(u.role)}>{roleLabel(u.role)}</Tag>
                        )}
                      </Td>
                      <Td className="whitespace-nowrap text-[var(--muted-foreground)]">{fmtDate(u.joined)}</Td>
                      <Td className="text-right">{u.isAuthor ? u.articles : "—"}</Td>
                      <Td className="text-right">
                        {u.rknStrikes > 0 ? (
                          <Tag tone={u.rknStrikes >= 3 ? "danger" : "warn"}>{u.rknStrikes}/3</Tag>
                        ) : (
                          <span className="text-[var(--muted-foreground)]">0</span>
                        )}
                      </Td>
                      <Td className="text-right">
                        {canModerate ? (
                          u.banned ? (
                            <AdminButton
                              variant="ghost"
                              disabled={pending}
                              onClick={() => act(() => unbanUser(u.id))}
                            >
                              <ShieldCheck size={14} /> Разблокировать
                            </AdminButton>
                          ) : (
                            <AdminButton
                              variant="outline"
                              disabled={pending}
                              onClick={() => {
                                const reason = prompt(`Причина блокировки «${u.name}»:`, "Нарушение правил");
                                if (reason !== null) act(() => banUser(u.id, reason));
                              }}
                            >
                              <ShieldAlert size={14} /> Заблокировать
                            </AdminButton>
                          )
                        ) : (
                          <span className="text-xs text-[var(--muted-foreground)]">—</span>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Panel>
      )}

      {/* Ban-policy explainer */}
      <Panel title="Правила блокировки">
        <div className="flex items-start gap-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
          <Bot className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
          <p>
            Блокировка наступает автоматически, если пользователь опубликовал или попытался
            опубликовать материалы по запрещённым в РФ темам <strong>3 и более раз</strong> — каждое
            нарушение фиксируется счётчиком РКН. Администратор также может заблокировать аккаунт
            вручную. Разблокировка сбрасывает счётчик нарушений.
          </p>
        </div>
      </Panel>
    </div>
  );
}
