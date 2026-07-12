"use client";

import { useMemo, useState, useTransition } from "react";
import { Mail, Archive, Trash2, CornerUpLeft, Check, Inbox } from "lucide-react";
import { PageHeader, Panel, Tag, AdminButton, KpiCard } from "@/components/admin/ui";
import { setMessageStatus, deleteMessage } from "@/app/admin/messages/actions";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
};

type Filter = "new" | "read" | "archived" | "all";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "new", label: "Новые" },
  { id: "read", label: "Прочитанные" },
  { id: "archived", label: "Архив" },
  { id: "all", label: "Все" },
];

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessagesWorkspace({ messages }: { messages: ContactMessage[] }) {
  const [list, setList] = useState(messages);
  const [filter, setFilter] = useState<Filter>("new");
  const [openId, setOpenId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const counts = useMemo(
    () => ({
      new: list.filter((m) => m.status === "new").length,
      read: list.filter((m) => m.status === "read").length,
      archived: list.filter((m) => m.status === "archived").length,
      all: list.length,
    }),
    [list],
  );

  const visible = useMemo(
    () => (filter === "all" ? list : list.filter((m) => m.status === filter)),
    [list, filter],
  );

  function updateStatus(id: string, status: ContactMessage["status"]) {
    setList((l) => l.map((m) => (m.id === id ? { ...m, status } : m)));
    startTransition(async () => {
      await setMessageStatus(id, status);
    });
  }

  function remove(id: string) {
    setList((l) => l.filter((m) => m.id !== id));
    if (openId === id) setOpenId(null);
    startTransition(async () => {
      await deleteMessage(id);
    });
  }

  function toggleOpen(m: ContactMessage) {
    const next = openId === m.id ? null : m.id;
    setOpenId(next);
    if (next && m.status === "new") updateStatus(m.id, "read");
  }

  return (
    <div>
      <PageHeader
        title="Сообщения"
        subtitle="Обращения из формы обратной связи · доступно только суперадмину"
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Новые" value={String(counts.new)} />
        <KpiCard label="Прочитанные" value={String(counts.read)} />
        <KpiCard label="Всего" value={String(counts.all)} />
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              filter === f.id
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {f.label}
            <span className="ml-1.5 opacity-70">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Panel>
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)]">
              <Inbox className="h-6 w-6 text-[var(--muted-foreground)]" />
            </span>
            <p className="text-sm text-[var(--muted-foreground)]">Здесь пока нет сообщений.</p>
          </div>
        </Panel>
      ) : (
        <div className="flex flex-col gap-2.5">
          {visible.map((m) => {
            const open = openId === m.id;
            return (
              <div
                key={m.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-colors"
              >
                <button
                  onClick={() => toggleOpen(m)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  {m.status === "new" && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`truncate text-sm ${
                          m.status === "new"
                            ? "font-bold text-[var(--foreground)]"
                            : "font-medium text-[var(--foreground)]"
                        }`}
                      >
                        {m.name}
                      </span>
                      {m.status === "archived" && <Tag tone="neutral">архив</Tag>}
                    </div>
                    <p className="truncate text-[13px] text-[var(--muted-foreground)]">
                      {m.subject || m.message}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-[var(--faint)]">{fmtDate(m.createdAt)}</span>
                </button>

                {open && (
                  <div className="border-t border-[var(--border)] px-4 py-4">
                    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[var(--muted-foreground)]">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        <a
                          href={`mailto:${m.email}`}
                          className="text-[var(--primary)] hover:underline"
                        >
                          {m.email}
                        </a>
                      </span>
                    </div>
                    {m.subject && (
                      <p className="mb-1 text-sm font-semibold text-[var(--foreground)]">
                        {m.subject}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
                      {m.message}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent(
                          `Re: ${m.subject || "Ваше обращение в Rusability"}`,
                        )}`}
                      >
                        <AdminButton variant="primary">
                          <CornerUpLeft className="h-4 w-4" /> Ответить
                        </AdminButton>
                      </a>
                      {m.status !== "read" && (
                        <AdminButton onClick={() => updateStatus(m.id, "read")}>
                          <Check className="h-4 w-4" /> Прочитано
                        </AdminButton>
                      )}
                      {m.status !== "archived" && (
                        <AdminButton onClick={() => updateStatus(m.id, "archived")}>
                          <Archive className="h-4 w-4" /> В архив
                        </AdminButton>
                      )}
                      <AdminButton onClick={() => remove(m.id)}>
                        <Trash2 className="h-4 w-4" /> Удалить
                      </AdminButton>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
