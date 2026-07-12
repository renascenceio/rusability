import { Suspense } from "react";
import { publishedArticles } from "@/lib/data/articles";
import { publishedNews } from "@/lib/data/news";
import { allAuthors } from "@/lib/data/authors";
import { SearchClient } from "@/components/site/SearchClient";

export const metadata = {
  title: "Поиск — Rusability",
};

export default async function SearchPage() {
  const [articles, news, authors] = await Promise.all([
    publishedArticles(),
    publishedNews(),
    allAuthors(),
  ]);
  return (
    <div className="container-editorial py-10 md:py-14">
      <Suspense fallback={<div className="h-64" />}>
        <SearchClient articles={articles} news={news} authors={authors} />
      </Suspense>
    </div>
  );
}
