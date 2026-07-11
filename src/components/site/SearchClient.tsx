"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, FileText, Newspaper, AppWindow } from "lucide-react";
import type { Article, NewsItem, AppTool } from "@/lib/types";
import { ArticleCard } from "@/components/site/ArticleCard";
import { NewsRow } from "@/components/site/NewsCard";
import { Input, Chip } from "@/components/ui/kit";

type Tab = "all" | "articles" | "news" | "apps";

export function SearchClient({
  articles,
  news,
  apps,
}: {
  articles: Article[];
  news: NewsItem[];
  apps: AppTool[];
}) {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [tab, setTab] = useState<Tab>("all");
  const query = q.trim().toLowerCase();

  const { foundArticles, foundNews, foundApps } = useMemo(() => {
    if (!query) return { foundArticles: [], foundNews: [], foundApps: [] };
    const match = (s: string) => s.toLowerCase().includes(query);
    return {
      foundArticles: articles.filter(
        (a) => match(a.title) || match(a.excerpt) || a.tags.some(match),
      ),
      foundNews: news.filter((n) => match(n.title) || match(n.excerpt)),
      foundApps: apps.filter((a) => match(a.name) || match(a.tagline) || match(a.description)),
    };
  }, [query, articles, news, apps]);

  const total = foundArticles.length + foundNews.length + foundApps.length;
  const showArticles = (tab === "all" || tab === "articles") && foundArticles.length > 0;
  const showNews = (tab === "all" || tab === "news") && foundNews.length > 0;
  const showApps = (tab === "all" || tab === "apps") && foundApps.length > 0;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 font-serif text-4xl font-bold text-[var(--foreground)]">Поиск</h1>

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <Input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Статьи, новости, инструменты…"
          className="h-14 pl-12 text-base"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {([
          ["all", "Всё"],
          ["articles", "Статьи"],
          ["news", "Новости"],
          ["apps", "Инструменты"],
        ] as [Tab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}>
            <Chip active={tab === key}>{label}</Chip>
          </button>
        ))}
      </div>

      {!query ? (
        <p className="py-12 text-center text-[var(--muted-foreground)]">
          Введите запрос, чтобы найти материалы.
        </p>
      ) : total === 0 ? (
        <p className="py-12 text-center text-[var(--muted-foreground)]">
          По запросу «{q}» ничего не найдено.
        </p>
      ) : (
        <div className="space-y-10">
          {showArticles && (
            <section>
              <SectionLabel icon={<FileText className="h-4 w-4" />} label={`Статьи · ${foundArticles.length}`} />
              <div className="grid gap-6 sm:grid-cols-2">
                {foundArticles.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          )}

          {showNews && (
            <section>
              <SectionLabel icon={<Newspaper className="h-4 w-4" />} label={`Новости · ${foundNews.length}`} />
              <div className="divide-y divide-[var(--border)]">
                {foundNews.map((n) => (
                  <NewsRow key={n.id} item={n} />
                ))}
              </div>
            </section>
          )}

          {showApps && (
            <section>
              <SectionLabel icon={<AppWindow className="h-4 w-4" />} label={`Инструменты · ${foundApps.length}`} />
              <div className="grid gap-3 sm:grid-cols-2">
                {foundApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--foreground)]">{app.name}</div>
                      <div className="truncate text-sm text-[var(--muted-foreground)]">
                        {app.tagline}
                      </div>
                    </div>
                    <button className="shrink-0 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]">
                      Попробовать
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
      {icon}
      {label}
    </div>
  );
}
