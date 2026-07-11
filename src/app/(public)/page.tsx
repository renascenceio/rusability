import Link from "next/link";
import { ArrowRight, Crown, TrendingUp } from "lucide-react";
import { featuredArticles, publishedArticles } from "@/lib/mock/articles";
import { latestNews, popularNews } from "@/lib/mock/news";
import { UPCOMING_EVENTS } from "@/lib/mock/events";
import { CATEGORIES } from "@/lib/mock/categories";
import { ArticleCard } from "@/components/site/ArticleCard";
import { NewsRow, NewsMiniCard } from "@/components/site/NewsCard";
import { EventCard } from "@/components/site/EventCard";
import { ButtonLink, SectionHeading, Badge } from "@/components/ui/kit";

export default function HomePage() {
  const featured = featuredArticles();
  const hero = featured[0];
  const secondary = featured.slice(1, 3);
  const feed = publishedArticles().filter((a) => !a.featured).slice(0, 6);
  const news = latestNews(6);
  const popular = popularNews(4);
  const events = UPCOMING_EVENTS.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Hero */}
      <section className="mb-16">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {hero && <ArticleCard article={hero} variant="feature" />}
          <div className="flex flex-col gap-6">
            {secondary.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>

      {/* Category pills */}
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

          {/* Elite band */}
          <div className="mt-16 overflow-hidden rounded-3xl bg-[var(--ink)] p-8 text-[var(--on-ink)] md:p-12">
            <Badge tone="gold">
              <Crown className="h-3 w-3" /> Rusability Elite
            </Badge>
            <h2 className="mt-4 max-w-xl font-serif text-3xl font-bold text-balance">
              Глубокие материалы от практиков индустрии
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--on-ink)]/70">
              Elite-статьи — это разборы, исследования и стратегии, которые проходят усиленную
              редактуру и оптимизируются под цитируемость в поиске и ИИ-ответах.
            </p>
            <ButtonLink href="/articles?tier=elite" variant="accent" size="md" className="mt-6">
              Читать Elite <ArrowRight className="h-4 w-4" />
            </ButtonLink>
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

      {/* Events */}
      <section className="mt-20">
        <SectionHeading
          title="Ближайшие события"
          action={
            <ButtonLink href="/events" variant="ghost" size="sm">
              Все события <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          }
        />
        <div className="grid gap-6 md:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>
    </div>
  );
}
