import Link from "next/link";
import { PenLine, Clock } from "lucide-react";

export const metadata = { title: "Черновики — Rusability" };

const DRAFTS = [
  { id: "d1", title: "Микровзаимодействия: как анимация влияет на доверие", words: 1240, updated: "2 часа назад", progress: 62 },
  { id: "d2", title: "Тёмная тема: не просто инверсия цветов", words: 780, updated: "Вчера", progress: 40 },
  { id: "d3", title: "Дизайн-системы 2026: что изменилось", words: 2100, updated: "3 дня назад", progress: 85 },
];

export default function AuthorDraftsPage() {
  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-black text-[var(--foreground)]">Черновики</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{DRAFTS.length} незавершённых материала</p>
        </div>
        <Link
          href="/editor"
          className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]"
        >
          <PenLine className="h-4 w-4" /> Новый черновик
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DRAFTS.map((d) => (
          <Link
            key={d.id}
            href="/editor"
            className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
          >
            <div className="mb-3 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              <Clock className="h-3.5 w-3.5" /> {d.updated}
            </div>
            <h3 className="mb-4 font-serif text-lg font-bold leading-snug text-[var(--foreground)] group-hover:text-[var(--primary)]">
              {d.title}
            </h3>
            <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>{d.words} слов</span>
              <span>{d.progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
              <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${d.progress}%` }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
