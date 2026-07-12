"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { NewsItem } from "@/lib/types";
import { newsCategoryName } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

const NEWS_ACCENT: Record<string, string> = {
  tech: "var(--accent)",
  marketing: "var(--primary)",
  business: "var(--success)",
  science: "var(--gold)",
};

const TABS: { slug: string; label: string }[] = [
  { slug: "all", label: "Все" },
  { slug: "tech", label: "Технологии" },
  { slug: "marketing", label: "Маркетинг" },
  { slug: "business", label: "Бизнес" },
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
}: {
  news: NewsItem[];
  popular: NewsItem[];
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

  const lead = filtered[0];
  const alsoImportant = filtered.slice(1, 6);
  const trio = filtered.slice(6, 9);
  const fresh = filtered.slice(9, 14);

  return (
    <div>
      {/* Header — matches Articles */}
      <header className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-5xl font-black text-[var(--foreground)]">Новости</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Живая лента · {news.length} материалов сегодня
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

      {/* Tabs — matches Articles (sentence case, underline on active) */}
      <div className="mb-9 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[var(--border)] pb-3">
        {TABS.map((t) => (
          <FilterTab key={t.slug} active={cat === t.slug} onClick={() => setCat(t.slug)}>
            {t.label}
          </FilterTab>
        ))}
        <span className="ml-auto flex items-center gap-2 text-xs font-semibold text-[var(--success)]">
          <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
          {news.length} новостей сегодня
        </span>
      </div>
        <div className="relative w-full max-w-xs">
          <input
            placeholder="Поиск новостей…"
            className="w-full rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] py-4">
        <nav className="flex flex-wrap gap-5">
          {TABS.map((t) => (
            <button
              key={t.slug}
              onClick={() => setCat(t.slug)}
              className={`text-xs font-bold uppercase tracking-[0.08em] transition-colors ${
                cat === t.slug
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <span className="flex items-center gap-2 text-xs font-semibold text-[var(--success)]">
          <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
          {news.length} новостей сегодня
        </span>
      </div>

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

              {/* Newsletter band */}
              <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--primary)]">
                      Дайджест Rusability
                    </p>
                    <p className="mt-1 font-serif text-lg font-bold text-[var(--foreground)]">
                      Лучшие материалы — каждый понедельник
                    </p>
                  </div>
                  <form className="flex shrink-0 gap-2">
                    <input
                      placeholder="Email"
                      className="w-40 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
                    />
                    <button
                      type="button"
                      className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
                    >
                      Подписаться
                    </button>
                  </form>
                </div>
              </div>
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
