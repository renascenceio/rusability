import Link from "next/link";
import { PenLine } from "lucide-react";
import { articlesByAuthor } from "@/lib/data/articles";
import { categoryName } from "@/lib/taxonomy";
import { formatNumber, formatDate } from "@/lib/utils";

export const metadata = { title: "Мои статьи — Rusability" };

const AUTHOR_ID = "au-3";

const STATUS_LABEL: Record<string, string> = {
  published: "Опубликовано",
  draft: "Черновик",
  review: "На проверке",
  scheduled: "Запланировано",
  quarantine: "Карантин",
};

export default async function AuthorArticlesPage() {
  const mine = await articlesByAuthor(AUTHOR_ID);

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-black text-[var(--foreground)]">Мои статьи</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{mine.length} материалов</p>
        </div>
        <Link
          href="/editor"
          className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]"
        >
          <PenLine className="h-4 w-4" /> Написать
        </Link>
      </header>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[11px] font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
              <th className="px-5 py-3">Заголовок</th>
              <th className="px-3 py-3">Категория</th>
              <th className="px-3 py-3">Статус</th>
              <th className="px-3 py-3 text-right">Прочтений</th>
              <th className="px-5 py-3 text-right">Дата</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {mine.map((a) => (
              <tr key={a.id} className="transition-colors hover:bg-[var(--surface-2)]">
                <td className="max-w-[360px] px-5 py-3.5">
                  <Link
                    href={`/articles/${a.slug}`}
                    className="font-medium text-[var(--foreground)] hover:text-[var(--primary)]"
                  >
                    {a.title}
                  </Link>
                  {a.tier === "elite" && (
                    <span className="ml-2 rounded-full bg-[var(--elite)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--elite-foreground)]">
                      Elite
                    </span>
                  )}
                </td>
                <td className="px-3 py-3.5 text-[var(--muted-foreground)]">{categoryName(a.category)}</td>
                <td className="px-3 py-3.5">
                  <span className="text-[var(--muted-foreground)]">{STATUS_LABEL[a.status]}</span>
                </td>
                <td className="px-3 py-3.5 text-right font-semibold text-[var(--foreground)]">
                  {formatNumber(a.views)}
                </td>
                <td className="px-5 py-3.5 text-right text-[var(--muted-foreground)]">
                  {formatDate(a.publishedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
