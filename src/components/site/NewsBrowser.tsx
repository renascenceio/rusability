"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { NewsItem } from "@/lib/types";
import type { SiteCta } from "@/lib/data/ctas";
import { newsCategoryName } from "@/lib/taxonomy";
import { CategoryTabs, type TabItem } from "@/components/site/CategoryTabs";
import { CtaBand } from "@/components/site/CtaBand";

const NEWS_ACCENT: Record<string, string> = {
  tech: "var(--accent)",
  ai: "var(--primary)",
  marketing: "var(--primary)",
  business: "var(--success)",
  fintech: "var(--success)",
  biotech: "var(--gold)",
  startups: "var(--gold)",
  ecommerce: "var(--success)",
  science: "var(--gold)",
};

const TABS: { slug: string; label: string }[] = [
  { slug: "all", label: "Все" },
  { slug: "tech", label: "Технологии" },
  { slug: "ai", label: "Нейросети" },
  { slug: "business", label: "Бизнес" },
  { slug: "marketing", label: "Маркетинг" },
  { slug: "fintech", label: "Финтех" },
  { slug: "biotech", label: "Биотех" },
  { slug: "startups", label: "Стартапы" },
  { slug: "ecommerce", label: "E-commerce" },
  { slug: "science", label: "Наука" },
];

function CatLabel({ category }: { category: string }) {
  return (
    <span
      className="text-[11px] font-bold uppercase tracking-[0.08em]"
      style={{ color: NEWS_ACCENT[category] ?? "var(--primary)" }}
    >
      {newsCategoryName(category)}
    </span>
  );
}

export function NewsBrowser({
  news,
  popular,
  cta,
}: {
  news: NewsItem[];
  popular: NewsItem[];
  cta: SiteCta | null;
}) {
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = cat === "all" ? news : news.filter((n) => n.category === cat);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q),
      );
    }
    return list;
  }, [news, cat, query]);

  // Dynamic ordering: sections with the most fresh material (last 24h) first.
  const orderedTabs = useMemo<TabItem[]>(() => {
    const now = Date.now();
    const DAY = 86_400_000;
    const recent = new Map<string, number>();
    const total = new Map<string, number>();
    for (const n of news) {
      total.set(n.category, (total.get(n.category) ?? 0) + 1);
      if (now - +new Date(n.publishedAt) <= DAY) {
        recent.set(n.category, (recent.get(n.category) ?? 0) + 1);
      }
    }
    const rest = TABS.filter((t) => t.slug !== "all").sort((x, y) => {
      const dr = (recent.get(y.slug) ?? 0) - (recent.get(x.slug) ?? 0);
      if (dr !== 0) return dr;
      return (total.get(y.slug) ?? 0) - (total.get(x.slug) ?? 0);
    });
    return [{ slug: "all", label: "Все" }, ...rest.map((t) => ({ slug: t.slug, label: t.label }))];
  }, [news]);

  // Real count of items published today (the header used to label the TOTAL as
  // "сегодня", which was misleading — e.g. "66 материалов сегодня").
  const todayCount = useMemo(() => {
    const now = new Date();
    return news.filter((n) => {
      const d = new Date(n.publishedAt);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    }).length;
  }, [news]);

  const lead = filtered[0];
  const alsoImportant = filtered.slice(1, 6);
  const keyLines = filtered.slice(6, 11); // one-liner "Коротко" strip
  const trio = filtered.slice(11, 14);
  const fresh = filtered.slice(14, 19);

  return (
    <div>
      {/* Header — matches Articles */}
      <header className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-5xl font-black text-[var(--foreground)]">Новости</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Живая лента · {news.length.toLocaleString("ru-RU")} материалов
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск новостей…"
            className="w-full rounded-full border border-[var(--border)] bg-[var(--surface)] py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
      </header>

      {/* Tabs — single line with overflow "Ещё" dropdown */}
      <CategoryTabs
        items={orderedTabs}
        active={cat}
        onSelect={setCat}
        rightSlot={
          <span className="flex items-center gap-2 text-xs font-semibold text-[var(--success)]">
            <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
            {todayCount > 0 ? `${todayCount} за сегодня` : "лента активна"}
          </span>
        }
      />

      {lead && (
        <>
          {/* Главное + Также важно */}
          <section className="grid gap-10 py-10 lg:grid-cols-[1.6fr_1fr]">
            {/* Главное */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                  Главное
                </span>
                <CatLabel category={lead.category} />
                <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                  · {lead.timeLabel}
                </span>
              </div>
              <Link href={`/news/${lead.slug}`}>
                <h2 className="font-serif text-3xl font-black leading-tight text-balance text-[var(--foreground)] transition-colors hover:text-[var(--primary)] sm:text-4xl">
                  {lead.title}
                </h2>
              </Link>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
                {lead.excerpt}
              </p>

              {/* Admin-managed CTA (replaces the old email-collection digest form) */}
              {cta && (
                <div className="mt-8">
                  <CtaBand cta={cta} />
                </div>
              )}
            </div>

            {/* Также важно */}
            <aside>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                Также важно
              </p>
              <div className="divide-y divide-[var(--border)]">
                {alsoImportant.map((n) => (
                  <Link
                    key={n.id}
                    href={`/news/${n.slug}`}
                    className="group flex items-start justify-between gap-3 py-3.5"
                  >
                    <div className="min-w-0">
                      <CatLabel category={n.category} />
                      <h3 className="mt-1 font-serif text-[15px] font-bold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
                        {n.title}
                      </h3>
                    </div>
                    <span className="shrink-0 pt-0.5 text-[11px] text-[var(--muted-foreground)]">
                      {n.timeLabel.replace(" назад", "")}
                    </span>
                  </Link>
                ))}
              </div>
            </aside>
          </section>

          {/* Коротко — up to 5 key one-liners, smaller than "Также важно" */}
          {keyLines.length > 0 && (
            <section className="border-t border-[var(--border)] py-6">
              <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                <span className="h-px w-6 bg-[var(--muted-foreground)]" />
                Коротко
              </p>
              <ul className="divide-y divide-[var(--border)]">
                {keyLines.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={`/news/${n.slug}`}
                      className="group flex items-baseline gap-3 py-2.5"
                    >
                      <span
                        className="shrink-0 text-[10px] font-bold uppercase tracking-[0.08em]"
                        style={{ color: NEWS_ACCENT[n.category] ?? "var(--primary)" }}
                      >
                        {newsCategoryName(n.category)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
                        {n.title}
                      </span>
                      <span className="shrink-0 text-[11px] text-[var(--muted-foreground)]">
                        {n.timeLabel.replace(" назад", "")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 3-column row */}
          {trio.length > 0 && (
            <section className="grid gap-8 border-t border-[var(--border)] py-10 md:grid-cols-3">
              {trio.map((n) => (
                <Link key={n.id} href={`/news/${n.slug}`} className="group block">
                  <CatLabel category={n.category} />
                  <h3 className="mt-2 font-serif text-lg font-bold leading-snug text-balance text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
                    {n.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {n.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-[var(--muted-foreground)]">{n.timeLabel}</p>
                </Link>
              ))}
            </section>
          )}

          {/* Свежее + Читают сейчас */}
          <section className="grid gap-12 border-t border-[var(--border)] py-10 lg:grid-cols-2">
            {/* Свежее */}
            <div>
              <p className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                <span className="h-px w-6 bg-[var(--muted-foreground)]" />
                Свежее
              </p>
              <div className="divide-y divide-[var(--border)]">
                {fresh.map((n) => (
                  <Link key={n.id} href={`/news/${n.slug}`} className="group block py-3.5">
                    <div className="flex items-center gap-2">
                      <CatLabel category={n.category} />
                      <span className="text-[11px] text-[var(--muted-foreground)]">
                        · {n.timeLabel.replace(" назад", "")}
                      </span>
                    </div>
                    <h3 className="mt-1 font-serif text-[15px] font-bold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
                      {n.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>

            {/* Читают сейчас */}
            <div>
              <p className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                <span className="h-px w-6 bg-[var(--muted-foreground)]" />
                Читают сейчас
              </p>
              <ol className="space-y-4">
                {popular.map((n, i) => (
                  <li key={n.id}>
                    <Link href={`/news/${n.slug}`} className="group flex items-start gap-4">
                      <span className="font-serif text-2xl font-black leading-none text-[var(--border-strong,var(--muted-foreground))] opacity-50">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="font-serif text-[15px] font-bold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
                          {n.title}
                        </h3>
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                          {n.views.toLocaleString("ru-RU")} читают
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </>
      )}
    </div>
  );
}


