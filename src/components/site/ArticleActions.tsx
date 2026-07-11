"use client";

import { useState } from "react";
import { Hand, Bookmark, Share2, Link2 } from "lucide-react";
import { formatCount } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

export function ArticleActions({ claps }: { claps: number }) {
  const [clapped, setClapped] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyLink() {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <div className="mt-10 flex items-center gap-3 border-y border-[var(--border)] py-4">
      <button
        onClick={() => setClapped((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all active:scale-95",
          clapped
            ? "border-[var(--accent)] bg-[var(--accent)]/12 text-[var(--accent)]"
            : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]",
        )}
      >
        <Hand className="h-4 w-4" />
        {formatCount(claps + (clapped ? 1 : 0))}
      </button>

      <button
        onClick={() => setSaved((v) => !v)}
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
          saved
            ? "border-[var(--primary)] bg-[var(--primary)]/12 text-[var(--primary)]"
            : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
        )}
        aria-label="Сохранить"
      >
        <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
      </button>

      <button
        onClick={copyLink}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        aria-label="Скопировать ссылку"
      >
        {copied ? <Link2 className="h-4 w-4 text-[var(--success)]" /> : <Share2 className="h-4 w-4" />}
      </button>

      {copied && <span className="text-sm text-[var(--success)]">Ссылка скопирована</span>}
    </div>
  );
}
