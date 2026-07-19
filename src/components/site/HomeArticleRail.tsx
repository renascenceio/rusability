"use client";

import { useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { categoryName } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "popular", label: "Популярное" },
  { key: "fresh", label: "Свежее" },
  { key: "editorial", label: "Редакция" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type Props = {
  popular: Article[];
  fresh: Article[];
  editorial: Article[];
  limit?: number;
};

export function HomeArticleRail({ popular, fresh, editorial, limit = 7 }: Props) {
  const [active, setActive] = useState<TabKey>("popular");
  const items = { popular, fresh, editorial }[active].slice(0, limit);

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div
        className="flex gap-1 border-b border-[var(--border)] p-1.5"
        role="tablist"
        aria-label="Подборки статей"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active === tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              "flex-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-colors",
              active === tab.key
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ol className="flex flex-1 flex-col px-4 py-1" role="tabpanel">
        {items.map((article, index) => (
          <li key={article.id} className="flex-1">
            <Link
              href={`/articles/${article.slug}`}
              className="group flex h-full items-center gap-3 border-b border-[var(--border-soft)] py-2 last:border-b-0"
            >
              <span className="w-4 shrink-0 text-center font-serif text-sm font-semibold text-[var(--muted-foreground)]/50 group-hover:text-[var(--primary)]">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold leading-tight text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
                  {article.title}
                </span>
                <span className="mt-0.5 block truncate text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--muted-foreground)]">
                  {categoryName(article.category)} · {article.readingMinutes} мин
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
