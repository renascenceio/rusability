"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Crown } from "lucide-react";
import type { Article } from "@/lib/types";
import { CATEGORIES } from "@/lib/mock/categories";
import { ArticleCard } from "@/components/site/ArticleCard";
import { cn } from "@/lib/utils";

export function ArticlesBrowser({ articles }: { articles: Article[] }) {
  const params = useSearchParams();
  const [category, setCategory] = useState<string>(params.get("category") ?? "all");
  const [tier, setTier] = useState<string>(params.get("tier") ?? "all");
  const [sort, setSort] = useState<"new" | "popular">("new");

  const filtered = useMemo(() => {
    let list = [...articles];
    if (category !== "all") list = list.filter((a) => a.category === category);
    if (tier !== "all") list = list.filter((a) => a.tier === tier);
    list.sort((a, b) =>
      sort === "new"
        ? +new Date(b.publishedAt) - +new Date(a.publishedAt)
        : b.views - a.views,
    );
    return list;
  }, [articles, category, tier, sort]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 border-b border-[var(--border)] pb-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
            Все
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.slug}
              active={category === c.slug}
              onClick={() => setCategory(c.slug)}
            >
              {c.name}
            </FilterChip>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <FilterChip active={tier === "elite"} onClick={() => setTier(tier === "elite" ? "all" : "elite")}>
            <Crown className="h-3.5 w-3.5" /> Elite
          </FilterChip>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "new" | "popular")}
            className="h-9 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)] outline-none"
          >
            <option value="new">Сначала новые</option>
            <option value="popular">Популярные</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[var(--muted-foreground)]">
          Ничего не найдено. Попробуйте изменить фильтры.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
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
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--primary)]",
      )}
    >
      {children}
    </button>
  );
}
