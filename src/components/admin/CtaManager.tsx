"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Panel, AdminButton, Tag } from "@/components/admin/ui";
import type { SiteCta } from "@/lib/data/ctas";
import { saveCta, toggleCta, deleteCta, type CtaInput } from "@/app/admin/ads/actions";

const VARIANT_LABEL: Record<SiteCta["variant"], string> = {
  soft: "Мягкий",
  gradient: "Градиент",
  dark: "Тёмный",
};

const PLACEMENT_HINT: Record<string, string> = {
  home_digest: "Главная — блок «дайджест»",
  home_events: "Главная — блок «спецпроекты»",
  news: "Страница «Новости»",
};

const EMPTY: CtaInput = {
  placement: "",
  eyebrow: "",
  title: "",
  body: "",
  buttonLabel: "",
  buttonHref: "",
  variant: "soft",
  active: true,
};

export function CtaManager({ ctas }: { ctas: SiteCta[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<CtaInput | null>(null);
  const [isNew, setIsNew] = useState(false);

  function openEdit(cta: SiteCta) {
    setIsNew(false);
    setEditing({ ...cta });
  }
  function openNew() {
    setIsNew(true);
    setEditing({ ...EMPTY });
  }

  function save() {
    if (!editing) return;
    start(async () => {
      await saveCta(editing);
      setEditing(null);
      router.refresh();
    });
  }

  function toggle(placement: string, active: boolean) {
    start(async () => {
      await toggleCta(placement, active);
      router.refresh();
    });
  }

  function remove(placement: string) {
    if (!confirm(`Удалить CTA-блок «${placement}»?`)) return;
    start(async () => {
      await deleteCta(placement);
      router.refresh();
    });
  }

  return (
    <Panel
      title={`CTA-блоки (${ctas.length})`}
      action={
        <AdminButton variant="primary" onClick={openNew}>
          <Plus size={15} /> Новый блок
        </AdminButton>
      }
    >
      <p className="mb-4 text-sm text-[var(--muted-foreground)]">
        Эти блоки заменяют старые формы сбора e-mail и показываются на публичных страницах.
        Изменения сразу видны на сайте.
      </p>

      {ctas.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
          Пока нет ни одного CTA-блока. Создайте первый.
        </p>
      ) : (
        <ul className="space-y-2">
          {ctas.map((c) => (
            <li
              key={c.placement}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold text-[var(--foreground)]">
                    {c.title || "(без заголовка)"}
                  </span>
                  <Tag tone={c.active ? "success" : "neutral"}>
                    {c.active ? "Активен" : "Выключен"}
                  </Tag>
                  <Tag tone="primary">{VARIANT_LABEL[c.variant]}</Tag>
                </div>
                <div className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
                  {PLACEMENT_HINT[c.placement] ?? c.placement}
                  {c.buttonLabel ? ` · кнопка: «${c.buttonLabel}» → ${c.buttonHref || "#"}` : ""}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => toggle(c.placement, !c.active)}
                  disabled={pending}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    c.active ? "bg-[var(--primary)]" : "bg-[var(--surface-3)]"
                  }`}
                  aria-label={c.active ? "Выключить" : "Включить"}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      c.active ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <button
                  title="Редактировать"
                  onClick={() => openEdit(c)}
                  className="rounded-md border border-[var(--border)] p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                >
                  <Pencil size={14} />
                </button>
                <button
                  title="Удалить"
                  onClick={() => remove(c.placement)}
                  className="rounded-md border border-[var(--border)] p-1.5 text-[var(--danger)] hover:bg-[var(--surface-2)]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Editor modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !pending && setEditing(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[var(--foreground)]">
                {isNew ? "Новый CTA-блок" : "Редактирование CTA"}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <Field label="Размещение (placement)">
                <input
                  value={editing.placement}
                  disabled={!isNew}
                  onChange={(e) => setEditing({ ...editing, placement: e.target.value })}
                  placeholder="например: news, home_digest"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm disabled:opacity-60"
                />
              </Field>
              <Field label="Надзаголовок (eyebrow)">
                <input
                  value={editing.eyebrow}
                  onChange={(e) => setEditing({ ...editing, eyebrow: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Заголовок">
                <input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Текст">
                <textarea
                  value={editing.body}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Текст кнопки">
                  <input
                    value={editing.buttonLabel}
                    onChange={(e) => setEditing({ ...editing, buttonLabel: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                </Field>
                <Field label="Ссылка кнопки">
                  <input
                    value={editing.buttonHref}
                    onChange={(e) => setEditing({ ...editing, buttonHref: e.target.value })}
                    placeholder="/articles"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Стиль">
                  <select
                    value={editing.variant}
                    onChange={(e) =>
                      setEditing({ ...editing, variant: e.target.value as SiteCta["variant"] })
                    }
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  >
                    <option value="soft">Мягкий</option>
                    <option value="gradient">Градиент</option>
                    <option value="dark">Тёмный</option>
                  </select>
                </Field>
                <Field label="Статус">
                  <label className="flex h-[38px] items-center gap-2 text-sm text-[var(--foreground)]">
                    <input
                      type="checkbox"
                      checked={editing.active}
                      onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                    />
                    Активен
                  </label>
                </Field>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <AdminButton variant="ghost" onClick={() => setEditing(null)} disabled={pending}>
                Отмена
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={save}
                disabled={pending || !editing.placement.trim()}
              >
                <Check size={15} /> Сохранить
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        {label}
      </span>
      {children}
    </label>
  );
}
