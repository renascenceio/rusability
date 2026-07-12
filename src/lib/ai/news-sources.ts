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

export const DEFAULT_NEWS_SOURCES: DefaultSource[] = [
  { id: "vc", name: "vc.ru", url: "https://vc.ru/rss/all", category: "business" },
  { id: "sostav", name: "Sostav.ru", url: "https://www.sostav.ru/rss/", category: "marketing" },
  { id: "rb", name: "RB.RU", url: "https://rb.ru/feeds/all/", category: "business" },
  { id: "habr", name: "Habr", url: "https://habr.com/ru/rss/articles/?fl=ru", category: "tech" },
  { id: "lenta-ec", name: "Лента.ру", url: "https://lenta.ru/rss/news", category: "business" },
];
