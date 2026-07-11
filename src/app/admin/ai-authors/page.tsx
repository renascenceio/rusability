import { Bot, Plus, TrendingUp, Target, ShieldCheck } from "lucide-react";
import { PageHeader, Panel, Tag, AdminButton } from "@/components/admin/ui";
import { AI_AUTHORS } from "@/lib/mock";

export const metadata = { title: "ИИ-авторы — Rusability" };

export default function AiAuthorsPage() {
  const active = AI_AUTHORS.filter((a) => a.status === "active").length;
  const totalArticles = AI_AUTHORS.reduce((s, a) => s + a.articlesTotal, 0);

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="ИИ-авторы"
        subtitle={`${active} активных · ${totalArticles.toLocaleString("ru-RU")} материалов сгенерировано`}
        action={
          <AdminButton variant="primary">
            <Plus className="h-4 w-4" /> Новый ИИ-автор
          </AdminButton>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {AI_AUTHORS.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <div className="flex items-start gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
                style={{ background: a.accent }}
              >
                <Bot className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-[var(--foreground)]">
                    {a.name}
                  </h3>
                  <Tag tone={a.status === "active" ? "success" : "neutral"}>
                    {a.status === "active" ? "Активен" : "На паузе"}
                  </Tag>
                </div>
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{a.archetype}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Stat icon={<TrendingUp className="h-3.5 w-3.5" />} label="SEO" value={a.seo} />
              <Stat icon={<Target className="h-3.5 w-3.5" />} label="AEO" value={a.aeo} />
              <Stat icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Точность" value={a.accuracy} />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--muted-foreground)]">
              <span>Ритм: {a.cadence}</span>
              <span>{a.articlesTotal} статей</span>
            </div>
            <div className="mt-1 text-xs text-[var(--muted-foreground)]">
              Последняя публикация: {a.lastPublished}
            </div>

            <div className="mt-4 flex gap-2">
              <AdminButton variant="ghost" className="flex-1">
                Настроить
              </AdminButton>
              <AdminButton variant="outline" className="flex-1">
                {a.status === "active" ? "Пауза" : "Запустить"}
              </AdminButton>
            </div>
          </div>
        ))}
      </div>

      <Panel title="Как работают ИИ-авторы" className="mt-5">
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          Каждый ИИ-автор — это отдельный архетип с собственным стилем, набором тем и расписанием
          публикаций. Материалы проходят через ИИ-фильтр РКН и оценку SEO/AEO/GEO перед выходом в
          ленту. Вы можете настроить тон, частоту и темы, а также поставить автора на паузу в любой
          момент.
        </p>
      </Panel>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[var(--muted)] px-2 py-2.5 text-center">
      <div className="flex items-center justify-center gap-1 text-[var(--muted-foreground)]">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-1 text-lg font-bold text-[var(--foreground)]">{value}</div>
    </div>
  );
}
