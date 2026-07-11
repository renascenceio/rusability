import Link from "next/link";
import { BarChart3, Sparkles, DollarSign, PenLine } from "lucide-react";
import { articlesByAuthor } from "@/lib/data/articles";
import { formatNumber, formatDate } from "@/lib/utils";

export const metadata = { title: "Дашборд — Rusability" };

const AUTHOR_ID = "au-3";

function seoOf(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 100;
  return 74 + (h % 22);
}

export default async function AuthorDashboardPage() {
  const mine = await articlesByAuthor(AUTHOR_ID);
  const recent = [...mine]
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, 3);

  const kpis = [
    { label: "Прочтений", value: "12.4K", delta: "18% к июню", up: true, tone: "var(--foreground)" },
    { label: "Подписчиков", value: "+234", delta: "12%", up: true, tone: "var(--primary)" },
    { label: "Выручка", value: "18 400 ₽", delta: "23%", up: true, tone: "var(--accent)" },
    { label: "Статей", value: String(mine.length || 34), delta: "+ 3 черновика", up: true, tone: "var(--foreground)" },
  ];

  return (
    <div>
      <header className="mb-7">
        <h1 className="font-serif text-3xl font-black text-[var(--foreground)]">
          Добро пожаловать, Анна
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Июль 2026 — ваш лучший месяц
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
              {k.label}
            </p>
            <p className="mt-2 font-serif text-3xl font-black" style={{ color: k.tone }}>
              {k.value}
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--success)]">▲ {k.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="mb-4 font-serif text-lg font-bold text-[var(--foreground)]">
            Последние публикации
          </h2>
          <ul className="divide-y divide-[var(--border)]">
            {recent.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <Link
                    href={`/articles/${a.slug}`}
                    className="block font-medium text-[var(--foreground)] hover:text-[var(--primary)]"
                  >
                    {a.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    {formatDate(a.publishedAt)} · {formatNumber(a.views)} прочтений · SEO {seoOf(a.id)}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-[var(--success)]">
                  {(1500 + (a.views % 3000)).toLocaleString("ru-RU")} ₽
                </span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-3">
          <Link
            href="/editor"
            className="flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-[0_8px_24px_-8px_rgba(77,90,255,0.6)] transition-transform hover:-translate-y-0.5"
          >
            <PenLine className="h-4 w-4" /> Написать статью
          </Link>
          {[
            { href: "/author/analytics", label: "Аналитика", icon: BarChart3 },
            { href: "/author/personalization", label: "Персонализация", icon: Sparkles, isNew: true },
            { href: "/author/monetization", label: "Монетизация", icon: DollarSign },
          ].map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.href}
                href={q.href}
                className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]"
              >
                <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
                <span className="flex-1">{q.label}</span>
                {q.isNew && (
                  <span className="rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--accent-foreground)]">
                    New
                  </span>
                )}
              </Link>
            );
          })}
        </aside>
      </div>
    </div>
  );
}
