/**
 * Default Russian RSS sources for the automatic news aggregator.
 * Focused on business / marketing / advertising / PR / tech to match the
 * Rusability editorial beats. Admins can add/remove sources in the console.
 * Client-safe (consts only) so both UI and server can import it.
 */
export interface DefaultSource {
  id: string;
  name: string;
  url: string;
  category: "business" | "marketing" | "tech" | "science";
}

/**
 * Build a Google News RSS search URL for a Russian-language topical query.
 * `hl=ru&gl=RU&ceid=RU:ru` returns Russian-language coverage, which naturally
 * includes Russian reporting on world / other-country events. We append a few
 * minus-terms so the most off-topic noise is dropped at the source; the
 * editorial safety filter (content-filter.ts) is the real guardrail.
 */
export function googleNewsUrl(query: string): string {
  const q = `${query} -украина -война -политика`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ru&gl=RU&ceid=RU:ru`;
}

/**
 * Google News topical feeds across the Rusability editorial beats. Each pulls
 * Russian-language coverage on a subject we care about; the aggregator then
 * filters banned topics, dedupes, and AI-rewrites into original notes.
 */
export const GOOGLE_NEWS_TOPICS: { id: string; label: string; query: string; category: DefaultSource["category"] }[] = [
  { id: "gn-marketing", label: "Google News · Маркетинг", query: "маркетинг", category: "marketing" },
  { id: "gn-adv", label: "Google News · Реклама", query: "реклама рекламный рынок", category: "marketing" },
  { id: "gn-pr", label: "Google News · PR и коммуникации", query: "PR коммуникации бренд репутация", category: "marketing" },
  { id: "gn-smm", label: "Google News · SMM и соцсети", query: "SMM продвижение в соцсетях контент-маркетинг", category: "marketing" },
  { id: "gn-branding", label: "Google News · Брендинг", query: "брендинг айдентика ребрендинг", category: "marketing" },
  { id: "gn-startups", label: "Google News · Стартапы", query: "стартапы венчурные инвестиции", category: "business" },
  { id: "gn-ecommerce", label: "Google News · E-commerce", query: "электронная коммерция интернет-магазин маркетплейс", category: "business" },
  { id: "gn-sales", label: "Google News · Продажи и B2B", query: "продажи B2B клиентский сервис", category: "business" },
  { id: "gn-hr", label: "Google News · HR и работа", query: "HR подбор персонала рынок труда", category: "business" },
  { id: "gn-smb", label: "Google News · Малый бизнес", query: "малый бизнес предпринимательство", category: "business" },
  { id: "gn-ai", label: "Google News · Искусственный интеллект", query: "искусственный интеллект нейросети", category: "tech" },
  { id: "gn-it", label: "Google News · Технологии и IT", query: "технологии IT цифровизация", category: "tech" },
  { id: "gn-fintech", label: "Google News · Финтех", query: "финтех финансовые технологии платежи", category: "tech" },
  { id: "gn-science", label: "Google News · Наука и исследования", query: "наука исследования открытия", category: "science" },
];

export const DEFAULT_NEWS_SOURCES: DefaultSource[] = [
  { id: "vc", name: "vc.ru", url: "https://vc.ru/rss/all", category: "business" },
  { id: "sostav", name: "Sostav.ru", url: "https://www.sostav.ru/rss/", category: "marketing" },
  { id: "rb", name: "RB.RU", url: "https://rb.ru/feeds/all/", category: "business" },
  { id: "habr", name: "Habr", url: "https://habr.com/ru/rss/articles/?fl=ru", category: "tech" },
  { id: "lenta-ec", name: "Лента.ру", url: "https://lenta.ru/rss/news", category: "business" },
  ...GOOGLE_NEWS_TOPICS.map((t) => ({ id: t.id, name: t.label, url: googleNewsUrl(t.query), category: t.category })),
];
