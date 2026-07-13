import Link from "next/link";
import { ArrowRight, Heart, Crown } from "lucide-react";
import type { Article } from "@/lib/types";
import { heroArticles, publishedArticles } from "@/lib/data/articles";
import { latestNews } from "@/lib/data/news";
import { activeCta } from "@/lib/data/ctas";
import { CtaBand } from "@/components/site/CtaBand";
import { categoryName, categoryAccent } from "@/lib/taxonomy";
import { Avatar } from "@/components/ui/kit";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

const ACCENT_VAR: Record<string, string> = {
  primary: "var(--primary)",
  accent: "var(--accent)",
  gold: "var(--gold-ink)",
  success: "var(--success)",
};
function catColor(cat: string): string {
  return ACCENT_VAR[categoryAccent(cat)] ?? "var(--primary)";
}

type NewsRow = { id: string; slug: string; timeLabel: string; title: string };

/** A single vertical list of news one-liners (shared by both layouts). */
function NewsColumn({ items }: { items: NewsRow[] }) {
  return (
    <div className="flex flex-col">
      {items.map((n) => (
        <Link
          key={n.id}
          href={`/news/${n.slug}`}
          className="group flex items-baseline gap-4 border-t border-[var(--border)] py-3.5 first:border-t-0 first:pt-0"
        >
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            {n.timeLabel}
          </span>
          <span className="text-[15px] font-medium leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
            {n.title}
          </span>
        </Link>
      ))}
    </div>
  );
}

const HERO_FILTERS = [
  { label: "Все", slug: "" },
  { label: "Дизайн", slug: "design" },
  { label: "Маркетинг", slug: "marketing" },
  { label: "PR", slug: "pr" },
  { label: "SEO", slug: "seo" },
  { label: "ИИ", slug: "ai" },
];

export default async function HomePage() {
  const [featured, published, news, digestCta, eventsCta] = await Promise.all([
    heroArticles(6),
    publishedArticles(),
    latestNews(8),
    activeCta("home_digest"),
    activeCta("home_events"),
  ]);
  const hero = featured[0];
  const heroAuthor = hero?.author;

  const used = new Set<string>();
  if (hero) used.add(hero.id);

  // Two more top-scoring pieces fill the split feature row below the hero.
  const featureRow = featured.filter((a) => !used.has(a.id)).slice(0, 2);
  if (featureRow.length < 2) {
    for (const a of published) {
      if (featureRow.length >= 2) break;
      if (!used.has(a.id) && !featureRow.some((f) => f.id === a.id)) featureRow.push(a);
    }
  }
  featureRow.forEach((a) => used.add(a.id));
  const [featureLead, featuredSide] = featureRow;

  // "Читать сейчас" — three category columns
  const pick = (cats: string[], n: number): Article[] => {
    const out = published
      .filter((a) => cats.includes(a.category) && !used.has(a.id))
      .slice(0, n);
    out.forEach((a) => used.add(a.id));
    return out;
  };
  const columns = [
    { label: "Дизайн", items: pick(["design", "ux"], 5) },
    { label: "Маркетинг", items: pick(["marketing", "smm"], 5) },
    { label: "PR & SEO", items: pick(["pr", "seo", "analytics", "ai"], 5) },
  ];
  // fill any short column from the remaining pool
  const rest = published.filter((a) => !used.has(a.id));
  let ri = 0;
  for (const col of columns) {
    while (col.items.length < 4 && ri < rest.length) {
      col.items.push(rest[ri]);
      used.add(rest[ri].id);
      ri++;
    }
  }

  // Популярное — four cover cards
  const popular = featured
    .concat(published)
    .filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i)
    .slice(0, 4);

  return (
    <div className="container-editorial py-8 md:py-10">
      <div className="mx-auto max-w-5xl">
        {/* ---------- HERO ---------- */}
        {hero && (
          <section className="mb-7">
            <Link
              href={`/articles/${hero.slug}`}
              className="group relative flex min-h-[440px] flex-col justify-between overflow-hidden rounded-[26px] bg-[var(--ink)] p-7 text-white md:min-h-[500px] md:p-10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero.cover || "/placeholder.svg"}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-45 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />
              <span
                aria-hidden
                className="pointer-events-none absolute right-2 top-1/4 select-none font-serif text-[150px] font-black leading-none text-white/[0.06] md:text-[220px]"
              >
                2026
              </span>

              <div className="relative flex items-center gap-2.5">
                {hero.tier === "elite" && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--gold)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#3a2a10]">
                    <Crown className="h-3 w-3" /> Elite
                  </span>
                )}
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
                  {categoryName(hero.category)}
                </span>
              </div>

              <div className="relative">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
                  Главное сегодня · {hero.readingMinutes} мин чтения
                </div>
                <h1 className="max-w-3xl font-serif text-3xl font-black leading-[1.06] text-balance text-white md:text-[2.55rem]">
                  {hero.title}
                </h1>
                <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {heroAuthor && (
                      <Avatar
                        src={heroAuthor.avatar}
                        alt={heroAuthor.name}
                        size={40}
                        elite={hero.tier === "elite"}
                      />
                    )}
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {heroAuthor?.name}
                      </div>
                      <div className="text-xs text-white/60">
                        {formatDate(hero.publishedAt)} · {hero.claps} реакций
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition-transform group-hover:scale-[1.03]">
                      Читать <ArrowRight className="h-4 w-4" />
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white">
                      <Heart className="h-[18px] w-[18px]" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* ---------- SPLIT FEATURE ROW (2/3 + 1/3) ---------- */}
        <section className="mb-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
          {featureLead && (
            <Link
              href={`/articles/${featureLead.slug}`}
              className="group relative flex min-h-[240px] flex-col justify-end overflow-hidden rounded-[26px] bg-[var(--ink)] p-8 text-white md:p-9"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featureLead.cover || "/placeholder.svg"}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
              <div className="relative">
                <div className="mb-2 flex items-center gap-2.5">
                  {featureLead.tier === "elite" && (
                    <span className="inline-flex items-center rounded-md bg-[var(--gold)] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#3a2a10]">
                      Elite
                    </span>
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                    {categoryName(featureLead.category)}
                  </span>
                </div>
                <h2 className="max-w-lg font-serif text-xl font-bold leading-snug text-balance text-white md:text-[1.45rem]">
                  {featureLead.title}
                </h2>
                <div className="mt-4 flex items-center gap-2.5 text-[13px] text-white/65">
                  {featureLead.author && (
                    <Avatar
                      src={featureLead.author.avatar}
                      alt={featureLead.author.name}
                      size={28}
                      elite={featureLead.tier === "elite"}
                    />
                  )}
                  <span className="font-semibold text-white/90">{featureLead.author?.name}</span>
                  <span className="text-white/30">·</span>
                  <span>{featureLead.readingMinutes} мин</span>
                </div>
              </div>
            </Link>
          )}

          {featuredSide && (
            <Link
              href={`/articles/${featuredSide.slug}`}
              className="group relative flex min-h-[240px] flex-col justify-end overflow-hidden rounded-[26px] bg-[var(--ink)] p-6 text-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredSide.cover || "/placeholder.svg"}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
              <div className="relative">
                <div className="mb-2 flex items-center gap-2.5">
                  {featuredSide.tier === "elite" && (
                    <span className="inline-flex items-center rounded-md bg-[var(--gold)] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#3a2a10]">
                      Elite
                    </span>
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                    {categoryName(featuredSide.category)}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold leading-snug text-balance text-white group-hover:text-white/90 md:text-[1.45rem]">
                  {featuredSide.title}
                </h3>
                <div className="mt-4 flex items-center gap-2.5 text-[13px] text-white/65">
                  {featuredSide.author && (
                    <Avatar
                      src={featuredSide.author.avatar}
                      alt={featuredSide.author.name}
                      size={28}
                      elite={featuredSide.tier === "elite"}
                    />
                  )}
                  <span className="font-semibold text-white/90">{featuredSide.author?.name}</span>
                  <span className="text-white/30">·</span>
                  <span>{featuredSide.readingMinutes} мин</span>
                </div>
              </div>
            </Link>
          )}
        </section>

        {/* ---------- ADMIN-MANAGED CTA (replaces the old email form) ---------- */}
        {digestCta && (
          <div className="mb-12">
            <CtaBand cta={digestCta} />
          </div>
        )}

        {/* ---------- ЧИТАТЬ СЕЙЧАС ---------- */}
        <section className="mb-14">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-3xl font-bold text-[var(--foreground)]">
              Читать сейчас
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {HERO_FILTERS.map((f, i) => (
                <Link
                  key={f.label}
                  href={f.slug ? `/articles?category=${f.slug}` : "/articles"}
                  className={
                    i === 0
                      ? "rounded-full bg-[var(--primary)] px-3.5 py-1.5 text-xs font-semibold text-white"
                      : "rounded-full px-3.5 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]"
                  }
                >
                  {f.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-x-8 gap-y-2 md:grid-cols-3">
            {columns.map((col) => (
              <div key={col.label}>
                <div
                  className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: catColor(col.items[0]?.category ?? "design") }}
                >
                  {col.label}
                </div>
                <div className="flex flex-col">
                  {col.items.map((a) => {
                    const au = a.author;
                    return (
                      <Link
                        key={a.id}
                        href={`/articles/${a.slug}`}
                        className="group border-t border-[var(--border)] py-4 first:border-t-0 first:pt-0"
                      >
                        <h3 className="font-serif text-[17px] font-bold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
                          {a.title}
                        </h3>
                        <div className="mt-2 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                          <span>{au?.name}</span>
                          <span>·</span>
                          <span>{a.readingMinutes} мин</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ---------- ПОПУЛЯРНОЕ ---------- */}
      <section className="mb-14 py-2">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-3xl font-bold text-[var(--foreground)]">
              Популярное
            </h2>
            <Link
              href="/articles"
              className="text-sm font-medium text-[var(--primary)] hover:underline"
            >
              Все статьи →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((a) => {
              const au = a.author;
              return (
                <Link
                  key={a.id}
                  href={`/articles/${a.slug}`}
                  className="group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-2xl bg-[var(--ink)] p-5 text-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.cover || "/placeholder.svg"}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
                  {a.tier === "elite" && (
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--gold)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#3a2a10]">
                      <Crown className="h-3 w-3" /> Elite
                    </span>
                  )}
                  <div className="relative">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
                      {categoryName(a.category)}
                    </span>
                    <h3 className="mt-2 font-serif text-base font-bold leading-snug text-white">
                      {a.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
                      {au && <Avatar src={au.avatar} alt={au.name} size={22} elite={a.tier === "elite"} />}
                      <span>{au?.name}</span>
                      <span>·</span>
                      <span>{a.readingMinutes} мин</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl">
        {/* ---------- CTA + НОВОСТИ ---------- */}
        {/* When an events CTA is published, keep the CTA-left / news-right split.
            Otherwise the news takes the full width in two balanced columns. */}
        {eventsCta ? (
          <section className="mb-14 grid gap-10 md:grid-cols-2">
            <CtaBand cta={eventsCta} />
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-[var(--foreground)]">
                  Новости
                </h2>
                <Link
                  href="/news"
                  className="text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  Все →
                </Link>
              </div>
              <NewsColumn items={news.slice(0, 6)} />
            </div>
          </section>
        ) : (
          <section className="mb-14">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-[var(--foreground)]">
                Новости
              </h2>
              <Link
                href="/news"
                className="text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Все →
              </Link>
            </div>
            <div className="grid gap-x-10 md:grid-cols-2">
              <NewsColumn items={news.slice(0, Math.ceil(news.length / 2))} />
              <NewsColumn items={news.slice(Math.ceil(news.length / 2))} />
            </div>
          </section>
        )}

        {/* ---------- AUTHOR CTA ---------- */}
        <section
          className="mb-6 overflow-hidden rounded-[26px] p-8 text-white md:p-12"
          style={{
            background: "linear-gradient(135deg, #2a1410 0%, #7a2f1c 60%, #c4523b 130%)",
          }}
        >
          <div className="max-w-2xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
              Для авторов
            </div>
            <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-balance md:text-4xl">
              Ваши идеи заслуживают аудитории. Начните писать на Rusability.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
              ИИ-помощник для черновиков, Elite-статус для лучших авторов и встроенные
              SEO/AEO/GEO инструменты — всё, чтобы ваш материал нашли и люди, и нейросети.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href="/editor"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#7a2f1c] transition-transform hover:scale-[1.03]"
              >
                Стать автором <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
