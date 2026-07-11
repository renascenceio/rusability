import { publishedArticles } from "@/lib/mock/articles";
import { ArticlesBrowser } from "@/components/site/ArticlesBrowser";

export const metadata = {
  title: "Статьи — Rusability",
  description: "Разборы, гайды и исследования о дизайне, маркетинге, UX и технологиях.",
};

export default function ArticlesPage() {
  const articles = publishedArticles();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-[var(--foreground)]">Статьи</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Разборы, гайды и исследования от авторов и экспертов индустрии.
        </p>
      </header>
      <ArticlesBrowser articles={articles} />
    </div>
  );
}
