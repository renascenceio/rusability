import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Eye, Crown, Sparkles, Calendar } from "lucide-react";
import { getArticle, relatedArticles, publishedArticles } from "@/lib/data/articles";
import { categoryName, categoryAccent } from "@/lib/taxonomy";
import { commentsForArticle } from "@/lib/data/comments";
import { ArticleBody } from "@/components/site/ArticleBody";
import { EliteArticle } from "@/components/site/EliteArticle";
import { ArticleCard } from "@/components/site/ArticleCard";
import { CommentThread } from "@/components/site/CommentThread";
import { ArticleActions } from "@/components/site/ArticleActions";
import { Avatar, Badge, ButtonLink, formatCount } from "@/components/ui/kit";

export async function generateStaticParams() {
  return (await publishedArticles()).map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article || article.status !== "published") notFound();

  const author = article.author;
  const [related, comments] = await Promise.all([
    relatedArticles(article),
    commentsForArticle(article.id),
  ]);
  const isElite = article.tier === "elite";
  const accent = categoryAccent(article.category);

  if (isElite) {
    return (
      <EliteArticle
        data={{
          title: article.title,
          excerpt: article.excerpt,
          cover: article.cover || "/placeholder.svg",
          categoryLabel: categoryName(article.category),
          publishedLabel: new Date(article.publishedAt).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          readingMinutes: article.readingMinutes,
          claps: article.claps,
          body: article.body,
          faq: article.faq ?? [],
          scores: {
            geo: article.geoScore,
            seo: article.seoScore,
            aeo: article.aeoScore,
          },
          author: {
            name: author?.name ?? "Автор",
            avatar: author?.avatar ?? "/placeholder.svg",
            role: author?.elite ? "Elite-автор Rusability" : "Автор Rusability",
            articlesCount: author?.articlesCount ?? 0,
          },
          related: related.map((a) => ({
            slug: a.slug,
            title: a.title,
            cover: a.cover || "/placeholder.svg",
            readingMinutes: a.readingMinutes,
            claps: a.claps,
          })),
        }}
      />
    );
  }

  return (
    <article>
      {/* Elite hero band */}
      {isElite && (
        <div className="border-b border-[var(--border)] bg-[var(--ink)] py-3">
          <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 text-[var(--on-ink)] sm:px-6">
            <Crown className="h-4 w-4 text-[var(--gold)]" />
            <span className="text-sm font-semibold">Rusability Elite</span>
            {article.geoScore && (
              <span className="ml-auto inline-flex items-center gap-1 text-xs text-[var(--on-ink)]/70">
                <Sparkles className="h-3.5 w-3.5" /> GEO-оценка {article.geoScore}/100
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Link href={`/articles?category=${article.category}`}>
              <Badge tone={accent}>{categoryName(article.category)}</Badge>
            </Link>
            {isElite && (
              <Badge tone="gold">
                <Crown className="h-3 w-3" /> Elite
              </Badge>
            )}
          </div>
          <h1 className="font-serif text-3xl font-bold leading-tight text-[var(--foreground)] text-balance md:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--muted-foreground)] text-pretty">
            {article.excerpt}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-[var(--border)] py-4">
            {author && (
              <Link href={`/authors/${author.username}`} className="flex items-center gap-3">
                <Avatar src={author.avatar} alt={author.name} size={44} />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)]">
                    {author.name}
                    {author.elite && <Crown className="h-3.5 w-3.5 text-[var(--gold)]" />}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {formatCount(author.followers)} подписчиков
                  </div>
                </div>
              </Link>
            )}
            <div className="ml-auto flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(article.publishedAt).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" /> {article.readingMinutes} мин
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-4 w-4" /> {formatCount(article.views)}
              </span>
            </div>
          </div>
        </header>

        {/* Cover */}
        <div className="mb-10 overflow-hidden rounded-3xl bg-[var(--surface-3)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.cover || "/placeholder.svg"} alt={article.title} className="w-full object-cover" />
        </div>

        {/* Body */}
        <ArticleBody blocks={article.body} />

        {/* Tags */}
        <div className="mt-10 flex flex-wrap gap-2">
          {article.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-sm text-[var(--muted-foreground)]"
            >
              #{t}
            </span>
          ))}
        </div>

        {/* Actions */}
        <ArticleActions claps={article.claps} />

        {/* Author box */}
        {author && (
          <div className="mt-12 rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-6">
            <div className="flex items-start gap-4">
              <Avatar src={author.avatar} alt={author.name} size={64} />
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif text-lg font-bold text-[var(--foreground)]">
                    {author.name}
                  </h3>
                  {author.elite && <Crown className="h-4 w-4 text-[var(--gold)]" />}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {author.bio}
                </p>
                <ButtonLink
                  href={`/authors/${author.username}`}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Профиль автора
                </ButtonLink>
              </div>
            </div>
          </div>
        )}

        <CommentThread comments={comments} />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="border-t border-[var(--border)] bg-[var(--surface-2)] py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="mb-6 font-serif text-2xl font-bold text-[var(--foreground)]">
              Читайте также
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
