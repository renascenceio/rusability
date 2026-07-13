"use client";

import { useState } from "react";
import { Share2, Bookmark, Check } from "lucide-react";

export function NewsShareRow({
  slug,
  title,
  source,
  sourceUrl,
}: {
  slug: string;
  title: string;
  source: string;
  sourceUrl?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? `${window.location.origin}/news/${slug}` : "";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      /* user dismissed — fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  function toggleSave() {
    setSaved((v) => {
      const next = !v;
      try {
        const key = "rusability:saved-news";
        const list = new Set<string>(JSON.parse(localStorage.getItem(key) || "[]"));
        if (next) list.add(slug);
        else list.delete(slug);
        localStorage.setItem(key, JSON.stringify([...list]));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
      <p className="text-[13px] text-muted-foreground">
        Источник:{" "}
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            {source}
          </a>
        ) : (
          <span className="font-medium text-foreground">{source}</span>
        )}{" "}
        · Rusability ИИ
      </p>
      <div className="flex items-center gap-2.5">
        <button
          onClick={share}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-[var(--surface-2)] px-4 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-[var(--surface-3)]"
        >
          {copied ? <Check size={15} /> : <Share2 size={15} />}
          {copied ? "Скопировано" : "Поделиться"}
        </button>
        <button
          onClick={toggleSave}
          aria-pressed={saved}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-[var(--surface-2)] px-4 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-[var(--surface-3)]"
        >
          <Bookmark size={15} className={saved ? "fill-current" : ""} />
          {saved ? "Сохранено" : "Сохранить"}
        </button>
      </div>
    </div>
  );
}
