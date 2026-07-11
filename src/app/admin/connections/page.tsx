import { Plug, Check } from "lucide-react";
import { PageHeader, Panel, Tag, AdminButton } from "@/components/admin/ui";
import { CONNECTIONS } from "@/lib/mock";

export const metadata = { title: "Подключения — Rusability" };

export default function AdminConnectionsPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Подключения"
        subtitle="Соцсети, мессенджеры и внешние сервисы для автопостинга"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {CONNECTIONS.map((c) => (
          <div key={c.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--muted-foreground)]">
                  <Plug className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-serif text-lg font-bold text-[var(--foreground)]">
                    {c.platform}
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)]">{c.handle}</div>
                </div>
              </div>
              {c.connected ? (
                <Tag tone="success"><Check className="h-3.5 w-3.5" /> Подключено</Tag>
              ) : (
                <Tag tone="neutral">Не подключено</Tag>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-sm">
              <span className="text-[var(--muted-foreground)]">
                {c.followers} подписчиков
              </span>
              {c.lastSync && (
                <span className="text-xs text-[var(--muted-foreground)]">Синхр.: {c.lastSync}</span>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-[var(--foreground)]">Автопостинг</span>
              <Toggle on={c.autopost} />
            </div>

            <AdminButton variant={c.connected ? "outline" : "primary"} className="mt-4 w-full">
              {c.connected ? "Настроить" : "Подключить"}
            </AdminButton>
          </div>
        ))}
      </div>
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
