"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bot, Settings2, Check, X } from "lucide-react";
import { Tag, AdminButton } from "@/components/admin/ui";
import { categoryName } from "@/lib/taxonomy";
import { formatDate } from "@/lib/utils";
import { toggleAuthorActive, updateAiAuthor } from "../ai-content/actions";

type Author = {
  id: string;
  name: string;
  archetype: string;
  bio: string;
  tone: string;
  approach: string;
  stylePrompt: string;
  category: string;
  topics: string[];
  schedule: string;
  active: boolean;
  published: number;
  articlesCount: number;
  lastRun: string | null;
};

const SCHEDULE_LABEL: Record<string, string> = {
  hourly: "Каждый час",
  daily: "Ежедневно",
  weekly: "Еженедельно",
};

export function AiAuthorsGrid({ authors }: { authors: Author[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ tone: string; approach: string; stylePrompt: string; schedule: string; topics: string }>({
    tone: "",
    approach: "",
    stylePrompt: "",
    schedule: "daily",
    topics: "",
  });

  function openEdit(a: Author) {
    setEditing(a.id);
    setDraft({
      tone: a.tone,
      approach: a.approach,
      stylePrompt: a.stylePrompt,
      schedule: a.schedule,
      topics: a.topics.join(", "),
    });
  }

  function save(id: string) {
    start(async () => {
      await updateAiAuthor(id, {
        tone: draft.tone,
        approach: draft.approach,
        stylePrompt: draft.stylePrompt,
        schedule: draft.schedule,
        topics: draft.topics.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setEditing(null);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {authors.map((a) => (
        <div key={a.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)]">
              <Bot className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-[var(--foreground)]">{a.name}</h3>
                <Tag tone={a.active ? "success" : "neutral"}>{a.active ? "Активен" : "На паузе"}</Tag>
              </div>
              <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                {a.archetype || categoryName(a.category)}
              </p>
            </div>
          </div>

          {editing === a.id ? (
            <div className="mt-4 space-y-3 text-sm">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[var(--muted-foreground)]">Тон</span>
                <input
                  value={draft.tone}
                  onChange={(e) => setDraft({ ...draft, tone: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[var(--muted-foreground)]">Подход</span>
                <input
                  value={draft.approach}
                  onChange={(e) => setDraft({ ...draft, approach: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[var(--muted-foreground)]">
                  Стиль (промпт для ИИ)
                </span>
                <textarea
                  value={draft.stylePrompt}
                  onChange={(e) => setDraft({ ...draft, stylePrompt: e.target.value })}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--muted-foreground)]">Ритм</span>
                  <select
                    value={draft.schedule}
                    onChange={(e) => setDraft({ ...draft, schedule: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                  >
                    <option value="hourly">Каждый час</option>
                    <option value="daily">Ежедневно</option>
                    <option value="weekly">Еженедельно</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[var(--muted-foreground)]">Темы</span>
                  <input
                    value={draft.topics}
                    onChange={(e) => setDraft({ ...draft, topics: e.target.value })}
                    placeholder="через запятую"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <AdminButton disabled={pending} onClick={() => save(a.id)}>
                  <Check size={15} /> Сохранить
                </AdminButton>
                <AdminButton variant="ghost" onClick={() => setEditing(null)}>
                  <X size={15} /> Отмена
                </AdminButton>
              </div>
            </div>
          ) : (
            <>
              {a.bio && <p className="mt-3 line-clamp-2 text-sm text-[var(--muted-foreground)]">{a.bio}</p>}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {a.topics.slice(0, 5).map((t) => (
                  <Tag key={t} tone="neutral">
                    {t}
                  </Tag>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--muted-foreground)]">
                <span>Ритм: {SCHEDULE_LABEL[a.schedule] ?? a.schedule}</span>
                <span>{a.articlesCount} опубликовано</span>
              </div>
              <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                Последний запуск: {a.lastRun ? formatDate(a.lastRun) : "—"}
              </div>
              <div className="mt-4 flex gap-2">
                <AdminButton variant="ghost" className="flex-1" onClick={() => openEdit(a)}>
                  <Settings2 size={15} /> Настроить
                </AdminButton>
                <AdminButton
                  variant="outline"
                  className="flex-1"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await toggleAuthorActive(a.id, !a.active);
                      router.refresh();
                    })
                  }
                >
                  {a.active ? "Пауза" : "Запустить"}
                </AdminButton>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
