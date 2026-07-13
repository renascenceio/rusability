"use client";

import { useEffect, useRef, useState } from "react";
import { ThumbsUp, Share2, MessageCircle, Link2, Check, Send } from "lucide-react";
import { formatCount } from "@/components/ui/kit";
import { cn } from "@/lib/utils";
import type { Comment } from "@/lib/types";
import { CommentThread } from "./CommentThread";
import { likeContent, type ContentKind } from "@/app/actions/engagement";

function likeKey(kind: ContentKind, id: string) {
  return `rusability:liked:${kind}:${id}`;
}

/** Small share popover — native share (if available) + copy + Telegram/VK. */
function useShare(title: string) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = () => (typeof window !== "undefined" ? window.location.href : "");

  async function share() {
    const u = url();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: u });
        return;
      } catch {
        /* user dismissed — fall through to menu */
      }
    }
    setOpen((v) => !v);
  }

  function copy() {
    navigator.clipboard?.writeText(url()).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    setOpen(false);
  }

  return { open, setOpen, copied, share, copy, url };
}

function SharePopover({
  share,
  align = "left",
}: {
  share: ReturnType<typeof useShare>;
  align?: "left" | "center";
}) {
  if (!share.open) return null;
  const u = encodeURIComponent(share.url());
  return (
    <div
      className={cn(
        "absolute top-full z-30 mt-2 w-52 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-lg",
        align === "center" ? "left-1/2 -translate-x-1/2" : "left-0",
      )}
    >
      <button
        onClick={share.copy}
        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)]"
      >
        {share.copied ? (
          <Check className="h-4 w-4 text-[var(--success)]" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
        {share.copied ? "Ссылка скопирована" : "Копировать ссылку"}
      </button>
      <a
        href={`https://t.me/share/url?url=${u}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)]"
      >
        <Send className="h-4 w-4" /> Telegram
      </a>
      <a
        href={`https://vk.com/share.php?url=${u}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)]"
      >
        <Share2 className="h-4 w-4" /> ВКонтакте
      </a>
    </div>
  );
}

export function ArticleEngagement({
  kind,
  contentId,
  title,
  initialLikes,
  comments,
  children,
}: {
  kind: ContentKind;
  contentId: string;
  title: string;
  initialLikes: number;
  comments: Comment[];
  children: React.ReactNode;
}) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [count, setCount] = useState(() =>
    comments.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0),
  );
  const [showRail, setShowRail] = useState(false);
  const pending = useRef(false);

  // Restore per-browser liked state.
  useEffect(() => {
    try {
      if (localStorage.getItem(likeKey(kind, contentId))) setLiked(true);
    } catch {}
  }, [kind, contentId]);

  // Reveal the floating rail once the reader scrolls into the article.
  useEffect(() => {
    const onScroll = () => setShowRail(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function toggleLike() {
    if (pending.current) return;
    pending.current = true;
    const next = !liked;
    const delta: 1 | -1 = next ? 1 : -1;
    // optimistic
    setLiked(next);
    setLikes((n) => Math.max(0, n + delta));
    try {
      localStorage.setItem(likeKey(kind, contentId), next ? "1" : "");
      if (!next) localStorage.removeItem(likeKey(kind, contentId));
    } catch {}
    const res = await likeContent({ kind, contentId, delta });
    if (res.ok) setLikes(res.likes);
    pending.current = false;
  }

  function goToComments() {
    document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const topShare = useShare(title);
  const bottomShare = useShare(title);
  const railShare = useShare(title);

  const LikeBtn = ({ compact }: { compact?: boolean }) => (
    <button
      onClick={toggleLike}
      aria-pressed={liked}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-semibold transition-all active:scale-95",
        compact ? "flex-col gap-0.5 px-0 py-2 w-full border-0" : "px-5 py-2.5 text-sm",
        !compact &&
          (liked
            ? "border-[var(--primary)] bg-[var(--primary)]/12 text-[var(--primary)]"
            : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]"),
        compact && (liked ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"),
      )}
      title="Нравится"
    >
      <ThumbsUp className={cn("h-4 w-4", liked && "fill-current")} />
      <span className={compact ? "text-[11px] font-bold" : ""}>{formatCount(likes)}</span>
    </button>
  );

  const CommentBtn = ({ compact }: { compact?: boolean }) => (
    <button
      onClick={goToComments}
      className={cn(
        "inline-flex items-center gap-2 font-semibold text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]",
        compact ? "flex-col gap-0.5 w-full py-2 text-[11px]" : "rounded-full border border-[var(--border)] px-5 py-2.5 text-sm",
      )}
      title="Комментарии"
    >
      <MessageCircle className="h-4 w-4" />
      <span className={compact ? "text-[11px] font-bold" : ""}>{formatCount(count)}</span>
    </button>
  );

  const ShareBtn = ({
    share,
    compact,
    align,
  }: {
    share: ReturnType<typeof useShare>;
    compact?: boolean;
    align?: "left" | "center";
  }) => (
    <div className="relative">
      <button
        onClick={share.share}
        className={cn(
          "inline-flex items-center gap-2 font-semibold text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]",
          compact
            ? "flex-col gap-0.5 w-full py-2 text-[11px]"
            : "rounded-full border border-[var(--border)] px-5 py-2.5 text-sm",
        )}
        title="Поделиться"
      >
        {share.copied ? (
          <Check className="h-4 w-4 text-[var(--success)]" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        {!compact && <span>Поделиться</span>}
      </button>
      <SharePopover share={share} align={align} />
    </div>
  );

  return (
    <>
      {/* Top bar */}
      <div className="mb-8 flex flex-wrap items-center gap-3 border-y border-[var(--border)] py-3">
        <LikeBtn />
        <CommentBtn />
        <div className="ml-auto">
          <ShareBtn share={topShare} />
        </div>
      </div>

      {children}

      {/* Bottom bar */}
      <div className="mt-10 flex flex-wrap items-center gap-3 border-y border-[var(--border)] py-4">
        <LikeBtn />
        <CommentBtn />
        <div className="ml-auto">
          <ShareBtn share={bottomShare} />
        </div>
      </div>

      {/* Floating side rail (desktop only, appears on scroll) */}
      <div
        className={cn(
          "fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 xl:flex",
          "flex-col items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-2 shadow-lg backdrop-blur transition-all duration-300",
          showRail ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <LikeBtn compact />
        <div className="h-px w-8 bg-[var(--border)]" />
        <CommentBtn compact />
        <div className="h-px w-8 bg-[var(--border)]" />
        <div className="relative w-full">
          <ShareBtn share={railShare} compact align="left" />
        </div>
      </div>

      <CommentThread
        kind={kind}
        contentId={contentId}
        comments={comments}
        onCountChange={setCount}
      />
    </>
  );
}
