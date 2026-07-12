"use client";

import { useState, useTransition } from "react";
import { Crown, Loader2, Bot } from "lucide-react";
import { Panel, Table, Th, Td, Tag } from "@/components/admin/ui";
import { resolveAvatar } from "@/lib/avatar";
import { setAuthorElite } from "./actions";

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

export function AuthorsEliteGrid({
  authors,
  canEdit,
}: {
  authors: AuthorRow[];
  canEdit: boolean;
}) {
  const [rows, setRows] = useState(authors);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = rows.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.username.toLowerCase().includes(query.toLowerCase()),
  );

  function toggle(a: AuthorRow) {
    if (!canEdit || pending) return;
    const next = !a.elite;
    setBusyId(a.id);
    setRows((prev) => prev.map((r) => (r.id === a.id ? { ...r, elite: next } : r)));
    startTransition(async () => {
      const res = await setAuthorElite(a.id, next);
      if (!res.ok) {
        setRows((prev) => prev.map((r) => (r.id === a.id ? { ...r, elite: !next } : r)));
      }
      setBusyId(null);
    });
  }

  return (
    <Panel>
      <div className="mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по имени или нику…"
          className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
        />
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Автор</Th>
            <Th>Тип</Th>
            <Th className="text-right">Статьи</Th>
            <Th className="text-right">Elite</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((a) => {
            const avatar = resolveAvatar({ avatar: a.avatar, name: a.name, elite: a.elite });
            return (
              <tr key={a.id} className="transition-colors hover:bg-[var(--muted)]">
                <Td>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatar} alt={a.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="truncate">{a.name}</span>
                        {a.elite && (
                          <Crown className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                        )}
                      </div>
                      <div className="truncate text-xs text-[var(--muted-foreground)]">
                        @{a.username}
                        {a.archetype ? ` · ${a.archetype}` : ""}
                      </div>
                    </div>
                  </div>
                </Td>
                <Td>
                  {a.isAi ? (
                    <Tag tone="primary">
                      <Bot className="h-3 w-3" /> ИИ
                    </Tag>
                  ) : (
                    <Tag tone="neutral">Живой</Tag>
                  )}
                </Td>
                <Td className="text-right">{a.articlesCount}</Td>
                <Td className="text-right">
                  <button
                    type="button"
                    disabled={!canEdit || (pending && busyId === a.id)}
                    onClick={() => toggle(a)}
                    aria-pressed={a.elite}
                    className={[
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                      a.elite ? "bg-[var(--accent)]" : "bg-[var(--surface-3)]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                        a.elite ? "translate-x-[22px]" : "translate-x-0.5",
                      ].join(" ")}
                    />
                    {pending && busyId === a.id && (
                      <Loader2 className="absolute -right-6 top-1 h-4 w-4 animate-spin text-[var(--muted-foreground)]" />
                    )}
                  </button>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Panel>
  );
}
