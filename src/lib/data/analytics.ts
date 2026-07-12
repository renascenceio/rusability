import "server-only";
import { unstable_cache } from "next/cache";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { categoryName } from "@/lib/taxonomy";

export type MetricPoint = { label: string; value: number };
export type KpiStat = { label: string; value: string; delta: number };
export type TopPage = { path: string; views: number; delta: number };

export type AdminAnalytics = {
  kpis: KpiStat[];
  seriesByPeriod: Record<"7" | "30" | "90", MetricPoint[]>;
  sources: MetricPoint[];
  topPages: TopPage[];
  generatedAt: string;
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".", ",")}K`;
  return String(n);
}

async function compute(): Promise<AdminAnalytics> {
  const [
    articlesCount,
    newsCount,
    viewsRow,
    subsCount,
    recentArticles,
    prevArticles,
    byCategory,
    topArticles,
    topNews,
    pubSeries,
  ] = await Promise.all([
    db.execute<{ n: number }>(
      sql`SELECT count(*)::int AS n FROM articles WHERE status = 'published'`,
    ),
    db.execute<{ n: number }>(sql`SELECT count(*)::int AS n FROM news`),
    db.execute<{ n: number }>(
      sql`SELECT (COALESCE((SELECT sum(views) FROM articles), 0) + COALESCE((SELECT sum(views) FROM news), 0))::int AS n`,
    ),
    db.execute<{ n: number }>(sql`SELECT count(*)::int AS n FROM subscriptions`),
    db.execute<{ n: number }>(
      sql`SELECT count(*)::int AS n FROM articles WHERE status = 'published' AND published_at >= now() - interval '30 days'`,
    ),
    db.execute<{ n: number }>(
      sql`SELECT count(*)::int AS n FROM articles WHERE status = 'published' AND published_at >= now() - interval '60 days' AND published_at < now() - interval '30 days'`,
    ),
    db.execute<{ category: string; n: number }>(
      sql`SELECT category, count(*)::int AS n FROM articles WHERE status = 'published' GROUP BY category ORDER BY n DESC LIMIT 5`,
    ),
    db.execute<{ slug: string; views: number }>(
      sql`SELECT slug, views FROM articles WHERE status = 'published' ORDER BY views DESC LIMIT 4`,
    ),
    db.execute<{ slug: string; views: number }>(
      sql`SELECT slug, views FROM news ORDER BY views DESC LIMIT 2`,
    ),
    // Publications per week for the last 13 weeks (articles + news).
    db.execute<{ wk: string; n: number }>(
      sql`
        SELECT to_char(date_trunc('week', published_at), 'YYYY-MM-DD') AS wk, count(*)::int AS n
        FROM (
          SELECT published_at FROM articles WHERE status = 'published' AND published_at >= now() - interval '91 days'
          UNION ALL
          SELECT published_at FROM news WHERE published_at >= now() - interval '91 days'
        ) AS pubs
        GROUP BY 1 ORDER BY 1
      `,
    ),
  ]);

  const totalArticles = articlesCount.rows[0]?.n ?? 0;
  const totalNews = newsCount.rows[0]?.n ?? 0;
  const totalViews = viewsRow.rows[0]?.n ?? 0;
  const totalSubs = subsCount.rows[0]?.n ?? 0;
  const recent = recentArticles.rows[0]?.n ?? 0;
  const prev = prevArticles.rows[0]?.n ?? 0;
  const articleDelta = prev > 0 ? Math.round(((recent - prev) / prev) * 100) : recent > 0 ? 100 : 0;

  const kpis: KpiStat[] = [
    { label: "Статей опубликовано", value: fmt(totalArticles), delta: articleDelta },
    { label: "Новостей", value: fmt(totalNews), delta: 0 },
    { label: "Просмотров", value: fmt(totalViews), delta: 0 },
    { label: "Подписчиков", value: fmt(totalSubs), delta: 0 },
  ];

  const sources: MetricPoint[] = byCategory.rows.map((r) => ({
    label: categoryName(r.category),
    value: r.n,
  }));

  const topPages: TopPage[] = [
    ...topArticles.rows.map((r) => ({ path: `/articles/${r.slug}`, views: r.views, delta: 0 })),
    ...topNews.rows.map((r) => ({ path: `/news/${r.slug}`, views: r.views, delta: 0 })),
  ]
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  // Build a per-period publications series from the weekly buckets.
  const weekly = pubSeries.rows.map((r) => ({
    date: new Date(r.wk),
    value: r.n,
  }));
  function seriesForDays(days: number, points: number): MetricPoint[] {
    const cutoff = Date.now() - days * 86_400_000;
    const filtered = weekly.filter((w) => w.date.getTime() >= cutoff);
    const src = filtered.length ? filtered : weekly;
    const tail = src.slice(-points);
    return tail.length
      ? tail.map((w) => ({
          label: w.date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
          value: w.value,
        }))
      : [{ label: "—", value: 0 }];
  }

  return {
    kpis,
    seriesByPeriod: {
      "7": seriesForDays(7, 7),
      "30": seriesForDays(30, 5),
      "90": seriesForDays(90, 13),
    },
    sources,
    topPages,
    generatedAt: new Date().toISOString(),
  };
}

/** Real analytics aggregates, cached for one hour to spare the database. */
export const adminAnalytics = unstable_cache(compute, ["admin-analytics"], {
  revalidate: 3600,
  tags: ["admin-analytics"],
});
