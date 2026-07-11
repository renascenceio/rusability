import { PageHeader, Panel, KpiCard, Table, Th, Td } from "@/components/admin/ui";
import { AreaChart, BarChart, Donut } from "@/components/ui/charts";
import { KPIS, TRAFFIC_SERIES, TRAFFIC_SOURCES, TOP_PAGES } from "@/lib/mock";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Аналитика — Rusability" };

export default function AdminAnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader title="Аналитика" subtitle="Трафик, источники и вовлечённость аудитории" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k) => (
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
        <Panel title="Трафик за 14 дней" className="lg:col-span-2">
          <AreaChart data={TRAFFIC_SERIES} height={260} />
        </Panel>
        <Panel title="Источники трафика">
          <Donut data={TRAFFIC_SOURCES} size={160} />
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Источники по объёму">
          <BarChart data={TRAFFIC_SOURCES} height={220} />
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
              {TOP_PAGES.map((p) => (
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
    </div>
  );
}
