"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Sparkles,
  X,
  Info,
  Loader2,
  Check,
  Sun,
  Moon,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  Link2,
  ImagePlus,
  Upload,
} from "lucide-react";
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

/** Escape user text before injecting as HTML into the contentEditable body. */
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** AI blocks → HTML for the contentEditable body. */
function blocksToHtml(body: ArticleBlock[]): string {
  return body
    .map((b) => {
      if (b.type === "h2") return `<h2>${esc(b.text)}</h2>`;
      if (b.type === "h3") return `<h3>${esc(b.text)}</h3>`;
      if (b.type === "quote") return `<blockquote>${esc(b.text)}</blockquote>`;
      if (b.type === "list") return `<ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
      if (b.type === "p") return `<p>${esc(b.text)}</p>`;
      return "";
    })
    .join("");
}

/** Parse the contentEditable DOM back into article blocks (toolbar-aware). */
function readBodyFromDom(el: HTMLElement | null): ArticleBlock[] {
  if (!el) return [];
  const out: ArticleBlock[] = [];
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = (node.textContent || "").trim();
      if (t) out.push({ type: "p", text: t });
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    const tag = node.tagName.toLowerCase();
    const text = (node.innerText || "").trim();
    if (!text && tag !== "ul") return;
    if (tag === "h1" || tag === "h2") out.push({ type: "h2", text });
    else if (tag === "h3") out.push({ type: "h3", text });
    else if (tag === "blockquote") out.push({ type: "quote", text });
    else if (tag === "ul" || tag === "ol") {
      const items = Array.from(node.querySelectorAll("li"))
        .map((li) => (li.textContent || "").trim())
        .filter(Boolean);
      if (items.length) out.push({ type: "list", items });
    } else out.push({ type: "p", text });
  });
  return out;
}

function countWords(el: HTMLElement | null): number {
  const t = (el?.innerText || "").trim();
  return t ? t.split(/\s+/).length : 0;
}

export function EditorWorkspace({ initialCredits }: { initialCredits: CreditInfo }) {
  const router = useRouter();
  const [credits, setCredits] = useState<CreditInfo>(initialCredits);
  const [editorTheme, setEditorTheme] = useState<"light" | "dark">("light");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState<CategorySlug>("business");
  const [cover, setCover] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [scores, setScores] = useState<{ seo: number; aeo: number; geo: number } | null>(null);
  const [words, setWords] = useState(0);

  const [aiOpen, setAiOpen] = useState(true);
  const [aiTopic, setAiTopic] = useState("");
  const [aiContext, setAiContext] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [creditTip, setCreditTip] = useState(false);
  const [catMenu, setCatMenu] = useState(false);

  const [generating, startGenerate] = useTransition();
  const [publishing, startPublish] = useTransition();
  const bodyRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const noCredits = !credits.unlimited && credits.remaining <= 0;

  /* Rich-text toolbar — operates on the focused contentEditable body. */
  function exec(command: string, value?: string) {
    bodyRef.current?.focus();
    document.execCommand(command, false, value);
    setWords(countWords(bodyRef.current));
  }
  function addLink() {
    const url = window.prompt("Ссылка (URL):", "https://");
    if (url) exec("createLink", url);
  }

  async function uploadCover(file: File) {
    setAiError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) setAiError(data.error ?? "Не удалось загрузить изображение.");
      else setCover(data.url as string);
    } catch {
      setAiError("Не удалось загрузить изображение.");
    } finally {
      setUploading(false);
    }
  }

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
      setTags(res.draft.tags);
      setCategory(res.draft.category);
      setScores({ seo: res.draft.seoScore, aeo: res.draft.aeoScore, geo: res.draft.geoScore });
      if (bodyRef.current) {
        bodyRef.current.innerHTML = blocksToHtml(res.draft.body);
        setWords(countWords(bodyRef.current));
      }
      setAiOpen(false);
    });
  }

  function runPublish() {
    setAiError(null);
    const body = readBodyFromDom(bodyRef.current);
    if (!title.trim()) {
      setAiError("Добавьте заголовок.");
      return;
    }
    startPublish(async () => {
      const res = await publishArticle({
        title,
        excerpt,
        body,
        tags,
        category,
        cover: cover || undefined,
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

  return (
    <div
      className="editor-scope flex min-h-dvh flex-col bg-[var(--background)] text-[var(--foreground)]"
      data-theme={editorTheme}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--background)]/90 px-5 py-3 backdrop-blur">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" /> Лента
        </Link>

        <CreditPill credits={credits} open={creditTip} setOpen={setCreditTip} />

        <div className="flex items-center gap-2">
          {/* Light/dark editor toggle */}
          <button
            onClick={() => setEditorTheme((t) => (t === "light" ? "dark" : "light"))}
            aria-label="Тема редактора"
            title={editorTheme === "light" ? "Тёмная тема" : "Светлая тема"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
          >
            {editorTheme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* Category selector */}
          <div className="relative">
            <button
              onClick={() => setCatMenu((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]"
            >
              {CATEGORIES.find((c) => c.slug === category)?.name ?? "Рубрика"}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {catMenu && (
              <div className="absolute right-0 top-full z-40 mt-2 max-h-72 w-52 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-2xl">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => {
                      setCategory(c.slug as CategorySlug);
                      setCatMenu(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--surface-2)]",
                      c.slug === category ? "text-[var(--primary)]" : "text-[var(--foreground)]",
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
            className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition-transform active:scale-95 disabled:opacity-50"
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Опубликовать →
          </button>
        </div>
      </header>

      {/* Formatting toolbar */}
      <div className="sticky top-[57px] z-20 flex flex-wrap items-center gap-1 border-b border-[var(--border)] bg-[var(--background)]/95 px-5 py-2 backdrop-blur">
        <ToolbarBtn label="Жирный" onClick={() => exec("bold")}><Bold className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn label="Курсив" onClick={() => exec("italic")}><Italic className="h-4 w-4" /></ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-[var(--border)]" />
        <ToolbarBtn label="Заголовок 2" onClick={() => exec("formatBlock", "h2")}><Heading2 className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn label="Заголовок 3" onClick={() => exec("formatBlock", "h3")}><Heading3 className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn label="Цитата" onClick={() => exec("formatBlock", "blockquote")}><Quote className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn label="Список" onClick={() => exec("insertUnorderedList")}><List className="h-4 w-4" /></ToolbarBtn>
        <ToolbarBtn label="Ссылка" onClick={addLink}><Link2 className="h-4 w-4" /></ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-[var(--border)]" />
        <ToolbarBtn label="Обычный текст" onClick={() => exec("formatBlock", "p")}>
          <span className="text-xs font-semibold">¶</span>
        </ToolbarBtn>
      </div>

      {/* Writing surface */}
      <div className="mx-auto w-full max-w-[780px] flex-1 px-5 py-8">
        {/* Hero image field */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadCover(f);
            e.target.value = "";
          }}
        />
        {cover ? (
          <div className="group relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl bg-[var(--surface-3)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="Обложка статьи" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => fileRef.current?.click()}
                className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-neutral-900 hover:bg-white"
              >
                Заменить
              </button>
              <button
                onClick={() => setCover("")}
                className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-neutral-900 hover:bg-white"
              >
                Удалить
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) uploadCover(f);
            }}
            className={cn(
              "mb-8 flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm transition-colors",
              dragOver
                ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50",
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Загрузка…
              </>
            ) : (
              <>
                <ImagePlus className="h-7 w-7" />
                <span className="font-medium">Перетащите обложку 16:9 сюда или нажмите, чтобы загрузить</span>
                <span className="flex items-center gap-1 text-xs opacity-70">
                  <Upload className="h-3 w-3" /> JPG, PNG, WebP · если не добавить, ИИ создаст обложку автоматически
                </span>
              </>
            )}
          </button>
        )}

        {/* Title */}
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={TITLE_EXAMPLE}
          rows={2}
          className="mb-3 w-full resize-none bg-transparent font-serif text-4xl font-bold leading-tight text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]/50 md:text-5xl"
        />
        {/* Excerpt */}
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder={EXCERPT_EXAMPLE}
          rows={2}
          className="mb-8 w-full resize-none bg-transparent font-serif text-xl italic text-[var(--muted-foreground)] outline-none placeholder:text-[var(--muted-foreground)]/45"
        />

        {/* Body — always editable so the toolbar works */}
        <div
          ref={bodyRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => setWords(countWords(bodyRef.current))}
          data-placeholder={BODY_EXAMPLE}
          className="editor-body editor-empty min-h-[240px] space-y-5 whitespace-pre-line text-lg leading-relaxed text-[var(--foreground)]/90 outline-none"
        />
      </div>

      {/* AI generation panel */}
      {aiOpen ? (
        <div className="sticky bottom-0 z-20 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
          <div className="mx-auto w-full max-w-[820px] px-5 py-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)]">
                <Sparkles className="h-4 w-4" /> ИИ-генерация из ваших материалов
              </span>
              <button
                onClick={() => setAiOpen(false)}
                aria-label="Скрыть"
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="Тема статьи — например: Эффект якоря в ценообразовании"
              className="mb-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]/70 focus:border-[var(--primary)]"
            />
            <textarea
              value={aiContext}
              onChange={(e) => setAiContext(e.target.value)}
              placeholder={AI_CONTEXT_EXAMPLE}
              rows={3}
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]/70 focus:border-[var(--primary)]"
            />
            {aiError && <p className="mt-2 text-sm text-[var(--danger)]">{aiError}</p>}
            <div className="mt-3 flex items-center gap-3">
              <div className="relative flex items-center">
                <button
                  onClick={runGenerate}
                  disabled={generating || noCredits}
                  className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-transform active:scale-95 disabled:opacity-50"
                >
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generating ? "Генерирую…" : "Сгенерировать (1 кредит)"}
                </button>
                <button
                  type="button"
                  aria-label="Как работают кредиты"
                  onMouseEnter={() => setCreditTip(true)}
                  onMouseLeave={() => setCreditTip(false)}
                  onClick={() => setCreditTip((v) => !v)}
                  className="ml-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  <Info className="h-4 w-4" />
                </button>
                {creditTip && (
                  <div className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs leading-relaxed text-[var(--muted-foreground)] shadow-2xl">
                    Каждый месяц у вас есть <b className="text-[var(--foreground)]">{credits.unlimited ? "безлимит" : `${credits.limit} кредитов`}</b> на ИИ.
                    Один кредит — это одна генерация: статья <b>или</b> изображение.
                    {!credits.unlimited && (
                      <>
                        {" "}
                        Осталось: <b className="text-[var(--foreground)]">{credits.remaining}</b>. Обновляется 1-го числа.
                      </>
                    )}
                  </div>
                )}
              </div>
              {noCredits && (
                <span className="text-xs text-[var(--gold)]">Кредиты закончились — пишите вручную.</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <footer className="sticky bottom-0 z-30 border-t border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-5 py-3">
            <div className="text-xs text-[var(--muted-foreground)]">
              {words} слов · {Math.max(1, Math.round(words / 150))} мин
            </div>
            <button
              onClick={() => setAiOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-[var(--primary)]/40 bg-[var(--primary)]/10 px-3.5 py-1.5 text-xs font-semibold text-[var(--primary)]"
            >
              <Sparkles className="h-3.5 w-3.5" /> ИИ-помощник
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

function ToolbarBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
    >
      {children}
    </button>
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
        className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)]"
      >
        <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" />
        {credits.unlimited ? "ИИ: безлимит" : `ИИ: ${credits.remaining}/${credits.limit}`}
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs leading-relaxed text-[var(--muted-foreground)] shadow-2xl">
          {credits.unlimited
            ? "У вас безлимитные ИИ-генерации."
            : `Осталось ${credits.remaining} из ${credits.limit} ИИ-кредитов в этом месяце. 1 кредит = 1 генерация статьи или изображения. Обновляется 1-го числа.`}
        </div>
      )}
    </div>
  );
}
