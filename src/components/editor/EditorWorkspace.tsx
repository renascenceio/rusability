"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Bold,
  Italic,
  Quote,
  Link2,
  Plus,
  List,
  Minus,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_TITLE = "Интерфейс как язык: почему будущее за эмоциональным дизайном";
const DEFAULT_SUBTITLE = "Когда функциональность становится само собой разумеющейся…";
const DEFAULT_BODY = `Когда пользователь впервые открывает приложение, у него нет времени анализировать архитектуру информации. За первые три секунды мозг принимает неосознанное решение: «здесь комфортно» или «что-то не так». И это решение определяет всё дальнейшее взаимодействие.

Нейробиолог Антонио Дамасио в своих исследованиях доказал: эмоции — не помеха рациональным решениям, а их необходимое условие. Люди с повреждёнными эмоциональными центрами мозга теряют способность принимать даже простейшие решения. Без чувств нет выбора.`;

const TOOLBAR: { icon: typeof Bold; label: string; cmd?: string }[] = [
  { icon: Bold, label: "Полужирный", cmd: "bold" },
  { icon: Italic, label: "Курсив", cmd: "italic" },
  { icon: Quote, label: "Цитата" },
  { icon: Link2, label: "Ссылка" },
  { icon: Plus, label: "Блок" },
  { icon: List, label: "Список" },
  { icon: Minus, label: "Разделитель" },
];

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function EditorWorkspace() {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [words, setWords] = useState(() => wordCount(DEFAULT_BODY));
  const [showAiHint, setShowAiHint] = useState(true);
  const [statusMenu, setStatusMenu] = useState(false);
  const [status, setStatus] = useState<"draft" | "review" | "scheduled">("draft");

  const recomputeWords = () => {
    const el = bodyRef.current;
    if (el) setWords(wordCount(el.innerText));
  };

  useEffect(() => {
    recomputeWords();
  }, []);

  const readMinutes = Math.max(1, Math.round(words / 150));

  const STATUS_LABEL: Record<typeof status, string> = {
    draft: "Черновик",
    review: "На проверке",
    scheduled: "Запланировано",
  };

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

        <div className="flex items-center gap-2 text-sm text-[#f0ebe3]/50">
          <Check className="h-4 w-4 text-[#4d9d6a]" /> Сохранено
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setStatusMenu((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-[#f0ebe3] transition-colors hover:bg-white/5"
            >
              {STATUS_LABEL[status]}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {statusMenu && (
              <div className="absolute right-0 top-full z-40 mt-2 w-48 overflow-hidden rounded-xl border border-white/12 bg-[#16131f] py-1 shadow-2xl">
                {(["draft", "review", "scheduled"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatus(s);
                      setStatusMenu(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5",
                      s === status ? "text-[#4d5aff]" : "text-[#f0ebe3]/80",
                    )}
                  >
                    {STATUS_LABEL[s]}
                    {s === status && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="rounded-full bg-[#4d5aff] px-5 py-2 text-sm font-semibold text-white transition-transform active:scale-95">
            Опубликовать →
          </button>
        </div>
      </header>

      {/* Writing surface */}
      <div className="mx-auto w-full max-w-[780px] flex-1 px-5 py-10">
        <div
          contentEditable
          suppressContentEditableWarning
          className="mb-4 font-serif text-4xl font-bold leading-tight text-[#f0ebe3] outline-none md:text-5xl"
          dangerouslySetInnerHTML={{ __html: DEFAULT_TITLE }}
        />
        <div
          contentEditable
          suppressContentEditableWarning
          className="mb-8 font-serif text-xl italic text-[#f0ebe3]/45 outline-none"
          dangerouslySetInnerHTML={{ __html: DEFAULT_SUBTITLE }}
        />
        <div
          ref={bodyRef}
          contentEditable
          suppressContentEditableWarning
          onInput={recomputeWords}
          className="editor-body space-y-6 text-lg leading-relaxed text-[#f0ebe3]/85 outline-none"
        >
          {DEFAULT_BODY.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      {/* AI hint */}
      {showAiHint && (
        <div className="sticky bottom-[72px] z-20 mx-auto w-full max-w-[820px] px-5">
          <div className="flex items-center gap-3 rounded-xl border border-[#4d5aff]/25 bg-[#4d5aff]/10 px-4 py-3 backdrop-blur">
            <span className="flex items-center gap-1.5 rounded-full bg-[#4d5aff]/20 px-2.5 py-1 text-xs font-bold text-[#8f98ff]">
              <Sparkles className="h-3 w-3" /> ИИ
            </span>
            <p className="flex-1 text-sm text-[#f0ebe3]/80">
              Добавьте FAQ-блок в конце статьи — это увеличит AEO на ~12 пунктов и попадания в
              ответы ChatGPT.
            </p>
            <button className="shrink-0 rounded-full bg-[#f0ebe3] px-3.5 py-1.5 text-xs font-semibold text-[#0d0b09]">
              Вставить FAQ
            </button>
            <button
              onClick={() => setShowAiHint(false)}
              aria-label="Скрыть подсказку"
              className="shrink-0 text-[#f0ebe3]/40 hover:text-[#f0ebe3]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom toolbar */}
      <footer className="sticky bottom-0 z-30 border-t border-white/8 bg-[#0d0b09]/90 backdrop-blur">
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <div className="hidden w-40 text-xs text-[#f0ebe3]/45 sm:block">
            {words} слов · {readMinutes} мин
          </div>

          <div className="flex items-center gap-1">
            {TOOLBAR.map(({ icon: Icon, label, cmd }) => (
              <button
                key={label}
                title={label}
                aria-label={label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (cmd) document.execCommand(cmd);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#f0ebe3]/60 transition-colors hover:bg-white/8 hover:text-[#f0ebe3]"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ScoreChip label="SEO" value={87} color="#4d9d6a" />
            <ScoreChip label="AEO" value={72} color="#d4a24e" />
            <ScoreChip label="GEO" value={68} color="#4d5aff" />
            <button className="ml-1 flex items-center gap-1.5 rounded-full border border-[#d4a24e]/40 bg-[#d4a24e]/10 px-3 py-1.5 text-xs font-semibold text-[#d4a24e]">
              <Sparkles className="h-3 w-3" /> ИИ-помощник
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ScoreChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="hidden items-center gap-1.5 text-xs font-semibold text-[#f0ebe3]/80 md:flex">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label} {value}
    </span>
  );
}
