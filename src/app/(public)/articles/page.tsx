import { Suspense } from "react";
import { publishedArticles } from "@/lib/data/articles";
import { ArticlesBrowser } from "@/components/site/ArticlesBrowser";

export const metadata = {
  title: "Статьи — Rusability",
  description: "Аналитика, практика и мнения о маркетинге, дизайне и технологиях.",
};

// Reads live published articles from the DB — render at request time.
export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = await publishedArticles();
  return (
    <div className="container-editorial py-9 md:py-12">
      <div className="mx-auto max-w-5xl">
        <Suspense fallback={<div className="h-64" />}>
          <ArticlesBrowser articles={articles} />
        </Suspense>
      </div>
    </div>
  );
}
