"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Article } from "@/lib/types";
import { categoryName } from "@/lib/taxonomy";
import { cn, formatDate } from "@/lib/utils";

const TABS = [
  { key: "popular", label: "Популярное" },
  { key: "fresh", label: "Свежее" },
  { key: "editorial", label: "Выбор редакции" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type Props = {
  popular: Article[];
  fresh: Article[];
  editorial: Article[];
};

export function HomeArticleRail({ popular, fresh, editorial }: Props) {
  const [active, setActive] = useState<TabKey>("popular");
  const items = { popular, fresh, editorial }[active];

  return (
    <aside className="flex min-h-0 flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 md:p-6">
      <div className="border-b border-[var(--border)]">
        <div className="flex overflow-x-auto" role="tablist" aria-label="Подборки статей">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active === tab.key}
              onClick={() => setActive(tab.key)}
              className={cn(
                "shrink-0 border-b-2 px-3 pb-3 text-xs font-bold transition-colors first:pl-0",
                active === tab.key
                  ? "border-[var(--foreground)] text-[var(--foreground)]"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col" role="tabpanel">
        {items.slice(0, 5).map((article, index) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="group flex flex-1 gap-4 border-b border-[var(--border)] py-4 last:border-b-0 last:pb-0"
          >
            <span className="pt-0.5 font-serif text-xl text-[var(--muted-foreground)]/45">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                {categoryName(article.category)} · {formatDate(article.publishedAt)}
              </span>
              <span className="mt-1.5 line-clamp-2 block text-sm font-semibold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
                {article.title}
              </span>
            </span>
            <ArrowUpRight className="mt-1 size-4 shrink-0 text-[var(--muted-foreground)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </aside>
  );
}
