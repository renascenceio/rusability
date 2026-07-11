import { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/mock/articles";
import { NEWS } from "@/lib/mock/news";

const BASE = "https://rusability.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = ARTICLES.filter((a) => a.status === "published").map((a) => ({
    url: `${BASE}/articles/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const news = NEWS.filter((n) => n.pipeline === "published").map((n) => ({
    url: `${BASE}/news/${n.slug}`,
    lastModified: new Date(n.publishedAt),
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
