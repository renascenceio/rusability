import { PageHeader } from "@/components/admin/ui";
import { getSetting } from "@/lib/data/settings";
import { publishedArticles } from "@/lib/data/articles";
import { publishedNews } from "@/lib/data/news";
import { allAuthors } from "@/lib/data/authors";
import { SeoWorkspace } from "./SeoWorkspace";
import type { SeoMeta, RobotsSettings } from "./actions";

// Number of static routes listed in app/sitemap.ts (keep in sync with it).
const STATIC_ROUTE_COUNT = 11;

export const metadata = { title: "SEO / AEO / GEO — Rusability" };
export const dynamic = "force-dynamic";

const DEFAULT_META: SeoMeta = {
  title: "Rusability — деловое медиа о маркетинге, бизнесе и технологиях",
  description:
    "Аналитика, тренды и практика цифрового маркетинга, бизнеса и технологий. Экспертные статьи и новости для профессионалов.",
  ogImage: "/brand/og-default.png",
  keywords: "маркетинг, бизнес, технологии, SEO, аналитика",
};
const DEFAULT_ROBOTS: RobotsSettings = { index: true, follow: true, ai: true, sitemap: true };

export default async function AdminSeoPage() {
  const [meta, robots, articles, news, authors] = await Promise.all([
    getSetting<SeoMeta>("seo_meta", DEFAULT_META),
    getSetting<RobotsSettings>("seo_robots", DEFAULT_ROBOTS),
    publishedArticles(),
    publishedNews(),
    allAuthors(),
  ]);

  // Real breakdown of what /sitemap.xml actually contains (matches app/sitemap.ts).
  const authorPages = authors.filter((a) => a.username).length;
  const sitemapStats = {
    articles: articles.length,
    news: news.length,
    authors: authorPages,
    staticPages: STATIC_ROUTE_COUNT,
    total: STATIC_ROUTE_COUNT + articles.length + news.length + authorPages,
  };

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="SEO / AEO / GEO"
        subtitle="Мета-теги, карта сайта, robots.txt, редиректы и оптимизация под ИИ-поиск."
      />
      <SeoWorkspace initialMeta={meta} initialRobots={robots} sitemapStats={sitemapStats} />
    </div>
  );
}
