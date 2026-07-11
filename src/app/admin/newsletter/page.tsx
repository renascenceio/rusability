import { Plus, Mail, Eye } from "lucide-react";
import { PageHeader, Panel, Tag, AdminButton, Table, Th, Td, KpiCard } from "@/components/admin/ui";
import { CAMPAIGNS } from "@/lib/mock";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Рассылки — Rusability" };

const TONE = {
  sent: "success",
  scheduled: "primary",
  draft: "neutral",
  sending: "warn",
} as const;
const LABEL = {
  sent: "Отправлено",
  scheduled: "Запланировано",
  draft: "Черновик",
  sending: "Отправляется",
} as const;

export default function AdminNewsletterPage() {
  const totalRecipients = CAMPAIGNS.reduce((s, c) => s + c.recipients, 0);
  const sent = CAMPAIGNS.filter((c) => c.status === "sent");
  const avgOpen = sent.length
    ? Math.round(sent.reduce((s, c) => s + c.openRate, 0) / sent.length)
    : 0;

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Рассылки"
        subtitle="Еженедельный дайджест и триггерные письма"
        action={
          <div className="flex gap-2">
            <AdminButton href="/email" variant="outline"><Eye className="h-4 w-4" /> Превью письма</AdminButton>
            <AdminButton variant="primary"><Plus className="h-4 w-4" /> Новая рассылка</AdminButton>
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Всего подписчиков" value={formatNumber(totalRecipients)} icon={<Mail className="h-4 w-4" />} />
        <KpiCard label="Средний Open Rate" value={`${avgOpen}%`} delta="2,3%" deltaUp />
        <KpiCard label="Кампаний отправлено" value={String(sent.length)} />
        <KpiCard label="Запланировано" value={String(CAMPAIGNS.filter((c) => c.status === "scheduled").length)} />
      </div>

      <Panel>
        <Table>
          <thead>
            <tr>
              <Th>Кампания</Th>
              <Th>Аудитория</Th>
              <Th>Статус</Th>
              <Th className="text-right">Open</Th>
              <Th className="text-right">Click</Th>
            </tr>
          </thead>
          <tbody>
            {CAMPAIGNS.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-[var(--muted)]">
                <Td>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{c.subject}</div>
                </Td>
                <Td className="whitespace-nowrap text-[var(--muted-foreground)]">
                  {c.audience} · {formatNumber(c.recipients)}
                </Td>
                <Td><Tag tone={TONE[c.status]}>{LABEL[c.status]}</Tag></Td>
                <Td className="text-right font-semibold">{c.openRate}%</Td>
                <Td className="text-right font-semibold">{c.clickRate}%</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
