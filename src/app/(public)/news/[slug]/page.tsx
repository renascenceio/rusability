import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Flame } from "lucide-react";
import { getNews, latestNews, newsByCategory } from "@/lib/mock/news";
import { newsCategoryName } from "@/lib/mock/categories";
import { NewsRow, NewsMiniCard } from "@/components/site/NewsCard";
import { Chip, Divider } from "@/components/ui/kit";
import { formatNumber } from "@/lib/utils";

export function generateStaticParams() {
  return latestNews().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = getNews(slug);
  if (!news) return {};
  return { title: `${news.title} — Rusability`, description: news.excerpt };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = getNews(slug);
  if (!news || (news.pipeline && news.pipeline !== "published")) notFound();

  const categoryLabel = newsCategoryName(news.category);
  const related = newsByCategory(news.category)
    .filter((n) => n.id !== news.id)
    .slice(0, 4);
  const more = latestNews(6).filter((n) => n.id !== news.id).slice(0, 5);

  return (
    <div className="container-editorial py-8 md:py-12">
      <Link
        href="/news"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} /> Все новости
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <article className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Chip className="border-transparent bg-[var(--primary)] text-[var(--primary-foreground)]">
              {categoryLabel}
            </Chip>
            {news.hot && (
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--danger)]">
                <Flame size={13} /> Горячее
              </span>
            )}
            <span className="text-sm text-muted-foreground">{news.source}</span>
          </div>

          <h1 className="font-serif text-3xl font-bold leading-tight text-foreground md:text-[2.6rem]">
            {news.title}
          </h1>

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{news.timeLabel}</span>
            <span className="inline-flex items-center gap-1">
              <Eye size={14} /> {formatNumber(news.views)}
            </span>
          </div>

          <Divider className="my-6" />

          <p className="mb-6 font-serif text-xl leading-relaxed text-foreground">{news.excerpt}</p>
          <div className="article-prose space-y-5 font-serif text-lg leading-relaxed text-foreground">
            {news.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {news.tags.map((t) => (
              <Chip key={t}>#{t}</Chip>
            ))}
          </div>

          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 font-serif text-2xl font-bold text-foreground">По теме</h2>
              <div className="overflow-hidden rounded-2xl border border-border bg-card px-5">
                {related.map((n) => (
                  <NewsRow key={n.id} item={n} />
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Свежие новости
            </h3>
            <div className="space-y-2.5">
              {more.map((n) => (
                <NewsMiniCard key={n.id} item={n} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
