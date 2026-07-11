import { Suspense } from "react";
import { publishedArticles } from "@/lib/data/articles";
import { publishedNews } from "@/lib/data/news";
import { allApps } from "@/lib/data/apps";
import { SearchClient } from "@/components/site/SearchClient";

export const metadata = {
  title: "Поиск — Rusability",
};

export default async function SearchPage() {
  const [articles, news, apps] = await Promise.all([
    publishedArticles(),
    publishedNews(),
    allApps(),
  ]);
  return (
    <div className="container-editorial py-10 md:py-14">
      <Suspense fallback={<div className="h-64" />}>
        <SearchClient articles={articles} news={news} apps={apps} />
      </Suspense>
    </div>
  );
}
