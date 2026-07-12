"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Crown } from "lucide-react";
import type { Article } from "@/lib/types";
import { CATEGORIES, categoryName, categoryAccent } from "@/lib/taxonomy";
import { CategoryTabs, type TabItem } from "@/components/site/CategoryTabs";
import { Avatar, formatCount } from "@/components/ui/kit";

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

  // Dynamic tab ordering: categories with the most fresh material (published in
  // the last 24h) sit closest to the left, with total volume as a tiebreak.
  // (Per-user personalisation / most-viewed weights can be layered on top of
  // this same ordering once reader-level signals are tracked.)
  const orderedTabs = useMemo<TabItem[]>(() => {
    const now = Date.now();
    const DAY = 86_400_000;
    const recent = new Map<string, number>();
    const total = new Map<string, number>();
    for (const a of articles) {
      total.set(a.category, (total.get(a.category) ?? 0) + 1);
      if (now - +new Date(a.publishedAt) <= DAY) {
        recent.set(a.category, (recent.get(a.category) ?? 0) + 1);
      }
    }
    const sorted = [...CATEGORIES].sort((x, y) => {
      const dr = (recent.get(y.slug) ?? 0) - (recent.get(x.slug) ?? 0);
      if (dr !== 0) return dr;
      return (total.get(y.slug) ?? 0) - (total.get(x.slug) ?? 0);
    });
    return [
      { slug: "all", label: "Все" },
      ...sorted.map((c) => ({ slug: c.slug, label: c.name })),
    ];
  }, [articles]);

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

      {/* Filters — single line with overflow "Ещё" dropdown */}
      <CategoryTabs
        items={orderedTabs}
        active={category}
        onSelect={(slug) => {
          setCategory(slug);
          setLimit(PAGE_SIZE);
        }}
      />

      {visible.length === 0 ? (
        <p className="py-16 text-center text-[var(--muted-foreground)]">
          Ничего не найдено. Попробуйте изменить фильтры.
        </p>
      ) : (
        <div className="grid auto-rows-auto grid-cols-1 items-start gap-x-9 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((a, i) => {
            const featured = i === 0;
            if (featured) {
              return (
                <div key={a.id} className="sm:col-span-2">
                  <FeaturedCard article={a} />
                </div>
              );
            }
            return a.tier === "elite" ? (
              <EliteCard key={a.id} article={a} />
            ) : (
              <PlainCard key={a.id} article={a} />
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

/* ---------- Featured card (span-2, full-bleed overlay) ---------- */
function FeaturedCard({ article }: { article: Article }) {
  const author = article.author;
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-[20px] bg-[var(--ink)] p-6 text-white"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={article.cover || "/placeholder.svg"}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

      <div className="absolute left-5 top-5 flex items-center gap-2.5">
        {article.tier === "elite" && (
          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--gold)] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#3a2a10]">
            <Crown className="h-3 w-3" /> Elite
          </span>
        )}
        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/60">
          {categoryName(article.category)}
        </span>
      </div>

      <div className="relative">
        <h2 className="max-w-xl font-serif text-2xl font-bold leading-snug text-balance text-white md:text-[28px]">
          {article.title}
        </h2>
        <div className="mt-4 flex items-center gap-2.5 text-[13px]">
          {author && <Avatar src={author.avatar} alt={author.name} size={30} />}
          <span className="font-semibold text-white/90">{author?.name}</span>
          <span className="text-white/30">·</span>
          <span className="text-white/55">
            {article.readingMinutes} мин · {formatCount(article.claps)} ♥
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ---------- Elite card (contained dark, image top + dark body) ---------- */
function EliteCard({ article }: { article: Article }) {
  const author = article.author;
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[16px] bg-[var(--ink)] text-white transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative h-[190px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.cover || "/placeholder.svg"}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1 rounded-md bg-[var(--gold)] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#3a2a10]">
          <Crown className="h-3 w-3" /> Elite
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/50">
          {categoryName(article.category)}
        </div>
        <h3 className="font-serif text-[23px] font-bold leading-snug text-balance text-white">
          {article.title}
        </h3>
        <div className="mt-auto flex items-center gap-2 pt-5 text-xs text-white/55">
          {author && <Avatar src={author.avatar} alt={author.name} size={22} />}
          <span className="text-white/80">{author?.name}</span>
          <span className="text-white/30">·</span>
          <span>{article.readingMinutes} мин</span>
          <span className="ml-auto text-white/40">{formatCount(article.claps)} ♥</span>
        </div>
      </div>
    </Link>
  );
}

/* ---------- Plain card (bare: rounded image + text on page bg) ---------- */
function PlainCard({ article }: { article: Article }) {
  const author = article.author;
  return (
    <Link href={`/articles/${article.slug}`} className="group flex h-full flex-col">
      <div className="mb-4 h-[190px] overflow-hidden rounded-[16px] bg-[var(--surface-3)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.cover || "/placeholder.svg"}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div
        className="mb-1.5 text-[10px] font-bold uppercase tracking-wider"
        style={{ color: catColor(article.category) }}
      >
        {categoryName(article.category)}
      </div>
      <h3 className="font-serif text-[23px] font-bold leading-snug text-balance text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
        {article.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
        {article.excerpt}
      </p>
      <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-[var(--muted-foreground)]">
        {author && <Avatar src={author.avatar} alt={author.name} size={22} />}
        <span className="text-[var(--foreground)]">{author?.name}</span>
        <span className="text-[var(--muted-foreground)]/50">·</span>
        <span>{article.readingMinutes} мин</span>
        <span className="ml-auto text-[var(--muted-foreground)]/70">
          {formatCount(article.claps)} ♥
        </span>
      </div>
    </Link>
  );
}


