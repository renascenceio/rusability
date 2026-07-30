import { Suspense } from "react";
import { publishedArticles } from "@/lib/data/articles";
import { publishedNews } from "@/lib/data/news";
import { allAuthors } from "@/lib/data/authors";
import { SearchClient } from "@/components/site/SearchClient";

export const metadata = {
  title: "Поиск — Rusability",
};

// Reads live published content from the DB — render at request time.
export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const [articles, news, authors] = await Promise.all([
    publishedArticles(),
    publishedNews(),
    allAuthors(),
  ]);

  // Client-side search only ever reads these fields per row. Ship a slim,
  // serializable payload instead of the full corpus so the HTML transfer and
  // hydration stay light even with thousands of items.
  const articleDocs = articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    cover: a.cover,
    category: a.category,
    tags: a.tags,
    views: a.views,
    readingMinutes: a.readingMinutes,
    publishedAt: a.publishedAt,
    seoScore: a.seoScore,
    author: a.author
      ? { name: a.author.name, avatar: a.author.avatar, elite: a.author.elite }
      : undefined,
  }));
  // News is high-volume; search over the most recent window keeps the payload
  // light while still covering everything a reader is likely to look for.
  const newsDocs = news.slice(0, 600).map((n) => ({
    id: n.id,
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
  }));
  const authorDocs = authors.map((a) => ({
    id: a.id,
    username: a.username,
    name: a.name,
    avatar: a.avatar,
    bio: a.bio,
    archetype: a.archetype,
    role: a.role,
    elite: a.elite,
    followers: a.followers,
  }));

  return (
    <div className="container-editorial py-10 md:py-14">
      <Suspense fallback={<div className="h-64" />}>
        <SearchClient articles={articleDocs} news={newsDocs} authors={authorDocs} />
      </Suspense>
    </div>
  );
}
