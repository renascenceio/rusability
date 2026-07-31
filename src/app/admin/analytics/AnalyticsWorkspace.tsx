"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader, Panel, Table, Th, Td, Tag } from "@/components/admin/ui";
import {
  LineChart,
  StackedBarChart,
  DonutChart,
  CHART_COLORS,
  type LineSeries,
} from "@/components/admin/analytics-charts";
import {
  RANGE_LABEL,
  GRANULARITY_LABEL,
  type AnalyticsData,
  type RangeKey,
  type Granularity,
  type KpiStat,
} from "@/lib/data/analytics";

const RANGES: RangeKey[] = ["7", "30", "90", "365", "all"];
const GRANS: Granularity[] = ["day", "week", "month"];
const TABS = [
  { id: "overview", label: "Обзор" },
  { id: "articles", label: "Статьи" },
  { id: "news", label: "Новости" },
  { id: "authors", label: "Авторы" },
  { id: "audience", label: "Аудитория" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function fmt(n: number) {
  return Math.round(n).toLocaleString("ru-RU");
}

/* KPI card with an inline definition of what it counts + delta. */
function StatCard({ stat }: { stat: KpiStat }) {
  const up = (stat.delta ?? 0) >= 0;
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="text-sm text-[var(--muted-foreground)]">{stat.label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="font-serif text-[28px] font-bold leading-none text-[var(--foreground)]">
          {stat.value}
        </span>
        {stat.delta !== null && (
          <span className={`text-xs font-semibold ${up ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
            {up ? "▲" : "▼"} {Math.abs(stat.delta)}%
          </span>
        )}
      </div>
      <p className="mt-2 text-[11px] leading-snug text-[var(--muted-foreground)]">{stat.hint}</p>
    </div>
  );
}

function SegButtons<T extends string>({
  options,
  value,
  labels,
  onChange,
}: {
  options: T[];
  value: T;
  labels: Record<T, string>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            o === value
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          {labels[o]}
        </button>
      ))}
    </div>
  );
}

export function AnalyticsWorkspace({ data }: { data: AnalyticsData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [tab, setTab] = useState<TabId>((searchParams.get("tab") as TabId) || "overview");

  const { filters } = data;

  function setFilter(next: Partial<{ range: RangeKey; granularity: Granularity }>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", next.range ?? filters.range);
    params.set("granularity", next.granularity ?? filters.granularity);
    params.set("tab", tab);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  const labels = useMemo(() => data.timeSeries.map((p) => p.label), [data.timeSeries]);
  const updated = new Date(data.generatedAt).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const trafficSeries: LineSeries[] = [
    { key: "views", label: "Просмотры", color: CHART_COLORS.primary, values: data.timeSeries.map((p) => p.views) },
    { key: "visitors", label: "Посетители", color: CHART_COLORS.gold, values: data.timeSeries.map((p) => p.visitors) },
    { key: "sessions", label: "Сессии", color: CHART_COLORS.accent, values: data.timeSeries.map((p) => p.sessions) },
  ];
  const pubSeries: LineSeries[] = [
    { key: "articles", label: "Статьи", color: CHART_COLORS.primary, values: data.publications.map((p) => p.articles) },
    { key: "news", label: "Новости", color: CHART_COLORS.gold, values: data.publications.map((p) => p.news) },
  ];

  const totalArtViews = data.timeSeries.reduce((s, p) => s + p.articleViews, 0);
  const totalNewsViews = data.timeSeries.reduce((s, p) => s + p.newsViews, 0);

  return (
    <>
      <PageHeader
        title="Аналитика"
        subtitle={`Реальные данные · ${RANGE_LABEL[filters.range]} · обновлено ${updated}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <SegButtons options={GRANS} value={filters.granularity} labels={GRANULARITY_LABEL} onChange={(g) => setFilter({ granularity: g })} />
            <SegButtons options={RANGES} value={filters.range} labels={RANGE_LABEL} onChange={(r) => setFilter({ range: r })} />
          </div>
        }
      />

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-[var(--border)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative cursor-pointer whitespace-nowrap px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.id ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {t.label}
            {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[var(--primary)]" />}
          </button>
        ))}
      </div>

      <div className={isPending ? "opacity-60 transition-opacity" : "transition-opacity"}>
        {tab === "overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
              {data.overviewKpis.map((k) => (
                <StatCard key={k.key} stat={k} />
              ))}
            </div>
            <Panel title="Трафик за период">
              <LineChart labels={labels} series={trafficSeries} height={280} area />
            </Panel>
            <div className="grid gap-5 lg:grid-cols-3">
              <Panel title="Публикации: статьи и новости" className="lg:col-span-2">
                <StackedBarChart labels={data.publications.map((p) => p.label)} series={pubSeries} height={240} />
              </Panel>
              <Panel title="Просмотры: статьи vs новости">
                <DonutChart
                  data={[
                    { key: "article", label: "Статьи", value: totalArtViews },
                    { key: "news", label: "Новости", value: totalNewsViews },
                  ]}
                  size={180}
                />
              </Panel>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <TopTable title="Топ статей" rows={data.topArticles} base="/articles" />
              <TopTable title="Топ новостей" rows={data.topNews} base="/news" />
            </div>
          </div>
        )}

        {tab === "articles" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {data.articleKpis.map((k) => (
                <StatCard key={k.key} stat={k} />
              ))}
            </div>
            <Panel title="Просмотры статей за период">
              <LineChart
                labels={labels}
                series={[{ key: "art", label: "Просмотры статей", color: CHART_COLORS.primary, values: data.timeSeries.map((p) => p.articleViews) }]}
                height={260}
                area
              />
            </Panel>
            <TopTable title="Топ статей по просмотрам" rows={data.topArticles} base="/articles" wide />
          </div>
        )}

        {tab === "news" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {data.newsKpis.map((k) => (
                <StatCard key={k.key} stat={k} />
              ))}
            </div>
            <Panel title="Просмотры новостей за период">
              <LineChart
                labels={labels}
                series={[{ key: "news", label: "Просмотры новостей", color: CHART_COLORS.gold, values: data.timeSeries.map((p) => p.newsViews) }]}
                height={260}
                area
              />
            </Panel>
            <TopTable title="Топ новостей по просмотрам" rows={data.topNews} base="/news" wide />
          </div>
        )}

        {tab === "authors" && <AuthorsTab authors={data.authors} />}

        {tab === "audience" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {data.audienceKpis.map((k) => (
                <StatCard key={k.key} stat={k} />
              ))}
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <Panel title="Источники трафика">
                <DonutChart data={data.sources} size={180} />
              </Panel>
              <Panel title="Устройства">
                <DonutChart data={data.devices} size={180} />
              </Panel>
            </div>
            <Panel title="Категории материалов">
              <CategoriesTable categories={data.categories} />
            </Panel>
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------- Top content table ---------------- */

function TopTable({
  title,
  rows,
  base,
  wide = false,
}: {
  title: string;
  rows: AnalyticsData["topArticles"];
  base: string;
  wide?: boolean;
}) {
  return (
    <Panel title={title}>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">Нет данных за период</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Материал</Th>
              {wide && <Th>Категория</Th>}
              <Th className="text-right">Просмотры</Th>
              <Th className="text-right">Посетители</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <Td className="max-w-[340px]">
                  <Link href={`${base}/${r.slug}`} className="line-clamp-1 font-medium hover:text-[var(--primary)]">
                    {r.title}
                  </Link>
                </Td>
                {wide && (
                  <Td>
                    <Tag tone="neutral">{r.categoryLabel}</Tag>
                  </Td>
                )}
                <Td className="text-right font-semibold tabular-nums">{fmt(r.views)}</Td>
                <Td className="text-right tabular-nums text-[var(--muted-foreground)]">{fmt(r.visitors)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Panel>
  );
}

/* ---------------- Authors leaderboard ---------------- */

type AuthorSort = "views" | "articles" | "avgViews" | "visitors" | "followers";

function AuthorsTab({ authors }: { authors: AnalyticsData["authors"] }) {
  const [sort, setSort] = useState<AuthorSort>("views");
  const sorted = useMemo(() => [...authors].sort((a, b) => b[sort] - a[sort]), [authors, sort]);
  const maxViews = Math.max(1, ...authors.map((a) => a.views));
  const active = authors.filter((a) => a.articles > 0).length;

  const cols: { key: AuthorSort; label: string }[] = [
    { key: "articles", label: "Статей" },
    { key: "views", label: "Просмотры" },
    { key: "visitors", label: "Посетители" },
    { key: "avgViews", label: "Средн./статья" },
    { key: "followers", label: "Подписчики" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard stat={{ key: "total", label: "Всего авторов", value: fmt(authors.length), raw: authors.length, delta: null, hint: "Авторы в системе" }} />
        <StatCard stat={{ key: "active", label: "С публикациями", value: fmt(active), raw: active, delta: null, hint: "Авторы, у которых есть опубликованные статьи" }} />
        <StatCard
          stat={{
            key: "topv",
            label: "Лидер по просмотрам",
            value: sorted[0] ? fmt(sorted[0].views) : "0",
            raw: 0,
            delta: null,
            hint: sorted[0]?.name ?? "—",
          }}
        />
        <StatCard
          stat={{
            key: "sumv",
            label: "Просмотры статей",
            value: fmt(authors.reduce((s, a) => s + a.views, 0)),
            raw: 0,
            delta: null,
            hint: "Суммарно по всем авторам за период",
          }}
        />
      </div>
      <Panel title="Рейтинг авторов" action={<span className="text-xs text-[var(--muted-foreground)]">Сортировка по столбцу — клик</span>}>
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Автор</Th>
              {cols.map((c) => (
                <Th key={c.key} className="text-right">
                  <button
                    type="button"
                    onClick={() => setSort(c.key)}
                    className={`cursor-pointer hover:text-[var(--foreground)] ${sort === c.key ? "text-[var(--primary)]" : ""}`}
                  >
                    {c.label}
                    {sort === c.key ? " ↓" : ""}
                  </button>
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((a, i) => (
              <tr key={a.id}>
                <Td className="tabular-nums text-[var(--muted-foreground)]">{i + 1}</Td>
                <Td>
                  <Link href={`/authors/${a.username}`} className="flex items-center gap-2.5 hover:text-[var(--primary)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.avatar || "/placeholder.svg"} alt="" className="h-7 w-7 rounded-full object-cover" />
                    <span className="font-medium">{a.name}</span>
                    {a.elite && <Tag tone="gold">Elite</Tag>}
                  </Link>
                </Td>
                <Td className="text-right tabular-nums">{fmt(a.articles)}</Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--muted)]">
                      <span className="block h-full rounded-full bg-[var(--primary)]" style={{ width: `${(a.views / maxViews) * 100}%` }} />
                    </span>
                    <span className="w-14 font-semibold tabular-nums">{fmt(a.views)}</span>
                  </div>
                </Td>
                <Td className="text-right tabular-nums text-[var(--muted-foreground)]">{fmt(a.visitors)}</Td>
                <Td className="text-right tabular-nums text-[var(--muted-foreground)]">{fmt(a.avgViews)}</Td>
                <Td className="text-right tabular-nums text-[var(--muted-foreground)]">{fmt(a.followers)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}

/* ---------------- Categories table ---------------- */

function CategoriesTable({ categories }: { categories: AnalyticsData["categories"] }) {
  const maxViews = Math.max(1, ...categories.map((c) => c.views));
  if (categories.length === 0) {
    return <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">Нет данных за период</p>;
  }
  return (
    <Table>
      <thead>
        <tr>
          <Th>Категория</Th>
          <Th className="text-right">Статей</Th>
          <Th className="text-right">Новостей</Th>
          <Th className="text-right">Просмотры</Th>
          <Th className="text-right">Посетители</Th>
          <Th className="text-right">Доля</Th>
        </tr>
      </thead>
      <tbody>
        {categories.map((c) => (
          <tr key={c.key}>
            <Td className="font-medium">{c.label}</Td>
            <Td className="text-right tabular-nums text-[var(--muted-foreground)]">{fmt(c.articles)}</Td>
            <Td className="text-right tabular-nums text-[var(--muted-foreground)]">{fmt(c.news)}</Td>
            <Td className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--muted)]">
                  <span className="block h-full rounded-full bg-[var(--primary)]" style={{ width: `${(c.views / maxViews) * 100}%` }} />
                </span>
                <span className="w-14 font-semibold tabular-nums">{fmt(c.views)}</span>
              </div>
            </Td>
            <Td className="text-right tabular-nums text-[var(--muted-foreground)]">{fmt(c.visitors)}</Td>
            <Td className="text-right tabular-nums">{c.share}%</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
