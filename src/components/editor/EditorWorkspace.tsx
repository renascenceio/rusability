"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Sparkles, X, Info, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArticleBlock, CategorySlug } from "@/lib/types";
import { CATEGORIES } from "@/lib/taxonomy";
import { generateDraft, publishArticle, type CreditInfo } from "@/app/editor/actions";

/* Shadow (placeholder) examples — shown greyed-out until the author types. */
const TITLE_EXAMPLE = "Например: Почему клиенты выбирают средний вариант цены";
const EXCERPT_EXAMPLE =
  "Например: Короткое описание в 1–2 предложения, которое появится в ленте и в поиске.";
const BODY_EXAMPLE = `Начните писать здесь или сгенерируйте черновик с помощью ИИ →

Пример структуры:
• Вступление — обозначьте проблему и почему она важна читателю.
• Основная часть — разберите тему по пунктам, опирайтесь на факты и примеры.
• Вывод — короткое резюме и практический совет.`;

const AI_CONTEXT_EXAMPLE =
  "Опишите, о чём статья, и вставьте материалы: тезисы, ссылки, цитаты, данные, выдержки из исследований. Чем больше фактуры — тем точнее и достовернее текст. Например: «Разбор эффекта якоря в ценообразовании. Данные: эксперимент Ариели (2003), пример меню ресторана, статистика по среднему чеку…»";

function blocksToPlainParagraphs(body: ArticleBlock[]): { title?: string; text: string }[] {
  const out: { title?: string; text: string }[] = [];
  for (const b of body) {
    if (b.type === "h2" || b.type === "h3") out.push({ title: b.text, text: "" });
    else if (b.type === "p") out.push({ text: b.text });
    else if (b.type === "quote") out.push({ text: `«${b.text}»` });
    else if (b.type === "list") out.push({ text: b.items.map((i) => `• ${i}`).join("\n") });
  }
  return out;
}

export function EditorWorkspace({ initialCredits }: { initialCredits: CreditInfo }) {
  const router = useRouter();
  const [credits, setCredits] = useState<CreditInfo>(initialCredits);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState<CategorySlug>("business");
  const [draft, setDraft] = useState<ArticleBlock[] | null>(null);
  const [readingMinutes, setReadingMinutes] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [scores, setScores] = useState<{ seo: number; aeo: number; geo: number } | null>(null);

  const [aiOpen, setAiOpen] = useState(true);
  const [aiTopic, setAiTopic] = useState("");
  const [aiContext, setAiContext] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [creditTip, setCreditTip] = useState(false);
  const [catMenu, setCatMenu] = useState(false);

  const [generating, startGenerate] = useTransition();
  const [publishing, startPublish] = useTransition();
  const bodyRef = useRef<HTMLDivElement>(null);

  const noCredits = !credits.unlimited && credits.remaining <= 0;

  const bodyText = useMemo(() => {
    if (!draft) return "";
    return draft
      .map((b) =>
        b.type === "p" || b.type === "h2" || b.type === "h3" || b.type === "quote"
          ? b.text
          : b.type === "list"
            ? b.items.join(" ")
            : "",
      )
      .join(" ");
  }, [draft]);

  const words = bodyText.trim() ? bodyText.trim().split(/\s+/).length : 0;

  function runGenerate() {
    setAiError(null);
    if (!aiTopic.trim()) {
      setAiError("Укажите тему статьи.");
      return;
    }
    startGenerate(async () => {
      const res = await generateDraft({ topic: aiTopic, context: aiContext, category });
      setCredits(res.credits);
      if (!res.ok || !res.draft) {
        setAiError(res.error ?? "Не удалось сгенерировать статью.");
        return;
      }
      setTitle(res.draft.title);
      setExcerpt(res.draft.excerpt);
      setDraft(res.draft.body);
      setTags(res.draft.tags);
      setReadingMinutes(res.draft.readingMinutes);
      setCategory(res.draft.category);
      setScores({ seo: res.draft.seoScore, aeo: res.draft.aeoScore, geo: res.draft.geoScore });
      setAiOpen(false);
    });
  }

  function runPublish() {
    setAiError(null);
    const body: ArticleBlock[] = draft ?? readBodyFromDom(bodyRef.current);
    startPublish(async () => {
      const res = await publishArticle({
        title,
        excerpt,
        body,
        tags,
        category,
        readingMinutes: Math.max(1, Math.round(words / 150)),
        seoScore: scores?.seo ?? null,
        aeoScore: scores?.aeo ?? null,
        geoScore: scores?.geo ?? null,
      });
      if (!res.ok) {
        setAiError(res.error ?? "Не удалось опубликовать.");
        return;
      }
      router.push(`/articles/${res.slug}`);
    });
  }

  const paras = draft ? blocksToPlainParagraphs(draft) : [];

  return (
    <div className="onboarding-dark flex min-h-dvh flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-[#f0ebe3]/60 transition-colors hover:text-[#f0ebe3]"
        >
          <ArrowLeft className="h-4 w-4" /> Лента
        </Link>

        <CreditPill credits={credits} open={creditTip} setOpen={setCreditTip} />

        <div className="flex items-center gap-3">
          {/* Category selector */}
          <div className="relative">
            <button
              onClick={() => setCatMenu((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-[#f0ebe3] transition-colors hover:bg-white/5"
            >
              {CATEGORIES.find((c) => c.slug === category)?.name ?? "Рубрика"}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {catMenu && (
              <div className="absolute right-0 top-full z-40 mt-2 max-h-72 w-52 overflow-y-auto rounded-xl border border-white/12 bg-[#16131f] py-1 shadow-2xl">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => {
                      setCategory(c.slug as CategorySlug);
                      setCatMenu(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5",
                      c.slug === category ? "text-[#4d5aff]" : "text-[#f0ebe3]/80",
                    )}
                  >
                    {c.name}
                    {c.slug === category && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={runPublish}
            disabled={publishing || !title.trim()}
            className="flex items-center gap-2 rounded-full bg-[#4d5aff] px-5 py-2 text-sm font-semibold text-white transition-transform active:scale-95 disabled:opacity-50"
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Опубликовать →
          </button>
        </div>
      </header>

      {/* Writing surface */}
      <div className="mx-auto w-full max-w-[780px] flex-1 px-5 py-10">
        {/* Title */}
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={TITLE_EXAMPLE}
          rows={2}
          className="mb-3 w-full resize-none bg-transparent font-serif text-4xl font-bold leading-tight text-[#f0ebe3] outline-none placeholder:text-[#f0ebe3]/25 md:text-5xl"
        />
        {/* Excerpt */}
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder={EXCERPT_EXAMPLE}
          rows={2}
          className="mb-8 w-full resize-none bg-transparent font-serif text-xl italic text-[#f0ebe3]/70 outline-none placeholder:text-[#f0ebe3]/20"
        />

        {/* Body */}
        {draft ? (
          <div className="editor-body space-y-6 text-lg leading-relaxed text-[#f0ebe3]/85">
            {paras.map((p, i) =>
              p.title ? (
                <h2 key={i} className="font-serif text-2xl font-bold text-[#f0ebe3]">
                  {p.title}
                </h2>
              ) : (
                <p key={i} className="whitespace-pre-line">
                  {p.text}
                </p>
              ),
            )}
          </div>
        ) : (
          <div
            ref={bodyRef}
            contentEditable
            suppressContentEditableWarning
            data-placeholder={BODY_EXAMPLE}
            className="editor-body editor-empty min-h-[240px] space-y-6 whitespace-pre-line text-lg leading-relaxed text-[#f0ebe3]/85 outline-none"
          />
        )}
      </div>

      {/* AI generation panel */}
      {aiOpen ? (
        <div className="sticky bottom-0 z-20 border-t border-white/8 bg-[#0d0b09]/95 backdrop-blur">
          <div className="mx-auto w-full max-w-[820px] px-5 py-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-[#8f98ff]">
                <Sparkles className="h-4 w-4" /> ИИ-генерация из ваших материалов
              </span>
              <button
                onClick={() => setAiOpen(false)}
                aria-label="Скрыть"
                className="text-[#f0ebe3]/40 hover:text-[#f0ebe3]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="Тема статьи — например: Эффект якоря в ценообразовании"
              className="mb-2 w-full rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-[#f0ebe3] outline-none placeholder:text-[#f0ebe3]/35 focus:border-[#4d5aff]/60"
            />
            <textarea
              value={aiContext}
              onChange={(e) => setAiContext(e.target.value)}
              placeholder={AI_CONTEXT_EXAMPLE}
              rows={3}
              className="w-full resize-none rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-[#f0ebe3] outline-none placeholder:text-[#f0ebe3]/35 focus:border-[#4d5aff]/60"
            />
            {aiError && <p className="mt-2 text-sm text-[#e06a5a]">{aiError}</p>}
            <div className="mt-3 flex items-center gap-3">
              <div className="relative flex items-center">
                <button
                  onClick={runGenerate}
                  disabled={generating || noCredits}
                  className="flex items-center gap-2 rounded-full bg-[#4d5aff] px-5 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95 disabled:opacity-50"
                >
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generating ? "Генерирую…" : "Сгенерировать (1 кредит)"}
                </button>
                {/* Tooltip explaining credits */}
                <button
                  type="button"
                  aria-label="Как работают кредиты"
                  onMouseEnter={() => setCreditTip(true)}
                  onMouseLeave={() => setCreditTip(false)}
                  onClick={() => setCreditTip((v) => !v)}
                  className="ml-2 text-[#f0ebe3]/40 hover:text-[#f0ebe3]"
                >
                  <Info className="h-4 w-4" />
                </button>
                {creditTip && (
                  <div className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-xl border border-white/12 bg-[#16131f] p-3 text-xs leading-relaxed text-[#f0ebe3]/80 shadow-2xl">
                    Каждый месяц у вас есть <b className="text-[#f0ebe3]">{credits.unlimited ? "безлимит" : `${credits.limit} кредитов`}</b> на ИИ.
                    Один кредит — это одна генерация: статья <b>или</b> изображение.
                    {!credits.unlimited && (
                      <>
                        {" "}
                        Осталось: <b className="text-[#f0ebe3]">{credits.remaining}</b>. Обновляется 1-го числа.
                      </>
                    )}
                  </div>
                )}
              </div>
              {noCredits && (
                <span className="text-xs text-[#e0a95a]">Кредиты закончились — пишите вручную.</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <footer className="sticky bottom-0 z-30 border-t border-white/8 bg-[#0d0b09]/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-5 py-3">
            <div className="text-xs text-[#f0ebe3]/45">
              {words} слов · {Math.max(1, Math.round(words / 150))} мин
            </div>
            <button
              onClick={() => setAiOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-[#4d5aff]/40 bg-[#4d5aff]/10 px-3.5 py-1.5 text-xs font-semibold text-[#8f98ff]"
            >
              <Sparkles className="h-3.5 w-3.5" /> ИИ-помощник
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

function CreditPill({
  credits,
  open,
  setOpen,
}: {
  credits: CreditInfo;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <div className="relative">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 text-xs font-medium text-[#f0ebe3]/70"
      >
        <Sparkles className="h-3.5 w-3.5 text-[#d4a24e]" />
        {credits.unlimited ? "ИИ: безлимит" : `ИИ: ${credits.remaining}/${credits.limit}`}
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-xl border border-white/12 bg-[#16131f] p-3 text-xs leading-relaxed text-[#f0ebe3]/80 shadow-2xl">
          {credits.unlimited
            ? "У вас безлимитные ИИ-генерации."
            : `Осталось ${credits.remaining} из ${credits.limit} ИИ-кредитов в этом месяце. 1 кредит = 1 генерация статьи или изображения. Обновляется 1-го числа.`}
        </div>
      )}
    </div>
  );
}

/** Read contentEditable body into simple paragraph blocks. */
function readBodyFromDom(el: HTMLDivElement | null): ArticleBlock[] {
  if (!el) return [];
  const text = el.innerText.trim();
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => ({ type: "p" as const, text: t }));
}
