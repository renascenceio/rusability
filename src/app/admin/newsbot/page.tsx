import { Sparkles, Rss, Clock, Check } from "lucide-react";
import { PageHeader, Panel, Tag, AdminButton, KpiCard } from "@/components/admin/ui";
import { NEWSBOT_SOURCES, latestNews } from "@/lib/mock";

export const metadata = { title: "Newsbot — Rusability" };

export default function NewsbotPage() {
  const enabled = NEWSBOT_SOURCES.filter((s) => s.enabled).length;
  const recent = latestNews(5);

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Newsbot"
        subtitle="Автоматический сбор и рерайт новостей из подключённых источников"
        action={<Tag tone="success"><Sparkles className="h-3.5 w-3.5" /> Бот активен</Tag>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Собрано сегодня" value="48" />
        <KpiCard label="Опубликовано" value="31" delta="6% к среднему" deltaUp />
        <KpiCard label="Источников активно" value={String(enabled)} />
        <KpiCard label="Следующий запуск" value="06:00" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <Panel title="Источники" className="lg:col-span-2">
          <ul className="space-y-2">
            {NEWSBOT_SOURCES.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3.5 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)]">
                    <Rss className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-[var(--foreground)]">{s.name}</div>
                    <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                      <Clock className="h-3 w-3" /> {s.meta}
                    </div>
                  </div>
                </div>
                <Toggle on={s.enabled} />
              </li>
            ))}
          </ul>
          <AdminButton variant="ghost" className="mt-4 w-full">
            Добавить источник
          </AdminButton>
        </Panel>

        <Panel title="Недавно собрано" className="lg:col-span-3">
          <ul className="divide-y divide-[var(--border)]">
            {recent.map((n) => (
              <li key={n.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]">
                  <Check className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-[var(--foreground)]">
                    {n.title}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">{n.source}</div>
                </div>
                <Tag tone="primary">Рерайт готов</Tag>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Настройки рерайта" className="mt-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Setting label="Тон" value="Нейтральный, информативный" />
          <Setting label="Мин. уникальность" value="85%" />
          <Setting label="Автопубликация" value="После модерации" />
        </div>
      </Panel>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        on ? "bg-[var(--primary)]" : "bg-[var(--surface-3)]"
      }`}
      aria-hidden
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--muted)] p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-[var(--foreground)]">{value}</div>
    </div>
  );
}
