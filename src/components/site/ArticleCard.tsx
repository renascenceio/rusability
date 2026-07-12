import Link from "next/link";
import { Crown, Heart } from "lucide-react";
import type { Article } from "@/lib/types";
import { categoryName, categoryAccent } from "@/lib/taxonomy";
import { Avatar, formatCount } from "@/components/ui/kit";
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
  const isElite = article.tier === "elite";

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
          <div
            className="mb-1 text-[11px] font-bold uppercase tracking-wider"
            style={{ color: accent }}
          >
            {categoryName(article.category)}
          </div>
          <h3 className="line-clamp-2 font-serif text-sm font-bold leading-snug text-[var(--foreground)] group-hover:text-[var(--primary)]">
            {article.title}
          </h3>
          <div className="mt-1.5 text-xs text-[var(--muted-foreground)]">
            {article.readingMinutes} мин
          </div>
        </div>
      </Link>
    );
  }

  const isFeature = variant === "feature";

  /* ---------- ELITE: dark card (gold badge, white serif title) ---------- */
  if (isElite && !isFeature) {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className="group flex flex-col overflow-hidden rounded-2xl bg-[var(--ink)] shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.cover || "/placeholder.svg"}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--gold)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#3a2a10]">
            <Crown className="h-3 w-3" /> Elite
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
            {categoryName(article.category)}
          </div>
          <h3 className="font-serif text-xl font-bold leading-snug text-white text-balance line-clamp-3">
            {article.title}
          </h3>
          <div className="mt-auto flex items-center gap-2.5 pt-6">
            {author && <Avatar src={author.avatar} alt={author.name} size={30} elite />}
            <span className="truncate text-sm font-medium text-white/85">{author?.name}</span>
            <span className="text-white/25">·</span>
            <span className="text-sm text-white/50">{article.readingMinutes} мин</span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-white/50">
              {formatCount(article.claps)} <Heart className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  /* ---------- STANDARD (+ feature): light card, colored category label ---------- */
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
        {isFeature && isElite && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--gold)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#3a2a10]">
            <Crown className="h-3 w-3" /> Elite
          </span>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col p-5", isFeature && "md:justify-center md:p-8")}>
        <div
          className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: accent }}
        >
          {categoryName(article.category)}
        </div>
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

        <div className="mt-auto flex items-center gap-2.5 pt-4">
          {author && <Avatar src={author.avatar} alt={author.name} size={30} elite={isElite} />}
          <span className="truncate text-sm font-medium text-[var(--foreground)]">
            {author?.name}
          </span>
          <span className="text-[var(--muted-foreground)]/40">·</span>
          <span className="text-sm text-[var(--muted-foreground)]">
            {article.readingMinutes} мин
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
            {formatCount(article.claps)} <Heart className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
