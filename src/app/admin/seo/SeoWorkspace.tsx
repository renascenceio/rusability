"use client";

import { useState, useTransition } from "react";
import { Check, Plus, Trash2, RefreshCw, Search, Bot, Globe } from "lucide-react";
import { Panel, AdminButton, Tag, Table, Th, Td } from "@/components/admin/ui";
import { saveSeoMeta, saveRobots, type SeoMeta, type RobotsSettings } from "./actions";

type TabKey = "meta" | "sitemap" | "robots" | "redirects" | "geo";

const SEO_SCORES = [
  { label: "SEO", value: 75, tone: "var(--success)", caption: "Готовность к выдаче" },
  { label: "AEO", value: 64, tone: "var(--gold)", caption: "Ответы ИИ-движкам" },
  { label: "GEO", value: 58, tone: "var(--primary)", caption: "Геолокальные запросы" },
];

const DEFAULT_REDIRECTS = [
  { id: 1, from: "/blog/staraya-statya", to: "/articles/novaya-statya", code: 301 },
  { id: 2, from: "/tools", to: "/apps", code: 301 },
  { id: 3, from: "/news/2024", to: "/news", code: 302 },
];

export function SeoWorkspace({
  initialMeta,
  initialRobots,
}: {
  initialMeta: SeoMeta;
  initialRobots: RobotsSettings;
}) {
  const [tab, setTab] = useState<TabKey>("meta");
  const [saved, setSaved] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Meta
  const [meta, setMeta] = useState<SeoMeta>(initialMeta);

  // robots / sitemap toggles
  const [robots, setRobots] = useState<RobotsSettings>(initialRobots);

  // redirects
  const [redirects, setRedirects] = useState(DEFAULT_REDIRECTS);
  const [newRedirect, setNewRedirect] = useState({ from: "", to: "", code: 301 });

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
        <Panel
          title="Карта сайта"
          action={
            <AdminButton variant="ghost" onClick={() => flash("Sitemap перегенерирован")}>
              <RefreshCw size={15} /> Перегенерировать
            </AdminButton>
          }
        >
          <div className="space-y-2 text-sm">
            {[
              { url: "/sitemap.xml", count: "312 URL", updated: "сегодня, 06:00" },
              { url: "/sitemap-articles.xml", count: "248 статей", updated: "сегодня, 06:00" },
              { url: "/sitemap-news.xml", count: "51 новость", updated: "сегодня, 09:15" },
              { url: "/sitemap-authors.xml", count: "13 авторов", updated: "вчера" },
            ].map((s) => (
              <div
                key={s.url}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <Globe size={15} className="text-[var(--muted-foreground)]" />
                  <a href={s.url} target="_blank" rel="noreferrer" className="font-medium text-[var(--primary)] hover:underline">
                    {s.url}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                  <span>{s.count}</span>
                  <span>обновлено {s.updated}</span>
                </div>
              </div>
            ))}
          </div>
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
        <Panel title={`Редиректы (${redirects.length})`}>
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
              disabled={!newRedirect.from.trim() || !newRedirect.to.trim()}
              onClick={() => {
                setRedirects([...redirects, { id: Date.now(), ...newRedirect }]);
                setNewRedirect({ from: "", to: "", code: 301 });
                flash("Редирект добавлен");
              }}
            >
              <Plus size={15} /> Добавить
            </AdminButton>
          </div>
          <Table>
            <thead>
              <tr>
                <Th>Откуда</Th>
                <Th>Куда</Th>
                <Th>Код</Th>
                <Th className="text-right">Действие</Th>
              </tr>
            </thead>
            <tbody>
              {redirects.map((r) => (
                <tr key={r.id}>
                  <Td className="font-mono text-xs">{r.from}</Td>
                  <Td className="font-mono text-xs">{r.to}</Td>
                  <Td>
                    <Tag tone={r.code === 301 ? "success" : "warn"}>{r.code}</Tag>
                  </Td>
                  <Td className="text-right">
                    <button
                      className="rounded-md border border-[var(--border)] p-1.5 text-[var(--danger)] hover:bg-[var(--surface-2)]"
                      onClick={() => setRedirects(redirects.filter((x) => x.id !== r.id))}
                    >
                      <Trash2 size={14} />
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      )}

      {/* GEO / AEO */}
      {tab === "geo" && (
        <Panel title="Оптимизация под ИИ-поиск (AEO/GEO)">
          <div className="space-y-3 text-sm text-[var(--muted-foreground)]">
            <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] p-4">
              <Bot className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
              <div>
                <div className="font-semibold text-[var(--foreground)]">FAQ-бло��и на статьях Elite</div>
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
