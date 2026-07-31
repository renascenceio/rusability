/**
 * Client-safe analytics types + label maps.
 *
 * These live in their OWN module (no `server-only`, no `db`/`next/cache`
 * imports) so the admin AnalyticsWorkspace client component can import the
 * shapes and label constants WITHOUT dragging the server-only data layer into
 * the client bundle. `analytics.ts` re-exports everything here for callers that
 * already import from the data layer.
 */

/* ------------------------------------------------------------------ */
/* Filters                                                             */
/* ------------------------------------------------------------------ */

export type RangeKey = "7" | "30" | "90" | "365" | "all";
export type Granularity = "day" | "week" | "month";

export type AnalyticsFilters = {
  range: RangeKey;
  granularity: Granularity;
};

export const RANGE_DAYS: Record<RangeKey, number> = {
  "7": 7,
  "30": 30,
  "90": 90,
  "365": 365,
  all: 4000,
};

export const RANGE_LABEL: Record<RangeKey, string> = {
  "7": "7 дней",
  "30": "30 дней",
  "90": "90 дней",
  "365": "12 месяцев",
  all: "Всё время",
};

export const GRANULARITY_LABEL: Record<Granularity, string> = {
  day: "По дням",
  week: "По неделям",
  month: "По месяцам",
};

export function normalizeFilters(f: Partial<AnalyticsFilters>): AnalyticsFilters {
  const range: RangeKey = (["7", "30", "90", "365", "all"] as const).includes(f.range as RangeKey)
    ? (f.range as RangeKey)
    : "90";
  let granularity: Granularity = (["day", "week", "month"] as const).includes(
    f.granularity as Granularity,
  )
    ? (f.granularity as Granularity)
    : "day";
  // Guard against absurd bucket counts (e.g. daily over "all").
  const days = RANGE_DAYS[range];
  if (granularity === "day" && days > 120) granularity = "week";
  if (granularity === "week" && days > 800) granularity = "month";
  return { range, granularity };
}

/* ------------------------------------------------------------------ */
/* Result types                                                        */
/* ------------------------------------------------------------------ */

export type KpiStat = {
  key: string;
  label: string;
  value: string;
  raw: number;
  delta: number | null;
  hint: string;
  format?: "int" | "pct" | "ratio";
};

export type TimePoint = {
  date: string;
  label: string;
  views: number;
  visitors: number;
  sessions: number;
  articleViews: number;
  newsViews: number;
};

export type PubPoint = { date: string; label: string; articles: number; news: number };
export type Slice = { key: string; label: string; value: number };
export type TopContent = {
  id: string;
  kind: "article" | "news";
  title: string;
  slug: string;
  category: string;
  categoryLabel: string;
  views: number;
  visitors: number;
};
export type AuthorRow = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  elite: boolean;
  role: string;
  articles: number;
  views: number;
  visitors: number;
  avgViews: number;
  followers: number;
};
export type CategoryRow = {
  key: string;
  label: string;
  articles: number;
  news: number;
  views: number;
  visitors: number;
  share: number;
};

export type AnalyticsData = {
  filters: AnalyticsFilters;
  overviewKpis: KpiStat[];
  articleKpis: KpiStat[];
  newsKpis: KpiStat[];
  audienceKpis: KpiStat[];
  timeSeries: TimePoint[];
  publications: PubPoint[];
  sources: Slice[];
  devices: Slice[];
  topArticles: TopContent[];
  topNews: TopContent[];
  authors: AuthorRow[];
  categories: CategoryRow[];
  generatedAt: string;
};
