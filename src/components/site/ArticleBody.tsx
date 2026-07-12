import type { ReactNode } from "react";
import type { ArticleBlock } from "@/lib/types";
import { normalizeList } from "@/lib/article-list";

/**
 * Render a text run that may contain **bold** markdown (the model sometimes
 * emits it despite instructions, e.g. "**Знайте свою аудиторию:** ..."). We
 * convert `**...**` into <strong> and leave everything else as plain text so
 * these never show up as literal asterisks.
 */
function renderInline(text: string): ReactNode {
  if (!text.includes("**")) return text;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return (
        <strong key={i} className="font-semibold text-[var(--foreground)]">
          {m[1]}
        </strong>
      );
    }
    return part;
  });
}

export function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="article-prose">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} className="mt-10 mb-4 font-serif text-2xl font-bold text-[var(--foreground)] text-balance">
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-8 mb-3 font-serif text-xl font-bold text-[var(--foreground)]">
                {block.text}
              </h3>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="my-8 border-l-4 border-[var(--foreground)] bg-[var(--surface-2)] py-4 pl-6 pr-4 rounded-r-xl"
              >
                <p className="font-serif text-xl italic leading-relaxed text-[var(--foreground)]">
                  {renderInline(block.text)}
                </p>
                {block.cite && (
                  <cite className="mt-2 block text-sm not-italic text-[var(--muted-foreground)]">
                    — {block.cite}
                  </cite>
                )}
              </blockquote>
            );
          case "list": {
            const { ordered, items } = normalizeList(block.items, block.ordered);
            if (ordered) {
              return (
                <ol key={i} className="my-5 space-y-2 pl-1">
                  {items.map((item, j) => (
                    <li key={j} className="flex gap-3 text-[var(--foreground)]/90 leading-relaxed">
                      <span className="mt-0.5 w-6 shrink-0 font-semibold tabular-nums text-[var(--foreground)]">
                        {j + 1}.
                      </span>
                      <span>{renderInline(item)}</span>
                    </li>
                  ))}
                </ol>
              );
            }
            return (
              <ul key={i} className="my-5 space-y-2 pl-1">
                {items.map((item, j) => (
                  <li key={j} className="flex gap-3 text-[var(--foreground)]/90 leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--foreground)]" />
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          }
          case "image":
            return (
              <figure key={i} className="my-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.src || "/placeholder.svg"} alt={block.caption ?? ""} className="w-full rounded-2xl" />
                {block.caption && (
                  <figcaption className="mt-2 text-center text-sm text-[var(--muted-foreground)]">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          default:
            return (
              <p key={i} className="my-5 text-lg leading-relaxed text-[var(--foreground)]/90">
                {renderInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
