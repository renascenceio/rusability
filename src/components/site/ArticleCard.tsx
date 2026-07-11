import Link from "next/link";
import { Clock, Eye, Crown } from "lucide-react";
import type { Article } from "@/lib/types";
import { categoryName, categoryAccent } from "@/lib/taxonomy";
import { Avatar, Badge, formatCount } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

export function ArticleCard({
  article,
  variant = "default",
}: {
  article: Article;
  variant?: "default" | "compact" | "feature";
}) {
  const author = article.author;
  const accent = categoryAccent(article.category);

  if (variant === "compact") {
    return (
      <Link href={`/articles/${article.slug}`} className="group flex gap-4">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-3)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.cover || "/placeholder.svg"}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0">
          <div className="mb-1 text-xs font-semibold text-[var(--accent)]">
            {categoryName(article.category)}
          </div>
          <h3 className="line-clamp-2 font-serif text-sm font-bold leading-snug text-[var(--foreground)] group-hover:text-[var(--primary)]">
            {article.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {article.readingMinutes} мин
            </span>
          </div>
        </div>
      </Link>
    );
  }

  const isFeature = variant === "feature";

  return (
    <Link
      href={`/articles/${article.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]",
        isFeature && "md:flex-row",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-[var(--surface-3)]",
          isFeature ? "md:w-1/2 aspect-[16/10] md:aspect-auto" : "aspect-[16/10]",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.cover || "/placeholder.svg"}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge tone={accent}>{categoryName(article.category)}</Badge>
          {article.tier === "elite" && (
            <Badge tone="gold">
              <Crown className="h-3 w-3" /> Elite
            </Badge>
          )}
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col p-5", isFeature && "md:justify-center md:p-8")}>
        <h3
          className={cn(
            "font-serif font-bold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)] text-balance",
            isFeature ? "text-2xl md:text-3xl" : "text-lg line-clamp-2",
          )}
        >
          {article.title}
        </h3>
        <p
          className={cn(
            "mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]",
            isFeature ? "line-clamp-3" : "line-clamp-2",
          )}
        >
          {article.excerpt}
        </p>

        <div className="mt-auto flex items-center gap-3 pt-4">
          {author && <Avatar src={author.avatar} alt={author.name} size={32} />}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-[var(--foreground)]">
              {author?.name}
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {article.readingMinutes} мин
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3 w-3" /> {formatCount(article.views)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
