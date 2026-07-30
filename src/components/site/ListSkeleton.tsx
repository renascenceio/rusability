import type { CSSProperties } from "react";

/**
 * Perceived-performance skeletons for public list pages (Статьи / Лента /
 * Авторы / Поиск). Rendered from route-segment `loading.tsx` files so Next.js
 * shows them instantly on navigation while the server renders the real
 * (force-dynamic, DB-backed) page. Pure presentational, no client JS.
 *
 * Reuses the token-driven `.admin-shimmer` sweep from globals.css, which reads
 * `--foreground`/`--surface-3`, so it adapts to light, night and sepia.
 */

function Bar({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`admin-shimmer rounded-[6px] bg-[var(--surface-3)] ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

function ListHeader() {
  return (
    <div className="mb-8">
      <Bar className="h-8 w-48 md:h-10 md:w-64" />
      <Bar className="mt-4 h-4 w-80 max-w-full" />
      {/* filter chips */}
      <div className="mt-7 flex flex-wrap gap-2.5">
        {[72, 96, 84, 64, 108].map((w, i) => (
          <Bar key={i} className="h-8 rounded-full" style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

/** Grid of cover cards — matches the Статьи browser layout. */
export function ArticleGridSkeleton({ cards = 9 }: { cards?: number }) {
  return (
    <div className="container-editorial py-9 md:py-12">
      <div className="mx-auto max-w-5xl">
        <ListHeader />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cards }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
            >
              <Bar className="aspect-[16/10] w-full rounded-none" />
              <div className="flex flex-1 flex-col p-5">
                <Bar className="h-3 w-20" />
                <Bar className="mt-3 h-5 w-full" />
                <Bar className="mt-2 h-5 w-4/5" />
                <div className="mt-auto flex items-center gap-3 pt-6">
                  <Bar className="h-7 w-7 rounded-full" />
                  <Bar className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Vertical list of stories — matches the Лента (news) layout. */
export function NewsListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="container-editorial py-9 md:py-12">
      <div className="mx-auto max-w-5xl">
        <ListHeader />
        <div className="flex flex-col divide-y divide-[var(--border-soft)]">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 py-5 md:gap-6">
              <div className="min-w-0 flex-1">
                <Bar className="h-3 w-24" />
                <Bar className="mt-3 h-5 w-full max-w-[520px]" />
                <Bar className="mt-2 h-5 w-2/3 max-w-[360px]" />
                <Bar className="mt-4 h-3 w-32" />
              </div>
              <Bar className="h-20 w-28 shrink-0 rounded-xl md:h-24 md:w-40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Grid of author cards — matches the Авторы layout. */
export function AuthorGridSkeleton({ cards = 8 }: { cards?: number }) {
  return (
    <div className="container-editorial py-9 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Bar className="h-8 w-48 md:h-10 md:w-64" />
          <Bar className="mt-4 h-4 w-80 max-w-full" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cards }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <Bar className="h-14 w-14 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <Bar className="h-4 w-32" />
                <Bar className="mt-2.5 h-3 w-24" />
                <Bar className="mt-3 h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
