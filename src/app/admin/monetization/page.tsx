import { PageHeader, Panel, KpiCard } from "@/components/admin/ui";
import { AreaChart, Donut } from "@/components/ui/charts";
import { REVENUE_SERIES, REVENUE_BREAKDOWN, MONETIZATION_STATS } from "@/lib/mock";

export const metadata = { title: "Монетизация — Rusability" };

export default function AdminMonetizationPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader title="Монетизация" subtitle="Доход, подписки и источники выручки" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="MRR" value={MONETIZATION_STATS.mrr} delta="9,4%" deltaUp />
        <KpiCard label="Подписчиков Premium" value={MONETIZATION_STATS.subscribers.toLocaleString("ru-RU")} delta="6,2%" deltaUp />
        <KpiCard label="ARPU" value={MONETIZATION_STATS.arpu} />
        <KpiCard label="Отток" value={MONETIZATION_STATS.churn} delta="0,3%" deltaUp />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel title="Выручка по месяцам (тыс. ₽)" className="lg:col-span-2">
          <AreaChart data={REVENUE_SERIES} height={260} />
        </Panel>
        <Panel title="Источники выручки">
          <Donut data={REVENUE_BREAKDOWN} size={160} />
        </Panel>
      </div>

      <Panel title="Тарифы" className="mt-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] p-5">
            <div className="font-serif text-lg font-bold text-[var(--foreground)]">Free</div>
            <div className="mt-1 text-3xl font-bold text-[var(--foreground)]">₽ 0</div>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Доступ к ленте, новостям и стандартным статьям. С рекламой.
            </p>
            <div className="mt-3 text-sm text-[var(--muted-foreground)]">7 660 пользователей</div>
          </div>
          <div className="rounded-2xl border-2 border-[var(--primary)] bg-[var(--primary-soft)] p-5">
            <div className="font-serif text-lg font-bold text-[var(--primary)]">Premium</div>
            <div className="mt-1 text-3xl font-bold text-[var(--foreground)]">
              ₽ 299<span className="text-base font-normal text-[var(--muted-foreground)]">/мес</span>
            </div>
            <p className="mt-2 text-sm text-[var(--foreground)]">
              Elite-материалы, без рекламы, ранний доступ и эксклюзивные рассылки.
            </p>
            <div className="mt-3 text-sm font-semibold text-[var(--primary)]">4 820 подписчиков</div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
