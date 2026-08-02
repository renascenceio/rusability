import Link from "next/link";
import { ExternalLink, Wrench, Users, Clock, AlertTriangle } from "lucide-react";
import { PageHeader, KpiCard, Panel, Table, Th, Td, Tag } from "@/components/admin/ui";
import { getToolsUsage } from "@/lib/data/tools-usage";
import { TOOLS, TOOL_CATEGORY_LABELS } from "@/lib/tools/registry";

export const metadata = { title: "Инструменты" };
export const dynamic = "force-dynamic";

function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}
function ms(v: number | null) {
  if (v == null) return "—";
  return v >= 1000 ? `${(v / 1000).toFixed(1)} с` : `${v} мс`;
}
function ago(iso: string | null) {
  if (!iso) return "—";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "сегодня";
  if (d === 1) return "вчера";
  return `${d} дн. назад`;
}
function outputLabel(o: (typeof TOOLS)[number]["output"]) {
  return o.kind === "variants" ? `${o.count} вариантов · ${o.label}` : o.label;
}

export default async function AdminToolsPage() {
  const usage = await getToolsUsage();
  const maxDaily = Math.max(1, ...usage.daily.map((d) => d.runs));

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Инструменты"
        subtitle="Бесплатные ИИ-инструменты для копирайтинга. Каждый инструмент — со своей логикой, промптом и форматом вывода."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Запусков за 7 дней"
          value={fmt(usage.totals.runs7d)}
          icon={<Wrench className="h-4 w-4" />}
        />
        <KpiCard
          label="Уникальных IP (7 дн.)"
          value={fmt(usage.totals.uniqueIps7d)}
          icon={<Users className="h-4 w-4" />}
        />
        <KpiCard
          label="Среднее время ответа"
          value={ms(usage.totals.avgMs)}
          icon={<Clock className="h-4 w-4" />}
        />
        <KpiCard
          label="Ошибок за 7 дней"
          value={fmt(usage.totals.errors7d)}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      {/* Daily bars */}
      <div className="mt-4">
        <Panel title="Запуски за 14 дней">
          {usage.daily.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">Пока нет запусков.</p>
          ) : (
            <div className="flex h-28 items-end gap-1.5">
              {usage.daily.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t bg-[var(--primary)]"
                    style={{ height: `${Math.max(4, (d.runs / maxDaily) * 92)}px` }}
                    title={`${d.day}: ${d.runs}`}
                  />
                  <span className="text-[9px] text-[var(--faint)]">{d.day.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Usage per tool */}
      <div className="mt-4">
        <Panel title="Использование по инструментам">
          <Table>
            <thead>
              <tr>
                <Th>Инструмент</Th>
                <Th>Категория</Th>
                <Th className="text-right">7 дней</Th>
                <Th className="text-right">Всего</Th>
                <Th className="text-right">Ошибки</Th>
                <Th className="text-right">Ср. время</Th>
                <Th className="text-right">Последний</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {usage.perTool.map((r) => (
                <tr key={r.slug}>
                  <Td>
                    <span className="font-semibold">{r.title}</span>
                  </Td>
                  <Td className="text-[var(--muted-foreground)]">
                    {TOOL_CATEGORY_LABELS[r.category as keyof typeof TOOL_CATEGORY_LABELS] ??
                      r.category}
                  </Td>
                  <Td className="text-right font-semibold">{fmt(r.runs7d)}</Td>
                  <Td className="text-right text-[var(--muted-foreground)]">{fmt(r.runsTotal)}</Td>
                  <Td className="text-right">
                    {r.errors7d > 0 ? (
                      <span className="font-semibold text-[var(--danger)]">{r.errors7d}</span>
                    ) : (
                      <span className="text-[var(--faint)]">0</span>
                    )}
                  </Td>
                  <Td className="text-right text-[var(--muted-foreground)]">{ms(r.avgMs)}</Td>
                  <Td className="text-right text-[var(--muted-foreground)]">{ago(r.lastRun)}</Td>
                  <Td className="text-right">
                    <Link
                      href={`/tools/${r.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline"
                    >
                      Открыть <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      </div>

      {/* Recent errors */}
      {usage.recentErrors.length > 0 && (
        <div className="mt-4">
          <Panel title="Последние ошибки">
            <ul className="space-y-2 text-sm">
              {usage.recentErrors.map((e, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Tag tone="danger">{e.slug}</Tag>
                  <span className="min-w-0 flex-1 truncate text-[var(--muted-foreground)]">
                    {e.error || "неизвестная ошибка"}
                  </span>
                  <span className="shrink-0 text-xs text-[var(--faint)]">{ago(e.createdAt)}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      {/* Tool catalog — each tool with its own logic + output, so the section
          documents "we do them properly", not just a list. */}
      <div className="mt-8">
        <h2 className="mb-1 font-serif text-xl font-bold text-[var(--foreground)]">
          Каталог инструментов
        </h2>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          Полное описание каждого инструмента: назначение, входные данные и формат результата.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {TOOLS.map((t) => (
            <div
              key={t.slug}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">{t.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Tag tone="primary">{TOOL_CATEGORY_LABELS[t.category]}</Tag>
                    <Tag tone="neutral">
                      {t.output.kind === "variants" ? "варианты" : "текст"}
                    </Tag>
                  </div>
                </div>
                <Link
                  href={`/tools/${t.slug}`}
                  target="_blank"
                  className="shrink-0 text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  /tools/{t.slug}
                </Link>
              </div>
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">{t.description}</p>
              <dl className="mt-3 space-y-1.5 text-xs">
                <div className="flex gap-2">
                  <dt className="shrink-0 font-semibold text-[var(--foreground)]">Ввод:</dt>
                  <dd className="text-[var(--muted-foreground)]">
                    {t.fields.map((i) => i.label).join(", ")}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="shrink-0 font-semibold text-[var(--foreground)]">Вывод:</dt>
                  <dd className="text-[var(--muted-foreground)]">{outputLabel(t.output)}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
