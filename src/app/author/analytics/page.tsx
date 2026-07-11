import { TRAFFIC_SERIES, TRAFFIC_SOURCES } from "@/lib/mock";
import { AreaChart, Donut, BarChart } from "@/components/ui/charts";

export const metadata = { title: "Аналитика — Rusability" };

const TOP = [
  { title: "Интерфейс как язык", reads: 12480, seo: 87 },
  { title: "Навигация как история", reads: 9820, seo: 81 },
  { title: "Цвет как коммуникация", reads: 7540, seo: 74 },
  { title: "Психология пустого пространства", reads: 6120, seo: 79 },
];

export default function AuthorAnalyticsPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-black text-[var(--foreground)]">Аналитика</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Последние 30 дней</p>
      </header>

      <div className="mb-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="mb-4 font-serif text-lg font-bold text-[var(--foreground)]">Прочтения</h2>
          <AreaChart data={TRAFFIC_SERIES} height={220} />
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="mb-4 font-serif text-lg font-bold text-[var(--foreground)]">Источники</h2>
          <Donut data={TRAFFIC_SOURCES} />
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-[var(--foreground)]">Топ статей</h2>
        <BarChart
          data={TOP.map((t) => ({ label: t.title, value: t.reads }))}
          height={180}
        />
      </div>
    </div>
  );
}
