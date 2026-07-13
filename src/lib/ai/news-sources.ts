/**
 * Default RSS sources for the automatic news aggregator.
 * Focused on business / marketing / tech / fintech / biotech / AI / startups /
 * e-commerce / science to match the Rusability editorial beats. Admins can
 * add/remove sources in the console.
 * Client-safe (consts only) so both UI and server can import it.
 */
import type { NewsCategory } from "@/lib/types";

export interface DefaultSource {
  id: string;
  name: string;
  url: string;
  category: NewsCategory;
}

/**
 * Build a Google News RSS search URL for a Russian-language topical query.
 * `hl=ru&gl=RU&ceid=RU:ru` returns Russian-language coverage, which naturally
 * includes Russian reporting on world / other-country events. We append a few
 * minus-terms so the most off-topic noise is dropped at the source; the
 * editorial safety + relevance filters (content-filter.ts) are the real guard.
 */
export function googleNewsUrl(query: string): string {
  const q = `${query} -украина -война -политика -спорт -футбол`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ru&gl=RU&ceid=RU:ru`;
}

/**
 * English-language Google News feed. Items are AI-rewritten into original
 * Russian notes, so we can tap global coverage the Russian press hasn't picked
 * up yet. Minus-terms trim the worst off-topic noise at the source.
 */
export function googleNewsUrlEn(query: string): string {
  const q = `${query} -ukraine -war -politics -sport -football -celebrity`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
}

/**
 * Simplified-Chinese Google News feed (mainland). Also AI-translated + rewritten
 * into Russian. Useful for fintech / hardware / e-commerce / AI coverage that
 * originates in China.
 */
export function googleNewsUrlZh(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=zh-CN&gl=CN&ceid=CN:zh-Hans`;
}

/**
 * Russian-language Google News topical feeds across the Rusability editorial
 * beats. Each pulls Russian coverage on a subject we care about; the aggregator
 * then filters banned/off-topic items, dedupes, and AI-rewrites into notes.
 */
export const GOOGLE_NEWS_TOPICS: { id: string; label: string; query: string; category: NewsCategory }[] = [
  { id: "gn-marketing", label: "Google News · Маркетинг", query: "маркетинг", category: "marketing" },
  { id: "gn-adv", label: "Google News · Реклама", query: "реклама рекламный рынок", category: "marketing" },
  { id: "gn-pr", label: "Google News · PR и коммуникации", query: "PR коммуникации бренд репутация", category: "marketing" },
  { id: "gn-smm", label: "Google News · SMM и соцсети", query: "SMM продвижение в соцсетях контент-маркетинг", category: "marketing" },
  { id: "gn-branding", label: "Google News · Брендинг", query: "брендинг айдентика ребрендинг", category: "marketing" },
  { id: "gn-startups", label: "Google News · Стартапы", query: "стартапы венчурные инвестиции", category: "startups" },
  { id: "gn-ecommerce", label: "Google News · E-commerce", query: "электронная коммерция интернет-магазин маркетплейс", category: "ecommerce" },
  { id: "gn-sales", label: "Google News · Продажи и B2B", query: "продажи B2B клиентский сервис", category: "business" },
  { id: "gn-hr", label: "Google News · HR и работа", query: "HR подбор персонала рынок труда", category: "business" },
  { id: "gn-smb", label: "Google News · Малый бизнес", query: "малый бизнес предпринимательство", category: "business" },
  { id: "gn-ai", label: "Google News · Нейросети и ИИ", query: "искусственный интеллект нейросети", category: "ai" },
  { id: "gn-it", label: "Google News · Технологии и IT", query: "технологии IT цифровизация", category: "tech" },
  { id: "gn-fintech", label: "Google News · Финтех", query: "финтех финансовые технологии платежи", category: "fintech" },
  { id: "gn-biotech", label: "Google News · Биотех", query: "биотехнологии генетика фарма медтех", category: "biotech" },
  { id: "gn-science", label: "Google News · Наука и исследования", query: "наука исследования открытия", category: "science" },
];

/**
 * Foreign-language topical feeds (English + Chinese). AI-translated + rewritten
 * into Russian on publish. Kept to the beats where global coverage is ahead of
 * the Russian press (AI, tech, fintech, biotech, startups, e-commerce).
 */
export const FOREIGN_NEWS_TOPICS: {
  id: string;
  label: string;
  query: string;
  lang: "en" | "zh";
  category: NewsCategory;
}[] = [
  // English
  { id: "gn-en-ai", label: "Google News EN · AI", query: "artificial intelligence", lang: "en", category: "ai" },
  { id: "gn-en-tech", label: "Google News EN · Tech", query: "technology software", lang: "en", category: "tech" },
  { id: "gn-en-fintech", label: "Google News EN · Fintech", query: "fintech payments banking technology", lang: "en", category: "fintech" },
  { id: "gn-en-biotech", label: "Google News EN · Biotech", query: "biotech biotechnology genomics", lang: "en", category: "biotech" },
  { id: "gn-en-startups", label: "Google News EN · Startups", query: "startups venture capital funding", lang: "en", category: "startups" },
  { id: "gn-en-ecom", label: "Google News EN · E-commerce", query: "ecommerce online retail marketplace", lang: "en", category: "ecommerce" },
  { id: "gn-en-mktg", label: "Google News EN · Marketing", query: "digital marketing advertising", lang: "en", category: "marketing" },
  // Chinese (simplified)
  { id: "gn-zh-ai", label: "Google News ZH · 人工智能", query: "人工智能", lang: "zh", category: "ai" },
  { id: "gn-zh-tech", label: "Google News ZH · 科技", query: "科技", lang: "zh", category: "tech" },
  { id: "gn-zh-fintech", label: "Google News ZH · 金融科技", query: "金融科技", lang: "zh", category: "fintech" },
  { id: "gn-zh-biotech", label: "Google News ZH · 生物科技", query: "生物科技", lang: "zh", category: "biotech" },
  { id: "gn-zh-startups", label: "Google News ZH · 创业融资", query: "创业 融资", lang: "zh", category: "startups" },
  { id: "gn-zh-ecom", label: "Google News ZH · 电子商务", query: "电子商务", lang: "zh", category: "ecommerce" },
];

export const DEFAULT_NEWS_SOURCES: DefaultSource[] = [
  { id: "vc", name: "vc.ru", url: "https://vc.ru/rss/all", category: "business" },
  { id: "sostav", name: "Sostav.ru", url: "https://www.sostav.ru/rss/", category: "marketing" },
  { id: "rb", name: "RB.RU", url: "https://rb.ru/feeds/all/", category: "business" },
  { id: "habr", name: "Habr", url: "https://habr.com/ru/rss/articles/?fl=ru", category: "tech" },
  ...GOOGLE_NEWS_TOPICS.map((t) => ({ id: t.id, name: t.label, url: googleNewsUrl(t.query), category: t.category })),
  ...FOREIGN_NEWS_TOPICS.map((t) => ({
    id: t.id,
    name: t.label,
    url: t.lang === "en" ? googleNewsUrlEn(t.query) : googleNewsUrlZh(t.query),
    category: t.category,
  })),
];
