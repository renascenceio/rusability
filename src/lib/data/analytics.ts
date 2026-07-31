import "server-only";
import { unstable_cache } from "next/cache";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { categoryName } from "@/lib/taxonomy";
import {
  RANGE_DAYS,
  normalizeFilters,
  type RangeKey,
  type Granularity,
  type AnalyticsFilters,
  type KpiStat,
  type TimePoint,
  type PubPoint,
  type Slice,
  type TopContent,
  type AuthorRow,
  type CategoryRow,
  type AnalyticsData,
} from "@/lib/data/analytics-types";

// Re-export the client-safe types + labels so existing callers that import
// from the data layer keep working.
export * from "@/lib/data/analytics-types";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("ru-RU");
}
function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")} млн`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(0)}K`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".", ",")}K`;
  return String(Math.round(n));
}
function pctDelta(cur: number, prev: number): number | null {
  if (prev <= 0) return cur > 0 ? 100 : null;
  return Math.round(((cur - prev) / prev) * 100);
}

/** Monday-anchored week start (matches Postgres date_trunc('week')). */
function startOfWeek(d: Date): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = (x.getUTCDay() + 6) % 7; // Mon=0
  x.setUTCDate(x.getUTCDate() - dow);
  return x;
}
function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function labelFor(d: Date, g: Granularity): string {
  if (g === "month") return d.toLocaleDateString("ru-RU", { month: "short", year: "numeric" });
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

/** Continuous bucket axis (fills gaps with zeros) matching date_trunc keys. */
function buildAxis(g: Granularity, days: number): { date: string; label: string }[] {
  const now = new Date();
  const start = new Date(now.getTime() - days * 86_400_000);
  const axis: { date: string; label: string }[] = [];
  let cursor: Date;
  if (g === "month") cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  else if (g === "week") cursor = startOfWeek(start);
  else cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));

  let guard = 0;
  while (cursor <= now && guard++ < 400) {
    axis.push({ date: isoDay(cursor), label: labelFor(cursor, g) });
    if (g === "month") cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
    else if (g === "week") cursor = new Date(cursor.getTime() + 7 * 86_400_000);
    else cursor = new Date(cursor.getTime() + 86_400_000);
  }
  return axis;
}

/* ------------------------------------------------------------------ */
/* Compute                                                             */
/* ------------------------------------------------------------------ */

async function compute(filters: AnalyticsFilters): Promise<AnalyticsData> {
  const days = RANGE_DAYS[filters.range];
  const unit = filters.granularity; // 'day' | 'week' | 'month' — safe, validated

  const [
    kpiRow,
    engRow,
    subsRow,
    seriesRes,
    prevSeriesRes,
    pubsRes,
    sourcesRes,
    devicesRes,
    topArtRes,
    topNewsRes,
    authorsRes,
    authorArtRes,
    catViewsRes,
    catContentRes,
  ] = await Promise.all([
    // Core counts: current vs previous window.
    db.execute<{
      pv_cur: number; pv_prev: number;
      vis_cur: number; vis_prev: number;
      art_cur: number; art_prev: number;
      news_cur: number; news_prev: number;
    }>(sql`
      SELECT
        count(*) FILTER (WHERE created_at >= now() - make_interval(days => ${days}))::int AS pv_cur,
        count(*) FILTER (WHERE created_at >= now() - make_interval(days => ${days * 2}) AND created_at < now() - make_interval(days => ${days}))::int AS pv_prev,
        count(DISTINCT visitor_id) FILTER (WHERE created_at >= now() - make_interval(days => ${days}))::int AS vis_cur,
        count(DISTINCT visitor_id) FILTER (WHERE created_at >= now() - make_interval(days => ${days * 2}) AND created_at < now() - make_interval(days => ${days}))::int AS vis_prev,
        count(*) FILTER (WHERE kind='article' AND created_at >= now() - make_interval(days => ${days}))::int AS art_cur,
        count(*) FILTER (WHERE kind='article' AND created_at >= now() - make_interval(days => ${days * 2}) AND created_at < now() - make_interval(days => ${days}))::int AS art_prev,
        count(*) FILTER (WHERE kind='news' AND created_at >= now() - make_interval(days => ${days}))::int AS news_cur,
        count(*) FILTER (WHERE kind='news' AND created_at >= now() - make_interval(days => ${days * 2}) AND created_at < now() - make_interval(days => ${days}))::int AS news_prev
      FROM page_views
      WHERE created_at >= now() - make_interval(days => ${days * 2})
    `),
    // Sessions + engaged (multi-page) sessions, current vs previous.
    db.execute<{
      sess_cur: number; eng_cur: number; sess_prev: number; eng_prev: number;
    }>(sql`
      SELECT
        count(*) FILTER (WHERE period='cur')::int AS sess_cur,
        count(*) FILTER (WHERE period='cur' AND c > 1)::int AS eng_cur,
        count(*) FILTER (WHERE period='prev')::int AS sess_prev,
        count(*) FILTER (WHERE period='prev' AND c > 1)::int AS eng_prev
      FROM (
        SELECT session_id,
          CASE WHEN created_at >= now() - make_interval(days => ${days}) THEN 'cur' ELSE 'prev' END AS period,
          count(*) AS c
        FROM page_views
        WHERE created_at >= now() - make_interval(days => ${days * 2})
        GROUP BY 1, 2
      ) t
    `),
    // New subscribers in period vs previous.
    db.execute<{ cur: number; prev: number }>(sql`
      SELECT
        count(*) FILTER (WHERE created_at >= now() - make_interval(days => ${days}))::int AS cur,
        count(*) FILTER (WHERE created_at >= now() - make_interval(days => ${days * 2}) AND created_at < now() - make_interval(days => ${days}))::int AS prev
      FROM subscriptions
    `),
    // Traffic time series (all + per-kind + engaged sessions), bucketed by
    // granularity. Engaged sessions (>1 view) come from a per-session rollup so
    // we can plot an engagement-rate trendline alongside raw traffic.
    db.execute<{
      bucket: string; views: number; visitors: number; sessions: number;
      engaged: number; art_views: number; news_views: number;
    }>(sql`
      WITH per_session AS (
        SELECT date_trunc(${unit}, created_at) AS b,
          session_id,
          visitor_id,
          count(*) AS c,
          count(*) FILTER (WHERE kind='article') AS art,
          count(*) FILTER (WHERE kind='news') AS nws
        FROM page_views
        WHERE created_at >= now() - make_interval(days => ${days})
        GROUP BY 1, 2, 3
      )
      SELECT to_char(b, 'YYYY-MM-DD') AS bucket,
        sum(c)::int AS views,
        count(DISTINCT visitor_id)::int AS visitors,
        count(*)::int AS sessions,
        count(*) FILTER (WHERE c > 1)::int AS engaged,
        sum(art)::int AS art_views,
        sum(nws)::int AS news_views
      FROM per_session
      GROUP BY b ORDER BY b
    `),
    // Previous-period views, bucketed the same way, for the comparison line.
    db.execute<{ bucket: string; views: number }>(sql`
      SELECT to_char(date_trunc(${unit}, created_at), 'YYYY-MM-DD') AS bucket,
        count(*)::int AS views
      FROM page_views
      WHERE created_at >= now() - make_interval(days => ${days * 2})
        AND created_at < now() - make_interval(days => ${days})
      GROUP BY 1 ORDER BY 1
    `),
    // Publication cadence: articles vs news, bucketed.
    db.execute<{ bucket: string; articles: number; news: number }>(sql`
      SELECT to_char(date_trunc(${unit}, published_at), 'YYYY-MM-DD') AS bucket,
        count(*) FILTER (WHERE src='article')::int AS articles,
        count(*) FILTER (WHERE src='news')::int AS news
      FROM (
        SELECT published_at, 'article' AS src FROM articles
          WHERE status='published' AND published_at >= now() - make_interval(days => ${days})
        UNION ALL
        SELECT published_at, 'news' AS src FROM news
          WHERE (pipeline='published' OR pipeline IS NULL) AND published_at >= now() - make_interval(days => ${days})
      ) u
      GROUP BY 1 ORDER BY 1
    `),
    // Referrer sources.
    db.execute<{ source: string; n: number }>(sql`
      SELECT source, count(*)::int AS n FROM page_views
      WHERE created_at >= now() - make_interval(days => ${days})
      GROUP BY source ORDER BY n DESC
    `),
    // Devices.
    db.execute<{ device: string; n: number }>(sql`
      SELECT device, count(*)::int AS n FROM page_views
      WHERE created_at >= now() - make_interval(days => ${days})
      GROUP BY device ORDER BY n DESC
    `),
    // Top ARTICLES by traffic. Kept as its own query (not a slice of a mixed
    // top list) because news out-traffics articles ~15:1, so a combined
    // top-N would contain no articles at all.
    db.execute<{
      id: string; kind: string; title: string; slug: string; category: string;
      views: number; visitors: number;
    }>(sql`
      SELECT pv.content_id AS id, 'article' AS kind,
        COALESCE(a.title, '—') AS title,
        COALESCE(a.slug, pv.content_id) AS slug,
        COALESCE(a.category, '') AS category,
        count(*)::int AS views,
        count(DISTINCT pv.visitor_id)::int AS visitors
      FROM page_views pv
      JOIN articles a ON a.id = pv.content_id
      WHERE pv.kind='article' AND pv.created_at >= now() - make_interval(days => ${days})
      GROUP BY pv.content_id, a.title, a.slug, a.category
      ORDER BY views DESC LIMIT 12
    `),
    // Top NEWS by traffic.
    db.execute<{
      id: string; kind: string; title: string; slug: string; category: string;
      views: number; visitors: number;
    }>(sql`
      SELECT pv.content_id AS id, 'news' AS kind,
        COALESCE(n.title, '—') AS title,
        COALESCE(n.slug, pv.content_id) AS slug,
        COALESCE(n.category, '') AS category,
        count(*)::int AS views,
        count(DISTINCT pv.visitor_id)::int AS visitors
      FROM page_views pv
      JOIN news n ON n.id = pv.content_id
      WHERE pv.kind='news' AND pv.created_at >= now() - make_interval(days => ${days})
      GROUP BY pv.content_id, n.title, n.slug, n.category
      ORDER BY views DESC LIMIT 12
    `),
    // Author traffic (article reads attributed to author).
    db.execute<{
      id: string; name: string; username: string; avatar: string; elite: boolean;
      role: string; followers: number; views: number; visitors: number;
    }>(sql`
      SELECT au.id, au.name, au.username, au.avatar, au.elite, au.role, au.followers,
        count(pv.id)::int AS views,
        count(DISTINCT pv.visitor_id)::int AS visitors
      FROM authors au
      LEFT JOIN page_views pv
        ON pv.author_id = au.id AND pv.created_at >= now() - make_interval(days => ${days})
      GROUP BY au.id, au.name, au.username, au.avatar, au.elite, au.role, au.followers
      ORDER BY views DESC
    `),
    // Published article counts per author.
    db.execute<{ author_id: string; n: number }>(sql`
      SELECT author_id, count(*)::int AS n FROM articles
      WHERE status='published' GROUP BY author_id
    `),
    // Category traffic.
    db.execute<{ category: string; views: number; visitors: number; art: number; nws: number }>(sql`
      SELECT COALESCE(category,'') AS category,
        count(*)::int AS views,
        count(DISTINCT visitor_id)::int AS visitors,
        count(*) FILTER (WHERE kind='article')::int AS art,
        count(*) FILTER (WHERE kind='news')::int AS nws
      FROM page_views
      WHERE created_at >= now() - make_interval(days => ${days}) AND category IS NOT NULL AND category <> ''
      GROUP BY category ORDER BY views DESC
    `),
    // Content counts per category (published articles + news).
    db.execute<{ category: string; articles: number; news: number }>(sql`
      SELECT category,
        count(*) FILTER (WHERE src='article')::int AS articles,
        count(*) FILTER (WHERE src='news')::int AS news
      FROM (
        SELECT category, 'article' AS src FROM articles WHERE status='published'
        UNION ALL
        SELECT category, 'news' AS src FROM news WHERE (pipeline='published' OR pipeline IS NULL)
      ) u
      GROUP BY category
    `),
  ]);

  const k = kpiRow.rows[0] ?? ({} as Record<string, number>);
  const eng = engRow.rows[0] ?? ({} as Record<string, number>);
  const subs = subsRow.rows[0] ?? { cur: 0, prev: 0 };

  const pvCur = k.pv_cur ?? 0;
  const visCur = k.vis_cur ?? 0;
  const sessCur = eng.sess_cur ?? 0;
  const sessPrev = eng.sess_prev ?? 0;
  const ppsCur = sessCur > 0 ? pvCur / sessCur : 0;
  const ppsPrev = sessPrev > 0 ? (k.pv_prev ?? 0) / sessPrev : 0;
  const engCur = sessCur > 0 ? (eng.eng_cur ?? 0) / sessCur : 0;
  const engPrev = sessPrev > 0 ? (eng.eng_prev ?? 0) / sessPrev : 0;

  const overviewKpis: KpiStat[] = [
    { key: "pv", label: "Просмотры страниц", value: fmtCompact(pvCur), raw: pvCur, delta: pctDelta(pvCur, k.pv_prev ?? 0), hint: "Все просмотры материалов и страниц за период" },
    { key: "visitors", label: "Уникальные посетители", value: fmtCompact(visCur), raw: visCur, delta: pctDelta(visCur, k.vis_prev ?? 0), hint: "Отдельные посетители (по анонимному идентификатору)" },
    { key: "sessions", label: "Сессии", value: fmtCompact(sessCur), raw: sessCur, delta: pctDelta(sessCur, sessPrev), hint: "Визиты — серии просмотров одного посетителя" },
    { key: "pps", label: "Страниц за сессию", value: ppsCur.toFixed(2).replace(".", ","), raw: ppsCur, delta: pctDelta(ppsCur, ppsPrev), hint: "Средняя глубина визита", format: "ratio" },
    { key: "engagement", label: "Вовлечённость", value: `${Math.round(engCur * 100)}%`, raw: engCur, delta: pctDelta(engCur, engPrev), hint: "Доля сессий с более чем одним просмотром", format: "pct" },
    { key: "subs", label: "Новые подписки", value: fmtInt(subs.cur), raw: subs.cur, delta: pctDelta(subs.cur, subs.prev), hint: "Новые подписки на авторов за период" },
  ];

  const articleKpis: KpiStat[] = [
    { key: "art_views", label: "Просмотры статей", value: fmtCompact(k.art_cur ?? 0), raw: k.art_cur ?? 0, delta: pctDelta(k.art_cur ?? 0, k.art_prev ?? 0), hint: "Просмотры страниц статей за период" },
    { key: "art_share", label: "Доля трафика", value: pvCur > 0 ? `${Math.round(((k.art_cur ?? 0) / pvCur) * 100)}%` : "0%", raw: pvCur > 0 ? (k.art_cur ?? 0) / pvCur : 0, delta: null, hint: "Какую часть всех просмотров дают статьи", format: "pct" },
  ];
  const newsKpis: KpiStat[] = [
    { key: "news_views", label: "Просмотры новостей", value: fmtCompact(k.news_cur ?? 0), raw: k.news_cur ?? 0, delta: pctDelta(k.news_cur ?? 0, k.news_prev ?? 0), hint: "Просмотры страниц новостей за период" },
    { key: "news_share", label: "Доля трафика", value: pvCur > 0 ? `${Math.round(((k.news_cur ?? 0) / pvCur) * 100)}%` : "0%", raw: pvCur > 0 ? (k.news_cur ?? 0) / pvCur : 0, delta: null, hint: "Какую часть всех просмотров дают новости", format: "pct" },
  ];
  const audienceKpis: KpiStat[] = [
    { key: "visitors2", label: "Посетители", value: fmtCompact(visCur), raw: visCur, delta: pctDelta(visCur, k.vis_prev ?? 0), hint: "Уникальные посетители за период" },
    { key: "returning", label: "Просмотров на посетителя", value: visCur > 0 ? (pvCur / visCur).toFixed(1).replace(".", ",") : "0", raw: visCur > 0 ? pvCur / visCur : 0, delta: null, hint: "Средняя активность одного посетителя", format: "ratio" },
    { key: "eng2", label: "Вовлечённость", value: `${Math.round(engCur * 100)}%`, raw: engCur, delta: pctDelta(engCur, engPrev), hint: "Доля сессий с более чем одним просмотром", format: "pct" },
  ];

  // Merge series onto a continuous axis.
  const axis = buildAxis(unit, days);
  const seriesByBucket = new Map(seriesRes.rows.map((r) => [r.bucket, r]));
  // Previous-period buckets are aligned to the current axis by ordinal position
  // (both windows are `days` long at the same granularity), so bucket i of the
  // previous period lines up under bucket i of the current period.
  const prevViewsByIdx = prevSeriesRes.rows.map((r) => r.views);
  const timeSeries: TimePoint[] = axis.map((a, i) => {
    const r = seriesByBucket.get(a.date);
    const sessions = r?.sessions ?? 0;
    const engaged = r?.engaged ?? 0;
    return {
      date: a.date,
      label: a.label,
      views: r?.views ?? 0,
      visitors: r?.visitors ?? 0,
      sessions,
      articleViews: r?.art_views ?? 0,
      newsViews: r?.news_views ?? 0,
      engagement: sessions > 0 ? Math.round((engaged / sessions) * 100) : 0,
      prevViews: prevViewsByIdx[i] ?? 0,
    };
  });

  const pubsByBucket = new Map(pubsRes.rows.map((r) => [r.bucket, r]));
  const publications: PubPoint[] = axis.map((a) => {
    const r = pubsByBucket.get(a.date);
    return { date: a.date, label: a.label, articles: r?.articles ?? 0, news: r?.news ?? 0 };
  });

  const SOURCE_LABEL: Record<string, string> = {
    search: "Поиск", direct: "Прямые", social: "Соцсети", internal: "Внутренние", referral: "Ссылки",
  };
  const sources: Slice[] = sourcesRes.rows.map((r) => ({
    key: r.source,
    label: SOURCE_LABEL[r.source] ?? r.source,
    value: r.n,
  }));
  const DEVICE_LABEL: Record<string, string> = { desktop: "Компьютер", mobile: "Телефон", tablet: "Планшет" };
  const devices: Slice[] = devicesRes.rows.map((r) => ({
    key: r.device,
    label: DEVICE_LABEL[r.device] ?? r.device,
    value: r.n,
  }));

  const mapTop = (r: (typeof topArtRes.rows)[number]): TopContent => ({
    id: r.id,
    kind: r.kind === "news" ? "news" : "article",
    title: r.title,
    slug: r.slug,
    category: r.category,
    categoryLabel: r.category ? categoryName(r.category) : "—",
    views: r.views,
    visitors: r.visitors,
  });
  const topArticles = topArtRes.rows.map(mapTop);
  const topNews = topNewsRes.rows.map(mapTop);

  const artCounts = new Map(authorArtRes.rows.map((r) => [r.author_id, r.n]));
  const authors: AuthorRow[] = authorsRes.rows.map((r) => {
    const articles = artCounts.get(r.id) ?? 0;
    return {
      id: r.id,
      name: r.name,
      username: r.username,
      avatar: r.avatar,
      elite: r.elite,
      role: r.role,
      followers: r.followers,
      articles,
      views: r.views,
      visitors: r.visitors,
      avgViews: articles > 0 ? Math.round(r.views / articles) : 0,
    };
  });

  const contentByCat = new Map(catContentRes.rows.map((r) => [r.category, r]));
  const totalCatViews = catViewsRes.rows.reduce((s, r) => s + r.views, 0) || 1;
  const categories: CategoryRow[] = catViewsRes.rows.map((r) => {
    const c = contentByCat.get(r.category);
    return {
      key: r.category,
      label: categoryName(r.category),
      articles: c?.articles ?? 0,
      news: c?.news ?? 0,
      views: r.views,
      visitors: r.visitors,
      share: Math.round((r.views / totalCatViews) * 100),
    };
  });

  return {
    filters,
    overviewKpis,
    articleKpis,
    newsKpis,
    audienceKpis,
    timeSeries,
    publications,
    sources,
    devices,
    topArticles,
    topNews,
    authors,
    categories,
    generatedAt: new Date().toISOString(),
  };
}

/** Rich analytics, cached per filter signature (15 min). */
export function getAnalytics(input: Partial<AnalyticsFilters>): Promise<AnalyticsData> {
  const filters = normalizeFilters(input);
  const key = `${filters.range}:${filters.granularity}`;
  return unstable_cache(() => compute(filters), ["admin-analytics-v4", key], {
    revalidate: 900,
    tags: ["admin-analytics"],
  })();
}
