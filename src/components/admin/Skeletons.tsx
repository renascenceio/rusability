import type { CSSProperties } from "react";

/**
 * Ghost/skeleton loaders for admin pages. Pure presentational, no client JS —
 * safe to render from route-segment `loading.tsx` files (server components).
 * The shimmer is a CSS animation defined in globals.css (.admin-shimmer).
 */

export function Shimmer({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`admin-shimmer rounded-[6px] bg-[var(--surface-3)] ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/** Page title + subtitle block. */
export function HeaderSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div className="flex-1">
        <Shimmer className="h-7 w-52" />
        <Shimmer className="mt-3 h-4 w-80 max-w-full" />
      </div>
      {action && <Shimmer className="h-10 w-36 rounded-[10px]" />}
    </div>
  );
}

/** A single card frame used to wrap other skeleton content. */
export function PanelSkeleton({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </div>
  );
}

/** Row of KPI cards (analytics / dashboard). */
export function KpiRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <PanelSkeleton key={i}>
          <Shimmer className="h-3.5 w-20" />
          <Shimmer className="mt-4 h-8 w-24" />
          <Shimmer className="mt-3 h-3 w-16" />
        </PanelSkeleton>
      ))}
    </div>
  );
}

/** A tall chart placeholder with a faux baseline of bars. */
export function ChartSkeleton({ className = "" }: { className?: string }) {
  const bars = [45, 70, 55, 82, 60, 90, 72, 50, 78, 64, 88, 58];
  return (
    <PanelSkeleton className={className}>
      <div className="mb-6 flex items-center justify-between">
        <Shimmer className="h-4 w-40" />
        <Shimmer className="h-8 w-32 rounded-[8px]" />
      </div>
      <div className="flex h-56 items-end gap-2.5">
        {bars.map((h, i) => (
          <Shimmer key={i} className="flex-1 rounded-t-[6px]" style={{ height: `${h}%` }} />
        ))}
      </div>
    </PanelSkeleton>
  );
}

/** Donut/legend placeholder. */
export function DonutSkeleton({ className = "" }: { className?: string }) {
  return (
    <PanelSkeleton className={className}>
      <Shimmer className="h-4 w-36" />
      <div className="mt-6 flex items-center gap-6">
        <Shimmer className="h-36 w-36 shrink-0 rounded-full" />
        <div className="flex-1 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Shimmer className="h-3 w-3 rounded-full" />
              <Shimmer className="h-3.5 flex-1" style={{ maxWidth: `${80 - i * 12}%` }} />
            </div>
          ))}
        </div>
      </div>
    </PanelSkeleton>
  );
}

/** Generic list of rows (articles, news, users, messages…). */
export function TableSkeleton({
  rows = 8,
  cols = 4,
  withHeader = true,
}: {
  rows?: number;
  cols?: number;
  withHeader?: boolean;
}) {
  return (
    <PanelSkeleton className="overflow-hidden p-0">
      {withHeader && (
        <div
          className="grid gap-4 border-b border-[var(--border)] px-5 py-3.5"
          style={{ gridTemplateColumns: `2fr repeat(${cols - 1}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, i) => (
            <Shimmer key={i} className="h-3.5" style={{ maxWidth: i === 0 ? "60%" : "50%" }} />
          ))}
        </div>
      )}
      <div>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="grid items-center gap-4 border-b border-[var(--border-soft)] px-5 py-4 last:border-b-0"
            style={{ gridTemplateColumns: `2fr repeat(${cols - 1}, 1fr)` }}
          >
            {Array.from({ length: cols }).map((_, c) => (
              <Shimmer
                key={c}
                className="h-4"
                style={{ maxWidth: c === 0 ? "85%" : `${70 - c * 8}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </PanelSkeleton>
  );
}

/** Tab strip placeholder. */
export function TabsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="mb-6 flex gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Shimmer key={i} className="h-9 w-28 rounded-[10px]" />
      ))}
    </div>
  );
}
