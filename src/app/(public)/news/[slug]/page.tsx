import { notFound } from "next/navigation";
import Link from "next/link";
import { getNews, latestNews } from "@/lib/data/news";
import { commentsForArticle } from "@/lib/data/comments";
import { newsCategoryName } from "@/lib/taxonomy";
import { formatDate } from "@/lib/utils";
import { NewsSource } from "@/components/site/NewsShareRow";
import { ArticleEngagement } from "@/components/site/ArticleEngagement";
import { ViewCounter } from "@/components/site/ViewCounter";
import { AnalyticsBeacon } from "@/components/site/AnalyticsBeacon";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await getNews(slug);
  if (!news) return {};
  const title = news.metaTitle?.trim() || news.title;
  const description = news.metaDescription?.trim() || news.excerpt;
  const canonical = `${SITE_URL}/news/${news.slug}`;
  return {
    title: `${title} — Rusability`,
    description,
    keywords: news.tags,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      publishedTime: news.publishedAt,
      siteName: "Rusability",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// muted colored bar next to the category label, per news topic
const NEWS_BAR: Record<string, string> = {
  tech: "#4d7ea8",
  marketing: "#c2703d",
  business: "#4d5aff",
  science: "#4d8f6b",
  ai: "#7a5cff",
  fintech: "#2f9e7d",
  biotech: "#c74d7a",
  startups: "#d08a2c",
  ecommerce: "#4d8f6b",
};

/** ~180 wpm reading estimate from the body word count. */
function readMinutes(body: string[]): number {
  const words = body.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await getNews(slug);
  if (!news || (news.pipeline && news.pipeline !== "published")) notFound();

  const categoryLabel = newsCategoryName(news.category);
  const bar = NEWS_BAR[news.category] ?? "var(--primary)";
  const minutes = readMinutes(news.body);
  const [comments, moreAll] = await Promise.all([
    commentsForArticle(news.id),
    latestNews(6),
  ]);
  const more = moreAll.filter((n) => n.id !== news.id).slice(0, 3);

  const canonical = `${SITE_URL}/news/${news.slug}`;
  // Structured data so classic search, Google/Yandex answer boxes and
  // generative engines (AEO/GEO) can parse and cite the note.
  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: news.title,
      description: news.metaDescription?.trim() || news.excerpt,
      articleSection: categoryLabel,
      datePublished: news.publishedAt,
      dateModified: news.publishedAt,
      inLanguage: "ru-RU",
      keywords: news.tags,
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      url: canonical,
      publisher: {
        "@type": "Organization",
        name: "Rusability",
        url: SITE_URL,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Новости", item: `${SITE_URL}/news` },
        { "@type": "ListItem", position: 3, name: categoryLabel, item: `${SITE_URL}/news?category=${news.category}` },
        { "@type": "ListItem", position: 4, name: news.title, item: canonical },
      ],
    },
    ...(news.faq && news.faq.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: news.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-[680px] px-5 py-8 md:py-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnalyticsBeacon kind="news" contentId={news.id} category={news.category} />
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Новости", href: "/news" },
          { label: categoryLabel, href: `/news?category=${news.category}` },
          { label: news.title },
        ]}
      />

      <ArticleEngagement
        kind="news"
        contentId={news.id}
        title={news.title}
        initialLikes={news.likes ?? 0}
        comments={comments}
      >
        <article>
          {/* meta line: | КАТЕГОРИЯ · дата · время чтения */}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[13px]">
            <span
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: bar }}
            >
              <span className="inline-block h-3 w-[3px] rounded-full" style={{ backgroundColor: bar }} />
              {categoryLabel}
            </span>
            <span className="text-muted-foreground">
              {formatDate(news.publishedAt)} · {minutes} мин
            </span>
            <ViewCounter kind="news" contentId={news.id} initialViews={news.views ?? 0} />
          </div>

          <h1 className="font-serif text-[2rem] font-bold leading-[1.12] text-foreground text-balance md:text-[2.7rem]">
            {news.title}
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{news.excerpt}</p>

          {/* AEO: TL;DR key takeaways answer engines can lift directly */}
          {news.keyPoints && news.keyPoints.length > 0 && (
            <aside
              className="mt-7 rounded-2xl border border-border bg-muted/40 p-5"
              aria-label="Кратко"
            >
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <span className="inline-block h-3 w-[3px] rounded-full" style={{ backgroundColor: bar }} />
                Кратко
              </div>
              <ul className="space-y-2">
                {news.keyPoints.map((kp, i) => (
                  <li key={i} className="flex gap-2.5 text-[0.98rem] leading-relaxed text-foreground">
                    <span aria-hidden className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: bar }} />
                    <span>{kp}</span>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          <div className="article-prose mt-8 space-y-5 text-[1.05rem] leading-[1.75] text-foreground">
            {news.body.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>

          {/* AEO/GEO: FAQ block — visible accordion + FAQPage structured data */}
          {news.faq && news.faq.length > 0 && (
            <section className="mt-10" aria-labelledby="news-faq-heading">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Вопросы и ответы
              </div>
              <h2 id="news-faq-heading" className="mb-4 font-serif text-2xl font-bold leading-snug text-foreground">
                Часто задаваемые вопросы
              </h2>
              <div className="flex flex-col gap-3">
                {news.faq.map((f, i) => (
                  <details key={i} className="rounded-2xl border border-border bg-card px-5 py-4">
                    <summary className="cursor-pointer list-none text-base font-semibold text-foreground">
                      {f.q}
                    </summary>
                    <p className="mt-3 text-[0.98rem] leading-relaxed text-muted-foreground">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* source attribution (nofollow) */}
          <NewsSource source={news.source} sourceUrl={news.sourceUrl} />
        </article>
      </ArticleEngagement>

      {more.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Ещё новости
          </h2>
          <div className="divide-y divide-border border-t border-border">
            {more.map((n) => {
              const nbar = NEWS_BAR[n.category] ?? "var(--primary)";
              return (
                <Link key={n.id} href={`/news/${n.slug}`} className="group block py-4">
                  <span
                    className="mb-1.5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: nbar }}
                  >
                    <span
                      className="inline-block h-2.5 w-[3px] rounded-full"
                      style={{ backgroundColor: nbar }}
                    />
                    {newsCategoryName(n.category)}
                  </span>
                  <h3 className="font-serif text-base font-bold leading-snug text-foreground transition-colors group-hover:text-[var(--primary)]">
                    {n.title}
                  </h3>
                  <div className="mt-1 text-xs text-muted-foreground">{n.timeLabel}</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
