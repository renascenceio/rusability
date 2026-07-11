import Link from "next/link";
import { PenLine, Newspaper, Mail, ShieldAlert, ChevronRight } from "lucide-react";

export const metadata = { title: "Обзор платформы — Rusability" };

type Stat = {
  label: string;
  value: string;
  valueColor: string;
  sub: string;
  subColor: string;
};

const STATS: Stat[] = [
  {
    label: "Читателей",
    value: "284K",
    valueColor: "text-[var(--foreground)]",
    sub: "▲ 12% за месяц",
    subColor: "text-[#6aaa4a]",
  },
  {
    label: "Статей",
    value: "1 248",
    valueColor: "text-[#d45e42]",
    sub: "48 за сегодня",
    subColor: "text-[var(--muted-foreground)]",
  },
  {
    label: "Подписчиков",
    value: "24.8K",
    valueColor: "text-[#4d5aff]",
    sub: "▲ 753 за неделю",
    subColor: "text-[#6aaa4a]",
  },
  {
    label: "РКН на проверке",
    value: "3",
    valueColor: "text-[#d45e42]",
    sub: "Требуют решения",
    subColor: "text-[var(--muted-foreground)]",
  },
];

const QUICK_ACTIONS = [
  { label: "Написать статью", icon: PenLine, href: "/editor" },
  { label: "Управление новостями", icon: Newspaper, href: "/admin/news" },
  { label: "Создать рассылку", icon: Mail, href: "/admin/newsletter" },
];

const ACTIVITY = [
  { dot: "#6aaa4a", pulse: true, text: "Аналитик опубликовал «SEO-тренды 2026»", time: "11:30" },
  { dot: "#6aaa4a", pulse: false, text: "Практик опубликовал «Топ SEO-инструментов»", time: "08:00" },
  { dot: "#d45e42", pulse: false, text: "РКН заблокировал 1 материал (94%)", time: "07:44" },
  { dot: "#e8a85a", pulse: false, text: "Новости-бот собрал 48 материалов", time: "06:00" },
];

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <div className="mx-auto max-w-[1180px] animate-[fadein_.2s_ease]">
      <header className="mb-7">
        <h1 className="font-serif text-[26px] font-bold leading-tight text-[var(--foreground)]">
          Обзор платформы
        </h1>
        <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">Июль 2026</p>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {STATS.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
              {s.label}
            </div>
            <div className={`font-serif text-[32px] font-bold leading-none ${s.valueColor}`}>
              {s.value}
            </div>
            <div className={`mt-1.5 text-xs font-medium ${s.subColor}`}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Two panels */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Quick actions */}
        <Card className="p-6">
          <h2 className="mb-4 text-[15px] font-bold text-[var(--foreground)]">Быстрые действия</h2>
          <div className="flex flex-col gap-2">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-center justify-between rounded-[10px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-3 transition-colors hover:border-[var(--border)]"
                >
                  <span className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--foreground)]">
                    <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
                    {a.label}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-[var(--faint)]" />
                </Link>
              );
            })}
            <Link
              href="/admin/ai-filter"
              className="flex items-center justify-between rounded-[10px] border border-[#d45e42]/20 bg-[#d45e42]/[0.06] px-4 py-3 transition-colors hover:bg-[#d45e42]/10"
            >
              <span className="flex items-center gap-2.5 text-[13px] font-medium text-[#d45e42]">
                <ShieldAlert className="h-4 w-4" />
                РКН-очередь (3)
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[#d45e42]" />
            </Link>
          </div>
        </Card>

        {/* Activity */}
        <Card className="p-6">
          <h2 className="mb-4 text-[15px] font-bold text-[var(--foreground)]">Активность сегодня</h2>
          <ul className="flex flex-col gap-3">
            {ACTIVITY.map((a, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  className={`h-[7px] w-[7px] shrink-0 rounded-full ${a.pulse ? "animate-pulse" : ""}`}
                  style={{ background: a.dot }}
                />
                <span className="flex-1 text-[13px] text-[var(--muted-foreground)]">{a.text}</span>
                <span className="shrink-0 text-[11px] text-[var(--faint)]">{a.time}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
