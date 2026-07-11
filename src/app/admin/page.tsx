import {
  FileText,
  Users,
  Eye,
  Wallet,
  PenLine,
  Newspaper,
  Bot,
  Mail,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { PageHeader, KpiCard, Panel, AdminButton } from "@/components/admin/ui";
import { AreaChart, ScoreRing } from "@/components/ui/charts";
import { TRAFFIC_SERIES, SEO_SCORES, ADMIN_ACTIVITY } from "@/lib/mock";

export const metadata = { title: "Обзор платформы — Rusability" };

const QUICK_ACTIONS = [
  { label: "Новая статья", icon: PenLine, href: "/editor" },
  { label: "Добавить новость", icon: Newspaper, href: "/admin/news" },
  { label: "ИИ-авторы", icon: Bot, href: "/admin/ai-authors" },
  { label: "Отправить рассылку", icon: Mail, href: "/admin/newsletter" },
];

export default function AdminOverviewPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Обзор платформы"
        subtitle="Ключевые показатели и активность за сегодня"
        action={<AdminButton href="/editor" variant="primary"><PenLine className="h-4 w-4" /> Написать</AdminButton>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Статей опубликовано" value="1 284" delta="12% за месяц" deltaUp icon={<FileText className="h-4 w-4" />} />
        <KpiCard label="Читателей за месяц" value="342K" delta="8,4%" deltaUp icon={<Users className="h-4 w-4" />} />
        <KpiCard label="Просмотров сегодня" value="18 402" delta="3,1%" deltaUp icon={<Eye className="h-4 w-4" />} />
        <KpiCard label="Доход за месяц" value="₽ 486K" delta="1,2%" icon={<Wallet className="h-4 w-4" />} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel title="Трафик за 14 дней" className="lg:col-span-2">
          <AreaChart data={TRAFFIC_SERIES} height={220} />
        </Panel>

        <Panel title="Готовность контента">
          <div className="flex flex-col gap-5">
            {SEO_SCORES.map((s) => (
              <div key={s.label} className="flex items-center gap-4">
                <ScoreRing value={s.value} color={s.color} label={s.label} />
                <div>
                  <div className="text-sm font-bold text-[var(--foreground)]">{s.label}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{s.caption}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel title="Быстрые действия" className="lg:col-span-1">
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <AdminButton
                  key={a.label}
                  href={a.href}
                  variant="ghost"
                  className="h-auto flex-col gap-2 rounded-2xl py-5 text-center"
                >
                  <Icon className="h-5 w-5 text-[var(--primary)]" />
                  <span className="text-xs font-semibold">{a.label}</span>
                </AdminButton>
              );
            })}
          </div>
        </Panel>

        <Panel title="Активность сегодня" className="lg:col-span-2">
          <ul className="space-y-3">
            {ADMIN_ACTIVITY.map((a, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                {a.tone === "danger" ? (
                  <ShieldAlert className="h-4 w-4 shrink-0 text-[var(--danger)]" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--success)]" />
                )}
                <span className="flex-1 text-[var(--foreground)]">{a.text}</span>
                <span className="shrink-0 text-xs text-[var(--muted-foreground)]">{a.time}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
