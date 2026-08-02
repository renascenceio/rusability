"use client";

import { useState } from "react";
import { Copy, Check, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { runTool, type ToolRunResult } from "@/app/actions/tools";
import type { ToolField, ToolOutput, ToolValues } from "@/lib/tools/registry";

type SerializableTool = {
  slug: string;
  title: string;
  intro: string;
  fields: ToolField[];
  output: ToolOutput;
};

const FIELD_CLASS =
  "w-full rounded-[var(--tool-radius-inner)] border border-[var(--tool-border)] bg-[var(--tool-field)] px-4 text-[15px] text-[var(--tool-text)] outline-none transition-colors placeholder:text-[var(--tool-muted)] focus:border-[var(--tool-accent)]";

export function ToolRunner({ tool }: { tool: SerializableTool }) {
  const [values, setValues] = useState<ToolValues>(() =>
    Object.fromEntries(
      tool.fields.map((f) => [
        f.name,
        f.type === "select" ? (f.options?.[0]?.value ?? "") : "",
      ]),
    ),
  );
  const [company, setCompany] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ToolRunResult | null>(null);

  function setField(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await runTool({ slug: tool.slug, values, company });
      if (res.ok) setResult(res);
      else setError(res.error);
    } catch {
      setError("Что-то пошло не так. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-2">
      {/* Input panel */}
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-5 rounded-[var(--tool-radius)] border border-[var(--tool-border)] bg-[var(--tool-surface)] p-6"
      >
        <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--tool-muted)]">
          Ваши данные
        </h2>

        {tool.fields.map((f) => (
          <div key={f.name} className="flex flex-col gap-1.5">
            <label
              htmlFor={`f-${f.name}`}
              className="text-sm font-semibold text-[var(--tool-text)]"
            >
              {f.label}
              {f.required && <span className="text-[var(--tool-accent)]"> *</span>}
            </label>

            {f.type === "textarea" ? (
              <textarea
                id={`f-${f.name}`}
                value={values[f.name] ?? ""}
                onChange={(e) => setField(f.name, e.target.value)}
                placeholder={f.placeholder}
                maxLength={f.maxLength}
                rows={6}
                className={`${FIELD_CLASS} min-h-[150px] resize-y py-3 leading-relaxed`}
              />
            ) : f.type === "select" ? (
              <div className="relative">
                <select
                  id={`f-${f.name}`}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setField(f.name, e.target.value)}
                  className={`${FIELD_CLASS} h-12 cursor-pointer appearance-none pr-11`}
                >
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden
                  className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tool-muted)]"
                />
              </div>
            ) : (
              <input
                id={`f-${f.name}`}
                type="text"
                value={values[f.name] ?? ""}
                onChange={(e) => setField(f.name, e.target.value)}
                placeholder={f.placeholder}
                maxLength={f.maxLength}
                className={`${FIELD_CLASS} h-12`}
              />
            )}

            {(f.help || f.maxLength) && (
              <div className="flex justify-between gap-3 text-xs text-[var(--tool-muted)]">
                <span>{f.help}</span>
                {f.maxLength && (
                  <span className="shrink-0 tabular-nums">
                    {(values[f.name] ?? "").length}/{f.maxLength}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Honeypot — hidden from users, visible to bots */}
        <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label>
            Компания
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-1 flex flex-col gap-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--tool-radius-inner)] bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Генерируем…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Сгенерировать
              </>
            )}
          </button>
          <p className="text-xs text-[var(--tool-muted)]">
            Бесплатно и без регистрации. Проверяйте результат перед публикацией.
          </p>
        </div>
      </form>

      {/* Output panel — same padding/radius/border so its top edge aligns with the form */}
      <div className="flex flex-col rounded-[var(--tool-radius)] border border-[var(--tool-border)] bg-[var(--tool-surface)] p-6">
        <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.1em] text-[var(--tool-muted)]">
          {tool.output.label}
        </h2>

        {error && (
          <div className="rounded-[var(--tool-radius-inner)] border border-[var(--tool-border-strong)] bg-[var(--tool-result-bg)] px-4 py-3 text-sm text-[var(--tool-text)]">
            {error}
          </div>
        )}

        {!error && !result && !loading && (
          <div className="flex flex-1 items-center justify-center rounded-[var(--tool-radius-inner)] border border-dashed border-[var(--tool-border-strong)] px-4 py-12 text-center text-sm text-[var(--tool-muted)]">
            Заполните поля слева и нажмите «Сгенерировать» — результат появится здесь.
          </div>
        )}

        {loading && (
          <div className="flex flex-1 items-center justify-center rounded-[var(--tool-radius-inner)] border border-dashed border-[var(--tool-border-strong)] px-4 py-12 text-sm text-[var(--tool-muted)]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Готовим варианты…
          </div>
        )}

        {result?.ok && result.kind === "variants" && (
          <ul className="flex flex-col gap-2.5">
            {result.results.map((r, i) => (
              <ResultRow key={i} text={r} />
            ))}
          </ul>
        )}

        {result?.ok && result.kind === "text" && <ResultBlock text={result.text} />}
      </div>
    </div>
  );
}

function useCopy() {
  const [copied, setCopied] = useState(false);
  function copy(text: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return { copied, copy };
}

function ResultRow({ text }: { text: string }) {
  const { copied, copy } = useCopy();
  return (
    <li className="flex items-start justify-between gap-3 rounded-[var(--tool-radius-inner)] border border-[var(--tool-border)] bg-[var(--tool-result-bg)] px-4 py-3">
      <span className="text-[13px] leading-relaxed text-[var(--tool-result-text)]">
        {text}
      </span>
      <button
        type="button"
        onClick={() => copy(text)}
        aria-label="Скопировать"
        className="mt-0.5 shrink-0 text-[var(--tool-muted)] transition-colors hover:text-[var(--tool-accent)]"
      >
        {copied ? (
          <Check className="h-4 w-4 text-[var(--tool-accent)]" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </li>
  );
}

function ResultBlock({ text }: { text: string }) {
  const { copied, copy } = useCopy();
  return (
    <div className="rounded-[var(--tool-radius-inner)] border border-[var(--tool-border)] bg-[var(--tool-result-bg)] p-4">
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => copy(text)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--tool-muted)] transition-colors hover:text-[var(--tool-accent)]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[var(--tool-accent)]" /> Скопировано
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Копировать
            </>
          )}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--tool-result-text)]">
        {text}
      </p>
    </div>
  );
}
