"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabItem = { slug: string; label: string };

/**
 * A single-line row of category tabs. Instead of wrapping onto a second line
 * when they run out of horizontal room, the overflow collapses into an "Ещё"
 * dropdown. The caller is responsible for the ordering of `items` — the tabs
 * that matter most to the reader (personalisation picks, most-viewed, and the
 * categories with the most fresh material in the last 24h) should come first so
 * they stay on the visible row and the rest fall into the dropdown.
 */
export function CategoryTabs({
  items,
  active,
  onSelect,
  rightSlot,
}: {
  items: TabItem[];
  active: string;
  onSelect: (slug: string) => void;
  rightSlot?: React.ReactNode;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);
  const [openMore, setOpenMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Measure natural widths of every tab in a hidden row, then fit as many as
  // possible into the available width, reserving room for the "Ещё" trigger.
  const recompute = () => {
    const row = rowRef.current;
    const measure = measureRef.current;
    if (!row || !measure) return;
    const available = row.clientWidth;
    const children = Array.from(measure.children) as HTMLElement[];
    const GAP = 24; // matches gap-x-6
    const MORE = 78; // reserved width for the "Ещё" trigger + gap

    let used = 0;
    let count = 0;
    for (let i = 0; i < children.length; i++) {
      const w = children[i].offsetWidth;
      const next = used + (i === 0 ? 0 : GAP) + w;
      // Leave room for the More trigger unless this is the last item and it
      // would fit without it.
      const budget = i === children.length - 1 ? available : available - MORE;
      if (next <= budget) {
        used = next;
        count = i + 1;
      } else {
        break;
      }
    }
    setVisibleCount(Math.max(1, count));
  };

  useLayoutEffect(() => {
    recompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => recompute());
    ro.observe(row);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close the dropdown on outside click / Escape.
  useEffect(() => {
    if (!openMore) return;
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setOpenMore(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenMore(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMore]);

  const visible = items.slice(0, visibleCount);
  const overflow = items.slice(visibleCount);
  const activeInOverflow = overflow.some((t) => t.slug === active);

  return (
    <div className="mb-9 flex items-center gap-4 border-b border-[var(--border)] pb-3">
      <div ref={rowRef} className="relative min-w-0 flex-1">
        {/* Hidden measuring row: all tabs at natural size */}
        <div
          ref={measureRef}
          aria-hidden
          className="pointer-events-none invisible absolute left-0 top-0 flex gap-x-6"
        >
          {items.map((t) => (
            <span key={t.slug} className="whitespace-nowrap pb-2 text-[13px] font-medium">
              {t.label}
            </span>
          ))}
        </div>

        {/* Visible row */}
        <div className="flex items-center gap-x-6 gap-y-2">
          {visible.map((t) => (
            <Tab key={t.slug} active={active === t.slug} onClick={() => onSelect(t.slug)}>
              {t.label}
            </Tab>
          ))}

          {overflow.length > 0 && (
            <div ref={moreRef} className="relative">
              <button
                type="button"
                onClick={() => setOpenMore((v) => !v)}
                aria-expanded={openMore}
                aria-haspopup="menu"
                className={cn(
                  "relative flex items-center gap-1 whitespace-nowrap pb-2 text-[13px] font-medium transition-colors",
                  activeInOverflow
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                )}
              >
                Ещё
                <ChevronDown
                  className={cn("h-3.5 w-3.5 transition-transform", openMore && "rotate-180")}
                />
                {activeInOverflow && (
                  <span className="absolute -bottom-[13px] left-0 h-0.5 w-full rounded-full bg-[var(--primary)]" />
                )}
              </button>

              {openMore && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+10px)] z-40 max-h-[60vh] w-56 overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl"
                >
                  {overflow.map((t) => (
                    <button
                      key={t.slug}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onSelect(t.slug);
                        setOpenMore(false);
                      }}
                      className={cn(
                        "block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors",
                        active === t.slug
                          ? "bg-[var(--surface-2)] font-semibold text-[var(--primary)]"
                          : "text-[var(--foreground)] hover:bg-[var(--surface-2)]",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative whitespace-nowrap pb-2 text-[13px] font-medium transition-colors",
        active
          ? "text-[var(--primary)]"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
      )}
    >
      {children}
      {active && (
        <span className="absolute -bottom-[13px] left-0 h-0.5 w-full rounded-full bg-[var(--primary)]" />
      )}
    </button>
  );
}
