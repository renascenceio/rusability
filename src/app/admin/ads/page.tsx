import { Plus } from "lucide-react";
import { PageHeader, Panel, Tag, AdminButton, Table, Th, Td, KpiCard } from "@/components/admin/ui";
import { AD_SLOTS } from "@/lib/mock";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Реклама — Rusability" };

const TONE = { active: "success", paused: "warn", empty: "neutral" } as const;
const LABEL = { active: "Активен", paused: "На паузе", empty: "Свободен" } as const;

export default function AdminAdsPage() {
  const impressions = AD_SLOTS.reduce((s, a) => s + a.impressions, 0);
  const clicks = AD_SLOTS.reduce((s, a) => s + a.clicks, 0);

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Реклама"
        subtitle="Рекламные слоты и нативные интеграции"
        action={<AdminButton variant="primary"><Plus className="h-4 w-4" /> Новый слот</AdminButton>}
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Показов за месяц" value={formatNumber(impressions)} />
        <KpiCard label="Кликов" value={formatNumber(clicks)} />
        <KpiCard label="Средний CTR" value={`${((clicks / impressions) * 100).toFixed(2)}%`} />
        <KpiCard label="Активных слотов" value={String(AD_SLOTS.filter((a) => a.status === "active").length)} />
      </div>

      <Panel>
        <Table>
          <thead>
            <tr>
              <Th>Слот</Th>
              <Th>Размещение</Th>
              <Th>Рекламодатель</Th>
              <Th>Статус</Th>
              <Th className="text-right">Показы</Th>
              <Th className="text-right">CTR</Th>
            </tr>
          </thead>
          <tbody>
            {AD_SLOTS.map((a) => (
              <tr key={a.id} className="transition-colors hover:bg-[var(--muted)]">
                <Td>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{a.format}</div>
                </Td>
                <Td className="whitespace-nowrap text-[var(--muted-foreground)]">{a.placement}</Td>
                <Td className="whitespace-nowrap text-[var(--muted-foreground)]">
                  {a.advertiser ?? "—"}
                </Td>
                <Td><Tag tone={TONE[a.status]}>{LABEL[a.status]}</Tag></Td>
                <Td className="text-right">{formatNumber(a.impressions)}</Td>
                <Td className="text-right font-semibold">{a.ctr}%</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
