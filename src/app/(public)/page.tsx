import Link from "next/link";
import { ArrowRight, Heart, TrendingUp } from "lucide-react";
import { featuredArticles, publishedArticles } from "@/lib/mock/articles";
import { latestNews, popularNews } from "@/lib/mock/news";
import { CATEGORIES, categoryName } from "@/lib/mock/categories";
import { getAuthor } from "@/lib/mock/authors";
import { ArticleCard } from "@/components/site/ArticleCard";
import { NewsRow, NewsMiniCard } from "@/components/site/NewsCard";
import { ButtonLink, SectionHeading, Avatar } from "@/components/ui/kit";
import { formatDate } from "@/lib/utils";

export default function HomePage() {
  const featured = featuredArticles();
  const hero = featured[0];
  const secondary = featured[1];
  const feed = publishedArticles()
    .filter((a) => a.id !== hero?.id && a.id !== secondary?.id)
    .slice(0, 6);
  const news = latestNews(6);
  const popular = popularNews(4);
  const heroAuthor = hero ? getAuthor(hero.authorId) : undefined;

  return (
    <div className="container-editorial py-6 md:py-8">
      {/* Hero */}
      {hero && (
        <section className="mb-6">
          <Link
            href={`/articles/${hero.slug}`}
            className="group relative flex min-h-[440px] flex-col justify-between overflow-hidden rounded-3xl bg-[var(--ink)] p-8 text-[var(--on-ink)] md:min-h-[520px] md:p-12"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.cover || "/placeholder.svg"}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />
            <span
              aria-hidden
              className="pointer-events-none absolute -right-4 top-1/3 select-none font-serif text-[180px] font-black leading-none text-white/5 md:text-[240px]"
            >
              2026
            </span>

            <div className="relative">
              <span className="inline-flex items-center rounded-full bg-[var(--primary)] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                {categoryName(hero.category)}
              </span>
            </div>

            <div className="relative">
              <h1 className="max-w-3xl font-serif text-4xl font-black leading-[1.05] text-balance text-white md:text-6xl">
                {hero.title}
              </h1>
              <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                  {heroAuthor && (
                    <Avatar src={heroAuthor.avatar} alt={heroAuthor.name} size={44} />
                  )}
                  <div>
                    <div className="font-semibold text-white">{heroAuthor?.name}</div>
                    <div className="text-sm text-white/60">
                      {formatDate(hero.publishedAt)} · {hero.claps} реакций
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--ink)] transition-transform group-hover:scale-[1.03]">
                    Читать <ArrowRight className="h-4 w-4" />
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 text-white">
                    <Heart className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Premium + featured row */}
      <section className="mb-12 grid gap-6 lg:grid-cols-2">
        <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#3a3ff0] to-[#6d4dff] p-8 text-white md:p-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
              Rusability Premium
            </div>
            <h2 className="mt-3 max-w-sm font-serif text-2xl font-bold leading-tight text-balance md:text-3xl">
              Читайте глубже. Пишите лучше. Растите быстрее.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
              Полный доступ к статьям, Elite-материалам и аналитике. Без рекламы.
            </p>
          </div>
          <div className="mt-6">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--primary)] transition-transform hover:scale-[1.03]"
            >
              Попробовать бесплатно <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {secondary && <ArticleCard article={secondary} variant="feature" />}
      </section>

      {/* Category chips */}
      <div className="mb-12 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/articles?category=${c.slug}`}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
        {/* Main feed */}
        <div>
          <SectionHeading
            title="Свежие статьи"
            action={
              <ButtonLink href="/articles" variant="ghost" size="sm">
                Все статьи <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            }
          />
          <div className="grid gap-6 sm:grid-cols-2">
            {feed.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-10">
          <section>
            <SectionHeading
              title="Новости"
              className="mb-3"
              action={
                <Link href="/news" className="text-sm font-medium text-[var(--primary)]">
                  Все
                </Link>
              }
            />
            <div>
              {news.map((n) => (
                <NewsRow key={n.id} item={n} />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="font-serif text-xl font-bold text-[var(--foreground)]">Популярное</h2>
            </div>
            <div className="grid gap-3">
              {popular.map((n) => (
                <NewsMiniCard key={n.id} item={n} />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
