"use client";

import { useMemo, useState } from "react";
import { PageHeader, Panel, KpiCard, Table, Th, Td } from "@/components/admin/ui";
import { AreaChart, BarChart, Donut } from "@/components/ui/charts";
import { formatNumber } from "@/lib/utils";

type MetricPoint = { label: string; value: number };
type KpiStat = { label: string; value: string; delta: number; spark?: number[] };
type Page = { path: string; views: number; delta: number };

const PERIODS = [
  { id: "7", label: "7д", days: 7, factor: 1 },
  { id: "30", label: "30д", days: 30, factor: 4.2 },
  { id: "90", label: "90д", days: 90, factor: 12.6 },
] as const;

/** Deterministic pseudo-random so the same period always renders the same chart. */
function seeded(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function AnalyticsWorkspace({
  kpis,
  series,
  sources,
  topPages,
}: {
  kpis: KpiStat[];
  series: MetricPoint[];
  sources: MetricPoint[];
  topPages: Page[];
}) {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["id"]>("7");
  const cfg = PERIODS.find((p) => p.id === period)!;

  const chart = useMemo<MetricPoint[]>(() => {
    const base = series.map((s) => s.value);
    const avg = base.reduce((a, b) => a + b, 0) / base.length;
    // Sample the number of points appropriate to the period.
    const points = cfg.days <= 7 ? 7 : cfg.days <= 30 ? 15 : 18;
    return Array.from({ length: points }, (_, i) => {
      const wobble = 0.72 + seeded(i + cfg.days) * 0.6;
      return {
        label: cfg.days <= 7 ? series[i % series.length]?.label ?? `${i + 1}` : `${i + 1}`,
        value: Math.round(avg * wobble),
      };
    });
  }, [series, cfg]);

  return (
    <>
      <PageHeader
        title="Аналитика"
        subtitle="Трафик, источники и вовлечённость аудитории"
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
        <Panel title={`Трафик за ${cfg.days} дней`} className="lg:col-span-2">
          <AreaChart data={chart} height={260} />
        </Panel>
        <Panel title="Источники трафика">
          <Donut data={sources} size={160} />
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Источники по объёму">
          <BarChart data={sources} height={220} />
        </Panel>
        <Panel title="Топ страниц">
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
