import Link from "next/link";
import { ChevronRight, Newspaper, PenLine, ShieldAlert } from "lucide-react";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const metadata = { title: "Обзор платформы" };
export const dynamic = "force-dynamic";

const MOSCOW_TZ = "Europe/Moscow";

type OverviewTotals = {
  page_views: number;
  visitors: number;
  articles_today: number;
  articles_total: number;
  news_today: number;
  news_total: number;
  rkn_signals: number;
};

type PublishedItem = {
  kind: "article" | "news";
  title: string;
  published_at: Date | string;
};

type Stat = {
  label: string;
  value: string;
  valueColor: string;
  sub: string;
};

function formatCount(value: number) {
  return new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatTime(value: Date | string) {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: MOSCOW_TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] ${className ?? ""}`}>
      {children}
    </div>
  );
}

async function getOverviewData() {
  const [totalsResult, publishedResult] = await Promise.all([
    db.execute<OverviewTotals>(sql`
      WITH day_bounds AS (
        SELECT date_trunc('day', now() AT TIME ZONE ${MOSCOW_TZ}) AT TIME ZONE ${MOSCOW_TZ} AS start_today
      )
      SELECT
        (SELECT count(*)::int FROM page_views WHERE is_bot = false) AS page_views,
        (SELECT count(DISTINCT visitor_id)::int FROM page_views WHERE is_bot = false) AS visitors,
        (SELECT count(*)::int FROM articles, day_bounds WHERE status = 'published' AND published_at >= start_today) AS articles_today,
        (SELECT count(*)::int FROM articles WHERE status = 'published') AS articles_total,
        (SELECT count(*)::int FROM news, day_bounds WHERE (pipeline = 'published' OR pipeline IS NULL) AND published_at >= start_today) AS news_today,
        (SELECT count(*)::int FROM news WHERE pipeline = 'published' OR pipeline IS NULL) AS news_total,
        (SELECT coalesce(sum(rkn_strikes), 0)::int FROM "user") AS rkn_signals
    `),
    db.execute<PublishedItem>(sql`
      WITH day_bounds AS (
        SELECT date_trunc('day', now() AT TIME ZONE ${MOSCOW_TZ}) AT TIME ZONE ${MOSCOW_TZ} AS start_today
      )
      SELECT kind, title, published_at
      FROM (
        SELECT 'article'::text AS kind, title, published_at
        FROM articles, day_bounds
        WHERE status = 'published' AND published_at >= start_today
        UNION ALL
        SELECT 'news'::text AS kind, title, published_at
        FROM news, day_bounds
        WHERE (pipeline = 'published' OR pipeline IS NULL) AND published_at >= start_today
      ) published
      ORDER BY published_at DESC
      LIMIT 8
    `),
  ]);

  return {
    totals: totalsResult.rows[0] ?? {
      page_views: 0,
      visitors: 0,
      articles_today: 0,
      articles_total: 0,
      news_today: 0,
      news_total: 0,
      rkn_signals: 0,
    },
    published: publishedResult.rows,
  };
}

export default async function AdminOverviewPage() {
  const { totals, published } = await getOverviewData();
  const todayLabel = new Intl.DateTimeFormat("ru-RU", {
    timeZone: MOSCOW_TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const stats: Stat[] = [
    {
      label: "Просмотры страниц",
      value: formatCount(totals.page_views),
      valueColor: "text-[var(--foreground)]",
      sub: `${formatCount(totals.visitors)} уникальных посетителей`,
    },
    {
      label: "Статьи сегодня",
      value: totals.articles_today.toLocaleString("ru-RU"),
      valueColor: "text-[var(--primary)]",
      sub: `${totals.articles_total.toLocaleString("ru-RU")} опубликовано всего`,
    },
    {
      label: "Новости сегодня",
      value: totals.news_today.toLocaleString("ru-RU"),
      valueColor: "text-[var(--primary)]",
      sub: `${totals.news_total.toLocaleString("ru-RU")} опубликовано всего`,
    },
    {
      label: "РКН-сигналы",
      value: totals.rkn_signals.toLocaleString("ru-RU"),
      valueColor: totals.rkn_signals > 0 ? "text-[var(--danger)]" : "text-[var(--foreground)]",
      sub: totals.rkn_signals > 0 ? "Требуют внимания" : "Нарушений не зафиксировано",
    },
  ];

  const quickActions = [
    { label: "Написать статью", icon: PenLine, href: "/admin/editor" },
    { label: "Управление новостями", icon: Newspaper, href: "/admin/news" },
  ];

  return (
    <div className="mx-auto max-w-[1180px] animate-[fadein_.2s_ease]">
      <header className="mb-7">
        <h1 className="font-serif text-[26px] font-bold leading-tight text-[var(--foreground)]">Обзор платформы</h1>
        <p className="mt-1 text-[13px] capitalize text-[var(--muted-foreground)]">{todayLabel} · Москва</p>
      </header>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="mb-2.5 whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--muted-foreground)]">
              {stat.label}
            </div>
            <div className={`font-serif text-[32px] font-bold leading-none ${stat.valueColor}`}>{stat.value}</div>
            <div className="mt-1.5 text-xs font-medium text-[var(--muted-foreground)]">{stat.sub}</div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-[15px] font-bold text-[var(--foreground)]">Быстрые действия</h2>
          <div className="flex flex-col gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href} className="flex items-center justify-between rounded-[10px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-3 transition-colors hover:border-[var(--border)]">
                  <span className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--foreground)]">
                    <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
                    {action.label}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-[var(--faint)]" />
                </Link>
              );
            })}
            <Link href="/admin/ai-filter" className="flex items-center justify-between rounded-[10px] border border-[var(--danger)]/20 bg-[var(--danger)]/[0.06] px-4 py-3 transition-colors hover:bg-[var(--danger)]/10">
              <span className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--danger)]">
                <ShieldAlert className="h-4 w-4" />
                РКН-сигналы ({totals.rkn_signals})
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--danger)]" />
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-[15px] font-bold text-[var(--foreground)]">Опубликовано сегодня</h2>
          {published.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {published.map((item, index) => (
                <li key={`${item.kind}-${item.title}-${index}`} className="flex items-center gap-3">
                  <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[var(--primary)]" />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--muted-foreground)]">
                    <span className="font-medium text-[var(--foreground)]">{item.kind === "article" ? "Статья" : "Новость"}:</span>{" "}
                    {item.title}
                  </span>
                  <span className="shrink-0 text-[11px] text-[var(--faint)]">{formatTime(item.published_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-[var(--muted-foreground)]">Сегодня публикаций пока нет.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
