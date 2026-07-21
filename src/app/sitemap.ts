import { MetadataRoute } from "next";
import { publishedArticles } from "@/lib/data/articles";
import { publishedNews } from "@/lib/data/news";
import { allAuthors } from "@/lib/data/authors";
import { SITE_URL } from "@/lib/site";

const BASE = SITE_URL;

// Built from live DB content — generate on request, not during the build.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [publishedA, publishedN, authors] = await Promise.all([
    publishedArticles(),
    publishedNews(),
    allAuthors(),
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

  // Public author profile pages (skip any author without a username slug).
  const authorPages = authors
    .filter((a) => a.username)
    .map((a) => ({
      url: `${BASE}/authors/${a.username}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

  // Every static route the new site actually serves (all return 200).
  const staticRoutes = [
    "",
    "/articles",
    "/news",
    "/authors",
    "/search",
    "/subscriptions",
    "/about",
    "/contacts",
    "/privacy",
    "/terms",
    "/cookies",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  return [...staticRoutes, ...articles, ...news, ...authorPages];
}
