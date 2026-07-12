"use client";

import { useState } from "react";
import { PageHeader, Panel, KpiCard, Table, Th, Td } from "@/components/admin/ui";
import { AreaChart, BarChart, Donut } from "@/components/ui/charts";
import { formatNumber } from "@/lib/utils";

type MetricPoint = { label: string; value: number };
type KpiStat = { label: string; value: string; delta: number };
type Page = { path: string; views: number; delta: number };
type PeriodId = "7" | "30" | "90";

const PERIODS = [
  { id: "7", label: "7д", days: 7 },
  { id: "30", label: "30д", days: 30 },
  { id: "90", label: "90д", days: 90 },
] as const;

export function AnalyticsWorkspace({
  kpis,
  seriesByPeriod,
  sources,
  topPages,
  generatedAt,
}: {
  kpis: KpiStat[];
  seriesByPeriod: Record<PeriodId, MetricPoint[]>;
  sources: MetricPoint[];
  topPages: Page[];
  generatedAt: string;
}) {
  const [period, setPeriod] = useState<PeriodId>("90");
  const cfg = PERIODS.find((p) => p.id === period)!;
  const chart = seriesByPeriod[period] ?? [];
  const updatedLabel = new Date(generatedAt).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <PageHeader
        title="Аналитика"
        subtitle={`Реальные данные из базы · обновлено ${updatedLabel}`}
        action={
          <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  p.id === period
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            delta={`${Math.abs(k.delta)}%`}
            deltaUp={k.delta >= 0}
          />
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel title={`Публикации за ${cfg.days} дней`} className="lg:col-span-2">
          <AreaChart data={chart} height={260} />
        </Panel>
        <Panel title="Материалы по категориям">
          <Donut data={sources} size={160} />
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Категории по объёму">
          <BarChart data={sources} height={220} />
        </Panel>
        <Panel title="Топ материалов по просмотрам">
          <Table>
            <thead>
              <tr>
                <Th>Страница</Th>
                <Th className="text-right">Просмотры</Th>
                <Th className="text-right">Динамика</Th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((p) => (
                <tr key={p.path}>
                  <Td className="font-medium">{p.path}</Td>
                  <Td className="text-right">{formatNumber(p.views)}</Td>
                  <Td className="text-right">
                    <span className={p.delta >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                      {p.delta >= 0 ? "+" : ""}
                      {p.delta}%
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </div>
    </>
  );
}
