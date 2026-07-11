import { Suspense } from "react";
import { publishedArticles } from "@/lib/mock/articles";
import { publishedNews } from "@/lib/mock/news";
import { APPS } from "@/lib/mock/apps";
import { SearchClient } from "@/components/site/SearchClient";

export const metadata = {
  title: "Поиск — Rusability",
};

export default function SearchPage() {
  return (
    <div className="container-editorial py-10 md:py-14">
      <Suspense fallback={<div className="h-64" />}>
        <SearchClient
          articles={publishedArticles()}
          news={publishedNews()}
          apps={APPS}
        />
      </Suspense>
    </div>
  );
}
