"use client";

import { useState, useTransition } from "react";
import { Panel, KpiCard, AdminButton, Tag } from "@/components/admin/ui";
import { saveRecommendations, type RecConfig } from "./actions";

type Weight = { key: string; label: string; hint: string; value: number };

const WEIGHT_META: Omit<Weight, "value">[] = [
  { key: "history", label: "История чтения", hint: "Ранее прочитанные статьи" },
  { key: "categories", label: "Категории интересов", hint: "По тегам и рубрикам" },
  { key: "popularity", label: "Популярность", hint: "Тренды и вирусность" },
  { key: "collab", label: "Коллаборативная фильтрация", hint: "«Похожие читатели»" },
];

const TOP_RECOMMENDED = [
  { title: "Интерфейс как язык…", count: "12 840 рек.", tone: "success" as const },
  { title: "ИИ-маркетолог vs живой…", count: "9 200 рек.", tone: "success" as const },
  { title: "SEO-тренды 2026…", count: "7 600 рек.", tone: "gold" as const },
];

export function RecommendationsWorkspace({ initialConfig }: { initialConfig: RecConfig }) {
  const [weights, setWeights] = useState<Weight[]>(
    WEIGHT_META.map((m) => ({ ...m, value: initialConfig.weights[m.key] ?? 50 })),
  );
  const [active, setActive] = useState(initialConfig.active);
  const [saved, setSaved] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function setWeight(key: string, value: number) {
    setWeights((w) => w.map((x) => (x.key === key ? { ...x, value } : x)));
    setSaved(null);
  }

  function apply() {
    const config: RecConfig = {
      active,
      weights: Object.fromEntries(weights.map((w) => [w.key, w.value])),
    };
    startTransition(async () => {
      const res = await saveRecommendations(config);
      setSaved(
        res.ok
          ? `Настройки применены в ${new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`
          : "Не удалось сохранить",
      );
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      {/* Weights */}
      <Panel>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Веса алгоритма</h2>
          <button
            type="button"
            onClick={() => setActive((a) => !a)}
            className="cursor-pointer"
            aria-label="Переключить статус алгоритма"
          >
            <Tag tone={active ? "success" : "neutral"}>{active ? "● Активен" : "○ Выключен"}</Tag>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {weights.map((w) => (
            <div key={w.key} className="rounded-2xl bg-[var(--surface-2)] p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-[var(--foreground)]">{w.label}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{w.hint}</div>
                </div>
                <div className="text-lg font-bold tabular-nums text-[var(--foreground)]">{w.value}%</div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={w.value}
                onChange={(e) => setWeight(w.key, Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
                aria-label={`Вес: ${w.label}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-5">
          <AdminButton variant="primary" onClick={apply} className="w-full justify-center">
            Применить настройки
          </AdminButton>
          {saved ? <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">{saved}</p> : null}
        </div>
      </Panel>

      {/* Metrics + top */}
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <KpiCard label="Кликают на рек." value="68%" />
          <KpiCard label="Статей/сессию" value="4.2" />
          <KpiCard label="Сред. сессия" value="7:24" />
          <KpiCard label="Bounce rate" value="23%" />
        </div>

        <Panel>
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Топ рекомендуемых</h2>
          <div className="flex flex-col gap-2">
            {TOP_RECOMMENDED.map((r) => (
              <div
                key={r.title}
                className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-2)] px-4 py-3"
              >
                <span className="truncate text-sm text-[var(--foreground)]">{r.title}</span>
                <span
                  className={`shrink-0 text-sm font-semibold ${
                    r.tone === "success" ? "text-[var(--success)]" : "text-[var(--gold)]"
                  }`}
                >
                  {r.count}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
