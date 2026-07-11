import { AreaChart } from "@/components/ui/charts";
import { TRAFFIC_SERIES } from "@/lib/mock";

export const metadata = { title: "Монетизация — Rusability" };

const PAYOUTS = [
  { month: "Июль 2026", amount: "18 400 ₽", status: "Ожидается" },
  { month: "Июнь 2026", amount: "14 950 ₽", status: "Выплачено" },
  { month: "Май 2026", amount: "12 300 ₽", status: "Выплачено" },
  { month: "Апрель 2026", amount: "9 870 ₽", status: "Выплачено" },
];

export default function AuthorMonetizationPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-black text-[var(--foreground)]">Монетизация</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Доход от подписок, чтений и Elite-материалов
        </p>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Баланс", value: "18 400 ₽", tone: "var(--accent)" },
          { label: "За всё время", value: "142 800 ₽", tone: "var(--foreground)" },
          { label: "Подписчиков Premium", value: "312", tone: "var(--primary)" },
          { label: "Средний чек", value: "168 ₽", tone: "var(--foreground)" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
              {k.label}
            </p>
            <p className="mt-2 font-serif text-2xl font-black" style={{ color: k.tone }}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-[var(--foreground)]">Динамика дохода</h2>
        <AreaChart data={TRAFFIC_SERIES} height={200} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[11px] font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
              <th className="px-5 py-3">Период</th>
              <th className="px-3 py-3 text-right">Сумма</th>
              <th className="px-5 py-3 text-right">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {PAYOUTS.map((p) => (
              <tr key={p.month}>
                <td className="px-5 py-3.5 font-medium text-[var(--foreground)]">{p.month}</td>
                <td className="px-3 py-3.5 text-right font-semibold text-[var(--success)]">{p.amount}</td>
                <td className="px-5 py-3.5 text-right text-[var(--muted-foreground)]">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
