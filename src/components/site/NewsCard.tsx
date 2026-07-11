import Link from "next/link";
import { Flame, Eye } from "lucide-react";
import type { NewsItem } from "@/lib/types";
import { newsCategoryName } from "@/lib/mock/categories";
import { Badge, formatCount } from "@/components/ui/kit";

export function NewsRow({ item }: { item: NewsItem }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group flex items-start gap-4 border-b border-[var(--border)] py-4 last:border-0"
    >
      <div className="w-14 shrink-0 pt-0.5 text-xs font-medium text-[var(--muted-foreground)]">
        {item.timeLabel}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--accent)]">
            {newsCategoryName(item.category)}
          </span>
          {item.hot && (
            <Badge tone="danger">
              <Flame className="h-3 w-3" /> Горячее
            </Badge>
          )}
        </div>
        <h3 className="font-medium leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)] text-pretty">
          {item.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
          <span>{item.source}</span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3 w-3" /> {formatCount(item.views)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function NewsMiniCard({ item }: { item: NewsItem }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--surface-2)]"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold text-[var(--accent)]">
          {newsCategoryName(item.category)}
        </span>
        {item.hot && <Flame className="h-3.5 w-3.5 text-[var(--danger)]" />}
      </div>
      <h3 className="line-clamp-2 text-sm font-medium leading-snug text-[var(--foreground)] group-hover:text-[var(--primary)]">
        {item.title}
      </h3>
      <div className="mt-2 text-xs text-[var(--muted-foreground)]">{item.timeLabel}</div>
    </Link>
  );
}
