"use client";

import { useState, type ReactNode } from "react";

export type AdminTab = { id: string; label: string; badge?: number | string; content: ReactNode };

/** In-page, state-driven tab bar for admin workspaces. */
export function AdminTabs({ tabs, initial }: { tabs: AdminTab[]; initial?: string }) {
  const [active, setActive] = useState(initial ?? tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      <div
        role="tablist"
        className="mb-6 flex flex-wrap items-center gap-1 border-b border-[var(--border)]"
      >
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              type="button"
              onClick={() => setActive(t.id)}
              className={`-mb-px cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                on
                  ? "border-[var(--primary)] text-[var(--foreground)]"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {t.label}
              {t.badge != null ? (
                <span className="ml-1.5 rounded-full bg-[color-mix(in_srgb,var(--gold)_20%,transparent)] px-1.5 py-0.5 text-xs font-semibold text-[var(--gold)]">
                  {t.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{current?.content}</div>
    </div>
  );
}
