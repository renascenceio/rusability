"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader, Panel, Tag, AdminButton, Table, Th, Td, KpiCard } from "@/components/admin/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { formatNumber } from "@/lib/utils";

type Status = "active" | "paused" | "empty";
type Slot = {
  id: string;
  name: string;
  format: string;
  placement: string;
  advertiser?: string | null;
  status: Status;
  impressions: number;
  clicks: number;
  ctr: number;
};

const TONE = { active: "success", paused: "warn", empty: "neutral" } as const;
const LABEL = { active: "Активен", paused: "На паузе", empty: "Свободен" } as const;

export function AdsWorkspace({ slots }: { slots: Slot[] }) {
  const [list, setList] = useState<Slot[]>(slots);

  const impressions = list.reduce((s, a) => s + a.impressions, 0);
  const clicks = list.reduce((s, a) => s + a.clicks, 0);
  const activeCount = list.filter((a) => a.status === "active").length;

  function cycleStatus(id: string) {
    setList((l) =>
      l.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "active" ? "paused" : a.status === "paused" ? "active" : "active" }
          : a,
      ),
    );
  }

  function renderTable(rows: Slot[]) {
    return (
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
              <Th className="text-right">Действие</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="transition-colors hover:bg-[var(--muted)]">
                <Td>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{a.format}</div>
                </Td>
                <Td className="whitespace-nowrap text-[var(--muted-foreground)]">{a.placement}</Td>
                <Td className="whitespace-nowrap text-[var(--muted-foreground)]">{a.advertiser ?? "—"}</Td>
                <Td>
                  <Tag tone={TONE[a.status]}>{LABEL[a.status]}</Tag>
                </Td>
                <Td className="text-right">{formatNumber(a.impressions)}</Td>
                <Td className="text-right font-semibold">{a.ctr}%</Td>
                <Td className="text-right">
                  {a.status === "empty" ? (
                    <span className="text-xs text-[var(--muted-foreground)]">—</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => cycleStatus(a.id)}
                      className="cursor-pointer text-sm font-medium text-[var(--primary)] hover:underline"
                    >
                      {a.status === "active" ? "Пауза" : "Включить"}
                    </button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    );
  }

  const kpis = (
    <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard label="Показов за месяц" value={formatNumber(impressions)} />
      <KpiCard label="Кликов" value={formatNumber(clicks)} />
      <KpiCard label="Средний CTR" value={`${impressions ? ((clicks / impressions) * 100).toFixed(2) : "0"}%`} />
      <KpiCard label="Активных слотов" value={String(activeCount)} />
    </div>
  );

  return (
    <>
      <PageHeader
        title="Реклама"
        subtitle="Рекламные слоты и нативные интеграции"
        action={
          <AdminButton variant="primary">
            <Plus className="h-4 w-4" /> Новый слот
          </AdminButton>
        }
      />

      <AdminTabs
        tabs={[
          { id: "slots", label: "Все слоты", content: <div>{kpis}{renderTable(list)}</div> },
          {
            id: "active",
            label: "Активные",
            badge: activeCount,
            content: renderTable(list.filter((a) => a.status === "active")),
          },
          { id: "analytics", label: "Аналитика", content: <div>{kpis}{renderTable([...list].sort((a, b) => b.ctr - a.ctr))}</div> },
        ]}
      />
    </>
  );
}
