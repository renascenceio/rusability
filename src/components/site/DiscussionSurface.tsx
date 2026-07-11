"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ThumbsUp, Type, Link2, MoreHorizontal } from "lucide-react";
import { COMMENTS } from "@/lib/mock";
import type { Comment } from "@/lib/types";

const ARTICLE_TITLE = "Интерфейс как язык: почему будущее за эмоциональным дизайном";

const AVATAR_TINT: Record<string, string> = {
  "0": "#e07a5f",
  "1": "#4d7ea8",
  "2": "#5a9e6f",
  "3": "#8b6bb1",
  "4": "#c9a227",
};

function Dot({ i }: { i: number }) {
  return (
    <div
      className="h-9 w-9 shrink-0 rounded-full"
      style={{ background: AVATAR_TINT[String(i % 5)] }}
    />
  );
}

function Badge({ kind }: { kind: "author" | "op" }) {
  return kind === "author" ? (
    <span className="rounded bg-[#4d5aff]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#8f97ff]">
      Автор
    </span>
  ) : (
    <span className="rounded bg-[#e07a5f]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#f0a58f]">
      Автор статьи
    </span>
  );
}

function CommentNode({
  c,
  index,
  depth = 0,
}: {
  c: Comment;
  index: number;
  depth?: number;
}) {
  const [liked, setLiked] = useState(false);
  const [showReplies, setShowReplies] = useState(depth === 0);
  const extraReplies = (c.replies?.length ?? 0) > 2 ? (c.replies!.length - 2) : 0;
  const visibleReplies = showReplies ? c.replies ?? [] : (c.replies ?? []).slice(0, 2);

  return (
    <div className={depth > 0 ? "mt-5 border-l border-white/10 pl-5" : ""}>
      <div className="flex gap-3">
        <Dot i={index} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[#f0ebe3]">{c.authorName}</span>
            {index === 0 && depth === 0 && <Badge kind="author" />}
            {depth > 0 && index % 3 === 0 && <Badge kind="op" />}
            <span className="text-xs text-white/40">{c.timeLabel}</span>
          </div>
          <p className="mt-1.5 text-[15px] leading-relaxed text-white/80">{c.text}</p>
          <div className="mt-2.5 flex items-center gap-4">
            <button
              onClick={() => setLiked((v) => !v)}
              className={
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors " +
                (liked
                  ? "bg-[#4d5aff]/20 text-[#8f97ff]"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80")
              }
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              {c.likes + (liked ? 1 : 0)}
            </button>
            <button className="text-xs font-medium text-white/50 hover:text-white/90">
              Ответить
            </button>
            <button className="ml-auto text-white/30 hover:text-white/60">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {visibleReplies.map((r, ri) => (
            <CommentNode key={r.id} c={r} index={ri} depth={depth + 1} />
          ))}

          {!showReplies && extraReplies > 0 && (
            <button
              onClick={() => setShowReplies(true)}
              className="mt-3 text-sm font-medium text-[#8f97ff] hover:underline"
            >
              Показать ещё {extraReplies} ответа
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DiscussionSurface() {
  const [tab, setTab] = useState<"top" | "new">("top");
  const [text, setText] = useState("");
  const total = COMMENTS.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0);

  return (
    <div className="min-h-dvh bg-[#0d0b09] text-[#f0ebe3]">
      {/* top bar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0d0b09]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-4 px-5">
          <span className="shrink-0 text-lg font-extrabold">
            Rusability<span className="text-[#4d5aff]">.ru</span>
          </span>
          <Link
            href="/articles"
            className="hidden min-w-0 items-center gap-1.5 truncate text-sm text-white/50 hover:text-white/80 sm:flex"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{ARTICLE_TITLE}</span>
          </Link>
          <Link
            href="/editor"
            className="ml-auto shrink-0 rounded-full bg-[#4d5aff] px-4 py-2 text-sm font-semibold text-white"
          >
            Написать →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-serif text-3xl font-black">
            Обсуждение{" "}
            <span className="text-base font-normal text-white/40">{total} комментария</span>
          </h1>
          <div className="flex items-center gap-1 rounded-full bg-white/5 p-1">
            {(["top", "new"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
                  (tab === t ? "bg-[#4d5aff] text-white" : "text-white/60 hover:text-white")
                }
              >
                {t === "top" ? "Лучшие" : "Новые"}
              </button>
            ))}
          </div>
        </div>

        {/* compose */}
        <div className="mb-10 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
          <div className="flex gap-3">
            <div className="h-9 w-9 shrink-0 rounded-full" style={{ background: "#e07a5f" }} />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              placeholder="Поделитесь мнением…"
              className="min-h-[52px] flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-[#f0ebe3] outline-none placeholder:text-white/30"
            />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <div className="flex items-center gap-1 text-white/40">
              <button className="rounded-lg p-2 hover:bg-white/5 hover:text-white/70">
                <Type className="h-4 w-4" />
              </button>
              <button className="rounded-lg p-2 hover:bg-white/5 hover:text-white/70">
                <Link2 className="h-4 w-4" />
              </button>
            </div>
            <button
              disabled={!text.trim()}
              className="rounded-full bg-[#4d5aff] px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Опубликовать
            </button>
          </div>
        </div>

        {/* thread */}
        <div className="space-y-8">
          {COMMENTS.map((c, i) => (
            <CommentNode key={c.id} c={c} index={i} />
          ))}
        </div>

        <button className="mt-10 w-full rounded-2xl bg-white/[0.04] py-4 text-sm font-semibold text-white/80 ring-1 ring-white/10 hover:bg-white/[0.07]">
          Показать ещё {Math.max(total - COMMENTS.length, 40)} комментариев
        </button>
      </main>
    </div>
  );
}
