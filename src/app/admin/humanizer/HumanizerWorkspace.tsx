"use client";

import { useMemo, useState, useTransition } from "react";
import { Panel, AdminButton, Tag } from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import {
  HUMANIZER_CATEGORIES,
  buildHumanizerDirective,
  type HumanizerConfig,
  type HumanizerStrength,
} from "@/lib/ai/humanizer-config";
import { saveHumanizerConfig } from "../ai-content/actions";

const STRENGTHS: { value: HumanizerStrength; label: string; hint: string }[] = [
  { value: "light", label: "Мягкий", hint: "Только явные штампы" },
  { value: "balanced", label: "Средний", hint: "Активно, но бережно" },
  { value: "aggressive", label: "Жёсткий", hint: "Максимально живой голос" },
];

/** Compact on/off switch built on the admin tokens (no external dep). */
function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 text-left transition-colors hover:bg-[var(--muted)]"
    >
      <span
        className={cn(
          "mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
          checked ? "bg-[var(--primary)]" : "bg-[var(--surface-3)]",
        )}
      >
        <span
          className={cn(
            "h-4 w-4 rounded-full bg-white transition-transform",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[var(--foreground)]">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{hint}</span>}
      </span>
    </button>
  );
}

export function HumanizerWorkspace({ initial }: { initial: HumanizerConfig }) {
  const [cfg, setCfg] = useState<HumanizerConfig>(initial);
  const [bansText, setBansText] = useState(initial.hardBans.join("\n"));
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  function patch(p: Partial<HumanizerConfig>) {
    setCfg((c) => ({ ...c, ...p }));
    setSaved(false);
  }

  const activeCats = useMemo(
    () => HUMANIZER_CATEGORIES.filter((c) => cfg.categories[c.id]).length,
    [cfg.categories],
  );

  // Live preview reflects the pending bans text so the editor sees the result.
  const preview = useMemo(() => {
    const hardBans = bansText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    return buildHumanizerDirective({ ...cfg, hardBans });
  }, [cfg, bansText]);

  function save() {
    const hardBans = bansText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    start(async () => {
      await saveHumanizerConfig({ ...cfg, hardBans });
      setCfg((c) => ({ ...c, hardBans }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="space-y-5">
      {/* Master + strength + save */}
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Toggle
              checked={cfg.enabled}
              onChange={(v) => patch({ enabled: v })}
              label={cfg.enabled ? "Гуманизатор включён" : "Гуманизатор выключен"}
              hint="Добавляет правила в системный промпт всей ИИ-генерации"
            />
          </div>
          <div className="flex items-center gap-3">
            {saved && <Tag tone="success">Сохранено</Tag>}
            <AdminButton onClick={save} disabled={pending}>
              {pending ? "Сохранение…" : "Сохранить"}
            </AdminButton>
          </div>
        </div>
      </Panel>

      <div
        className={cn(
          "grid gap-5 lg:grid-cols-2",
          !cfg.enabled && "pointer-events-none opacity-50",
        )}
      >
        <div className="space-y-5">
          {/* Strength */}
          <Panel title="Интенсивность">
            <div className="grid grid-cols-3 gap-2">
              {STRENGTHS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => patch({ strength: s.value })}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors",
                    cfg.strength === s.value
                      ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                      : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--muted)]",
                  )}
                >
                  <span
                    className={cn(
                      "block text-sm font-bold",
                      cfg.strength === s.value ? "text-[var(--primary)]" : "text-[var(--foreground)]",
                    )}
                  >
                    {s.label}
                  </span>
                  <span className="mt-1 block text-[11px] leading-snug text-[var(--muted-foreground)]">
                    {s.hint}
                  </span>
                </button>
              ))}
            </div>
          </Panel>

          {/* Apply-to areas */}
          <Panel title="Где применять">
            <div className="grid gap-2.5 sm:grid-cols-2">
              <Toggle
                checked={cfg.applyTo.articles}
                onChange={(v) => patch({ applyTo: { ...cfg.applyTo, articles: v } })}
                label="Статьи"
                hint="ИИ-авторы, автопубликация, редактор"
              />
              <Toggle
                checked={cfg.applyTo.news}
                onChange={(v) => patch({ applyTo: { ...cfg.applyTo, news: v } })}
                label="Новости"
                hint="Рерайт новостной ленты"
              />
            </div>
          </Panel>

          {/* Rewrite techniques */}
          <Panel title="Приёмы">
            <div className="grid gap-2.5 sm:grid-cols-2">
              <Toggle
                checked={cfg.stripEmDash}
                onChange={(v) => patch({ stripEmDash: v })}
                label="Убирать длинные тире"
                hint="«—» — главный типографический маркер ИИ"
              />
              <Toggle
                checked={cfg.addParticles}
                onChange={(v) => patch({ addParticles: v })}
                label="Живые частицы"
                hint="же, ведь, вот, разве, неужели"
              />
              <Toggle
                checked={cfg.boostBurstiness}
                onChange={(v) => patch({ boostBurstiness: v })}
                label="Рваный ритм (burstiness)"
                hint="Чередовать короткие и длинные фразы"
              />
              <Toggle
                checked={cfg.contrastiveSubtraction}
                onChange={(v) => patch({ contrastiveSubtraction: v })}
                label="Контрастное вычитание"
                hint="Избегать самых предсказуемых слов"
              />
              <Toggle
                checked={cfg.secondPass}
                onChange={(v) => patch({ secondPass: v })}
                label="Второй проход"
                hint="Отдельно переписать готовый черновик (дороже, но чище)"
              />
            </div>
          </Panel>

          {/* Categories */}
          <Panel
            title="Категории маркеров"
            action={
              <Tag tone="primary">
                {activeCats}/{HUMANIZER_CATEGORIES.length}
              </Tag>
            }
          >
            <div className="grid gap-2">
              {HUMANIZER_CATEGORIES.map((c) => {
                const on = cfg.categories[c.id];
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => patch({ categories: { ...cfg.categories, [c.id]: !on } })}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                      on
                        ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                        : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--muted)]",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                        on
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "bg-[var(--surface-3)] text-[var(--muted-foreground)]",
                      )}
                    >
                      {c.id}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[var(--foreground)]">
                        {c.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-[var(--muted-foreground)]">
                        {c.summary}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* Right column: bans, notes, live preview */}
        <div className="space-y-5">
          <Panel title="Жёсткие баны">
            <p className="mb-3 text-xs text-[var(--muted-foreground)]">
              По одной конструкции в строке. Эти обороты ИИ не будет использовать ни в каком виде.
            </p>
            <textarea
              value={bansText}
              onChange={(e) => {
                setBansText(e.target.value);
                setSaved(false);
              }}
              rows={12}
              className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 font-mono text-[13px] leading-relaxed text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
            />
          </Panel>

          <Panel title="Правила редакции (дополнительно)">
            <p className="mb-3 text-xs text-[var(--muted-foreground)]">
              Свободный текст: добавляется в конец директивы. Например, тон, любимые обороты, что оставлять.
            </p>
            <textarea
              value={cfg.extraNotes}
              onChange={(e) => patch({ extraNotes: e.target.value })}
              rows={5}
              placeholder="Напр.: я профессиональный редактор — длинное тире оставляй; избегай англицизмов."
              className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 text-sm leading-relaxed text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
            />
          </Panel>

          <Panel title="Что увидит ИИ (предпросмотр директивы)">
            {preview ? (
              <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 font-mono text-[12px] leading-relaxed text-[var(--muted-foreground)]">
                {preview}
              </pre>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">
                Гуманизатор выключен — директива не добавляется к промпту.
              </p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
