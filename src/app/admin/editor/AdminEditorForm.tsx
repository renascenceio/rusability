"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArticleBlock, CategorySlug } from "@/lib/types";
import { adminGenerateDraft, adminPublishArticle } from "./actions";

type AuthorOption = { id: string; name: string; elite: boolean };
type CategoryOption = { slug: CategorySlug; name: string };

/** Convert the plain-text body into typed article blocks (## → h2, ### → h3). */
function textToBlocks(text: string): ArticleBlock[] {
  return text
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk): ArticleBlock => {
      if (chunk.startsWith("### ")) return { type: "h3", text: chunk.slice(4).trim() };
      if (chunk.startsWith("## ")) return { type: "h2", text: chunk.slice(3).trim() };
      if (chunk.startsWith("> ")) return { type: "quote", text: chunk.slice(2).trim() };
      return { type: "p", text: chunk };
    });
}

function blocksToText(body: ArticleBlock[]): string {
  return body
    .map((b) => {
      if (b.type === "h2") return `## ${b.text}`;
      if (b.type === "h3") return `### ${b.text}`;
      if (b.type === "quote") return `> ${b.text}`;
      if (b.type === "list") return b.items.map((i) => `• ${i}`).join("\n");
      if (b.type === "p") return b.text;
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}

const CARD = "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm";
const CARD_LABEL = "mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted-foreground)]";
const FIELD =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]";

export function AdminEditorForm({
  authors,
  categories,
}: {
  authors: AuthorOption[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [authorId, setAuthorId] = useState(authors[0]?.id ?? "");
  const [category, setCategory] = useState<CategorySlug>(categories[0]?.slug ?? ("design" as CategorySlug));
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [scores, setScores] = useState<{ seo: number; aeo: number; geo: number } | null>(null);

  const [topic, setTopic] = useState("");
  const [materials, setMaterials] = useState("");
  const [genOpen, setGenOpen] = useState(true);

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [pending, startTransition] = useTransition();

  const words = useMemo(
    () => (title + " " + bodyText).trim().split(/\s+/).filter(Boolean).length,
    [title, bodyText],
  );
  const readiness = Math.min(100, Math.round((words / 700) * 100));

  async function handleGenerate() {
    setErr(null);
    setMsg(null);
    if (!topic.trim()) {
      setErr("Укажите тему для генерации.");
      return;
    }
    setGenerating(true);
    try {
      const res = await adminGenerateDraft({
        topic,
        context: materials,
        category,
        authorName: authors.find((a) => a.id === authorId)?.name,
      });
      if (!res.ok || !res.draft) {
        setErr(res.error ?? "Не удалось сгенерировать.");
        return;
      }
      setTitle(res.draft.title);
      setSubtitle(res.draft.subtitle);
      setBodyText(blocksToText(res.draft.body));
      setExcerpt(res.draft.excerpt);
      setTags(res.draft.tags);
      setScores({ seo: res.draft.seoScore, aeo: res.draft.aeoScore, geo: res.draft.geoScore });
      setGenOpen(false);
      setMsg("Черновик сгенерирован. Проверьте и опубликуйте.");
    } finally {
      setGenerating(false);
    }
  }

  function handlePublish(status: "published" | "draft") {
    setErr(null);
    setMsg(null);
    if (!title.trim()) {
      setErr("Добавьте заголовок.");
      return;
    }
    if (!authorId) {
      setErr("Выберите автора.");
      return;
    }
    startTransition(async () => {
      const res = await adminPublishArticle({
        authorId,
        title,
        excerpt,
        body: textToBlocks(bodyText),
        tags,
        category,
        readingMinutes: Math.max(1, Math.round(words / 150)),
        status,
        seoScore: scores?.seo ?? null,
        aeoScore: scores?.aeo ?? null,
        geoScore: scores?.geo ?? null,
      });
      if (!res.ok) {
        setErr(res.error ?? "Не удалось сохранить.");
        return;
      }
      if (status === "published" && res.slug) {
        router.push(`/articles/${res.slug}`);
      } else {
        setMsg("Черновик сохранён.");
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      {/* Left: writing surface */}
      <div className="flex flex-col gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Заголовок статьи…"
          className="w-full border-b-2 border-[var(--border)] bg-transparent py-2.5 font-serif text-3xl font-bold text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)]"
        />
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Подзаголовок или лид…"
          className="w-full border-b border-[var(--border)] bg-transparent py-2 text-base text-[var(--muted-foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)]"
        />

        {/* AI generation panel */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4">
          <button
            type="button"
            onClick={() => setGenOpen((v) => !v)}
            className="flex w-full items-center gap-2 text-sm font-semibold text-[var(--foreground)]"
          >
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            ИИ-генерация из ваших материалов
            <span className="ml-auto text-xs text-[var(--muted-foreground)]">{genOpen ? "Скрыть" : "Показать"}</span>
          </button>
          {genOpen && (
            <div className="mt-3 flex flex-col gap-2.5">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Тема статьи — например: как эффект якоря влияет на цену"
                className={FIELD}
              />
              <textarea
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="Ваши материалы, факты, тезисы, ссылки на исследования — ИИ напишет статью строго по ним"
                rows={4}
                className={cn(FIELD, "resize-none")}
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)] transition-all hover:brightness-110 disabled:opacity-60"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? "Генерирую…" : "Сгенерировать черновик"}
              </button>
            </div>
          )}
        </div>

        <textarea
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          placeholder="Текст статьи… (## — подзаголовок H2, ### — H3, > — цитата)"
          className="min-h-[340px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4 text-[15px] leading-[1.78] text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
        />
      </div>

      {/* Right: publish + meta */}
      <div className="flex flex-col gap-3">
        {(msg || err) && (
          <div
            className={cn(
              "rounded-lg px-3 py-2 text-xs",
              err ? "bg-[var(--danger)]/10 text-[var(--danger)]" : "bg-[var(--success)]/10 text-[var(--success)]",
            )}
          >
            {err ?? msg}
          </div>
        )}

        <div className={CARD}>
          <div className={CARD_LABEL}>Публикация</div>
          <label className="mb-2 block text-xs text-[var(--muted-foreground)]">Автор</label>
          <select value={authorId} onChange={(e) => setAuthorId(e.target.value)} className={cn(FIELD, "mb-3 cursor-pointer")}>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
                {a.elite ? " · Elite" : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => handlePublish("published")}
            disabled={pending}
            className="mb-2 w-full rounded-lg bg-[var(--primary)] py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-all hover:brightness-110 disabled:opacity-60"
          >
            {pending ? "Публикую…" : "Опубликовать"}
          </button>
          <button
            type="button"
            onClick={() => handlePublish("draft")}
            disabled={pending}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] py-2 text-sm font-semibold text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] disabled:opacity-60"
          >
            Сохранить черновик
          </button>
          <div className="mt-3">
            <div className="mb-1.5 flex justify-between text-[11px] text-[var(--muted-foreground)]">
              <span>Готовность</span>
              <span className="font-semibold text-[var(--foreground)]">{readiness}%</span>
            </div>
            <div className="h-1 rounded-full bg-[var(--muted)]">
              <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${readiness}%` }} />
            </div>
          </div>
        </div>

        <div className={CARD}>
          <div className={CARD_LABEL}>SEO / AEO / GEO</div>
          {scores ? (
            <div className="mb-3 grid grid-cols-3 gap-1.5">
              {[
                { k: "SEO", v: scores.seo, c: "var(--success)" },
                { k: "AEO", v: scores.aeo, c: "var(--gold)" },
                { k: "GEO", v: scores.geo, c: "var(--primary)" },
              ].map((s) => (
                <div key={s.k} className="rounded-lg bg-[var(--muted)] p-2.5 text-center">
                  <div className="text-lg font-bold" style={{ color: s.c }}>
                    {s.v}
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.1em] text-[var(--muted-foreground)]">{s.k}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-3 text-xs text-[var(--muted-foreground)]">
              Оценки и мета-описание проставит ИИ при публикации.
            </p>
          )}
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Мета-описание (заполнит ИИ, если оставить пустым)…"
            rows={3}
            className={cn(FIELD, "resize-none")}
          />
        </div>

        <div className={CARD}>
          <div className={CARD_LABEL}>Категория</div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategorySlug)}
            className={cn(FIELD, "cursor-pointer")}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-[11px] text-[var(--muted-foreground)]">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
