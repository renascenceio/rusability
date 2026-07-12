"use client";

import { useState, useTransition } from "react";
import { Panel, AdminButton, Tag } from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import { saveRequirement } from "../ai-content/actions";

type Item = { key: string; title: string; content: string; updatedAt: string | null };

export function RequirementsEditor({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.key ?? "global");
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(items.map((i) => [i.key, i.content])),
  );
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const current = items.find((i) => i.key === active)!;

  function save() {
    setSaved(null);
    start(async () => {
      await saveRequirement(active, current.title, drafts[active]);
      setSaved(active);
      setTimeout(() => setSaved(null), 2500);
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <nav className="flex gap-2 lg:flex-col">
        {items.map((i) => (
          <button
            key={i.key}
            onClick={() => setActive(i.key)}
            className={cn(
              "rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors",
              active === i.key
                ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--muted)]",
            )}
          >
            {i.title}
          </button>
        ))}
      </nav>

      <Panel
        title={current.title}
        action={
          <div className="flex items-center gap-3">
            {saved === active && <Tag tone="success">Сохранено</Tag>}
            <AdminButton onClick={save} disabled={pending}>
              {pending ? "Сохранение…" : "Сохранить"}
            </AdminButton>
          </div>
        }
      >
        <p className="mb-3 text-xs text-[var(--muted-foreground)]">
          Эти правила добавляются к системному промпту всех ИИ-задач в этой области. Поддерживается Markdown.
        </p>
        <textarea
          value={drafts[active] ?? ""}
          onChange={(e) => setDrafts((d) => ({ ...d, [active]: e.target.value }))}
          rows={22}
          className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-[13px] leading-relaxed text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
        />
      </Panel>
    </div>
  );
}
