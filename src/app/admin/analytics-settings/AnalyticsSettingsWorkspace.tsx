"use client";

import { useState, useTransition } from "react";
import { Check, Info } from "lucide-react";
import { Panel, AdminButton, Tag } from "@/components/admin/ui";
import { saveAnalyticsSettings } from "./actions";
import type { AnalyticsConfig } from "@/lib/data/analytics-config";

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      aria-pressed={on}
      aria-label={label}
    >
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          on ? "bg-[var(--primary)]" : "bg-[var(--surface-3)]"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function ProviderCard({
  title,
  subtitle,
  idLabel,
  idPlaceholder,
  enabled,
  id,
  onEnabledChange,
  onIdChange,
}: {
  title: string;
  subtitle: string;
  idLabel: string;
  idPlaceholder: string;
  enabled: boolean;
  id: string;
  onEnabledChange: (next: boolean) => void;
  onIdChange: (next: string) => void;
}) {
  return (
    <Panel>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-bold text-[var(--foreground)]">{title}</h2>
            {enabled ? (
              <Tag tone="success">
                <Check className="h-3.5 w-3.5" /> Включён
              </Tag>
            ) : (
              <Tag tone="neutral">Отключён</Tag>
            )}
          </div>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{subtitle}</p>
        </div>
        <Toggle on={enabled} onChange={onEnabledChange} label={`Включить ${title}`} />
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-semibold text-[var(--foreground)]">
          {idLabel}
        </span>
        <input
          type="text"
          value={id}
          onChange={(e) => onIdChange(e.target.value)}
          placeholder={idPlaceholder}
          spellCheck={false}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 font-mono text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)]"
        />
      </label>
    </Panel>
  );
}

export function AnalyticsSettingsWorkspace({ initial }: { initial: AnalyticsConfig }) {
  const [config, setConfig] = useState<AnalyticsConfig>(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  function patch(next: Partial<AnalyticsConfig>) {
    setConfig((c) => ({ ...c, ...next }));
    setMessage(null);
  }

  function save() {
    setMessage(null);
    startTransition(async () => {
      const res = await saveAnalyticsSettings(config);
      if (res.ok) {
        setConfig(res.config);
        setMessage({ tone: "ok", text: "Настройки сохранены и применены на сайте." });
      } else {
        setMessage({ tone: "err", text: res.error });
      }
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-start gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Счётчики работают только на опубликованном сайте (в предпросмотре и локально трекинг
          отключён, чтобы не искажать статистику). Изменения применяются сразу после сохранения.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ProviderCard
          title="Google Analytics 4"
          subtitle="Для российской аудитории отдаёт заниженные данные — блокировки и троттлинг доменов Google."
          idLabel="Measurement ID"
          idPlaceholder="G-XXXXXXXXXX"
          enabled={config.ga.enabled}
          id={config.ga.id}
          onEnabledChange={(enabled) => patch({ ga: { ...config.ga, enabled } })}
          onIdChange={(id) => patch({ ga: { ...config.ga, id } })}
        />
        <ProviderCard
          title="Яндекс.Метрика"
          subtitle="Основной счётчик для рунета: российский домен, не подпадает под троттлинг."
          idLabel="Номер счётчика"
          idPlaceholder="12345678"
          enabled={config.metrika.enabled}
          id={config.metrika.id}
          onEnabledChange={(enabled) => patch({ metrika: { ...config.metrika, enabled } })}
          onIdChange={(id) => patch({ metrika: { ...config.metrika, id } })}
        />
      </div>

      <div className="flex items-center gap-3">
        <AdminButton onClick={save} disabled={pending}>
          {pending ? "Сохранение…" : "Сохранить"}
        </AdminButton>
        {message && (
          <span
            className={`text-sm font-semibold ${
              message.tone === "ok" ? "text-[var(--success)]" : "text-[var(--danger)]"
            }`}
            role="status"
          >
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}
