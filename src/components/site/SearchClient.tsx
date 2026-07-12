"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import type { Article, NewsItem, Author } from "@/lib/types";
import { Avatar } from "@/components/ui/kit";
import { categoryName } from "@/lib/taxonomy";
import { formatDate, formatNumber } from "@/lib/utils";

type Tab = "all" | "articles" | "authors" | "news";

/* ---- token helpers ---- */
function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}
function scoreOf(text: string, tokens: string[]): number {
  const t = text.toLowerCase();
  return tokens.reduce((n, tok) => (t.includes(tok) ? n + 1 : n), 0);
}

/* Highlight matched tokens inside a string with <mark>. */
function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  if (tokens.length === 0) return <>{text}</>;
  const escaped = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  const lower = tokens.map((t) => t.toLowerCase());
  const parts = text.split(re).filter((p) => p !== "");
  return (
    <>
      {parts.map((part, i) =>
        lower.includes(part.toLowerCase()) ? (
          <mark
            key={i}
            className="rounded-[2px] bg-[var(--primary)]/20 px-0.5 text-[var(--foreground)]"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

const ROLE_LABEL: Record<string, string> = {
  author: "Автор",
  elite: "Elite-автор",
  ai: "ИИ-автор",
  editor: "Редактор",
  admin: "Администратор",
};

export function SearchClient({
  articles,
  news,
  authors,
}: {
  articles: Article[];
  news: NewsItem[];
  authors: Author[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [tab, setTab] = useState<Tab>("all");

  const tokens = useMemo(() => tokenize(q), [q]);

  const { foundArticles, foundAuthors, foundNews } = useMemo(() => {
    if (tokens.length === 0)
      return { foundArticles: [], foundAuthors: [], foundNews: [] };

    const fa = articles
      .map((a) => ({
        a,
        s:
          scoreOf(a.title, tokens) * 3 +
          scoreOf(a.excerpt, tokens) +
          scoreOf(a.tags.join(" "), tokens) +
          scoreOf(categoryName(a.category), tokens),
      }))
      .filter((x) => x.s > 0)
      .sort((x, y) => y.s - x.s || y.a.views - x.a.views)
      .map((x) => x.a);

    const au = authors
      .map((a) => ({
        a,
        s: scoreOf(a.name, tokens) * 3 + scoreOf(a.bio, tokens) + scoreOf(a.archetype ?? "", tokens),
      }))
      .filter((x) => x.s > 0)
      .sort((x, y) => y.s - x.s || y.a.followers - x.a.followers)
      .map((x) => x.a);

    const nw = news
      .map((n) => ({ n, s: scoreOf(n.title, tokens) * 3 + scoreOf(n.excerpt, tokens) }))
      .filter((x) => x.s > 0)
      .sort((x, y) => y.s - x.s)
      .map((x) => x.n);

    return { foundArticles: fa, foundAuthors: au, foundNews: nw };
  }, [tokens, articles, authors, news]);

  const total = foundArticles.length + foundAuthors.length + foundNews.length;

  // "Также ищут" — top tags across found articles, excluding the query tokens.
  const related = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of foundArticles.slice(0, 12))
      for (const tag of a.tags) {
        if (tokens.some((t) => tag.toLowerCase().includes(t))) continue;
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map((x) => x[0]);
  }, [foundArticles, tokens]);

  const TABS: [Tab, string, number][] = [
    ["all", "Все", total],
    ["articles", "Статьи", foundArticles.length],
    ["authors", "Авторы", foundAuthors.length],
    ["news", "Новости", foundNews.length],
  ];

  const showArticles = tab === "all" || tab === "articles";
  const showAuthors = tab === "all" || tab === "authors";
  const showNews = tab === "all" || tab === "news";

  return (
    <div className="mx-auto max-w-3xl">
      {/* Search box */}
      <div className="mb-7 flex items-center gap-3 rounded-[14px] border-2 border-[var(--primary)] bg-[var(--surface)] px-4 ring-4 ring-[var(--primary)]/10">
        <Search className="h-[18px] w-[18px] shrink-0 text-[var(--primary)]" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по статьям, авторам, новостям…"
          className="flex-1 bg-transparent py-3.5 text-[15px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            aria-label="Очистить"
            className="text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {tokens.length === 0 ? (
        <p className="py-12 text-center text-[var(--muted-foreground)]">
          Введите запрос, чтобы найти статьи, авторов и новости.
        </p>
      ) : (
        <>
          {/* Tabs */}
          <div className="mb-7 flex gap-0 border-b border-[var(--border)]">
            {TABS.map(([key, label, count]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={
                  "-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors first:pl-0 " +
                  (tab === key
                    ? "border-[var(--primary)] font-semibold text-[var(--foreground)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]")
                }
              >
                {label} <span className="text-xs text-[var(--muted-foreground)]">{count}</span>
              </button>
            ))}
          </div>

          {total === 0 ? (
            <p className="py-12 text-center text-[var(--muted-foreground)]">
              По запросу «{q}» ничего не найдено.
            </p>
          ) : (
            <div className="flex flex-col">
              {showArticles &&
                foundArticles.map((a) => <ArticleRow key={a.id} article={a} tokens={tokens} />)}

              {showAuthors &&
                foundAuthors.map((a) => <AuthorRow key={a.id} author={a} tokens={tokens} />)}

              {showNews && foundNews.map((n) => <NewsRow key={n.id} item={n} tokens={tokens} />)}
            </div>
          )}

          {/* Также ищут */}
          {related.length > 0 && (
            <div className="mt-7 border-t border-[var(--border)] pt-5">
              <div className="mb-2.5 text-xs text-[var(--muted-foreground)]">Также ищут:</div>
              <div className="flex flex-wrap gap-2">
                {related.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setQ(r);
                      setTab("all");
                      router.replace(`/search?q=${encodeURIComponent(r)}`);
                    }}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-1.5 text-[13px] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ArticleRow({ article, tokens }: { article: Article; tokens: string[] }) {
  const seo = article.seoScore;
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="grid grid-cols-[1fr_80px] gap-4 border-b border-[var(--border)] py-5"
    >
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--muted-foreground)]">
            Статья · {categoryName(article.category)}
          </span>
          {typeof seo === "number" && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--success)]">
              <span className="h-[5px] w-[5px] rounded-full bg-[var(--success)]" />
              SEO {seo}
            </span>
          )}
        </div>
        <h2 className="mb-1.5 font-serif text-[22px] font-bold leading-tight text-[var(--foreground)]">
          <Highlight text={article.title} tokens={tokens} />
        </h2>
        <p className="mb-2.5 line-clamp-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
          <Highlight text={article.excerpt} tokens={tokens} />
        </p>
        <div className="flex items-center gap-2.5 text-xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1.5">
            <Avatar src={article.author?.avatar} alt={article.author?.name ?? "Автор"} size={16} elite={article.author?.elite} />
            {article.author?.name ?? "Автор"}
          </span>
          <span>·</span>
          <span>
            {formatDate(article.publishedAt)} · {article.readingMinutes} мин · {formatNumber(article.views)} прочт.
          </span>
        </div>
      </div>
      {article.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.cover || "/placeholder.svg"}
          alt=""
          className="h-[60px] w-20 self-start rounded-lg object-cover"
        />
      ) : (
        <div className="h-[60px] w-20 self-start rounded-lg bg-[var(--ink)]" />
      )}
    </Link>
  );
}

function AuthorRow({ author, tokens }: { author: Author; tokens: string[] }) {
  return (
    <div className="border-b border-[var(--border)] py-5">
      <div className="mb-2.5 text-[10px] uppercase tracking-[0.1em] text-[var(--muted-foreground)]">
        Автор
      </div>
      <div className="flex items-center gap-3.5">
        <Avatar src={author.avatar} alt={author.name} size={46} elite={author.elite} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/authors/${author.username}`}
            className="text-[17px] font-bold text-[var(--foreground)] hover:underline"
          >
            {author.name}
          </Link>
          <div className="text-[13px] text-[var(--muted-foreground)]">
            <Highlight text={author.archetype || author.bio || ROLE_LABEL[author.role] || "Автор"} tokens={tokens} />
          </div>
        </div>
        <button className="shrink-0 rounded-full bg-[var(--primary)] px-4 py-2 text-[13px] font-semibold text-[var(--primary-foreground)]">
          Подписаться
        </button>
      </div>
    </div>
  );
}

function NewsRow({ item, tokens }: { item: NewsItem; tokens: string[] }) {
  return (
    <Link href={`/news/${item.slug}`} className="border-b border-[var(--border)] py-5">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--muted-foreground)]">
        Новость
      </div>
      <h2 className="mb-1.5 font-serif text-[20px] font-bold leading-tight text-[var(--foreground)]">
        <Highlight text={item.title} tokens={tokens} />
      </h2>
      <p className="line-clamp-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
        <Highlight text={item.excerpt} tokens={tokens} />
      </p>
    </Link>
  );
}
