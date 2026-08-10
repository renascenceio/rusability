import Link from "next/link";
import { PageHeader, KpiCard } from "@/components/admin/ui";
import { getAiSpend, SPEND_RANGES, type SpendRange } from "@/lib/data/ai-spend";

export const metadata = { title: "Расходы на ИИ" };
export const dynamic = "force-dynamic";

const RANGE_LABEL: Record<SpendRange, string> = {
  1: "Сегодня",
  7: "7 дней",
  30: "30 дней",
  90: "90 дней",
};

const usd = (v: number) =>
  "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const int = (v: number) => v.toLocaleString("ru-RU");

// Human labels for workload keys recorded in lib/ai/usage.ts.
const WORKLOAD_LABEL: Record<string, string> = {
  "article-body": "Статьи — основной текст",
  "article-expand": "Статьи — дописывание",
  "article-topic": "Статьи — подбор темы",
  "article-meta": "Статьи — мета/оценки",
  "image-prompt": "Обложки — промпт",
  "article-cover": "Обложки — генерация",
  "user-article": "Статьи авторов",
  humanizer: "Очеловечивание текста",
  "news-rewrite": "Новости — рерайт",
  "news-enrich": "Новости — обогащение (AEO)",
  manifesto: "Манифесты авторов",
  "moderate-comment": "Модерация комментариев",
};
const labelFor = (k: string) => WORKLOAD_LABEL[k] ?? k;

export default async function AiCostsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const parsed = Number(sp.range) as SpendRange;
  const range: SpendRange = SPEND_RANGES.includes(parsed) ? parsed : 7;
  const data = await getAiSpend(range);

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Расходы на ИИ"
        subtitle="Стоимость генерации контента через Vercel AI Gateway. Считается по факту каждого вызова модели."
        action={
          <div className="flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
            {SPEND_RANGES.map((r) => (
              <Link
                key={r}
                href={`/admin/ai-costs?range=${r}`}
                className={
                  "rounded-lg px-3 py-1.5 text-sm transition-colors " +
                  (r === range
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")
                }
              >
                {RANGE_LABEL[r]}
              </Link>
            ))}
          </div>
        }
      />

      {!data.hasData ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center text-[var(--muted-foreground)]">
          За выбранный период вызовов ИИ не зафиксировано. Данные копятся с момента
          включения учёта — если генерация была раньше, точную разбивку смотрите в
          панели Vercel AI Gateway.
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard label="Всего за период" value={usd(data.totalCostUsd)} />
            <KpiCard label="Вызовов модели" value={int(data.totalCalls)} />
            <KpiCard
              label="Прогноз в месяц"
              value={usd(data.projectedMonthlyUsd)}
              delta="по среднему за период"
            />
            <KpiCard
              label="Токены «размышлений»"
              value={int(data.totalReasoningTokens)}
              delta={data.totalReasoningTokens > 0 ? `≈ ${usd(data.reasoningCostUsd)} впустую` : "отключены"}
              deltaUp={false}
            />
          </div>

          {data.unpricedCalls > 0 && (
            <p className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
              {int(data.unpricedCalls)} вызов(ов) — по моделям без тарифа в прайс-листе;
              их стоимость показана как нижняя оценка (помечены «тариф?»). Обновите прайс-лист в
              <code className="mx-1 rounded bg-[var(--muted)] px-1">lib/ai/usage.ts</code>.
            </p>
          )}

          {/* Breakdown by workload */}
          <section className="mt-8">
            <h2 className="mb-3 font-serif text-xl font-bold text-[var(--foreground)]">
              На что уходят деньги
            </h2>
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                    <th className="px-4 py-3 font-medium">Задача</th>
                    <th className="px-4 py-3 text-right font-medium">Вызовов</th>
                    <th className="px-4 py-3 text-right font-medium">Стоимость</th>
                    <th className="px-4 py-3 text-right font-medium">Доля</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byWorkload.map((w) => (
                    <tr key={w.key} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-4 py-3 text-[var(--foreground)]">{labelFor(w.key)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--muted-foreground)]">
                        {int(w.calls)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-[var(--foreground)]">
                        {usd(w.costUsd)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--muted-foreground)]">
                        {data.totalCostUsd > 0
                          ? Math.round((w.costUsd / data.totalCostUsd) * 100)
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Breakdown by model */}
          <section className="mt-8">
            <h2 className="mb-3 font-serif text-xl font-bold text-[var(--foreground)]">
              По моделям
            </h2>
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                    <th className="px-4 py-3 font-medium">Модель</th>
                    <th className="px-4 py-3 text-right font-medium">Вход, ток.</th>
                    <th className="px-4 py-3 text-right font-medium">Выход, ток.</th>
                    <th className="px-4 py-3 text-right font-medium">Размышления</th>
                    <th className="px-4 py-3 text-right font-medium">Изобр.</th>
                    <th className="px-4 py-3 text-right font-medium">Стоимость</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byModel.map((m) => (
                    <tr key={m.key} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-4 py-3 text-[var(--foreground)]">
                        {m.key}
                        {m.unpriced > 0 && (
                          <span className="ml-2 rounded bg-[var(--muted)] px-1.5 py-0.5 text-xs text-[var(--muted-foreground)]">
                            тариф?
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--muted-foreground)]">
                        {int(m.inputTokens)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--muted-foreground)]">
                        {int(m.outputTokens)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--muted-foreground)]">
                        {int(m.reasoningTokens)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--muted-foreground)]">
                        {int(m.images)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-[var(--foreground)]">
                        {usd(m.costUsd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.totalReasoningTokens > 0 && (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                «Размышления» — внутренние токены модели, которые оплачиваются как выход, но
                не попадают в текст. Отключены во всех вызовах генерации; ненулевое значение
                здесь — исторические вызовы до отключения.
              </p>
            )}
          </section>

          {/* Daily trend */}
          {data.perDay.length > 1 && (
            <section className="mt-8">
              <h2 className="mb-3 font-serif text-xl font-bold text-[var(--foreground)]">
                По дням
              </h2>
              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                      <th className="px-4 py-3 font-medium">Дата</th>
                      <th className="px-4 py-3 text-right font-medium">Вызовов</th>
                      <th className="px-4 py-3 text-right font-medium">Стоимость</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.perDay.map((d) => (
                      <tr key={d.day} className="border-b border-[var(--border)] last:border-0">
                        <td className="px-4 py-3 text-[var(--foreground)]">{d.day}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-[var(--muted-foreground)]">
                          {int(d.calls)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium text-[var(--foreground)]">
                          {usd(d.costUsd)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
