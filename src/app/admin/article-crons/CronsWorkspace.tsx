"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, Pause, Trash2, Plus, Check, X, ListPlus } from "lucide-react";
import { Panel, AdminButton, Tag, Table, Th, Td, KpiCard } from "@/components/admin/ui";
import { CATEGORIES, categoryName } from "@/lib/taxonomy";
import { formatDate } from "@/lib/utils";
import {
  createCron,
  toggleCronStatus,
  deleteCron,
  runCronNow,
  addCronTopics,
  saveContentSettings,
  publishBuffered,
  discardBuffered,
  runAllDueCrons,
} from "../ai-content/actions";

type Cron = {
  id: string;
  name: string;
  authorId: string | null;
  authorName: string | null;
  category: string;
  frequency: string;
  runTime: string;
  minWords: number;
  requiresApproval: boolean;
  status: string;
  lastRunAt: string | null;
  createdAt: string;
  topicsTotal: number;
  topicsUnused: number;
};
type Run = { id: number; cronId: string; status: string; articlesCreated: number; message: string; startedAt: string };
type Buffered = { id: string; title: string; excerpt: string; category: string; authorName: string; bufferReason: string | null; createdAt: string };
type Settings = { minHoursBetween: number; maxPerDay: number; autoPublish: boolean; newsAutoPublish: boolean };
type AuthorOpt = { id: string; name: string; active: boolean; category: string };

const FREQ_LABEL: Record<string, string> = { hourly: "Каждый час", daily: "Ежедневно", weekly: "Еженедельно" };

export function CronsWorkspace({
  crons,
  runs,
  buffered,
  settings,
  authors,
}: {
  crons: Cron[];
  runs: Run[];
  buffered: Buffered[];
  settings: Settings;
  authors: AuthorOpt[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // settings draft
  const [s, setS] = useState(settings);
  // create form
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    authorId: "",
    category: "business",
    frequency: "daily",
    runTime: "09:00",
    minWords: 900,
    requiresApproval: true,
    keywords: "",
  });
  // topics input per cron
  const [topicInput, setTopicInput] = useState<Record<string, string>>({});

  function act(fn: () => Promise<unknown>, label?: string) {
    setBusy(label ?? "x");
    setMsg(null);
    start(async () => {
      try {
        const r = (await fn()) as { message?: string; created?: number } | undefined;
        if (r?.message) setMsg(r.message);
        else if (typeof r?.created === "number") setMsg(`Создано статей: ${r.created}`);
        router.refresh();
      } finally {
        setBusy(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* KPI + global run */}
      <div className="grid gap-4 sm:grid-cols-4">
        <KpiCard label="Активных кронов" value={String(crons.filter((c) => c.status === "active").length)} />
        <KpiCard label="Всего кронов" value={String(crons.length)} />
        <KpiCard label="В буфере (модерация)" value={String(buffered.length)} />
        <KpiCard label="ИИ-авторов активно" value={String(authors.filter((a) => a.active).length)} />
      </div>

      {msg && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--primary-soft)] px-4 py-3 text-sm text-[var(--primary)]">
          {msg}
        </div>
      )}

      {/* Pace settings */}
      <Panel
        title="Темп публикаций"
        action={
          <AdminButton
            variant="ghost"
            disabled={pending}
            onClick={() =>
              act(
                () =>
                  saveContentSettings({
                    minHoursBetween: s.minHoursBetween,
                    maxPerDay: s.maxPerDay,
                    autoPublish: s.autoPublish,
                    newsAutoPublish: s.newsAutoPublish,
                  }),
                "settings",
              )
            }
          >
            Сохранить
          </AdminButton>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            <span className="mb-1.5 block font-semibold text-[var(--foreground)]">Мин. часов между публикациями</span>
            <input
              type="number"
              min={0}
              step={0.5}
              value={s.minHoursBetween}
              onChange={(e) => setS({ ...s, minHoursBetween: Number(e.target.value) })}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block font-semibold text-[var(--foreground)]">Макс. публикаций в день</span>
            <input
              type="number"
              min={1}
              value={s.maxPerDay}
              onChange={(e) => setS({ ...s, maxPerDay: Number(e.target.value) })}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={s.autoPublish}
              onChange={(e) => setS({ ...s, autoPublish: e.target.checked })}
              className="h-4 w-4"
            />
            <span className="font-semibold text-[var(--foreground)]">Автопубликация статей</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={s.newsAutoPublish}
              onChange={(e) => setS({ ...s, newsAutoPublish: e.target.checked })}
              className="h-4 w-4"
            />
            <span className="font-semibold text-[var(--foreground)]">Автопубликация новостей</span>
          </label>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Если автопубликация выключена, все сгенерированные материалы попадают в буфер на модерацию. Темп учитывается только при автопубликации.
        </p>
      </Panel>

      {/* Crons list */}
      <Panel
        title="Кроны генерации"
        action={
          <div className="flex gap-2">
            <AdminButton variant="outline" disabled={pending} onClick={() => act(() => runAllDueCrons(), "all")}>
              Запустить готовые
            </AdminButton>
            <AdminButton onClick={() => setShowCreate((v) => !v)}>
              <Plus size={16} /> Новый крон
            </AdminButton>
          </div>
        }
      >
        {showCreate && (
          <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm">
                <span className="mb-1 block font-semibold">Название</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Например: Ежедневный бизнес-разбор"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-semibold">ИИ-автор</span>
                <select
                  value={form.authorId}
                  onChange={(e) => setForm({ ...form, authorId: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                >
                  <option value="">Ротация всех активных</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-semibold">Рубрика</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-semibold">Частота</span>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                >
                  <option value="hourly">Каждый час</option>
                  <option value="daily">Ежедневно</option>
                  <option value="weekly">Еженедельно</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-semibold">Время запуска (МСК)</span>
                <input
                  type="time"
                  value={form.runTime}
                  onChange={(e) => setForm({ ...form, runTime: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-semibold">Мин. слов</span>
                <input
                  type="number"
                  min={300}
                  value={form.minWords}
                  onChange={(e) => setForm({ ...form, minWords: Number(e.target.value) })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <label className="text-sm sm:col-span-2 lg:col-span-2">
                <span className="mb-1 block font-semibold">Ключевые слова (через запятую)</span>
                <input
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  placeholder="стартап, воронка продаж, unit-экономика"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.requiresApproval}
                  onChange={(e) => setForm({ ...form, requiresApproval: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="font-semibold">Требует одобрения</span>
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <AdminButton
                disabled={pending || !form.name.trim()}
                onClick={() =>
                  act(async () => {
                    await createCron({
                      name: form.name.trim(),
                      authorId: form.authorId || null,
                      category: form.category,
                      frequency: form.frequency,
                      runTime: form.runTime,
                      minWords: form.minWords,
                      requiresApproval: form.requiresApproval,
                      keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
                    });
                    setShowCreate(false);
                    setForm({ ...form, name: "", keywords: "" });
                  }, "create")
                }
              >
                Создать крон
              </AdminButton>
              <AdminButton variant="ghost" onClick={() => setShowCreate(false)}>
                Отмена
              </AdminButton>
            </div>
          </div>
        )}

        {crons.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
            Кронов пока нет. Создайте первый, чтобы запустить автогенерацию статей.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Крон</Th>
                <Th>Автор</Th>
                <Th>Расписание</Th>
                <Th>Темы</Th>
                <Th>Статус</Th>
                <Th>Последний запуск</Th>
                <Th className="text-right">Действия</Th>
              </tr>
            </thead>
            <tbody>
              {crons.map((c) => (
                <tr key={c.id}>
                  <Td>
                    <div className="font-semibold text-[var(--foreground)]">{c.name}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {categoryName(c.category)} · {c.minWords}+ слов · {c.requiresApproval ? "модерация" : "автопубл."}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1">
                      <input
                        value={topicInput[c.id] ?? ""}
                        onChange={(e) => setTopicInput({ ...topicInput, [c.id]: e.target.value })}
                        placeholder="добавить темы через ;"
                        className="w-44 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs"
                      />
                      <button
                        title="Добавить темы"
                        className="rounded-md border border-[var(--border)] p-1 hover:bg-[var(--muted)]"
                        onClick={() =>
                          act(async () => {
                            await addCronTopics(c.id, (topicInput[c.id] ?? "").split(";"));
                            setTopicInput({ ...topicInput, [c.id]: "" });
                          }, `topics-${c.id}`)
                        }
                      >
                        <ListPlus size={14} />
                      </button>
                    </div>
                  </Td>
                  <Td>{c.authorName ?? <span className="text-[var(--muted-foreground)]">ротация</span>}</Td>
                  <Td>
                    <div className="text-sm">{FREQ_LABEL[c.frequency] ?? c.frequency}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{c.runTime} МСК</div>
                  </Td>
                  <Td>
                    <div title="Неиспользованных тем в очереди / всего добавлено тем. Это не число статей.">
                      <span className="text-sm">{c.topicsUnused}</span>
                      <span className="text-xs text-[var(--muted-foreground)]"> / {c.topicsTotal}</span>
                      <div className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">
                        свободно / тем
                      </div>
                    </div>
                  </Td>
                  <Td>
                    {c.status === "active" ? <Tag tone="success">Активен</Tag> : <Tag tone="neutral">Пауза</Tag>}
                  </Td>
                  <Td>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {c.lastRunAt ? formatDate(c.lastRunAt) : "—"}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Запустить сейчас"
                        disabled={pending}
                        className="rounded-md border border-[var(--border)] p-1.5 hover:bg-[var(--muted)] disabled:opacity-50"
                        onClick={() => act(() => runCronNow(c.id), `run-${c.id}`)}
                      >
                        <Play size={15} />
                      </button>
                      <button
                        title={c.status === "active" ? "Пауза" : "Возобновить"}
                        disabled={pending}
                        className="rounded-md border border-[var(--border)] p-1.5 hover:bg-[var(--muted)] disabled:opacity-50"
                        onClick={() => act(() => toggleCronStatus(c.id), `toggle-${c.id}`)}
                      >
                        {c.status === "active" ? <Pause size={15} /> : <Play size={15} />}
                      </button>
                      <button
                        title="Удалить"
                        disabled={pending}
                        className="rounded-md border border-[var(--border)] p-1.5 text-[var(--danger)] hover:bg-[var(--muted)] disabled:opacity-50"
                        onClick={() => {
                          if (confirm(`Удалить крон «${c.name}»?`)) act(() => deleteCron(c.id), `del-${c.id}`);
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {busy?.startsWith("run-") && (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">Генерация статьи может занять до минуты…</p>
        )}
      </Panel>

      {/* Moderation buffer */}
      <Panel title={`Буфер модерации (${buffered.length})`}>
        {buffered.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">
            Буфер пуст. Сгенерированные статьи, ожидающие одобрения, появятся здесь.
          </p>
        ) : (
          <div className="space-y-3">
            {buffered.map((b) => (
              <div
                key={b.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[var(--border)] p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Tag tone="warn">{categoryName(b.category)}</Tag>
                    <span className="text-xs text-[var(--muted-foreground)]">{b.authorName}</span>
                    {b.bufferReason && (
                      <span className="text-xs text-[var(--muted-foreground)]">· {b.bufferReason}</span>
                    )}
                  </div>
                  <h3 className="mt-1.5 font-serif text-lg font-bold text-[var(--foreground)]">{b.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted-foreground)]">{b.excerpt}</p>
                </div>
                <div className="flex gap-2">
                  <AdminButton disabled={pending} onClick={() => act(() => publishBuffered(b.id), `pub-${b.id}`)}>
                    <Check size={15} /> Опубликовать
                  </AdminButton>
                  <AdminButton
                    variant="ghost"
                    disabled={pending}
                    onClick={() => act(() => discardBuffered(b.id), `disc-${b.id}`)}
                  >
                    <X size={15} /> Удалить
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Runs log */}
      <Panel title="Журнал запусков">
        {runs.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">Запусков ещё не было.</p>
        ) : (
          <div className="space-y-2">
            {runs.map((r) => (
              <div key={r.id} className="flex items-center gap-3 border-b border-[var(--border)] py-2 text-sm last:border-0">
                {r.status === "ok" ? <Tag tone="success">OK</Tag> : r.status === "error" ? <Tag tone="danger">Ошибка</Tag> : <Tag tone="neutral">Пропуск</Tag>}
                <span className="flex-1 text-[var(--foreground)]">{r.message}</span>
                <span className="text-xs text-[var(--muted-foreground)]">{formatDate(r.startedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
