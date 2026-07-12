"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Rss, Play, Trash2, Plus, Check, X, ExternalLink } from "lucide-react";
import { Panel, AdminButton, Tag, KpiCard } from "@/components/admin/ui";
import { NEWS_CATEGORIES, newsCategoryName } from "@/lib/taxonomy";
import { formatDate } from "@/lib/utils";
import {
  runNewsNow,
  toggleNewsSource,
  addNewsSource,
  deleteNewsSource,
  publishNews,
  discardNews,
} from "../ai-content/actions";

type Source = {
  id: string;
  name: string;
  url: string;
  category: string;
  active: boolean;
  itemsIngested: number;
  lastFetchedAt: string | null;
};
type Run = { id: number; status: string; fetched: number; created: number; message: string; startedAt: string };
type QueueItem = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  source: string;
  sourceUrl: string | null;
  originalTitle: string | null;
  publishedAt: string;
};

export function NewsbotWorkspace({
  sources,
  runs,
  queue,
}: {
  sources: Source[];
  runs: Run[];
  queue: QueueItem[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", category: "business" });

  function act(fn: () => Promise<unknown>) {
    setMsg(null);
    start(async () => {
      const r = (await fn()) as { message?: string; created?: number } | undefined;
      if (r?.message) setMsg(`${r.message}${typeof r.created === "number" ? ` · создано: ${r.created}` : ""}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <KpiCard label="Источников активно" value={String(sources.filter((s) => s.active).length)} />
        <KpiCard label="Всего источников" value={String(sources.length)} />
        <KpiCard label="В очереди модерации" value={String(queue.length)} />
        <KpiCard label="Всего собрано" value={String(sources.reduce((n, s) => n + s.itemsIngested, 0))} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <AdminButton disabled={pending} onClick={() => act(() => runNewsNow())}>
          <Play size={16} /> Запустить сбор сейчас
        </AdminButton>
        {pending && <span className="text-sm text-[var(--muted-foreground)]">Сбор и рерайт могут занять минуту…</span>}
        {msg && <Tag tone="primary">{msg}</Tag>}
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Sources */}
        <Panel
          title="Источники (RU)"
          className="lg:col-span-2"
          action={
            <AdminButton variant="ghost" onClick={() => setShowAdd((v) => !v)}>
              <Plus size={15} /> Источник
            </AdminButton>
          }
        >
          {showAdd && (
            <div className="mb-4 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-3">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Название"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="URL RSS-ленты"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                {NEWS_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <AdminButton
                disabled={pending || !form.name.trim() || !form.url.trim()}
                onClick={() =>
                  act(async () => {
                    await addNewsSource(form.name.trim(), form.url.trim(), form.category);
                    setForm({ name: "", url: "", category: "business" });
                    setShowAdd(false);
                  })
                }
                className="w-full"
              >
                Добавить
              </AdminButton>
            </div>
          )}
          <ul className="space-y-2">
            {sources.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)]">
                    <Rss className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[var(--foreground)]">{s.name}</div>
                    <div className="truncate text-xs text-[var(--muted-foreground)]">
                      {s.itemsIngested} собрано · {s.lastFetchedAt ? formatDate(s.lastFetchedAt) : "ещё не запускался"}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => act(() => toggleNewsSource(s.id, !s.active))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      s.active ? "bg-[var(--primary)]" : "bg-[var(--surface-3)]"
                    }`}
                    aria-label={s.active ? "Выключить" : "Включить"}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        s.active ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <button
                    title="Удалить"
                    className="rounded-md border border-[var(--border)] p-1.5 text-[var(--danger)] hover:bg-[var(--muted)]"
                    onClick={() => {
                      if (confirm(`Удалить источник «${s.name}»?`)) act(() => deleteNewsSource(s.id));
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Moderation queue */}
        <Panel title={`Очередь модерации (${queue.length})`} className="lg:col-span-3">
          {queue.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
              Очередь пуста. Запустите сбор — переписанные новости появятся здесь для одобрения.
            </p>
          ) : (
            <div className="space-y-3">
              {queue.map((q) => (
                <div key={q.id} className="rounded-xl border border-[var(--border)] p-4">
                  <div className="flex items-center gap-2">
                    <Tag tone="primary">{newsCategoryName(q.category)}</Tag>
                    <span className="text-xs text-[var(--muted-foreground)]">{q.source}</span>
                    {q.sourceUrl && (
                      <a
                        href={q.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-xs text-[var(--primary)] hover:underline"
                      >
                        источник <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                  <h3 className="mt-1.5 font-serif text-lg font-bold text-[var(--foreground)]">{q.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted-foreground)]">{q.excerpt}</p>
                  <div className="mt-3 flex gap-2">
                    <AdminButton disabled={pending} onClick={() => act(() => publishNews(q.id))}>
                      <Check size={15} /> Опубликовать
                    </AdminButton>
                    <AdminButton variant="ghost" disabled={pending} onClick={() => act(() => discardNews(q.id))}>
                      <X size={15} /> Отклонить
                    </AdminButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Runs log */}
      <Panel title="Журнал запусков">
        {runs.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">Запусков ещё не было.</p>
        ) : (
          <div className="space-y-2">
            {runs.map((r) => (
              <div key={r.id} className="flex items-center gap-3 border-b border-[var(--border)] py-2 text-sm last:border-0">
                {r.status === "ok" ? <Tag tone="success">OK</Tag> : <Tag tone="danger">Ошибка</Tag>}
                <span className="text-[var(--muted-foreground)]">
                  собрано {r.fetched}, создано {r.created}
                </span>
                <span className="flex-1 truncate text-[var(--foreground)]">{r.message}</span>
                <span className="shrink-0 text-xs text-[var(--muted-foreground)]">{formatDate(r.startedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
