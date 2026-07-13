"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, AlertCircle, ShieldCheck } from "lucide-react";
import type { Comment } from "@/lib/types";
import { Avatar, Button, Textarea } from "@/components/ui/kit";
import { submitComment, type ContentKind } from "@/app/actions/engagement";

const NAME_KEY = "rusability:comment-name";

function CommentItem({ comment, nested }: { comment: Comment; nested?: boolean }) {
  return (
    <div className={nested ? "ml-12 mt-4" : ""}>
      <div className="flex gap-3">
        <Avatar src={comment.authorAvatar} alt={comment.authorName} size={40} />
        <div className="min-w-0 flex-1">
          <div className="rounded-2xl bg-[var(--surface-2)] px-4 py-3">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--foreground)]">
                {comment.authorName}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">{comment.timeLabel}</span>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--foreground)]/90">
              {comment.text}
            </p>
          </div>
        </div>
      </div>
      {comment.replies?.map((r) => (
        <CommentItem key={r.id} comment={r} nested />
      ))}
    </div>
  );
}

export function CommentThread({
  kind,
  contentId,
  comments: initial,
  onCountChange,
}: {
  kind: ContentKind;
  contentId: string;
  comments: Comment[];
  onCountChange?: (n: number) => void;
}) {
  const [list, setList] = useState<Comment[]>(initial);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState(false);
  const renderedAt = useRef<number>(0);

  useEffect(() => {
    renderedAt.current = Date.now();
    try {
      const saved = localStorage.getItem(NAME_KEY);
      if (saved) setName(saved);
    } catch {}
  }, []);

  function total(items: Comment[]) {
    return items.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    setOkMsg(false);
    try {
      const res = await submitComment({
        kind,
        contentId,
        authorName: name.trim(),
        text: text.trim(),
        company,
        renderedAt: renderedAt.current,
      });
      if (res.ok) {
        try {
          localStorage.setItem(NAME_KEY, name.trim());
        } catch {}
        const next = [...list, res.comment];
        setList(next);
        onCountChange?.(total(next));
        setText("");
        setOkMsg(true);
        setTimeout(() => setOkMsg(false), 4000);
      } else {
        setError(res.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const count = total(list);

  return (
    <section id="comments" className="mt-16 scroll-mt-24">
      <h2 className="mb-2 font-serif text-2xl font-bold text-[var(--foreground)]">
        Комментарии <span className="text-[var(--muted-foreground)]">({count})</span>
      </h2>
      <p className="mb-6 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
        <ShieldCheck className="h-3.5 w-3.5" />
        Без регистрации. Комментарии проверяются автоматически перед публикацией.
      </p>

      <form
        onSubmit={onSubmit}
        className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
      >
        {/* Honeypot — visually hidden, off-screen; real users never fill it */}
        <div aria-hidden className="absolute left-[-9999px] top-[-9999px]" tabIndex={-1}>
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

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ваше имя"
          maxLength={60}
          className="mb-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
        />
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Поделитесь мнением…"
          rows={3}
          maxLength={2000}
        />

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-[var(--danger)]/10 px-3.5 py-2.5 text-sm text-[var(--danger)]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {okMsg && (
          <div className="mt-3 rounded-xl bg-[var(--success)]/10 px-3.5 py-2.5 text-sm text-[var(--success)]">
            Комментарий опубликован. Спасибо!
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-[var(--muted-foreground)]">{text.length}/2000</span>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!name.trim() || !text.trim() || submitting}
          >
            {submitting ? "Отправка…" : "Отправить"}
          </Button>
        </div>
      </form>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-[var(--muted-foreground)]">
          <MessageCircle className="h-6 w-6" />
          <p className="text-sm">Пока нет комментариев. Будьте первым!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {list.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      )}
    </section>
  );
}
