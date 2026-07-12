import { MetadataRoute } from "next";
import { publishedArticles } from "@/lib/data/articles";
import { publishedNews } from "@/lib/data/news";
import { SITE_URL } from "@/lib/site";

const BASE = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [publishedA, publishedN] = await Promise.all([
    publishedArticles(),
    publishedNews(),
  ]);

  const articles = publishedA.map((a) => ({
    url: `${BASE}/articles/${a.slug}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const news = publishedN.map((n) => ({
    url: `${BASE}/news/${n.slug}`,
    lastModified: n.publishedAt ? new Date(n.publishedAt) : new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const staticRoutes = ["", "/articles", "/news", "/events", "/apps", "/search"].map(
    (path) => ({
      url: `${BASE}${path}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: path === "" ? 1 : 0.6,
    }),
  );

  return [...staticRoutes, ...articles, ...news];
}
