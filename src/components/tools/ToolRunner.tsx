"use client";

import { useState } from "react";
import { Copy, Check, Loader2, Sparkles } from "lucide-react";
import { runTool, type ToolRunResult } from "@/app/actions/tools";
import type { ToolField, ToolOutput, ToolValues } from "@/lib/tools/registry";

type SerializableTool = {
  slug: string;
  title: string;
  intro: string;
  fields: ToolField[];
  output: ToolOutput;
};

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
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Input form */}
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {tool.fields.map((f) => (
          <div key={f.name} className="flex flex-col gap-1.5">
            <label
              htmlFor={`f-${f.name}`}
              className="text-sm font-semibold text-[var(--foreground)]"
            >
              {f.label}
              {f.required && <span className="text-[var(--accent)]"> *</span>}
            </label>

            {f.type === "textarea" ? (
              <textarea
                id={`f-${f.name}`}
                value={values[f.name] ?? ""}
                onChange={(e) => setField(f.name, e.target.value)}
                placeholder={f.placeholder}
                maxLength={f.maxLength}
                rows={5}
                className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)]"
              />
            ) : f.type === "select" ? (
              <select
                id={`f-${f.name}`}
                value={values[f.name] ?? ""}
                onChange={(e) => setField(f.name, e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)]"
              >
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`f-${f.name}`}
                type="text"
                value={values[f.name] ?? ""}
                onChange={(e) => setField(f.name, e.target.value)}
                placeholder={f.placeholder}
                maxLength={f.maxLength}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)]"
              />
            )}

            {(f.help || f.maxLength) && (
              <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                <span>{f.help}</span>
                {f.maxLength && (
                  <span>
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

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-60"
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
        <p className="text-xs text-[var(--muted-foreground)]">
          Бесплатно и без регистрации. Проверяйте результат перед публикацией.
        </p>
      </form>

      {/* Output */}
      <div className="flex flex-col">
        <div className="mb-3 text-sm font-semibold text-[var(--foreground)]">
          {tool.output.label}
        </div>

        {error && (
          <div className="rounded-lg border border-[var(--accent)] bg-[var(--accent-soft,var(--surface-2))] px-4 py-3 text-sm text-[var(--foreground)]">
            {error}
          </div>
        )}

        {!error && !result && !loading && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-[var(--border)] px-4 py-12 text-center text-sm text-[var(--muted-foreground)]">
            Заполните поля слева и нажмите «Сгенерировать» — результат появится здесь.
          </div>
        )}

        {loading && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-[var(--border)] px-4 py-12 text-sm text-[var(--muted-foreground)]">
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
    <li className="flex items-start justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1,var(--background))] px-4 py-3">
      <span className="text-sm leading-relaxed text-[var(--foreground)]">{text}</span>
      <button
        type="button"
        onClick={() => copy(text)}
        aria-label="Скопировать"
        className="mt-0.5 shrink-0 text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]"
      >
        {copied ? <Check className="h-4 w-4 text-[var(--primary)]" /> : <Copy className="h-4 w-4" />}
      </button>
    </li>
  );
}

function ResultBlock({ text }: { text: string }) {
  const { copied, copy } = useCopy();
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-1,var(--background))] p-4">
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => copy(text)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[var(--primary)]" /> Скопировано
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Копировать
            </>
          )}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">{text}</p>
    </div>
  );
}
