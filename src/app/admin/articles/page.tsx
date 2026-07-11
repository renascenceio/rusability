import Link from "next/link";
import { Plus, Eye, Heart, MessageCircle } from "lucide-react";
import { PageHeader, Panel, Tag, AdminButton, Table, Th, Td, KpiCard } from "@/components/admin/ui";
import { allArticles } from "@/lib/data/articles";
import { categoryName } from "@/lib/taxonomy";
import { formatNumber, formatDate } from "@/lib/utils";

export const metadata = { title: "Статьи — Rusability" };

const STATUS_TONE = {
  published: "success",
  draft: "neutral",
  review: "warn",
  scheduled: "primary",
  quarantine: "danger",
} as const;

const STATUS_LABEL = {
  published: "Опубликовано",
  draft: "Черновик",
  review: "На проверке",
  scheduled: "Запланировано",
  quarantine: "Карантин РКН",
} as const;

export default async function AdminArticlesPage() {
  const articles = await allArticles();
  const published = articles.filter((a) => a.status === "published").length;
  const totalViews = articles.reduce((s, a) => s + a.views, 0);

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Статьи"
        subtitle={`${articles.length} материалов · ${published} опубликовано`}
        action={
          <AdminButton href="/editor" variant="primary">
            <Plus className="h-4 w-4" /> Новая статья
          </AdminButton>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Всего статей" value={String(articles.length)} />
        <KpiCard label="Опубликовано" value={String(published)} />
        <KpiCard label="Суммарно просмотров" value={formatNumber(totalViews)} />
        <KpiCard label="Elite-материалы" value={String(articles.filter((a) => a.tier === "elite").length)} />
      </div>

      <Panel>
        <Table>
          <thead>
            <tr>
              <Th>Заголовок</Th>
              <Th>Автор</Th>
              <Th>Категория</Th>
              <Th>Статус</Th>
              <Th className="text-right">Метрики</Th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => {
              const author = a.author;
              return (
                <tr key={a.id} className="transition-colors hover:bg-[var(--muted)]">
                  <Td>
                    <Link
                      href={`/articles/${a.slug}`}
                      className="flex items-center gap-2 font-medium hover:text-[var(--primary)]"
                    >
                      {a.tier === "elite" && <Tag tone="gold">Elite</Tag>}
                      <span className="line-clamp-1">{a.title}</span>
                    </Link>
                  </Td>
                  <Td className="whitespace-nowrap text-[var(--muted-foreground)]">{author?.name}</Td>
                  <Td className="whitespace-nowrap text-[var(--muted-foreground)]">
                    {categoryName(a.category)}
                  </Td>
                  <Td>
                    <Tag tone={STATUS_TONE[a.status]}>{STATUS_LABEL[a.status]}</Tag>
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-3 whitespace-nowrap text-xs text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {formatNumber(a.views)}</span>
                      <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {formatNumber(a.claps)}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {a.comments}</span>
                    </div>
                    <div className="mt-1 text-right text-[10px] text-[var(--muted-foreground)]">
                      {formatDate(a.publishedAt)}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
