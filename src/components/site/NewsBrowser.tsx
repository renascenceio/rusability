"use client";

import { useState } from "react";
import type { NewsItem } from "@/lib/types";
import { NEWS_CATEGORIES } from "@/lib/mock/categories";
import { NewsRow } from "@/components/site/NewsCard";
import { Chip } from "@/components/ui/kit";

export function NewsBrowser({ news }: { news: NewsItem[] }) {
  const [cat, setCat] = useState<string>("all");
  const filtered = cat === "all" ? news : news.filter((n) => n.category === cat);

  return (
    <div>
      <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setCat("all")}>
          <Chip active={cat === "all"}>Все</Chip>
        </button>
        {NEWS_CATEGORIES.map((c) => (
          <button key={c.slug} onClick={() => setCat(c.slug)}>
            <Chip active={cat === c.slug}>{c.name}</Chip>
          </button>
        ))}
      </div>

      <div className="divide-y divide-[var(--border)]">
        {filtered.map((n) => (
          <NewsRow key={n.id} item={n} />
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-[var(--muted-foreground)]">
            В этой категории пока нет новостей.
          </p>
        )}
      </div>
    </div>
  );
}
