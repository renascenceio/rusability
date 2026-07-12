import { ShieldCheck, ShieldAlert, Check, X } from "lucide-react";
import { PageHeader, Panel, Tag, AdminButton, KpiCard } from "@/components/admin/ui";
import { BLOCKED_TOPICS, MODERATION_QUEUE } from "@/lib/mock";
import { ArticleTabs } from "@/components/admin/ArticleTabs";

export const metadata = { title: "ИИ-фильтр РКН — Rusability" };

export default function AiFilterPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="ИИ-фильтр РКН"
        subtitle="Автоматическая модерация контента на соответствие законодательству РФ"
        action={<Tag tone="success"><ShieldCheck className="h-3.5 w-3.5" /> Фильтр включён</Tag>}
      />

      <ArticleTabs />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Проверено сегодня" value="248" />
        <KpiCard label="Заблокировано" value="3" delta="1,2%" />
        <KpiCard label="На ручной проверке" value="2" />
        <KpiCard label="Точность модели" value="96%" delta="0,4%" deltaUp />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Запрещённые темы">
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">
            Материалы, затрагивающие эти темы, автоматически отправляются на модерацию или
            блокируются.
          </p>
          <ul className="space-y-2">
            {BLOCKED_TOPICS.map((topic) => (
              <li
                key={topic}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3.5 py-2.5"
              >
                <span className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                  <ShieldAlert className="h-4 w-4 text-[var(--danger)]" />
                  {topic}
                </span>
                <Tag tone="danger">Блокировка</Tag>
              </li>
            ))}
          </ul>
          <AdminButton variant="ghost" className="mt-4 w-full">
            Добавить тему
          </AdminButton>
        </Panel>

        <Panel title="Чувствительность фильтра">
          <div className="space-y-5">
            <Slider label="Порог блокировки" value={85} caption="Материалы выше 85% уверенности блокируются автоматически" />
            <Slider label="Порог ручной проверки" value={55} caption="От 55% до 85% — отправляется модератору" />
          </div>
          <div className="mt-5 rounded-xl bg-[var(--primary-soft)] p-4">
            <p className="text-sm text-[var(--primary)]">
              Модель обучена на актуальных требованиях Роскомнадзора и обновляется еженедельно.
            </p>
          </div>
        </Panel>
      </div>

      <Panel title="Очередь модерации" className="mt-5">
        <ul className="space-y-3">
          {MODERATION_QUEUE.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[var(--foreground)]">{m.title}</div>
                <div className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                  {m.reason} · {m.author}
                </div>
              </div>
              <Tag tone={m.confidence >= 85 ? "danger" : "warn"}>{m.confidence}% уверенность</Tag>
              <div className="flex gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]" aria-label="Одобрить">
                  <Check className="h-4 w-4" />
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] text-[var(--danger)]" aria-label="Заблокировать">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function Slider({ label, value, caption }: { label: string; value: number; caption: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--foreground)]">{label}</span>
        <span className="text-sm font-bold text-[var(--primary)]">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--muted)]">
        <div className="h-2 rounded-full bg-[var(--primary)]" style={{ width: `${value}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">{caption}</p>
    </div>
  );
}
