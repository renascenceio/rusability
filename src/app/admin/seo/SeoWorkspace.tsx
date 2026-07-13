"use client";

import { useState, useTransition } from "react";
import { Check, Plus, Trash2, RefreshCw, Search, Bot, Globe, Lock } from "lucide-react";
import { Panel, AdminButton, Tag, Table, Th, Td } from "@/components/admin/ui";
import {
  saveSeoMeta,
  saveRobots,
  listRedirects,
  createRedirect,
  toggleRedirect,
  deleteRedirect,
  type SeoMeta,
  type RobotsSettings,
  type RedirectRow,
} from "./actions";

type TabKey = "meta" | "sitemap" | "robots" | "redirects" | "geo";

const SEO_SCORES = [
  { label: "SEO", value: 75, tone: "var(--success)", caption: "Готовность к выдаче" },
  { label: "AEO", value: 64, tone: "var(--gold)", caption: "Ответы ИИ-движкам" },
  { label: "GEO", value: 58, tone: "var(--primary)", caption: "Геолокальные запросы" },
];

/**
 * Read-only "system" rules enforced in middleware.ts. These aren't editable —
 * they document how legacy links from the old MongoDB portal are handled
 * automatically (HTTP 410 Gone + branded archive page), so nobody wonders why
 * old URLs "redirect" without a rule here.
 */
const SYSTEM_RULES = [
  {
    pattern: "/articles/<slug>/<id> · /news/<slug>/<id>",
    behavior: "410 — архивная страница",
    note: "Старые ссылки с ID (MongoDB) старого портала",
  },
  {
    pattern: "/<старый-раздел>/<slug>",
    behavior: "410 — архивная страница",
    note: "Разделы и авторы старого сайта (content-marketing, blog, research…)",
  },
  {
    pattern: "/articles/<slug> · /news/<slug> (удалённые)",
    behavior: "410 — архивная страница",
    note: "Слаг отсутствует в новой базе → считается удалённым",
  },
];

export type SitemapStats = {
  articles: number;
  news: number;
  authors: number;
  staticPages: number;
  total: number;
};

export function SeoWorkspace({
  initialMeta,
  initialRobots,
  sitemapStats,
  initialRedirects,
}: {
  initialMeta: SeoMeta;
  initialRobots: RobotsSettings;
  sitemapStats: SitemapStats;
  initialRedirects: RedirectRow[];
}) {
  const [tab, setTab] = useState<TabKey>("meta");
  const [saved, setSaved] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Meta
  const [meta, setMeta] = useState<SeoMeta>(initialMeta);

  // robots / sitemap toggles
  const [robots, setRobots] = useState<RobotsSettings>(initialRobots);

  // redirects (DB-backed)
  const [redirects, setRedirects] = useState<RedirectRow[]>(initialRedirects);
  const [newRedirect, setNewRedirect] = useState({ from: "", to: "", code: 301 });
  const [busy, setBusy] = useState(false);

  async function refreshRedirects() {
    setRedirects(await listRedirects());
  }

  async function addRedirect() {
    setBusy(true);
    const res = await createRedirect({
      source: newRedirect.from,
      destination: newRedirect.to,
      statusCode: newRedirect.code,
    });
    setBusy(false);
    if (res.ok) {
      setNewRedirect({ from: "", to: "", code: 301 });
      await refreshRedirects();
      flash("Редирект сохранён");
    } else {
      flash(res.error ?? "Не удалось сохранить");
    }
  }

  async function removeRedirect(id: number) {
    await deleteRedirect(id);
    await refreshRedirects();
    flash("Редирект удалён");
  }

  async function flipRedirect(id: number, enabled: boolean) {
    setRedirects((rs) => rs.map((r) => (r.id === id ? { ...r, enabled } : r)));
    await toggleRedirect(id, enabled);
  }

  function flash(msg: string) {
    setSaved(msg);
    setTimeout(() => setSaved(null), 2500);
  }

  function persistMeta() {
    startTransition(async () => {
      const res = await saveSeoMeta(meta);
      flash(res.ok ? "Мета-теги сохранены" : "Не удалось сохранить");
    });
  }

  function persistRobots() {
    startTransition(async () => {
      const res = await saveRobots(robots);
      flash(res.ok ? "robots.txt обновлён" : "Не удалось сохранить");
    });
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "meta", label: "Мета-теги" },
    { key: "sitemap", label: "Sitemap" },
    { key: "robots", label: "robots.txt" },
    { key: "redirects", label: "Редиректы" },
    { key: "geo", label: "GEO / AEO" },
  ];

  return (
    <div className="space-y-5">
      {/* Score cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {SEO_SCORES.map((s) => (
          <div key={s.label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--muted-foreground)]">{s.label}</span>
              <span className="font-serif text-2xl font-bold" style={{ color: s.tone }}>
                {s.value}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
              <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: s.tone }} />
            </div>
            <div className="mt-2 text-xs text-[var(--muted-foreground)]">{s.caption}</div>
          </div>
        ))}
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] px-4 py-2.5 text-sm text-[var(--success)]">
          <Check size={16} /> {saved}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--border)]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "border-b-2 border-[var(--primary)] text-[var(--foreground)]"
                : "border-b-2 border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* META */}
      {tab === "meta" && (
        <Panel title="Глобальные мета-теги">
          <div className="space-y-4">
            <Field label="Title сайта">
              <input
                value={meta.title}
                onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
              <Hint>{meta.title.length} / 60 символов</Hint>
            </Field>
            <Field label="Meta description">
              <textarea
                value={meta.description}
                onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
              <Hint>{meta.description.length} / 160 символов</Hint>
            </Field>
            <Field label="Ключевые слова">
              <input
                value={meta.keywords}
                onChange={(e) => setMeta({ ...meta, keywords: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
            </Field>
            <Field label="OG-изображение по умолчанию">
              <input
                value={meta.ogImage}
                onChange={(e) => setMeta({ ...meta, ogImage: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
            </Field>
            <AdminButton onClick={persistMeta}>
              <Check size={15} /> Сохранить
            </AdminButton>
          </div>
        </Panel>
      )}

      {/* SITEMAP */}
      {tab === "sitemap" && (
        <Panel title="Карта сайта">
          <div className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3">
            <div className="flex items-center gap-2">
              <Globe size={15} className="text-[var(--muted-foreground)]" />
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--primary)] hover:underline"
              >
                /sitemap.xml
              </a>
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {sitemapStats.total} URL · обновляется автоматически
            </div>
          </div>

          {/* Real breakdown of what the single sitemap contains */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Статьи", value: sitemapStats.articles },
              { label: "Новости", value: sitemapStats.news },
              { label: "Авторы", value: sitemapStats.authors },
              { label: "Статические", value: sitemapStats.staticPages },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-[var(--border)] px-4 py-3">
                <div className="font-serif text-2xl font-bold text-[var(--foreground)]">{s.value}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{s.label}</div>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Единый sitemap генерируется автоматически из опубликованного контента. Устаревшие ссылки
            старого портала намеренно отдают 410 и не входят в карту сайта.
          </p>
        </Panel>
      )}

      {/* ROBOTS */}
      {tab === "robots" && (
        <Panel title="robots.txt и директивы индексации">
          <div className="space-y-1">
            <ToggleRow
              label="Разрешить индексацию (index)"
              desc="Поисковые роботы могут добавлять страницы в выдачу"
              on={robots.index}
              onToggle={() => setRobots({ ...robots, index: !robots.index })}
            />
            <ToggleRow
              label="Переход по ссылкам (follow)"
              desc="Роботы переходят по внутренним ссылкам"
              on={robots.follow}
              onToggle={() => setRobots({ ...robots, follow: !robots.follow })}
            />
            <ToggleRow
              label="Доступ ИИ-краулерам (GPTBot, PerplexityBot)"
              desc="Разрешить обучение и цитирование ИИ-поисковиками (AEO)"
              on={robots.ai}
              onToggle={() => setRobots({ ...robots, ai: !robots.ai })}
            />
            <ToggleRow
              label="Ссылка на sitemap.xml"
              desc="Указывать карту сайта в robots.txt"
              on={robots.sitemap}
              onToggle={() => setRobots({ ...robots, sitemap: !robots.sitemap })}
            />
          </div>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-xs text-[var(--muted-foreground)]">
{`User-agent: *
${robots.index ? "Allow: /" : "Disallow: /"}
${robots.ai ? "# ИИ-краулеры разрешены" : "User-agent: GPTBot\nDisallow: /"}
${robots.sitemap ? "Sitemap: https://rusability.ru/sitemap.xml" : ""}`}
          </pre>
          <AdminButton className="mt-4" onClick={persistRobots}>
            <Check size={15} /> Применить
          </AdminButton>
        </Panel>
      )}

      {/* REDIRECTS */}
      {tab === "redirects" && (
        <div className="space-y-5">
          <Panel title={`Ваши редиректы (${redirects.length})`}>
            <div className="mb-4 flex flex-wrap items-end gap-2">
              <input
                value={newRedirect.from}
                onChange={(e) => setNewRedirect({ ...newRedirect, from: e.target.value })}
                placeholder="Откуда /old-url"
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
              <input
                value={newRedirect.to}
                onChange={(e) => setNewRedirect({ ...newRedirect, to: e.target.value })}
                placeholder="Куда /new-url"
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
              <select
                value={newRedirect.code}
                onChange={(e) => setNewRedirect({ ...newRedirect, code: Number(e.target.value) })}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value={301}>301</option>
                <option value={302}>302</option>
              </select>
              <AdminButton
                disabled={busy || !newRedirect.from.trim() || !newRedirect.to.trim()}
                onClick={addRedirect}
              >
                <Plus size={15} /> Добавить
              </AdminButton>
            </div>
            {redirects.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
                Пока нет собственных редиректов. Добавьте правило выше, чтобы перенаправить
                конкретный URL на новую страницу.
              </p>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Откуда</Th>
                    <Th>Куда</Th>
                    <Th>Код</Th>
                    <Th>Активен</Th>
                    <Th className="text-right">Действие</Th>
                  </tr>
                </thead>
                <tbody>
                  {redirects.map((r) => (
                    <tr key={r.id}>
                      <Td className="font-mono text-xs">{r.source}</Td>
                      <Td className="font-mono text-xs">{r.destination}</Td>
                      <Td>
                        <Tag tone={r.statusCode === 301 ? "success" : "warn"}>{r.statusCode}</Tag>
                      </Td>
                      <Td>
                        <button
                          onClick={() => flipRedirect(r.id, !r.enabled)}
                          aria-pressed={r.enabled}
                          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                            r.enabled ? "bg-[var(--primary)]" : "bg-[var(--surface-3)]"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              r.enabled ? "translate-x-4" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </Td>
                      <Td className="text-right">
                        <button
                          className="rounded-md border border-[var(--border)] p-1.5 text-[var(--danger)] hover:bg-[var(--surface-2)]"
                          onClick={() => removeRedirect(r.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Panel>

          {/* System rules — read-only */}
          <Panel title="Системные правила (только чтение)">
            <p className="mb-3 text-xs text-[var(--muted-foreground)]">
              Эти правила зашиты в код и обрабатывают ссылки старого портала автоматически. Их нельзя
              изменить здесь — они всегда активны для корректной деиндексации в поиске.
            </p>
            <div className="space-y-2">
              {SYSTEM_RULES.map((rule) => (
                <div
                  key={rule.pattern}
                  className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="break-words font-mono text-xs text-[var(--foreground)]">
                      {rule.pattern}
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--muted-foreground)]">{rule.note}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Tag tone="neutral">410</Tag>
                    <Lock size={13} className="text-[var(--muted-foreground)]" />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* GEO / AEO */}
      {tab === "geo" && (
        <Panel title="Оптимизация под ИИ-поиск (AEO/GEO)">
          <div className="space-y-3 text-sm text-[var(--muted-foreground)]">
            <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] p-4">
              <Bot className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
              <div>
                <div className="font-semibold text-[var(--foreground)]">FAQ-блоки на статьях Elite</div>
                <p>Structured Q&amp;A повышает шанс цитирования в ответах ИИ-движков.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] p-4">
              <Search className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />
              <div>
                <div className="font-semibold text-[var(--foreground)]">Schema.org разметка</div>
                <p>Article, Organization и BreadcrumbList отдаются автоматически.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] p-4">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
              <div>
                <div className="font-semibold text-[var(--foreground)]">Гео-таргетинг RU</div>
                <p>hreflang=ru-RU и хостинг в РФ — соответствие требованиям локализации.</p>
              </div>
            </div>
          </div>
          <AdminButton className="mt-4" onClick={() => flash("Проверка AEO/GEO запущена")}>
            <RefreshCw size={15} /> Проверить готовность
          </AdminButton>
        </Panel>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[var(--foreground)]">{label}</span>
      {children}
    </label>
  );
}
function Hint({ children }: { children: React.ReactNode }) {
  return <span className="mt-1 block text-xs text-[var(--muted-foreground)]">{children}</span>;
}
function ToggleRow({
  label,
  desc,
  on,
  onToggle,
}: {
  label: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] py-3 last:border-0">
      <div className="min-w-0 pr-4">
        <div className="text-sm font-semibold text-[var(--foreground)]">{label}</div>
        <div className="text-xs text-[var(--muted-foreground)]">{desc}</div>
      </div>
      <button
        onClick={onToggle}
        aria-pressed={on}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          on ? "bg-[var(--primary)]" : "bg-[var(--surface-3)]"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
