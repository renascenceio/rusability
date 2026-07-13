"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Rss, Play, Trash2, Plus, Check, X, ExternalLink, Pencil, PenLine, Ban } from "lucide-react";
import { Panel, AdminButton, Tag } from "@/components/admin/ui";
import { NEWS_CATEGORIES, newsCategoryName } from "@/lib/taxonomy";
import { formatDate } from "@/lib/utils";
import {
  runNewsNow,
  runNewsWriteNow,
  toggleNewsSource,
  addNewsSource,
  deleteNewsSource,
  publishNews,
  discardNews,
  removeNewsItem,
  blockNewsTopic,
  unblockNewsTopic,
  addNewsBlockedTerm,
} from "@/app/admin/ai-content/actions";

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
type PipelineItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  source: string;
  sourceUrl: string | null;
  originalTitle: string | null;
  pipeline: string;
  at: string;
};
type FeedItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  source: string;
  pipeline: string;
  publishedAt: string;
};

type TabKey = "feed" | "sources" | "pipeline" | "log";

const STATUS: Record<string, { label: string; tone: "neutral" | "primary" | "success" | "warn" | "danger" | "gold" }> = {
  queued: { label: "В очереди", tone: "gold" },
  review: { label: "На проверке", tone: "primary" },
  published: { label: "Опубликовано", tone: "success" },
  rejected: { label: "Отклонено ИИ", tone: "danger" },
};

function initials(name: string) {
  return name.replace(/[^A-Za-zА-Яа-я0-9]/g, "").slice(0, 3).toUpperCase() || "SRC";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ч назад`;
  return formatDate(iso);
}

/** Suggest a stop-term from a headline: prefer a capitalised proper noun. */
function suggestTerm(title: string): string {
  const words = title
    .split(/\s+/)
    .map((w) => w.replace(/[^0-9A-Za-zА-Яа-яЁё-]/g, ""))
    .filter((w) => w.length > 3);
  const proper = words.find((w) => /^[А-ЯA-ZЁ]/.test(w));
  return (proper || words[0] || "").toLowerCase();
}

export function NewsbotWorkspace({
  sources,
  runs,
  pipeline,
  feed,
  blockedTerms,
  totalPublished,
  publishedToday,
  reviewCount,
  writeQueueCount,
  rejectedCount,
}: {
  sources: Source[];
  runs: Run[];
  pipeline: PipelineItem[];
  feed: FeedItem[];
  blockedTerms: string[];
  totalPublished: number;
  publishedToday: number;
  reviewCount: number;
  writeQueueCount: number;
  rejectedCount: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("feed");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", category: "business" });
  const [statusFilter, setStatusFilter] = useState<"all" | "queued" | "review" | "published" | "rejected">("all");
  const [blockingId, setBlockingId] = useState<string | null>(null);
  const [blockTerm, setBlockTerm] = useState("");
  const [newTerm, setNewTerm] = useState("");

  function act(fn: () => Promise<unknown>) {
    setMsg(null);
    start(async () => {
      const r = (await fn()) as { message?: string; created?: number } | undefined;
      if (r?.message) setMsg(`${r.message}${typeof r.created === "number" ? ` · создано: ${r.created}` : ""}`);
      router.refresh();
    });
  }

  const filteredPipeline = useMemo(
    () => (statusFilter === "all" ? pipeline : pipeline.filter((p) => p.pipeline === statusFilter)),
    [pipeline, statusFilter],
  );

  const tabs: { key: TabKey; label: string; badge?: number }[] = [
    { key: "feed", label: "Лента" },
    { key: "sources", label: "Источники" },
    { key: "pipeline", label: "Конвейер", badge: writeQueueCount },
    { key: "log", label: "Журнал" },
  ];

  const statusFilters: { key: typeof statusFilter; label: string; n: number }[] = [
    { key: "all", label: "Все", n: pipeline.length },
    { key: "queued", label: "В очереди", n: writeQueueCount },
    { key: "review", label: "На проверке", n: reviewCount },
    { key: "published", label: "Опубликовано", n: totalPublished },
    { key: "rejected", label: "Отклонено", n: rejectedCount },
  ];

  return (
    <div className="space-y-6">
      {/* Header row: status + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Tag tone="success">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[var(--success)]" /> Работает
          </Tag>
          {pending && <span className="text-sm text-[var(--muted-foreground)]">Обработка…</span>}
          {msg && <Tag tone="primary">{msg}</Tag>}
        </div>
        <div className="flex items-center gap-2">
          <AdminButton variant="ghost" disabled={pending} onClick={() => act(() => runNewsNow())}>
            <Play size={16} /> Запустить сбор
          </AdminButton>
          <AdminButton
            variant="ghost"
            disabled={pending || writeQueueCount === 0}
            onClick={() => act(() => runNewsWriteNow())}
            title="Переписать и опубликовать собранные новости из очереди"
          >
            <PenLine size={16} /> Написать из очереди
            {writeQueueCount > 0 && (
              <span className="ml-1 rounded-full bg-[var(--gold)]/20 px-1.5 py-0.5 text-[11px] font-semibold text-[var(--gold)]">
                {writeQueueCount}
              </span>
            )}
          </AdminButton>
          <AdminButton
            variant="primary"
            onClick={() => {
              setTab("sources");
              setShowAdd(true);
            }}
          >
            <Plus size={16} /> Источник
          </AdminButton>
        </div>
      </div>

      {/* KPI row — real pipeline statuses */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard value={totalPublished} label="Опубликовано всего" tone="var(--primary)" />
        <StatCard value={publishedToday} label="Опубликовано за 24 часа" tone="var(--success)" />
        <StatCard value={writeQueueCount} label="В очереди на написание" tone="var(--gold)" />
        <StatCard value={rejectedCount} label="Отклонено ИИ" tone="var(--danger)" />
      </div>

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
              <span className="rounded-full bg-[var(--gold)]/20 px-1.5 py-0.5 text-[11px] font-semibold text-[var(--gold)]">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ---- FEED ---- */}
      {tab === "feed" && (
        <Panel title="Последние материалы">
          {feed.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
              Пока пусто. Запустите сбор — материалы появятся здесь.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {feed.map((f) => {
                const inReview = f.pipeline === "review";
                return (
                  <li key={f.id} className="flex items-center gap-4 py-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-3)] text-[11px] font-bold text-[var(--muted-foreground)]">
                      {initials(f.source)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-[var(--foreground)]">{f.title}</div>
                      <div className="truncate text-xs text-[var(--muted-foreground)]">
                        {f.source} · {inReview ? "переписывается…" : "переписана"} · {timeAgo(f.publishedAt)}
                      </div>
                    </div>
                    <span className="hidden shrink-0 text-sm text-[var(--muted-foreground)] sm:block">
                      {newsCategoryName(f.category)}
                    </span>
                    {inReview ? <Tag tone="gold">Пишу</Tag> : <Tag tone="success">Опубл.</Tag>}
                    {inReview ? (
                      <AdminButton variant="ghost" disabled={pending} onClick={() => act(() => discardNews(f.id))}>
                        Пропустить
                      </AdminButton>
                    ) : (
                      <AdminButton variant="ghost" href={`/news/${f.slug}`}>
                        <Pencil size={14} /> Правка
                      </AdminButton>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      )}

      {/* ---- SOURCES ---- */}
      {tab === "sources" && (
        <Panel
          title={`Источники (${sources.length})`}
          action={
            <AdminButton variant="ghost" onClick={() => setShowAdd((v) => !v)}>
              <Plus size={15} /> Источник
            </AdminButton>
          }
        >
          {showAdd && (
            <div className="mb-4 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
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
          {sources.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
              Нет источников. Добавьте RSS-ленту, чтобы бот начал собирать новости.
            </p>
          ) : (
            <ul className="space-y-2">
              {sources.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-3)] text-[var(--muted-foreground)]">
                      <Rss className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[var(--foreground)]">
                        {s.name}
                        <span className="ml-2 font-normal text-[var(--muted-foreground)]">
                          {newsCategoryName(s.category)}
                        </span>
                      </div>
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
                      className="rounded-md border border-[var(--border)] p-1.5 text-[var(--danger)] hover:bg-[var(--surface-2)]"
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
          )}
        </Panel>
      )}

      {/* ---- PIPELINE (conveyor: what's gathered + statuses + wrong-topic) ---- */}
      {tab === "pipeline" && (
        <div className="space-y-4">
          {/* Blocked topics manager */}
          <Panel title="Заблокированные темы">
            <p className="mb-3 text-sm text-[var(--muted-foreground)]">
              Темы, которые бот больше не собирает. Отметьте «Неверная тема» у любого материала ниже — его ключевое
              слово попадёт сюда, и такие новости перестанут появляться.
            </p>
            {blockedTerms.length > 0 ? (
              <div className="mb-3 flex flex-wrap gap-2">
                {blockedTerms.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-sm text-[var(--foreground)]"
                  >
                    {t}
                    <button
                      title="Разблокировать"
                      disabled={pending}
                      onClick={() => act(() => unblockNewsTopic(t))}
                      className="text-[var(--muted-foreground)] hover:text-[var(--danger)]"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mb-3 text-sm text-[var(--muted-foreground)]">Пока нет заблокированных тем.</p>
            )}
            <div className="flex gap-2">
              <input
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                placeholder="Добавить стоп-слово или тему вручную…"
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
              <AdminButton
                variant="ghost"
                disabled={pending || !newTerm.trim()}
                onClick={() =>
                  act(async () => {
                    const r = await addNewsBlockedTerm(newTerm.trim());
                    setNewTerm("");
                    return r;
                  })
                }
              >
                <Ban size={15} /> Заблокировать
              </AdminButton>
            </div>
          </Panel>

          <Panel title={`Конвейер новостей (${filteredPipeline.length})`}>
            {/* Status filter chips */}
            <div className="mb-4 flex flex-wrap gap-2">
              {statusFilters.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStatusFilter(s.key)}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                    statusFilter === s.key
                      ? "bg-[var(--primary)] text-white"
                      : "border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {s.label} <span className="opacity-70">{s.n}</span>
                </button>
              ))}
            </div>

            {filteredPipeline.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                Нет материалов в этом статусе. Запустите сбор — собранные новости появятся здесь.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {filteredPipeline.map((it) => {
                  const st = STATUS[it.pipeline] ?? STATUS.published;
                  const isPublished = it.pipeline === "published";
                  const isReview = it.pipeline === "review";
                  const displayTitle = it.pipeline === "queued" ? it.originalTitle || it.title : it.title;
                  const blocking = blockingId === it.id;
                  return (
                    <li key={it.id} className="py-3.5">
                      <div className="flex items-center gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-3)] text-[11px] font-bold text-[var(--muted-foreground)]">
                          {initials(it.source)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-[var(--foreground)]">{displayTitle}</div>
                          <div className="flex items-center gap-2 truncate text-xs text-[var(--muted-foreground)]">
                            <span>{it.source}</span>
                            <span>·</span>
                            <span>{newsCategoryName(it.category)}</span>
                            <span>·</span>
                            <span>{timeAgo(it.at)}</span>
                            {it.sourceUrl && (
                              <a
                                href={it.sourceUrl}
                                target="_blank"
                                rel="nofollow noopener noreferrer"
                                className="inline-flex items-center gap-0.5 text-[var(--primary)] hover:underline"
                              >
                                источник <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                        </div>
                        <Tag tone={st.tone}>{st.label}</Tag>
                        <div className="flex shrink-0 items-center gap-1">
                          {isPublished && (
                            <AdminButton variant="ghost" href={`/news/${it.slug}`}>
                              <ExternalLink size={14} /> Открыть
                            </AdminButton>
                          )}
                          {isReview && (
                            <AdminButton variant="ghost" disabled={pending} onClick={() => act(() => publishNews(it.id))}>
                              <Check size={14} /> Опубликовать
                            </AdminButton>
                          )}
                          <AdminButton
                            variant="ghost"
                            disabled={pending}
                            title="Сообщить боту, что такие новости собирать не нужно"
                            onClick={() => {
                              setBlockingId(blocking ? null : it.id);
                              setBlockTerm(suggestTerm(it.originalTitle || it.title));
                            }}
                          >
                            <Ban size={14} /> Неверная тема
                          </AdminButton>
                          <button
                            title="Убрать"
                            disabled={pending}
                            className="rounded-md border border-[var(--border)] p-1.5 text-[var(--danger)] hover:bg-[var(--surface-2)]"
                            onClick={() => act(() => removeNewsItem(it.id))}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Inline "wrong topic" editor */}
                      {blocking && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                          <span className="text-sm text-[var(--muted-foreground)]">Не собирать новости про:</span>
                          <input
                            value={blockTerm}
                            onChange={(e) => setBlockTerm(e.target.value)}
                            className="min-w-[180px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm"
                          />
                          <AdminButton
                            disabled={pending || !blockTerm.trim()}
                            onClick={() =>
                              act(async () => {
                                const r = await blockNewsTopic(it.id, blockTerm.trim());
                                setBlockingId(null);
                                return r;
                              })
                            }
                          >
                            <Ban size={14} /> Заблокировать тему
                          </AdminButton>
                          <AdminButton variant="ghost" onClick={() => setBlockingId(null)}>
                            Отмена
                          </AdminButton>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      )}

      {/* ---- LOG ---- */}
      {tab === "log" && (
        <Panel title="Журнал запусков">
          {runs.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">Запусков ещё не было.</p>
          ) : (
            <div className="space-y-2">
              {runs.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 border-b border-[var(--border)] py-2 text-sm last:border-0"
                >
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
      )}
    </div>
  );
}

function StatCard({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="font-serif text-3xl font-bold" style={{ color: tone }}>
        {value}
      </div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{label}</div>
    </div>
  );
}
