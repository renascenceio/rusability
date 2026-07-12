"use client";

import { useState } from "react";
import { Plus, Mail, Eye } from "lucide-react";
import { PageHeader, Panel, Tag, AdminButton, Table, Th, Td, KpiCard } from "@/components/admin/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { formatNumber } from "@/lib/utils";

type Status = "sent" | "scheduled" | "draft" | "sending";
type Campaign = {
  id: string;
  name: string;
  subject: string;
  audience: string;
  recipients: number;
  status: Status;
  openRate: number;
  clickRate: number;
};

const TONE = { sent: "success", scheduled: "primary", draft: "neutral", sending: "warn" } as const;
const LABEL = { sent: "Отправлено", scheduled: "Запланировано", draft: "Черновик", sending: "Отправляется" } as const;

const TEMPLATES = [
  { id: "t1", name: "Еженедельный дайджест", desc: "Топ-5 материалов недели", uses: 48 },
  { id: "t2", name: "Приветственное письмо", desc: "Триггер на подписку", uses: 1240 },
  { id: "t3", name: "Анонс материала", desc: "Одиночный анонс статьи", uses: 96 },
];

const SCHEDULE = [
  { id: "s1", name: "Дайджест недели", when: "Каждый четверг, 10:00", audience: "Все подписчики", on: true },
  { id: "s2", name: "Инвест-сводка", when: "1-е число месяца, 09:00", audience: "Профи", on: true },
  { id: "s3", name: "VIP-анонсы", when: "По мере выхода Elite", audience: "Elite-читатели", on: false },
];

export function NewsletterWorkspace({ campaigns }: { campaigns: Campaign[] }) {
  const [list, setList] = useState<Campaign[]>(campaigns);
  const [schedule, setSchedule] = useState(SCHEDULE);

  const totalRecipients = list.reduce((s, c) => s + c.recipients, 0);
  const sent = list.filter((c) => c.status === "sent");
  const avgOpen = sent.length ? Math.round(sent.reduce((s, c) => s + c.openRate, 0) / sent.length) : 0;
  const scheduled = list.filter((c) => c.status === "scheduled").length;

  function createDraft() {
    const n = list.filter((c) => c.status === "draft").length + 1;
    setList((l) => [
      {
        id: `draft-${Date.now()}`,
        name: `Новая рассылка ${n}`,
        subject: "Без темы",
        audience: "Все подписчики",
        recipients: totalRecipients,
        status: "draft",
        openRate: 0,
        clickRate: 0,
      },
      ...l,
    ]);
  }

  const kpis = (
    <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard label="Всего подписчиков" value={formatNumber(totalRecipients)} icon={<Mail className="h-4 w-4" />} />
      <KpiCard label="Средний Open Rate" value={`${avgOpen}%`} delta="2,3%" deltaUp />
      <KpiCard label="Кампаний отправлено" value={String(sent.length)} />
      <KpiCard label="Запланировано" value={String(scheduled)} />
    </div>
  );

  const campaignsTable = (
    <Panel>
      <Table>
        <thead>
          <tr>
            <Th>Кампания</Th>
            <Th>Аудитория</Th>
            <Th>Статус</Th>
            <Th className="text-right">Open</Th>
            <Th className="text-right">Click</Th>
          </tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.id} className="transition-colors hover:bg-[var(--muted)]">
              <Td>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{c.subject}</div>
              </Td>
              <Td className="whitespace-nowrap text-[var(--muted-foreground)]">
                {c.audience} · {formatNumber(c.recipients)}
              </Td>
              <Td>
                <Tag tone={TONE[c.status]}>{LABEL[c.status]}</Tag>
              </Td>
              <Td className="text-right font-semibold">{c.openRate}%</Td>
              <Td className="text-right font-semibold">{c.clickRate}%</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Panel>
  );

  return (
    <>
      <PageHeader
        title="Рассылки"
        subtitle="Email-маркетинг и кампании"
        action={
          <div className="flex gap-2">
            <AdminButton href="/email" variant="outline">
              <Eye className="h-4 w-4" /> Превью письма
            </AdminButton>
            <AdminButton variant="primary" onClick={createDraft}>
              <Plus className="h-4 w-4" /> Создать кампанию
            </AdminButton>
          </div>
        }
      />

      <AdminTabs
        tabs={[
          {
            id: "analytics",
            label: "Аналитика",
            content: (
              <div>
                {kpis}
                <div className="grid gap-5 lg:grid-cols-2">
                  <Panel title="Лучшие кампании">
                    <div className="flex flex-col gap-2">
                      {[...sent]
                        .sort((a, b) => b.openRate - a.openRate)
                        .slice(0, 4)
                        .map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-2)] px-4 py-3"
                          >
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-[var(--foreground)]">{c.name}</div>
                              <div className="text-xs text-[var(--muted-foreground)]">
                                {formatNumber(c.recipients)} отправлено
                              </div>
                            </div>
                            <span className="shrink-0 text-sm font-semibold text-[var(--success)]">{c.openRate}%</span>
                          </div>
                        ))}
                    </div>
                  </Panel>
                  <Panel title="Кликабельность">
                    <div className="flex flex-col gap-2">
                      {[...sent]
                        .sort((a, b) => b.clickRate - a.clickRate)
                        .slice(0, 4)
                        .map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-2)] px-4 py-3"
                          >
                            <span className="truncate text-sm text-[var(--foreground)]">{c.name}</span>
                            <span className="shrink-0 text-sm font-semibold text-[var(--primary)]">{c.clickRate}%</span>
                          </div>
                        ))}
                    </div>
                  </Panel>
                </div>
              </div>
            ),
          },
          { id: "campaigns", label: "Кампании", content: campaignsTable },
          {
            id: "templates",
            label: "Шаблоны",
            content: (
              <div className="grid gap-4 md:grid-cols-3">
                {TEMPLATES.map((t) => (
                  <div key={t.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                    <div className="font-serif text-lg font-bold text-[var(--foreground)]">{t.name}</div>
                    <div className="mt-1 text-sm text-[var(--muted-foreground)]">{t.desc}</div>
                    <div className="mt-3 text-xs text-[var(--muted-foreground)]">Использован {t.uses} раз</div>
                    <AdminButton variant="outline" className="mt-4 w-full justify-center" onClick={createDraft}>
                      Использовать
                    </AdminButton>
                  </div>
                ))}
              </div>
            ),
          },
          {
            id: "schedule",
            label: "Расписание",
            content: (
              <Panel>
                <div className="flex flex-col divide-y divide-[var(--border)]">
                  {schedule.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                      <div>
                        <div className="font-medium text-[var(--foreground)]">{s.name}</div>
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {s.when} · {s.audience}
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-pressed={s.on}
                        aria-label={`Расписание: ${s.name}`}
                        onClick={() =>
                          setSchedule((list2) => list2.map((x) => (x.id === s.id ? { ...x, on: !x.on } : x)))
                        }
                      >
                        <span
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            s.on ? "bg-[var(--primary)]" : "bg-[var(--surface-3)]"
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                              s.on ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </Panel>
            ),
          },
        ]}
      />
    </>
  );
}
