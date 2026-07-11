"use client";

import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import type { Comment } from "@/lib/types";
import { Avatar, Button, Textarea } from "@/components/ui/kit";

function CommentItem({ comment, nested }: { comment: Comment; nested?: boolean }) {
  const [liked, setLiked] = useState(false);
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
            <p className="text-sm leading-relaxed text-[var(--foreground)]/90">{comment.text}</p>
          </div>
          <div className="mt-1.5 flex items-center gap-4 pl-2">
            <button
              onClick={() => setLiked((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--accent)]"
            >
              <Heart className={`h-3.5 w-3.5 ${liked ? "fill-[var(--accent)] text-[var(--accent)]" : ""}`} />
              {comment.likes + (liked ? 1 : 0)}
            </button>
            <button className="inline-flex items-center gap-1 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <MessageCircle className="h-3.5 w-3.5" /> Ответить
            </button>
          </div>
        </div>
      </div>
      {comment.replies?.map((r) => (
        <CommentItem key={r.id} comment={r} nested />
      ))}
    </div>
  );
}

export function CommentThread({ comments }: { comments: Comment[] }) {
  const [text, setText] = useState("");
  const total = comments.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0);

  return (
    <section className="mt-16">
      <h2 className="mb-6 font-serif text-2xl font-bold text-[var(--foreground)]">
        Комментарии <span className="text-[var(--muted-foreground)]">({total})</span>
      </h2>

      <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Поделитесь мнением…"
          rows={3}
        />
        <div className="mt-3 flex justify-end">
          <Button variant="primary" size="sm" disabled={!text.trim()}>
            Отправить
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} />
        ))}
      </div>
    </section>
  );
}
