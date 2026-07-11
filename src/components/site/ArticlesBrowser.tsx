"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Heart, Crown } from "lucide-react";
import type { Article } from "@/lib/types";
import { CATEGORIES, categoryName, categoryAccent } from "@/lib/mock/categories";
import { getAuthor } from "@/lib/mock/authors";
import { Avatar, formatCount } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

const ACCENT_VAR: Record<string, string> = {
  primary: "var(--primary)",
  accent: "var(--accent)",
  gold: "var(--gold-ink)",
  success: "var(--success)",
};
function catColor(cat: string): string {
  return ACCENT_VAR[categoryAccent(cat)] ?? "var(--primary)";
}

const PAGE_SIZE = 9;

export function ArticlesBrowser({ articles }: { articles: Article[] }) {
  const params = useSearchParams();
  const [category, setCategory] = useState<string>(params.get("category") ?? "all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let list = [...articles];
    if (category !== "all") list = list.filter((a) => a.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
    return list;
  }, [articles, category, query]);

  const visible = filtered.slice(0, limit);

  return (
    <div>
      {/* Header */}
      <header className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-5xl font-black text-[var(--foreground)]">
            Статьи
          </h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Аналитика, практика и мнения о маркетинге, дизайне и технологиях
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE_SIZE);
            }}
            placeholder="Поиск статей…"
            className="w-full rounded-full border border-[var(--border)] bg-[var(--surface)] py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
      </header>

      {/* Filters — plain text tabs */}
      <div className="mb-9 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[var(--border)] pb-3">
        <FilterTab active={category === "all"} onClick={() => setCategory("all")}>
          Все
        </FilterTab>
        {CATEGORIES.map((c) => (
          <FilterTab
            key={c.slug}
            active={category === c.slug}
            onClick={() => {
              setCategory(c.slug);
              setLimit(PAGE_SIZE);
            }}
          >
            {c.name}
          </FilterTab>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-[var(--muted-foreground)]">
          Ничего не найдено. Попробуйте изменить фильтры.
        </p>
      ) : (
        <div className="grid auto-rows-auto grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((a, i) => {
            const featured = i === 0;
            const dark = featured || a.tier === "elite";
            return (
              <div key={a.id} className={cn(featured && "sm:col-span-2")}>
                {dark ? (
                  <DarkCard article={a} wide={featured} />
                ) : (
                  <LightCard article={a} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {limit < filtered.length && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setLimit((l) => l + PAGE_SIZE)}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-7 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            Показать ещё статьи
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Dark overlay card (featured / Elite) ---------- */
function DarkCard({ article, wide }: { article: Article; wide?: boolean }) {
  const author = getAuthor(article.authorId);
  return (
    <Link
      href={`/articles/${article.slug}`}
      className={cn(
        "group relative flex flex-col justify-end overflow-hidden rounded-[22px] bg-[var(--ink)] p-6 text-white",
        wide ? "min-h-[340px]" : "min-h-[420px]",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={article.cover || "/placeholder.svg"}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15" />

      <div className="absolute left-5 top-5 flex items-center gap-2">
        {article.tier === "elite" && (
          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--gold)] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3a2a10]">
            <Crown className="h-3 w-3" /> Elite
          </span>
        )}
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
          {categoryName(article.category)}
        </span>
      </div>

      <div className="relative">
        <h3
          className={cn(
            "font-serif font-bold leading-snug text-balance text-white",
            wide ? "max-w-xl text-2xl md:text-3xl" : "text-xl",
          )}
        >
          {article.title}
        </h3>
        <div className="mt-4 flex items-center gap-2 text-xs text-white/70">
          {author && <Avatar src={author.avatar} alt={author.name} size={24} />}
          <span className="font-medium text-white/90">{author?.name}</span>
          <span>·</span>
          <span>{article.readingMinutes} мин</span>
          <span className="ml-1 inline-flex items-center gap-1">
            · {formatCount(article.claps)} <Heart className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ---------- Light card (default) ---------- */
function LightCard({ article }: { article: Article }) {
  const author = getAuthor(article.authorId);
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-3)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.cover || "/placeholder.svg"}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div
          className="mb-2 text-[11px] font-bold uppercase tracking-wider"
          style={{ color: catColor(article.category) }}
        >
          {categoryName(article.category)}
        </div>
        <h3 className="font-serif text-xl font-bold leading-snug text-balance text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
          {article.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <div className="flex items-center gap-2">
            {author && <Avatar src={author.avatar} alt={author.name} size={26} />}
            <span className="text-sm font-medium text-[var(--foreground)]">
              {author?.name}
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">
              · {article.readingMinutes} мин
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            {formatCount(article.claps)} <Heart className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative pb-2 text-sm font-medium transition-colors",
        active
          ? "text-[var(--primary)]"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
      )}
    >
      {children}
      {active && (
        <span className="absolute -bottom-[13px] left-0 h-0.5 w-full rounded-full bg-[var(--primary)]" />
      )}
    </button>
  );
}
