import { Plus, Flame } from "lucide-react";
import { PageHeader, Panel, Tag, AdminButton, Table, Th, Td, KpiCard } from "@/components/admin/ui";
import { NEWS, newsCategoryName } from "@/lib/mock";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Новости — Rusability" };

const PIPELINE_TONE = {
  published: "success",
  review: "warn",
  rewriting: "primary",
  queued: "neutral",
  rejected: "danger",
} as const;

const PIPELINE_LABEL = {
  published: "Опубликовано",
  review: "На проверке",
  rewriting: "Рерайт",
  queued: "В очереди",
  rejected: "Отклонено",
} as const;

export default function AdminNewsPage() {
  const published = NEWS.filter((n) => (n.pipeline ?? "published") === "published").length;

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Новости"
        subtitle={`${NEWS.length} материалов в конвейере · ${published} опубликовано`}
        action={<AdminButton variant="primary"><Plus className="h-4 w-4" /> Добавить новость</AdminButton>}
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Всего новостей" value={String(NEWS.length)} />
        <KpiCard label="Опубликовано" value={String(published)} />
        <KpiCard label="От Newsbot сегодня" value="48" />
        <KpiCard label="Горячих" value={String(NEWS.filter((n) => n.hot).length)} />
      </div>

      <Panel>
        <Table>
          <thead>
            <tr>
              <Th>Заголовок</Th>
              <Th>Источник</Th>
              <Th>Категория</Th>
              <Th>Статус</Th>
              <Th className="text-right">Просмотры</Th>
            </tr>
          </thead>
          <tbody>
            {NEWS.map((n) => {
              const pipeline = n.pipeline ?? "published";
              return (
                <tr key={n.id} className="transition-colors hover:bg-[var(--muted)]">
                  <Td>
                    <span className="flex items-center gap-2 font-medium">
                      {n.hot && <Flame className="h-4 w-4 shrink-0 text-[var(--accent)]" />}
                      <span className="line-clamp-1">{n.title}</span>
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-[var(--muted-foreground)]">{n.source}</Td>
                  <Td className="whitespace-nowrap text-[var(--muted-foreground)]">
                    {newsCategoryName(n.category)}
                  </Td>
                  <Td>
                    <Tag tone={PIPELINE_TONE[pipeline]}>{PIPELINE_LABEL[pipeline]}</Tag>
                  </Td>
                  <Td className="text-right whitespace-nowrap text-[var(--muted-foreground)]">
                    {formatNumber(n.views)}
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
