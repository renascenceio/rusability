import { latestNews, popularNews } from "@/lib/mock/news";
import { NewsBrowser } from "@/components/site/NewsBrowser";
import { NewsMiniCard } from "@/components/site/NewsCard";
import { TrendingUp } from "lucide-react";

export const metadata = {
  title: "Новости — Rusability",
  description: "Актуальные новости технологий, маркетинга и бизнеса.",
};

export default function NewsPage() {
  const news = latestNews();
  const popular = popularNews(5);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-[var(--foreground)]">Новости</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Лента индустрии: технологии, маркетинг, бизнес и наука.
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        <NewsBrowser news={news} />
        <aside>
          <div className="sticky top-24">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="font-serif text-xl font-bold text-[var(--foreground)]">Самое читаемое</h2>
            </div>
            <div className="grid gap-3">
              {popular.map((n) => (
                <NewsMiniCard key={n.id} item={n} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
